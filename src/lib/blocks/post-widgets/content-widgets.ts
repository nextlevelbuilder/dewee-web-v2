/**
 * Page-builder blocks reused inside blog posts, rendered at reading width ("prose width"):
 * Image, Callout, Quote, Steps, Timeline, Faq, Columns and Divider. Same props and the same
 * schema as on pages (the registry validates both); a post lays them out in one column, so
 * `Image.size` is ignored and block headings become h2 so heading levels never skip.
 */
import { inlineMarkup } from "../../inline-markup";
import { renderMarkdown } from "../safe-markdown";
import type { PostWidget } from "./post-widget-types";
import { blockHeading, esc, icon } from "./widget-html";

type Props = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" ? v : "");
const list = <T>(v: unknown) => (Array.isArray(v) ? (v as T[]) : []);

/** `> ` before every line, so multi-line text stays inside the Markdown quote. */
export const quoteLines = (text: string) => text.split("\n").map((l) => (l ? `> ${l}` : ">")).join("\n");

const headingMd = (p: Props) => {
  const h = p.heading as { title?: string; lede?: string } | undefined;
  return h?.title ? `## ${h.title}\n\n${h.lede ? `${h.lede}\n\n` : ""}` : "";
};

const CALLOUT_ICON = { note: "info", tip: "lightbulb", warning: "triangle-alert", success: "circle-check" } as const;

export const CONTENT_WIDGETS: Record<string, PostWidget> = {
  Image: {
    html: (p) => {
      const caption = str(p.caption);
      const size = typeof p.pixelWidth === "number" && typeof p.pixelHeight === "number" ? ` width="${p.pixelWidth}" height="${p.pixelHeight}"` : "";
      return `<figure class="pw-image"><img src="${esc(str(p.src))}" alt="${esc(str(p.alt))}"${size} loading="lazy" decoding="async" />${caption ? `<figcaption>${esc(caption)}</figcaption>` : ""}</figure>`;
    },
    markdown: (p) => `![${str(p.alt)}](${str(p.src)})${p.caption ? `\n\n_${str(p.caption)}_` : ""}`,
  },
  Callout: {
    html: (p) => {
      const tone = (str(p.tone) || "note") as keyof typeof CALLOUT_ICON;
      const title = str(p.title);
      return (
        `<aside class="pw-callout pw-callout--${esc(tone)}" role="note"><span class="pw-callout__icon">${icon(CALLOUT_ICON[tone] ?? "info", 20)}</span>` +
        `<div class="pw-callout__text">${title ? `<p class="pw-callout__title">${esc(title)}</p>` : ""}<p>${inlineMarkup(str(p.body))}</p></div></aside>`
      );
    },
    markdown: (p) => quoteLines(`${p.title ? `**${str(p.title)}**\n\n` : ""}${str(p.body)}`),
  },
  Quote: {
    html: (p) => {
      const cite = str(p.cite);
      const role = str(p.role);
      const by = cite ? `<figcaption><b>${esc(cite)}</b>${role ? `<span>${esc(role)}</span>` : ""}</figcaption>` : "";
      return `<figure class="pw-quote"><blockquote><p>${esc(str(p.text))}</p></blockquote>${by}</figure>`;
    },
    markdown: (p) => quoteLines(`${str(p.text)}${p.cite ? `\n\n— ${str(p.cite)}${p.role ? `, ${str(p.role)}` : ""}` : ""}`),
  },
  Steps: {
    html: (p) => {
      const items = list<{ title: string; body: string }>(p.items);
      const hl = typeof p.highlight === "number" ? p.highlight : -1;
      const note = str(p.highlightNote);
      const lis = items
        .map(
          (it, i) =>
            `<li class="pw-steps__item${i === hl ? " pw-steps__item--hl" : ""}"><p class="pw-steps__label">${esc(str(p.label))} ${i + 1}</p>` +
            `<p class="pw-steps__title">${inlineMarkup(it.title)}</p><p class="pw-steps__body">${esc(it.body)}</p>` +
            `${i === hl && note ? `<p class="note pw-steps__note" aria-hidden="true">${esc(note)}</p>` : ""}</li>`,
        )
        .join("");
      return `${blockHeading(p.heading, inlineMarkup)}<ol class="pw-steps" role="list">${lis}</ol>`;
    },
    markdown: (p) => headingMd(p) + list<{ title: string; body: string }>(p.items).map((it, i) => `${i + 1}. **${it.title}**: ${it.body}`).join("\n"),
  },
  Timeline: {
    html: (p) => {
      const items = list<{ date: string; text: string }>(p.items);
      const label = str(p.label);
      const lis = items.map((it) => `<li><time class="pw-timeline__date">${esc(it.date)}</time><p>${esc(it.text)}</p></li>`).join("");
      return `${blockHeading(p.heading, inlineMarkup)}<ol class="pw-timeline" role="list"${label ? ` aria-label="${esc(label)}"` : ""}>${lis}</ol>`;
    },
    markdown: (p) => headingMd(p) + list<{ date: string; text: string }>(p.items).map((it) => `- **${it.date}**: ${it.text}`).join("\n"),
  },
  Faq: {
    html: (p) => {
      const items = list<{ q: string; a: string }>(p.items);
      const rows = items
        .map((it) => `<details class="pw-faq__item"><summary><span>${esc(it.q)}</span>${icon("plus", 18)}</summary><p>${esc(it.a)}</p></details>`)
        .join("");
      return `${blockHeading(p.heading, inlineMarkup)}<div class="pw-faq">${rows}</div>`;
    },
    markdown: (p) => headingMd(p) + list<{ q: string; a: string }>(p.items).map((it) => `**${it.q}**\n\n${it.a}`).join("\n\n"),
  },
  Columns: {
    html: (p) => {
      const cols = list<{ title?: string; markdown: string }>(p.columns);
      const body = cols
        .map((c) => `<div class="pw-columns__col">${c.title ? `<p class="pw-columns__title">${esc(c.title)}</p>` : ""}${renderMarkdown(c.markdown)}</div>`)
        .join("");
      return `${blockHeading(p.heading, inlineMarkup)}<div class="pw-columns">${body}</div>`;
    },
    markdown: (p) => headingMd(p) + list<{ title?: string; markdown: string }>(p.columns).map((c) => `${c.title ? `**${c.title}**\n\n` : ""}${c.markdown}`).join("\n\n"),
  },
  Divider: {
    html: (p) => {
      const label = str(p.label);
      return label ? `<div class="pw-divider" role="separator"><span>${esc(label)}</span></div>` : `<hr class="pw-divider" />`;
    },
    markdown: () => "---",
  },
};
