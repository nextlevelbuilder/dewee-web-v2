/**
 * D1 `releases` reads for the changelog page, its feed and the sitemap. Metadata for every release
 * is small (a few hundred rows) and drives grouping and pagination; bodies are fetched only for
 * the releases on screen. Rows that do not look like a release are skipped, not trusted.
 */
import { parseTag, type Channel, type ReleaseMeta } from "./release-groups.ts";

type MetaRow = { tag: unknown; name: unknown; channel: unknown; published_at: unknown };

/** D1 allows 100 bound parameters per statement. */
const IN_CHUNK = 90;
const MAX_RELEASES = 5000;

function toMeta(row: MetaRow): ReleaseMeta | null {
  const { tag, name, channel, published_at: at } = row;
  if (typeof tag !== "string" || !parseTag(tag)) return null;
  if (channel !== "stable" && channel !== "beta") return null;
  if (typeof at !== "string" || Number.isNaN(Date.parse(at))) return null;
  return { tag, name: typeof name === "string" && name.trim() ? name.trim() : tag, channel: channel as Channel, publishedAt: at };
}

export async function listReleaseMeta(db: D1Database): Promise<ReleaseMeta[]> {
  const { results } = await db
    .prepare("SELECT tag, name, channel, published_at FROM releases ORDER BY published_at DESC LIMIT ?1")
    .bind(MAX_RELEASES)
    .all<MetaRow>();
  return (results ?? []).map(toMeta).filter((r): r is ReleaseMeta => r !== null);
}

export async function releaseBodies(db: D1Database, tags: string[]): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const unique = [...new Set(tags)];
  for (let i = 0; i < unique.length; i += IN_CHUNK) {
    const chunk = unique.slice(i, i + IN_CHUNK);
    const placeholders = chunk.map((_, j) => `?${j + 1}`).join(", ");
    const { results } = await db
      .prepare(`SELECT tag, body FROM releases WHERE tag IN (${placeholders})`)
      .bind(...chunk)
      .all<{ tag: string; body: string | null }>();
    for (const r of results ?? []) out.set(r.tag, r.body ?? "");
  }
  return out;
}

export type ReleaseWithBody = ReleaseMeta & { body: string };

/** Newest stable releases with their notes (the Atom feed). */
export async function latestStableReleases(db: D1Database, limit: number): Promise<ReleaseWithBody[]> {
  const { results } = await db
    .prepare("SELECT tag, name, channel, published_at, body FROM releases WHERE channel = 'stable' ORDER BY published_at DESC LIMIT ?1")
    .bind(limit)
    .all<MetaRow & { body: unknown }>();
  return (results ?? []).flatMap((row) => {
    const meta = toMeta(row);
    return meta ? [{ ...meta, body: typeof row.body === "string" ? row.body : "" }] : [];
  });
}
