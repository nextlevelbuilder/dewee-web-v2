/**
 * Write side of the page service, shared by the REST API, MCP tools and the admin UI.
 * Every write validates through the block registry and slug rules, checks the optimistic
 * `version`, and commits the row, a revision snapshot and an audit entry in one D1 batch.
 */
import { validateBlocks } from "../../blocks/registry";
import { ApiError, badRequest, conflict, notFound, validationFailed } from "../api/api-errors";
import { createPageInput, toRecord, updatePageInput, type PageKind, type PageRecord, type PageRow } from "./page-schema";
import { findRow } from "./page-queries";
import { slugError, slugify } from "./slug-rules";

export type WriteContext = { actor: string; ifMatch?: number | null; note?: string };
export type Editable = Omit<PageRow, "id" | "kind" | "created_at" | "updated_at" | "version">;

const COLUMNS = ["locale", "slug", "title", "description", "layout", "blocks", "body_md", "seo", "cover", "tags", "author", "status", "translation_key", "published_at"] as const;

/** Accepts `3`, `"3"` or `W/"3"` (the ETag we send is `"<version>"`). */
export function parseIfMatch(header: string | null | undefined): number | null {
  const m = header ? /^(?:W\/)?"?(\d+)"?$/.exec(header.trim()) : null;
  return m ? Number(m[1]) : null;
}

const now = () => new Date().toISOString();

export function checkVersion(kind: PageKind, current: PageRow, expected: number | null | undefined): void {
  if (expected != null && expected !== current.version) {
    throw new ApiError(409, "version_conflict", `This ${kind} changed since you loaded it (you have version ${expected}, current is ${current.version}). Reload and retry.`, { current_version: current.version });
  }
}

/** Validates the full editable state; returns column values ready for D1. */
export function prepare(kind: PageKind, state: Omit<Editable, "blocks" | "seo" | "tags"> & { blocks: unknown[]; seo: object; tags: string[] }): Editable {
  const slugProblem = slugError(state.slug, kind);
  if (slugProblem) throw new ApiError(422, "validation_failed", slugProblem, [{ path: "slug", message: slugProblem }]);
  const blocks = validateBlocks(state.blocks);
  if (!blocks.ok) throw new ApiError(422, "validation_failed", "One or more blocks are invalid.", blocks.issues);
  const tags = [...new Set(state.tags.map((t) => t.trim()))];
  return { ...state, blocks: JSON.stringify(blocks.blocks), seo: JSON.stringify(state.seo ?? {}), tags: JSON.stringify(tags) };
}

export async function assertTranslationSlotFree(db: D1Database, kind: PageKind, state: Editable, id: string): Promise<void> {
  if (!state.translation_key) return;
  const clash = await db
    .prepare("SELECT id FROM pages WHERE kind = ? AND translation_key = ? AND locale = ? AND id != ?")
    .bind(kind, state.translation_key, state.locale, id)
    .first<{ id: string }>();
  if (clash) throw conflict(`Translation "${state.translation_key}" already has a ${state.locale} ${kind} (${clash.id}).`, { page_id: clash.id });
}

function rethrowUnique(err: unknown, kind: PageKind): never {
  if (err instanceof Error && /UNIQUE constraint failed/i.test(err.message)) throw conflict(`Another ${kind} already uses this slug in this locale.`);
  throw err;
}

export async function createPage(db: D1Database, kind: PageKind, raw: unknown, ctx: WriteContext): Promise<PageRecord> {
  const parsed = createPageInput.safeParse(raw);
  if (!parsed.success) throw validationFailed(parsed.error);
  const input = parsed.data;
  const slug = input.slug || slugify(input.title);
  if (!slug) throw badRequest("Could not derive a slug from the title; pass `slug`.");
  const status = input.status ?? "draft";
  const state = prepare(kind, {
    locale: input.locale,
    slug,
    title: input.title,
    description: input.description,
    layout: input.layout ?? (kind === "post" ? "article" : "default"),
    blocks: input.blocks ?? [],
    body_md: input.body_md ?? null,
    seo: input.seo ?? {},
    cover: input.cover ?? null,
    tags: input.tags ?? [],
    author: input.author ?? null,
    status,
    translation_key: input.translation_key ?? null,
    published_at: status === "published" ? now() : null,
  });
  const id = crypto.randomUUID();
  await assertTranslationSlotFree(db, kind, state, id);
  const at = now();
  const row: PageRow = { id, kind, ...state, created_at: at, updated_at: at, version: 1 };
  try {
    await db.batch([
      db.prepare(`INSERT INTO pages (id, kind, ${COLUMNS.join(", ")}, created_at, updated_at, version) VALUES (?, ?, ${COLUMNS.map(() => "?").join(", ")}, ?, ?, 1)`).bind(id, kind, ...COLUMNS.map((c) => state[c]), at, at),
      db.prepare("INSERT INTO page_revisions (page_id, version, snapshot, actor, note) VALUES (?, 1, ?, ?, ?)").bind(id, JSON.stringify(row), ctx.actor, ctx.note ?? "created"),
      db.prepare("INSERT INTO audit_log (actor, action, target, detail) VALUES (?, ?, ?, ?)").bind(ctx.actor, `${kind}.create`, id, JSON.stringify({ slug, locale: state.locale, status })),
    ]);
  } catch (err) {
    rethrowUnique(err, kind);
  }
  return toRecord(row);
}

