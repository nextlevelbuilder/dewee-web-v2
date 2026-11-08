/**
 * A blog post body: `body_md` (Markdown) plus `blocks` (widgets with ids). The body places a
 * block with `::widget{id="…"}` on a line of its own; blocks it never places follow the body in
 * order. One function renders the public page and the admin preview, so they cannot drift; the
 * only difference is that the preview shows a small notice where the page shows nothing.
 *
 * Stored blocks are validated again one by one at render time: a block written before a schema
 * tightened, or edited straight in D1, is hidden instead of breaking the page.
 */
import type { Token } from "marked";
import type { BlockIssue, StoredBlock } from "../block-types";
import { validateBlocks } from "../registry";
import { createSafeMarked } from "../safe-markdown";
import { postWidget } from "./post-widget-registry";
import { codeBlockHtml } from "./text-widgets";
import { esc, fill, type RenderMode, type WidgetContext, type WidgetLabels } from "./widget-html";
import { isWidgetToken, listDirectives, normaliseSource, widgetExtension, type WidgetToken } from "./widget-directives";

/** `id` (the post's row id) lets widgets that store reader answers post their form on the public page. */
export type PostContent = { id?: string; body_md: string | null | undefined; blocks?: readonly unknown[] | null };
type Resolved = { ok: true; block: StoredBlock } | { ok: false; type: string; reason: string };

function resolveBlock(raw: unknown): Resolved {
  const type = typeof (raw as { type?: unknown })?.type === "string" ? String((raw as { type: string }).type) : "?";
  const result = validateBlocks([raw], { context: "post" });
  if (!result.ok) return { ok: false, type, reason: result.issues.map((i) => `${i.path.replace(/^blocks\.0\.?/, "") || "block"}: ${i.message}`).join("; ") };
  const block = result.blocks[0];
  return postWidget(block.type) ? { ok: true, block } : { ok: false, type, reason: "this block type has no post renderer" };
}

function indexBlocks(blocks: readonly unknown[]): Map<string, number> {
  const byId = new Map<string, number>();
  blocks.forEach((raw, i) => {
    const id = (raw as { id?: unknown })?.id;
    if (typeof id === "string" && !byId.has(id)) byId.set(id, i);
  });
  return byId;
}

/** Lexes a body with the widget grammar. `onNested` renders a directive found inside a list or quote. */
function lexBody(source: string, labels: WidgetLabels, onNested: (t: WidgetToken) => string) {
  const marked = createSafeMarked({
    extensions: [widgetExtension(source, onNested)],
    code: (token) => codeBlockHtml(token.text, token.lang, labels),
  });
  return { marked, tokens: marked.lexer(source) as Token[] };
}

export type RenderPostOptions = { mode: RenderMode; labels: WidgetLabels };

/** Safe HTML for a whole post body: prose and widgets in order, then the unplaced blocks. */
export function renderPostBody(post: PostContent, { mode, labels }: RenderPostOptions): string {
  const source = normaliseSource(post.body_md);
  const blocks = post.blocks ?? [];
  const notice = (text: string) => (mode === "preview" ? `<p class="pw-notice" role="note"><b>${esc(labels.previewOnly)}</b> ${esc(text)}</p>\n` : "");
  const ctx: WidgetContext = { labels, ...(mode === "public" && post.id ? { postId: post.id } : {}) };
  const widget = (block: StoredBlock) => {
    const def = postWidget(block.type);
    const widgetCtx = { ...ctx, ...(block.id ? { widgetId: block.id } : {}) };
    const html = def?.html(block.props, widgetCtx) ?? "";
    const twin = def?.twinFromMarkdown ? ` data-md="${esc(def.markdown(block.props, widgetCtx))}"` : "";
    return html ? `<div class="pw" data-widget="${esc(block.type)}"${twin}>${html}</div>\n` : "";
  };

  const { marked, tokens } = lexBody(source, labels, () => notice(labels.noticeNested));
  const byId = indexBlocks(blocks);
  const placed = new Set<number>();
  let html = "";
  let prose: Token[] = [];
  const flush = () => {
    if (prose.length) html += marked.parser(prose);
    prose = [];
  };

  for (const token of tokens) {
    if (!isWidgetToken(token)) {
      prose.push(token);
      continue;
    }
    flush();
    if (token.error || !token.id) {
      html += notice(fill(labels.noticeMalformed, { reason: token.error ?? "" }));
      continue;
    }
    const index = byId.get(token.id);
    if (index === undefined) {
      html += notice(fill(labels.noticeMissing, { id: token.id }));
      continue;
    }
    if (placed.has(index)) {
      html += notice(fill(labels.noticeDuplicate, { id: token.id }));
      continue;
    }
    placed.add(index);
    const resolved = resolveBlock(blocks[index]);
    html += resolved.ok ? widget(resolved.block) : notice(fill(labels.noticeInvalid, { id: token.id, type: resolved.type, reason: resolved.reason }));
  }
  flush();

  blocks.forEach((raw, i) => {
    if (placed.has(i)) return;
    const resolved = resolveBlock(raw);
    html += resolved.ok ? widget(resolved.block) : notice(fill(labels.noticeUnplacedInvalid, { n: i + 1, type: resolved.type, reason: resolved.reason }));
  });
  return html;
}

