import { describe, expect, it } from "vitest";
import { isSafeHref, isSafeImageSrc } from "../../src/lib/blocks/block-fields";
import { BLOCK_TYPES, BLOCKS, blockJsonSchema, listBlocks, validateBlocks } from "../../src/lib/blocks/registry";
import { markdownHeadings, readingMinutes, renderMarkdown } from "../../src/lib/blocks/safe-markdown";

describe("block registry", () => {
  it("covers the marketing blocks and the primitives", () => {
    for (const t of ["PageHero", "SectionHead", "FeatureGrid", "Steps", "Faq", "Quote", "CtaBand", "Timeline", "ProofStrip", "TocIndex", "LogoWall", "EcosystemGrid", "RichText", "Image", "Callout", "ButtonRow", "Columns", "Divider", "Spacer"]) {
      expect(BLOCK_TYPES).toContain(t);
    }
    expect(BLOCK_TYPES).not.toContain("Embed");
    expect(listBlocks()).toHaveLength(BLOCKS.length);
  });

  it("every example validates against its own schema", () => {
    for (const def of BLOCKS) {
      const res = validateBlocks([{ type: def.type, props: def.example }]);
      expect(res.ok, `${def.type}: ${JSON.stringify(!res.ok && res.issues)}`).toBe(true);
    }
  });

  it("exposes a JSON Schema per block", () => {
    const schema = blockJsonSchema("FeatureGrid");
    expect(schema).not.toBeNull();
    expect((schema!.props as { type: string }).type).toBe("object");
    expect(blockJsonSchema("Nope")).toBeNull();
  });

  it("reports unknown types, bad props and extra keys with paths", () => {
    const res = validateBlocks([
      { type: "Marquee", props: {} },
      { type: "Quote", props: { text: "" } },
      { type: "Divider", props: {}, style: "x" },
      { type: "FeatureGrid", props: { items: [{ icon: "not-an-icon", title: "a", body: "b" }] } },
    ]);
    expect(res.ok).toBe(false);
    if (res.ok) return;
    const paths = res.issues.map((i) => i.path);
    expect(paths).toContain("blocks.0.type");
    expect(paths).toContain("blocks.1.props.text");
    expect(paths).toContain("blocks.2");
    expect(paths).toContain("blocks.3.props.items.0.icon");
  });

  it("rejects unsafe links and image sources", () => {
    const bad = validateBlocks([
      { type: "ButtonRow", props: { buttons: [{ label: "x", href: "javascript:alert(1)" }] } },
      { type: "Image", props: { src: "http://example.com/a.png", alt: "" } },
      { type: "Image", props: { src: "data:image/png;base64,AAAA", alt: "" } },
      { type: "ButtonRow", props: { buttons: [{ label: "x", href: "//evil.example" }] } },
    ]);
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.issues).toHaveLength(4);
    expect(isSafeHref("/pricing#plans")).toBe(true);
    expect(isSafeHref("mailto:hi@nextlevelbuilder.io")).toBe(true);
    expect(isSafeHref("JavaScript:alert(1)")).toBe(false);
    expect(isSafeImageSrc("/media/media/2026/09/a.png")).toBe(true);
    expect(isSafeImageSrc("/media/../secret")).toBe(false);
  });

  it("enforces page rules: one PageHero first, one board", () => {
    const hero = { type: "PageHero", props: { title: "Hi" } };
    const q = (bg: string) => ({ type: "Quote", props: { text: "x" }, section: { background: bg } });
    expect(validateBlocks([hero, q("board")]).ok).toBe(true);
    expect(validateBlocks([q("band"), hero]).ok).toBe(false);
    expect(validateBlocks([hero, q("board"), q("board")]).ok).toBe(false);
    expect(validateBlocks("nope").ok).toBe(false);
  });
});

describe("safe markdown", () => {
  it("escapes raw HTML instead of rendering it", () => {
    const html = renderMarkdown('Hello <script>alert(1)</script>\n\n<div onclick="x()">block</div>\n\n<img src=x onerror=alert(1)>');
    expect(html).not.toMatch(/<script|<div|<img src=x/i);
    expect(html).toContain("&lt;script&gt;");
  });

  it("drops unsafe links and images but keeps their text", () => {
    const html = renderMarkdown("[click](javascript:alert(1)) [ok](/pricing) ![pic](http://x.test/a.png) ![cdn](https://cdn.dewee.sh/a.png)");
    expect(html).not.toContain("javascript:");
    expect(html).toContain('<a href="/pricing">ok</a>');
    expect(html).not.toContain("http://x.test");
    expect(html).toContain('src="https://cdn.dewee.sh/a.png"');
  });

  it("demotes h1, adds unique ids and lists headings", () => {
    const src = "# Title\n\n## Tiếng Việt & more\n\n## Tiếng Việt & more";
    const html = renderMarkdown(src);
    expect(html).toContain('<h2 id="title">');
    expect(html).toContain('id="tieng-viet-more"');
    expect(html).toContain('id="tieng-viet-more-1"');
    expect(markdownHeadings(src).map((h) => h.text)).toEqual(["Title", "Tiếng Việt & more", "Tiếng Việt & more"]);
  });

  it("estimates reading time", () => {
    expect(readingMinutes("word ".repeat(10))).toBe(1);
    expect(readingMinutes("word ".repeat(1100))).toBe(5);
  });
});
