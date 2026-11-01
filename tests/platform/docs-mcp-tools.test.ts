/**
 * Docs tools end to end through the MCP dispatcher, with GitHub replaced by an in-memory fake:
 * scoped listing, reading a real EN/VI pair, validation, compare-and-swap, idempotent pull
 * requests, GitHub failures and the audit trail (which must never contain credentials).
 */
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { handleMessage } from "~/lib/server/mcp/json-rpc";
import { MCP_SERVER, type McpCtx } from "~/lib/server/mcp/mcp-tools";
import type { ApiScope } from "~/lib/server/auth/api-key-format";
import { appJwt, pemToPkcs8, resetTokenCache } from "~/lib/server/docs/github-auth";
import { fakeGitHub, gitBlobSha } from "../helpers/fake-github";
import { sqliteD1 } from "../helpers/sqlite-d1";

vi.mock("cloudflare:workers", () => ({ env: {} }));

const TOKEN = "github_pat_TESTONLY_never_printed_0123456789";
const real = (p: string) => readFileSync(new URL(`../../${p}`, import.meta.url), "utf8");
const EN = "src/content/docs/en/get-started/quickstart.md";
const VI = "src/content/docs/vi/get-started/quickstart.md";
const description = "A description that is long enough for the docs schema, which asks for between one hundred forty and one hundred sixty characters in total, ok.";
const newDoc = (title: string) => `---\ntitle: ${title}\ndescription: "${description}"\nsection: console\norder: 42\nupdated: 2026-11-01\n---\n\nA new page.\n`;

let gh: ReturnType<typeof fakeGitHub>;
let db: ReturnType<typeof sqliteD1>;

function ctx(scopes: ApiScope[]): McpCtx {
  const env = { DB: db.d1, DOCS_GITHUB_REPO: "acme/site", DOCS_GITHUB_BASE: "dev", DOCS_GITHUB_TOKEN: TOKEN } as unknown as McpCtx["env"];
  return { env, principal: { kind: "api_key", email: "op@example.com", scopes, actor: "op@example.com (key abcd1234)", keyId: "key-1" } };
}

type ToolResult = { isError?: boolean; structuredContent: any; content: { text: string }[] };
async function call(scopes: ApiScope[], name: string, args: unknown): Promise<ToolResult> {
  const res = (await handleMessage(MCP_SERVER, { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }, ctx(scopes))) as { result: ToolResult };
  expect(JSON.stringify(res)).not.toContain(TOKEN);
  return res.result;
}
async function listed(scopes: ApiScope[]): Promise<string[]> {
  const res = (await handleMessage(MCP_SERVER, { jsonrpc: "2.0", id: 1, method: "tools/list" }, ctx(scopes))) as { result: { tools: { name: string }[] } };
  return res.result.tools.map((t) => t.name).filter((n) => n.endsWith("_doc") || n.endsWith("_docs"));
}
const auditRows = () => db.raw.prepare("SELECT actor, action, target, detail FROM audit_log ORDER BY id").all() as { actor: string; action: string; target: string; detail: string }[];

beforeEach(() => {
  db = sqliteD1();
  gh = fakeGitHub({ owner: "acme", repo: "site", base: "dev", files: { [EN]: real(EN), [VI]: real(VI), "src/content/docs/en/console/link.md": "x" } });
  vi.stubGlobal("fetch", gh.fetch);
  resetTokenCache();
});
afterEach(() => vi.unstubAllGlobals());

describe("docs tool scopes", () => {
  it("shows read tools to docs:read and write tools only to docs:write", async () => {
    expect(await listed(["docs:read"])).toEqual(["list_docs", "get_doc", "validate_doc"]);
    expect(await listed(["docs:write"])).toEqual(["list_docs", "get_doc", "validate_doc", "create_doc", "update_doc"]);
    expect(await listed(["pages:read", "pages:write", "posts:write"])).toEqual([]);
  });

  it("refuses writes without docs:write and makes no GitHub call", async () => {
    for (const scopes of [["docs:read"], ["pages:write"]] as ApiScope[][]) {
      const res = await call(scopes, "update_doc", { section: "get-started", slug: "quickstart", en: { content: "x", expected_sha: "a".repeat(40) } });
      expect(res.isError).toBe(true);
      expect(res.structuredContent.error.code).toBe("forbidden");
    }
    expect(gh.calls).toHaveLength(0);
  });
});

