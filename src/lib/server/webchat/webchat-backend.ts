/**
 * Backend of the website chat widget (`dewee-webchat`), mounted at /api/dewee/*.
 *
 * It uses the CCP transport of the public webchat ingress (dewee docs/public-webchat-ingress-contract.md):
 * the browser only ever holds a short visitor token; this worker holds the integration secret and talks
 * to app.dewee.sh, which forwards to the runtime. The site never learns a runtime URL, tenant or agent id.
 * Without the integration settings the route answers 404 and the page renders no chat (fail closed).
 */
import { createDeweeHandler, type DeweeHandler } from "dewee-webchat/server";

export const WEBCHAT_PREFIX = "/api/dewee/";

/** The three CCP values plus our session secret, or null when any is missing. */
export function webchatSettings(env: Env) {
  const chatUrl = env.DEWEE_CCP_CHAT_URL?.trim();
  const integrationId = env.DEWEE_WEBCHAT_INTEGRATION_ID?.trim();
  const integrationSecret = env.DEWEE_WEBCHAT_INTEGRATION_SECRET?.trim();
  const secret = env.DEWEE_WEBCHAT_SECRET?.trim();
  if (!chatUrl || !integrationId || !integrationSecret || !secret || secret.length < 32) return null;
  return { chatUrl, integrationId, integrationSecret, secret };
}

/** Whether pages should render the widget at all. */
export const webchatEnabled = (env: Env) => webchatSettings(env) !== null;

// One handler per isolate: it keeps the CCP config cache and in-memory limits between requests.
let cached: { key: string; handler: DeweeHandler } | null = null;

export async function webchatRoute(request: Request, env: Env): Promise<Response> {
  const s = webchatSettings(env);
  if (!s) return new Response("Not found", { status: 404 });
  const key = `${s.chatUrl}|${s.integrationId}`;
  if (!cached || cached.key !== key) {
    const turnstile = env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY
      ? { siteKey: env.TURNSTILE_SITE_KEY, secretKey: env.TURNSTILE_SECRET_KEY }
      : undefined;
    cached = {
      key,
      handler: createDeweeHandler({
        transport: "ccp",
        ccp: { chatUrl: s.chatUrl, integrationId: s.integrationId, integrationSecret: s.integrationSecret },
        secret: s.secret,
        turnstile,
      }),
    };
  }
  return cached.handler(request);
}
