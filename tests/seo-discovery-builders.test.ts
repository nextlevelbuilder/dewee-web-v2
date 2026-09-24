import { describe, expect, it } from "vitest";
import { isExcludedPath, newest, sitemapIndexXml, toSitemapUrls, urlsetXml, w3cDate, xmlEscape } from "../src/lib/server/seo/sitemap-xml";
import { AI_CRAWLERS, robotsTxt } from "../src/lib/server/seo/robots-txt";
import { llmsTxt, type LlmsLink } from "../src/lib/server/seo/llms-txt";
import { demoteHeadings, fullTextSection, joinWithinBudget, stripFrontMatter } from "../src/lib/server/seo/llms-full-text";
import { markdownTwinPath, ogDefaultPath, ogImagePath, ogSlug, pageForTwin, pathForHtmlFile, ssrOgImagePath } from "../src/lib/server/seo/seo-paths";
import { fullTextRank, sectionOf } from "../src/lib/server/seo/page-sections";
import { pagesFromRows } from "../src/lib/server/seo/dynamic-pages";

const pair = (route: string) => [
  { hreflang: "en", path: route },
  { hreflang: "vi", path: route === "/" ? "/vi" : `/vi${route}` },
  { hreflang: "x-default", path: route },
];

describe("sitemaps", () => {
  it("excludes machine, private, error and query URLs", () => {
    for (const p of ["/admin", "/admin/pages", "/api/chat", "/mcp", "/vi/404", "/500", "/_seo/manifest.json", "/pricing?x=1"]) {
      expect(isExcludedPath(p), p).toBe(true);
    }
    for (const p of ["/", "/vi", "/pricing", "/api-docs", "/administrators"]) expect(isExcludedPath(p), p).toBe(false);
  });

  it("pairs hreflang alternates only when both languages are listed", () => {
    const urls = toSitemapUrls([
      { path: "/pricing", alternates: pair("/pricing") },
      { path: "/vi/pricing", alternates: pair("/pricing") },
      { path: "/story", alternates: pair("/story") },
    ]);
    expect(urls[0].alternates?.map((a) => a.hreflang)).toEqual(["en", "vi", "x-default"]);
    expect(urls[2].alternates).toEqual([]);
  });

  it("writes a urlset with lastmod and escaped xhtml alternates", () => {
    const xml = urlsetXml("https://dewee.sh/", [{ path: "/a&b", lastmod: "2026-09-20T08:30:00.123Z", alternates: [{ hreflang: "en", path: "/a&b" }] }, { path: "/c", lastmod: "nope" }]);
    expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
    expect(xml).toContain("<loc>https://dewee.sh/a&amp;b</loc>");
    expect(xml).toContain("<lastmod>2026-09-20T08:30:00Z</lastmod>");
    expect(xml).toContain('<xhtml:link rel="alternate" hreflang="en" href="https://dewee.sh/a&amp;b"/>');
    expect(xml.match(/<lastmod>/g)).toHaveLength(1);
  });

  it("writes the index and picks the newest lastmod", () => {
    const xml = sitemapIndexXml("https://dewee.sh", [{ path: "/sitemap-pages.xml", lastmod: newest(["2026-01-01", undefined, "2026-09-01T00:00:00Z", "junk"]) }]);
    expect(xml).toContain("<loc>https://dewee.sh/sitemap-pages.xml</loc>");
    expect(xml).toContain("<lastmod>2026-09-01T00:00:00Z</lastmod>");
    expect(newest([undefined, "junk"])).toBeUndefined();
    expect(w3cDate(null)).toBeUndefined();
    expect(xmlEscape(`<"'&>`)).toBe("&lt;&quot;&apos;&amp;&gt;");
  });
});

