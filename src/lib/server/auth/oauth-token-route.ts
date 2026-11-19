/**
 * POST /oauth/token, answered at the edge before Astro: the token request is a form-encoded,
 * server-to-server POST with no Origin header, which Astro's cross-site form check would refuse.
 * It needs no CSRF protection: it carries no cookie and every grant is bound to PKCE or a
 * single-use refresh token.
 */
import { oauthError, oauthJson, preflight } from "./oauth-http";
import { exchangeToken, OAuthError } from "./oauth-store";

export const OAUTH_TOKEN_PATH = "/oauth/token";

export async function handleOAuthToken(request: Request, db: D1Database): Promise<Response> {
  if (request.method === "OPTIONS") return preflight();
  if (request.method !== "POST") return oauthJson({ error: "invalid_request", error_description: "Use POST." }, 405);
  try {
    const text = await request.text();
    if (text.length > 8_000) throw new OAuthError("invalid_request", "The token request is too large.");
    const form = (request.headers.get("content-type") ?? "").includes("application/json")
      ? new URLSearchParams(Object.entries(JSON.parse(text) as Record<string, string>))
      : new URLSearchParams(text);
    return oauthJson(await exchangeToken(db, form));
  } catch (err) {
    return oauthError(err instanceof SyntaxError ? new OAuthError("invalid_request", "The body is not valid JSON.") : err);
  }
}
