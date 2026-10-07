/**
 * Posts the daily website-chat digest from the hourly cron. It is due from 01:00 UTC (08:00 in
 * Vietnam); a KV marker per UTC day makes it run once, and the marker is only written after
 * Discord accepts the post, so a failed post is retried by the next hourly run that day.
 */
import { composeDigest, type DigestData, type DigestLead, type DigestSession } from "./chat-digest";
import { notifyTeam } from "./notify";

export const DIGEST_HOUR_UTC = 1;
const WINDOW_MS = 24 * 60 * 60_000;
const MARKER_TTL_SECONDS = 3 * 24 * 60 * 60;

export type DigestRun = "sent" | "already-sent" | "not-due" | "not-configured" | "failed";

/** The KV key that marks today's digest as sent. */
export const digestMarker = (now: Date) => `chat-digest:${now.toISOString().slice(0, 10)}`;

export async function loadDigestData(db: D1Database, since: string): Promise<DigestData> {
  const [sessions, leads] = await Promise.all([
    db.prepare(
      `SELECT locale, country, landing_path, page_path, utm_source, referrer, first_message, created_at, outcome,
              agent_failures, faq_fallbacks, handoff_at
         FROM chat_sessions WHERE last_at >= ?1 ORDER BY created_at DESC LIMIT 500`,
    ).bind(since).all<DigestSession>(),
    db.prepare("SELECT email, payload, created_at FROM leads WHERE kind = 'chat' AND created_at >= ?1 ORDER BY created_at DESC LIMIT 50")
      .bind(since).all<DigestLead>(),
  ]);
  return { since, sessions: sessions.results, leads: leads.results };
}

export async function runDailyDigest(env: Env, now = new Date()): Promise<DigestRun> {
  if (now.getUTCHours() < DIGEST_HOUR_UTC) return "not-due";
  if (!env.DISCORD_WEBHOOK_URL) return "not-configured";
  const marker = digestMarker(now);
  if (await env.KV.get(marker)) return "already-sent";

  const data = await loadDigestData(env.DB, new Date(now.getTime() - WINDOW_MS).toISOString());
  const digest = composeDigest(data, now);
  if (!(await notifyTeam(env, digest.title, digest.lines))) return "failed";
  await env.KV.put(marker, now.toISOString(), { expirationTtl: MARKER_TTL_SECONDS });
  return "sent";
}
