/**
 * Cloudflare Turnstile check before a chat session opens. When TURNSTILE_SECRET_KEY is not set
 * (local dev, or before the widget exists) the check is skipped and the other limits still apply.
 */

const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function turnstileEnabled(env: Env): boolean {
  return Boolean(env.TURNSTILE_SECRET_KEY && env.TURNSTILE_SITE_KEY);
}

/** Verifies a Turnstile response token. Network or parse failures count as a failed check. */
export async function verifyTurnstile(env: Env, token: string, ip: string, fetcher: typeof fetch = fetch): Promise<boolean> {
  if (!turnstileEnabled(env)) return true;
  if (!token || token.length > 2048) return false;
  const form = new FormData();
  form.append("secret", env.TURNSTILE_SECRET_KEY!);
  form.append("response", token);
  if (ip !== "unknown") form.append("remoteip", ip);
  try {
    const res = await fetcher(SITEVERIFY, { method: "POST", body: form, signal: AbortSignal.timeout(5000) });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean; action?: string };
    return data.success === true && (!data.action || data.action === "chat");
  } catch (err) {
    console.warn("turnstile verify failed", err instanceof Error ? err.message : err);
    return false;
  }
}
