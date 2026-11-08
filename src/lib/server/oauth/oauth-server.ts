/**
 * The site's OAuth authorization server for the content MCP, built on Cloudflare's
 * `@cloudflare/workers-oauth-provider` (PKCE S256, refresh rotation, revocation, RFC 8414/9207,
 * Client ID Metadata Documents). Grants and tokens use the authority's storage adapter, hashed, with
 * props encrypted. Dynamic client registration is deliberately off: a client identifies itself
 * with an HTTPS Client ID Metadata Document (ChatGPT does) so no stranger can register a client.
 * Without the authority every OAuth route answers "not configured" and only API keys work.
 */
import { OAuthAuthorizationServer, type GrantSummary, type OAuthHelpers } from "@cloudflare/workers-oauth-provider";
import { isSuperAdmin, normalizeEmail } from "../auth/allowlist";
import type { ApiScope } from "../auth/api-key-format";
import { rateLimit } from "../auth/rate-limit";
import {
  ACCESS_TOKEN_TTL_SECONDS,
  emailFromUserId,
  grantableScopes,
  mcpResource,
  OAUTH_PATHS,
  OAUTH_SCOPES,
  oauthIssuer,
  oauthUserId,
  protectedResourceMetadata,
  REFRESH_TOKEN_TTL_SECONDS,
} from "./oauth-config";

/** What a grant carries into every MCP call (encrypted at rest by the library). */
export type OAuthProps = { email: string };
/** Shown on the connections page; stored unencrypted by the library, so no secrets here. */
export type GrantMetadata = { clientName?: string; clientDomain?: string | null; redirectHost?: string };

export type OAuthEnv = Pick<Env, "SITE_URL" | "ENVIRONMENT" | "KV"> & { OAUTH_KV?: KVNamespace };

/** Token endpoint requests per IP per minute; a brake on code and refresh-token guessing. */
const TOKEN_RATE_LIMIT = 60;

const servers = new Map<string, OAuthAuthorizationServer<OAuthEnv>>();

function serverFor(issuer: string): OAuthAuthorizationServer<OAuthEnv> {
  let server = servers.get(issuer);
  if (!server) {
    server = new OAuthAuthorizationServer<OAuthEnv>({
      issuer,
      resources: [mcpResource(issuer)],
      authorizeEndpoint: `${issuer}${OAUTH_PATHS.authorize}`,
      tokenEndpoint: `${issuer}${OAUTH_PATHS.token}`,
      scopesSupported: [...OAUTH_SCOPES],
      clientIdMetadataDocumentEnabled: true,
      accessTokenTTL: ACCESS_TOKEN_TTL_SECONDS,
      refreshTokenTTL: REFRESH_TOKEN_TTL_SECONDS,
      // Never log the request or token; the code and internal reason are enough to debug.
      onError: ({ code, status, internal }) => {
        console.warn("oauth:", status, code, internal?.reason ?? "");
      },
    });
    servers.set(issuer, server);
  }
  return server;
}

/** The issuer for this deployment, or null when OAuth is not configured (no OAUTH_KV, bad SITE_URL). */
export function oauthIssuerFor(env: OAuthEnv, url?: URL): string | null {
  if (!env.OAUTH_KV) return null;
  return oauthIssuer(env, url);
}

/** Helpers for the consent and connections pages; null when OAuth is not configured. */
export function oauthApi(env: OAuthEnv, url?: URL): OAuthHelpers | null {
  const issuer = oauthIssuerFor(env, url);
  return issuer ? serverFor(issuer).getOAuthApi(env) : null;
}

export type OAuthPrincipalData = { email: string; scopes: ApiScope[]; clientId: string };

/**
 * Verifies an OAuth access token for `<issuer>/mcp`. The library looks the opaque token up by its
 * hash and checks audience (resource), expiry and revocation. On top of that the grant's admin
 * must still be on the allowlist, and only known scopes survive.
 */
