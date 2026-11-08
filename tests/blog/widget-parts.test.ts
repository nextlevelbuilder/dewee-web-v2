import { describe, expect, it } from "vitest";
import { htmlToMarkdown } from "../../src/lib/html-to-markdown";
import { embedPlayerUrl, isSafeMediaFile, parseVideoEmbed, socialPlatform, VIDEO_EXTS } from "../../src/lib/blocks/media-urls";
import { highlight } from "../../src/lib/blocks/post-widgets/code-highlight";
import { renderPostBody } from "../../src/lib/blocks/post-widgets/post-body";
import { parseDirectiveAttrs } from "../../src/lib/blocks/post-widgets/widget-directives";
import { widgetLabels } from "../../src/lib/blocks/post-widgets/widget-labels";
import { renderMarkdown } from "../../src/lib/blocks/safe-markdown";
import { samplePost } from "./sample-post";

describe("directive attributes", () => {
  it("reads a quoted id and rejects everything else", () => {
    expect(parseDirectiveAttrs(' id="chart-1" ')).toEqual({ id: "chart-1", error: null });
    for (const bad of [undefined, "", "id=chart", 'id="a" id="b"', 'type="Chart"', 'id="a" onload="x"', 'id=""']) {
      expect(parseDirectiveAttrs(bad).error, String(bad)).toBeTruthy();
    }
  });
});

describe("media URLs", () => {
  it("accepts https and /media/ video files only", () => {
    expect(isSafeMediaFile("https://cdn.dewee.sh/a.mp4", VIDEO_EXTS)).toBe(true);
    expect(isSafeMediaFile("/media/2026/a.webm", VIDEO_EXTS)).toBe(true);
    for (const bad of ["http://cdn.dewee.sh/a.mp4", "javascript:alert(1)//a.mp4", "data:video/mp4;base64,AA", "/media/../a.mp4", "https://u:p@x.dev/a.mp4", "https://x.dev/a.mov", 'https://x.dev/"a.mp4'])
      expect(isSafeMediaFile(bad, VIDEO_EXTS), bad).toBe(false);
  });

  it("parses YouTube and Vimeo ids and builds privacy-friendly player URLs", () => {
    for (const url of ["https://www.youtube.com/watch?v=M7lc1UVf-VE&t=3", "https://youtu.be/M7lc1UVf-VE", "https://m.youtube.com/shorts/M7lc1UVf-VE", "https://www.youtube-nocookie.com/embed/M7lc1UVf-VE"]) {
      const embed = parseVideoEmbed(url);
      expect(embed?.id, url).toBe("M7lc1UVf-VE");
      expect(embedPlayerUrl(embed!)).toMatch(/^https:\/\/www\.youtube-nocookie\.com\/embed\/M7lc1UVf-VE\?/);
    }
    const vimeo = parseVideoEmbed("https://vimeo.com/76979871");
    expect(vimeo?.provider).toBe("vimeo");
    expect(embedPlayerUrl(vimeo!)).toMatch(/^https:\/\/player\.vimeo\.com\/video\/76979871\?.*dnt=1/);
    for (const bad of ["https://evil.example/watch?v=M7lc1UVf-VE", "https://youtube.com.evil.example/watch?v=M7lc1UVf-VE", "javascript:alert(1)", "https://www.youtube.com/watch?v=short", "http://www.youtube.com/watch?v=M7lc1UVf-VE"]) {
      expect(parseVideoEmbed(bad), bad).toBeNull();
    }
  });

  it("names social platforms from the host", () => {
    expect(socialPlatform("https://x.com/a/status/1")).toBe("x");
    expect(socialPlatform("https://bsky.app/profile/a/post/b")).toBe("bluesky");
    expect(socialPlatform("https://news.ycombinator.com/item?id=1")).toBe("hackernews");
    expect(socialPlatform("https://mastodon.social/@a/1234")).toBe("mastodon");
    expect(socialPlatform("javascript:alert(1)")).toBeNull();
  });
});

describe("code highlighting", () => {
  it("wraps tokens in hl-* spans and escapes everything", () => {
    const html = highlight('const a = "<b>"; // note', "ts");
    expect(html).toContain('<span class="hl-k">const</span>');
    expect(html).toContain('<span class="hl-s">&quot;&lt;b&gt;&quot;</span>');
    expect(html).toContain('<span class="hl-c">// note</span>');
    expect(highlight("<script>", "unknown")).toBe("&lt;script&gt;");
    expect(highlight("+added\n-removed", "diff")).toBe('<span class="hl-ins">+added</span>\n<span class="hl-del">-removed</span>');
    // A keyword inside an identifier stays plain.
    expect(highlight("constant", "js")).toBe("constant");
  });

  it("keeps the code text intact", () => {
    const code = 'def f(x):\n    return x * 2  # twice\nprint(f"{f(2)}")';
    expect(highlight(code, "python").replace(/<[^>]+>/g, "").replace(/&quot;/g, '"')).toBe(code);
  });
});

describe("the .md twin of a widget post", () => {
  const origin = "https://dewee.sh";
  const page = (body: string) => `<!doctype html><html lang="en"><head><title>T</title></head><body><main><article>${body}</article></main></body></html>`;

  it("reads fenced code the same way with or without highlighting", () => {
    const md = "Text\n\n```js\nconst a = 1;\n```\n";
    const before = htmlToMarkdown(page(renderMarkdown(md)), origin).markdown;
    const after = htmlToMarkdown(page(renderPostBody({ body_md: md }, { mode: "public", labels: widgetLabels("en") })), origin).markdown;
    expect(after).toBe(before);
  });

  it("turns every widget of the sample post into readable Markdown", () => {
    const html = renderPostBody(samplePost(), { mode: "public", labels: widgetLabels("en") });
    const { markdown } = htmlToMarkdown(page(html), origin);
    for (const s of ["Teams using the agent", "| Week 3 | 58 |", "```mermaid\nflowchart LR", "A request goes from the chat app", "| Works without JavaScript | Yes | Yes | Yes |", "Chart (For trends)", "Yes: as a Markdown table", "Tiếng Việt", "Invite", "GoClaw logo", "Watch on YouTube", "View on Bluesky", "```bash", "curl -fsSL", "Unplaced blocks render"]) {
      expect(markdown, s).toContain(s);
    }
    expect(markdown).not.toMatch(/Copy|Previous image|<svg|\*\*View data\*\*|Diagram source/);
  });
});
