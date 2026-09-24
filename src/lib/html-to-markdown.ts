/**
 * Turns a rendered dewee page into clean Markdown for agents and "Copy as Markdown".
 * Shared by the worker (runtime twins) and scripts/postbuild (static twins), so it only uses
 * relative imports and erasable TypeScript (Node runs it directly with type stripping).
 *
 * Rules: read `<main>` (or `[data-md-root]`), drop chrome and anything marked `data-md-skip`,
 * keep headings, lists, links (absolute), code, quotes, tables and image alt text.
 */
import { parse, type HTMLElement, type Node } from "node-html-parser";

const SKIP = new Set(["script", "style", "noscript", "svg", "template", "button", "form", "nav", "iframe", "canvas", "video", "audio", "select", "input", "textarea", "dialog"]);
const BLOCK = new Set(["p", "div", "section", "article", "header", "footer", "aside", "figure", "figcaption", "main", "details", "summary", "dl", "address"]);

export type MarkdownMeta = { title: string; description: string; url: string; lang: string };

export function htmlToMarkdown(html: string, origin: string): { markdown: string; meta: MarkdownMeta } {
  const doc = parse(html, { comment: false, blockTextElements: { script: false, style: false, pre: true } });
  const title = (doc.querySelector("meta[property='og:title']")?.getAttribute("content") || doc.querySelector("title")?.text || "").trim();
  const description = doc.querySelector("meta[name='description']")?.getAttribute("content")?.trim() ?? "";
  const url = doc.querySelector("link[rel='canonical']")?.getAttribute("href") ?? origin;
  const lang = doc.querySelector("html")?.getAttribute("lang") ?? "en";
  const root = doc.querySelector("[data-md-root]") ?? doc.querySelector("main") ?? doc.querySelector("body") ?? doc;

  const ctx = { origin, listDepth: 0 };
  let body = block(root, ctx);
  body = body.replace(/\n{3,}/g, "\n\n").replace(/[ \t]+\n/g, "\n").trim();

  const front = [
    "---",
    `title: ${yaml(title)}`,
    description ? `description: ${yaml(description)}` : "",
    `url: ${url}`,
    `lang: ${lang}`,
    "---",
  ].filter(Boolean).join("\n");
  const heading = body.startsWith("# ") ? "" : `# ${title}\n\n`;
  return { markdown: `${front}\n\n${heading}${body}\n`, meta: { title, description, url, lang } };
}

type Ctx = { origin: string; listDepth: number };

function yaml(s: string) {
  return /[:#"'\n]/.test(s) ? JSON.stringify(s) : s;
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

function inline(node: Node, ctx: Ctx): string {
  if (!isEl(node)) return (node.text ?? "").replace(/\s+/g, " ");
  if (skipped(node)) return "";
  const tag = node.tagName.toLowerCase();
  const inner = () => node.childNodes.map((c) => inline(c, ctx)).join("");
  switch (tag) {
    case "br": return "\n";
    case "strong": case "b": { const t = inner().trim(); return t ? `**${t}**` : ""; }
    case "em": case "i": { const t = inner().trim(); return t ? `_${t}_` : ""; }
    case "code": return `\`${node.text.replace(/`/g, "\\`")}\``;
    case "kbd": return `\`${node.text}\``;
    case "a": {
      const text = inner().trim();
      const href = abs(node.getAttribute("href") ?? "", ctx.origin);
      if (!text) return "";
      return href && !href.startsWith("#") ? `[${text}](${href})` : text;
    }
    case "img": {
      const alt = node.getAttribute("alt")?.trim();
      return alt ? `![${alt}](${abs(node.getAttribute("src") ?? "", ctx.origin)})` : "";
    }
    default:
      if (BLOCK.has(tag) || /^h[1-6]$/.test(tag) || ["ul", "ol", "table", "pre", "blockquote", "hr"].includes(tag)) return ` ${block(node, ctx)} `;
      return inner();
  }
}

function block(el: HTMLElement, ctx: Ctx): string {
  const out: string[] = [];
  let run = "";
  const flush = () => { const t = run.replace(/\s+/g, " ").trim(); if (t) out.push(t); run = ""; };

  for (const child of el.childNodes) {
    if (!isEl(child)) { run += child.text ?? ""; continue; }
    if (skipped(child)) continue;
    const tag = child.tagName.toLowerCase();
    const h = /^h([1-6])$/.exec(tag);
    if (h) {
      flush();
      const text = child.childNodes.map((c) => inline(c, ctx)).join("").replace(/\s+/g, " ").trim();
      if (text) out.push(`${"#".repeat(Number(h[1]))} ${text}`);
    } else if (tag === "ul" || tag === "ol") {
      flush();
      out.push(list(child, ctx, tag === "ol"));
    } else if (tag === "pre") {
      flush();
      const lang = (child.querySelector("code")?.getAttribute("class") ?? child.getAttribute("data-lang") ?? "").match(/language-([\w-]+)/)?.[1] ?? "";
      out.push(`\`\`\`${lang}\n${child.text.replace(/\n$/, "")}\n\`\`\``);
    } else if (tag === "blockquote") {
      flush();
      out.push(block(child, ctx).split("\n").map((l) => `> ${l}`).join("\n"));
    } else if (tag === "hr") {
      flush();
      out.push("---");
    } else if (tag === "table") {
      flush();
      out.push(table(child, ctx));
    } else if (tag === "dl") {
      flush();
      for (const item of child.childNodes.filter(isEl)) {
        const t = item.childNodes.map((c) => inline(c, ctx)).join("").replace(/\s+/g, " ").trim();
        if (!t) continue;
        out.push(item.tagName.toLowerCase() === "dt" ? `**${t}**` : t);
      }
    } else if (BLOCK.has(tag) || tag === "li") {
      flush();
      const inner = block(child, ctx);
      if (inner) out.push(inner);
    } else {
      run += inline(child, ctx);
    }
  }
  flush();
  return out.join("\n\n");
}

function list(el: HTMLElement, ctx: Ctx, ordered: boolean): string {
  const items = el.childNodes.filter(isEl).filter((c) => c.tagName.toLowerCase() === "li" && !skipped(c));
  const pad = "  ".repeat(ctx.listDepth);
  return items.map((li, i) => {
    const marker = ordered ? `${i + 1}.` : "-";
    const nested = li.childNodes.filter(isEl).filter((c) => ["ul", "ol"].includes(c.tagName.toLowerCase()));
    const text = block(li, { ...ctx, listDepth: ctx.listDepth + 1 })
      .split("\n\n")
      .filter((part) => !nested.length || !/^\s*(-|\d+\.)\s/.test(part))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    const sub = nested.map((n) => list(n, { ...ctx, listDepth: ctx.listDepth + 1 }, n.tagName.toLowerCase() === "ol")).join("\n");
    return `${pad}${marker} ${text}${sub ? `\n${sub}` : ""}`;
  }).join("\n");
}

function table(el: HTMLElement, ctx: Ctx): string {
  const rows = el.querySelectorAll("tr").map((tr) => tr.querySelectorAll("th,td").map((c) => c.childNodes.map((n) => inline(n, ctx)).join("").replace(/\s+/g, " ").replace(/\|/g, "\\|").trim()));
  if (!rows.length) return "";
  const width = Math.max(...rows.map((r) => r.length));
  const norm = rows.map((r) => [...r, ...Array(width - r.length).fill("")]);
  const [head, ...rest] = norm;
  return [`| ${head.join(" | ")} |`, `| ${head.map(() => "---").join(" | ")} |`, ...rest.map((r) => `| ${r.join(" | ")} |`)].join("\n");
}
