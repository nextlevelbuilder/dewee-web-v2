/**
 * search_docs and fetch_doc: read-only MCP tools over the published docs. They need no sign-in, so
 * they are served to anonymous callers of /mcp (and the /mcp/docs alias) and listed for every signed-in caller.
 * Content comes from the deployed corpus (see src/pages/[...lang]/docs/corpus.json.ts), never Git.
 */
import { z } from "zod";
import { SITE } from "../../../content/site";
import { ApiError, notFound } from "../api/api-errors";
import type { McpServer, ToolDef } from "../mcp/json-rpc";
import { readCorpusDoc, searchCorpus, type CorpusDoc } from "./public-docs-search";

export type PublicDocsCtx = { env: Pick<Env, "ASSETS" | "SITE_URL"> };

const localeField = z.enum(["en", "vi"]).default("en").describe("en (default) or vi.");

const searchInput = z
  .object({
    query: z.string().trim().min(1).max(200).describe("Words to find, e.g. `GOCLAW_PUBLIC_URL`, `reverse proxy` or `kênh Zalo`. Accents are optional."),
    locale: localeField,
    limit: z.number().int().min(1).max(20).default(8).describe("Most results to return (1–20, default 8)."),
  })
  .strict();

const fetchInput = z
  .object({
    slug: z.string().trim().min(1).max(300).describe("Page slug from search_docs (e.g. `runtime/environment-variables`), or its /docs path or full URL."),
    locale: localeField,
    offset: z.number().int().min(0).default(0).describe("Start position in the Markdown; pass next_offset from the last reply to read on."),
    max_chars: z.number().int().min(1000).max(40000).default(20000).describe("Most characters of Markdown to return (1000–40000, default 20000)."),
  })
  .strict();

/** Assets are immutable per deploy, so each isolate keeps the corpus once it has read it. */
const cache = new Map<string, Promise<CorpusDoc[]>>();

async function loadCorpus(env: PublicDocsCtx["env"], locale: "en" | "vi"): Promise<CorpusDoc[]> {
  let pending = cache.get(locale);
  if (!pending) {
    const path = locale === "vi" ? "/vi/docs/corpus.json" : "/docs/corpus.json";
    pending = env.ASSETS.fetch(new Request(`https://assets.local${path}`)).then(async (res) => {
      if (!res.ok) throw new Error(`docs corpus ${path}: HTTP ${res.status}`);
      return (await res.json()) as CorpusDoc[];
    });
    cache.set(locale, pending);
    pending.catch(() => cache.delete(locale));
  }
  try {
    return await pending;
  } catch (err) {
    console.error("public docs: corpus unavailable", err instanceof Error ? err.message : err);
    throw new ApiError(503, "upstream_error", "The docs index is not available right now. Try again later.");
  }
}

const origin = (env: PublicDocsCtx["env"]) => (env.SITE_URL || SITE.url).replace(/\/$/, "");

export const PUBLIC_DOCS_TOOLS: readonly ToolDef<PublicDocsCtx>[] = [
  {
    name: "search_docs",
    title: "Search the dewee docs",
    description:
      "Full-text search over the published dewee docs at dewee.sh/docs (what is deployed, in English or Vietnamese). Every query word must appear in a page; titles and headings rank first. Returns slug, title, section, URL, the best matching heading and a snippet. Read a result with fetch_doc.",
    input: searchInput,
    annotations: { readOnlyHint: true, openWorldHint: false },
    run: async (args, ctx) => {
      const a = searchInput.parse(args);
      const results = searchCorpus(await loadCorpus(ctx.env, a.locale), a.query, a.limit, origin(ctx.env));
      return { query: a.query, locale: a.locale, results };
    },
  },
  {
    name: "fetch_doc",
    title: "Read a dewee docs page",
    description:
      "Read one published dewee docs page as Markdown, with its title, description, section, headings and URL. Long pages come in pieces: when next_offset is present, call again with offset set to it.",
    input: fetchInput,
    annotations: { readOnlyHint: true, openWorldHint: false },
    run: async (args, ctx) => {
      const a = fetchInput.parse(args);
      const doc = readCorpusDoc(await loadCorpus(ctx.env, a.locale), a.slug, a.offset, a.max_chars, origin(ctx.env));
      if (!doc) throw notFound(`No ${a.locale} docs page "${a.slug}". Use search_docs to find the slug.`);
      return doc;
    },
  },
];

/** The anonymous, read-only server behind /mcp without credentials (and the /mcp/docs alias). */
export const PUBLIC_DOCS_MCP_SERVER: McpServer<PublicDocsCtx> = {
  name: "dewee-docs",
  title: "dewee docs",
  version: "1.0.0",
  instructions:
    "Read-only access to the published dewee documentation (dewee.sh/docs), in English (en) and Vietnamese (vi). Use search_docs to find pages, then fetch_doc to read one as Markdown. No sign-in is needed.",
  tools: PUBLIC_DOCS_TOOLS,
};
