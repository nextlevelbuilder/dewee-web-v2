/// <reference types="node" />
/**
 * Social cards (1200×630 PNG) in the site's "trống đồng · mực tím" art direction: warm paper with
 * the Đông Sơn drum face rising from the top-right corner, a purple-ink eyebrow, the page title in
 * Newsreader, the description in Be Vietnam Pro, the dewee wordmark and the ink-drop mascot.
 *
 * satori lays the text out (it needs TTF/OTF fonts, committed under ./fonts with their OFL
 * licences) and resvg rasterises the SVG. The drum is plain SVG (shared with the site) injected
 * behind satori's output, which keeps them crisp and cheap. Run by Node with type stripping,
 * so this file only uses erasable TypeScript.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import satori, { type Font } from "satori";
import { Resvg } from "@resvg/resvg-js";
import { DRUM_INK, drumFaceSvg } from "../patterns/dong-son-drum.ts";

export type OgCardInput = {
  title: string;
  description: string;
  /** Short section label shown above the title, e.g. "Use cases" */
  eyebrow: string;
  /** Display URL without the scheme, e.g. "dewee.sh/vi/pricing" */
  url: string;
};

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/** Light-theme tokens from src/styles/tokens.css, converted from OKLCH to sRGB. */
const INK = { paper: "#fafafe", ink: "#141b3c", ink2: "#3f455f", ink3: "#66697c", accentInk: "#4437ce" };

const PAD_LEFT = 188;

/** Bumped whenever the design changes so cached cards are re-rendered. */
export const OG_TEMPLATE_VERSION = "4";

type El = { type: string; props: { style?: Record<string, string | number>; children?: unknown; src?: string; width?: number; height?: number } };
const el = (type: string, style: Record<string, string | number>, children?: unknown, extra: Record<string, unknown> = {}): El => ({ type, props: { style, children, ...extra } });

/** Cut at a word boundary and add an ellipsis. */
export function clampText(text: string, max: number): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,.;:–—-]+$/, "")}…`;
}

/** Longer titles get a smaller size so they stay within three to four lines. */
export function titleSize(title: string): number {
  const n = title.length;
  if (n <= 30) return 80;
  if (n <= 50) return 68;
  if (n <= 75) return 58;
  return 50;
}

/** Paper plus the drum face, restated with presentation attributes since resvg ignores classes. */
function paperBackground(): string {
  const { color } = DRUM_INK.light;
  const drum = drumFaceSvg(color)
    .replace(/^<svg[^>]*>/, "")
    .replace(/<\/svg>$/, "")
    .replace(/<style>.*?<\/style>/, "")
    .replace('<g class="o">', `<g fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity="0.2">`)
    .replace(/class="[sd]"/g, `fill="${color}" stroke="none"`);
  return [
    `<rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="${INK.paper}"/>`,
    `<svg x="790" y="-360" width="800" height="800" viewBox="-500 -500 1000 1000">${drum}</svg>`,
  ].join("");
}

function card(input: OgCardInput, assets: { mascot: string; wordmark: string }): El {
  const title = clampText(input.title, 110);
  const description = clampText(input.description, 130);
  const eyebrow = clampText(input.eyebrow, 40).toUpperCase();
  return el("div", { width: OG_WIDTH, height: OG_HEIGHT, display: "flex", flexDirection: "column", position: "relative", padding: `64px 72px 58px ${PAD_LEFT}px` }, [
    el("div", { display: "flex", alignItems: "center", gap: 16, color: INK.accentInk, fontFamily: "JetBrains Mono", fontSize: 21, fontWeight: 500, letterSpacing: 2.6 }, [
      el("div", { width: 34, height: 2, backgroundColor: INK.accentInk, opacity: 0.6 }),
      el("div", { display: "flex" }, eyebrow),
    ]),
    el("div", { display: "flex", marginTop: 30, maxWidth: 900, fontFamily: "Newsreader", fontWeight: 500, fontSize: titleSize(title), lineHeight: 1.08, letterSpacing: -1, color: INK.ink }, title),
    description
      ? el("div", { display: "flex", marginTop: 24, maxWidth: 690, fontFamily: "Be Vietnam Pro", fontSize: 27, lineHeight: 1.42, color: INK.ink2 }, description)
      : el("div", { display: "flex" }),
    el("div", { display: "flex", flexGrow: 1 }),
    el("div", { display: "flex", alignItems: "center", gap: 22 }, [
      el("img", { width: 158, height: 46 }, undefined, { src: assets.wordmark, width: 158, height: 46 }),
      el("div", { width: 1.5, height: 30, backgroundColor: INK.ink3, opacity: 0.4 }),
      el("div", { display: "flex", fontFamily: "JetBrains Mono", fontSize: 22, fontWeight: 500, color: INK.ink3 }, clampText(input.url, 48)),
    ]),
    // Satori paints a closest-side radial gradient as a hard grey box, so the shadow is a soft pill instead.
    el("div", { position: "absolute", right: 104, bottom: 44, width: 150, height: 14, borderRadius: 9999, backgroundColor: "rgba(20, 27, 60, 0.10)", boxShadow: "0 0 14px 8px rgba(20, 27, 60, 0.08)" }),
    el("img", { position: "absolute", right: 58, bottom: 56, width: 236, height: 195, transform: "rotate(-7deg)" }, undefined, { src: assets.mascot, width: 236, height: 195 }),
  ]);
}

function dataUri(file: string): string {
  return `data:image/png;base64,${readFileSync(file, "base64")}`;
}

export type OgRenderer = { render: (input: OgCardInput) => Promise<Buffer> };

/** Loads fonts and brand images once; `render` can then be called for every page. */
export function createOgRenderer(opts: { fontsDir: string; brandDir: string }): OgRenderer {
  const font = (file: string, name: string, weight: Font["weight"], style: Font["style"] = "normal"): Font => ({ name, data: readFileSync(join(opts.fontsDir, file)), weight, style });
  const fonts: Font[] = [
    font("Newsreader-Medium.ttf", "Newsreader", 500),
    font("Newsreader-MediumItalic.ttf", "Newsreader", 500, "italic"),
    font("BeVietnamPro-Regular.ttf", "Be Vietnam Pro", 400),
    font("BeVietnamPro-SemiBold.ttf", "Be Vietnam Pro", 600),
    font("JetBrainsMono-Medium.ttf", "JetBrains Mono", 500),
  ];
  const assets = { mascot: dataUri(join(opts.brandDir, "dewee-icon.png")), wordmark: dataUri(join(opts.brandDir, "dewee-wordmark-360.png")) };
  const background = paperBackground();

  return {
    async render(input) {
      // satori's element type is React's; plain objects with the same shape are what it reads.
      const svg = await satori(card(input, assets) as unknown as Parameters<typeof satori>[0], { width: OG_WIDTH, height: OG_HEIGHT, fonts });
      const layered = svg.replace(/^<svg[^>]*>/, (open) => `${open}${background}`);
      return new Resvg(layered, { fitTo: { mode: "width", value: OG_WIDTH }, font: { loadSystemFonts: false } }).render().asPng();
    },
  };
}
