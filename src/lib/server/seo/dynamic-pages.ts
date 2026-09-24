/**
 * Server-rendered pages that the build cannot see: published D1 `pages` rows (blog posts and
 * page-builder pages), the blog index once posts exist, and the changelog. Feeds the dynamic
 * sitemap and the llms files. Failures degrade to an empty list so the static part still ships.
 */
import { localePath, LOCALES, type Locale } from "~/i18n/config";
import { markdownTwinPath } from "./seo-paths";
import { sectionOf, type SectionId } from "./page-sections";
import type { Alternate } from "./sitemap-xml";
import { slugError, type SlugKind } from "../pages/slug-rules";

export type DynamicPage = {
  path: string;
  locale: Locale;
  title: string;
  description: string;
  section: SectionId;
  lastmod?: string;
  alternates: Alternate[];
  twin: string;
};

type Row = {
  kind: string;
  locale: string;
  slug: string;
  title: string;
  description: string | null;
  translation_key: string | null;
  published_at: string | null;
  updated_at: string | null;
  seo: string | null;
};

/** Where each D1 kind is served (see src/pages/[...lang]/blog and src/pages/[...lang]/p). */
const ROUTE_FOR_KIND: Record<string, (slug: string) => string> = {
  post: (slug) => `/blog/${slug}`,
  page: (slug) => `/p/${slug}`,
};

function noindex(seo: string | null): boolean {
  if (!seo) return false;
  try {
    return (JSON.parse(seo) as { noindex?: unknown }).noindex === true;
  } catch {
    return false;
  }
}

const pathOf = (r: Row) => localePath(r.locale as Locale, ROUTE_FOR_KIND[r.kind](r.slug));

/**
 * Pure: D1 rows → pages. A row and its published translation (same kind and translation_key,
 * other locale, any slug) get hreflang pairs, exactly as the pages declare them in <head>.
 */
export function pagesFromRows(rows: Row[]): DynamicPage[] {
  // The same slug rules as the routes, so the sitemap never lists a URL that would 404.
  const valid = rows.filter((r) => ROUTE_FOR_KIND[r.kind] && (r.locale === "en" || r.locale === "vi") && !slugError(r.slug, r.kind as SlugKind) && !noindex(r.seo));
  return valid.map((r) => {
    const locale = r.locale as Locale;
    const route = ROUTE_FOR_KIND[r.kind](r.slug);
    const path = pathOf(r);
    const translation = r.translation_key
      ? valid.find((o) => o !== r && o.kind === r.kind && o.translation_key === r.translation_key && o.locale !== r.locale)
      : undefined;
    const en = translation ? (locale === "en" ? path : pathOf(translation)) : undefined;
    const vi = translation ? (locale === "vi" ? path : pathOf(translation)) : undefined;
    const alternates: Alternate[] =
      en && vi
        ? [
            { hreflang: "en", path: en },
            { hreflang: "vi", path: vi },
            { hreflang: "x-default", path: en },
          ]
        : [];
    return {
      path,
      locale,
      title: r.title,
      description: r.description ?? "",
      section: sectionOf(route),
      lastmod: r.updated_at ?? r.published_at ?? undefined,
      alternates,
      twin: markdownTwinPath(path),
    };
  });
}

/** Index pages that exist in both locales: the changelog always, the blog once a post is published. */
function indexPages(route: string, titles: Record<Locale, string>, lastmod: string | undefined, description: Record<Locale, string>): DynamicPage[] {
  const alternates: Alternate[] = [
    { hreflang: "en", path: localePath("en", route) },
    { hreflang: "vi", path: localePath("vi", route) },
    { hreflang: "x-default", path: localePath("en", route) },
  ];
  return LOCALES.map((locale) => ({
    path: localePath(locale, route),
    locale,
    title: titles[locale],
    description: description[locale],
    section: sectionOf(route),
    lastmod,
    alternates,
    twin: markdownTwinPath(localePath(locale, route)),
  }));
}

export type IndexCopy = { title: Record<Locale, string>; description: Record<Locale, string> };

export async function listDynamicPages(db: D1Database, copy: { changelog: IndexCopy; blog: IndexCopy }): Promise<DynamicPage[]> {
  const out: DynamicPage[] = [];
  try {
    const { results } = await db
      .prepare("SELECT kind, locale, slug, title, description, translation_key, published_at, updated_at, seo FROM pages WHERE status = 'published' ORDER BY published_at DESC LIMIT 2000")
      .all<Row>();
    const pages = pagesFromRows(results ?? []);
    const posts = pages.filter((p) => p.section === "blog");
    if (posts.length) {
      const newestPost = posts.map((p) => p.lastmod).filter(Boolean).sort().at(-1);
      out.push(...indexPages("/blog", copy.blog.title, newestPost, copy.blog.description));
    }
    out.push(...pages);
  } catch (err) {
    console.error("seo: published pages query failed", err instanceof Error ? err.message : err);
  }
  let latestRelease: string | undefined;
  try {
    latestRelease = (await db.prepare("SELECT MAX(published_at) AS at FROM releases").first<{ at: string | null }>())?.at ?? undefined;
  } catch (err) {
    console.error("seo: releases query failed", err instanceof Error ? err.message : err);
  }
  out.unshift(...indexPages("/changelog", copy.changelog.title, latestRelease, copy.changelog.description));
  return out;
}

export type PostMarkdown = { path: string; title: string; markdown: string };

/** Published, indexable posts of one locale that have a Markdown body, newest first (llms-full.txt). */
export async function listPostMarkdown(db: D1Database, locale: Locale, limit = 200): Promise<PostMarkdown[]> {
  try {
    const { results } = await db
      .prepare(
        "SELECT kind, locale, slug, title, description, translation_key, published_at, updated_at, seo, body_md FROM pages WHERE kind = 'post' AND locale = ?1 AND status = 'published' AND body_md IS NOT NULL AND body_md != '' ORDER BY published_at DESC LIMIT ?2",
      )
      .bind(locale, limit)
      .all<Row & { body_md: string }>();
    const rows = results ?? [];
    const bodies = new Map(rows.map((r) => [localePath(locale, ROUTE_FOR_KIND.post(r.slug)), r.body_md]));
    return pagesFromRows(rows).flatMap((p) => {
      const markdown = bodies.get(p.path);
      return markdown ? [{ path: p.path, title: p.title, markdown }] : [];
    });
  } catch (err) {
    console.error("seo: post markdown query failed", err instanceof Error ? err.message : err);
    return [];
  }
}