describe("reading docs from Git", () => {
  it("lists docs with blob SHAs and skips symlinks", async () => {
    const res = await call(["docs:read"], "list_docs", {});
    expect(res.structuredContent).toMatchObject({ source: "git", ref: "dev", commit_sha: gh.baseSha, total: 2 });
    const en = res.structuredContent.docs.find((d: { locale: string }) => d.locale === "en");
    expect(en).toMatchObject({ id: "get-started/quickstart", path: EN, sha: gitBlobSha(real(EN)), url: "/docs/get-started/quickstart" });
    expect(en.title).toBeTypeOf("string");
    expect((await call(["docs:read"], "list_docs", { locale: "vi", q: "quickstart" })).structuredContent.total).toBe(1);
    expect(gh.calls.every((c) => c.auth === `Bearer ${TOKEN}`)).toBe(true);
  });

  it("reads a real EN/VI pair and explains it is source content", async () => {
    const res = await call(["docs:read"], "get_doc", { section: "get-started", slug: "quickstart" });
    expect(res.structuredContent.en).toMatchObject({ path: EN, sha: gitBlobSha(real(EN)), content: real(EN) });
    expect(res.structuredContent.vi.url).toBe("/vi/docs/get-started/quickstart");
    expect(res.structuredContent.note).toContain("can differ from what is deployed");
    const missing = await call(["docs:read"], "get_doc", { section: "console", slug: "nope" });
    expect(missing.structuredContent.error.code).toBe("not_found");
    const traversal = await call(["docs:read"], "get_doc", { section: "get-started", slug: "../../../wrangler" });
    expect(traversal.structuredContent.error.code).toBe("validation_failed");
  });
});

