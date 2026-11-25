/** RFC 7591 dynamic client registration for MCP clients (public clients with PKCE only). */
import type { APIRoute } from "astro";
import { platformEnv } from "~/lib/server/api/platform-env";
import { oauthError, oauthJson, preflight } from "~/lib/server/auth/oauth-http";
import { OAuthError, registerClient } from "~/lib/server/auth/oauth-store";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const text = await request.text();
    if (text.length > 16_000) throw new OAuthError("invalid_client_metadata", "The registration request is too large.");
    let body: unknown;
    try {
      body = JSON.parse(text);
    } catch {
      throw new OAuthError("invalid_client_metadata", "The body must be JSON.");
    }
    const client = await registerClient(platformEnv().DB, body);
    return oauthJson(client.body, 201);
  } catch (err) {
    return oauthError(err);
  }
};
export const OPTIONS: APIRoute = preflight;
