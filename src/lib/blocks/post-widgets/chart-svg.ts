/**
 * Hand-written SVG for the Chart widget (isomorphic, pure). No chart library: a bar, line, pie
 * or donut chart is a few rects, paths and text, and drawing it on the server means readers,
 * the preview and feeds get the picture without JavaScript. Colours are CSS classes
 * (`pw-chart__c1…`) that map to design tokens in post-widgets.css, so both themes work.
 */
import { esc } from "./widget-html";

export type ChartSeries = { name: string; values: number[] };
export type ChartData = { kind: "bar" | "line" | "pie" | "donut"; labels: string[]; series: ChartSeries[] };
export type ChartFormat = { tick: (n: number) => string; value: (n: number) => string };

/** Dash patterns per series, so lines differ by more than colour. */
export const LINE_DASHES = ["", "7 4", "2 4", "10 4 2 4", "4 3", "1 4"] as const;

const W = 480;
const H = 280;
const FONT = 12;
/**
 * Room per character, sized for the larger text a narrow column gets (post-widgets.css raises
 * the font inside a small chart so it stays legible once the drawing scales down).
 */
const CHAR_W = 9.4;
const PIE = 240;
const round = (n: number) => Math.round(n * 100) / 100;

/** A "nice" step (1, 2 or 5 × 10^k) so ticks land on round numbers. */
function niceStep(span: number, ticks: number): number {
  const raw = span / Math.max(1, ticks);
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  return (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
}

export function niceScale(min: number, max: number, ticks = 4): { lo: number; hi: number; step: number } {
  if (min === max) {
    if (min === 0) return { lo: 0, hi: 1, step: 0.25 };
    [min, max] = min > 0 ? [0, max] : [min, 0];
  }
  const step = niceStep(max - min, ticks);
  return { lo: Math.floor(min / step) * step, hi: Math.ceil(max / step) * step, step };
}

function truncate(label: string, maxChars: number): string {
  if (label.length <= maxChars) return label;
  return `${label.slice(0, Math.max(1, maxChars - 1)).trimEnd()}…`;
}

/** Bars and lines share the frame: a y grid with ticks and x labels thinned to fit. */
function cartesian(data: ChartData, fmt: ChartFormat): string {
  const all = data.series.flatMap((s) => s.values);
  const dataMin = Math.min(...all);
  const dataMax = Math.max(...all);
  // Bars always start at zero; lines may zoom in, unless zero is close to the data anyway.
  const span = dataMax - dataMin;
  const withZero = data.kind === "bar" || (dataMin > 0 && dataMin < span) || (dataMax < 0 && -dataMax < span);
  const { lo, hi, step } = niceScale(withZero ? Math.min(0, dataMin) : dataMin, withZero ? Math.max(0, dataMax) : dataMax);
  const ticks: number[] = [];
  for (let i = 0; lo + step * i <= hi + step / 2; i++) ticks.push(round(lo + step * i));

  const left = Math.min(120, Math.max(28, ...ticks.map((t) => fmt.tick(t).length * CHAR_W + 10)));
  const top = 22;
  const plotW = W - left - 8;
  const plotH = H - top - 30;
  const y = (v: number) => round(top + plotH - ((v - lo) / (hi - lo)) * plotH);
  const n = data.labels.length;
  const slot = plotW / n;
  const cx = (i: number) => round(left + slot * i + slot / 2);

  let out = ticks
    .map(
      (t) =>
        `<line class="pw-chart__grid${t === 0 ? " pw-chart__grid--zero" : ""}" x1="${left}" x2="${W - 8}" y1="${y(t)}" y2="${y(t)}" />` +
        `<text class="pw-chart__tick" x="${left - 6}" y="${y(t)}" dy="0.32em" text-anchor="end">${esc(fmt.tick(t))}</text>`,
    )
    .join("");

  const every = Math.max(1, Math.ceil(n / Math.max(1, Math.floor(plotW / 64))));
  const maxChars = Math.max(3, Math.floor((slot * every) / CHAR_W) - 1);
  out += data.labels
    .map((label, i) => (i % every === 0 ? `<text class="pw-chart__tick" x="${cx(i)}" y="${H - 8}" text-anchor="middle">${esc(truncate(label, maxChars))}</text>` : ""))
    .join("");

  if (data.kind === "bar") {
    const group = slot * 0.72;
    const bar = group / data.series.length;
    const base = y(Math.max(lo, Math.min(0, hi)));
    const showValues = data.series.length === 1 && n <= 12;
    data.series.forEach((s, si) => {
      s.values.forEach((v, i) => {
        const x = round(left + slot * i + (slot - group) / 2 + bar * si);
        const yTop = Math.min(y(v), base);
        const h = v === 0 ? 0 : Math.max(1, Math.abs(base - y(v)));
        out += `<rect class="pw-chart__c${si + 1}" x="${x}" y="${round(yTop)}" width="${round(Math.max(1, bar - 2))}" height="${round(h)}" rx="2" />`;
        if (showValues) {
          const ty = v < 0 ? yTop + h + FONT + 2 : yTop - 5;
          out += `<text class="pw-chart__value" x="${round(x + bar / 2 - 1)}" y="${round(ty)}" text-anchor="middle">${esc(fmt.value(v))}</text>`;
        }
      });
    });
  } else {
    const dots = n <= 24;
    data.series.forEach((s, si) => {
      const d = s.values.map((v, i) => `${i ? "L" : "M"}${cx(i)} ${y(v)}`).join(" ");
      const dash = LINE_DASHES[si % LINE_DASHES.length];
      out += `<path class="pw-chart__line pw-chart__c${si + 1}" d="${d}"${dash ? ` stroke-dasharray="${dash}"` : ""} />`;
      if (dots) out += s.values.map((v, i) => `<circle class="pw-chart__dot pw-chart__c${si + 1}" cx="${cx(i)}" cy="${y(v)}" r="3.5" />`).join("");
    });
  }
  return out;
}

const polar = (angle: number, r: number) => {
  const c = PIE / 2;
  return `${round(c + r * Math.cos(angle))} ${round(c + r * Math.sin(angle))}`;
};

/** Pie and donut slices, clockwise from twelve o'clock; zero slices draw nothing. */
function radial(data: ChartData): string {
  const values = data.series[0]?.values ?? [];
  const total = values.reduce((a, v) => a + Math.max(0, v), 0);
  const outer = PIE / 2 - 4;
  const inner = data.kind === "donut" ? outer * 0.56 : 0;
  const c = PIE / 2;
  let angle = -Math.PI / 2;
  let out = "";
  values.forEach((v, i) => {
    if (v <= 0 || total <= 0) return;
    const sweep = (v / total) * Math.PI * 2;
    const cls = `pw-chart__slice pw-chart__c${i + 1}`;
    if (sweep >= Math.PI * 2 - 1e-9) {
      out += inner
        ? `<path class="${cls}" fill-rule="evenodd" d="M${c - outer} ${c}a${outer} ${outer} 0 1 0 ${outer * 2} 0a${outer} ${outer} 0 1 0 ${-outer * 2} 0ZM${c - inner} ${c}a${inner} ${inner} 0 1 0 ${inner * 2} 0a${inner} ${inner} 0 1 0 ${-inner * 2} 0Z" />`
        : `<circle class="${cls}" cx="${c}" cy="${c}" r="${outer}" />`;
    } else {
      const end = angle + sweep;
      const large = sweep > Math.PI ? 1 : 0;
      const d = inner
        ? `M${polar(angle, outer)}A${outer} ${outer} 0 ${large} 1 ${polar(end, outer)}L${polar(end, inner)}A${inner} ${inner} 0 ${large} 0 ${polar(angle, inner)}Z`
        : `M${c} ${c}L${polar(angle, outer)}A${outer} ${outer} 0 ${large} 1 ${polar(end, outer)}Z`;
      out += `<path class="${cls}" d="${d}" />`;
    }
    angle += sweep;
  });
  return out;
}

/** The drawing for a validated chart: its viewBox and the shapes inside the `<svg>`. */
export function chartShapes(data: ChartData, fmt: ChartFormat): { viewBox: string; body: string } {
  return data.kind === "pie" || data.kind === "donut" ? { viewBox: `0 0 ${PIE} ${PIE}`, body: radial(data) } : { viewBox: `0 0 ${W} ${H}`, body: cartesian(data, fmt) };
}
