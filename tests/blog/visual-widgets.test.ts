import { describe, expect, it } from "vitest";
import { validateBlocks } from "../../src/lib/blocks/registry";
import { niceScale } from "../../src/lib/blocks/post-widgets/chart-svg";
import { postBodyMarkdown, renderPostBody } from "../../src/lib/blocks/post-widgets/post-body";
import { POST_WIDGETS } from "../../src/lib/blocks/post-widgets/post-widget-registry";
import { widgetLabels } from "../../src/lib/blocks/post-widgets/widget-labels";
import { hasClickStatement, mermaidType } from "../../src/lib/blocks/visual-block-schemas";

const en = { labels: widgetLabels("en") };
const vi = { labels: widgetLabels("vi") };

function issues(type: string, props: unknown): { path: string; message: string }[] {
  const res = validateBlocks([{ id: "w", type, props }], { context: "post" });
  return res.ok ? [] : res.issues;
}

function valid(type: string, props: unknown): Record<string, unknown> {
  const res = validateBlocks([{ id: "w", type, props }], { context: "post" });
  if (!res.ok) throw new Error(JSON.stringify(res.issues));
  return res.blocks[0].props;
}

const bar = { kind: "bar", title: "Teams", labels: ["W1", "W2", "W3"], series: [{ name: "Teams", values: [12, 31, 58] }], unit: "teams" };

