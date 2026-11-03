import { describe, expect, it } from "vitest";
import { BLOCKS, blockContexts, validateBlocks } from "../../src/lib/blocks/registry";
import { renderMarkdown } from "../../src/lib/blocks/safe-markdown";
import { postBodyMarkdown, renderPostBody, validatePostContent } from "../../src/lib/blocks/post-widgets/post-body";
import { POST_WIDGETS } from "../../src/lib/blocks/post-widgets/post-widget-registry";
import { widgetLabels } from "../../src/lib/blocks/post-widgets/widget-labels";
import { samplePost } from "./sample-post";

const labels = widgetLabels("en");
const pub = (body_md: string, blocks: unknown[] = []) => renderPostBody({ body_md, blocks }, { mode: "public", labels });
const pre = (body_md: string, blocks: unknown[] = []) => renderPostBody({ body_md, blocks }, { mode: "preview", labels });
const callout = (id: string, body = "Hello") => ({ id, type: "Callout", props: { tone: "note", body } });

function validateOk(blocks: unknown[]) {
  const res = validateBlocks(blocks, { context: "post" });
  if (!res.ok) throw new Error(JSON.stringify(res.issues));
  return res.blocks;
}

describe("post widget registry", () => {
  it("has a renderer for every block a post may use", () => {
    for (const def of BLOCKS.filter((b) => blockContexts(b).includes("post"))) {
      expect(POST_WIDGETS[def.type], def.type).toBeDefined();
      const [block] = validateOk([{ ...(def.requiresId ? { id: "example" } : {}), type: def.type, props: def.example }]);
      expect(POST_WIDGETS[def.type].html(block.props, { labels }).length, def.type).toBeGreaterThan(0);
      expect(POST_WIDGETS[def.type].markdown(block.props, { labels }).trim().length, def.type).toBeGreaterThan(0);
    }
  });

  it("keeps page-only blocks and section options out of posts", () => {
    const res = validateBlocks([{ type: "PageHero", props: {} }, { id: "a", type: "Callout", props: { body: "x" }, section: { background: "band" } }], { context: "post" });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.issues.map((i) => i.path)).toEqual(expect.arrayContaining(["blocks.0.type", "blocks.1"]));
    expect(res.issues[0].message).toMatch(/cannot be used in a post/);
  });

  it("rejects bad and duplicate ids with paths", () => {
    const res = validateBlocks([callout("a"), callout("a"), callout("Bad Id")], { context: "post" });
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.issues).toEqual([
      { path: "blocks.1.id", message: expect.stringContaining('Duplicate id "a" (also blocks.0)') },
      { path: "blocks.2.id", message: expect.stringContaining("lowercase") },
    ]);
  });

  it("keeps post-only widgets off pages", () => {
    expect(validateBlocks([{ type: "Gallery", props: {} }]).ok).toBe(false);
  });
});