/**
 * Write-time checks for the body against the (already validated) blocks: every directive must be
 * well formed, at the top level, name an existing block and place it only once. Paths read
 * `body_md` with the 1-based line in the message, so an agent can fix the exact line.
 */
export function validatePostContent(bodyMd: string | null | undefined, blocks: readonly StoredBlock[]): BlockIssue[] {
  const source = normaliseSource(bodyMd);
  if (!source.includes("::widget")) return [];
  const ids = new Set(blocks.map((b) => b.id).filter(Boolean));
  const issues: BlockIssue[] = [];
  const seen = new Map<string, number | null>();
  const { marked, tokens } = lexBody(source, {} as WidgetLabels, () => "");
  for (const { token, line, nested } of listDirectives(marked, tokens, source)) {
    const at = line ? `Line ${line}: ` : "";
    const raw = token.raw.trim();
    if (nested) issues.push({ path: "body_md", message: `${raw} sits inside a list or a quote. Put it on its own line at the top level of the body.` });
    else if (token.error || !token.id) issues.push({ path: "body_md", message: `${at}${raw} is malformed: ${token.error}.` });
    else if (!ids.has(token.id)) issues.push({ path: "body_md", message: `${at}no block has the id "${token.id}". Add { "id": "${token.id}", "type": …, "props": … } to blocks, or fix the id.` });
    else if (seen.has(token.id)) issues.push({ path: "body_md", message: `${at}block "${token.id}" is already placed${seen.get(token.id) ? ` on line ${seen.get(token.id)}` : ""}. Each block appears once.` });
    if (token.id && !seen.has(token.id)) seen.set(token.id, line);
  }
  return issues;
}

/**
 * The post as Markdown for RSS, the `.md` twin and llms-full.txt: each placed widget becomes its
 * Markdown stand-in, unplaced blocks follow the body. A post without directives or blocks comes
 * back byte for byte, so the exports of existing posts do not change.
 */
export function postBodyMarkdown(post: PostContent, labels: WidgetLabels): string {
  const original = post.body_md ?? "";
  const blocks = post.blocks ?? [];
  const source = normaliseSource(original);
  if (!blocks.length && !source.includes("::widget")) return original;

  const { tokens } = lexBody(source, labels, () => "");
  const byId = indexBlocks(blocks);
  const placed = new Set<number>();
  const ctx = { labels };
  const markdownOf = (raw: unknown) => {
    const resolved = resolveBlock(raw);
    return resolved.ok ? (postWidget(resolved.block.type)?.markdown(resolved.block.props, ctx) ?? "").trim() : "";
  };

  let out = "";
  let cursor = 0;
  for (const token of tokens) {
    if (!isWidgetToken(token)) continue;
    const index = token.id && !token.error ? byId.get(token.id) : undefined;
    const fresh = index !== undefined && !placed.has(index);
    if (fresh) placed.add(index);
    const md = fresh ? markdownOf(blocks[index]) : "";
    let before = source.slice(cursor, token.offset);
    // A directive may end a paragraph without a blank line; keep the stand-in its own block.
    if (md && (out + before).length && !(out + before).endsWith("\n\n")) before += "\n";
    out += before + (md ? `${md}\n\n` : "");
    cursor = token.offset + token.raw.length;
  }
  out += source.slice(cursor);

  const tail = blocks.map((raw, i) => (placed.has(i) ? "" : markdownOf(raw))).filter(Boolean);
  if (tail.length) out = `${out.replace(/\s+$/, "")}${out.trim() ? "\n\n" : ""}${tail.join("\n\n")}\n`;
  return out;
}
