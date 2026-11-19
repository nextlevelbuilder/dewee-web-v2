import { describe, expect, it, vi } from "vitest";
import { ApiError } from "../../src/lib/server/api/api-errors";
import { createPage, updatePage } from "../../src/lib/server/pages/page-service";
import { listPostMarkdown } from "../../src/lib/server/seo/dynamic-pages";
import { V1_ROUTES } from "../../src/lib/server/api/v1-routes";
import type { RouteCtx } from "../../src/lib/server/api/v1-route-types";
import { MCP_TOOLS } from "../../src/lib/server/mcp/mcp-tools";
import { sqliteD1 } from "../helpers/sqlite-d1";
import { samplePost } from "./sample-post";

// The route modules read bindings through cloudflare:workers; these tests pass the database in.
vi.mock("cloudflare:workers", () => ({ env: {} }));

const ctx = { actor: "test" };

async function rejection(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise;
  } catch (err) {
    if (err instanceof ApiError) return err;
    throw err;
  }
  throw new Error("expected the write to fail");
}

describe("post writes", () => {
  it("stores a post with placed widgets and keeps block ids", async () => {
    const { d1 } = sqliteD1();
    const rec = await createPage(d1, "post", { title: "Widgets", slug: "widgets", ...samplePost() }, ctx);
    expect(rec.blocks.map((b) => b.id)).toContain("screens");
    expect(rec.blocks.find((b) => b.id === "screens")?.type).toBe("Gallery");
  });

  it("rejects directives that name no block, with the line", async () => {
    const { d1 } = sqliteD1();
    const err = await rejection(createPage(d1, "post", { title: "Bad", slug: "bad", body_md: 'Intro\n\n::widget{id="nope"}' }, ctx));
    expect(err.status).toBe(422);
    expect(err.details).toEqual([{ path: "body_md", message: expect.stringMatching(/^Line 3: no block has the id "nope"/) }]);
  });

  it("rejects page-only blocks in posts and post-only widgets on pages", async () => {
    const { d1 } = sqliteD1();
    const post = await rejection(createPage(d1, "post", { title: "P", slug: "p", blocks: [{ type: "PageHero", props: { title: "x" } }] }, ctx));
    expect(post.details).toEqual([expect.objectContaining({ path: "blocks.0.type" })]);
    const gallery = samplePost().blocks.find((b) => (b as { type: string }).type === "Gallery") as { type: string; props: unknown };
    const page = await rejection(createPage(d1, "page", { title: "Pg", slug: "pg", blocks: [{ type: gallery.type, props: gallery.props }] }, ctx));
    expect(page.details).toEqual([expect.objectContaining({ path: "blocks.0.type" })]);
  });

  it("validates the body against the blocks on update too", async () => {
    const { d1 } = sqliteD1();
    const rec = await createPage(d1, "post", { title: "U", slug: "u", body_md: "Plain" }, ctx);
    const err = await rejection(updatePage(d1, "post", rec.id, { body_md: 'Plain\n\n::widget{id="x"}' }, ctx));
    expect(err.status).toBe(422);
    const ok = await updatePage(d1, "post", rec.id, { body_md: 'Plain\n\n::widget{id="x"}', blocks: [{ id: "x", type: "Callout", props: { body: "Hi" } }] }, ctx);
    expect(ok.version).toBe(2);
  });
});

describe("llms-full post Markdown", () => {
  it("keeps old posts as written and turns widgets into text", async () => {
    const { d1 } = sqliteD1();
    const old = "Old post with `code`.\n\n```js\nconst a = 1;\n```\n";
    await createPage(d1, "post", { title: "Old", slug: "old", body_md: old, status: "published" }, ctx);
    await createPage(d1, "post", { title: "New", slug: "new", status: "published", ...samplePost() }, ctx);
    const posts = await listPostMarkdown(d1, "en");
    expect(posts.find((p) => p.path === "/blog/old")?.markdown).toBe(old);
    const fresh = posts.find((p) => p.path === "/blog/new")?.markdown ?? "";
    expect(fresh).toContain("![GoClaw logo](https://dewee.sh/img/ecosystem/goclaw.svg)");
    expect(fresh).toContain("[View on Bluesky](https://bsky.app/profile/dewee.sh/post/3l2example)");
  });
});

describe("API surfaces", () => {
  const routeCall = async (path: string, method: string, ctx: Partial<RouteCtx>) => {
    const def = V1_ROUTES.find((r) => r.path === path && r.method === method);
    if (!def) throw new Error(`no route ${method} ${path}`);
    const query = def.query ? def.query.parse(ctx.query ?? {}) : undefined;
    const res = await def.handle({ ...ctx, query } as RouteCtx);
    return (await res.json()) as { data: unknown };
  };

  it("lists post widgets with ?context=post", async () => {
    const { data } = (await routeCall("/blocks", "GET", { query: { context: "post" } })) as { data: { type: string; contexts: string[] }[] };
    const types = data.map((b) => b.type);
    expect(types).toEqual(expect.arrayContaining(["Gallery", "Video", "VideoEmbed", "SocialCard", "CodeBlock", "Callout", "Image"]));
    expect(types).not.toContain("PageHero");
    expect(data.every((b) => b.contexts.includes("post"))).toBe(true);
  });

  it("validates post blocks together with the body", async () => {
    const blocks = [{ id: "a", type: "Callout", props: { body: "x" } }];
    const ok = await routeCall("/blocks/validate", "POST", { body: { blocks, context: "post", body_md: '::widget{id="a"}' } });
    expect(ok.data).toEqual({ valid: true, issues: [] });
    const bad = await routeCall("/blocks/validate", "POST", { body: { blocks, context: "post", body_md: '::widget{id="b"}' } });
    expect(bad.data).toEqual({ valid: false, issues: [{ path: "body_md", message: expect.stringContaining('"b"') }] });
    const page = await routeCall("/blocks/validate", "POST", { body: { blocks } });
    expect((page.data as { valid: boolean }).valid).toBe(false);
  });

  it("documents the widget grammar on the MCP post tools", async () => {
    const create = MCP_TOOLS.find((t) => t.name === "create_post");
    expect(create?.description).toContain('::widget{id="gallery-1"}');
    const list = MCP_TOOLS.find((t) => t.name === "list_blocks");
    const result = (await list!.run({ context: "post" }, {} as never)) as { blocks: { type: string }[] };
    expect(result.blocks.map((b) => b.type)).toContain("Gallery");
  });
});
