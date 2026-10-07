/**
 * Structured actions the advisor agent emits inside its reply, as fenced blocks:
 *
 *   <dewee-action>{"action":"capture_lead","email":"lan@acme.vn","need":"…","team_size":"20"}</dewee-action>
 *   <dewee-action>{"action":"request_email"}</dewee-action>
 *   <dewee-action>{"action":"handoff","reason":"…"}</dewee-action>
 *
 * The worker parses and validates them, acts on them and strips them before the visitor (or the
 * stored transcript) sees the reply. Blocks carry no session id: the Durable Object that received
 * the reply is the session, and any extra keys the model adds are dropped.
 * Contract for the agent: docs/chat-advisor-agent-instructions.md.
 */
import { z } from "zod";
import { EMAIL_RE } from "./notify";
import { emailsIn } from "./chat-visitor-email";

const OPEN = "<dewee-action";
const BLOCK_RE = /<dewee-action>([\s\S]*?)<\/dewee-action>/g;
const MAX_BLOCK = 2000;

/** Clips free text from the model to one line of `max` characters; empty means absent. */
const field = (max: number) =>
  z.string().nullish().transform((s) => s?.replace(/\s+/g, " ").trim().slice(0, max) || undefined);

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("capture_lead"),
    email: z.string().trim().toLowerCase().max(254).regex(EMAIL_RE),
    need: field(500),
    team_size: field(80),
    name: field(120),
    company: field(160),
  }),
  z.object({ action: z.literal("request_email") }),
  z.object({ action: z.literal("handoff"), reason: field(300) }),
]);

export type LeadFields = { email: string; need?: string; teamSize?: string; name?: string; company?: string };
export type AgentActions = { lead: LeadFields | null; requestEmail: boolean; handoff: boolean; handoffReason?: string };
export type ParsedReply = { text: string; actions: AgentActions; invalid: number };

/**
 * Splits a finished agent reply into the visitor-facing text and its actions.
 * Malformed blocks are dropped (and counted) rather than shown. The first valid lead wins.
 */
export function parseAgentReply(raw: string): ParsedReply {
  const actions: AgentActions = { lead: null, requestEmail: false, handoff: false };
  let invalid = 0;
  for (const match of raw.matchAll(BLOCK_RE)) {
    const body = match[1].trim();
    let json: unknown;
    try {
      json = body.length <= MAX_BLOCK ? JSON.parse(body) : null;
    } catch {
      json = null;
    }
    const parsed = actionSchema.safeParse(json);
    if (!parsed.success) { invalid++; continue; }
    const a = parsed.data;
    if (a.action === "capture_lead") {
      actions.lead ??= dropEmpty({ email: a.email, need: a.need, teamSize: a.team_size, name: a.name, company: a.company });
    } else if (a.action === "request_email") {
      actions.requestEmail = true;
    } else {
      actions.handoff = true;
      actions.handoffReason ??= a.reason;
    }
  }
  return { text: stripActions(raw), actions, invalid };
}

/** The reply without any action block, finished or not (a cut-off block is never shown). */
export function stripActions(raw: string): string {
  let text = raw.replace(BLOCK_RE, "");
  const open = text.indexOf(OPEN);
  if (open >= 0) text = text.slice(0, open);
  // A model that wraps the block in a code fence leaves an empty fence behind.
  return text.replace(/```[a-z]*\s*```/gi, "").replace(/\n{3,}/g, "\n\n").trim();
}

/**
 * What the visitor may see of a reply still streaming in: everything before the first action
 * block, minus a trailing partial "<dewee-act…" that may be the start of one.
 */
export function visibleDraft(textSoFar: string): string {
  const open = textSoFar.indexOf(OPEN);
  if (open >= 0) return textSoFar.slice(0, open).trimEnd();
  for (let k = Math.min(OPEN.length - 1, textSoFar.length); k > 0; k--) {
    if (textSoFar.endsWith(OPEN.slice(0, k))) return textSoFar.slice(0, -k).trimEnd();
  }
  return textSoFar;
}

/**
 * Visitor text is data: anything that looks like an action marker is defused before it reaches
 * the agent, so a visitor cannot paste a block for the model to echo back.
 */
export function defuseActions(text: string): string {
  return text.replace(/<\s*\/?\s*dewee-action/gi, (m) => m.replace("<", "‹"));
}

/**
 * A lead's email must be one the visitor actually gave: typed in their own messages or left in
 * the email form. The agent can neither invent contact details nor file someone else's.
 */
export function leadEmailAllowed(email: string, visitorTexts: string[], emailOnFile: string | null): boolean {
  if (emailOnFile && email === emailOnFile) return true;
  return visitorTexts.some((t) => emailsIn(t).includes(email));
}

function dropEmpty<T extends object>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}
