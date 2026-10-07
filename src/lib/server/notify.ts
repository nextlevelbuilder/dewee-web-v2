/**
 * Team notifications to Discord. A no-op unless DISCORD_WEBHOOK_URL is configured as a secret.
 * Outside production the title carries an "[environment]" prefix.
 *
 * Returns true only when Discord accepted the post, so callers that must not lose a ping (the
 * "new website chat" notice, the daily digest) can retry. A refused post (429 rate limit, 4xx for
 * a malformed embed) is logged with its status instead of passing silently.
 */
const TIMEOUT_MS = 8000;

export async function notifyTeam(env: Env, title: string, lines: Record<string, string | undefined>): Promise<boolean> {
  if (!env.DISCORD_WEBHOOK_URL) return false;
  const fields = Object.entries(lines)
    .filter(([, v]) => v)
    .slice(0, 25)
    .map(([name, value]) => ({ name: name.slice(0, 250), value: String(value).slice(0, 1000), inline: false }));
  try {
    const res = await fetch(env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      // Discord asks API clients for a descriptive User-Agent; requests without one can be refused.
      headers: { "content-type": "application/json", "user-agent": "dewee.sh-website (https://dewee.sh, 2)" },
      body: JSON.stringify({
        username: "dewee.sh",
        embeds: [{ title: labelledTitle(env, title), color: 0x5446e8, fields, timestamp: new Date().toISOString() }],
        allowed_mentions: { parse: [] },
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (res.ok) return true;
    const detail = (await res.text().catch(() => "")).slice(0, 200);
    console.warn("notifyTeam refused", { title, status: res.status, retryAfter: res.headers.get("retry-after"), detail });
    return false;
  } catch (err) {
    console.warn("notifyTeam failed", { title, error: err instanceof Error ? err.message : String(err) });
    return false;
  }
}

/** Production titles are bare; other environments are labelled so test pings are never mistaken for real ones. */
export function labelledTitle(env: Pick<Env, "ENVIRONMENT">, title: string): string {
  return `${env.ENVIRONMENT === "production" ? "" : `[${env.ENVIRONMENT}] `}${title}`.slice(0, 250);
}

export const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;
