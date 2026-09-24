/// <reference types="node" />
/**
 * Build-time SEO/GEO pass over the prerendered pages in dist/client:
 *   1. a Markdown twin next to every HTML page (`/x.html` → `/x.md`, `/index.html` → `/index.md`),
 *   2. a 1200×630 social card per page at `/og/<locale>/<slug>.png` plus `/og/<locale>/default.png`,
 *   3. `/_seo/manifest.json` (URLs, titles, lastmod, hreflang) for the sitemap and llms routes,
 *   4. `/_seo/llms-full.md`, the English twins concatenated for /llms-full.txt.
 *
 * Runs after `astro build` through the integration in scripts/astro-seo-postbuild.mjs, or by hand:
 *   node scripts/postbuild-markdown-and-og.ts --dir dist/client --site https://dewee.sh
 * Pages are discovered from the build output, never from a route list.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { htmlToMarkdown } from "../src/lib/html-to-markdown.ts";
import { LOCALES, localePath, pick, splitLocale, type Locale } from "../src/i18n/config.ts";
import { SITE } from "../src/content/site.ts";
import { CHANGELOG } from "../src/content/pages/changelog.ts";
import { BLOG } from "../src/content/pages/blog.ts";
import { markdownTwinPath, ogSlug, OG_DEFAULT_SLUG, pathForHtmlFile, SSR_CARD_ROUTES, type SsrCardRoute } from "../src/lib/server/seo/seo-paths.ts";
import { fullTextRank, SECTION_LABEL, sectionOf, type SectionId } from "../src/lib/server/seo/page-sections.ts";
import { fullTextSection, joinWithinBudget, LLMS_FULL_MAX_BYTES } from "../src/lib/server/seo/llms-full-text.ts";
import type { SeoManifest, SeoPage } from "../src/lib/server/seo/seo-manifest.ts";
import { createOgRenderer, OG_TEMPLATE_VERSION, type OgCardInput } from "./og/og-card-renderer.ts";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKIP_DIRS = new Set(["_astro", "_seo", "og", "brand", "img", "fonts", "shots"]);
/** Card copy is plain text: drop the inline markup (`*em*`, `==mark==`, `~~scribble~~`) the page copy uses. */
const plain = (s: string) => s.replace(/\*|==|~~/g, "");
/** Server-rendered sections with fixed copy; their pages (blog posts) fall back to the section card. */
const SSR_CARDS: Record<SsrCardRoute, Record<Locale, { title: string; description: string }>> = {
  "/changelog": { en: CHANGELOG.en.meta, vi: CHANGELOG.vi.meta },
  "/blog": {
    en: { title: plain(BLOG.hero.title.en), description: BLOG.meta.description.en },
    vi: { title: plain(BLOG.hero.title.vi), description: BLOG.meta.description.vi },
  },
};
/** Sections that stay in llms-full.txt when everything together is over budget. */
const CORE_SECTIONS = new Set<SectionId>(["docs", "home", "product"]);

type Log = { info: (msg: string) => void; warn: (msg: string) => void };

function htmlFiles(dir: string, base = dir): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return dir === base && SKIP_DIRS.has(entry.name) ? [] : htmlFiles(full, base);
    return entry.name.endsWith(".html") ? [relative(base, full).replace(/\\/g, "/")] : [];
  });
}

/** Error pages are not content: they get no twin, card or sitemap entry. */
function isErrorPage(path: string) {
  return /^\/(vi\/)?(404|500)$/.test(path);
}

