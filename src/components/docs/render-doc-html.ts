/**
 * Build-time post-processing of a docs page's rendered HTML (Astro's Markdown output):
 *  - GitHub-style callouts (`> [!NOTE]` … `> [!CAUTION]`) become styled notes
 *  - Shiki code blocks get a language label and a copy button (enabled by code-copy-client.ts)
 *  - h2/h3 get a "#" self-link
 *  - site-relative links are localised for VI (authors always write English paths)
 *  - `::shot{id="…"}` paragraphs are cut out so the page can render the CcpShot component there
 * The input is trusted (our own Markdown), but everything we inject is escaped or static.
 */
import { ICONS, type IconName } from "~/components/ui/icon-paths";
import { CCP_SCREENS, type CcpScreenId } from "~/content/ccp-screens";
import { escapeHtml } from "~/lib/inline-markup";
import { localePath, type Locale } from "~/i18n/config";

export type CalloutKind = "note" | "tip" | "important" | "warning" | "caution";
export type DocPart = { kind: "html"; html: string } | { kind: "shot"; id: CcpScreenId };
export interface DocRenderLabels {
  callouts: Record<CalloutKind, string>;
  copy: string;
  plain: string;
  anchor: string;
}

const CALLOUT_ICON: Record<CalloutKind, IconName> = {
  note: "info",
  tip: "lightbulb",
  important: "circle-alert",
  warning: "triangle-alert",
  caution: "shield-alert",
};
const SCREEN_IDS = new Set<string>(CCP_SCREENS.map((s) => s.id));
const Q = `(?:"|&quot;|&#34;|“|”|&#x201[cCdD];|&#822[01];|&[lr]dquo;)`;
const SHOT_HTML_RE = new RegExp(`<p>::shot\\{id=${Q}([a-z0-9-]+)${Q}\\}</p>`, "g");
const CALLOUT_OPEN_RE = /<blockquote>\s*<p>\[!(note|tip|important|warning|caution)\][ \t]*(?:<br\s*\/?>)?\s*/gi;

const icon = (name: IconName) =>
  `<svg class="icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;

/** Index of the `</tag>` that closes an element opened just before `from`. */
function closingIndex(html: string, from: number, tag: string): number {
  const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, "g");
  re.lastIndex = from;
  let depth = 1;
  for (let m = re.exec(html); m; m = re.exec(html)) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return m.index;
  }
  return -1;
}

function callouts(html: string, labels: DocRenderLabels): string {
  let out = "";
  let cursor = 0;
  CALLOUT_OPEN_RE.lastIndex = 0;
  for (let m = CALLOUT_OPEN_RE.exec(html); m; m = CALLOUT_OPEN_RE.exec(html)) {
    const kind = m[1].toLowerCase() as CalloutKind;
    const bodyStart = CALLOUT_OPEN_RE.lastIndex;
    const end = closingIndex(html, bodyStart, "blockquote");
    if (end < 0) break;
    const body = `<p>${html.slice(bodyStart, end)}`.replace(/<p>\s*<\/p>/g, "");
    out += html.slice(cursor, m.index);
    out += `<div class="callout callout--${kind}" role="note"><p class="callout__title">${icon(CALLOUT_ICON[kind])}${escapeHtml(labels.callouts[kind])}</p>${body}</div>`;
    cursor = end + "</blockquote>".length;
    CALLOUT_OPEN_RE.lastIndex = cursor;
  }
  return out + html.slice(cursor);
}

function codeBlocks(html: string, labels: DocRenderLabels): string {
  return html.replace(/<pre class="astro-code[^"]*"[^>]*>[\s\S]*?<\/pre>/g, (pre) => {
    const lang = /data-language="([^"]*)"/.exec(pre)?.[1] ?? "plaintext";
    const label = ["plaintext", "text", "txt", "plain"].includes(lang) ? labels.plain : lang;
    return (
      `<div class="code-block">` +
      `<div class="code-block__bar" data-md-skip><span class="code-block__lang">${escapeHtml(label)}</span>` +
      `<button type="button" class="code-block__copy" data-copy-code hidden>${icon("copy")}<span>${escapeHtml(labels.copy)}</span></button></div>` +
      `${pre}</div>`
    );
  });
}

function headingAnchors(html: string, labels: DocRenderLabels): string {
  return html.replace(/<h([23]) id="([^"]+)">([\s\S]*?)<\/h\1>/g, (_m, level: string, id: string, inner: string) =>
    `<h${level} id="${id}">${inner}<a class="heading-anchor" href="#${id}" aria-label="${escapeHtml(labels.anchor)}" data-md-skip>#</a></h${level}>`,
  );
}

function localiseLinks(html: string, locale: Locale): string {
  if (locale === "en") return html;
  return html.replace(/href="(\/(?!\/)[^"]*)"/g, (m, href: string) => {
    const path = href.split(/[?#]/)[0];
    if (path === `/${locale}` || path.startsWith(`/${locale}/`) || /\.[a-z0-9]+$/i.test(path)) return m;
    return `href="${localePath(locale, href)}"`;
  });
}

/**
 * Turn rendered Markdown into renderable parts. Throws (failing the build) on unknown
 * screenshot ids, on markers the front matter does not declare, and on markers that were not
 * on a line of their own.
 */
export function renderDocHtml(html: string, opts: { locale: Locale; labels: DocRenderLabels; screens: readonly CcpScreenId[]; source: string }): DocPart[] {
  const { locale, labels, screens, source } = opts;
  let body = callouts(html, labels);
  body = codeBlocks(body, labels);
  body = headingAnchors(body, labels);
  body = localiseLinks(body, locale);

  const parts: DocPart[] = [];
  const placed = new Set<string>();
  let cursor = 0;
  SHOT_HTML_RE.lastIndex = 0;
  for (let m = SHOT_HTML_RE.exec(body); m; m = SHOT_HTML_RE.exec(body)) {
    const id = m[1];
    if (!SCREEN_IDS.has(id)) throw new Error(`${source}: unknown screenshot id "${id}".`);
    if (!screens.includes(id as CcpScreenId)) throw new Error(`${source}: screenshot "${id}" is placed but not listed in front matter \`screens\`.`);
    parts.push({ kind: "html", html: body.slice(cursor, m.index) });
    parts.push({ kind: "shot", id: id as CcpScreenId });
    placed.add(id);
    cursor = SHOT_HTML_RE.lastIndex;
  }
  parts.push({ kind: "html", html: body.slice(cursor) });

  if (parts.some((p) => p.kind === "html" && p.html.includes("::shot"))) {
    throw new Error(`${source}: a ::shot marker must be a paragraph of its own.`);
  }
  // Declared but not placed: show them first so a page never silently drops a screenshot.
  const unplaced = screens.filter((id) => !placed.has(id)).map((id): DocPart => ({ kind: "shot", id }));
  return [...unplaced, ...parts].filter((p) => p.kind === "shot" || p.html.trim() !== "");
}
