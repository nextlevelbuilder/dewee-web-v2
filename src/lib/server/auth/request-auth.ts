/**
 * Who is calling? Resolves an admin session (cookie, or Cloudflare Access on first contact) for
 * /admin, and a Principal (API key or session) for the REST API and MCP. Scopes are checked here.
 */
import type { AstroCookies } from "astro";
import { forbidden, unauthorized } from "../api/api-errors";
import { platformEnv } from "../api/platform-env";
import { isSuperAdmin, normalizeEmail } from "./allowlist";
import { API_SCOPES, bearerToken, type ApiScope } from "./api-key-format";
import { verifyApiKey } from "./api-key-store";
import { audit } from "./audit-log";
import { verifyAccessJwt } from "./cf-access";
import { createSession, csrfValid, getSession, purgeExpiredSessions, SESSION_COOKIE, setSessionCookie, type AdminSession } from "./session-store";

export type Principal = {
  kind: "api_key" | "session";
  email: string;
  scopes: ApiScope[];
  /** Human-readable actor for audit rows and revisions. */
  actor: string;
  keyId?: string;
};

type Ctx = { request: Request; cookies: AstroCookies; locals: App.Locals; clientAddress?: string };

export function cfAccessConfigured(): boolean {
  const env = platformEnv();
  return Boolean(env.CF_ACCESS_TEAM_DOMAIN && env.CF_ACCESS_AUD);
}

/** The signed-in super admin, or null. Creates a session from a valid Cloudflare Access assertion. */
export async function adminSession(ctx: Ctx): Promise<AdminSession | null> {
  const env = platformEnv();
  const existing = await getSession(env.DB, ctx.cookies.get(SESSION_COOKIE)?.value);
  if (existing) return existing;

  const assertion = ctx.request.headers.get("cf-access-jwt-assertion");
  if (!assertion || !env.CF_ACCESS_TEAM_DOMAIN || !env.CF_ACCESS_AUD) return null;
  const email = normalizeEmail(await verifyAccessJwt(assertion, { teamDomain: env.CF_ACCESS_TEAM_DOMAIN, aud: env.CF_ACCESS_AUD }));
  if (!email || !isSuperAdmin(email)) return null;
  await purgeExpiredSessions(env.DB);
  const { token, expiresAt } = await createSession(env.DB, email, "cf-access");
  setSessionCookie(ctx.cookies, token, expiresAt);
  await audit(env.DB, email, "auth.sign_in", null, { method: "cf-access", ip: ctx.clientAddress ?? null });
  return getSession(env.DB, token);
}

function waitUntilFrom(locals: App.Locals): ((p: Promise<unknown>) => void) | undefined {
  const ctx = locals.cfContext;
  return ctx ? (p) => ctx.waitUntil(p) : undefined;
}

/**
 * API/MCP caller. Bearer API keys carry their own scopes. An admin session (the admin UI and
 * WebMCP editor tools) has every scope, but its writes must pass the Origin + CSRF check.
 */
export async function authenticate(ctx: Ctx, opts: { allowSession?: boolean } = {}): Promise<Principal> {
  const env = platformEnv();
  const token = bearerToken(ctx.request.headers.get("authorization"));
  if (token) {
    const key = await verifyApiKey(env.DB, token, waitUntilFrom(ctx.locals));
    if (!key) throw unauthorized("The API key is invalid, expired or revoked.");
    return { kind: "api_key", email: key.ownerEmail, scopes: key.scopes, actor: `${key.ownerEmail} (key ${key.prefix})`, keyId: key.id };
  }
  if (opts.allowSession !== false) {
    const session = await adminSession(ctx);
    if (session) {
      const safe = ctx.request.method === "GET" || ctx.request.method === "HEAD";
      if (!safe && !(await csrfValid(ctx.request, session.token, ctx.request.headers.get("x-csrf-token")))) {
        throw forbidden("Missing or invalid CSRF token for a session-authenticated write.");
      }
      return { kind: "session", email: session.email, scopes: [...API_SCOPES], actor: session.email };
    }
  }
  throw unauthorized();
}

export function requireScope(principal: Principal, scope: ApiScope): void {
  if (!principal.scopes.includes(scope)) throw forbidden(`This API key lacks the "${scope}" scope.`);
}