describe("robots.txt", () => {
  it("welcomes crawlers, AI crawlers included, and fences the private routes in production", () => {
    const txt = robotsTxt({ siteUrl: "https://dewee.sh/", production: true });
    expect(txt).toContain("User-agent: *\nAllow: /\nAllow: /api/v1/openapi.json\nDisallow: /admin\nDisallow: /api/\nDisallow: /mcp\n");
    for (const bot of AI_CRAWLERS) expect(txt).toContain(`User-agent: ${bot}\n`);
    expect(txt).toContain("Sitemap: https://dewee.sh/sitemap.xml");
    expect(txt).not.toMatch(/Disallow: \/\n/);
  });

  it("closes staging to everyone", () => {
    const txt = robotsTxt({ siteUrl: "https://staging.dewee.sh", production: false });
    expect(txt).toContain("User-agent: *\nDisallow: /\n");
    expect(txt).not.toContain("Sitemap:");
  });
});

describe("llms.txt", () => {
  const links: LlmsLink[] = [
    { title: "dewee [home]", href: "/index.md", description: "Enterprise AI agents,\n  on your terms.", section: "home" },
    { title: "Security", href: "/security.md", description: "", section: "product" },
    { title: "Pricing", href: "/pricing.md", description: "Plans", section: "pricing" },
    { title: "Odd page", href: "/p/odd.md", description: "", section: "pages" },
  ];
  const txt = llmsTxt({
    locale: "en",
    siteUrl: "https://dewee.sh/",
    name: "dewee",
    intro: { summary: { en: "Summary.", vi: "Tóm tắt." }, note: { en: "See {site}/llms-full.txt or write to {email}.", vi: "" } },
    email: "hi@nextlevelbuilder.io",
    links,
  });

  it("follows the llmstxt.org shape: H1, blockquote, note, H2 link sections", () => {
    expect(txt.startsWith("# dewee\n\n> Summary.\n\nSee https://dewee.sh/llms-full.txt or write to hi@nextlevelbuilder.io.\n\n## Product\n\n")).toBe(true);
    expect(txt).toContain("- [dewee home](https://dewee.sh/index.md): Enterprise AI agents, on your terms.\n- [Security](https://dewee.sh/security.md)\n");
    expect(txt).toContain("## Pricing & legal\n\n- [Pricing](https://dewee.sh/pricing.md): Plans");
    expect(txt.indexOf("## Optional")).toBeGreaterThan(txt.indexOf("## Pricing & legal"));
    expect(txt).not.toContain("## Docs");
    expect(txt.endsWith(".md)\n")).toBe(true);
  });
});

describe("llms-full.txt", () => {
  it("heads each section with its title and source and keeps one heading hierarchy", () => {
    const section = fullTextSection({ title: "Pricing", url: "https://dewee.sh/pricing", markdown: "---\ntitle: Pricing\n---\n\n# Pricing\n\nIntro\n\n## Plans\n\n```\n# not a heading\n```" });
    expect(section).toBe("# Pricing\n\nSource: https://dewee.sh/pricing\n\nIntro\n\n### Plans\n\n```\n# not a heading\n```\n");
    expect(stripFrontMatter("no front matter")).toBe("no front matter");
    expect(demoteHeadings("###### six")).toBe("###### six");
  });

  it("stops before the byte budget, counting UTF-8 bytes", () => {
    const vi = "ư".repeat(10);
    expect(joinWithinBudget(["a", "b", "c"], 4)).toEqual({ text: "a\nb", included: 2 });
    expect(joinWithinBudget([vi], 20).included).toBe(0);
    expect(joinWithinBudget([vi], 21).included).toBe(1);
  });
});

