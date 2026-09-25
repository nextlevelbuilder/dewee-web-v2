/**
 * Đông Sơn bronze drum (trống đồng) ornaments, drawn as plain SVG so the site, the social cards and
 * any future asset share one geometry.
 *
 * The drum face follows the Ngọc Lũ composition, read from the centre outwards: a solid fourteen-ray
 * sun with feathered chevrons between the rays, then alternating bands of tangent circles, ladder
 * hatching and zigzags, a wide band of Lạc herons flying anticlockwise, and a plain rim.
 *
 * Run directly (`node scripts/patterns/dong-son-drum.ts`) to rewrite the files in public/patterns/.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const TAU = Math.PI * 2;
const f = (n: number) => Math.round(n * 100) / 100;
const polar = (r: number, a: number) => `${f(r * Math.cos(a))} ${f(r * Math.sin(a))}`;

const ring = (r: number) => `<circle r="${r}"/>`;

/** A band of small circles touching each other, each with a dot in the middle. */
function tangentCircles(r: number, size: number): string {
  const n = Math.floor((TAU * r) / (size * 2));
  let out = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    const [x, y] = [f(r * Math.cos(a)), f(r * Math.sin(a))];
    out += `<circle cx="${x}" cy="${y}" r="${f(size * 0.86)}"/><circle cx="${x}" cy="${y}" r="${f(size * 0.26)}" class="d"/>`;
  }
  return out;
}

/** A ladder band: short, slightly slanted strokes between two radii. */
function hatch(r1: number, r2: number, step: number): string {
  const n = Math.floor((TAU * r1) / step);
  let d = "";
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    d += `M${polar(r1, a)}L${polar(r2, a + 0.35 * (step / r2))}`;
  }
  return `<path d="${d}"/>`;
}

/** Nested zigzags: a row of triangles, with a smaller echo inside each. */
function zigzag(r1: number, r2: number, count: number): string {
  let outer = "";
  let inner = "";
  const mid = (r1 + r2) / 2;
  for (let i = 0; i <= count * 2; i++) {
    const a = (i / (count * 2)) * TAU;
    outer += `${i ? "L" : "M"}${polar(i % 2 ? r2 : r1, a)}`;
    inner += `${i ? "L" : "M"}${polar(i % 2 ? mid + (r2 - mid) * 0.35 : r1 + (mid - r1) * 0.35, a)}`;
  }
  return `<path d="${outer}Z"/><path d="${inner}Z"/>`;
}

/** The sun: a solid star with feathered chevrons pointing inwards in each gap between the rays. */
function sun(points: number, rOuter: number, rInner: number): string {
  let star = "";
  for (let i = 0; i < points * 2; i++) {
    const a = (i / (points * 2)) * TAU - TAU / 4;
    star += `${i ? "L" : "M"}${polar(i % 2 ? rInner : rOuter, a)}`;
  }
  let feathers = "";
  for (let i = 0; i < points; i++) {
    const gap = ((i + 0.5) / points) * TAU - TAU / 4;
    for (let k = 0; k < 3; k++) {
      const r = rInner + 12 + k * 14;
      const spread = 0.07 + k * 0.035;
      feathers += `M${polar(r + 10, gap - spread)}L${polar(r, gap)}L${polar(r + 10, gap + spread)}`;
    }
  }
  return `<path d="${star}Z" class="s"/><path d="${feathers}"/>`;
}

/** One Lạc heron in flight, beak along +x, wing raised along −y; about 110 units long. */
const HERON =
  '<path class="s" d="M-30 0Q-8-8 18-3L26-5L58-1L26 1Q20 6 12 5Q-10 8-30 0Z"/>' +
  '<path class="s" d="M-12-4L-32-38L-19-37L4-4Z"/>' +
  '<path d="M22-5L7-21M19-5L2-17M-30 0L-51-9M-30 1L-54 1M-30 2L-49 10M-16 5L-42 17"/>';

/** Herons around a circle, flying anticlockwise with their wings towards the rim. */
function herons(r: number, count: number, scale: number): string {
  let out = "";
  for (let i = 0; i < count; i++) {
    const a = (i / count) * TAU;
    const deg = (a * 180) / Math.PI - 90;
    out += `<g transform="translate(${polar(r, a)}) rotate(${f(deg)}) scale(${scale} ${-scale})">${HERON}</g>`;
  }
  return out;
}

function style(color: string, width: number, alpha: number): string {
  return `<style>g.o{fill:none;stroke:${color};stroke-width:${width};stroke-linecap:round;stroke-linejoin:round;opacity:${alpha}}.s,.d{fill:${color};stroke:none}</style>`;
}

/** The whole drum face on a 1000 × 1000 canvas centred at the origin. */
export function drumFaceSvg(color: string, alpha = 1, strokeWidth = 1.5): string {
  const body = [
    sun(14, 82, 30),
    ring(90), tangentCircles(100, 8), ring(110),
    hatch(112, 124, 7), ring(128),
    zigzag(132, 156, 36), ring(160),
    hatch(162, 171, 7), ring(175),
    tangentCircles(185, 8), ring(195),
    herons(248, 12, 1.1), ring(300),
    hatch(302, 313, 7), ring(317),
    tangentCircles(327, 8), ring(337),
    zigzag(341, 363, 64), ring(367),
    hatch(369, 378, 7), ring(382),
    tangentCircles(392, 8), ring(402),
    ring(468), ring(476),
  ].join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-500 -500 1000 1000">${style(color, strokeWidth, alpha)}<g class="o">${body}</g></svg>`;
}

/**
 * A seamless 96 × 48 tile cut from the drum's bands: a row of tangent circles over a ladder row.
 * Used as a quiet texture on cards and bands where a whole drum face would be too much.
 */
export function drumTileSvg(color: string, alpha = 1, strokeWidth = 1): string {
  let body = "";
  for (let i = 0; i < 6; i++) {
    const cx = 8 + i * 16;
    body += `<circle cx="${cx}" cy="12" r="6.9"/><circle cx="${cx}" cy="12" r="2" class="d"/>`;
  }
  let d = "M0 22H96M0 34H96";
  for (let x = 2; x < 96; x += 6) d += `M${x} 24L${x + 3} 32`;
  body += `<path d="${d}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="48" viewBox="0 0 96 48">${style(color, strokeWidth, alpha)}<g class="o">${body}</g></svg>`;
}

/**
 * Bronze for light pages and a warm, pale gold for dark ones. The drum face is a background
 * texture, so its opacity is baked in; the tile is a visible ornament band and stays stronger.
 */
export const DRUM_INK = {
  light: { color: "#7a5a2e", face: 0.17, tile: 0.5 },
  dark: { color: "#e2c48a", face: 0.11, tile: 0.34 },
} as const;

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const out = join(dirname(fileURLToPath(import.meta.url)), "../../public/patterns");
  mkdirSync(out, { recursive: true });
  for (const [theme, ink] of Object.entries(DRUM_INK)) {
    writeFileSync(join(out, `dong-son-drum-${theme}.svg`), drumFaceSvg(ink.color, ink.face));
    writeFileSync(join(out, `dong-son-tile-${theme}.svg`), drumTileSvg(ink.color, ink.tile));
  }
  console.log(`wrote drum patterns to ${out}`);
}
