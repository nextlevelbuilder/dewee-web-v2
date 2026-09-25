/**
 * One agent reply for the website chat, behind the site-wide daily budget.
 * Returns null whenever the agent should not or could not answer, so the room falls back to the FAQ.
 * The first refusal of each day posts one Discord alert.
 */
import { agentConfig, askAgent, buildAgentMessage, type TranscriptLine } from "./chat-agent-client";
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

export async function agentReply(
  env: Env,
  history: TranscriptLine[],
  locale: "en" | "vi",
  sid: string,
  onText: (textSoFar: string) => void,
): Promise<string | null> {
  const cfg = agentConfig(env);
  if (!cfg) return null;

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
    return null;
  }

  try {
    const text = await askAgent(cfg, buildAgentMessage(history, locale), RUNTIME_VISITOR_ID, onText);
    if (text) console.log("chat agent replied", { sid, chars: text.length });
    const clean = text.trim().slice(0, MAX_REPLY);
    return clean || null;
  } catch (err) {
    console.warn("chat agent reply failed", err instanceof Error ? err.message : err);
    return null;
  }
}
