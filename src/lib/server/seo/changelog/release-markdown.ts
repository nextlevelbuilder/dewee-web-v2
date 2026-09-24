/**
 * Release notes Markdown → HTML for the changelog page and the Atom feed. Notes are sanitised
 * before storage, and this renderer is the second guard: raw HTML is shown as text, only
 * http(s)/mailto/relative links survive, images become their alt text, and headings are demoted
 * so they sit under the page's own release headings (h3).
 */
import { Marked, type Tokens } from "marked";

const escapeHtml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** Allowed link targets: http(s), mailto, same-site paths and fragments. */
export function safeHref(href: string | null | undefined): string | null {
  const raw = (href ?? "").trim();
  if (!raw) return null;
  if (/^(?:\/(?!\/)|#)/.test(raw)) return raw;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" || url.protocol === "http:" || url.protocol === "mailto:" ? url.toString() : null;
  } catch {
    return null;
  }
}

const marked = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    html({ text }: Tokens.HTML | Tokens.Tag) {
      return escapeHtml(text);
    },
    heading({ tokens, depth }: Tokens.Heading) {
      const level = Math.min(6, Math.max(4, depth + 2));
      return `<h${level}>${this.parser.parseInline(tokens)}</h${level}>\n`;
    },
    link({ href, title, tokens }: Tokens.Link) {
      const text = this.parser.parseInline(tokens);
      const safe = safeHref(href);
      if (!safe) return text;
      const external = /^https?:/.test(safe);
      const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
      return `<a href="${escapeHtml(safe)}"${titleAttr}${external ? ' rel="nofollow noopener"' : ""}>${text}</a>`;
    },
    image({ text }: Tokens.Image) {
      return escapeHtml(text);
    },
  },
});

export function renderReleaseNotes(markdown: string): string {
  if (!markdown.trim()) return "";
  return marked.parse(markdown, { async: false });
}
