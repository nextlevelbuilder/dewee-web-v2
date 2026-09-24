/**
 * Revision history: every write stores a full snapshot in page_revisions. Restoring copies a
 * snapshot's content fields onto the page as a new version (status and identity are unchanged),
 * so a restore is itself undoable.
 */
import { notFound } from "../api/api-errors";
import { SNAPSHOT_FIELDS, toRecord, type PageKind, type PageRecord, type PageRow } from "./page-schema";
import { assertTranslationSlotFree, checkVersion, commitVersion, editableOf, prepare, requireRow, type WriteContext } from "./page-service";

export type RevisionSummary = { id: number; version: number; actor: string; note: string | null; created_at: string };

export async function listRevisions(db: D1Database, kind: PageKind, ref: string, limit = 50): Promise<RevisionSummary[]> {
  const page = await requireRow(db, kind, ref);
  const { results } = await db
    .prepare("SELECT id, version, actor, note, created_at FROM page_revisions WHERE page_id = ? ORDER BY version DESC, id DESC LIMIT ?")
    .bind(page.id, Math.min(Math.max(limit, 1), 200))
    .all<RevisionSummary>();
  return results;
}

export async function getRevision(db: D1Database, kind: PageKind, ref: string, revisionId: number): Promise<RevisionSummary & { snapshot: PageRecord }> {
  const page = await requireRow(db, kind, ref);
  const rev = await db
    .prepare("SELECT id, version, actor, note, created_at, snapshot FROM page_revisions WHERE id = ? AND page_id = ?")
    .bind(revisionId, page.id)
    .first<RevisionSummary & { snapshot: string }>();
  if (!rev) throw notFound(`Revision ${revisionId} does not belong to this ${kind}.`);
  return { ...rev, snapshot: toRecord(JSON.parse(rev.snapshot) as PageRow) };
}

export async function restoreRevision(db: D1Database, kind: PageKind, ref: string, revisionId: number, ctx: WriteContext): Promise<PageRecord> {
  const current = await requireRow(db, kind, ref);
  checkVersion(kind, current, ctx.ifMatch);
  const rev = await getRevision(db, kind, current.id, revisionId);
  const snap = rev.snapshot;
  const restored = Object.fromEntries(SNAPSHOT_FIELDS.map((f) => [f, snap[f]])) as Pick<PageRecord, (typeof SNAPSHOT_FIELDS)[number]>;
  const next = prepare(kind, { ...editableOf(current), ...restored });
  await assertTranslationSlotFree(db, kind, next, current.id);
  return commitVersion(db, current, next, { ...ctx, note: ctx.note ?? `restored v${rev.version}` }, "restore", { revision_id: rev.id, from_version: rev.version });
}
