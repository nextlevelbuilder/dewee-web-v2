/**
 * One agent reply for the website chat, behind the site-wide daily budget.
 * The reply comes back split into visitor-facing text and structured actions (chat-agent-actions).
 * Whenever the agent should not or could not answer, the result says why, so the room falls back
 * to the FAQ and counts real failures. The first refusal of each day posts one Discord alert.
 */
import { parseAgentReply, visibleDraft, type AgentActions } from "./chat-agent-actions";
import { agentConfig, askAgent, buildAgentMessage, type AgentTurnContext, type TranscriptLine } from "./chat-agent-client";
import { DAY_MS, dailyBudget } from "./chat-limits";
import { limiter } from "./chat-limiter";
import { notifyTeam } from "./notify";

/** Longest reply the widget shows; the agent is told to be brief, this is the hard stop. */
const MAX_REPLY = 4000;
/**
 * Every website visitor talks to the runtime as this one user: the agent keeps no memory, each
 * request is its own runtime session, and a fixed id stops per-visitor profiles piling up there.
 */
export const RUNTIME_VISITOR_ID = "dewee-web-visitor";

/** `off`: agent not configured; `budget`: daily budget spent; `error`: the call failed or said nothing usable. */
export type AgentTurn =
  | { ok: true; text: string; actions: AgentActions }
  | { ok: false; reason: "off" | "budget" | "error" };

export async function agentReply(
  env: Env,
  history: TranscriptLine[],
  locale: "en" | "vi",
  sid: string,
  onText: (visibleSoFar: string) => void,
  ctx?: AgentTurnContext,
): Promise<AgentTurn> {
  const cfg = agentConfig(env);
  if (!cfg) return { ok: false, reason: "off" };

  const budget = dailyBudget(env.CHAT_AGENT_DAILY_BUDGET);
  const global = limiter(env, "global");
  const spend = await global.hit("agent-replies", budget, DAY_MS);
  if (!spend.ok) {
    const alert = await global.hit("budget-alert", 1, DAY_MS);
    if (alert.ok) {
      await notifyTeam(env, "Chat agent daily budget reached", {
        Budget: `${budget} agent replies today (UTC). Visitors get FAQ answers until midnight UTC.`,
        Change: "Raise CHAT_AGENT_DAILY_BUDGET or set CHAT_AGENT_ENABLED=false.",
      });
    }
    return { ok: false, reason: "budget" };
  }

  try {
    let shown = "";
    const raw = await askAgent(cfg, buildAgentMessage(history, locale, ctx), RUNTIME_VISITOR_ID, (textSoFar) => {
      // Action blocks never reach the visitor, not even half-streamed.
      const visible = visibleDraft(textSoFar);
      if (visible && visible !== shown) onText((shown = visible));
    });
    const reply = parseAgentReply(raw);
    const text = reply.text.slice(0, MAX_REPLY);
    console.log("chat agent replied", { sid, chars: raw.length, invalidActions: reply.invalid, lead: Boolean(reply.actions.lead) });
    // Without words for the visitor only a captured lead stands on its own (the room thanks them).
    if (!text && !reply.actions.lead) return { ok: false, reason: "error" };
    return { ok: true, text, actions: reply.actions };
  } catch (err) {
    console.warn("chat agent reply failed", err instanceof Error ? err.message : err);
    return { ok: false, reason: "error" };
  }
}