/** Commit date of HEAD: the newest content any page without its own modified date can claim. */
function contentDate(): string {
  try {
    return new Date(execFileSync("git", ["log", "-1", "--format=%cI"], { cwd: ROOT, encoding: "utf8" }).trim()).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function sitePath(href: string, origin: string): string | null {
  try {
    const url = new URL(href, origin);
    return url.origin === origin ? url.pathname.replace(/\/$/, "") || "/" : null;
  } catch {
    return null;
  }
}

function hashFiles(files: string[]): string {
  const h = createHash("sha256");
  for (const f of files) h.update(readFileSync(f));
  return h.digest("hex").slice(0, 16);
}

export async function runSeoPostbuild(opts: { dir: string; site: string; log?: Log }): Promise<void> {
  const started = Date.now();
  const log = opts.log ?? { info: (m) => console.log(`[seo] ${m}`), warn: (m) => console.warn(`[seo] ${m}`) };
  const dir = resolve(opts.dir);
  const origin = new URL(opts.site).origin;
  const host = new URL(origin).host;
  // Staging marks every page noindex (see BaseLayout); that is the environment speaking, not the page.
  const environmentNoindex = host.startsWith("staging.");
  const fallbackDate = contentDate();

  const fontsDir = join(ROOT, "scripts/og/fonts");
  const brandDir = join(ROOT, "public/brand");
  const og = createOgRenderer({ fontsDir, brandDir });
  const cacheDir = join(ROOT, "node_modules/.cache/dewee-og");
  mkdirSync(cacheDir, { recursive: true });
  // The renderer source is part of the key, so a layout change re-renders every card.
  const designKey = OG_TEMPLATE_VERSION + hashFiles([
    join(ROOT, "scripts/og/og-card-renderer.ts"),
    ...readdirSync(fontsDir).filter((f) => f.endsWith(".ttf")).sort().map((f) => join(fontsDir, f)),
    join(brandDir, "dewee-icon.png"),
    join(brandDir, "dewee-wordmark-360.png"),
  ]);
  let rendered = 0;
  let reused = 0;
  const writeCard = async (locale: Locale, slug: string, input: OgCardInput) => {
    const key = createHash("sha256").update(designKey).update(JSON.stringify(input)).digest("hex").slice(0, 24);
    const cached = join(cacheDir, `${key}.png`);
    const target = join(dir, "og", locale, `${slug}.png`);
    mkdirSync(dirname(target), { recursive: true });
    if (existsSync(cached)) {
      copyFileSync(cached, target);
      reused++;
      return;
    }
    const png = await og.render(input);
    writeFileSync(target, png);
    writeFileSync(cached, png);
    rendered++;
  };

  const pages: SeoPage[] = [];
  const twins = new Map<string, string>();
  for (const file of htmlFiles(dir).sort()) {
    const path = pathForHtmlFile(file);
    if (isErrorPage(path)) continue;
    const { markdown, meta } = htmlToMarkdown(readFileSync(join(dir, file), "utf8"), origin);
    const { locale, path: route } = splitLocale(path);
    const twin = markdownTwinPath(path);
    writeFileSync(join(dir, twin.slice(1)), markdown);
    twins.set(path, markdown);

    const section = sectionOf(route);
    const alternates = meta.alternates.flatMap((a) => {
      const p = sitePath(a.href, origin);
      return p ? [{ hreflang: a.hreflang, path: p }] : [];
    });
    pages.push({
      path,
      route,
      locale,
      title: meta.title,
      description: meta.description,
      section,
      lastmod: meta.modified && !Number.isNaN(Date.parse(meta.modified)) ? new Date(meta.modified).toISOString() : fallbackDate,
      noindex: meta.noindex && !environmentNoindex,
      alternates,
      twin,
    });
    await writeCard(locale, ogSlug(route), {
      title: meta.title,
      description: meta.description,
      eyebrow: pick(SECTION_LABEL[section], locale),
      url: `${host}${path === "/" ? "" : path}`,
    });
  }

  for (const locale of LOCALES) {
    await writeCard(locale, OG_DEFAULT_SLUG, {
      title: pick(SITE.tagline, locale),
      description: pick(SITE.description, locale),
      eyebrow: pick(SECTION_LABEL.home, locale),
      url: locale === "en" ? host : `${host}/${locale}`,
    });
  }

  // Server-rendered sections get a card from their fixed copy; SeoHead falls back to it (ssrOgImagePath).
  for (const route of SSR_CARD_ROUTES) {
    for (const locale of LOCALES) {
      const meta = SSR_CARDS[route][locale];
      await writeCard(locale, ogSlug(route), {
        title: meta.title,
        description: meta.description,
        eyebrow: pick(SECTION_LABEL[sectionOf(route)], locale),
        url: `${host}${localePath(locale, route)}`,
      });
    }
  }

  // llms-full: English, indexable, docs first, then product, then the rest.
  const english = pages
    .filter((p) => p.locale === "en" && !p.noindex)
    .sort((a, b) => fullTextRank(a.section) - fullTextRank(b.section) || a.path.localeCompare(b.path));
  const section = (p: SeoPage) => fullTextSection({ title: p.title, url: `${origin}${p.path}`, markdown: twins.get(p.path) ?? "" });
  let full = joinWithinBudget(english.map(section), Number.POSITIVE_INFINITY);
  if (new TextEncoder().encode(full.text).length > LLMS_FULL_MAX_BYTES) {
    log.warn("llms-full over budget: keeping docs and product pages only");
    full = joinWithinBudget(english.filter((p) => CORE_SECTIONS.has(p.section)).map(section));
  }

  const manifest: SeoManifest = { version: 1, site: origin, generatedAt: new Date().toISOString(), pages };
  mkdirSync(join(dir, "_seo"), { recursive: true });
  writeFileSync(join(dir, "_seo/manifest.json"), JSON.stringify(manifest));
  writeFileSync(join(dir, "_seo/llms-full.md"), full.text);

  log.info(
    `${pages.length} pages → ${twins.size} Markdown twins, ${rendered} cards rendered + ${reused} reused, ` +
      `llms-full ${full.included} pages (${Math.round(full.text.length / 1024)} KB) in ${Date.now() - started} ms`,
  );
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? undefined : process.argv[i + 1];
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const dir = arg("dir") ?? join(ROOT, "dist/client");
  const site = arg("site") ?? process.env.SITE_URL ?? SITE.url;
  runSeoPostbuild({ dir, site }).catch((err) => {
    console.error("[seo] postbuild failed:", err);
    process.exit(1);
  });
}
