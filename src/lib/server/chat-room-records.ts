/**
 * What a ChatRoom writes outside itself: the D1 session index, chat leads, team notifications
 * and the fixed system lines it shows visitors. Kept apart so the room stays about messaging.
 */
import { notifyTeam } from "./notify";

type Locale = "en" | "vi";
type Line = { role: string; text: string };

export const transcriptText = (lines: Line[]) => lines.map((m) => `${m.role}: ${m.text}`).join("\n");

/** Counts a visitor message in the session index; the first one also pings the team. */
export async function recordVisitorMessage(env: Env, sid: string | null, locale: Locale, text: string, first: boolean) {
  const now = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO chat_sessions (sid, locale, first_message, messages, status, created_at, last_at) VALUES (?1, ?2, ?3, 1, 'open', ?4, ?4)
     ON CONFLICT(sid) DO UPDATE SET messages = messages + 1, last_at = ?4`,
  ).bind(sid, locale, text.slice(0, 500), now).run().catch((err) => console.error("chat session upsert failed", err));
  if (first) await notifyTeam(env, "New website chat", { Locale: locale, Message: text, Session: sid ?? undefined });
}

/** Counts an agent or operator reply in the session index. */
export async function recordReply(env: Env, sid: string | null) {
  await env.DB.prepare("UPDATE chat_sessions SET last_at = ?1, messages = messages + 1 WHERE sid = ?2").bind(new Date().toISOString(), sid).run().catch(() => undefined);
}

/** Stores the visitor's email as a chat lead and tells the team. */
export async function recordChatLead(env: Env, sid: string | null, locale: Locale, email: string, transcript: Line[]) {
  const now = new Date().toISOString();
  await env.DB.batch([
    env.DB.prepare("UPDATE chat_sessions SET email = ?1, last_at = ?2 WHERE sid = ?3").bind(email, now, sid),
    env.DB.prepare("INSERT INTO leads (kind, email, locale, source, payload, created_at) VALUES ('chat', ?1, ?2, 'chat-widget', ?3, ?4)").bind(email, locale, JSON.stringify({ sid }), now),
  ]).catch((err) => console.error("chat email save failed", err));
  await notifyTeam(env, "New chat lead", { Email: email, Session: sid ?? undefined, Transcript: transcriptText(transcript) });
}

/** Tells the team a visitor wants a person. */
export async function notifyHandoff(env: Env, sid: string | null, email: string | null, transcript: Line[]) {
  await notifyTeam(env, "Chat visitor asked for a human", { Email: email ?? "not yet", Session: sid ?? undefined, Transcript: transcriptText(transcript) });
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
