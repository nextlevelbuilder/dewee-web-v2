/**
 * OAuth 2.1 authorization server for the remote MCP server: dynamic client registration
 * (RFC 7591, public clients only), authorization codes with mandatory PKCE S256, and rotating
 * refresh tokens. Only super admins can approve, and a grant dies when its owner leaves the
 * allowlist. Codes and tokens are stored as SHA-256 hashes, never in clear.
 */
import { isSuperAdmin } from "./allowlist";
import { API_SCOPES, parseScopes, type ApiScope } from "./api-key-format";
import { randomAlphanumeric, sha256Hex } from "./crypto-helpers";

export const CODE_TTL_S = 10 * 60;
export const ACCESS_TTL_S = 60 * 60;
export const REFRESH_TTL_S = 30 * 24 * 60 * 60;
const MAX_REDIRECT_URIS = 10;

export type OAuthClient = { id: string; name: string; redirectUris: string[] };
export type OAuthPrincipal = { email: string; scopes: ApiScope[]; clientId: string };
export type TokenResponse = { access_token: string; token_type: "Bearer"; expires_in: number; refresh_token: string; scope: string };

/** Error carrying an RFC 6749 error code, rendered as `{ error, error_description }`. */
export class OAuthError extends Error {
  constructor(public code: string, message: string, public status = 400) {
    super(message);
  }
}

const hashToken = (token: string) => sha256Hex(`dewee-oauth:${token}`);
const ACCESS_RE = /^dwo_[A-Za-z0-9]{40}$/;

export function isOAuthAccessToken(token: string): boolean {
  return ACCESS_RE.test(token);
}

/** https anywhere; plain http only on loopback (native/desktop clients). No fragments. */
export function validRedirectUri(raw: unknown): raw is string {
  if (typeof raw !== "string" || raw.length > 2000) return false;
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return false;
  }
  if (u.hash) return false;
  if (u.protocol === "https:") return true;
  return u.protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(u.hostname);
}

export async function registerClient(db: D1Database, body: unknown): Promise<OAuthClient & { body: Record<string, unknown> }> {
  const input = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const uris = input.redirect_uris;
  if (!Array.isArray(uris) || uris.length === 0 || uris.length > MAX_REDIRECT_URIS || !uris.every(validRedirectUri)) {
    throw new OAuthError("invalid_redirect_uri", "redirect_uris must list 1-10 https (or loopback http) URIs.");
  }
  const method = input.token_endpoint_auth_method ?? "none";
  if (method !== "none") throw new OAuthError("invalid_client_metadata", "Only public clients (token_endpoint_auth_method \"none\") are supported.");
  const grants = Array.isArray(input.grant_types) ? input.grant_types : ["authorization_code"];
  if (!grants.every((g) => g === "authorization_code" || g === "refresh_token")) {
    throw new OAuthError("invalid_client_metadata", "Only the authorization_code and refresh_token grants are supported.");
  }
  const name = typeof input.client_name === "string" && input.client_name.trim() ? input.client_name.trim().slice(0, 120) : "MCP client";
  const id = `dwc_${randomAlphanumeric(24)}`;
  const redirectUris = [...new Set(uris as string[])];
  await db.prepare("INSERT INTO oauth_clients (id, name, redirect_uris) VALUES (?, ?, ?)").bind(id, name, JSON.stringify(redirectUris)).run();
  return {
    id,
    name,
    redirectUris,
    body: {
      client_id: id,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      client_name: name,
      redirect_uris: redirectUris,
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
      token_endpoint_auth_method: "none",
      scope: API_SCOPES.join(" "),
    },
  };
}

export async function getClient(db: D1Database, id: string | null | undefined): Promise<OAuthClient | null> {
  if (!id || id.length > 64) return null;
  const row = await db.prepare("SELECT id, name, redirect_uris FROM oauth_clients WHERE id = ?").bind(id).first<{ id: string; name: string; redirect_uris: string }>();
  return row ? { id: row.id, name: row.name, redirectUris: JSON.parse(row.redirect_uris) as string[] } : null;
}

/** Requested scopes, defaulting to every scope when none are named. */
export function requestedScopes(raw: string | null | undefined): ApiScope[] {
  const scopes = parseScopes(raw ?? "");
  return scopes.length ? scopes : [...API_SCOPES];
}