export async function validateMcpAccessToken(env: OAuthEnv, url: URL, token: string): Promise<OAuthPrincipalData | null> {
  const issuer = oauthIssuerFor(env, url);
  if (!issuer) return null;
  const result = await serverFor(issuer).validateToken<OAuthProps>(mcpResource(issuer), token, env);
  if (!result || result.audience !== mcpResource(issuer)) return null;
  const email = normalizeEmail(result.props?.email);
  if (!email || !isSuperAdmin(email) || emailFromUserId(result.userId) !== email) return null;
  return { email, scopes: grantableScopes(result.scope), clientId: result.clientId };
}

const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": status === 200 ? "public, max-age=300" : "no-store", ...extra },
  });

const notConfigured = (status: number) =>
  json({ error: "temporarily_unavailable", error_description: "OAuth sign-in is not configured on this deployment. Use an API key (Authorization: Bearer dwk_…) instead." }, status);

/**
 * Discovery documents and the token endpoint, answered before Astro. Returns null for any other
 * path. The authorize page itself is an Astro page (src/pages/oauth/authorize.astro).
 */
export async function handleOAuthRoute(request: Request, env: OAuthEnv, ctx: ExecutionContext, options: { skipTokenRateLimit?: boolean } = {}): Promise<Response | null> {
  const url = new URL(request.url);
  const path = url.pathname;
  const isResourceMetadata = path === OAUTH_PATHS.resourceMetadata || path === OAUTH_PATHS.resourceMetadataRoot;
  const isAsMetadata = path === OAUTH_PATHS.asMetadata || path.startsWith(`${OAUTH_PATHS.asMetadata}/`);
  if (!isResourceMetadata && !isAsMetadata && path !== OAUTH_PATHS.token) return null;

  const issuer = oauthIssuerFor(env, url);
  if (!issuer) return path === OAUTH_PATHS.token ? notConfigured(503) : notConfigured(404);
  // Only the canonical host serves OAuth, so tokens are never minted for a stray hostname.
  if (url.origin !== issuer) return json({ error: "invalid_request", error_description: `OAuth is served at ${issuer}.` }, 404);

  if (isResourceMetadata) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders() });
    if (request.method !== "GET" && request.method !== "HEAD") return json({ error: "invalid_request" }, 405, { allow: "GET" });
    return json(protectedResourceMetadata(issuer), 200, corsHeaders());
  }

  if (path === OAUTH_PATHS.token && request.method === "POST" && !options.skipTokenRateLimit) {
    const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
    const { ok } = await rateLimit(env.KV, `oauth-token-ip:${ip}`, TOKEN_RATE_LIMIT, 60);
    if (!ok) return json({ error: "slow_down", error_description: "Too many token requests. Try again in a minute." }, 429, { "retry-after": "60" });
  }
  return serverFor(issuer).fetch(request, env, ctx);
}

function corsHeaders(): Record<string, string> {
  return { "access-control-allow-origin": "*", "access-control-allow-methods": "GET, HEAD, OPTIONS", "access-control-allow-headers": "mcp-protocol-version" };
}

export type ConnectedApp = GrantSummary & { email: string; meta: GrantMetadata };

/** Every OAuth grant held by the given admins, newest first. */
export async function listConnectedApps(api: OAuthHelpers, emails: readonly string[]): Promise<ConnectedApp[]> {
  const out: ConnectedApp[] = [];
  for (const email of emails) {
    let cursor: string | undefined;
    do {
      const page = await api.listUserGrants(oauthUserId(email), { limit: 100, cursor });
      for (const grant of page.items) out.push({ ...grant, email, meta: (grant.metadata ?? {}) as GrantMetadata });
      cursor = page.cursor;
    } while (cursor);
  }
  return out.sort((a, b) => b.createdAt - a.createdAt);
}

/** Hourly cron: sweep expired and orphaned OAuth records; KV TTLs already remove most of them. */
export async function purgeOAuth(env: OAuthEnv): Promise<void> {
  const api = oauthApi(env);
  if (!api) return;
  await api.purgeExpiredData();
}
