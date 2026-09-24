/**
 * Props schemas for the marketing blocks in src/components/blocks, as the page builder may use them.
 * Every example validates (see tests) and uses verified facts only.
 */
import { z } from "zod";
import { heading, href, icon, iconSrc, optText, text } from "./block-fields";
import type { BlockDef } from "./block-types";

const MOODS = ["happy", "awake", "wink", "sleepy", "love", "surprised", "focused"] as const;
const ACCESSORIES = ["none", "glasses", "headset", "cap"] as const;

const pageHero = z
  .object({
    eyebrow: optText(80),
    title: text(160),
    lede: optText(400),
    note: optText(80),
    actions: z
      .array(z.object({ label: text(60), href, variant: z.enum(["primary", "ink", "ghost"]).optional(), chat: z.boolean().optional() }).strict())
      .max(2)
      .optional(),
    back: z.object({ label: text(60), href }).strict().optional(),
    mascot: z.union([z.literal(false), z.object({ mood: z.enum(MOODS).optional(), accessory: z.enum(ACCESSORIES).optional() }).strict()]).optional(),
    align: z.enum(["start", "center"]).optional(),
  })
  .strict();

const sectionHead = heading.extend({ size: z.enum(["xl", "l", "m"]).optional() }).strict();

const featureGrid = z
  .object({
    heading: heading.optional(),
    items: z.array(z.object({ icon, title: text(80), body: text(300), href: href.optional() }).strict()).min(1).max(12),
    columns: z.union([z.literal(2), z.literal(3)]).optional(),
  })
  .strict();

const steps = z
  .object({
    heading: heading.optional(),
    label: text(24),
    items: z.array(z.object({ title: text(100), body: text(400) }).strict()).min(1).max(6),
    highlight: z.number().int().min(0).max(5).optional(),
    highlightNote: optText(60),
  })
  .strict();

const faq = z
  .object({ heading: heading.optional(), items: z.array(z.object({ q: text(200), a: text(1200) }).strict()).min(1).max(20) })
  .strict();

const quote = z.object({ text: text(400), cite: optText(80), role: optText(80) }).strict();

const ctaBand = z
  .object({
    title: text(120),
    body: optText(400),
    primary: z.object({ label: text(60), href }).strict(),
    secondary: z
      .object({ label: text(60), href: href.optional(), chat: z.boolean().optional() })
      .strict()
      .refine((s) => Boolean(s.href) !== Boolean(s.chat), "Give the secondary button either an href or chat: true.")
      .optional(),
    note: optText(80),
  })
  .strict();

const timeline = z
  .object({
    heading: heading.optional(),
    items: z.array(z.object({ date: text(24), text: text(160) }).strict()).min(1).max(12),
    vertical: z.boolean().optional(),
    label: optText(80),
  })
  .strict();

const proofStrip = z
  .object({ items: z.array(z.object({ value: text(16), label: text(40) }).strict()).min(1).max(6), label: optText(80) })
  .strict();

const tocIndex = z
  .object({
    heading: heading.optional(),
    items: z.array(z.object({ title: text(100), meta: text(60), href, icon: icon.optional() }).strict()).min(1).max(30),
    columns: z.union([z.literal(1), z.literal(2)]).optional(),
  })
  .strict();

const logoWall = z
  .object({
    heading: heading.optional(),
    groups: z
      .array(
        z
          .object({
            label: text(60),
            size: z.enum(["l", "s"]).optional(),
            items: z.array(z.object({ brand: z.string().regex(/^[a-z0-9-]{1,40}$/), name: text(40), note: optText(80) }).strict()).min(1).max(40),
          })
          .strict(),
      )
      .min(1)
      .max(4),
  })
  .strict();

const ecosystemGrid = z
  .object({
    heading: heading.optional(),
    products: z
      .array(
        z
          .object({
            id: z.string().regex(/^[a-z0-9-]{1,40}$/),
            name: text(40),
            url: z.url({ protocol: /^https$/ }).max(300),
            icon: iconSrc,
            tagline: text(120),
            role: text(240),
          })
          .strict(),
      )
      .min(1)
      .max(12),
  })
  .strict();