/**
 * Commits `next` over `current` as version+1. The revision and audit inserts are conditional on the
 * update having landed, so a lost race writes nothing and surfaces as a 409.
 */
export async function commitVersion(db: D1Database, current: PageRow, next: Editable, ctx: WriteContext, action: string, detail: Record<string, unknown> = {}): Promise<PageRecord> {
  const version = current.version + 1;
  const at = now();
  const row: PageRow = { ...current, ...next, updated_at: at, version };
  const landed = "WHERE EXISTS (SELECT 1 FROM pages WHERE id = ? AND version = ?)";
  let results: D1Result[];
  try {
    results = await db.batch([
      db.prepare(`UPDATE pages SET ${COLUMNS.map((c) => `${c} = ?`).join(", ")}, updated_at = ?, version = ? WHERE id = ? AND version = ?`).bind(...COLUMNS.map((c) => next[c]), at, version, current.id, current.version),
      db.prepare(`INSERT INTO page_revisions (page_id, version, snapshot, actor, note) SELECT ?, ?, ?, ?, ? ${landed}`).bind(current.id, version, JSON.stringify(row), ctx.actor, ctx.note ?? action, current.id, version),
      db.prepare(`INSERT INTO audit_log (actor, action, target, detail) SELECT ?, ?, ?, ? ${landed}`).bind(ctx.actor, `${current.kind}.${action}`, current.id, JSON.stringify({ version, ...detail }), current.id, version),
    ]);
  } catch (err) {
    rethrowUnique(err, current.kind);
  }
  if (!results[0]?.meta.changes) {
    const fresh = await findRow(db, current.kind, current.id);
    throw new ApiError(409, "version_conflict", `This ${current.kind} was changed by someone else. Reload and retry.`, { current_version: fresh?.version ?? null });
  }
  return toRecord(row);
}

export function editableOf(row: PageRow): Editable {
  const { id: _i, kind: _k, created_at: _c, updated_at: _u, version: _v, ...rest } = row;
  return rest;
}

export async function updatePage(db: D1Database, kind: PageKind, ref: string, raw: unknown, ctx: WriteContext): Promise<PageRecord> {
  const parsed = updatePageInput.safeParse(raw);
  if (!parsed.success) throw validationFailed(parsed.error);
  const { version, note, ...patch } = parsed.data;
  const current = await requireRow(db, kind, ref);
  checkVersion(kind, current, version ?? ctx.ifMatch);
  const base = toRecord(current);
  const next = prepare(kind, {
    ...editableOf(current),
    ...patch,
    blocks: patch.blocks ?? base.blocks,
    seo: patch.seo ?? base.seo,
    tags: patch.tags ?? base.tags,
  });
  await assertTranslationSlotFree(db, kind, next, current.id);
  return commitVersion(db, current, next, { ...ctx, note: note ?? ctx.note }, "update", { fields: Object.keys(patch) });
}

export type StatusAction = "publish" | "unpublish" | "archive";

export async function changeStatus(db: D1Database, kind: PageKind, ref: string, action: StatusAction, ctx: WriteContext): Promise<PageRecord> {
  const current = await requireRow(db, kind, ref);
  checkVersion(kind, current, ctx.ifMatch);
  const status = action === "publish" ? "published" : action === "archive" ? "archived" : "draft";
  if (current.status === status) return toRecord(current);
  const next: Editable = { ...editableOf(current), status, published_at: action === "publish" ? (current.published_at ?? now()) : current.published_at };
  return commitVersion(db, current, next, ctx, action, { from: current.status, to: status });
}

export async function deletePage(db: D1Database, kind: PageKind, ref: string, ctx: WriteContext): Promise<{ id: string; deleted: true }> {
  const current = await requireRow(db, kind, ref);
  checkVersion(kind, current, ctx.ifMatch);
  const [del] = await db.batch([
    db.prepare("DELETE FROM pages WHERE id = ? AND version = ?").bind(current.id, current.version),
    db.prepare("DELETE FROM page_revisions WHERE page_id = ? AND NOT EXISTS (SELECT 1 FROM pages WHERE id = ?)").bind(current.id, current.id),
    db.prepare("INSERT INTO audit_log (actor, action, target, detail) SELECT ?, ?, ?, ? WHERE NOT EXISTS (SELECT 1 FROM pages WHERE id = ?)").bind(ctx.actor, `${kind}.delete`, current.id, JSON.stringify({ slug: current.slug, locale: current.locale }), current.id),
  ]);
  if (!del.meta.changes) throw new ApiError(409, "version_conflict", `This ${kind} changed while deleting. Reload and retry.`);
  return { id: current.id, deleted: true };
}

export async function requireRow(db: D1Database, kind: PageKind, ref: string): Promise<PageRow> {
  const row = await findRow(db, kind, ref);
  if (!row) throw notFound(`No ${kind} with id "${ref}".`);
  return row;
}