export type AuthorizeRequest = { client: OAuthClient; redirectUri: string; state: string | null; codeChallenge: string; scopes: ApiScope[] };

/**
 * Validates an authorization request. Errors about the client or redirect URI must be shown to
 * the user (never redirected); the result says which kind it is.
 */
export async function parseAuthorizeRequest(
  db: D1Database,
  params: URLSearchParams,
): Promise<{ ok: true; request: AuthorizeRequest } | { ok: false; redirect: boolean; error: string; description: string; redirectUri?: string; state?: string | null }> {
  const client = await getClient(db, params.get("client_id"));
  if (!client) return { ok: false, redirect: false, error: "invalid_client", description: "Unknown client_id." };
  const redirectUri = params.get("redirect_uri") ?? (client.redirectUris.length === 1 ? client.redirectUris[0] : "");
  if (!client.redirectUris.includes(redirectUri)) return { ok: false, redirect: false, error: "invalid_request", description: "redirect_uri is not registered for this client." };
  const state = params.get("state");
  const fail = (error: string, description: string) => ({ ok: false as const, redirect: true, error, description, redirectUri, state });
  if (params.get("response_type") !== "code") return fail("unsupported_response_type", "Only response_type=code is supported.");
  const codeChallenge = params.get("code_challenge") ?? "";
  if (params.get("code_challenge_method") !== "S256" || !/^[A-Za-z0-9_-]{43}$/.test(codeChallenge)) {
    return fail("invalid_request", "PKCE with code_challenge_method=S256 is required.");
  }
  return { ok: true, request: { client, redirectUri, state, codeChallenge, scopes: requestedScopes(params.get("scope")) } };
}

export function redirectWith(redirectUri: string, params: Record<string, string | null | undefined>): string {
  const u = new URL(redirectUri);
  for (const [k, v] of Object.entries(params)) if (v != null) u.searchParams.set(k, v);
  return u.toString();
}

export async function issueCode(db: D1Database, req: AuthorizeRequest, email: string): Promise<string> {
  if (!isSuperAdmin(email)) throw new OAuthError("access_denied", "Only super admins can authorize MCP clients.", 403);
  const code = randomAlphanumeric(48);
  await db
    .prepare("INSERT INTO oauth_grants (hash, kind, client_id, email, scopes, redirect_uri, code_challenge, expires_at) VALUES (?, 'code', ?, ?, ?, ?, ?, ?)")
    .bind(await hashToken(code), req.client.id, email, req.scopes.join(" "), req.redirectUri, req.codeChallenge, new Date(Date.now() + CODE_TTL_S * 1000).toISOString())
    .run();
  return code;
}

