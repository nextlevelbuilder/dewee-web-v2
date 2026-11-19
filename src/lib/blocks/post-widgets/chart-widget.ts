/**
 * The Chart widget: an inline SVG (chart-svg.ts) named by its <title> and summarised by its
 * <desc>, a legend in HTML so it stays readable on a phone, and the exact numbers in a real
 * <table> under "View data". Feeds and the `.md` twin get the same table in Markdown.
 */
import { chartShapes, LINE_DASHES, type ChartData } from "./chart-svg";
import type { PostWidget } from "./post-widget-types";
import { esc, fill, type WidgetLabels } from "./widget-html";

type Chart = ChartData & { title: string; unit?: string; labelHeading?: string; caption?: string; source?: string; sourceUrl?: string };

const isRadial = (c: Chart) => c.kind === "pie" || c.kind === "donut";

function numberFormats(labels: WidgetLabels) {
  const make = (opts: Intl.NumberFormatOptions) => {
    try {
      return new Intl.NumberFormat(labels.numberLocale || "en-US", opts);
    } catch {
      return new Intl.NumberFormat("en-US", opts);
    }
  };
  const plain = make({ maximumFractionDigits: 2 });
  const compact = make({ notation: "compact", maximumFractionDigits: 1 });
  const pct = make({ style: "percent", maximumFractionDigits: 1 });
  return {
    num: (n: number) => plain.format(n),
    tick: (n: number) => (Math.abs(n) >= 10_000 ? compact.format(n) : plain.format(n)),
    pct: (share: number) => pct.format(share),
  };
}

/** "12%" for a percent sign, "12 teams" for a word. */
const withUnit = (value: string, unit?: string) => (!unit ? value : unit === "%" ? `${value}%` : `${value} ${unit}`);
const header = (name: string, unit?: string) => (unit ? `${name} (${unit})` : name);

function shares(c: Chart): number[] {
  const values = c.series[0]?.values ?? [];
  const total = values.reduce((a, v) => a + Math.max(0, v), 0);
  return values.map((v) => (total > 0 ? Math.max(0, v) / total : 0));
}

/** The <desc>: what kind of chart, and the extremes of each series (pie: every slice). */
function description(c: Chart, labels: WidgetLabels, f: ReturnType<typeof numberFormats>): string {
  const kind = { bar: labels.chartBar, line: labels.chartLine, pie: labels.chartPie, donut: labels.chartDonut }[c.kind];
  if (isRadial(c)) {
    const share = shares(c);
    return `${kind}. ${c.labels.map((l, i) => `${l}: ${withUnit(f.num(c.series[0].values[i]), c.unit)} (${f.pct(share[i])})`).join(", ")}.`;
  }
  const ranges = c.series.map((s) => {
    const min = s.values.indexOf(Math.min(...s.values));
    const max = s.values.indexOf(Math.max(...s.values));
    return fill(labels.chartRange, { series: s.name, min: withUnit(f.num(s.values[min]), c.unit), minLabel: c.labels[min], max: withUnit(f.num(s.values[max]), c.unit), maxLabel: c.labels[max] });
  });
  return `${kind}, ${c.labels[0]} – ${c.labels[c.labels.length - 1]}. ${ranges.join("; ")}.`;
}

function legend(c: Chart, f: ReturnType<typeof numberFormats>): string {
  if (isRadial(c)) {
    const share = shares(c);
    const items = c.labels.map((l, i) => `<li><span class="pw-chart__key pw-chart__c${i + 1}" aria-hidden="true"></span>${esc(l)} <span class="pw-chart__num">${esc(f.pct(share[i]))}</span></li>`);
    return `<ul class="pw-chart__legend" role="list">${items.join("")}</ul>`;
  }
  if (c.series.length < 2) return "";
  const key = (i: number) =>
    c.kind === "line"
      ? `<svg class="pw-chart__swatch" viewBox="0 0 24 8" width="24" height="8" aria-hidden="true" focusable="false"><line class="pw-chart__line pw-chart__c${i + 1}" x1="1" y1="4" x2="23" y2="4"${LINE_DASHES[i] ? ` stroke-dasharray="${LINE_DASHES[i]}"` : ""} /></svg>`
      : `<span class="pw-chart__key pw-chart__c${i + 1}" aria-hidden="true"></span>`;
  return `<ul class="pw-chart__legend" role="list">${c.series.map((s, i) => `<li>${key(i)}${esc(s.name)}</li>`).join("")}</ul>`;
}

