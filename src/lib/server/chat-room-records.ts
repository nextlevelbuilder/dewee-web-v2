/**
 * What a ChatRoom writes outside itself: the D1 session index (context, outcome, counters), team
 * notifications and the fixed system lines it shows visitors. Leads live in chat-lead-records.
 * Kept apart so the room stays about messaging.
 */
import type { ChatContext } from "../chat-session-context";
import { notifyTeam } from "./notify";

type Locale = "en" | "vi";
type Line = { role: string; text: string };

export const transcriptText = (lines: Line[]) => lines.map((m) => `${m.role}: ${m.text}`).join("\n");

/** How a session went, best first: a lead beats a handoff beats an FAQ fallback beats a plain answer. */
export type SessionOutcome = "answered" | "faq_fallback" | "handoff" | "lead";

const rank = (expr: string) =>
  `(CASE ${expr} WHEN 'lead' THEN 4 WHEN 'handoff' THEN 3 WHEN 'faq_fallback' THEN 2 WHEN 'answered' THEN 1 ELSE 0 END)`;
/** SQL that raises `outcome` to the bound parameter only when it ranks higher. */
export const raiseOutcomeSql = (param: string) => `outcome = CASE WHEN ${rank(param)} > ${rank("outcome")} THEN ${param} ELSE outcome END`;

const orNull = (v: string | undefined) => v ?? null;

/**
 * Counts a visitor message in the session index and stores where the visitor came from.
 * The first visit's landing, referrer, UTM and country stay; the page follows the visitor.
 */
export async function recordVisitorMessage(env: Env, sid: string | null, locale: Locale, text: string, ctx: ChatContext) {
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO chat_sessions (sid, locale, first_message, messages, status, created_at, last_at,
       landing_path, page_path, referrer, utm_source, utm_medium, utm_campaign, country)
     VALUES (?1, ?2, ?3, 1, 'open', ?4, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
     ON CONFLICT(sid) DO UPDATE SET messages = messages + 1, last_at = ?4,
       page_path = COALESCE(?6, page_path), landing_path = COALESCE(landing_path, ?5),
       referrer = COALESCE(referrer, ?7), utm_source = COALESCE(utm_source, ?8),
       utm_medium = COALESCE(utm_medium, ?9), utm_campaign = COALESCE(utm_campaign, ?10),
       country = COALESCE(country, ?11)`,
  ).bind(
    sid, locale, text.slice(0, 500), now,
    orNull(ctx.landing), orNull(ctx.page), orNull(ctx.referrer),
    orNull(ctx.utmSource), orNull(ctx.utmMedium), orNull(ctx.utmCampaign), orNull(ctx.country),
  ).run().catch((err) => console.error("chat session upsert failed", err));
}

/** Context lines shared by the team notifications. */
export function contextLines(ctx: ChatContext): Record<string, string | undefined> {
  const utm = [ctx.utmSource, ctx.utmMedium, ctx.utmCampaign].filter(Boolean).join(" / ");
  return { Page: ctx.page, Landing: ctx.landing !== ctx.page ? ctx.landing : undefined, Referrer: ctx.referrer, UTM: utm || undefined, Country: ctx.country };
}

/** "New website chat" for the team. Returns true once Discord has it, so the room can retry. */
export async function announceNewChat(env: Env, sid: string | null, locale: Locale, firstMessage: string, ctx: ChatContext): Promise<boolean> {
  return notifyTeam(env, "New website chat", { Locale: locale, ...contextLines(ctx), Message: firstMessage, Session: sid ?? undefined });
}

/** One reply's effect on the session counters and outcome. */
export type TurnResult = "answered" | "faq" | "agent_failure";

export async function recordTurn(env: Env, sid: string | null, result: TurnResult) {
  const [counters, outcome] =
    result === "answered" ? ["agent_replies = agent_replies + 1", "answered"]
    : result === "faq" ? ["faq_fallbacks = faq_fallbacks + 1", "faq_fallback"]
    : ["agent_failures = agent_failures + 1, faq_fallbacks = faq_fallbacks + 1", "faq_fallback"];
  await env.DB.prepare(`UPDATE chat_sessions SET ${counters}, ${raiseOutcomeSql("?1")} WHERE sid = ?2`)
    .bind(outcome, sid).run().catch((err) => console.error("chat turn record failed", err));
}

/** Marks the session as handed to a person. */
export async function recordHandoff(env: Env, sid: string | null) {
  await env.DB.prepare(`UPDATE chat_sessions SET handoff_at = COALESCE(handoff_at, ?1), ${raiseOutcomeSql("'handoff'")} WHERE sid = ?2`)
    .bind(new Date().toISOString(), sid).run().catch((err) => console.error("chat handoff record failed", err));
}

/** Counts an operator reply sent through the API in the session index. */
export async function recordReply(env: Env, sid: string | null) {
  await env.DB.prepare("UPDATE chat_sessions SET last_at = ?1, messages = messages + 1 WHERE sid = ?2").bind(new Date().toISOString(), sid).run().catch(() => undefined);
}

/** Tells the team a visitor wants a person. True once Discord has it. */
export async function notifyHandoff(env: Env, sid: string | null, email: string | null, ctx: ChatContext, transcript: Line[], reason?: string): Promise<boolean> {
  return notifyTeam(env, "Chat visitor asked for a human", {
    Email: email ?? "not yet", Reason: reason, ...contextLines(ctx), Session: sid ?? undefined, Transcript: transcriptText(transcript),
  });
}

export type SystemLine = "slow" | "turns";

const SYSTEM_LINES: Record<SystemLine, Record<Locale, string>> = {
  slow: {
    en: "You're typing faster than we can read. Try again in a few minutes.",
    vi: "Bạn gửi hơi nhanh, đợi vài phút rồi thử lại nhé.",
  },
  turns: {
    en: "This conversation has reached its length limit. Leave your email and the team will answer you directly, or write to hi@nextlevelbuilder.io.",
    vi: "Cuộc trò chuyện này đã khá dài. Để lại email, đội ngũ sẽ trả lời bạn trực tiếp, hoặc viết tới hi@nextlevelbuilder.io.",
  },
};

export const systemLine = (kind: SystemLine, locale: Locale) => SYSTEM_LINES[kind][locale];

/** The reply shown when the agent captured a lead but wrote nothing for the visitor. */
export const leadThanks = (locale: Locale, email: string) =>
  locale === "vi"
    ? `Cảm ơn bạn! Đội ngũ dewee sẽ liên hệ qua ${email} sớm nhé.`
    : `Thanks! Someone from the dewee team will reach you at ${email} soon.`;

/** Hands a visitor message to an external agent webhook; false means answer locally instead. */
export async function forwardToWebhook(url: string | undefined, payload: unknown): Promise<boolean> {
  if (!url) return false;
  try {
    const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload), signal: AbortSignal.timeout(8000) });
    return res.ok;
  } catch {
    return false;
  }
}
