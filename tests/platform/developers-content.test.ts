/**
 * Keeps /developers honest: the MCP tools and API scopes it documents must be the ones the server
 * really has, both languages must describe the same things, and the meta fits the SEO limits.
 */
import { describe, expect, it, vi } from "vitest";
import { LOCALES } from "~/i18n/config";
import { DEVELOPERS } from "~/content/pages/developers";
import { BLOG } from "~/content/pages/blog";
import { MCP_TOOLS } from "~/lib/server/mcp/mcp-tools";
import { API_SCOPES } from "~/lib/server/auth/api-key-format";

// The tool table sits behind the Worker's auth module; only the names are read here.
vi.mock("cloudflare:workers", () => ({ env: {} }));

describe("/developers content", () => {
  it("lists exactly the MCP server's tools, in order", () => {
    const served = MCP_TOOLS.map((t) => t.name);
    for (const locale of LOCALES) {
      expect(DEVELOPERS[locale].mcp.tools.map((t) => t.name)).toEqual(served);
    }
    expect(served).toHaveLength(16);
  });

  it("documents exactly the API key scopes", () => {
    for (const locale of LOCALES) {
      expect(DEVELOPERS[locale].api.scopes.rows.map((r) => r[0])).toEqual([...API_SCOPES]);
    }
  });

  it("describes the same facts, samples and tools in both languages", () => {
    const { en, vi } = DEVELOPERS;
    expect(vi.api.facts.map((f) => f.code)).toEqual(en.api.facts.map((f) => f.code));
    expect(vi.api.snippets.map((s) => s.code)).toEqual(en.api.snippets.map((s) => s.code));
    expect(vi.cli.snippets.map((s) => s.code)).toEqual(en.cli.snippets.map((s) => s.code));
    expect(vi.webmcp.publicTools.map((t) => t.name)).toEqual(en.webmcp.publicTools.map((t) => t.name));
    expect(vi.webmcp.adminTools.map((t) => t.name)).toEqual(en.webmcp.adminTools.map((t) => t.name));
    expect(vi.markdown.items.map((i) => i.code)).toEqual(en.markdown.items.map((i) => i.code));
    expect(vi.index.items.map((i) => i.href)).toEqual(en.index.items.map((i) => i.href));
  });

  it("sends Content-Type: application/json on every JSON write sample", () => {
    const writes = DEVELOPERS.en.api.snippets.filter((s) => /-X (POST|PATCH|DELETE)/.test(s.code) && !s.code.includes("--data-binary"));
    expect(writes.length).toBeGreaterThan(0);
    for (const s of writes) expect(s.code).toContain('-H "Content-Type: application/json"');
  });

  it("never points at /api-docs, which belongs to another worker", () => {
    expect(JSON.stringify(DEVELOPERS)).not.toContain("/api-docs");
  });
});

describe("platform page meta", () => {
  for (const locale of LOCALES) {
    it(`developers and blog (${locale}) fit the title and description limits`, () => {
      const dev = DEVELOPERS[locale].meta;
      expect(dev.title.length).toBeLessThanOrEqual(60);
      for (const description of [dev.description, BLOG.meta.description[locale]]) {
        expect(description.length).toBeGreaterThanOrEqual(140);
        expect(description.length).toBeLessThanOrEqual(160);
      }
    });
  }
});
