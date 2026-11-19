/**
 * HTTP helpers for the OAuth endpoints: CORS for browser-based MCP clients (metadata, register
 * and token are public, credential-free endpoints) and RFC 6749 JSON error bodies.
 */
import { OAuthError } from "./oauth-store";

export const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET, POST, OPTIONS",
  "access-control-allow-headers": "content-type, authorization, mcp-protocol-version",
  "access-control-max-age": "86400",
};

export function oauthJson(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...CORS_HEADERS },
  });
}

export function oauthError(err: unknown): Response {
  if (err instanceof OAuthError) return oauthJson({ error: err.code, error_description: err.message }, err.status);
  console.error("oauth: unhandled error", err instanceof Error ? err.stack || err.message : err);
  return oauthJson({ error: "server_error", error_description: "Something went wrong on our side." }, 500);
}

export const preflight = () => new Response(null, { status: 204, headers: CORS_HEADERS });
