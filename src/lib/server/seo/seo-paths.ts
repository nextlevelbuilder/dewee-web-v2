/**
 * URL rules shared by SeoHead, the Markdown-twin route and the build-time pass
 * (scripts/postbuild-markdown-and-og.ts). Relative `.ts` imports only, so Node can run it
 * with type stripping as well as Vite.
 */
import type { Locale } from "../../../i18n/config.ts";

/** `/` → `/index.md`, `/vi` → `/vi.md`, `/x/y` → `/x/y.md` (localised pathname in, twin out). */
export function markdownTwinPath(pathname: string): string {
  const clean = pathname.replace(/\/+$/, "") || "/";
  return clean === "/" ? "/index.md" : `${clean}.md`;
}

/** Inverse of `markdownTwinPath`: `/index.md` → `/`, `/vi.md` → `/vi`. */
export function pageForTwin(mdPath: string): string {
  if (mdPath === "/index.md") return "/";
  return mdPath.replace(/\.md$/, "") || "/";
}

/** Card file name for an unprefixed page path: `/` → `index`, `/docs/a/b` → `docs--a--b`. */
export function ogSlug(path: string): string {
  const clean = path.replace(/^\/+|\/+$/g, "");
  return clean ? clean.replace(/\//g, "--") : "index";
}

export const OG_DEFAULT_SLUG = "default";

/** Site-relative URL of a page's social card. */
export function ogImagePath(locale: Locale, path: string): string {
  return `/og/${locale}/${ogSlug(path)}.png`;
}

export function ogDefaultPath(locale: Locale): string {
  return `/og/${locale}/${OG_DEFAULT_SLUG}.png`;
}

/**
 * Pathname served for a prerendered HTML file (Astro `build.format: "file"`), relative to the
 * client output dir with forward slashes: `index.html` → `/`, `vi.html` → `/vi`,
 * `use-cases/x.html` → `/use-cases/x`, `docs/index.html` → `/docs`.
 */
export function pathForHtmlFile(file: string): string {
  const clean = file.replace(/\\/g, "/").replace(/^\/+/, "").replace(/\.html$/, "");
  const trimmed = clean === "index" ? "" : clean.replace(/\/index$/, "");
  return `/${trimmed}`;
}