export async function pkceChallenge(verifier: string): Promise<string> {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
  let bin = "";
  for (const b of digest) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

type GrantRow = { hash: string; kind: string; client_id: string; email: string; scopes: string; redirect_uri: string | null; code_challenge: string | null; expires_at: string; used_at: string | null };

/** Marks a single-use grant consumed; false when someone else consumed it first. */
async function consume(db: D1Database, hash: string): Promise<boolean> {
  const res = await db.prepare("UPDATE oauth_grants SET used_at = ? WHERE hash = ? AND used_at IS NULL").bind(new Date().toISOString(), hash).run();
  return (res.meta.changes ?? 0) > 0;
}

async function issueTokens(db: D1Database, clientId: string, email: string, scopes: string): Promise<TokenResponse> {
  const access = `dwo_${randomAlphanumeric(40)}`;
  const refresh = `dwr_${randomAlphanumeric(48)}`;
  const now = Date.now();
  const insert = "INSERT INTO oauth_grants (hash, kind, client_id, email, scopes, expires_at) VALUES (?, ?, ?, ?, ?, ?)";
  await db.batch([
    db.prepare(insert).bind(await hashToken(access), "access", clientId, email, scopes, new Date(now + ACCESS_TTL_S * 1000).toISOString()),
    db.prepare(insert).bind(await hashToken(refresh), "refresh", clientId, email, scopes, new Date(now + REFRESH_TTL_S * 1000).toISOString()),
    db.prepare("DELETE FROM oauth_grants WHERE expires_at <= ?").bind(new Date(now).toISOString()),
  ]);
  return { access_token: access, token_type: "Bearer", expires_in: ACCESS_TTL_S, refresh_token: refresh, scope: scopes };
}

/** The token endpoint: authorization_code (with PKCE) and refresh_token (rotating). */
export async function exchangeToken(db: D1Database, form: URLSearchParams): Promise<TokenResponse> {
  const grantType = form.get("grant_type");
  const clientId = form.get("client_id");
  if (!(await getClient(db, clientId))) throw new OAuthError("invalid_client", "Unknown client_id.", 401);

  const lookup = async (token: string | null, kind: "code" | "refresh") => {
    if (!token || token.length > 200) return null;
    const row = await db.prepare("SELECT * FROM oauth_grants WHERE hash = ? AND kind = ?").bind(await hashToken(token), kind).first<GrantRow>();
    if (!row || row.client_id !== clientId || row.used_at || Date.parse(row.expires_at) <= Date.now() || !isSuperAdmin(row.email)) return null;
    return row;
  };

  if (grantType === "authorization_code") {
    const row = await lookup(form.get("code"), "code");
    if (!row) throw new OAuthError("invalid_grant", "The authorization code is invalid, expired or already used.");
    if (row.redirect_uri !== form.get("redirect_uri")) throw new OAuthError("invalid_grant", "redirect_uri does not match the authorization request.");
    const verifier = form.get("code_verifier") ?? "";
    if (!/^[A-Za-z0-9._~-]{43,128}$/.test(verifier) || (await pkceChallenge(verifier)) !== row.code_challenge) {
      throw new OAuthError("invalid_grant", "PKCE verification failed.");
    }
    if (!(await consume(db, row.hash))) throw new OAuthError("invalid_grant", "The authorization code was already used.");
    return issueTokens(db, row.client_id, row.email, row.scopes);
  }
  if (grantType === "refresh_token") {
    const row = await lookup(form.get("refresh_token"), "refresh");
    if (!row) throw new OAuthError("invalid_grant", "The refresh token is invalid, expired or already used.");
    // A narrower scope may be requested; never a wider one.
    const asked = form.get("scope");
    const scopes = asked ? parseScopes(asked).filter((s) => row.scopes.split(" ").includes(s)).join(" ") || row.scopes : row.scopes;
    if (!(await consume(db, row.hash))) throw new OAuthError("invalid_grant", "The refresh token was already used.");
    return issueTokens(db, row.client_id, row.email, scopes);
  }
  throw new OAuthError("unsupported_grant_type", "Only authorization_code and refresh_token are supported.");
}

/** Resolves an OAuth access token; null when unknown, expired or its owner left the allowlist. */
export async function verifyOAuthAccessToken(db: D1Database, token: string): Promise<OAuthPrincipal | null> {
  if (!isOAuthAccessToken(token)) return null;
  const row = await db.prepare("SELECT * FROM oauth_grants WHERE hash = ? AND kind = 'access'").bind(await hashToken(token)).first<GrantRow>();
  if (!row || Date.parse(row.expires_at) <= Date.now() || !isSuperAdmin(row.email)) return null;
  return { email: row.email, scopes: parseScopes(row.scopes), clientId: row.client_id };
}

/** Metadata documents (RFC 9728 protected resource, RFC 8414 authorization server). */
export function protectedResourceMetadata(origin: string) {
  return {
    resource: `${origin}/mcp`,
    authorization_servers: [origin],
    scopes_supported: [...API_SCOPES],
    bearer_methods_supported: ["header"],
    resource_name: "dewee.sh MCP",
  };
}

export function authorizationServerMetadata(origin: string) {
  return {
    issuer: origin,
    authorization_endpoint: `${origin}/admin/oauth/authorize`,
    token_endpoint: `${origin}/oauth/token`,
    registration_endpoint: `${origin}/oauth/register`,
    scopes_supported: [...API_SCOPES],
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    token_endpoint_auth_methods_supported: ["none"],
    code_challenge_methods_supported: ["S256"],
  };
}

export const RESOURCE_METADATA_PATH = "/.well-known/oauth-protected-resource/mcp";
