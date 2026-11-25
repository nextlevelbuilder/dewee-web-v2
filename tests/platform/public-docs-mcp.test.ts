/**
 * The public docs MCP tools: full-text search over the deployed corpus (including words deep in
 * a page and Vietnamese without accents), paged reads, slug forms, and an anonymous server that
 * offers only these two read-only tools.
 */
import { describe, expect, it, vi } from "vitest";
import { handleMessage } from "~/lib/server/mcp/json-rpc";
import { normaliseSlug, readCorpusDoc, searchCorpus, type CorpusDoc } from "~/lib/server/docs/public-docs-search";
import { PUBLIC_DOCS_MCP_SERVER, type PublicDocsCtx } from "~/lib/server/docs/public-docs-mcp-tools";

vi.mock("cloudflare:workers", () => ({ env: {} }));

const ORIGIN = "https://dewee.sh";
const filler = "Lorem ipsum dolor sit amet. ".repeat(200);

const EN: CorpusDoc[] = [
  {
    slug: "runtime/environment-variables",
    url: "/docs/runtime/environment-variables",
    title: "Environment variables",
    description: "Every environment variable dewee reads.",
    section: "runtime",
    sectionTitle: "Runtime",
    headings: [["Proactive agents", "proactive-agents"]],
    markdown: `## Intro\n\n${filler}\n\n## Proactive agents\n\n| \`DEWEE_PROACTIVE_AGENTS_KILL\` | Forces every flag above off. |`,
  },
  {
    slug: "get-started/self-install",
    url: "/docs/get-started/self-install",
    title: "Self-install",
    description: "Install dewee on your own machine.",
    section: "get-started",
    sectionTitle: "Get started",
    headings: [["Reverse proxy", "reverse-proxy"]],
    markdown: "## Reverse proxy\n\nSet `DEWEE_TRUSTED_PROXY_CIDRS` when a reverse proxy sits in front.",
  },
];

const VI: CorpusDoc[] = [
  {
    slug: "integrations/zalo",
    url: "/vi/docs/integrations/zalo",
    title: "Kênh Zalo",
    description: "Kết nối Zalo với dewee.",
    section: "integrations",
    sectionTitle: "Tích hợp",
    headings: [],
    markdown: "Kết nối kênh Zalo OA trong console.",
  },
];

describe("searchCorpus", () => {
  it("finds a variable name buried deep in a long page", () => {
    const hits = searchCorpus(EN, "DEWEE_PROACTIVE_AGENTS_KILL", 8, ORIGIN);
    expect(hits.map((h) => h.slug)).toEqual(["runtime/environment-variables"]);
    expect(hits[0].snippet).toContain("DEWEE_PROACTIVE_AGENTS_KILL");
    expect(hits[0].url).toBe("https://dewee.sh/docs/runtime/environment-variables");
  });

  it("needs every word and ranks titles first", () => {
    expect(searchCorpus(EN, "reverse proxy", 8, ORIGIN)[0].slug).toBe("get-started/self-install");
    expect(searchCorpus(EN, "reverse nonexistentword", 8, ORIGIN)).toEqual([]);
  });

  it("matches Vietnamese without accents", () => {
    expect(searchCorpus(VI, "kenh zalo", 8, ORIGIN).map((h) => h.slug)).toEqual(["integrations/zalo"]);
  });
});

describe("readCorpusDoc", () => {
  it("accepts a slug, a docs path or a full URL", () => {
    for (const input of ["runtime/environment-variables", "/docs/runtime/environment-variables#x", "https://dewee.sh/vi/docs/runtime/environment-variables", "/docs/runtime/environment-variables.md"]) {
      expect(normaliseSlug(input)).toBe("runtime/environment-variables");
    }
    expect(readCorpusDoc(EN, "nope/missing", 0, 1000, ORIGIN)).toBeNull();
  });

  it("returns long pages in pieces that join back into the whole page", () => {
    const first = readCorpusDoc(EN, "runtime/environment-variables", 0, 1000, ORIGIN)!;
    expect(first.markdown).toHaveLength(1000);
    expect(first.next_offset).toBe(1000);
    let text = first.markdown;
    let next = first.next_offset;
    while (next !== undefined) {
      const part = readCorpusDoc(EN, "runtime/environment-variables", next, 1000, ORIGIN)!;
      text += part.markdown;
      next = part.next_offset;
    }
    expect(text).toBe(EN[0].markdown);
  });
});

describe("public docs MCP server", () => {
  const assets = { fetch: async (req: Request) => new Response(JSON.stringify(new URL(req.url).pathname.startsWith("/vi/") ? VI : EN)) };
  const ctx = { env: { ASSETS: assets, SITE_URL: "" } } as unknown as PublicDocsCtx;

  it("lists only read-only docs tools, without credentials", async () => {
    const res = (await handleMessage(PUBLIC_DOCS_MCP_SERVER, { jsonrpc: "2.0", id: 1, method: "tools/list" }, ctx)) as { result: { tools: { name: string; annotations: { readOnlyHint: boolean } }[] } };
    expect(res.result.tools.map((t) => t.name)).toEqual(["search_docs", "fetch_doc"]);
    expect(res.result.tools.every((t) => t.annotations.readOnlyHint)).toBe(true);
  });

  it("searches and reads through tools/call", async () => {
    const search = (await handleMessage(PUBLIC_DOCS_MCP_SERVER, { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "search_docs", arguments: { query: "kenh zalo", locale: "vi" } } }, ctx)) as {
      result: { structuredContent: { results: { slug: string }[] } };
    };
    expect(search.result.structuredContent.results[0].slug).toBe("integrations/zalo");

    const missing = (await handleMessage(PUBLIC_DOCS_MCP_SERVER, { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "fetch_doc", arguments: { slug: "nope" } } }, ctx)) as { result: { isError: boolean } };
    expect(missing.result.isError).toBe(true);
  });
});
