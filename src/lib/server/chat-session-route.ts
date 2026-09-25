/**
 * /api/chat/session: opens a signed chat session before the widget connects its WebSocket.
 *   GET  → { required, siteKey }   (siteKey is null when Turnstile is off)
 *   POST { sid, turnstile? } → { token, exp } after Turnstile and the per-IP session limit pass.
 * Without CHAT_SESSION_SECRET the chat runs unsigned (the pre-existing behaviour) and GET says so.
 */
import { CHAT_LIMITS, HOUR_MS } from "./chat-limits";
import { limiter } from "./chat-limiter";
import { clientIp, hashIp, signChatSession } from "./chat-session-token";
import { turnstileEnabled, verifyTurnstile } from "./chat-turnstile";

export const SID_RE = /^[a-z0-9-]{16,64}$/i;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

/** Browsers always send Origin on POST and WebSocket upgrades; a missing or foreign one is refused. */
export function sameOrigin(request: Request, url: URL): boolean {
  const origin = request.headers.get("origin");
  return Boolean(origin) && URL.parse(origin!)?.host === url.host;
}

export async function chatSessionRoute(request: Request, env: Env, url: URL): Promise<Response> {
  const secret = env.CHAT_SESSION_SECRET;
  if (request.method === "GET") {
    return json({ required: Boolean(secret), siteKey: secret && turnstileEnabled(env) ? env.TURNSTILE_SITE_KEY : null });
  }
  if (request.method !== "POST") return json({ error: "method" }, 405);
  if (!sameOrigin(request, url)) return json({ error: "origin" }, 403);
  if (!secret) return json({ token: null, exp: null });

  let body: { sid?: unknown; turnstile?: unknown };
  try {
    const raw = await request.text();
    if (raw.length > 4096) return json({ error: "too-large" }, 413);
    body = JSON.parse(raw);
  } catch {
    return json({ error: "bad-json" }, 400);
  }
  const sid = typeof body.sid === "string" ? body.sid : "";
  if (!SID_RE.test(sid)) return json({ error: "bad-sid" }, 400);

  const ip = clientIp(request);
  if (!(await verifyTurnstile(env, typeof body.turnstile === "string" ? body.turnstile : "", ip))) {
    return json({ error: "challenge" }, 403);
  }
  const ipHash = await hashIp(secret, ip);
  const quota = await limiter(env, `ip:${ipHash}`).hit("sessions", CHAT_LIMITS.ipSessionsPerHour, HOUR_MS, sid);
  if (!quota.ok) return json({ error: "rate-limited" }, 429);

  const exp = Date.now() + CHAT_LIMITS.sessionTtlMs;
  return json({ token: await signChatSession(secret, sid, ipHash, exp), exp });
}