describe("SEO paths and sections", () => {
  it("maps pages to Markdown twins and back", () => {
    expect(markdownTwinPath("/")).toBe("/index.md");
    expect(markdownTwinPath("/vi")).toBe("/vi.md");
    expect(markdownTwinPath("/docs/setup/")).toBe("/docs/setup.md");
    expect(pageForTwin("/index.md")).toBe("/");
    expect(pageForTwin("/vi.md")).toBe("/vi");
    expect(pageForTwin("/docs/setup.md")).toBe("/docs/setup");
  });

  it("names social cards per locale and page", () => {
    expect(ogSlug("/")).toBe("index");
    expect(ogSlug("/docs/a/b/")).toBe("docs--a--b");
    expect(ogImagePath("vi", "/pricing")).toBe("/og/vi/pricing.png");
    expect(ogDefaultPath("en")).toBe("/og/en/default.png");
  });

  it("gives server-rendered pages their section card, else the default", () => {
    expect(ssrOgImagePath("vi", "/blog")).toBe("/og/vi/blog.png");
    expect(ssrOgImagePath("en", "/blog/hello-world")).toBe("/og/en/blog.png");
    expect(ssrOgImagePath("en", "/changelog")).toBe("/og/en/changelog.png");
    expect(ssrOgImagePath("en", "/blogroll")).toBe("/og/en/default.png");
    expect(ssrOgImagePath("vi", "/p/landing")).toBe("/og/vi/default.png");
  });

  it("maps build output files to served paths", () => {
    expect(pathForHtmlFile("index.html")).toBe("/");
    expect(pathForHtmlFile("vi.html")).toBe("/vi");
    expect(pathForHtmlFile("docs/index.html")).toBe("/docs");
    expect(pathForHtmlFile("use-cases\\sales.html")).toBe("/use-cases/sales");
  });

  it("classifies pages by path, docs first in the full text", () => {
    expect(sectionOf("/")).toBe("home");
    expect(sectionOf("/roadmap")).toBe("product");
    expect(sectionOf("/docs/install")).toBe("docs");
    expect(sectionOf("/blog/hello")).toBe("blog");
    expect(sectionOf("/p/landing")).toBe("pages");
    expect(sectionOf("/somewhere")).toBe("other");
    expect(fullTextRank("docs")).toBeLessThan(fullTextRank("product"));
    expect(fullTextRank("product")).toBeLessThan(fullTextRank("legal"));
  });
});

describe("pagesFromRows", () => {
  const row = (over: Partial<Parameters<typeof pagesFromRows>[0][number]>) => ({
    kind: "post",
    locale: "en",
    slug: "hello-world",
    title: "Hello",
    description: null,
    translation_key: null,
    published_at: "2026-09-01T00:00:00Z",
    updated_at: null,
    seo: null,
    ...over,
  });

  it("routes posts and pages, pairing translations that share a slug", () => {
    const pages = pagesFromRows([row({ translation_key: "k" }), row({ locale: "vi", translation_key: "k", updated_at: "2026-09-02T00:00:00Z" }), row({ kind: "page", slug: "landing" })]);
    expect(pages.map((p) => p.path)).toEqual(["/blog/hello-world", "/vi/blog/hello-world", "/p/landing"]);
    expect(pages[0].alternates.map((a) => a.path)).toEqual(["/blog/hello-world", "/vi/blog/hello-world", "/blog/hello-world"]);
    expect(pages[1]).toMatchObject({ twin: "/vi/blog/hello-world.md", lastmod: "2026-09-02T00:00:00Z", section: "blog", description: "" });
    expect(pages[2].alternates).toEqual([]);
  });

  it("pairs a translation whose slug differs, as the post page declares it", () => {
    const pages = pagesFromRows([row({ translation_key: "k" }), row({ locale: "vi", slug: "xin-chao", translation_key: "k" }), row({ locale: "vi", slug: "other", translation_key: "z" })]);
    expect(pages[0].alternates).toEqual([
      { hreflang: "en", path: "/blog/hello-world" },
      { hreflang: "vi", path: "/vi/blog/xin-chao" },
      { hreflang: "x-default", path: "/blog/hello-world" },
    ]);
    expect(pages[1].alternates).toEqual(pages[0].alternates);
    expect(pages[2].alternates).toEqual([]);
  });

  it("drops noindex rows, unknown kinds and locales, and unsafe slugs", () => {
    const pages = pagesFromRows([
      row({ seo: '{"noindex":true}' }),
      row({ kind: "draft" }),
      row({ locale: "fr" }),
      row({ slug: "../admin" }),
      row({ slug: "Upper" }),
      row({ seo: "not json", slug: "kept" }),
    ]);
    expect(pages.map((p) => p.path)).toEqual(["/blog/kept"]);
  });
});
