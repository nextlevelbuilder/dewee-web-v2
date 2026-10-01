/**
 * The small Markdown subset agent replies use, rendered as DOM nodes (never innerHTML, so a
 * reply cannot inject markup): paragraphs, "-", "*" and "1." lists, "#" headings (shown as bold
 * lines), ``` code blocks, **bold**, *italic*, `code`, [label](https://…) and bare http(s) links.
 * parseMarkdown is pure so it can be tested without a DOM; renderMarkdown builds the nodes.
 */
import { linkSegments } from "./chat-widget-links";

export type Inline =
  | { kind: "text"; text: string }
  | { kind: "strong" | "em"; children: Inline[] }
  | { kind: "code"; text: string }
  | { kind: "link"; href: string; children: Inline[] };

export type Block =
  | { kind: "p"; children: Inline[] }
  | { kind: "h"; children: Inline[] }
  | { kind: "ul"; items: Inline[][] }
  | { kind: "ol"; items: Inline[][] }
  | { kind: "pre"; text: string };

const BULLET = /^\s*[-*•+]\s+(.*)$/;
const NUMBERED = /^\s*\d+[.)]\s+(.*)$/;
const HEADING = /^\s*#{1,6}\s+(.*)$/;
const FENCE = /^\s*```/;
/** Inline code, strong (double asterisks or underscores), em (single), [label](url): earliest match wins. */
const INLINE = /`([^`\n]+)`|\*\*([^\n]+?)\*\*|__([^\n]+?)__|\*([^*\s][^*\n]*?)\*|(?<![\w])_([^_\s][^_\n]*?)_(?![\w])|\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/;

function textRuns(text: string): Inline[] {
  return linkSegments(text).map((seg) =>
    seg.href ? { kind: "link", href: seg.href, children: [{ kind: "text", text: seg.text }] } : { kind: "text", text: seg.text },
  );
}

export function parseInline(text: string): Inline[] {
  const out: Inline[] = [];
  let rest = text;
  for (;;) {
    const m = INLINE.exec(rest);
    if (!m) break;
    if (m.index > 0) out.push(...textRuns(rest.slice(0, m.index)));
    if (m[1] !== undefined) out.push({ kind: "code", text: m[1] });
    else if (m[2] !== undefined || m[3] !== undefined) out.push({ kind: "strong", children: parseInline(m[2] ?? m[3]) });
    else if (m[4] !== undefined || m[5] !== undefined) out.push({ kind: "em", children: parseInline(m[4] ?? m[5]) });
    else {
      let href = "";
      try { href = new URL(m[7]).href; } catch { /* not a URL: keep the label as text */ }
      out.push(href ? { kind: "link", href, children: parseInline(m[6]) } : { kind: "text", text: m[6] });
    }
    rest = rest.slice(m.index + m[0].length);
  }
  if (rest) out.push(...textRuns(rest));
  return out;
}

export function parseMarkdown(src: string): Block[] {
  const blocks: Block[] = [];
  const lines = src.replace(/\r\n?/g, "\n").split("\n");
  let para: string[] = [];
  const flush = () => {
    if (para.length) blocks.push({ kind: "p", children: parseInline(para.join("\n")) });
    para = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (FENCE.test(line)) {
      flush();
      const code: string[] = [];
      // An unclosed fence (a reply still streaming in) runs to the end.
      while (++i < lines.length && !FENCE.test(lines[i])) code.push(lines[i]);
      blocks.push({ kind: "pre", text: code.join("\n") });
      continue;
    }
    if (!line.trim()) { flush(); continue; }
    const h = HEADING.exec(line);
    if (h) { flush(); blocks.push({ kind: "h", children: parseInline(h[1]) }); continue; }
    const bullet = BULLET.exec(line);
    const num = bullet ? null : NUMBERED.exec(line);
    if (bullet || num) {
      flush();
      const kind = bullet ? "ul" : "ol";
      const last = blocks[blocks.length - 1];
      const item = parseInline((bullet ?? num)![1]);
      if (last && (last.kind === "ul" || last.kind === "ol") && last.kind === kind) last.items.push(item);
      else blocks.push({ kind, items: [item] });
      continue;
    }
    para.push(line.trim());
  }
  flush();
  return blocks;
}

/** Appends nodes one by one (the DOM typings reject spreading an array into append). */
export function appendNodes(parent: Node, nodes: Node[]): void {
  for (const node of nodes) parent.appendChild(node);
}

function inlineNodes(items: Inline[]): Node[] {
  return items.map((it) => {
    if (it.kind === "text") return document.createTextNode(it.text);
    if (it.kind === "code") {
      const el = document.createElement("code");
      el.textContent = it.text;
      return el;
    }
    const el = document.createElement(it.kind === "link" ? "a" : it.kind);
    if (it.kind === "link") {
      const a = el as HTMLAnchorElement;
      a.href = it.href;
      a.target = "_blank";
      a.rel = "noopener";
    }
    appendNodes(el, inlineNodes(it.children));
    return el;
  });
}

/** Agent reply as DOM nodes, ready to append inside the message bubble. */
export function renderMarkdown(src: string): Node[] {
  return parseMarkdown(src).map((b) => {
    if (b.kind === "pre") {
      const pre = document.createElement("pre");
      pre.textContent = b.text;
      return pre;
    }
    if (b.kind === "ul" || b.kind === "ol") {
      const list = document.createElement(b.kind);
      for (const item of b.items) {
        const li = document.createElement("li");
        appendNodes(li, inlineNodes(item));
        list.appendChild(li);
      }
      return list;
    }
    const p = document.createElement("p");
    if (b.kind === "h") p.className = "msg__h";
    appendNodes(p, inlineNodes(b.children));
    return p;
  });
}
