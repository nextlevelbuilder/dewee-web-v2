/** Plain-text chat messages with their http(s) links made clickable (no other scheme, no HTML). */

/** An http(s) URL in running text, without trailing punctuation that ends the sentence. */
const URL_RE = /\bhttps?:\/\/[^\s<>"']+[^\s<>"'.,;:!?)\]]/g;

/** Splits message text into plain runs and http(s) links (never any other scheme). */
export function linkSegments(text: string): { text: string; href?: string }[] {
  const out: { text: string; href?: string }[] = [];
  let at = 0;
  for (const match of text.matchAll(URL_RE)) {
    let href: string;
    try { href = new URL(match[0]).href; } catch { continue; }
    if (match.index > at) out.push({ text: text.slice(at, match.index) });
    out.push({ text: match[0], href });
    at = match.index + match[0].length;
  }
  if (at < text.length) out.push({ text: text.slice(at) });
  return out;
}

/** Message text as DOM nodes: links open in a new tab so the conversation stays in view. */
export function textWithLinks(text: string): Node[] {
  return linkSegments(text).map((seg) => {
    if (!seg.href) return document.createTextNode(seg.text);
    const a = document.createElement("a");
    a.href = seg.href;
    a.textContent = seg.text;
    a.target = "_blank";
    a.rel = "noopener";
    return a;
  });
}
