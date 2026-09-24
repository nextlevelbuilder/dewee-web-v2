/**
 * Prerendered search index for one locale: /docs/search-index.json and /vi/docs/search-index.json.
 * DocsSearch fetches it on first focus. Short keys (see SearchDoc) keep it small.
 */
import type { APIRoute } from "astro";
import { langPaths, pick, type Locale } from "~/i18n/config";
import { DOC_SECTIONS } from "~/content/pages/docs";
import { getDocPages, SHOT_LINE_RE } from "~/lib/docs";
import type { SearchDoc } from "~/components/docs/docs-search-core";

export const prerender = true;
export const getStaticPaths = () => langPaths();

const EXCERPT_CHARS = 1200;

/** Markdown → plain text, good enough for matching words (not for display). */
function plainText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(SHOT_LINE_RE, " ")
    .replace(/^>\s*\[![a-z]+\]/gim, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+>]\s?/gm, " ")
    .replace(/\|/g, " ")
    .replace(/[*_`~]|-{3,}/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, EXCERPT_CHARS);
}

export const GET: APIRoute = async ({ props }) => {
  const { locale } = props as { locale: Locale };
  const pages = await getDocPages(locale);
  const docs: SearchDoc[] = pages.map(({ url, entry }) => {
    const section = DOC_SECTIONS.find((s) => s.id === entry.data.section);
    const headings = (entry.rendered?.metadata?.headings ?? []) as { depth: number; slug: string; text: string }[];
    return {
      t: entry.data.title,
      s: section ? pick(section.title, locale) : entry.data.section,
      d: entry.data.description,
      u: url,
      h: headings.filter((h) => h.depth === 2 || h.depth === 3).map((h): [string, string] => [h.text, h.slug]),
      x: plainText(entry.body ?? ""),
    };
  });
  return new Response(JSON.stringify(docs), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=600" },
  });
};
