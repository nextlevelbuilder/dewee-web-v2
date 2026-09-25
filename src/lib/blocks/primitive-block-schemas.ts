/**
 * Props schemas for the simple page-builder primitives in src/components/blocks/primitives.
 * RichText and Columns take Markdown that is rendered with raw HTML escaped (safe-markdown.ts).
 * There is deliberately no Embed/HTML block: users never supply markup.
 */
import { z } from "zod";
import { button, heading, imageSrc, optText, text } from "./block-fields";
import type { BlockDef } from "./block-types";

const richText = z
  .object({ heading: heading.optional(), markdown: text(20000), width: z.enum(["prose", "wide"]).optional() })
  .strict();

const image = z
  .object({
    src: imageSrc,
    alt: z.string().trim().max(300),
    caption: optText(300),
    size: z.enum(["prose", "wide", "full"]).optional(),
    pixelWidth: z.number().int().min(1).max(8000).optional(),
    pixelHeight: z.number().int().min(1).max(8000).optional(),
  })
  .strict();

const callout = z
  .object({ tone: z.enum(["note", "tip", "warning", "success"]).optional(), title: optText(100), body: text(1000) })
  .strict();

const buttonRow = z
  .object({ buttons: z.array(button).min(1).max(4), align: z.enum(["start", "center"]).optional() })
  .strict();

const columns = z
  .object({
    heading: heading.optional(),
    columns: z.array(z.object({ title: optText(100), markdown: text(6000) }).strict()).min(2).max(3),
  })
  .strict();

const divider = z.object({ label: optText(60) }).strict();
const spacer = z.object({ size: z.enum(["s", "m", "l"]).optional() }).strict();

export const PRIMITIVE_BLOCKS: BlockDef[] = [
  {
    type: "RichText",
    category: "primitive",
    render: "section",
    description: "Markdown prose (GFM: headings, lists, tables, code, links, https or /media/ images). Raw HTML is shown as text, never rendered.",
    schema: richText,
    example: { markdown: "## Why a notebook\n\nGoClaw was the rough draft; dewee is the **fair copy**.\n\n- Closed by default\n- Traced end to end" },
  },
  {
    type: "Image",
    category: "primitive",
    render: "section",
    description: "One image with alt text and an optional caption. `src` must be https:// or a /media/ path from the media upload.",
    schema: image,
    example: { src: "https://cdn.dewee.sh/media/2026/09/example.webp", alt: "The dewee control plane dashboard", caption: "The control plane, light theme", size: "wide" },
  },
  {
    type: "Callout",
    category: "primitive",
    render: "section",
    description: "A boxed aside (note, tip, warning or success). `body` supports inline markup.",
    schema: callout,
    example: { tone: "tip", title: "Good to know", body: "In Vietnam, dewee is offered *On-Premises only*." },
  },
  {
    type: "ButtonRow",
    category: "primitive",
    render: "section",
    description: "One to four buttons in a row.",
    schema: buttonRow,
    example: { buttons: [{ label: "Talk to us", href: "/contact", variant: "primary" }, { label: "See pricing", href: "/pricing" }], align: "center" },
  },
  {
    type: "Columns",
    category: "primitive",
    render: "section",
    description: "Two or three columns of Markdown, each with an optional title.",
    schema: columns,
    example: { columns: [{ title: "AaaS", markdown: "Ready the same day." }, { title: "On-Premises", markdown: "Runs on your hardware." }] },
  },
  {
    type: "Divider",
    category: "primitive",
    render: "inline",
    description: "A hairline rule, optionally with a centred label.",
    schema: divider,
    example: { label: "or" },
  },
  {
    type: "Spacer",
    category: "primitive",
    render: "inline",
    description: "Vertical breathing room: s, m or l.",
    schema: spacer,
    example: { size: "m" },
  },
];
