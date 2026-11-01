import { describe, expect, it, vi } from "vitest";
import type { ApiScope } from "../../src/lib/server/auth/api-key-format";
import { handleMessage } from "../../src/lib/server/mcp/json-rpc";
import { MCP_SERVER, type McpCtx } from "../../src/lib/server/mcp/mcp-tools";
import { createPage } from "../../src/lib/server/pages/page-service";
import { sqliteD1 } from "../helpers/sqlite-d1";

// The media module reads bindings through cloudflare:workers; these tests pass the database in.
vi.mock("cloudflare:workers", () => ({ env: {} }));

type ToolResult = { isError?: boolean; content: { text: string }[]; structuredContent: Record<string, unknown> & { error?: { code: string } } };

function setup(scopes: ApiScope[]) {
  const { d1, raw } = sqliteD1();
  const ctx = { env: { DB: d1 }, principal: { kind: "api_key", email: "agent@dewee.sh", scopes, actor: "key:test" } } as unknown as McpCtx;
  const list = async () => {
    const res = (await handleMessage(MCP_SERVER, { jsonrpc: "2.0", id: 1, method: "tools/list" }, ctx)) as { result: { tools: { name: string; annotations?: Record<string, boolean> }[] } };
    return res.result.tools;
  };
  const call = async (name: string, args: unknown) => {
    const res = (await handleMessage(MCP_SERVER, { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name, arguments: args } }, ctx)) as { result: ToolResult };
    return res.result;
  };
  const count = (table: string) => (raw.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n;
  return { d1, list, call, count };
}

const seedPost = (d1: D1Database, extra: Record<string, unknown> = {}) =>
  createPage(d1, "post", { title: "Launch notes", slug: "launch-notes", status: "published", body_md: "Hello.", ...extra }, { actor: "seed" });

describe("MCP lifecycle tools: scopes", () => {
  it("shows post write tools only to keys with posts:write, and page tools only to page keys", async () => {
    const read = (await setup(["posts:read"]).list()).map((t) => t.name);
    expect(read).toEqual(expect.arrayContaining(["list_posts", "get_page", "get_revision", "validate_post"]));
    for (const name of ["unpublish_post", "archive_post", "delete_post", "publish_post", "unpublish_page", "validate_page"]) expect(read).not.toContain(name);

    const write = (await setup(["posts:write"]).list()).map((t) => t.name);
    expect(write).toEqual(expect.arrayContaining(["unpublish_post", "archive_post", "delete_post", "validate_post", "restore_revision"]));
    for (const name of ["list_posts", "get_revision", "archive_page", "unpublish_page", "delete_page"]) expect(write).not.toContain(name);

    const pages = (await setup(["pages:write"]).list()).map((t) => t.name);
    expect(pages).toEqual(expect.arrayContaining(["unpublish_page", "archive_page", "delete_page", "validate_page"]));
    expect(pages).not.toContain("archive_post");
  });

  it("refuses calls the key's scopes do not allow", async () => {
    const reader = setup(["posts:read"]);
    const post = await seedPost(reader.d1);
    expect((await reader.call("unpublish_post", { id: post.id })).structuredContent.error?.code).toBe("forbidden");

    const pageWriter = setup(["pages:write", "pages:read"]);
    await seedPost(pageWriter.d1);
    expect((await pageWriter.call("archive_post", { id: "launch-notes" })).structuredContent.error?.code).toBe("forbidden");
    expect((await pageWriter.call("get_revision", { kind: "post", id: "launch-notes", revision_id: 1 })).structuredContent.error?.code).toBe("forbidden");
  });

  it("annotates destructive and read-only tools", async () => {
    const tools = Object.fromEntries((await setup(["posts:read", "posts:write"]).list()).map((t) => [t.name, t.annotations]));
    expect(tools.unpublish_post).toMatchObject({ readOnlyHint: false, destructiveHint: true, idempotentHint: true });
    expect(tools.archive_post).toMatchObject({ readOnlyHint: false, destructiveHint: true, idempotentHint: true });
    expect(tools.delete_post).toMatchObject({ readOnlyHint: false, destructiveHint: true, idempotentHint: false });
    expect(tools.validate_post).toMatchObject({ readOnlyHint: true });
    expect(tools.get_revision).toMatchObject({ readOnlyHint: true });
  });
});

describe("MCP lifecycle tools: status changes", () => {
  it("unpublishes and archives a post by slug + locale with only posts:write", async () => {
    const t = setup(["posts:write"]);
    await seedPost(t.d1);
    const viPost = await seedPost(t.d1, { locale: "vi", title: "Ghi chú" });

    const draft = await t.call("unpublish_post", { id: "launch-notes", lookup_locale: "vi", version: 1 });
    expect(draft.isError).toBeUndefined();
    expect(draft.structuredContent).toMatchObject({ id: viPost.id, status: "draft", version: 2, locale: "vi" });

    // A retry with no version is a no-op: same version, no new revision.
    const revisions = t.count("page_revisions");
    expect((await t.call("unpublish_post", { id: "launch-notes", lookup_locale: "vi" })).structuredContent).toMatchObject({ status: "draft", version: 2 });
    expect(t.count("page_revisions")).toBe(revisions);

    const archived = await t.call("archive_post", { id: viPost.id, version: 2, note: "old news" });
    expect(archived.structuredContent).toMatchObject({ status: "archived", version: 3 });
  });

  it("refuses a status change from a stale version", async () => {
    const t = setup(["posts:write"]);
    const post = await seedPost(t.d1);
    await t.call("unpublish_post", { id: post.id, version: 1 });
    const stale = await t.call("archive_post", { id: post.id, version: 1 });
    expect(stale.isError).toBe(true);
    expect(stale.structuredContent.error?.code).toBe("version_conflict");
    expect((await t.call("validate_post", { id: post.id, content: {} })).structuredContent).toMatchObject({ current_version: 2 });
  });

  it("archives pages too", async () => {
    const t = setup(["pages:write"]);
    const page = await createPage(t.d1, "page", { title: "Promo", slug: "promo", status: "published" }, { actor: "seed" });
    expect((await t.call("archive_page", { id: "promo", version: page.version })).structuredContent).toMatchObject({ status: "archived", version: 2 });
  });
});

