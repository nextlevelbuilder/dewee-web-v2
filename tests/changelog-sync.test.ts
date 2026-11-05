import { describe, expect, it, vi } from "vitest";
import { syncChangelog } from "../src/lib/server/changelog-sync";

describe("syncChangelog", () => {
  it("fails loudly when GITHUB_TOKEN is missing", async () => {
    const env = { CHANGELOG_REPO: "nextlevelbuilder/dewee" } as unknown as Env;
    await expect(syncChangelog(env)).rejects.toThrow(/GITHUB_TOKEN/);
  });
});

describe("syncChangelog pagination", () => {
  const release = (n: number) => ({
    tag_name: `v3.${n}.0`, name: `v3.${n}.0`, prerelease: false, draft: false,
    published_at: "2026-09-01T00:00:00Z", body: "notes",
  });

  it("walks every page and only adds missing tags beyond the newest page", async () => {
    const pages = [Array.from({ length: 100 }, (_, i) => release(200 - i)), [release(99), release(98)]];
    const urls: string[] = [];
    vi.stubGlobal("fetch", async (url: string) => {
      urls.push(url);
      const page = Number(new URL(url).searchParams.get("page"));
      return new Response(JSON.stringify(pages[page - 1] ?? []), { status: 200 });
    });
    const bound: string[] = [];
    const env = {
      GITHUB_TOKEN: "test",
      CHANGELOG_REPO: "nextlevelbuilder/dewee",
      DB: {
        prepare: (sql: string) => ({
          all: async () => ({ results: sql.startsWith("SELECT") ? [{ tag: "v3.200.0" }, { tag: "v3.99.0" }] : [] }),
          bind: (tag: string) => { bound.push(tag); return {}; },
        }),
        batch: async () => [],
      },
    } as unknown as Env;

    const result = await syncChangelog(env);

    expect(urls).toHaveLength(2);
    expect(result.synced).toBe(101);
    expect(bound).toContain("v3.200.0");
    expect(bound).toContain("v3.98.0");
    expect(bound).not.toContain("v3.99.0");
    vi.unstubAllGlobals();
  });
});
