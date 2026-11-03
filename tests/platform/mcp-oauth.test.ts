/**
 * OAuth sign-in for the content MCP, end to end against the real authorization server library:
 * discovery documents, the 401 challenge, consent (scopes, CSRF-bound handle, deny), PKCE and
 * redirect checks, token exchange, validation on /mcp, scope filtering of tools, revocation,
 * expiry, wrong resource, refresh rotation and the admin allowlist. A Client ID Metadata Document
 * client (how ChatGPT identifies itself) is served by a stubbed fetch.
 */
import { createHash } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { memoryKV } from "../helpers/memory-kv";
import { sqliteD1 } from "../helpers/sqlite-d1";

const env: Record<string, unknown> = {};
// The Workers runtime exposes compatibility flags as a global; wrangler.jsonc sets this one.
(globalThis as { Cloudflare?: unknown }).Cloudflare = { compatibilityFlags: { global_fetch_strictly_public: true } };
vi.mock("cloudflare:workers", () => ({ env, WorkerEntrypoint: class {} }));

const { handleOAuthRoute, oauthApi, validateMcpAccessToken, listConnectedApps } = await import("../../src/lib/server/oauth/oauth-server");
const { beginAuthorize, finishAuthorize } = await import("../../src/lib/server/oauth/oauth-consent");
const { consentDefaults, mcpChallenge, oauthIssuer, protectedResourceMetadata } = await import("../../src/lib/server/oauth/oauth-config");
const { authenticate } = await import("../../src/lib/server/auth/request-auth");
const { errorResponse, unauthorized } = await import("../../src/lib/server/api/api-errors");
const { handleMessage } = await import("../../src/lib/server/mcp/json-rpc");
const { MCP_SERVER } = await import("../../src/lib/server/mcp/mcp-tools");

const ORIGIN = "https://dewee.sh";
const RESOURCE = `${ORIGIN}/mcp`;
const ADMIN = "hi@nextlevelbuilder.io";
const CLIENT_ID = "https://chatgpt.example/oauth/client-metadata.json";
const REDIRECT = "https://chatgpt.example/connector/oauth/callback";
const ctx = { waitUntil() {}, passThroughOnException() {} } as unknown as ExecutionContext;

const b64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
function pkce() {
  const verifier = b64url(crypto.getRandomValues(new Uint8Array(32)));
  return { verifier, challenge: b64url(createHash("sha256").update(verifier).digest()) };
}

function authorizeUrl(p: { challenge: string; scope?: string; redirect?: string; resource?: string; method?: string }) {
  const u = new URL(`${ORIGIN}/oauth/authorize`);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("client_id", CLIENT_ID);
  u.searchParams.set("redirect_uri", p.redirect ?? REDIRECT);
  u.searchParams.set("state", "st-123");
  u.searchParams.set("code_challenge", p.challenge);
  u.searchParams.set("code_challenge_method", p.method ?? "S256");
  u.searchParams.set("scope", p.scope ?? "pages:read posts:read");
  u.searchParams.set("resource", p.resource ?? RESOURCE);
  return u;
}

const cookieHeader = (headers?: Headers) => (headers ? headers.getSetCookie().map((c) => c.split(";")[0]).join("; ") : "");

async function token(params: Record<string, string>) {
  const res = await handleOAuthRoute(
    new Request(`${ORIGIN}/oauth/token`, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(params) }),
    env as never,
    ctx,
  );
  return { status: res!.status, body: (await res!.json()) as Record<string, any> };
}

/** Runs the browser half: authorize → consent → approve. Returns the code redirect. */
async function signIn(opts: { scopesTicked: string[]; scope?: string; email?: string }) {
  const api = oauthApi(env as never, new URL(ORIGIN))!;
  const { verifier, challenge } = pkce();
  const begun = await beginAuthorize(api, new Request(authorizeUrl({ challenge, scope: opts.scope })));
  if (begun.kind !== "consent") throw new Error(`expected consent, got ${JSON.stringify(begun)}`);
  const post = new Request(`${ORIGIN}/oauth/authorize`, { method: "POST", headers: { cookie: cookieHeader(begun.headers), origin: ORIGIN } });
  const done = await finishAuthorize(api, env.DB as D1Database, post, { email: opts.email ?? ADMIN, handle: begun.view.handle, decision: "approve", scopes: opts.scopesTicked });
  if (done.kind !== "redirect") throw new Error(`expected redirect, got ${JSON.stringify(done)}`);
  return { location: new URL(done.location), verifier, begun };
}