describe("MCP lifecycle tools: validate_post", () => {
  it("reports bad widget references and props with paths, and writes nothing", async () => {
    const t = setup(["posts:write"]);
    const before = ["pages", "page_revisions", "audit_log"].map(t.count);

    const missing = await t.call("validate_post", { content: { title: "Draft", body_md: 'Intro\n\n::widget{id="nope"}' } });
    expect(missing.structuredContent).toMatchObject({ valid: false, mode: "create", issues: [{ path: "body_md", message: expect.stringContaining('"nope"') }] });

    const badProps = await t.call("validate_post", { content: { title: "Draft", body_md: '::widget{id="c"}', blocks: [{ id: "c", type: "Callout", props: {} }] } });
    expect(badProps.structuredContent.valid).toBe(false);
    expect((badProps.structuredContent.issues as { path: string }[])[0].path).toMatch(/^blocks\.0\.props/);

    const badSchema = await t.call("validate_post", { content: { title: "", tags: ["no/slash"] } });
    expect((badSchema.structuredContent.issues as { path: string }[]).map((i) => i.path)).toEqual(expect.arrayContaining(["title", "tags.0"]));

    const ok = await t.call("validate_post", { content: { title: "Draft", body_md: '::widget{id="c"}', blocks: [{ id: "c", type: "Callout", props: { body: "Hi" } }] } });
    expect(ok.structuredContent).toEqual({ valid: true, mode: "create", issues: [] });

    expect(["pages", "page_revisions", "audit_log"].map(t.count)).toEqual(before);
  });

  it("checks an update against the stored record: version, slug clash and body", async () => {
    const t = setup(["posts:read"]);
    const post = await seedPost(t.d1);
    await seedPost(t.d1, { slug: "other", title: "Other" });
    const res = await t.call("validate_post", { id: "launch-notes", content: { version: 7, slug: "other" } });
    expect(res.structuredContent).toMatchObject({ valid: false, mode: "update", current_version: 1 });
    expect((res.structuredContent.issues as { path: string }[]).map((i) => i.path)).toEqual(["version", "slug"]);
    const ok = await t.call("validate_post", { id: post.id, content: { version: 1, body_md: "New body." } });
    expect(ok.structuredContent).toMatchObject({ valid: true, mode: "update" });
    expect((await t.call("validate_post", { id: "missing", content: {} })).structuredContent.error?.code).toBe("not_found");
  });
});

describe("MCP lifecycle tools: revisions", () => {
  it("reads a revision snapshot, restores it and shows the new version", async () => {
    const t = setup(["posts:read", "posts:write"]);
    const post = await seedPost(t.d1);
    await t.call("update_post", { id: post.id, version: 1, title: "Launch notes, revised" });

    const listed = (await t.call("list_revisions", { kind: "post", id: "launch-notes" })).structuredContent.revisions as { id: number; version: number }[];
    const first = listed.find((r) => r.version === 1)!;
    const snap = await t.call("get_revision", { kind: "post", id: "launch-notes", revision_id: first.id });
    expect(snap.structuredContent).toMatchObject({ version: 1, snapshot: { title: "Launch notes", slug: "launch-notes" } });

    const restored = await t.call("restore_revision", { kind: "post", id: post.id, revision_id: first.id, version: 2 });
    expect(restored.structuredContent).toMatchObject({ title: "Launch notes", version: 3 });
    expect((await t.call("get_page", { kind: "post", id: post.id })).structuredContent).toMatchObject({ title: "Launch notes", version: 3 });

    const stale = await t.call("restore_revision", { kind: "post", id: post.id, revision_id: first.id, version: 2 });
    expect(stale.structuredContent.error?.code).toBe("version_conflict");
    expect((await t.call("get_revision", { kind: "post", id: post.id, revision_id: 999 })).structuredContent.error?.code).toBe("not_found");
  });
});

describe("MCP lifecycle tools: delete", () => {
  it("needs the current version and the slug typed back, and is not silently retried", async () => {
    const t = setup(["posts:write"]);
    const post = await seedPost(t.d1);

    expect((await t.call("delete_post", { id: post.id, confirm_slug: "launch-notes" })).structuredContent.error?.code).toBe("validation_failed");
    expect((await t.call("delete_post", { id: post.id, version: 1, confirm_slug: "launch" })).structuredContent.error?.code).toBe("bad_request");
    expect((await t.call("delete_post", { id: post.id, version: 5, confirm_slug: "launch-notes" })).structuredContent.error?.code).toBe("version_conflict");
    expect(t.count("pages")).toBe(1);

    const done = await t.call("delete_post", { id: "launch-notes", version: 1, confirm_slug: "launch-notes" });
    expect(done.structuredContent).toEqual({ id: post.id, deleted: true });
    expect(t.count("pages")).toBe(0);
    expect(t.count("page_revisions")).toBe(0);
    expect((await t.call("delete_post", { id: post.id, version: 1, confirm_slug: "launch-notes" })).structuredContent.error?.code).toBe("not_found");
  });
});