describe("renderPostBody", () => {
  it("renders a body without widgets or code exactly like before", () => {
    const md = "# Title\n\nSome *text* with [a link](https://x.dev) and <b>html</b>.\n\n- one\n- two\n";
    expect(pub(md)).toBe(renderMarkdown(md));
  });

  it("places widgets in order and appends unplaced blocks", () => {
    const html = pub('Intro\n\n::widget{id="b"}\n\nMiddle\n\n::widget{id="a"}\n\nEnd', [callout("a", "AAA"), callout("b", "BBB"), callout("c", "CCC")]);
    const order = ["Intro", "BBB", "Middle", "AAA", "End", "CCC"].map((s) => html.indexOf(s));
    expect(order.every((n) => n >= 0)).toBe(true);
    expect([...order].sort((x, y) => x - y)).toEqual(order);
    expect(html.match(/data-widget="Callout"/g)).toHaveLength(3);
  });

  it("cuts a paragraph at a directive line", () => {
    const html = pub('First line\n::widget{id="a"}\nSecond line', [callout("a")]);
    expect(html).toMatch(/<p>First line<\/p>[\s\S]*pw-callout[\s\S]*<p>Second line<\/p>/);
  });

  it("leaves directives in code as code", () => {
    const md = '```md\n::widget{id="a"}\n```\n\n    ::widget{id="a"}\n\nText `::widget{id="a"}`';
    const html = pub(md, [callout("a", "PLACED")]);
    expect(html.match(/::widget\{id=&quot;a&quot;\}/g)).toHaveLength(3);
    // Code does not place the block, so it follows the body, once.
    expect(html.match(/PLACED/g)).toHaveLength(1);
    expect(html.indexOf("PLACED")).toBeGreaterThan(html.lastIndexOf("::widget"));
  });

  it("hides broken directives on the page and explains them in the preview", () => {
    const md = '::widget{id="missing"}\n\n::widget{id="a"}\n\n::widget{id="a"}\n\n::widget{nope}\n\n::widget\n\n- item\n\n  ::widget{id="b"}\n\n::widget{id="bad"}';
    const blocks = [callout("a", "AAA"), callout("b", "BBB"), { id: "bad", type: "Callout", props: { body: "" } }, { type: "Marquee", props: {} }];
    const p = pub(md, blocks);
    expect(p).not.toContain("pw-notice");
    expect(p.match(/AAA/g)).toHaveLength(1);
    expect(p).not.toContain("::widget");
    const v = pre(md, blocks);
    for (const text of ["No block has the id &quot;missing&quot;", "already placed above", "cannot be read", "inside a list", "Block &quot;bad&quot; (Callout) is hidden", "Block 4 (Marquee) is hidden"]) expect(v).toContain(text);
    expect(v.match(/class="pw-notice"/g)).toHaveLength(7);
    // The only difference between page and preview is the notices.
    expect(v.replace(/<p class="pw-notice"[\s\S]*?<\/p>\n?/g, "")).toBe(p);
  });

  it("escapes hostile props and refuses unsafe URLs", () => {
    const evil = '"><script>alert(1)</script>';
    const html = pub('::widget{id="x"}', [{ id: "x", type: "SocialCard", props: { url: "https://x.com/a/status/1", author: evil, text: evil } }]);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    for (const src of ["javascript:alert(1)", "data:image/png;base64,AAAA", "//evil.example/a.png", "http://plain.example/a.png"]) {
      const v = pre('::widget{id="g"}', [{ id: "g", type: "Gallery", props: { images: [{ src, alt: "a" }, { src, alt: "b" }] } }]);
      expect(v).not.toContain(`src="${src}`);
      expect(v).toContain("is hidden");
    }
    const video = pre('::widget{id="v"}', [{ id: "v", type: "Video", props: { title: "t", sources: [{ src: "javascript:alert(1)//.mp4", type: "video/mp4" }] } }]);
    expect(video).not.toContain('src="javascript');
    const embed = pre('::widget{id="v"}', [{ id: "v", type: "VideoEmbed", props: { url: "https://evil.example/watch?v=M7lc1UVf-VE", title: "t" } }]);
    expect(embed).not.toContain("data-src");
    expect(pub("[x](javascript:alert(1)) <img src=x onerror=alert(1)>")).not.toMatch(/href="javascript|<img src=x/);
  });

  it("renders the sample post in the documented order", () => {
    const { body_md, blocks } = samplePost();
    const html = pub(body_md, blocks);
    const order = ["A chart", 'data-widget="Chart"', 'data-widget="Steps"', "A diagram", 'data-widget="Diagram"', 'data-widget="ComparisonTable"', 'data-widget="Gallery"', 'data-widget="BeforeAfter"', 'data-widget="VideoEmbed"', 'data-widget="Video"', 'data-widget="SocialCard"', "Wrapping up", 'data-widget="CodeBlock"', 'data-widget="Quote"'].map((s) => html.indexOf(s));
    expect(order.every((n) => n >= 0), JSON.stringify(order)).toBe(true);
    expect([...order].sort((x, y) => x - y)).toEqual(order);
    expect(validatePostContent(body_md, validateOk(blocks))).toEqual([]);
  });
});

describe("validatePostContent", () => {
  it("reports each directive problem with its line", () => {
    const blocks = validateOk([callout("a")]);
    const issues = validatePostContent('Intro\n\n::widget{id="a"}\n\n::widget{id="a"}\n\n::widget{id="zz"}\n\n::widget{id=a}\n\n> ::widget{id="a"}\n\n```\n::widget{id="zz"}\n```', blocks);
    expect(issues.map((i) => i.path)).toEqual(["body_md", "body_md", "body_md", "body_md"]);
    expect(issues[0].message).toMatch(/^Line 5: block "a" is already placed on line 3/);
    expect(issues[1].message).toMatch(/^Line 7: no block has the id "zz"/);
    expect(issues[2].message).toMatch(/^Line 9: .* is malformed/);
    expect(issues[3].message).toMatch(/inside a list or a quote/);
  });

  it("accepts a body without directives", () => {
    expect(validatePostContent("Just text, even ::widget inline.", [])).toEqual([]);
  });
});

describe("postBodyMarkdown", () => {
  it("returns old posts byte for byte", () => {
    const md = "Line\r\n\r\n```js\nconst a = 1;\n```\n";
    expect(postBodyMarkdown({ body_md: md, blocks: [] }, labels)).toBe(md);
  });

  it("turns widgets into meaningful Markdown in place", () => {
    const out = postBodyMarkdown({ body_md: 'Intro\n::widget{id="a"}\nAfter\n\n::widget{id="missing"}\n\nEnd\n', blocks: [callout("a", "Callout body"), { type: "Quote", props: { text: "Tail quote" } }] }, labels);
    expect(out).toBe("Intro\n\n> Callout body\n\nAfter\n\nEnd\n\n> Tail quote\n");
  });

  it("gives the sample post a text stand-in for every widget", () => {
    const out = postBodyMarkdown(samplePost(), labels);
    expect(out.replace(/```md\n[\s\S]*?```/, "")).not.toMatch(/^ *::widget/m);
    for (const s of ["| Week | Teams (teams) |", "1. **Invite**", "```mermaid\nflowchart LR", "| Works without JavaScript | Yes | Yes | Yes |", "**English:** ![", "![GoClaw logo](https://dewee.sh/img/ecosystem/goclaw.svg)", "Watch on YouTube", "flower.webm", "View on Bluesky", "```bash", "Unplaced blocks render"]) {
      expect(out, s).toContain(s);
    }
    expect(out).toContain('```md\n::widget{id="screens"}\n```');
  });
});
