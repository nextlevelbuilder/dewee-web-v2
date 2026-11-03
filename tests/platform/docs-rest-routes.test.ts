/**
 * The REST docs routes share the MCP docs services, so these tests cover only what is REST-specific:
 * scope checks on read routes, path params merged into an update, 201 vs 200 on a replay, and the
 * OpenAPI spec listing every docs operation.
 */
import { readFileSync } from "node:fs";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "~/lib/server/api/api-errors";
import { openApiDocument } from "~/lib/server/api/openapi-spec";
import type { RouteCtx } from "~/lib/server/api/v1-route-types";
import { V1_ROUTES } from "~/lib/server/api/v1-routes";
import type { ApiScope } from "~/lib/server/auth/api-key-format";
import { resetTokenCache } from "~/lib/server/docs/github-auth";
import { fakeGitHub, gitBlobSha } from "../helpers/fake-github";
import { sqliteD1 } from "../helpers/sqlite-d1";

vi.mock("cloudflare:workers", () => ({ env: {} }));

const EN = "src/content/docs/en/get-started/quickstart.md";
const VI = "src/content/docs/vi/get-started/quickstart.md";
const real = (p: string) => readFileSync(new URL(`../../${p}`, import.meta.url), "utf8");

let gh: ReturnType<typeof fakeGitHub>;
let db: ReturnType<typeof sqliteD1>;

beforeEach(() => {
  db = sqliteD1();
  gh = fakeGitHub({ owner: "acme", repo: "site", base: "dev", files: { [EN]: real(EN), [VI]: real(VI) } });
  vi.stubGlobal("fetch", gh.fetch);
  resetTokenCache();
});
afterEach(() => vi.unstubAllGlobals());

const body = async (res: Response) => (await res.json()) as { data: any };
const docsRoute = (method: string, path: string) => V1_ROUTES.find((r) => r.method === method && r.path === path)!;

function run(method: string, path: string, scopes: ApiScope[], extra: Partial<RouteCtx> = {}): Promise<Response> {
  const env = { DB: db.d1, DOCS_GITHUB_REPO: "acme/site", DOCS_GITHUB_BASE: "dev", DOCS_GITHUB_TOKEN: "github_pat_TESTONLY_rest" } as unknown as RouteCtx["env"];
  const principal = { kind: "api_key" as const, email: "op@example.com", scopes, actor: "op@example.com (key abcd1234)", keyId: "key-1" };
  return docsRoute(method, path).handle({ env, principal, params: {}, query: {}, body: undefined, ...extra } as RouteCtx);
}

describe("REST docs routes", () => {
  it("requires a docs scope on the read routes", async () => {
    await expect(run("GET", "/docs", ["pages:write"])).rejects.toMatchObject({ status: 403, code: "forbidden" });
    expect(gh.calls).toHaveLength(0);
    const res = await run("GET", "/docs", ["docs:read"], { query: { locale: "en" } });
    expect((await body(res)).data).toMatchObject({ source: "git", total: 1 });
    expect(docsRoute("POST", "/docs").auth).toBe("docs:write");
    expect(docsRoute("PATCH", "/docs/{section}/{slug}").auth).toBe("docs:write");
  });

  it("reads one page by path and rejects a bad slug", async () => {
    const res = await run("GET", "/docs/{section}/{slug}", ["docs:write"], { params: { section: "get-started", slug: "quickstart" }, query: { locale: "vi" } });
    const { data } = await body(res);
    expect(data.vi.sha).toBe(gitBlobSha(real(VI)));
    expect(data.en).toBeUndefined();
    const bad = run("GET", "/docs/{section}/{slug}", ["docs:read"], { params: { section: "get-started", slug: "..%2Fx" } });
    await expect(bad).rejects.toBeInstanceOf(ApiError);
  });

  it("opens a pull request from PATCH with path params, then replays it with 200", async () => {
    const edited = real(EN).replace(/\n\n/, "\n\nA REST edit.\n\n");
    const ctx = { params: { section: "get-started", slug: "quickstart" }, body: { en: { content: edited, expected_sha: gitBlobSha(real(EN)) } } };
    const first = await run("PATCH", "/docs/{section}/{slug}", ["docs:write"], ctx);
    expect(first.status).toBe(201);
    expect((await body(first)).data).toMatchObject({ status: "pr_opened", replayed: false, changed_paths: [EN] });
    const again = await run("PATCH", "/docs/{section}/{slug}", ["docs:write"], ctx);
    expect(again.status).toBe(200);
    expect((await body(again)).data.replayed).toBe(true);
    expect(gh.pulls).toHaveLength(1);
    await expect(run("PATCH", "/docs/{section}/{slug}", ["docs:write"], { ...ctx, body: { ...ctx.body, section: "console" } })).rejects.toMatchObject({ code: "validation_failed" });
  });

  it("documents every docs operation in the OpenAPI spec", () => {
    const spec = openApiDocument("https://dewee.sh") as { paths: Record<string, Record<string, { operationId: string; tags: string[] }>> };
    const ops = Object.values(spec.paths).flatMap((p) => Object.values(p)).filter((o) => o.tags?.includes("Docs"));
    expect(ops.map((o) => o.operationId).sort()).toEqual(["createDoc", "getDoc", "listDocs", "updateDoc", "validateDoc"]);
  });
});
