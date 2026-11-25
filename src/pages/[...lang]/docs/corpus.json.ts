/**
 * Prerendered docs corpus for one locale: /docs/corpus.json and /vi/docs/corpus.json. Every page
 * with its full Markdown, so the worker's public docs MCP tools (search_docs, fetch_doc) answer
 * from what is deployed. The worker reads it through the ASSETS binding.
 */
import type { APIRoute } from "astro";
import { langPaths, pick, type Locale } from "~/i18n/config";
import { DOC_SECTIONS } from "~/content/pages/docs";
import { getDocPages, markdownForExport } from "~/lib/docs";
import type { CorpusDoc } from "~/lib/server/docs/public-docs-search";

export const prerender = true;
export const getStaticPaths = () => langPaths();

export const GET: APIRoute = async ({ props }) => {
  const { locale } = props as { locale: Locale };
  const pages = await getDocPages(locale);
  const docs: CorpusDoc[] = pages.map(({ slug, url, entry }) => {
    const section = DOC_SECTIONS.find((s) => s.id === entry.data.section);
    const headings = (entry.rendered?.metadata?.headings ?? []) as { depth: number; slug: string; text: string }[];
    return {
      slug,
      url,
      title: entry.data.title,
      description: entry.data.description,
      section: entry.data.section,
      sectionTitle: section ? pick(section.title, locale) : entry.data.section,
      headings: headings.filter((h) => h.depth === 2 || h.depth === 3).map((h): [string, string] => [h.text, h.slug]),
      markdown: markdownForExport(entry.body ?? "", locale).trim(),
    };
  });
  return new Response(JSON.stringify(docs), {
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "public, max-age=600" },
  });
};
