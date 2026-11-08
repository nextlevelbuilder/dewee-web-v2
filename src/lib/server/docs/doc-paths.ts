/**
 * Where a docs page lives in the repository. Callers name a page by `section` + `slug`; only this
 * module turns that into a path, so a proposal can never reach a file outside
 * `src/content/docs/{en,vi}/<section>/<slug>.md`.
 */
import { z } from "zod";
import { DOC_SECTION_IDS, type DocSectionId } from "~/content/pages/docs";

export const DOC_LOCALES = ["en", "vi"] as const;
export type DocLocale = (typeof DOC_LOCALES)[number];

export const DOCS_ROOT = "src/content/docs";
export const DOC_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const docSlugSchema = z.string().min(2).max(80).regex(DOC_SLUG_RE, "Use lowercase letters, digits and single hyphens, e.g. install-and-run.");
export const docSectionSchema = z.enum(DOC_SECTION_IDS);
export const docLocaleSchema = z.enum(DOC_LOCALES);

export type DocRef = { section: DocSectionId; slug: string };

/** `get-started/quickstart`: the id shared by both locales and used in /docs URLs. */
export const docId = (ref: DocRef) => `${ref.section}/${ref.slug}`;

export function docPath(locale: DocLocale, ref: DocRef): string {
  return `${DOCS_ROOT}/${locale}/${ref.section}/${ref.slug}.md`;
}

/** The inverse of docPath for paths read from Git; null for anything that is not a docs page. */
export function parseDocPath(path: string): ({ locale: DocLocale } & DocRef) | null {
  const m = /^src\/content\/docs\/(en|vi)\/([a-z-]+)\/([a-z0-9-]+)\.md$/.exec(path);
  if (!m) return null;
  const section = docSectionSchema.safeParse(m[2]);
  if (!section.success || !DOC_SLUG_RE.test(m[3])) return null;
  return { locale: m[1] as DocLocale, section: section.data, slug: m[3] };
}

export function docUrl(locale: DocLocale, ref: DocRef): string {
  return `${locale === "vi" ? "/vi" : ""}/docs/${docId(ref)}`;
}