describe("Chart", () => {
  it("rejects mismatched, non-finite and oversized data with paths", () => {
    expect(issues("Chart", { ...bar, series: [{ name: "Teams", values: [1, 2] }] })).toEqual([{ path: "blocks.0.props.series.0.values", message: expect.stringContaining("Give 3 values") }]);
    expect(issues("Chart", { ...bar, series: [{ name: "Teams", values: [1, Number.POSITIVE_INFINITY, 2] }] })[0].path).toBe("blocks.0.props.series.0.values.1");
    expect(issues("Chart", { ...bar, series: [{ name: "Teams", values: [1, "2", 3] }] })[0].path).toBe("blocks.0.props.series.0.values.1");
    const many = Array.from({ length: 51 }, (_, i) => `L${i}`);
    expect(issues("Chart", { ...bar, labels: many, series: [{ name: "a", values: many.map(() => 1) }] }).map((i) => i.path)).toContain("blocks.0.props.labels");
    const seven = Array.from({ length: 7 }, (_, i) => ({ name: `s${i}`, values: [1, 2, 3] }));
    expect(issues("Chart", { ...bar, series: seven })[0]).toEqual({ path: "blocks.0.props.series", message: expect.stringContaining("At most 6") });
    expect(issues("Chart", { ...bar, series: [bar.series[0], bar.series[0]] })[0].path).toBe("blocks.0.props.series.1.name");
  });

  it("holds pies to one series of non-negative slices", () => {
    const pie = { kind: "pie", title: "Share", labels: ["A", "B"], series: [{ name: "Share", values: [3, 1] }] };
    expect(issues("Chart", pie)).toEqual([]);
    expect(issues("Chart", { ...pie, series: [{ name: "Share", values: [3, -1] }] })[0].path).toBe("blocks.0.props.series.0.values.1");
    expect(issues("Chart", { ...pie, series: [...pie.series, { name: "Other", values: [1, 1] }] })[0].path).toBe("blocks.0.props.series");
    expect(issues("Chart", { ...pie, series: [{ name: "Share", values: [0, 0] }] })[0].message).toMatch(/above zero/);
    expect(issues("Chart", { ...bar, kind: "line", labels: ["one"], series: [{ name: "a", values: [1] }] })[0].path).toBe("blocks.0.props.labels");
  });

  it("draws an accessible SVG with a data table fallback", () => {
    const html = POST_WIDGETS.Chart.html(valid("Chart", bar), en);
    expect(html).toMatch(/<svg class="pw-chart__svg" viewBox="0 0 480 280" role="img"[^>]*><title>Teams<\/title><desc>Bar chart, W1 – W3\. Teams: lowest 12 teams \(W1\), highest 58 teams \(W3\)\.<\/desc>/);
    expect(html.match(/<rect /g)).toHaveLength(3);
    expect(html).toContain("<details class=\"pw-chart__data\"><summary data-md-skip>View data</summary>");
    expect(html).toMatch(/<table class="pw-table"><caption>Teams<\/caption><thead><tr><th scope="col">Category<\/th><th scope="col">Teams \(teams\)<\/th>/);
    expect(html).toContain('<tr><th scope="row">W3</th><td>58</td></tr>');
  });

  it("draws lines with distinct dashes and pies with shares", () => {
    const line = POST_WIDGETS.Chart.html(valid("Chart", { ...bar, kind: "line", series: [bar.series[0], { name: "Other", values: [5, 4, 3] }] }), en);
    expect(line.match(/<path class="pw-chart__line pw-chart__c\d"/g)).toHaveLength(2);
    expect(line.match(/<line class="pw-chart__line/g)).toHaveLength(2); // legend keys repeat each dash
    expect(line).toContain('stroke-dasharray="7 4"');
    const donut = POST_WIDGETS.Chart.html(valid("Chart", { kind: "donut", title: "Split", labels: ["A", "B", "C"], series: [{ name: "n", values: [2, 1, 1] }] }), en);
    expect(donut.match(/class="pw-chart__slice/g)).toHaveLength(3);
    expect(donut).toContain("A: 2 (50%), B: 1 (25%), C: 1 (25%)");
    const whole = POST_WIDGETS.Chart.html(valid("Chart", { kind: "pie", title: "All", labels: ["A", "B"], series: [{ name: "n", values: [1, 0] }] }), en);
    expect(whole).toContain('<circle class="pw-chart__slice pw-chart__c1"');
  });

  it("formats numbers per locale and escapes text", () => {
    const html = POST_WIDGETS.Chart.html(valid("Chart", { ...bar, title: "<b>x</b>", series: [{ name: "Teams", values: [1234.5, 2, 3] }] }), vi);
    expect(html).not.toContain("<b>x</b>");
    expect(html).toContain("<td>1.234,5</td>");
    expect(html).toContain("Biểu đồ cột");
  });

  it("exports a Markdown table with caption and source", () => {
    const md = POST_WIDGETS.Chart.markdown(valid("Chart", { ...bar, labels: ["W|1", "W2", "W3"], caption: "Weekly.", source: "Changelog", sourceUrl: "https://dewee.sh/changelog" }), en);
    expect(md).toBe(
      ["**Teams**", "", "| Category | Teams (teams) |", "| --- | ---: |", "| W\\|1 | 12 |", "| W2 | 31 |", "| W3 | 58 |", "", "_Weekly. Source: [Changelog](https://dewee.sh/changelog)_"].join("\n"),
    );
  });

  it("picks round ticks", () => {
    expect(niceScale(0, 58)).toEqual({ lo: 0, hi: 60, step: 20 });
    expect(niceScale(-3, 7)).toEqual({ lo: -5, hi: 10, step: 5 });
    expect(niceScale(0, 0)).toEqual({ lo: 0, hi: 1, step: 0.25 });
  });
});

describe("Diagram", () => {
  const flow = { source: "flowchart LR\n  A[Start] --> B[End]", alt: "Start leads to end." };

  it("requires alt text and a known diagram type, and refuses risky source", () => {
    expect(issues("Diagram", { source: flow.source })[0].path).toBe("blocks.0.props.alt");
    expect(issues("Diagram", { ...flow, source: "evilDiagram\n A" })[0].message).toMatch(/Start with a diagram type/);
    for (const bad of ['%%{init: {"securityLevel": "loose"}}%%\nflowchart LR\n A-->B', "---\nconfig:\n  theme: dark\n---\nflowchart LR\n A-->B", "flowchart LR\n A-->B\n click A href \"javascript:alert(1)\"", "flowchart LR\n A[<img src=x onerror=alert(1)>]-->B", "flowchart LR\n A-->B[<br/>]"]) {
      expect(issues("Diagram", { ...flow, source: bad }).length, bad).toBeGreaterThan(0);
    }
    expect(issues("Diagram", { ...flow, source: "%% a comment\nsequenceDiagram\n A->>B: hi\n B-->>A: ok" })).toEqual([]);
    expect(issues("Diagram", { ...flow, source: "classDiagram\n Animal <|-- Duck" })).toEqual([]);
    expect(mermaidType("\r\n%% note\r\ngraph TD\r\n A-->B")).toBe("graph");
  });

  it("refuses click statements after a semicolon on the same line, not just at line start", () => {
    for (const bad of ['flowchart LR\n A-->B; click A href "javascript:alert(1)"', "flowchart LR; A-->B;click B callback", "graph TD\r\n A-->B ;\tclick A cb"]) {
      expect(hasClickStatement(bad), bad).toBe(true);
      expect(issues("Diagram", { ...flow, source: bad }).length, bad).toBeGreaterThan(0);
    }
    for (const ok of ["flowchart LR\n A[click here]-->B", "flowchart LR\n A-->B; B-->C", "sequenceDiagram\n A->>B: double-click to open"]) {
      expect(hasClickStatement(ok), ok).toBe(false);
      expect(issues("Diagram", { ...flow, source: ok }), ok).toEqual([]);
    }
  });

  it("ships escaped source with the alt text on the figure", () => {
    const html = POST_WIDGETS.Diagram.html(valid("Diagram", { ...flow, source: 'flowchart LR\n  A["x & y"] --> B', caption: "Cap" }), en);
    expect(html).toContain('role="img" aria-label="Start leads to end."');
    expect(html).toContain("data-pw-diagram");
    expect(html).toContain("<pre class=\"pw-diagram__source\"><code class=\"language-mermaid\">flowchart LR\n  A[&quot;x &amp; y&quot;] --&gt; B</code></pre>");
    expect(html).toContain("<figcaption>Cap</figcaption>");
  });

  it("exports a mermaid fence with the alt text", () => {
    expect(POST_WIDGETS.Diagram.markdown(valid("Diagram", { ...flow, caption: "Cap" }), en)).toBe("```mermaid\nflowchart LR\n  A[Start] --> B[End]\n```\n\nStart leads to end.\n\n_Cap_");
  });
});

describe("ComparisonTable", () => {
  const table = {
    title: "Plans",
    columns: ["Self-install", "Managed"],
    rows: [
      { criterion: "On your servers", cells: [{ mark: "yes" }, { mark: "no" }] },
      { criterion: "Updates", cells: ["You", { mark: "partial", text: "Scheduled" }] },
    ],
    highlight: 1,
  };

  it("checks cells per column and the highlight index", () => {
    expect(issues("ComparisonTable", table)).toEqual([]);
    expect(issues("ComparisonTable", { ...table, rows: [{ criterion: "x", cells: ["a"] }] })).toEqual([{ path: "blocks.0.props.rows.0.cells", message: expect.stringContaining("Give 2 cells") }]);
    expect(issues("ComparisonTable", { ...table, highlight: 2 })[0].path).toBe("blocks.0.props.highlight");
    expect(issues("ComparisonTable", { ...table, rows: [{ criterion: "x", cells: [{ mark: "maybe" }, "b"] }] })[0].path).toMatch(/^blocks\.0\.props\.rows\.0\.cells\.0/);
    expect(issues("ComparisonTable", { ...table, columns: ["a", "b", "c", "d", "e", "f"] }).map((i) => i.path)).toContain("blocks.0.props.columns");
  });

  it("renders marks with words, a scroll box and the highlighted column", () => {
    const html = POST_WIDGETS.ComparisonTable.html(valid("ComparisonTable", table), en);
    expect(html).toContain('<div class="pw-scroll" role="region" tabindex="0" aria-label="Plans">');
    expect(html).toContain("<caption>Plans</caption>");
    expect(html).toMatch(/pw-mark--yes"><svg[^>]*aria-hidden="true"[\s\S]*?<span class="pw-mark__word">Yes<\/span>/);
    expect(html).toContain('<span class="pw-mark__word">No</span>');
    expect(html).toContain('<span class="visually-hidden">Partly:</span></span> <span class="pw-mark__text">Scheduled</span>');
    expect(html).toContain('<th scope="col" class="pw-compare__hl">Managed <span class="pw-compare__pick"><span class="visually-hidden">(</span>Recommended<span class="visually-hidden">)</span></span></th>');
    expect(POST_WIDGETS.ComparisonTable.html(valid("ComparisonTable", table), vi)).toContain("Không");
  });

  it("exports a Markdown table with the marks as words", () => {
    expect(POST_WIDGETS.ComparisonTable.markdown(valid("ComparisonTable", table), en)).toBe(
      ["**Plans**", "", "| Criterion | Self-install | Managed (Recommended) |", "| --- | --- | --- |", "| On your servers | Yes | No |", "| Updates | You | Partly: Scheduled |"].join("\n"),
    );
  });
});

describe("BeforeAfter", () => {
  const ba = { before: { src: "https://cdn.dewee.sh/a.png", alt: "Old inbox" }, after: { src: "/media/2026/b.png", alt: "New inbox", label: "Now" }, start: 30 };

  it("needs alt text and safe sources for both images", () => {
    expect(issues("BeforeAfter", ba)).toEqual([]);
    expect(issues("BeforeAfter", { ...ba, after: { src: "javascript:alert(1)", alt: "x" } })[0].path).toBe("blocks.0.props.after.src");
    expect(issues("BeforeAfter", { ...ba, before: { src: ba.before.src, alt: " " } })[0].path).toBe("blocks.0.props.before.alt");
    expect(issues("BeforeAfter", { ...ba, start: 120 })[0].path).toBe("blocks.0.props.start");
    expect(issues("BeforeAfter", { ...ba, pixelWidth: 1200 })[0].path).toBe("blocks.0.props.pixelWidth");
  });

  it("renders both images with labels and a hidden slider for the client", () => {
    const html = POST_WIDGETS.BeforeAfter.html(valid("BeforeAfter", ba), en);
    expect(html).toContain('alt="Old inbox"');
    expect(html).toContain('alt="New inbox"');
    expect(html).toContain('<figcaption class="pw-ba__label">Before</figcaption>');
    expect(html).toContain('<figcaption class="pw-ba__label">Now</figcaption>');
    expect(html).toMatch(/<input class="pw-ba__range" type="range" min="0" max="100" step="1" value="30" aria-label="Slide to compare before and after" aria-valuetext="30% before, 70% after" data-pw-compare-range hidden \/>/);
    expect(html).toContain("--pw-ba-pos: 30%");
  });

  it("exports both images as Markdown", () => {
    expect(POST_WIDGETS.BeforeAfter.markdown(valid("BeforeAfter", ba), vi)).toBe("**Trước:** ![Old inbox](https://cdn.dewee.sh/a.png)\n\n**Now:** ![New inbox](/media/2026/b.png)");
  });
});

describe("visual widgets in a post", () => {
  it("place inline and export in place", () => {
    const blocks = [{ id: "c", type: "Chart", props: bar }];
    const html = renderPostBody({ body_md: 'Intro\n\n::widget{id="c"}\n\nEnd', blocks }, { mode: "public", labels: en.labels });
    expect(html).toMatch(/<p>Intro<\/p>\n<div class="pw" data-widget="Chart">[\s\S]*<p>End<\/p>/);
    expect(postBodyMarkdown({ body_md: 'Intro\n\n::widget{id="c"}\n\nEnd', blocks }, en.labels)).toMatch(/^Intro\n\n\*\*Teams\*\*\n\n\| Category[\s\S]*\| W3 \| 58 \|\n\nEnd$/);
  });
});
