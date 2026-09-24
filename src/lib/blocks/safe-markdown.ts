/**
 * Markdown → HTML for page-builder RichText/Columns and blog bodies (isomorphic).
 * Users never get raw HTML: HTML tokens are escaped and shown as text, links are limited to
 * site paths, anchors, http(s) and mailto, and images to https:// or /media/ sources.
 * Headings get stable ids, and a Markdown `#` is demoted to h2 because the page owns the h1.
 */
import { Marked, type Tokens } from "marked";
import { escapeHtml } from "../inline-markup";
import { isSafeHref, isSafeImageSrc } from "./block-fields";

export function headingId(text: string): string {
  return (
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[đĐ]/g, "d")
      .toLowerCase()
      .replace(/<[^>]*>/g, "")
      .replace(/&[a-z#0-9]+;/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "section"
  );
}

function createRenderer() {
  const seen = new Map<string, number>();
  const marked = new Marked({
    gfm: true,
    breaks: false,
    async: false,
    renderer: {
      html({ text }: Tokens.HTML | Tokens.Tag) {
        return escapeHtml(text);
      },
      heading({ tokens, depth }: Tokens.Heading) {
        const inner = this.parser.parseInline(tokens);
        const level = Math.min(Math.max(depth, 2), 4);
        const base = headingId(inner);
        const n = seen.get(base) ?? 0;
        seen.set(base, n + 1);
        return `<h${level} id="${n ? `${base}-${n}` : base}">${inner}</h${level}>\n`;
      },
      link({ href, title, tokens }: Tokens.Link) {
        const inner = this.parser.parseInline(tokens);
        if (!href || !isSafeHref(href)) return inner;
        const external = /^https?:\/\//.test(href);
        const t = title ? ` title="${escapeHtml(title)}"` : "";
        return `<a href="${escapeHtml(href)}"${t}${external ? ' rel="noopener"' : ""}>${inner}</a>`;
      },
      image({ href, title, text }: Tokens.Image) {
        if (!href || !isSafeImageSrc(href)) return escapeHtml(text);
        const t = title ? ` title="${escapeHtml(title)}"` : "";
        return `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}"${t} loading="lazy" decoding="async" />`;
      },
    },
  });
  return marked;
}

/** Renders untrusted Markdown to safe HTML. A fresh renderer per call keeps heading ids unique per document. */
export function renderMarkdown(source: string): string {
  return createRenderer().parse(source ?? "", { async: false }) as string;
}

/** Headings (h2/h3) for an on-this-page list, in document order. */
export function markdownHeadings(source: string): { depth: number; text: string; id: string }[] {
  const html = renderMarkdown(source);
  const out: { depth: number; text: string; id: string }[] = [];
  for (const m of html.matchAll(/<h([23]) id="([^"]+)">([\s\S]*?)<\/h\1>/g)) {
    out.push({ depth: Number(m[1]), id: m[2], text: m[3].replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">") });
  }
  return out;
}

/** Whole minutes at ~220 words per minute, never less than one. */
export function readingMinutes(source: string): number {
  const words = (source ?? "").replace(/```[\s\S]*?```/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
