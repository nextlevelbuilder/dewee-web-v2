/**
 * OAuth sign-in for the content MCP (pure parts). The site is its own authorization server and
 * `<origin>/mcp` is its only protected resource. API keys (`dwk_…`) keep working; OAuth is a
 * second way in for clients such as ChatGPT that connect by signing in instead of pasting a key.
 */
import { API_SCOPES, isApiScope, type ApiScope } from "../auth/api-key-format";

/** Every scope a signed-in admin may grant to an OAuth client: the API-key scopes, nothing more. */
export const OAUTH_SCOPES: readonly ApiScope[] = API_SCOPES;

/**
 * What any MCP access needs, advertised as the resource's `scopes_supported` and in the 401
 * challenge, so a client asks for read access first. Writes are opted into on the consent page.
 */
export const OAUTH_BASELINE_SCOPES: readonly ApiScope[] = ["pages:read", "posts:read", "docs:read"];

/** Paths of the authorization server on the site's origin. */
export const OAUTH_PATHS = {
  authorize: "/oauth/authorize",
  token: "/oauth/token",
  asMetadata: "/.well-known/oauth-authorization-server",
  resourceMetadata: "/.well-known/oauth-protected-resource/mcp",
  resourceMetadataRoot: "/.well-known/oauth-protected-resource",
} as const;

/** Access tokens live an hour; a grant (its refresh token) lasts 30 days from sign-in, then the app signs in again. */
export const ACCESS_TOKEN_TTL_SECONDS = 3600;
export const REFRESH_TOKEN_TTL_SECONDS = 30 * 86_400;

const LOOPBACK = /^(localhost|127(?:\.\d{1,3}){3}|\[::1\])$/;

type IssuerEnv = { SITE_URL: string; ENVIRONMENT: string };

/**
 * The issuer is the deployment's canonical origin (SITE_URL), never the Host header, so a request
 * on another hostname cannot mint tokens for it. `wrangler dev` on a loopback host is the one
 * exception, so the flow can be tried locally.
 */
export function oauthIssuer(env: IssuerEnv, requestUrl?: URL): string | null {
  if (env.ENVIRONMENT === "development" && requestUrl && LOOPBACK.test(requestUrl.hostname)) return requestUrl.origin;
  const site = URL.parse(env.SITE_URL);
  if (!site || site.protocol !== "https:") return null;
  return site.origin;
}

/** The canonical resource (and token audience) of the content MCP: `<issuer>/mcp`. */
export const mcpResource = (issuer: string): string => `${issuer}/mcp`;

/** RFC 9728 protected resource metadata for `<issuer>/mcp`. */
export function protectedResourceMetadata(issuer: string) {
  return {
    resource: mcpResource(issuer),
    authorization_servers: [issuer],
    scopes_supported: [...OAUTH_BASELINE_SCOPES],
    bearer_methods_supported: ["header"],
    resource_name: "dewee.sh content MCP",
    resource_documentation: `${issuer}/developers`,
  };
}

/**
 * The `WWW-Authenticate` value for a 401 on /mcp: where to discover the authorization server and
 * which scopes to ask for (RFC 6750 + RFC 9728). `invalid` marks a token that was presented and refused.
 */
export function mcpChallenge(issuer: string | null, opts: { invalid?: boolean } = {}): string {
  if (!issuer) return 'Bearer realm="dewee.sh"';
  const parts = ['Bearer realm="dewee.sh"'];
  if (opts.invalid) parts.push('error="invalid_token"');
  parts.push(`resource_metadata="${issuer}${OAUTH_PATHS.resourceMetadata}"`, `scope="${OAUTH_BASELINE_SCOPES.join(" ")}"`);
  return parts.join(", ");
}

/** A `dwk_…` bearer is an API key; anything else on /mcp is treated as an OAuth access token. */
export const looksLikeApiKey = (token: string): boolean => token.startsWith("dwk_");

/**
 * Which boxes the consent page pre-ticks. Requested read scopes are ticked; write scopes and
 * `leads:read` (personal data) always start unticked, so a browser session alone never hands a
 * third-party app write access. Unknown scopes are dropped.
 */
export function consentDefaults(requested: readonly string[]): { scope: ApiScope; requested: boolean; checked: boolean }[] {
  const wanted = new Set(requested.filter(isApiScope));
  return OAUTH_SCOPES.map((scope) => {
    const isRequested = wanted.has(scope);
    const sensitive = scope.endsWith(":write") || scope === "leads:read";
    return { scope, requested: isRequested, checked: isRequested && !sensitive };
  });
}

/** Keeps only scopes the site can grant, in canonical order, without duplicates. */
export function grantableScopes(input: readonly unknown[]): ApiScope[] {
  const wanted = new Set(input.filter(isApiScope));
  return OAUTH_SCOPES.filter((s) => wanted.has(s));
}

/** OAuth user ids may not contain ":", so the admin email is stored encoded. */
export const oauthUserId = (email: string): string => encodeURIComponent(email);
export const emailFromUserId = (userId: string): string => {
  try {
    return decodeURIComponent(userId);
  } catch {
    return "";
  }
};
