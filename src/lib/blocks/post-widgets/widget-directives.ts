/**
 * The inline widget grammar for blog posts (isomorphic, pure):
 *
 *     ::widget{id="gallery-1"}
 *
 * on a line of its own (up to three spaces of indent) places the post block whose `id` is
 * "gallery-1" at that point of the Markdown body. It is a marked block extension, so marked's own
 * lexer decides what is code: a directive inside a fenced or indented code block stays code.
 * Only top-level directives place widgets; one inside a list item or a quote is reported and
 * hidden, because cutting a list in two would break the HTML around it.
 */
import type { Marked, Token, TokenizerAndRendererExtension, Tokens } from "marked";

/** Attributes a directive may carry; P1/P2 widgets can add more without changing the grammar. */
const KNOWN_ATTRS = new Set(["id"]);
const LINE_RE = /^ {0,3}::widget(?:\{([^}\n]*)\})?[ \t]*(?:\n+|$)/;
const START_RE = /^ {0,3}::widget(?:\{|[ \t]*$)/m;
const ATTR_RE = /([a-z][a-z0-9-]*)="([^"\n]*)"/gy;

export type WidgetToken = Tokens.Generic & {
  type: "widget";
  raw: string;
  /** The block id the directive names, when the attributes parsed. */
  id: string | null;
  /** Why the directive is malformed (null when it is well formed). */
  error: string | null;
  /** Offset in the normalised source; trustworthy only for top-level directives. */
  offset: number;
};

/** Parses `id="a" other="b"` strictly: anything that is not a quoted attribute is an error. */
export function parseDirectiveAttrs(inner: string | undefined): { id: string | null; error: string | null } {
  if (inner === undefined) return { id: null, error: 'missing attributes; write ::widget{id="…"}' };
  const attrs = new Map<string, string>();
  let pos = 0;
  const text = inner.trim();
  while (pos < text.length) {
    ATTR_RE.lastIndex = pos;
    const m = ATTR_RE.exec(text);
    if (!m) return { id: null, error: `cannot read "${text.slice(pos, pos + 30)}"; attributes look like id="…"` };
    if (!KNOWN_ATTRS.has(m[1])) return { id: null, error: `unknown attribute "${m[1]}"` };
    if (attrs.has(m[1])) return { id: null, error: `attribute "${m[1]}" is repeated` };
    attrs.set(m[1], m[2]);
    pos = ATTR_RE.lastIndex;
    while (pos < text.length && /[ \t]/.test(text[pos])) pos++;
  }
  const id = attrs.get("id")?.trim() ?? "";
  return id ? { id, error: null } : { id: null, error: 'the id is missing; write ::widget{id="…"}' };
}

/**
 * The marked extension. `source` is the normalised document being lexed, so a top-level
 * directive can record where it starts. `renderNested` decides what a misplaced (nested)
 * directive becomes; top-level ones never reach the renderer (renderPostBody places them).
 */
export function widgetExtension(source: string, renderNested: (token: WidgetToken) => string): TokenizerAndRendererExtension {
  return {
    name: "widget",
    level: "block",
    start(src: string) {
      return START_RE.exec(src)?.index;
    },
    tokenizer(src: string) {
      const m = LINE_RE.exec(src);
      if (!m) return undefined;
      const { id, error } = parseDirectiveAttrs(m[1]);
      const token: WidgetToken = { type: "widget", raw: m[0], id, error, offset: source.length - src.length };
      return token;
    },
    renderer(token: Tokens.Generic) {
      return renderNested(token as WidgetToken);
    },
  };
}

/** One-paragraph contract for API, MCP and CLI descriptions, so every surface explains it the same way. */
export const POST_WIDGETS_HELP =
  'A post is `body_md` (Markdown) plus optional `blocks`: widgets shaped { "id": "gallery-1", "type": "Gallery", "props": { … } } (list_blocks with context "post" lists them). ' +
  'Place a block inline with a line of its own in body_md: ::widget{id="gallery-1"}. Each id is placed at most once; blocks you do not place render after the body. ' +
  "No HTML or MDX: unknown ids, nested directives (inside lists or quotes) and invalid props are rejected with a `path` and the line." +
  " Data and comparison widgets: Chart (bar, line, pie, donut; labels plus series of numbers), Diagram (Mermaid source plus required alt), ComparisonTable (options as columns, yes/no/partial marks) and BeforeAfter (two images with alt). " +
  "Poll, Quiz and Survey collect anonymous reader answers and need an `id` (answers are stored per post and id; renaming the id starts over): poll results are public after voting, a quiz reveals its `answer` and `explanation` only to readers who answered, survey results are admin-only. " +
  "Demo shows an https page from an allowlisted demo host in a sandboxed iframe after a click.";

export const normaliseSource = (source: string | null | undefined): string => (source ?? "").replace(/\r\n?/g, "\n");

export const isWidgetToken = (t: Token): t is WidgetToken => t.type === "widget";

export type DirectiveInfo = { token: WidgetToken; line: number | null; nested: boolean };

/** Every directive in a lexed document, in order, with 1-based lines for the top-level ones. */
export function listDirectives(marked: Marked, tokens: Token[], source: string): DirectiveInfo[] {
  const top = new Set(tokens.filter(isWidgetToken));
  const out: DirectiveInfo[] = [];
  marked.walkTokens(tokens, (t) => {
    if (!isWidgetToken(t)) return;
    const nested = !top.has(t);
    out.push({ token: t, nested, line: nested ? null : source.slice(0, t.offset).split("\n").length });
  });
  return out;
}
