/**
 * Comparison widgets for posts. ComparisonTable is a real <table> (options as columns, criteria
 * as rows) inside its own scroll box, so a wide table never widens the page; yes/no/partial marks
 * are icons with their word next to them for screen readers and feeds. BeforeAfter shows two
 * images side by side; post-widgets-client.ts stacks them behind a range slider when it runs.
 */
import { mdCell } from "./chart-widget";
import type { PostWidget } from "./post-widget-types";
import { attrs, esc, fill, icon, type WidgetLabels } from "./widget-html";

type Mark = "yes" | "no" | "partial";
type Cell = string | { mark: Mark; text?: string };
type Table = { title: string; criterionHeading?: string; columns: string[]; rows: { criterion: string; cells: Cell[] }[]; highlight?: number; highlightLabel?: string; caption?: string };
type Side = { src: string; alt: string; label?: string };
type BeforeAfter = { before: Side; after: Side; caption?: string; start?: number; pixelWidth?: number; pixelHeight?: number };

const MARK_ICON = { yes: "check", no: "x", partial: "minus" } as const;
const markWord = (mark: Mark, labels: WidgetLabels) => ({ yes: labels.markYes, no: labels.markNo, partial: labels.markPartial })[mark];

function cellHtml(cell: Cell, labels: WidgetLabels): string {
  if (typeof cell === "string") return esc(cell);
  const word = markWord(cell.mark, labels);
  return (
    `<span class="pw-mark pw-mark--${cell.mark}">${icon(MARK_ICON[cell.mark], 16)}` +
    (cell.text ? `<span class="visually-hidden">${esc(word)}:</span>` : `<span class="pw-mark__word">${esc(word)}</span>`) +
    `</span>${cell.text ? ` <span class="pw-mark__text">${esc(cell.text)}</span>` : ""}`
  );
}

function cellText(cell: Cell, labels: WidgetLabels): string {
  if (typeof cell === "string") return cell;
  const word = markWord(cell.mark, labels);
  return cell.text ? `${word}: ${cell.text}` : word;
}

const comparisonTable: PostWidget = {
  html: (props, { labels }) => {
    const t = props as Table;
    const hl = t.highlight;
    const pick = t.highlightLabel || labels.recommended;
    const cls = (i: number) => (i === hl ? ` class="pw-compare__hl"` : "");
    const head = t.columns
      .map((c, i) => `<th scope="col"${cls(i)}>${esc(c)}${i === hl ? ` <span class="pw-compare__pick"><span class="visually-hidden">(</span>${esc(pick)}<span class="visually-hidden">)</span></span>` : ""}</th>`)
      .join("");
    const rows = t.rows
      .map((r) => `<tr><th scope="row">${esc(r.criterion)}</th>${r.cells.map((c, i) => `<td${cls(i)}>${cellHtml(c, labels)}</td>`).join("")}</tr>`)
      .join("");
    return (
      `<figure class="pw-compare"><div class="pw-scroll" role="region" tabindex="0" aria-label="${esc(t.title)}">` +
      `<table class="pw-table pw-compare__table"><caption>${esc(t.title)}</caption>` +
      `<thead><tr><th scope="col">${esc(t.criterionHeading || labels.criterion)}</th>${head}</tr></thead><tbody>${rows}</tbody></table></div>` +
      `${t.caption ? `<figcaption>${esc(t.caption)}</figcaption>` : ""}</figure>`
    );
  },
  markdown: (props, { labels }) => {
    const t = props as Table;
    const pick = t.highlightLabel || labels.recommended;
    const row = (cells: string[]) => `| ${cells.map(mdCell).join(" | ")} |`;
    return [
      `**${t.title}**`,
      "",
      row([t.criterionHeading || labels.criterion, ...t.columns.map((c, i) => (i === t.highlight ? `${c} (${pick})` : c))]),
      `|${" --- |".repeat(t.columns.length + 1)}`,
      ...t.rows.map((r) => row([r.criterion, ...r.cells.map((c) => cellText(c, labels))])),
      ...(t.caption ? ["", `_${t.caption}_`] : []),
    ].join("\n");
  },
};

const side = (s: Side, which: "before" | "after", fallback: string, size: Record<string, number | undefined>) =>
  `<figure class="pw-ba__item pw-ba__${which}"><img${attrs({ src: s.src, alt: s.alt, ...size, loading: "lazy", decoding: "async" })} />` +
  `<figcaption class="pw-ba__label">${esc(s.label || fallback)}</figcaption></figure>`;

const beforeAfter: PostWidget = {
  html: (props, { labels }) => {
    const b = props as BeforeAfter;
    const start = b.start ?? 50;
    const size = { width: b.pixelWidth, height: b.pixelHeight };
    const ratio = b.pixelWidth && b.pixelHeight ? `--pw-ba-ratio: ${b.pixelWidth} / ${b.pixelHeight}; ` : "";
    return (
      `<figure class="pw-ba"${attrs({ "data-pw-compare": "", "data-valuetext": labels.compareValue, style: `${ratio}--pw-ba-pos: ${start}%` })}>` +
      `<div class="pw-ba__stage">${side(b.before, "before", labels.before, size)}${side(b.after, "after", labels.after, size)}</div>` +
      `<input class="pw-ba__range" type="range" min="0" max="100" step="1"${attrs({ value: start, "aria-label": labels.compareSlider, "aria-valuetext": fill(labels.compareValue, { before: start, after: 100 - start }) })} data-pw-compare-range hidden />` +
      `${b.caption ? `<figcaption class="pw-ba__caption">${esc(b.caption)}</figcaption>` : ""}</figure>`
    );
  },
  markdown: (props, { labels }) => {
    const b = props as BeforeAfter;
    const line = (s: Side, fallback: string) => `**${s.label || fallback}:** ![${s.alt}](${s.src})`;
    return [line(b.before, labels.before), line(b.after, labels.after), ...(b.caption ? [`_${b.caption}_`] : [])].join("\n\n");
  },
};

export const COMPARISON_WIDGETS: Record<string, PostWidget> = { ComparisonTable: comparisonTable, BeforeAfter: beforeAfter };
