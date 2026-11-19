/**
 * D1 access for reader answers. Every query is scoped by post id, and widget definitions always
 * come from the post's CURRENT published blocks, so a draft, an archived post, a removed widget
 * or another post's widget can never take or show answers.
 */
import { validateBlocks } from "../../blocks/registry";
import { isResponseWidget, type ParsedAnswer, type ResponseWidgetType } from "../../blocks/interactive-answers";

export const POST_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export type PublishedPost = { id: string; locale: "en" | "vi"; slug: string; title: string; blocks: unknown[] };
export type ResponseWidget = { id: string; type: ResponseWidgetType; props: Record<string, unknown> };

/** A published post by id, or null (drafts, archived posts and pages are not found). */
export async function publishedPost(db: D1Database, id: string): Promise<PublishedPost | null> {
  if (!POST_ID_RE.test(id)) return null;
  const row = await db
    .prepare("SELECT id, locale, slug, title, blocks FROM pages WHERE id = ? AND kind = 'post' AND status = 'published'")
    .bind(id)
    .first<{ id: string; locale: "en" | "vi"; slug: string; title: string; blocks: string }>();
  if (!row) return null;
  let blocks: unknown = [];
  try {
    blocks = JSON.parse(row.blocks);
  } catch {
    blocks = [];
  }
  return { id: row.id, locale: row.locale === "vi" ? "vi" : "en", slug: row.slug, title: row.title, blocks: Array.isArray(blocks) ? blocks : [] };
}

/** Every valid Poll/Quiz/Survey block of the post, in order (invalid stored blocks are skipped, as on the page). */
export function responseWidgets(post: Pick<PublishedPost, "blocks">): ResponseWidget[] {
  const out: ResponseWidget[] = [];
  for (const raw of post.blocks) {
    const type = (raw as { type?: unknown })?.type;
    if (typeof type !== "string" || !isResponseWidget(type)) continue;
    const res = validateBlocks([raw], { context: "post" });
    if (!res.ok) continue;
    const block = res.blocks[0];
    if (block.id && isResponseWidget(block.type)) out.push({ id: block.id, type: block.type, props: block.props });
  }
  return out;
}

export type SaveOutcome = "saved" | "already_answered";

/**
 * Poll: one row per voter, and a later vote replaces the earlier one. Quiz and Survey: the first
 * answer is final. A row left over from a different widget type under the same id is replaced.
 */
export async function saveResponse(db: D1Database, postId: string, widget: ResponseWidget, voter: string, answer: ParsedAnswer): Promise<SaveOutcome> {
  const now = new Date().toISOString();
  const answers = answer.answers ? JSON.stringify(answer.answers) : null;
  const replaceWhen = widget.type === "Poll" ? "" : " WHERE widget_responses.widget_type <> excluded.widget_type";
  const res = await db
    .prepare(
      "INSERT INTO widget_responses (post_id, widget_id, widget_type, voter, choice, answers, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?) " +
        "ON CONFLICT (post_id, widget_id, voter) DO UPDATE SET widget_type = excluded.widget_type, choice = excluded.choice, answers = excluded.answers, updated_at = excluded.updated_at" +
        replaceWhen,
    )
    .bind(postId, widget.id, widget.type, voter, answer.choice, answers, now, now)
    .run();
  return Number(res.meta?.changes ?? 0) > 0 ? "saved" : "already_answered";
}

/** Choice counts for the post's Poll and Quiz widgets: widget id → option id → count. */
export async function choiceCounts(db: D1Database, postId: string): Promise<Map<string, Map<string, number>>> {
  const { results } = await db
    .prepare("SELECT widget_id, widget_type, choice, COUNT(*) AS n FROM widget_responses WHERE post_id = ? AND widget_type IN ('Poll', 'Quiz') AND choice IS NOT NULL GROUP BY widget_id, widget_type, choice")
    .bind(postId)
    .all<{ widget_id: string; widget_type: string; choice: string; n: number }>();
  const out = new Map<string, Map<string, number>>();
  for (const r of results) {
    const key = `${r.widget_type}:${r.widget_id}`;
    if (!out.has(key)) out.set(key, new Map());
    out.get(key)!.set(r.choice, Number(r.n));
  }
  return out;
}

/** This voter's own rows for the post: `type:widget id` → chosen option (or "" for a survey). */
export async function voterChoices(db: D1Database, postId: string, voter: string): Promise<Map<string, string>> {
  const { results } = await db
    .prepare("SELECT widget_id, widget_type, choice FROM widget_responses WHERE post_id = ? AND voter = ?")
    .bind(postId, voter)
    .all<{ widget_id: string; widget_type: string; choice: string | null }>();
  return new Map(results.map((r) => [`${r.widget_type}:${r.widget_id}`, r.choice ?? ""]));
}