function dataTable(c: Chart, labels: WidgetLabels, f: ReturnType<typeof numberFormats>): string {
  const radial = isRadial(c);
  const share = radial ? shares(c) : [];
  const heads = [...c.series.map((s) => header(s.name, c.unit)), ...(radial ? [labels.chartShare] : [])];
  const rows = c.labels
    .map((l, i) => `<tr><th scope="row">${esc(l)}</th>${c.series.map((s) => `<td>${esc(f.num(s.values[i]))}</td>`).join("")}${radial ? `<td>${esc(f.pct(share[i]))}</td>` : ""}</tr>`)
    .join("");
  return (
    `<details class="pw-chart__data"><summary data-md-skip>${esc(labels.viewData)}</summary>` +
    `<div class="pw-scroll" role="region" tabindex="0" aria-label="${esc(c.title)}"><table class="pw-table"><caption>${esc(c.title)}</caption>` +
    `<thead><tr><th scope="col">${esc(c.labelHeading || labels.chartCategory)}</th>${heads.map((h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead>` +
    `<tbody>${rows}</tbody></table></div></details>`
  );
}

function credit(c: Chart, labels: WidgetLabels): string {
  if (!c.source) return "";
  const name = c.sourceUrl ? `<a href="${esc(c.sourceUrl)}" rel="noopener">${esc(c.source)}</a>` : esc(c.source);
  return `<span class="pw-chart__source">${fill(esc(labels.source), { source: name })}</span>`;
}

/** A Markdown table cell: no pipes or line breaks inside. */
export const mdCell = (s: string) => s.replace(/\\/g, "\\\\").replace(/\|/g, "\\|").replace(/\s*\n\s*/g, " ");

export const chartWidget: PostWidget = {
  html: (props, { labels }) => {
    const c = props as Chart;
    const f = numberFormats(labels);
    const { viewBox, body } = chartShapes(c, { tick: f.tick, value: (n) => withUnit(f.num(n), c.unit === "%" ? "%" : undefined) });
    const svg =
      `<svg class="pw-chart__svg" viewBox="${viewBox}" role="img" focusable="false" font-size="12">` +
      `<title>${esc(c.title)}</title><desc>${esc(description(c, labels, f))}</desc>${body}</svg>`;
    const foot = c.caption || c.source ? `<figcaption>${c.caption ? `<span>${esc(c.caption)}</span>` : ""}${credit(c, labels)}</figcaption>` : "";
    return (
      `<figure class="pw-chart pw-chart--${esc(c.kind)}"><p class="pw-chart__title">${esc(c.title)}${c.unit && !isRadial(c) ? ` <span>(${esc(c.unit)})</span>` : ""}</p>` +
      `<div class="pw-chart__plot">${svg}${legend(c, f)}</div>${dataTable(c, labels, f)}${foot}</figure>`
    );
  },
  markdown: (props, { labels }) => {
    const c = props as Chart;
    const f = numberFormats(labels);
    const radial = isRadial(c);
    const share = radial ? shares(c) : [];
    const heads = [c.labelHeading || labels.chartCategory, ...c.series.map((s) => header(s.name, c.unit)), ...(radial ? [labels.chartShare] : [])];
    const row = (cells: string[]) => `| ${cells.map(mdCell).join(" | ")} |`;
    const lines = [
      `**${c.title}**`,
      "",
      row(heads),
      `| --- |${" ---: |".repeat(heads.length - 1)}`,
      ...c.labels.map((l, i) => row([l, ...c.series.map((s) => f.num(s.values[i])), ...(radial ? [f.pct(share[i])] : [])])),
    ];
    const source = c.source ? fill(labels.source, { source: c.sourceUrl ? `[${c.source}](${c.sourceUrl})` : c.source }) : "";
    const foot = [c.caption, source].filter(Boolean).join(" ");
    return lines.join("\n") + (foot ? `\n\n_${foot}_` : "");
  },
};
