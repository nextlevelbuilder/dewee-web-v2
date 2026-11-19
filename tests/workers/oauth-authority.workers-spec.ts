/// <reference types="@cloudflare/vitest-plugin/types" />
import { env } from "cloudflare:workers";
import { evictDurableObject, runInDurableObject } from "cloudflare:test";
import { expect, it, vi } from "vitest";
import { OAuthDurableStorage } from "../../src/lib/server/oauth/oauth-durable-storage";
import { superAdminEmails } from "../../src/lib/server/auth/allowlist";

it("persists authority storage across eviction and keeps object identities separate", async () => {
  const bindings = env as unknown as Env;
  const first = bindings.OAUTH_AUTHORITY!.getByName("first");
  const second = bindings.OAUTH_AUTHORITY!.getByName("second");
  await runInDurableObject(first, async (_instance, state) => {
    const storage = new OAuthDurableStorage(state.storage);
    await storage.put("grant:owner:id", JSON.stringify({ clientId: "client" }), { expirationTtl: 60 });
  });
  await evictDurableObject(first);
  expect(await runInDurableObject(first, async (_instance, state) =>
    new OAuthDurableStorage(state.storage).get("grant:owner:id", "json"),
  )).toEqual({ clientId: "client" });
  expect(await runInDurableObject(second, async (_instance, state) =>
    new OAuthDurableStorage(state.storage).get("grant:owner:id"),
  )).toBeNull();
});

it("rejects an invalid token through the real Durable Object RPC boundary", async () => {
  const authority = (env as unknown as Env).OAUTH_AUTHORITY!.getByName("rpc");
  const response = await authority.route(new Request("https://dewee.sh/oauth/token", {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
    body: "grant_type=refresh_token&refresh_token=bad&client_id=bad",
  }));
  expect(response?.status).toBe(400);
  expect(await response?.json()).toEqual({ error: "invalid_grant" });
});