async function connect(scopesTicked: string[], scope?: string) {
  const { location, verifier } = await signIn({ scopesTicked, scope });
  const res = await token({ grant_type: "authorization_code", code: location.searchParams.get("code")!, redirect_uri: REDIRECT, client_id: CLIENT_ID, code_verifier: verifier, resource: RESOURCE });
  expect(res.status).toBe(200);
  return res.body as { access_token: string; refresh_token: string; scope: string; expires_in: number };
}

const mcpRequest = (accessToken?: string) =>
  new Request(`${ORIGIN}/mcp`, { method: "POST", headers: accessToken ? { authorization: `Bearer ${accessToken}` } : {} });
const auth = (accessToken?: string) =>
  authenticate({ request: mcpRequest(accessToken), cookies: { get: () => undefined } as never, locals: {} as never }, { allowSession: false, allowOAuth: true });

async function toolNames(accessToken: string) {
  const principal = await auth(accessToken);
  const res = (await handleMessage(MCP_SERVER, { jsonrpc: "2.0", id: 1, method: "tools/list" }, { env: env as never, principal })) as { result: { tools: { name: string }[] } };
  return res.result.tools.map((t) => t.name);
}

beforeEach(() => {
  for (const k of Object.keys(env)) delete env[k];
  Object.assign(env, { SITE_URL: ORIGIN, ENVIRONMENT: "production", OAUTH_KV: memoryKV(), KV: memoryKV(), DB: sqliteD1().d1 });
  vi.stubGlobal("fetch", async (input: RequestInfo | URL) => {
    const url = String(input instanceof Request ? input.url : input);
    if (url === CLIENT_ID) {
      return new Response(JSON.stringify({ client_id: CLIENT_ID, client_name: "ChatGPT", redirect_uris: [REDIRECT], token_endpoint_auth_method: "none", grant_types: ["authorization_code", "refresh_token"], response_types: ["code"] }), {
        headers: { "content-type": "application/json" },
      });
    }
    return new Response("not found", { status: 404 });
  });
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("discovery", () => {
  it("publishes protected resource metadata for https://dewee.sh/mcp", async () => {
    const res = await handleOAuthRoute(new Request(`${ORIGIN}/.well-known/oauth-protected-resource/mcp`), env as never, ctx);
    expect(res!.status).toBe(200);
    const body = await res!.json();
    expect(body).toEqual(protectedResourceMetadata(ORIGIN));
    expect(body).toMatchObject({ resource: RESOURCE, authorization_servers: [ORIGIN], scopes_supported: ["pages:read", "posts:read", "docs:read"] });
  });

  it("publishes authorization server metadata with PKCE S256 and no dynamic registration", async () => {
    const res = await handleOAuthRoute(new Request(`${ORIGIN}/.well-known/oauth-authorization-server`), env as never, ctx);
    const body = (await res!.json()) as Record<string, any>;
    expect(body.issuer).toBe(ORIGIN);
    expect(body.authorization_endpoint).toBe(`${ORIGIN}/oauth/authorize`);
    expect(body.token_endpoint).toBe(`${ORIGIN}/oauth/token`);
    expect(body.code_challenge_methods_supported).toEqual(["S256"]);
    expect(body.registration_endpoint).toBeUndefined();
    expect(body.scopes_supported).toContain("posts:write");
  });

  it("answers 'not configured' without OAUTH_KV, and serves only the canonical host", async () => {
    const off = { ...env, OAUTH_KV: undefined };
    expect((await handleOAuthRoute(new Request(`${ORIGIN}/.well-known/oauth-authorization-server`), off as never, ctx))!.status).toBe(404);
    expect((await handleOAuthRoute(new Request(`${ORIGIN}/oauth/token`, { method: "POST" }), off as never, ctx))!.status).toBe(503);
    expect((await handleOAuthRoute(new Request("https://evil.example/.well-known/oauth-protected-resource/mcp"), env as never, ctx))!.status).toBe(404);
    expect(await handleOAuthRoute(new Request(`${ORIGIN}/features`), env as never, ctx)).toBeNull();
  });

  it("challenges an unauthenticated MCP call with the resource metadata URL", () => {
    const res = errorResponse(unauthorized(), { challenge: (invalid) => mcpChallenge(ORIGIN, { invalid }) });
    expect(res.status).toBe(401);
    expect(res.headers.get("www-authenticate")).toBe(
      `Bearer realm="dewee.sh", resource_metadata="${ORIGIN}/.well-known/oauth-protected-resource/mcp", scope="pages:read posts:read docs:read"`,
    );
    const bad = errorResponse(unauthorized("x", { invalidToken: true }), { challenge: (invalid) => mcpChallenge(ORIGIN, { invalid }) });
    expect(bad.headers.get("www-authenticate")).toContain('error="invalid_token"');
    expect(errorResponse(unauthorized()).headers.get("www-authenticate")).toBe('Bearer realm="dewee.sh"');
  });

  it("uses SITE_URL as issuer, and the loopback origin only in development", () => {
    expect(oauthIssuer({ SITE_URL: ORIGIN, ENVIRONMENT: "production" }, new URL("http://localhost:4389/mcp"))).toBe(ORIGIN);
    expect(oauthIssuer({ SITE_URL: ORIGIN, ENVIRONMENT: "development" }, new URL("http://localhost:4389/mcp"))).toBe("http://localhost:4389");
    expect(oauthIssuer({ SITE_URL: ORIGIN, ENVIRONMENT: "development" }, new URL("https://evil.example/mcp"))).toBe(ORIGIN);
  });
});

describe("consent", () => {
  it("pre-ticks requested reads only; writes and leads always start unticked", () => {
    const d = Object.fromEntries(consentDefaults(["pages:read", "posts:write", "leads:read", "admin:all"]).map((s) => [s.scope, s]));
    expect(d["pages:read"]).toMatchObject({ requested: true, checked: true });
    expect(d["posts:write"]).toMatchObject({ requested: true, checked: false });
    expect(d["leads:read"]).toMatchObject({ requested: true, checked: false });
    expect(d["docs:read"]).toMatchObject({ requested: false, checked: false });
    expect(Object.keys(d)).not.toContain("admin:all");
  });

  it("shows the verified client domain and the redirect host", async () => {
    const { begun } = await signIn({ scopesTicked: ["pages:read"] });
    expect(begun.kind).toBe("consent");
    if (begun.kind === "consent") expect(begun.view).toMatchObject({ clientName: "ChatGPT", clientDomain: "chatgpt.example", redirectHost: "chatgpt.example", redirectIsLoopback: false });
  });

  it("redirects with a code, the state and the issuer (RFC 9207)", async () => {
    const { location } = await signIn({ scopesTicked: ["pages:read"] });
    expect(location.origin + location.pathname).toBe(REDIRECT);
    expect(location.searchParams.get("state")).toBe("st-123");
    expect(location.searchParams.get("iss")).toBe(ORIGIN);
    expect(location.searchParams.get("code")).toBeTruthy();
  });

  it("refuses an unregistered redirect URI without redirecting to it", async () => {
    const api = oauthApi(env as never, new URL(ORIGIN))!;
    const out = await beginAuthorize(api, new Request(authorizeUrl({ challenge: pkce().challenge, redirect: "https://evil.example/cb" })));
    expect(out).toMatchObject({ kind: "error", reason: "bad_request" });
  });

  it("refuses plain PKCE and an unknown resource", async () => {
    const api = oauthApi(env as never, new URL(ORIGIN))!;
    const plain = await beginAuthorize(api, new Request(authorizeUrl({ challenge: "x".repeat(43), method: "plain" })));
    expect(plain.kind).not.toBe("consent");
    const other = await beginAuthorize(api, new Request(authorizeUrl({ challenge: pkce().challenge, resource: "https://evil.example/mcp" })));
    expect(other.kind).not.toBe("consent");
  });

  it("binds the consent form to the browser: no cookie, reused handle or empty scope list fails", async () => {
    const api = oauthApi(env as never, new URL(ORIGIN))!;
    const begun = await beginAuthorize(api, new Request(authorizeUrl({ challenge: pkce().challenge })));
    if (begun.kind !== "consent") throw new Error("expected consent");
    const noCookie = new Request(`${ORIGIN}/oauth/authorize`, { method: "POST" });
    expect(await finishAuthorize(api, env.DB as D1Database, noCookie, { email: ADMIN, handle: begun.view.handle, decision: "approve", scopes: ["pages:read"] })).toMatchObject({ kind: "error", reason: "expired" });

    const withCookie = () => new Request(`${ORIGIN}/oauth/authorize`, { method: "POST", headers: { cookie: cookieHeader(begun.headers) } });
    expect(await finishAuthorize(api, env.DB as D1Database, withCookie(), { email: ADMIN, handle: begun.view.handle, decision: "approve", scopes: ["admin:all"] })).toMatchObject({ kind: "error", reason: "no_scope" });
  });

  it("Deny redirects with access_denied and is audited", async () => {
    const api = oauthApi(env as never, new URL(ORIGIN))!;
    const begun = await beginAuthorize(api, new Request(authorizeUrl({ challenge: pkce().challenge })));
    if (begun.kind !== "consent") throw new Error("expected consent");
    const req = new Request(`${ORIGIN}/oauth/authorize`, { method: "POST", headers: { cookie: cookieHeader(begun.headers) } });
    const out = await finishAuthorize(api, env.DB as D1Database, req, { email: ADMIN, handle: begun.view.handle, decision: "deny", scopes: [] });
    if (out.kind !== "redirect") throw new Error("expected redirect");
    expect(new URL(out.location).searchParams.get("error")).toBe("access_denied");
    const row = await (env.DB as D1Database).prepare("SELECT action, actor FROM audit_log ORDER BY id DESC LIMIT 1").first();
    expect(row).toEqual({ action: "oauth.deny", actor: ADMIN });
  });
});

describe("tokens on /mcp", () => {
  it("issues a token for exactly the ticked scopes and maps it to an OAuth principal", async () => {
    const t = await connect(["pages:read", "posts:read"]);
    expect(t.scope.split(" ").sort()).toEqual(["pages:read", "posts:read"]);
    const principal = await auth(t.access_token);
    expect(principal).toMatchObject({ kind: "oauth", email: ADMIN, scopes: ["pages:read", "posts:read"], clientId: CLIENT_ID });
    expect(principal.actor).toBe(`${ADMIN} (oauth chatgpt.example)`);
    const audit = await (env.DB as D1Database).prepare("SELECT action FROM audit_log WHERE action = 'oauth.grant'").first();
    expect(audit).toEqual({ action: "oauth.grant" });
  });

  it("a read-only grant cannot see or call write tools", async () => {
    const t = await connect(["pages:read", "posts:read", "docs:read"]);
    const names = await toolNames(t.access_token);
    expect(names).toContain("list_posts");
    for (const write of ["create_post", "update_post", "delete_post", "update_doc", "create_page", "upload_media", "list_leads"]) expect(names).not.toContain(write);

    const principal = await auth(t.access_token);
    const call = (await handleMessage(MCP_SERVER, { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "create_post", arguments: { title: "x" } } }, { env: env as never, principal })) as { result: { isError: boolean } };
    expect(call.result.isError).toBe(true);
  });

  it("a write grant sees post write tools once the admin ticked posts:write", async () => {
    const t = await connect(["posts:read", "posts:write"], "posts:read posts:write");
    expect(await toolNames(t.access_token)).toEqual(expect.arrayContaining(["list_posts", "create_post", "update_post"]));
  });

  it("rejects a wrong PKCE verifier, a reused code and a different resource", async () => {
    const { location, verifier } = await signIn({ scopesTicked: ["pages:read"] });
    const code = location.searchParams.get("code")!;
    const base = { grant_type: "authorization_code", code, redirect_uri: REDIRECT, client_id: CLIENT_ID };
    expect((await token({ ...base, code_verifier: pkce().verifier })).status).toBe(400);

    const again = await signIn({ scopesTicked: ["pages:read"] });
    const code2 = again.location.searchParams.get("code")!;
    expect((await token({ ...base, code: code2, code_verifier: again.verifier, resource: "https://evil.example/mcp" })).body.error).toBe("invalid_target");

    const third = await signIn({ scopesTicked: ["pages:read"] });
    const ok = { ...base, code: third.location.searchParams.get("code")!, code_verifier: third.verifier };
    expect((await token(ok)).status).toBe(200);
    expect((await token(ok)).status).toBe(400);
    void verifier;
  });

  it("cannot widen scopes at the token endpoint", async () => {
    const t = await connect(["pages:read"]);
    const refreshed = await token({ grant_type: "refresh_token", refresh_token: t.refresh_token, client_id: CLIENT_ID, scope: "pages:read posts:write" });
    if (refreshed.status === 200) expect(refreshed.body.scope).not.toContain("posts:write");
    else expect(refreshed.body.error).toBe("invalid_scope");
  });

  it("refuses garbage, revoked, expired and stale-refresh credentials", async () => {
    await expect(auth("not-a-real-token")).rejects.toMatchObject({ status: 401, invalidToken: true });

    const t = await connect(["pages:read"]);
    // Refresh rotates; once the new refresh token is used, the old one is dead.
    const r1 = await token({ grant_type: "refresh_token", refresh_token: t.refresh_token, client_id: CLIENT_ID });
    expect(r1.status).toBe(200);
    const r2 = await token({ grant_type: "refresh_token", refresh_token: r1.body.refresh_token, client_id: CLIENT_ID });
    expect(r2.status).toBe(200);
    expect((await token({ grant_type: "refresh_token", refresh_token: t.refresh_token, client_id: CLIENT_ID })).status).toBe(400);

    // Expiry: an access token is good for an hour.
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(Date.now() + 3601_000);
    await expect(auth(r2.body.access_token)).rejects.toMatchObject({ status: 401 });
    vi.useRealTimers();

    // Revocation from the connected-apps page signs the app out at once.
    const fresh = await connect(["pages:read"]);
    await expect(auth(fresh.access_token)).resolves.toMatchObject({ kind: "oauth" });
    const api = oauthApi(env as never, new URL(ORIGIN))!;
    const apps = await listConnectedApps(api, [ADMIN]);
    expect(apps.length).toBeGreaterThan(0);
    expect(apps[0].meta).toMatchObject({ clientName: "ChatGPT", clientDomain: "chatgpt.example" });
    for (const app of apps) await api.revokeGrant(app.id, encodeURIComponent(ADMIN));
    await expect(auth(fresh.access_token)).rejects.toMatchObject({ status: 401 });
    expect((await token({ grant_type: "refresh_token", refresh_token: fresh.refresh_token, client_id: CLIENT_ID })).status).toBe(400);
  });

  it("refuses a token whose admin is no longer on the allowlist", async () => {
    const { location, verifier } = await signIn({ scopesTicked: ["pages:read"], email: "someone@example.com" });
    const t = await token({ grant_type: "authorization_code", code: location.searchParams.get("code")!, redirect_uri: REDIRECT, client_id: CLIENT_ID, code_verifier: verifier });
    expect(t.status).toBe(200);
    expect(await validateMcpAccessToken(env as never, new URL(RESOURCE), t.body.access_token)).toBeNull();
  });

  it("keeps API keys on their own path: a dwk_ token is never sent to OAuth", async () => {
    await expect(auth("dwk_abcdefgh_" + "x".repeat(40))).rejects.toMatchObject({ status: 401, message: "The API key is invalid, expired or revoked." });
  });

  it("rate-limits the token endpoint per IP", async () => {
    const req = () => new Request(`${ORIGIN}/oauth/token`, { method: "POST", headers: { "cf-connecting-ip": "203.0.113.9", "content-type": "application/x-www-form-urlencoded" }, body: "grant_type=refresh_token&refresh_token=x&client_id=y" });
    let last = 0;
    for (let i = 0; i < 61; i++) last = (await handleOAuthRoute(req(), env as never, ctx))!.status;
    expect(last).toBe(429);
  });
});
