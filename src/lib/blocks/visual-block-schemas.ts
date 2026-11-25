/**
 * Props schemas for the data and comparison widgets that blog posts place inline: Chart (bar,
 * line, pie, donut), Diagram (Mermaid), ComparisonTable and BeforeAfter. Every one of them
 * carries its own text alternative (a data table, alt text, marks with words), so a reader
 * without the picture, a feed or the `.md` twin gets the same facts.
 */
import { z } from "zod";
import { href, imageSrc, optText, text } from "./block-fields";
import type { BlockDef } from "./block-types";

const POST_ONLY = ["post"] as const;

export const CHART_KINDS = ["bar", "line", "pie", "donut"] as const;
export const CHART_MAX_POINTS = 50;
export const CHART_MAX_SERIES = 6;
/** Pie and donut slices; more than this and the colours stop telling slices apart. */
export const CHART_MAX_SLICES = 8;

const chartValue = z
  .number({ error: "Use a number (no quotes, no units)." })
  .refine((n) => Number.isFinite(n) && Math.abs(n) <= 1e12, "Use a finite number between -1e12 and 1e12.");

const chart = z
  .object({
    kind: z.enum(CHART_KINDS),
    title: text(160),
    labels: z.array(text(60)).min(1).max(CHART_MAX_POINTS, `At most ${CHART_MAX_POINTS} labels per chart.`),
    series: z
      .array(z.object({ name: text(60), values: z.array(chartValue).max(CHART_MAX_POINTS) }).strict())
      .min(1)
      .max(CHART_MAX_SERIES, `At most ${CHART_MAX_SERIES} series per chart.`),
    unit: optText(16),
    labelHeading: optText(60),
    caption: optText(300),
    source: optText(160),
    sourceUrl: href.optional(),
  })
  .strict()
  .superRefine((c, ctx) => {
    c.series.forEach((s, i) => {
      if (s.values.length !== c.labels.length)
        ctx.addIssue({ code: "custom", path: ["series", i, "values"], message: `Give ${c.labels.length} values, one per label (got ${s.values.length}).` });
    });
    const names = c.series.map((s) => s.name);
    names.forEach((n, i) => {
      if (names.indexOf(n) !== i) ctx.addIssue({ code: "custom", path: ["series", i, "name"], message: `Series name "${n}" is used twice.` });
    });
    if (c.kind === "line" && c.labels.length < 2) ctx.addIssue({ code: "custom", path: ["labels"], message: "A line chart needs at least two labels." });
    if (c.kind === "pie" || c.kind === "donut") {
      if (c.series.length !== 1) ctx.addIssue({ code: "custom", path: ["series"], message: `A ${c.kind} chart takes exactly one series.` });
      if (c.labels.length < 2 || c.labels.length > CHART_MAX_SLICES)
        ctx.addIssue({ code: "custom", path: ["labels"], message: `A ${c.kind} chart takes 2 to ${CHART_MAX_SLICES} slices.` });
      const values = c.series[0]?.values ?? [];
      values.forEach((v, j) => {
        if (v < 0) ctx.addIssue({ code: "custom", path: ["series", 0, "values", j], message: "Slices cannot be negative." });
      });
      if (values.length && values.every((v) => v <= 0)) ctx.addIssue({ code: "custom", path: ["series", 0, "values"], message: "At least one slice must be above zero." });
    }
  });

/** Diagram types the client renders; anything else is rejected before it reaches a reader. */
export const MERMAID_TYPES = [
  "flowchart",
  "graph",
  "sequenceDiagram",
  "classDiagram",
  "stateDiagram",
  "stateDiagram-v2",
  "erDiagram",
  "gantt",
  "pie",
  "journey",
  "gitGraph",
  "mindmap",
  "timeline",
  "quadrantChart",
] as const;

/** The first meaningful line names the diagram type (`%%` comments may come first). */
export function mermaidType(source: string): string {
  const line = source.split(/\r?\n|\r/).find((l) => l.trim() && !l.trim().startsWith("%%")) ?? "";
  return line.trim().split(/\s/)[0] ?? "";
}

/** True when any statement is a `click`; Mermaid ends a statement at a newline or at `;`. */
export function hasClickStatement(source: string): boolean {
  return source.split(/\r?\n|\r|;/).some((statement) => /^\s*click\s/.test(statement));
}

