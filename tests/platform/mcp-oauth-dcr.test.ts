/**
 * OAuth for the remote MCP server: the full Claude-style chain (register, authorize with PKCE,
 * token, refresh) against the real migration schema, plus the refusals that keep it safe.
 */
import { describe, expect, it } from "vitest";
import { sqliteD1 } from "../helpers/sqlite-d1";
import {
  authorizationServerMetadata,
  exchangeToken,
  issueCode,
  OAuthError,
  parseAuthorizeRequest,
  pkceChallenge,
  protectedResourceMetadata,
  registerClient,
  validRedirectUri,
  verifyOAuthAccessToken,
} from "~/lib/server/auth/oauth-store";

const ADMIN = "hi@nextlevelbuilder.io";
const CALLBACK = "https://claude.ai/api/mcp/auth_callback";
const VERIFIER = "a".repeat(20) + "B".repeat(20) + "-._~1234";

const claudeRegistration = {
  client_name: "Claude",
  redirect_uris: [CALLBACK],
  grant_types: ["authorization_code", "refresh_token"],
  response_types: ["code"],
  token_endpoint_auth_method: "none",
};

async function authorize(db: D1Database, clientId: string, extra: Record<string, string> = {}) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: CALLBACK,
    code_challenge: await pkceChallenge(VERIFIER),
    code_challenge_method: "S256",
    state: "xyz",
    ...extra,
  });
  return parseAuthorizeRequest(db, params);
}

async function rejects(p: Promise<unknown>, code: string) {
  await expect(p).rejects.toSatisfy((e: unknown) => e instanceof OAuthError && e.code === code);
}

describe("MCP OAuth", () => {
  it("publishes discovery metadata that points at the register, authorize and token endpoints", () => {
    const pr = protectedResourceMetadata("https://dewee.sh");
    expect(pr.resource).toBe("https://dewee.sh/mcp");
    expect(pr.authorization_servers).toEqual(["https://dewee.sh"]);
    const as = authorizationServerMetadata("https://dewee.sh");
    expect(as.registration_endpoint).toBe("https://dewee.sh/oauth/register");
    expect(as.token_endpoint).toBe("https://dewee.sh/oauth/token");
    expect(as.authorization_endpoint).toBe("https://dewee.sh/admin/oauth/authorize");
    expect(as.code_challenge_methods_supported).toEqual(["S256"]);
  });

  it("runs the Claude chain: register, authorize, code exchange, MCP token, refresh rotation", async () => {
    const { d1 } = sqliteD1();
    const client = await registerClient(d1, claudeRegistration);
    expect(client.body.client_id).toMatch(/^dwc_/);
    expect(client.body.token_endpoint_auth_method).toBe("none");

    const parsed = await authorize(d1, client.id);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const code = await issueCode(d1, parsed.request, ADMIN);

    const tokens = await exchangeToken(d1, new URLSearchParams({ grant_type: "authorization_code", client_id: client.id, code, redirect_uri: CALLBACK, code_verifier: VERIFIER }));
    expect(tokens.token_type).toBe("Bearer");
    const principal = await verifyOAuthAccessToken(d1, tokens.access_token);
    expect(principal?.email).toBe(ADMIN);
    expect(principal?.scopes).toContain("posts:write");

    // Codes are single use.
    await rejects(exchangeToken(d1, new URLSearchParams({ grant_type: "authorization_code", client_id: client.id, code, redirect_uri: CALLBACK, code_verifier: VERIFIER })), "invalid_grant");

    const refreshed = await exchangeToken(d1, new URLSearchParams({ grant_type: "refresh_token", client_id: client.id, refresh_token: tokens.refresh_token }));
    expect(await verifyOAuthAccessToken(d1, refreshed.access_token)).not.toBeNull();
    // The old refresh token is rotated out.
    await rejects(exchangeToken(d1, new URLSearchParams({ grant_type: "refresh_token", client_id: client.id, refresh_token: tokens.refresh_token })), "invalid_grant");
  });

  it("refuses a wrong PKCE verifier, a foreign redirect URI and a missing challenge", async () => {
    const { d1 } = sqliteD1();
    const client = await registerClient(d1, claudeRegistration);
    const parsed = await authorize(d1, client.id);
    if (!parsed.ok) throw new Error("authorize failed");
    const code = await issueCode(d1, parsed.request, ADMIN);
    await rejects(exchangeToken(d1, new URLSearchParams({ grant_type: "authorization_code", client_id: client.id, code, redirect_uri: CALLBACK, code_verifier: "z".repeat(43) })), "invalid_grant");

    const foreign = await authorize(d1, client.id, { redirect_uri: "https://evil.example/cb" });
    expect(foreign).toMatchObject({ ok: false, redirect: false });
    const noPkce = await authorize(d1, client.id, { code_challenge_method: "plain" });
    expect(noPkce).toMatchObject({ ok: false, redirect: true, error: "invalid_request" });
  });

  it("only lets super admins approve", async () => {
    const { d1 } = sqliteD1();
    const client = await registerClient(d1, claudeRegistration);
    const parsed = await authorize(d1, client.id);
    if (!parsed.ok) throw new Error("authorize failed");
    await rejects(issueCode(d1, parsed.request, "someone@example.com"), "access_denied");
  });

  it("validates registrations", async () => {
    const { d1 } = sqliteD1();
    await rejects(registerClient(d1, { redirect_uris: ["http://example.com/cb"] }), "invalid_redirect_uri");
    await rejects(registerClient(d1, { ...claudeRegistration, token_endpoint_auth_method: "client_secret_basic" }), "invalid_client_metadata");
    expect(validRedirectUri("http://127.0.0.1:33418/callback")).toBe(true);
    expect(validRedirectUri("https://claude.ai/cb#frag")).toBe(false);
  });
});
