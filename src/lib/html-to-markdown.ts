/**
 * Turns a rendered dewee page into clean Markdown for agents and "Copy as Markdown".
 * Shared by the worker (runtime twins) and scripts/postbuild-markdown-and-og.ts (static twins),
 * so it only uses relative imports and erasable TypeScript (Node runs it with type stripping).
 *
 * Rules: read `<main>` (or `[data-md-root]`), drop chrome and anything marked `data-md-skip`,
 * keep headings, lists, links (absolute), code, quotes, tables and image alt text.
 * The front matter carries title, description, canonical URL and language.
 */
import { parse, type HTMLElement, type Node } from "node-html-parser";

const SKIP = new Set(["script", "style", "noscript", "svg", "template", "button", "form", "nav", "iframe", "canvas", "video", "audio", "select", "input", "textarea", "dialog"]);
const BLOCK = new Set(["p", "div", "section", "article", "header", "footer", "aside", "figure", "figcaption", "main", "details", "summary", "dl", "address", "li"]);
const STRUCTURAL = new Set(["ul", "ol", "table", "pre", "blockquote", "hr"]);

export type MarkdownMeta = {
  title: string;
  description: string;
  url: string;
  lang: string;
  /** The page asks robots not to index it */
  noindex: boolean;
  /** hreflang alternates declared in <head> (absolute URLs) */
  alternates: { hreflang: string; href: string }[];
  /** article:modified_time, when the page declares one */
  modified?: string;
};

export function htmlToMarkdown(html: string, origin: string): { markdown: string; meta: MarkdownMeta } {
  // <pre> is parsed as elements (not raw text) so highlighted code (<code>, <span class="line">) reads as plain text.
  const doc = parse(html, { comment: false, blockTextElements: { script: false, style: false } });
  const attr = (selector: string, name: string) => doc.querySelector(selector)?.getAttribute(name)?.trim() ?? "";
  const title = (attr("meta[property='og:title']", "content") || doc.querySelector("title")?.text || "").trim();
  const description = attr("meta[name='description']", "content");
  const url = attr("link[rel='canonical']", "href") || origin;
  const lang = attr("html", "lang") || "en";
  const noindex = /noindex/i.test(attr("meta[name='robots']", "content"));
  const alternates = doc
    .querySelectorAll("link[rel='alternate'][hreflang]")
    .map((l) => ({ hreflang: l.getAttribute("hreflang") ?? "", href: l.getAttribute("href") ?? "" }))
    .filter((a) => a.hreflang && a.href);
  const modified = attr("meta[property='article:modified_time']", "content") || undefined;
  const root = doc.querySelector("[data-md-root]") ?? doc.querySelector("main") ?? doc.querySelector("body") ?? doc;

  const body = block(root, { origin, inListItem: false })
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  const front = [
    "---",
    `title: ${yaml(title)}`,
    description ? `description: ${yaml(description)}` : "",
    `url: ${url}`,
    `lang: ${lang}`,
    "---",
  ].filter(Boolean).join("\n");
  const heading = /^# /m.test(body) ? "" : `# ${title}\n\n`;
  return { markdown: `${front}\n\n${heading}${body}\n`, meta: { title, description, url, lang, noindex, alternates, modified } };
}

type Ctx = { origin: string; inListItem: boolean };

/** A YAML scalar: plain when that cannot be misread, otherwise double-quoted (a JSON string is valid YAML). */
function yaml(s: string) {
  const plain = /^[^\s\-?:,[\]{}#&*!|>'"%@`]/.test(s) && !/[:#"'\\\n]|\s$/.test(s);
  return plain ? s : JSON.stringify(s);
}

function isEl(n: Node): n is HTMLElement {
  return n.nodeType === 1;
}

function skipped(el: HTMLElement) {
  const tag = el.tagName?.toLowerCase() ?? "";
  if (SKIP.has(tag)) return true;
  if (el.hasAttribute("data-md-skip") || el.hasAttribute("hidden")) return true;
  if (el.getAttribute("aria-hidden") === "true") return true;
  const cls = el.getAttribute("class") ?? "";
  return /\bsr-only\b|\bskip-link\b/.test(cls);
}

function abs(href: string, origin: string) {
  if (!href) return href;
  if (/^(https?:|mailto:|tel:|#)/.test(href)) return href;
  try { return new URL(href, origin).toString(); } catch { return href; }
}

/**
 * Joins the inline output of sibling nodes. Astro strips the whitespace between tags, so two
 * adjacent elements (`<b>$500</b><span>per year</span>`) would glue their words together:
 * put a space between element outputs unless one side already has one.
 */
function joinInline(nodes: Node[], ctx: Ctx): string {
  let out = "";
  let prevWasEl = false;
  for (const n of nodes) {
    const piece = inline(n, ctx);
    if (!piece) continue;
    const el = isEl(n);
    if (el && prevWasEl && out && !/\s$/.test(out) && !/^[\s,.;:!?)\]]/.test(piece)) out += " ";
    out += piece;
    prevWasEl = el;
  }
  return out;
}

function inline(node: Node, ctx: Ctx): string {
  if (!isEl(node)) return (node.text ?? "").replace(/\s+/g, " ");
  if (skipped(node)) return "";
  const tag = node.tagName.toLowerCase();
  const inner = () => joinInline(node.childNodes, ctx);
  switch (tag) {
    case "br": return "\n";
    case "strong": case "b": { const t = inner().trim(); return t ? `**${t}**` : ""; }
    case "em": case "i": { const t = inner().trim(); return t ? `_${t}_` : ""; }
    case "code": return `\`${node.text.replace(/`/g, "\\`")}\``;
    case "kbd": return `\`${node.text}\``;
    case "a": {
      const text = inner().replace(/\s+/g, " ").trim();
      const href = abs(node.getAttribute("href") ?? "", ctx.origin);
      if (!text) return "";
      return href && !href.startsWith("#") ? `[${text}](${href})` : text;
    }
    case "img": {
      const alt = node.getAttribute("alt")?.trim();
      return alt ? `![${alt}](${abs(node.getAttribute("src") ?? "", ctx.origin)})` : "";
    }
    default:
      if (BLOCK.has(tag) || /^h[1-6]$/.test(tag) || STRUCTURAL.has(tag)) return ` ${block(node, ctx)} `;
      return inner();
  }
}

