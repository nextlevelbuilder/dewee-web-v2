/**
 * Docs collection helpers shared by the docs routes, the search index and other features
 * (llms-full.txt and the `.md` twins use `listDocs`). Works at build time and in the worker:
 * it only reads the content layer through `astro:content`.
 */
import { getCollection, type CollectionEntry } from "astro:content";
import { LOCALES, localePath, type Locale } from "~/i18n/config";
import { ccpShotProps, ccpShotSrc, type CcpScreenId } from "~/content/ccp-screens";
import { DOC_SECTION_IDS, type DocSectionId } from "~/content/pages/docs";

export type DocEntry = CollectionEntry<"docs">;

/** A docs page resolved for one locale, sorted in sidebar order. */
export interface DocPage {
  /** Path inside the locale, e.g. `get-started/quickstart`; identical in EN and VI. */
  slug: string;
  /** Localised site path, e.g. `/vi/docs/get-started/quickstart`. */
  url: string;
  entry: DocEntry;
}

/** Public summary consumed by other features (SEO twins, llms-full.txt). */
export interface DocSummary {
  slug: string;
  url: string;
  title: string;
  description: string;
  section: DocSectionId;
  /** Page Markdown without front matter; screenshot markers are turned into standard images. */
  body: string;
}

/**
 * A screenshot marker is a paragraph of its own: `::shot{id="agents"}`.
 * The HTML form tolerates the curly quotes that smart punctuation produces.
 */
export const SHOT_LINE_RE = /^::shot\{id="([a-z0-9-]+)"\}[ \t]*$/gm;

const sectionRank = (id: DocSectionId) => DOC_SECTION_IDS.indexOf(id);

function splitId(id: string): { locale: Locale; slug: string } {
  const [locale, ...rest] = id.split("/");
  if (locale !== "en" && locale !== "vi") throw new Error(`Docs entry "${id}" must live under en/ or vi/.`);
  return { locale, slug: rest.join("/") };
}

export const docUrl = (locale: Locale, slug: string) => localePath(locale, slug ? `/docs/${slug}` : "/docs");

/** All pages for a locale in sidebar order (section order, then `order`, then title). */
export async function getDocPages(locale: Locale): Promise<DocPage[]> {
  const entries = await getCollection("docs", (e: DocEntry) => splitId(e.id).locale === locale);
  return entries
    .map((entry: DocEntry) => {
      const { slug } = splitId(entry.id);
      return { slug, url: docUrl(locale, slug), entry };
    })
    .sort((a: DocPage, b: DocPage) =>
      sectionRank(a.entry.data.section) - sectionRank(b.entry.data.section) ||
      a.entry.data.order - b.entry.data.order ||
      a.entry.data.title.localeCompare(b.entry.data.title),
    );
}

/** Fails the build when an EN page has no VI twin (or the other way round). */
export async function assertDocsMirrored(): Promise<void> {
  const slugs = await Promise.all(LOCALES.map(async (l) => new Set((await getDocPages(l)).map((p) => p.slug))));
  const [en, vi] = slugs;
  const missing = [
    ...[...en].filter((s) => !vi.has(s)).map((s) => `vi/${s}.md`),
    ...[...vi].filter((s) => !en.has(s)).map((s) => `en/${s}.md`),
  ];
  if (missing.length) throw new Error(`Docs are not mirrored; missing: ${missing.join(", ")}`);
}

/** Replace screenshot markers with Markdown images so the raw body reads well outside the site. */
export function markdownForExport(body: string, locale: Locale): string {
  return body.replace(SHOT_LINE_RE, (_m, id: string) => {
    const shot = ccpShotProps(id as CcpScreenId, locale);
    return `![${shot.title}: ${shot.caption}](${ccpShotSrc(id as CcpScreenId, "light")})`;
  });
}

/** Every docs page of a locale with its raw Markdown body, in sidebar order. */
export async function listDocs(locale: Locale): Promise<DocSummary[]> {
  const pages = await getDocPages(locale);
  return pages.map(({ slug, url, entry }) => ({
    slug,
    url,
    title: entry.data.title,
    description: entry.data.description,
    section: entry.data.section,
    body: markdownForExport(entry.body ?? "", locale).trim(),
  }));
}
