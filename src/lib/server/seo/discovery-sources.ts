/**
 * Everything the discovery routes list, from two sources: the build manifest of prerendered pages
 * (static assets) and D1 (published posts and pages, the blog index, the changelog). Worker-only.
 */
import { LOCALES, type Locale } from "~/i18n/config";
import { NAV_COMPANY } from "~/content/site";
import { CHANGELOG } from "~/content/pages/changelog";
import { indexablePages, loadSeoManifest, type SeoManifest, type SeoPage } from "./seo-manifest";
import { listDynamicPages, type DynamicPage, type IndexCopy } from "./dynamic-pages";
import { isExcludedPath } from "./sitemap-xml";

const byLocale = <T>(get: (locale: Locale) => T) => Object.fromEntries(LOCALES.map((l) => [l, get(l)])) as Record<Locale, T>;

const blogNav = NAV_COMPANY.items.find((i) => i.href === "/blog");

/** Titles and descriptions of the server-rendered index pages, from the copy the pages use. */
export const INDEX_COPY: { changelog: IndexCopy; blog: IndexCopy } = {
  changelog: {
    title: byLocale((l) => CHANGELOG[l].meta.title),
    description: byLocale((l) => CHANGELOG[l].meta.description),
  },
  blog: {
    title: byLocale((l) => (blogNav ? `dewee ${blogNav.label[l]}` : "dewee blog")),
    description: byLocale((l) => blogNav?.description?.[l] ?? ""),
  },
};

export type DiscoverySources = {
  manifest: SeoManifest | null;
  /** Indexable prerendered pages */
  staticPages: SeoPage[];
  /** Indexable server-rendered pages */
  dynamicPages: DynamicPage[];
};

export async function loadDiscovery(env: Pick<Env, "ASSETS" | "DB">): Promise<DiscoverySources> {
  const [manifest, dynamic] = await Promise.all([loadSeoManifest(env.ASSETS), listDynamicPages(env.DB, INDEX_COPY)]);
  const staticPages = indexablePages(manifest).filter((p) => !isExcludedPath(p.path));
  const staticPaths = new Set(staticPages.map((p) => p.path));
  // A prerendered page wins over a D1 row at the same path (the static asset is what gets served).
  const dynamicPages = dynamic.filter((p) => !isExcludedPath(p.path) && !staticPaths.has(p.path));
  return { manifest, staticPages, dynamicPages };
}
