/**
 * The build-time list of prerendered pages (written by scripts/postbuild-markdown-and-og.ts into
 * dist/client/_seo/manifest.json) and the worker-side loader. Sitemaps and llms files are built
 * from it, so every prerendered page is picked up without a hand-written route list.
 */
import { z } from "zod";
import type { SectionId } from "./page-sections.ts";

export const SEO_MANIFEST_ASSET = "/_seo/manifest.json";
/** Pre-concatenated Markdown twins of the English pages, served by /llms-full.txt. */
export const LLMS_FULL_ASSET = "/_seo/llms-full.md";

export type SeoPage = {
  /** Localised pathname, e.g. `/vi/pricing` */
  path: string;
  /** Unprefixed path, e.g. `/pricing` */
  route: string;
  locale: "en" | "vi";
  title: string;
  description: string;
  section: SectionId;
  /** ISO-8601 date of the last content change we can vouch for */
  lastmod: string;
  noindex: boolean;
  /** hreflang alternates the page declares itself (site-relative paths) */
  alternates: { hreflang: string; path: string }[];
  /** Site-relative Markdown twin, e.g. `/vi/pricing.md` */
  twin: string;
};

export type SeoManifest = { version: 1; site: string; generatedAt: string; pages: SeoPage[] };

const pageSchema = z.object({
  path: z.string().startsWith("/"),
  route: z.string().startsWith("/"),
  locale: z.enum(["en", "vi"]),
  title: z.string(),
  description: z.string(),
  section: z.string(),
  lastmod: z.string(),
  noindex: z.boolean(),
  alternates: z.array(z.object({ hreflang: z.string(), path: z.string().startsWith("/") })),
  twin: z.string().startsWith("/"),
});
const manifestSchema = z.object({ version: z.literal(1), site: z.string(), generatedAt: z.string(), pages: z.array(pageSchema) });

let cached: Promise<SeoManifest | null> | null = null;

/**
 * Reads the manifest from the static assets once per isolate. Returns null (and logs) when the
 * build did not produce one, so discovery routes degrade to their dynamic part instead of failing.
 */
export function loadSeoManifest(assets: Fetcher): Promise<SeoManifest | null> {
  cached ??= (async () => {
    try {
      const res = await assets.fetch(new Request(`https://assets.local${SEO_MANIFEST_ASSET}`));
      if (!res.ok) {
        console.error("seo manifest missing", res.status);
        return null;
      }
      const parsed = manifestSchema.safeParse(await res.json());
      if (!parsed.success) {
        console.error("seo manifest invalid", parsed.error.issues.slice(0, 3));
        return null;
      }
      return parsed.data as SeoManifest;
    } catch (err) {
      console.error("seo manifest load failed", err instanceof Error ? err.message : err);
      return null;
    }
  })();
  const pending = cached;
  // A failed load is retried on the next request instead of being cached for the isolate's life.
  pending.then((m) => { if (!m && cached === pending) cached = null; });
  return pending;
}

/** Pages that belong in sitemaps and llms files. */
export function indexablePages(manifest: SeoManifest | null): SeoPage[] {
  return (manifest?.pages ?? []).filter((p) => !p.noindex);
}
