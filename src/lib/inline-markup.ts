/**
 * Tiny, safe inline markup for headings and short copy (static content and page-builder blocks):
 *   *word*      → <em> (italic accent in display type)
 *   ==phrase==  → highlighter mark
 *   ~~word~~    → hand-drawn scribble underline that writes itself on reveal
 *   [text](url) → link (http(s), mailto, or site-relative only)
 * Everything else is HTML-escaped, so admins and agents cannot inject markup.
 */
const ESC: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ESC[c]);
}

const SCRIBBLE = '<svg viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M2 8 C 22 3, 44 11, 62 6 S 90 4, 98 7"/></svg>';

export function inlineMarkup(input: string): string {
  let s = escapeHtml(input);
  s = s.replace(/\[([^\]]+)\]\(((?:https?:\/\/|mailto:|\/)[^)\s]*)\)/g, (_m, text, href) => `<a href="${href}">${text}</a>`);
  s = s.replace(/==(.+?)==/g, '<span class="mark">$1</span>');
  s = s.replace(/~~(.+?)~~/g, `<span class="scribble">$1${SCRIBBLE}</span>`);
  s = s.replace(/(^|[\s(“"'>])\*(?!\s)(.+?)(?<!\s)\*(?=$|[\s.,;:!?)”"'<])/g, "$1<em>$2</em>");
  return s;
}
