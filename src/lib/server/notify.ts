/** Team notifications. A no-op unless DISCORD_WEBHOOK_URL is configured as a secret. */
export async function notifyTeam(env: Env, title: string, lines: Record<string, string | undefined>): Promise<void> {
  if (!env.DISCORD_WEBHOOK_URL) return;
  const fields = Object.entries(lines)
    .filter(([, v]) => v)
    .map(([name, value]) => ({ name, value: String(value).slice(0, 1000), inline: false }));
  try {
    await fetch(env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        username: "dewee.sh",
        embeds: [{ title: `${env.ENVIRONMENT === "production" ? "" : `[${env.ENVIRONMENT}] `}${title}`.slice(0, 250), color: 0x5446e8, fields, timestamp: new Date().toISOString() }],
        allowed_mentions: { parse: [] },
      }),
    });
  } catch (err) {
    console.warn("notifyTeam failed", err instanceof Error ? err.message : err);
  }
}

export const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;