function headingText(el: HTMLElement, ctx: Ctx) {
  return joinInline(el.childNodes, ctx).replace(/\s+/g, " ").trim();
}

function block(el: HTMLElement, ctx: Ctx): string {
  const out: string[] = [];
  let run: Node[] = [];
  const flush = () => {
    const t = joinInline(run, ctx).split("\n").map((l) => l.replace(/\s+/g, " ").trim()).join("\n").trim();
    if (t) out.push(t);
    run = [];
  };

  for (const child of el.childNodes) {
    if (!isEl(child)) { run.push(child); continue; }
    if (skipped(child)) continue;
    const tag = child.tagName.toLowerCase();
    const h = /^h([1-6])$/.exec(tag);
    if (h) {
      flush();
      const text = headingText(child, ctx);
      // Inside a list item a Markdown heading reads badly ("- ### SaaS"); bold keeps the emphasis.
      if (text) out.push(ctx.inListItem ? `**${text}**` : `${"#".repeat(Number(h[1]))} ${text}`);
    } else if (tag === "ul" || tag === "ol") {
      flush();
      const md = list(child, ctx, tag === "ol");
      if (md) out.push(md);
    } else if (tag === "pre") {
      flush();
      out.push(codeBlock(child));
    } else if (tag === "blockquote") {
      flush();
      const quoted = block(child, ctx);
      if (quoted) out.push(quoted.split("\n").map((l) => (l ? `> ${l}` : ">")).join("\n"));
    } else if (tag === "hr") {
      flush();
      out.push("---");
    } else if (tag === "table") {
      flush();
      const md = table(child, ctx);
      if (md) out.push(md);
    } else if (tag === "dl") {
      flush();
      for (const item of child.childNodes.filter(isEl)) {
        const t = headingText(item, ctx);
        if (!t) continue;
        out.push(item.tagName.toLowerCase() === "dt" ? `**${t}**` : t);
      }
    } else if (tag === "summary") {
      flush();
      const t = headingText(child, ctx);
      if (t) out.push(`**${t}**`);
    } else if (BLOCK.has(tag)) {
      flush();
      const inner = block(child, ctx);
      if (inner) out.push(inner);
    } else {
      run.push(child);
    }
  }
  flush();
  return out.join("\n\n");
}

/**
 * A fenced block from `<pre>`: language from Shiki's `data-language` or a `language-x` class,
 * and a fence longer than any backtick run inside the code so it cannot close early.
 */
function codeBlock(pre: HTMLElement): string {
  const classes = `${pre.querySelector("code")?.getAttribute("class") ?? ""} ${pre.getAttribute("class") ?? ""}`;
  const lang = (pre.getAttribute("data-language") ?? /\blanguage-([\w+-]+)/.exec(classes)?.[1] ?? "").replace(/[^\w+-]/g, "");
  const code = pre.text.replace(/\n$/, "");
  const longestRun = Math.max(0, ...(code.match(/`+/g) ?? []).map((r) => r.length));
  const fence = "`".repeat(Math.max(3, longestRun + 1));
  return `${fence}${lang === "plaintext" ? "" : lang}\n${code}\n${fence}`;
}

/** Each item's first block sits on the marker line; later blocks are indented under it. */
function list(el: HTMLElement, ctx: Ctx, ordered: boolean): string {
  const items = el.childNodes.filter(isEl).filter((c) => c.tagName.toLowerCase() === "li" && !skipped(c));
  return items
    .map((li, i) => {
      const marker = ordered ? `${i + 1}.` : "-";
      const indent = " ".repeat(marker.length + 1);
      const body = block(li, { ...ctx, inListItem: true }).replace(/\n{2,}/g, "\n");
      if (!body) return "";
      return `${marker} ${body.split("\n").map((line, k) => (k === 0 || !line ? line : `${indent}${line}`)).join("\n")}`;
    })
    .filter(Boolean)
    .join("\n");
}

function table(el: HTMLElement, ctx: Ctx): string {
  const rows = el.querySelectorAll("tr").map((tr) => tr.querySelectorAll("th,td").map((c) => joinInline(c.childNodes, ctx).replace(/\s+/g, " ").replace(/\|/g, "\\|").trim()));
  if (!rows.length) return "";
  const width = Math.max(...rows.map((r) => r.length));
  const norm = rows.map((r) => [...r, ...Array(width - r.length).fill("")]);
  const [head, ...rest] = norm;
  return [`| ${head.join(" | ")} |`, `| ${head.map(() => "---").join(" | ")} |`, ...rest.map((r) => `| ${r.join(" | ")} |`)].join("\n");
}
