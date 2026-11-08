/**
 * Props schemas for the interactive post widgets: Poll, Quiz and Survey (reader answers stored in
 * D1 by post id + widget id, see src/lib/server/post-widget-votes/) and Demo (a sandboxed iframe
 * from an allowlisted host). Options and questions carry their own short ids so stored answers
 * stay attached when a label is reworded; renaming an id starts its count again.
 */
import { z } from "zod";
import { optText, text } from "./block-fields";
import type { BlockDef } from "./block-types";
import { DEMO_ASPECTS, DEMO_HOSTS, DEMO_URL_RULE, parseDemoUrl } from "./demo-urls";

const POST_ONLY = ["post"] as const;

/** Longest free-text survey answer, in characters. */
export const SURVEY_TEXT_MAX = 280;
export const ANSWER_ID_RE = /^[a-z0-9][a-z0-9-]{0,31}$/;

const answerId = z.string().regex(ANSWER_ID_RE, "Use 1–32 lowercase letters, digits and dashes, starting with a letter or digit.");
const option = z.object({ id: answerId, label: text(120) }).strict();

/** Ids must be unique within their list; the issue points at the repeated entry. */
const uniqueIds =
  (noun: string) =>
  (items: { id: string }[], ctx: z.RefinementCtx): void => {
    const seen = new Set<string>();
    items.forEach((item, i) => {
      if (seen.has(item.id)) ctx.addIssue({ code: "custom", path: [i, "id"], message: `Duplicate ${noun} id "${item.id}".` });
      seen.add(item.id);
    });
  };

const options = z.array(option).min(2).max(10).superRefine(uniqueIds("option"));
const closesAt = z.iso.datetime({ offset: true, message: "Use an ISO 8601 date-time such as 2026-12-31T23:59:00Z." }).optional();

const poll = z.object({ question: text(200), options, closesAt }).strict();

const quiz = z
  .object({ question: text(200), options, answer: answerId, explanation: text(600), closesAt })
  .strict()
  .refine((q) => q.options.some((o) => o.id === q.answer), { message: "`answer` must be the id of one of the options.", path: ["answer"] });

const question = z
  .object({
    id: answerId,
    prompt: text(200),
    kind: z.enum(["single", "multi", "text"]),
    options: options.optional(),
    required: z.boolean().optional(),
  })
  .strict()
  .superRefine((q, ctx) => {
    if (q.kind === "text" && q.options) ctx.addIssue({ code: "custom", path: ["options"], message: "Text questions take no options." });
    if (q.kind !== "text" && !q.options) ctx.addIssue({ code: "custom", path: ["options"], message: `A ${q.kind}-choice question needs 2–10 options.` });
  });

const survey = z
  .object({
    title: optText(120),
    intro: optText(400),
    questions: z.array(question).min(1).max(10).superRefine(uniqueIds("question")),
    closesAt,
  })
  .strict();

const demo = z
  .object({
    url: z.string().trim().min(1).max(500).refine((s) => parseDemoUrl(s) !== null, DEMO_URL_RULE),
    title: text(160),
    description: optText(400),
    aspectRatio: z.enum(DEMO_ASPECTS).optional(),
    caption: optText(300),
  })
  .strict();

const privacy = "Answers are stored anonymously (a salted hash of a random first-party cookie, never the IP).";

export const INTERACTIVE_BLOCKS: BlockDef[] = [
  {
    type: "Poll",
    category: "primitive",
    contexts: POST_ONLY,
    requiresId: true,
    render: "section",
    description: `One question, 2–10 options, one vote per reader (a reader may change it until \`closesAt\`). Readers see the percentages after voting. Needs a block \`id\`. ${privacy}`,
    schema: poll,
    example: {
      question: "Where would your first agent work?",
      options: [
        { id: "support", label: "Customer support" },
        { id: "sales", label: "Sales follow-up" },
        { id: "ops", label: "Internal operations" },
      ],
    },
  },
  {
    type: "Quiz",
    category: "primitive",
    contexts: POST_ONLY,
    requiresId: true,
    render: "section",
    description: `One question with a correct \`answer\` (an option id) and an \`explanation\`. Both stay hidden until the reader answers; one answer per reader, final. Needs a block \`id\`. ${privacy}`,
    schema: quiz,
    example: {
      question: "Who approves the first run of a new agent?",
      options: [
        { id: "agent", label: "The agent itself" },
        { id: "person", label: "A person on your team" },
        { id: "nobody", label: "Nobody, it just runs" },
      ],
      answer: "person",
      explanation: "A person approves the first run, so the agent only repeats work someone has checked.",
    },
  },
  {
    type: "Survey",
    category: "primitive",
    contexts: POST_ONLY,
    requiresId: true,
    render: "section",
    description: `1–10 questions: \`single\` or \`multi\` choice (with options) or \`text\` (up to ${SURVEY_TEXT_MAX} characters); mark \`required\` ones. One submission per reader, final. Results are never public: only admins see the aggregates and free text (/admin/widgets). Needs a block \`id\`. ${privacy}`,
    schema: survey,
    example: {
      title: "Help us plan the next post",
      questions: [
        { id: "role", prompt: "What is your role?", kind: "single", required: true, options: [{ id: "eng", label: "Engineering" }, { id: "ops", label: "Operations" }, { id: "other", label: "Something else" }] },
        { id: "topics", prompt: "Which topics should we cover?", kind: "multi", options: [{ id: "setup", label: "Setup" }, { id: "security", label: "Security" }, { id: "pricing", label: "Pricing" }] },
        { id: "wish", prompt: "Anything else?", kind: "text" },
      ],
    },
  },
  {
    type: "Demo",
    category: "media",
    contexts: POST_ONLY,
    render: "section",
    description: `An interactive demo in a sandboxed iframe (scripts only: no same-origin, forms, popups or top navigation), loaded only after a click, with a link to open it instead. \`url\` must be https on an allowed demo host (${DEMO_HOSTS.join(", ")}; e.g. a CodePen /embed/ URL). Text exports show the link and \`description\`.`,
    schema: demo,
    example: {
      url: "https://codepen.io/codepen/embed/PNaGbb?default-tab=result",
      title: "A CodePen demo",
      description: "A small interactive example: try it here instead of reading a screenshot.",
      aspectRatio: "16:9",
    },
  },
];