describe("proposing docs changes", () => {
  it("validates and previews an EN update, then opens one pull request into dev", async () => {
    const before = real(EN);
    const edited = before.replace(/\n\n/, "\n\nAn added sentence for the preview.\n\n");
    const args = { section: "get-started", slug: "quickstart", en: { content: edited, expected_sha: gitBlobSha(before) }, note: "Clarify @someone's step" };

    const preview = await call(["docs:read"], "validate_doc", { mode: "update", ...args });
    expect(preview.structuredContent).toMatchObject({ status: "validated", valid: true, base: { ref: "dev", sha: gh.baseSha } });
    expect(preview.structuredContent.changes[0].diff).toContain("+An added sentence for the preview.");
    expect(preview.structuredContent.warnings.map((w: { path: string }) => w.path)).toContain("vi");
    expect(gh.calls.every((c) => c.method === "GET" || c.url.endsWith("/graphql"))).toBe(true);

    const res = await call(["docs:write"], "update_doc", args);
    expect(res.isError).toBeUndefined();
    expect(res.structuredContent).toMatchObject({ status: "pr_opened", replayed: false, base: { ref: "dev", sha: gh.baseSha }, changed_paths: [EN], pull_request: { number: 100 } });
    expect(res.structuredContent.note).toContain("have not changed");
    expect(gh.branches.get("dev")!.files[EN]).toBe(before);
    expect(gh.branches.get(res.structuredContent.branch)!.files[EN]).toBe(edited);
    expect(gh.pulls[0].body).toContain("API key `abcd1234`");
    expect(gh.pulls[0].body).not.toContain("op@example.com");
    expect(gh.pulls[0].body).toContain("@​someone");
    // Only new objects, a new docs/ branch and a pull request into dev: no merge, no push to dev or main.
    const writes = gh.calls.filter((c) => c.method !== "GET" && !c.url.endsWith("/graphql"));
    expect(writes.map((c) => new URL(c.url).pathname)).toEqual(["/repos/acme/site/git/trees", "/repos/acme/site/git/commits", "/repos/acme/site/git/refs", "/repos/acme/site/pulls"]);
    expect((writes[2].body as { ref: string }).ref).toMatch(/^refs\/heads\/docs\/update-get-started-quickstart-[0-9a-f]{12}$/);
    expect(writes[3].body).toMatchObject({ base: "dev" });

    const [row] = auditRows();
    expect(row).toMatchObject({ action: "docs.propose", target: "docs/get-started/quickstart", actor: "op@example.com (key abcd1234)" });
    expect(JSON.parse(row.detail)).toMatchObject({ key_id: "key-1", pr_url: "https://github.com/acme/site/pull/100", paths: [EN] });
    expect(row.detail).not.toContain(TOKEN);
  });

  it("replays a repeated request instead of opening a second pull request", async () => {
    const args = { section: "console", slug: "new-page", en: { content: newDoc("New page") }, vi: { content: newDoc("Trang mới") } };
    const first = await call(["docs:write"], "create_doc", args);
    expect(first.structuredContent).toMatchObject({ status: "pr_opened", replayed: false });
    expect(gh.branches.get(first.structuredContent.branch)!.files["src/content/docs/vi/console/new-page.md"]).toBe(newDoc("Trang mới"));
    const again = await call(["docs:write"], "create_doc", args);
    expect(again.structuredContent).toMatchObject({ status: "pr_opened", replayed: true, pull_request: first.structuredContent.pull_request });
    expect(gh.pulls).toHaveLength(1);
  });

  it("needs both locales to create and refuses an existing page", async () => {
    const half = await call(["docs:write"], "create_doc", { section: "console", slug: "new-page", en: { content: newDoc("New page") } });
    expect(half.structuredContent.error).toMatchObject({ code: "validation_failed", message: expect.stringContaining("missing: vi") });
    const taken = await call(["docs:write"], "create_doc", { section: "get-started", slug: "quickstart", en: { content: newDoc("A") }, vi: { content: newDoc("B") } });
    expect(taken.structuredContent.error.code).toBe("conflict");
  });

  it("rejects stale SHAs with version_conflict and writes nothing", async () => {
    const sha = gitBlobSha(real(EN));
    gh.pushToBase({ [EN]: `${real(EN)}\nMerged by someone else.\n` });
    const res = await call(["docs:write"], "update_doc", { section: "get-started", slug: "quickstart", en: { content: `${real(EN)}\nMine.\n`, expected_sha: sha } });
    expect(res.structuredContent.error.code).toBe("version_conflict");
    expect(res.structuredContent.error.details[0]).toMatchObject({ locale: "en", expected_sha: sha });
    expect(gh.calls.filter((c) => c.method === "POST" && !c.url.endsWith("/graphql"))).toHaveLength(0);
    expect(auditRows().map((r) => r.action)).toEqual(["docs.propose_rejected"]);
  });

  it("rejects bad front matter and unknown screenshots with actionable paths", async () => {
    const bad = newDoc("New page").replace("order: 42", "order: 42\nscreens: [chat]").replace("A new page.", '::shot{id="not-a-screen"}');
    const res = await call(["docs:write"], "create_doc", { section: "console", slug: "new-page", en: { content: bad.replace(description, "too short") }, vi: { content: bad } });
    expect(res.structuredContent.error.code).toBe("validation_failed");
    const paths = res.structuredContent.error.details.errors.map((e: { path: string }) => e.path);
    expect(paths).toEqual(expect.arrayContaining(["en.front_matter.description", "en.body.line.10", "vi.body.line.10"]));
    expect(gh.pulls).toHaveLength(0);
  });

  it("maps GitHub rate limits and outages to structured errors", async () => {
    gh.failNext(new Response(JSON.stringify({ message: "API rate limit exceeded" }), { status: 403, headers: { "x-ratelimit-remaining": "0", "x-ratelimit-reset": String(Math.floor(Date.now() / 1000) + 120) } }));
    const limited = await call(["docs:read"], "list_docs", {});
    expect(limited.structuredContent.error).toMatchObject({ code: "rate_limited", details: { retry_after: expect.any(Number) } });
    gh.failNext(new Response("boom", { status: 502 }));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const down = await call(["docs:read"], "list_docs", {});
    expect(down.structuredContent.error.code).toBe("upstream_error");
    gh.failNext(new Response(JSON.stringify({ message: "Bad credentials" }), { status: 401 }));
    const denied = await call(["docs:read"], "list_docs", {});
    expect(denied.structuredContent.error.message).not.toContain(TOKEN);
  });

  it("says when the deployment has no docs credentials", async () => {
    const c = ctx(["docs:read"]);
    delete (c.env as { DOCS_GITHUB_TOKEN?: string }).DOCS_GITHUB_TOKEN;
    const res = (await handleMessage(MCP_SERVER, { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "list_docs", arguments: {} } }, c)) as { result: ToolResult };
    expect(res.result.structuredContent.error.message).toContain("not configured");
  });
});

describe("GitHub App credentials", () => {
  it("wraps a PKCS#1 key and signs an RS256 app JWT", async () => {
    const { privateKey, publicKey } = await crypto.subtle.generateKey({ name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" }, true, ["sign", "verify"]);
    const { createPrivateKey } = await import("node:crypto");
    const pkcs8 = Buffer.from(await crypto.subtle.exportKey("pkcs8", privateKey));
    const pkcs1Pem = createPrivateKey({ key: pkcs8, format: "der", type: "pkcs8" }).export({ format: "pem", type: "pkcs1" }).toString();
    expect(Buffer.from(pemToPkcs8(pkcs1Pem)).equals(pkcs8)).toBe(true);
    const jwt = await appJwt("12345", pkcs1Pem, 1_800_000_000);
    const [h, p, s] = jwt.split(".");
    expect(JSON.parse(Buffer.from(p, "base64url").toString())).toEqual({ iat: 1_800_000_000 - 60, exp: 1_800_000_000 + 540, iss: "12345" });
    const ok = await crypto.subtle.verify("RSASSA-PKCS1-v1_5", publicKey, Buffer.from(s, "base64url"), new TextEncoder().encode(`${h}.${p}`));
    expect(ok).toBe(true);
  });
});
