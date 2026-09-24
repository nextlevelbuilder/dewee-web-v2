import { describe, expect, it } from "vitest";
import { htmlToMarkdown } from "../src/lib/html-to-markdown";

const origin = "https://dewee.sh";

const page = (main: string, head = "") => `<!doctype html><html lang="vi"><head>
<title>Bảng giá · dewee</title>
<meta property="og:title" content="Bảng giá">
<meta name="description" content="Ba cách triển khai: SaaS, Dedicated, On-Premises">
<link rel="canonical" href="https://dewee.sh/vi/pricing">
<link rel="alternate" hreflang="en" href="https://dewee.sh/pricing">
<link rel="alternate" hreflang="vi" href="https://dewee.sh/vi/pricing">
${head}
</head><body><header><nav><a href="/">dewee</a></nav></header><main>${main}</main><footer>Footer</footer></body></html>`;

describe("htmlToMarkdown", () => {
  it("writes front matter from the page's own metadata", () => {
    const { markdown, meta } = htmlToMarkdown(page("<h1>Bảng giá</h1><p>Chọn cách triển khai.</p>"), origin);
    expect(markdown.startsWith('---\ntitle: Bảng giá\ndescription: "Ba cách triển khai: SaaS, Dedicated, On-Premises"\nurl: https://dewee.sh/vi/pricing\nlang: vi\n---\n\n# Bảng giá\n\nChọn cách triển khai.\n')).toBe(true);
    expect(meta).toMatchObject({ title: "Bảng giá", lang: "vi", noindex: false, url: "https://dewee.sh/vi/pricing" });
    expect(meta.alternates).toEqual([
      { hreflang: "en", href: "https://dewee.sh/pricing" },
      { hreflang: "vi", href: "https://dewee.sh/vi/pricing" },
    ]);
  });

  it("reads robots and modified time, and adds the title as H1 when the page has none", () => {
    const { markdown, meta } = htmlToMarkdown(
      page("<p>Body</p>", '<meta name="robots" content="noindex, nofollow"><meta property="article:modified_time" content="2026-09-01T00:00:00Z">'),
      origin,
    );
    expect(meta.noindex).toBe(true);
    expect(meta.modified).toBe("2026-09-01T00:00:00Z");
    expect(markdown).toContain("---\n\n# Bảng giá\n\nBody\n");
  });

  it("quotes front-matter values YAML would misread", () => {
    const html = page("<p>x</p>").replace('content="Bảng giá"', 'content="[Beta] *new* - #1"');
    expect(htmlToMarkdown(html, origin).markdown).toContain('title: "[Beta] *new* - #1"\n');
  });

  it("keeps main content and drops chrome, controls and hidden or skipped parts", () => {
    const { markdown } = htmlToMarkdown(
      page(`<h1>T</h1>
        <div data-md-skip><p>Copy as Markdown</p></div>
        <p>Keep <span class="sr-only">screen-reader only</span><span class="visually-hidden">(opens a new tab)</span></p>
        <button>Click</button><svg><text>icon</text></svg><p aria-hidden="true">decor</p><p hidden>hidden</p>
        <script>alert(1)</script>`),
      origin,
    );
    expect(markdown).toContain("Keep (opens a new tab)");
    for (const gone of ["Copy as Markdown", "screen-reader only", "Click", "icon", "decor", "hidden\n", "alert", "Footer", "](/)"]) {
      expect(markdown, gone).not.toContain(gone);
    }
  });

  it("converts links, images, emphasis, code, lists, quotes and tables", () => {
    const { markdown } = htmlToMarkdown(
      page(`<h1>T</h1>
        <p>See <a href="/docs">the docs</a>, <a href="#faq">FAQ</a> and <strong>bold</strong><em>italic</em> <code>pnpm i</code>.</p>
        <img src="/img/a.png" alt="Diagram"><img src="/img/deco.png" alt="">
        <ul><li><h3>SaaS</h3><p>$500</p></li><li>Two<ul><li>Nested</li></ul></li></ul>
        <ol><li>First</li><li>Second</li></ol>
        <blockquote><p>Quote</p></blockquote>
        <pre><code class="language-bash">docker run dewee
</code></pre>
        <table><tr><th>Plan</th><th>Price</th></tr><tr><td>SaaS</td><td>$500 | year</td></tr></table>`),
      origin,
    );
    expect(markdown).toContain("See [the docs](https://dewee.sh/docs), FAQ and **bold** _italic_ `pnpm i`.");
    expect(markdown).toContain("![Diagram](https://dewee.sh/img/a.png)");
    expect(markdown).not.toContain("deco.png");
    expect(markdown).toContain("- **SaaS**\n  $500\n- Two\n  - Nested");
    expect(markdown).toContain("1. First\n2. Second");
    expect(markdown).toContain("> Quote");
    expect(markdown).toContain("```bash\ndocker run dewee\n```");
    expect(markdown).toContain("| Plan | Price |\n| --- | --- |\n| SaaS | $500 \\| year |");
  });

  it("turns highlighted and scoped code blocks into clean fences", () => {
    const { markdown } = htmlToMarkdown(
      page(`<h1>T</h1>
        <pre class="astro-code github-dark" data-language="bash" tabindex="0"><code data-astro-cid-x1y2z3><span class="line"><span style="color:#B392F0">claude</span><span> mcp add</span></span>
<span class="line"><span>echo</span><span> "a &amp;&amp; b"</span></span></code></pre>
        <pre data-astro-cid-abc><code data-astro-cid-abc class="language-json">{"a": 1}</code></pre>
        <pre><code class="language-plaintext">Use \`\`\` fences</code></pre>`),
      origin,
    );
    expect(markdown).toContain('```bash\nclaude mcp add\necho "a && b"\n```');
    expect(markdown).toContain('```json\n{"a": 1}\n```');
    expect(markdown).toContain("````\nUse ``` fences\n````");
    expect(markdown).not.toMatch(/<span|<code|data-astro-cid/);
  });

  it("writes definition lists as term and definition, with or without <div> groups", () => {
    const { markdown } = htmlToMarkdown(
      page(`<h1>T</h1>
        <dl><div class="proof__item"><dt>Runtime</dt><dd>Go</dd></div><div><dt>Channels</dt><dd>Telegram</dd><dd>Zalo</dd></div></dl>
        <dl><dt>Licence</dt><dd><p>Yearly</p><ul><li>Renews</li></ul></dd><dt>Empty</dt></dl>`),
      origin,
    );
    expect(markdown).toContain("- **Runtime**: Go\n- **Channels**: Telegram; Zalo");
    expect(markdown).toContain("- **Licence**: Yearly\n  - Renews\n- **Empty**");
  });

  it("keeps words apart when Astro removed the whitespace between elements", () => {
    const { markdown } = htmlToMarkdown(page("<h1>T</h1><p><b>$500</b><span>per year</span></p>"), origin);
    expect(markdown).toContain("**$500** per year");
  });

  it("prefers an explicit data-md-root over <main>", () => {
    const { markdown } = htmlToMarkdown(page('<p>Outside</p><article data-md-root><h1>Inside</h1></article>'), origin);
    expect(markdown).toContain("# Inside");
    expect(markdown).not.toContain("Outside");
  });
});
