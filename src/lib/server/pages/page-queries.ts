/**
 * Read side of the page service: admin/API listing and search, lookups by id or slug, and the
 * published-only queries used by public rendering (custom pages, blog, RSS, prev/next).
 */
import { z } from "zod";
import { notFound } from "../api/api-errors";
import { localeSchema, statusSchema, toRecord, type PageKind, type PageRecord, type PageRow } from "./page-schema";

export const listQuerySchema = z
  .object({
    locale: localeSchema.optional(),
    status: statusSchema.optional(),
    q: z.string().trim().max(100).optional(),
    tag: z.string().trim().max(32).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    offset: z.coerce.number().int().min(0).max(100_000).default(0),
  })
  .strict();
export type ListQuery = z.infer<typeof listQuerySchema>;

/** Listing rows omit the heavy fields (blocks, body_md); fetch one page for the full record. */
export type PageSummary = Omit<PageRecord, "blocks" | "body_md">;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const likeEscape = (s: string) => `%${s.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

function summary(row: PageRow): PageSummary {
  const { blocks: _b, body_md: _m, ...rest } = toRecord(row);
  return rest;
}

export async function listPages(db: D1Database, kind: PageKind, query: ListQuery): Promise<{ data: PageSummary[]; pagination: { limit: number; offset: number; total: number } }> {
  const where = ["kind = ?"];
  const args: unknown[] = [kind];
  if (query.locale) (where.push("locale = ?"), args.push(query.locale));
  if (query.status) (where.push("status = ?"), args.push(query.status));
  if (query.tag) (where.push("EXISTS (SELECT 1 FROM json_each(pages.tags) WHERE json_each.value = ?)"), args.push(query.tag));
  if (query.q) {
    where.push("(title LIKE ? ESCAPE '\\' OR description LIKE ? ESCAPE '\\' OR slug LIKE ? ESCAPE '\\' OR COALESCE(body_md, '') LIKE ? ESCAPE '\\')");
    const pattern = likeEscape(query.q);
    args.push(pattern, pattern, pattern, pattern);
  }
  const clause = where.join(" AND ");
  const [rows, count] = await db.batch([
    db.prepare(`SELECT * FROM pages WHERE ${clause} ORDER BY updated_at DESC LIMIT ? OFFSET ?`).bind(...args, query.limit, query.offset),
    db.prepare(`SELECT COUNT(*) AS n FROM pages WHERE ${clause}`).bind(...args),
  ]);
  const total = Number((count.results[0] as { n?: number } | undefined)?.n ?? 0);
  return { data: (rows.results as PageRow[]).map(summary), pagination: { limit: query.limit, offset: query.offset, total } };
}

export async function findRow(db: D1Database, kind: PageKind, ref: string, locale: "en" | "vi" = "en"): Promise<PageRow | null> {
  if (UUID_RE.test(ref)) return db.prepare("SELECT * FROM pages WHERE id = ? AND kind = ?").bind(ref.toLowerCase(), kind).first<PageRow>();
  return db.prepare("SELECT * FROM pages WHERE kind = ? AND locale = ? AND slug = ?").bind(kind, locale, ref).first<PageRow>();
}

/** A page or post by id (or by slug + locale). Throws 404 with a helpful message. */
export async function getPage(db: D1Database, kind: PageKind, ref: string, locale?: "en" | "vi"): Promise<PageRecord> {
  const row = await findRow(db, kind, ref, locale);
  if (!row) throw notFound(`No ${kind} with id or slug "${ref}"${locale ? ` in ${locale}` : ""}.`);
  return toRecord(row);
}

export async function getPublished(db: D1Database, kind: PageKind, locale: "en" | "vi", slug: string): Promise<PageRecord | null> {
  const row = await db.prepare("SELECT * FROM pages WHERE kind = ? AND locale = ? AND slug = ? AND status = 'published'").bind(kind, locale, slug).first<PageRow>();
  return row ? toRecord(row) : null;
}

/** The published sibling in the other locale (linked by translation_key), for hreflang and the language switch. */
export async function getPublishedTranslation(db: D1Database, page: PageRecord): Promise<PageRecord | null> {
  if (!page.translation_key) return null;
  const row = await db
    .prepare("SELECT * FROM pages WHERE kind = ? AND translation_key = ? AND locale != ? AND status = 'published' LIMIT 1")
    .bind(page.kind, page.translation_key, page.locale)
    .first<PageRow>();
  return row ? toRecord(row) : null;
}

export async function listPublishedPosts(db: D1Database, locale: "en" | "vi", opts: { limit: number; offset?: number; tag?: string }): Promise<{ posts: PageRecord[]; total: number }> {
  const tagClause = opts.tag ? " AND EXISTS (SELECT 1 FROM json_each(pages.tags) WHERE json_each.value = ?)" : "";
  const args: unknown[] = ["post", locale, ...(opts.tag ? [opts.tag] : [])];
  const [rows, count] = await db.batch([
    db.prepare(`SELECT * FROM pages WHERE kind = ? AND locale = ? AND status = 'published'${tagClause} ORDER BY published_at DESC, id LIMIT ? OFFSET ?`).bind(...args, opts.limit, opts.offset ?? 0),
    db.prepare(`SELECT COUNT(*) AS n FROM pages WHERE kind = ? AND locale = ? AND status = 'published'${tagClause}`).bind(...args),
  ]);
  return { posts: (rows.results as PageRow[]).map(toRecord), total: Number((count.results[0] as { n?: number } | undefined)?.n ?? 0) };
}

/** Older and newer published posts around `post`, in the same locale. */
export async function adjacentPosts(db: D1Database, post: PageRecord): Promise<{ older: PageRecord | null; newer: PageRecord | null }> {
  const at = post.published_at ?? post.created_at;
  const [older, newer] = await db.batch([
    db.prepare("SELECT * FROM pages WHERE kind = 'post' AND locale = ? AND status = 'published' AND id != ? AND published_at <= ? ORDER BY published_at DESC LIMIT 1").bind(post.locale, post.id, at),
    db.prepare("SELECT * FROM pages WHERE kind = 'post' AND locale = ? AND status = 'published' AND id != ? AND published_at > ? ORDER BY published_at ASC LIMIT 1").bind(post.locale, post.id, at),
  ]);
  const first = (r: D1Result) => (r.results[0] ? toRecord(r.results[0] as PageRow) : null);
  return { older: first(older), newer: first(newer) };
}