const mermaidSource = z
  .string()
  .max(5000, "Keep the diagram under 5,000 characters.")
  .refine((s) => s.trim().length > 0, "The diagram source is empty.")
  .refine((s) => (MERMAID_TYPES as readonly string[]).includes(mermaidType(s)), `Start with a diagram type: ${MERMAID_TYPES.join(", ")}.`)
  // The renderer runs with securityLevel "strict"; these checks keep config overrides, front
  // matter, click handlers and raw HTML out of the source as well, so nothing depends on that alone.
  .refine((s) => !/%%\s*\{/.test(s), "Init directives (%%{…}%%) are not allowed; the site sets the theme.")
  .refine((s) => !/^\s*---\s*$/m.test(s), "Front matter (---) is not allowed in the diagram source.")
  .refine((s) => !hasClickStatement(s), "click handlers and links are not allowed in diagrams.")
  .refine((s) => !/<\s*\/?\s*[a-z!]/i.test(s), "HTML tags are not allowed in diagram labels; use plain text.");

const diagram = z
  .object({
    source: mermaidSource,
    alt: z.string().trim().min(1, "Describe what the diagram shows for people who cannot see it.").max(600),
    caption: optText(300),
  })
  .strict();

const MARKS = ["yes", "no", "partial"] as const;
const cell = z.union([text(200), z.object({ mark: z.enum(MARKS), text: optText(120) }).strict()], {
  error: 'Use text, or { "mark": "yes" | "no" | "partial", "text"?: "…" }.',
});

const comparisonTable = z
  .object({
    title: text(160),
    criterionHeading: optText(60),
    columns: z.array(text(60)).min(2).max(5, "Compare at most five options."),
    rows: z.array(z.object({ criterion: text(120), cells: z.array(cell) }).strict()).min(1).max(30, "At most 30 rows."),
    highlight: z.number().int().min(0).optional(),
    highlightLabel: optText(40),
    caption: optText(300),
  })
  .strict()
  .superRefine((t, ctx) => {
    t.rows.forEach((r, i) => {
      if (r.cells.length !== t.columns.length)
        ctx.addIssue({ code: "custom", path: ["rows", i, "cells"], message: `Give ${t.columns.length} cells, one per column (got ${r.cells.length}).` });
    });
    if (t.highlight !== undefined && t.highlight >= t.columns.length)
      ctx.addIssue({ code: "custom", path: ["highlight"], message: `highlight is a 0-based column index below ${t.columns.length}.` });
  });

const alt = z.string().trim().min(1, "Describe the image for people who cannot see it.").max(300);
const pixels = z.number().int().min(1).max(8000);
const side = z.object({ src: imageSrc, alt, label: optText(40) }).strict();

const beforeAfter = z
  .object({
    before: side,
    after: side,
    caption: optText(300),
    start: z.number().int().min(0).max(100).optional(),
    pixelWidth: pixels.optional(),
    pixelHeight: pixels.optional(),
  })
  .strict()
  .refine((v) => (v.pixelWidth === undefined) === (v.pixelHeight === undefined), { message: "Give pixelWidth and pixelHeight together.", path: ["pixelWidth"] });

export const VISUAL_BLOCKS: BlockDef[] = [
  {
    type: "Chart",
    category: "media",
    contexts: POST_ONLY,
    render: "section",
    description:
      `A bar, line, pie or donut chart drawn on the server as accessible SVG in the site's colours, with a "View data" table under it. ` +
      `\`labels\` are the categories (x axis or slices); each of up to ${CHART_MAX_SERIES} \`series\` has one number per label (at most ${CHART_MAX_POINTS}). Pie and donut take one series of 2–${CHART_MAX_SLICES} non-negative values. Feeds get a Markdown table.`,
    schema: chart,
    example: {
      kind: "bar",
      title: "Teams using the agent",
      labels: ["Week 1", "Week 2", "Week 3"],
      series: [{ name: "Teams", values: [12, 31, 58] }],
      unit: "teams",
      caption: "Illustrative numbers for the example.",
    },
  },
  {
    type: "Diagram",
    category: "media",
    contexts: POST_ONLY,
    render: "section",
    description:
      "A Mermaid diagram (flowchart, sequence, class, state, ER, gantt, pie, journey, gitGraph, mindmap, timeline, quadrantChart). `alt` is required: say what the diagram shows. " +
      "Drawn in the reader's browser in strict mode, in the site's colours; without JavaScript the source shows instead. No %%{init}%%, front matter, click handlers or HTML labels.",
    schema: diagram,
    example: {
      source: "flowchart LR\n  A[Chat app] --> B[dewee gateway]\n  B --> C[Agent]\n  C --> D{Approve?}\n  D -->|yes| E[Reply]",
      alt: "A message goes from the chat app to the dewee gateway and on to the agent; a person approves before the reply is sent.",
      caption: "How a request flows.",
    },
  },
  {
    type: "ComparisonTable",
    category: "section",
    contexts: POST_ONLY,
    render: "section",
    description:
      "Options side by side: `columns` are the options (2–5), each row is a criterion with one cell per column. A cell is text or { mark: yes | no | partial, text? }; marks show an icon and read as words. " +
      "`highlight` (0-based column index) marks a recommended option. Scrolls inside its own box on small screens.",
    schema: comparisonTable,
    example: {
      title: "Self-install or managed",
      columns: ["Self-install", "Managed"],
      rows: [
        { criterion: "Runs on your servers", cells: [{ mark: "yes" }, { mark: "no" }] },
        { criterion: "Updates", cells: ["You apply them", { mark: "partial", text: "We schedule them with you" }] },
      ],
      highlight: 0,
    },
  },
  {
    type: "BeforeAfter",
    category: "media",
    contexts: POST_ONLY,
    render: "section",
    description:
      "Two images of the same view, before and after, with a keyboard-accessible slider that reveals one over the other. Without JavaScript they show side by side. " +
      "Each side needs `src` (https:// or /media/) and `alt`; use images with the same size. `start` is the slider position in percent (default 50).",
    schema: beforeAfter,
    example: {
      before: { src: "https://cdn.dewee.sh/media/2026/09/inbox-before.webp", alt: "A shared inbox with forty unanswered messages", label: "Before" },
      after: { src: "https://cdn.dewee.sh/media/2026/09/inbox-after.webp", alt: "The same inbox with drafts ready for approval", label: "After" },
      caption: "The agent drafts replies; a person approves them.",
    },
  },
];
