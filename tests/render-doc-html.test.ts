import { describe, expect, it } from "vitest";
import { renderDocHtml, type DocPart, type DocRenderLabels } from "../src/components/docs/render-doc-html";
import type { CcpScreenId } from "../src/content/ccp-screens";

const labels: DocRenderLabels = {
  callouts: { note: "Note", tip: "Tip", important: "Important", warning: "Warning", caution: "Caution" },
  copy: "Copy",
  plain: "text",
  anchor: "Link to this section",
};
const render = (html: string, screens: readonly CcpScreenId[] = [], locale: "en" | "vi" = "en") =>
  renderDocHtml(html, { locale, labels, screens, source: "test.md" });
const htmlOf = (parts: DocPart[]) => parts.map((p) => (p.kind === "html" ? p.html : `[shot:${p.id}]`)).join("");

describe("callouts", () => {
  it("turns a GitHub alert blockquote into a labelled note", () => {
    const out = htmlOf(render("<blockquote>\n<p>[!WARNING]\nKeep the key safe.</p>\n</blockquote>"));
    expect(out).toContain('<div class="callout callout--warning" role="note">');
    expect(out).toContain("Warning</p>");
    expect(out).toContain("Keep the key safe.");
    expect(out).not.toContain("<blockquote>");
    expect(out).not.toContain("[!WARNING]");
  });

  it("leaves ordinary blockquotes alone and balances nested ones", () => {
    const plain = "<blockquote><p>Quoted.</p></blockquote>";
    expect(htmlOf(render(plain))).toBe(plain);
    const nested = "<blockquote><p>[!NOTE]</p><blockquote><p>inner</p></blockquote><p>after</p></blockquote><p>tail</p>";
    const out = htmlOf(render(nested));
    expect(out).toContain("<blockquote><p>inner</p></blockquote><p>after</p></div><p>tail</p>");
  });
});

describe("code blocks", () => {
  it("adds a language label and a hidden copy button", () => {
    const out = htmlOf(render('<pre class="astro-code css-variables" data-language="bash"><code>make up</code></pre>'));
    expect(out).toContain('<span class="code-block__lang">bash</span>');
    expect(out).toContain("data-copy-code hidden");
    expect(out).toContain("<code>make up</code></pre></div>");
  });

  it("labels plain text blocks with the localised plain label", () => {
    const out = htmlOf(render('<pre class="astro-code css-variables" data-language="plaintext"><code>x</code></pre>'));
    expect(out).toContain('<span class="code-block__lang">text</span>');
  });
});

describe("headings and links", () => {
  it("adds a self-link to h2 and h3 only", () => {
    const out = htmlOf(render('<h2 id="setup">Setup</h2><h4 id="deep">Deep</h4>'));
    expect(out).toContain('<h2 id="setup">Setup<a class="heading-anchor" href="#setup"');
    expect(out).toContain('<h4 id="deep">Deep</h4>');
  });

  it("localises site paths for Vietnamese but not files, anchors or external links", () => {
    const html = '<a href="/docs/runtime/cli">a</a><a href="/pricing#vn">b</a><a href="/llms.txt">c</a><a href="https://x.dev/y">d</a><a href="#top">e</a><a href="/vi/docs">f</a>';
    const out = htmlOf(render(html, [], "vi"));
    expect(out).toContain('href="/vi/docs/runtime/cli"');
    expect(out).toContain('href="/vi/pricing#vn"');
    expect(out).toContain('href="/llms.txt"');
    expect(out).toContain('href="https://x.dev/y"');
    expect(out).toContain('href="#top"');
    expect(out).toContain('href="/vi/docs"');
    expect(htmlOf(render(html, [], "en"))).toBe(html);
  });
});

describe("screenshots", () => {
  it("splits the page at shot markers, including curly quotes from smart punctuation", () => {
    const parts = render("<p>Intro</p><p>::shot{id=“agents”}</p><p>Mid</p><p>::shot{id=&quot;chat&quot;}</p><p>End</p>", ["agents", "chat"]);
    expect(parts.map((p) => (p.kind === "shot" ? p.id : "html"))).toEqual(["html", "agents", "html", "chat", "html"]);
  });

  it("puts declared but unplaced screens first", () => {
    const parts = render("<p>Body</p>", ["billing"]);
    expect(parts[0]).toEqual({ kind: "shot", id: "billing" });
  });

  it("fails on unknown, undeclared or inline markers", () => {
    expect(() => render('<p>::shot{id="nope"}</p>', [])).toThrow(/unknown screenshot id "nope"/);
    expect(() => render('<p>::shot{id="agents"}</p>', [])).toThrow(/not listed in front matter/);
    expect(() => render('<p>See ::shot{id="agents"} here</p>', ["agents"])).toThrow(/paragraph of its own/);
  });
});