it("rejects the same signed client assertion across owners through Durable Object RPC", async () => {
  const bindings = env as unknown as Env;
  await bindings.DB.exec("CREATE TABLE IF NOT EXISTS audit_log (id INTEGER PRIMARY KEY, actor TEXT, action TEXT, target TEXT, detail TEXT)");
  const keys = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  const jwk = await crypto.subtle.exportKey("jwk", keys.publicKey);
  Object.assign(jwk, { kid: "worker-key", alg: "ES256", use: "sig" });
  const client = "https://client.example/metadata";
  const redirect = "https://client.example/callback";
  vi.stubGlobal("fetch", async (input: RequestInfo | URL) => {
    const url = input instanceof Request ? input.url : String(input);
    return url === client ? Response.json({ client_id: client, client_name: "Client", redirect_uris: [redirect], token_endpoint_auth_method: "private_key_jwt", jwks: { keys: [jwk] }, grant_types: ["authorization_code", "refresh_token"], response_types: ["code"] }) : new Response("not found", { status: 404 });
  });
  try {
    const authority = bindings.OAUTH_AUTHORITY!.getByName("client-assertion-race");
    const b64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const verifier = "b".repeat(64);
    const challenge = b64url(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))));
    const url = new URL("https://dewee.sh/oauth/authorize");
    for (const [key, value] of Object.entries({ response_type: "code", client_id: client, redirect_uri: redirect, state: "state", code_challenge: challenge, code_challenge_method: "S256", scope: "pages:read", resource: "https://dewee.sh/mcp" })) url.searchParams.set(key, value);
    const issueCode = async (email: string) => {
      const consent = await authority.begin(new Request(url));
      if (consent.kind !== "consent") throw new Error("expected consent");
      const cookie = consent.headers.filter(([name]) => name.toLowerCase() === "set-cookie").map(([, value]) => value.split(";")[0]).join("; ");
      const result = await authority.finish(new Request(url, { method: "POST", headers: { cookie, origin: url.origin } }), { email, handle: consent.view.handle, decision: "approve", scopes: ["pages:read"] });
      if (result.kind !== "redirect") throw new Error("expected authorization code");
      return new URL(result.location).searchParams.get("code")!;
    };
    const codes = [await issueCode(superAdminEmails()[0]), await issueCode(superAdminEmails()[1])];
    const encode = (value: unknown) => b64url(new TextEncoder().encode(JSON.stringify(value)));
    const now = Math.floor(Date.now() / 1000);
    const unsigned = `${encode({ alg: "ES256", kid: "worker-key", typ: "JWT" })}.${encode({ iss: client, sub: client, aud: "https://dewee.sh/oauth/token", iat: now, exp: now + 60, jti: crypto.randomUUID() })}`;
    const signature = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, keys.privateKey, new TextEncoder().encode(unsigned));
    const assertion = `${unsigned}.${b64url(new Uint8Array(signature))}`;
    const exchanges = await Promise.all(codes.map((code) => authority.route(new Request("https://dewee.sh/oauth/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirect, code_verifier: verifier, resource: "https://dewee.sh/mcp", client_assertion_type: "urn:ietf:params:oauth:client-assertion-type:jwt-bearer", client_assertion: assertion }) }))));
    expect(exchanges.filter((response) => response?.status === 200)).toHaveLength(1);
    expect(exchanges.filter((response) => response?.status === 401)).toHaveLength(1);
    await Promise.all(exchanges.map((response) => response?.text()));
  } finally {
    vi.unstubAllGlobals();
  }
});

it("consumes consent and codes once and revokes tokens across eviction", async () => {
  const bindings = env as unknown as Env;
  await bindings.DB.exec("CREATE TABLE IF NOT EXISTS audit_log (id INTEGER PRIMARY KEY, actor TEXT, action TEXT, target TEXT, detail TEXT)");
  const client = "https://client.example/metadata";
  const redirect = "https://client.example/callback";
  vi.stubGlobal("fetch", async (input: RequestInfo | URL) => {
    const url = input instanceof Request ? input.url : String(input);
    if (url !== client) return new Response("not found", { status: 404 });
    return Response.json({ client_id: client, client_name: "Test client", redirect_uris: [redirect], token_endpoint_auth_method: "none", grant_types: ["authorization_code", "refresh_token"], response_types: ["code"] });
  });
  try {
    const authority = bindings.OAUTH_AUTHORITY!.getByName("flow");
    const verifier = "a".repeat(64);
    const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
    const challenge = btoa(String.fromCharCode(...digest)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const url = new URL("https://dewee.sh/oauth/authorize");
    for (const [key, value] of Object.entries({ response_type: "code", client_id: client, redirect_uri: redirect, state: "state", code_challenge: challenge, code_challenge_method: "S256", scope: "pages:read", resource: "https://dewee.sh/mcp" })) url.searchParams.set(key, value);
    const consent = await authority.begin(new Request(url));
    expect(consent.kind).toBe("consent");
    if (consent.kind !== "consent") throw new Error("expected consent");
    const cookie = consent.headers.filter(([name]) => name.toLowerCase() === "set-cookie").map(([, value]) => value.split(";")[0]).join("; ");
    expect(cookie).not.toBe("");
    const email = "hi@nextlevelbuilder.io";
    const finish = () => authority.finish(new Request(url, { method: "POST", headers: { cookie, origin: url.origin, "content-length": "120", "content-type": "application/x-www-form-urlencoded" } }), { email, handle: consent.view.handle, decision: "approve", scopes: ["pages:read"] });
    const approvals = await Promise.all([finish(), finish()]);
    expect(approvals.filter((outcome) => outcome.kind === "redirect")).toHaveLength(1);
    const approved = approvals.find((outcome) => outcome.kind === "redirect")!;
    if (approved.kind !== "redirect") throw new Error("expected redirect");
    const code = new URL(approved.location).searchParams.get("code")!;
    const exchange = () => authority.route(new Request("https://dewee.sh/oauth/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: redirect, client_id: client, code_verifier: verifier, resource: "https://dewee.sh/mcp" }) }));
    const exchanges = await Promise.all([exchange(), exchange()]);
    expect(exchanges.filter((response) => response?.status === 200)).toHaveLength(1);
    const result = await exchanges.find((response) => response?.status === 200)!.json() as { access_token: string };
    await Promise.all(exchanges.filter((response) => response && response.status !== 200).map((response) => response!.text()));
    await evictDurableObject(authority);
    expect(await authority.validate("https://dewee.sh/mcp", result.access_token)).toBeNull();

    const next = await authority.begin(new Request(url));
    if (next.kind !== "consent") throw new Error("expected consent");
    const nextCookie = next.headers.filter(([name]) => name.toLowerCase() === "set-cookie").map(([, value]) => value.split(";")[0]).join("; ");
    const nextApproval = await authority.finish(new Request(url, { method: "POST", headers: { cookie: nextCookie, origin: url.origin } }), { email, handle: next.view.handle, decision: "approve", scopes: ["pages:read"] });
    if (nextApproval.kind !== "redirect") throw new Error("expected redirect");
    const nextCode = new URL(nextApproval.location).searchParams.get("code")!;
    const fresh = await authority.route(new Request("https://dewee.sh/oauth/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "authorization_code", code: nextCode, redirect_uri: redirect, client_id: client, code_verifier: verifier, resource: "https://dewee.sh/mcp" }) }));
    expect(fresh?.status).toBe(200);
    const freshToken = await fresh!.json() as { access_token: string };
    await evictDurableObject(authority);
    expect(await authority.validate("https://dewee.sh/mcp", freshToken.access_token)).not.toBeNull();
    for (const grant of await authority.list([email])) await authority.revoke(email, grant.id);
    expect(await authority.validate("https://dewee.sh/mcp", freshToken.access_token)).toBeNull();
  } finally {
    vi.unstubAllGlobals();
  }
});