export const MARKETING_BLOCKS: BlockDef[] = [
  {
    type: "PageHero",
    category: "section",
    render: "hero",
    description: "Page intro with the page's only h1: eyebrow, serif title (inline markup), lede, handwritten note, up to two actions and a mascot. Use once, first.",
    schema: pageHero,
    example: { eyebrow: "Developers", title: "Build on dewee.sh with *your* agents.", lede: "A REST API, a CLI and an MCP server share one page service.", actions: [{ label: "Read the API", href: "/developers" }], mascot: { mood: "focused", accessory: "glasses" } },
  },
  {
    type: "SectionHead",
    category: "section",
    render: "section",
    description: "A section heading on its own: eyebrow, title, lede and a margin note.",
    schema: sectionHead,
    example: { eyebrow: "Security", title: "Closed by default. Opened *on purpose*.", lede: "Every capability an agent gets is one you granted." },
  },
  {
    type: "FeatureGrid",
    category: "section",
    render: "section",
    description: "Numbered features on a ruled grid; each item has a Lucide icon, title and body, and may link.",
    schema: featureGrid,
    example: { heading: { title: "What it does" }, items: [{ icon: "messages-square", title: "Where your team already talks", body: "Telegram, Zalo, Slack, Lark, Discord and more." }, { icon: "scan-eye", title: "Shows its work", body: "Every run is traced." }], columns: 2 },
  },
  {
    type: "Steps",
    category: "section",
    render: "section",
    description: "Up to six steps written as notebook exercises; `highlight` (0-based) marks the step we take on.",
    schema: steps,
    example: { label: "Exercise", items: [{ title: "Tell us where it hurts", body: "One call to map the work." }, { title: "We build the agents with you", body: "Channels, models and guardrails." }, { title: "They clock in", body: "Agents join your chats." }], highlight: 1, highlightNote: "the hard one" },
  },
  {
    type: "Faq",
    category: "section",
    render: "section",
    description: "Questions and answers as native details/summary; also emitted as FAQPage JSON-LD.",
    schema: faq,
    example: { heading: { title: "Questions, answered" }, items: [{ q: "Can we keep our data on our own servers?", a: "Yes. The On-Premises option runs dewee on your hardware." }] },
  },
  {
    type: "Quote",
    category: "section",
    render: "section",
    description: "A pull quote in display italics on the red margin rule.",
    schema: quote,
    example: { text: "Inspired by OpenClaw. Rebuilt from scratch. Grown up for business." },
  },
  {
    type: "CtaBand",
    category: "section",
    render: "self",
    description: "Closing call to action signed by the mascot. Every page should end with one.",
    schema: ctaBand,
    example: { title: "Let us do the *hard part*.", body: "Tell us about the work your team would rather not do.", primary: { label: "Talk to us", href: "/contact" }, secondary: { label: "Chat with dewee", chat: true } },
  },
  {
    type: "Timeline",
    category: "section",
    render: "section",
    description: "A ruler timeline (horizontal on wide screens); the last entry pulses as 'now'.",
    schema: timeline,
    example: { items: [{ date: "Feb 2026", text: "GoClaw's first commit" }, { date: "Sep 2026", text: "dewee v3.33" }], label: "Milestones" },
  },
  {
    type: "ProofStrip",
    category: "section",
    render: "section",
    description: "A ruler of verified numbers. Never estimate: every value needs a source.",
    schema: proofStrip,
    example: { items: [{ value: "637,225", label: "lines of Go" }, { value: "8,900+", label: "automated tests" }], label: "dewee in numbers" },
  },
  {
    type: "TocIndex",
    category: "section",
    render: "section",
    description: "A table of contents with dot leaders; each row links somewhere.",
    schema: tocIndex,
    example: { items: [{ title: "Security model", meta: "5 layers", href: "/security", icon: "shield" }, { title: "Pricing", meta: "3 plans", href: "/pricing" }] },
  },
  {
    type: "LogoWall",
    category: "section",
    render: "section",
    description: "Integrations as stamps; `brand` picks a vendored mark (falls back to a monogram).",
    schema: logoWall,
    example: { groups: [{ label: "Chat channels", size: "l", items: [{ brand: "telegram", name: "Telegram" }, { brand: "zalo", name: "Zalo" }] }] },
  },
  {
    type: "EcosystemGrid",
    category: "section",
    render: "section",
    description: "Cards linking to sibling products (https URLs only).",
    schema: ecosystemGrid,
    example: { products: [{ id: "goclaw", name: "GoClaw", url: "https://goclaw.sh", icon: "/img/ecosystem/goclaw.svg", tagline: "The open-source ancestor. Free for the community.", role: "Source-available agent gateway (CC BY-NC 4.0)" }] },
  },
];
