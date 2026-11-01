import { afterEach, describe, expect, it, vi } from "vitest";
import { contentCommand } from "../../cli/src/commands/content.js";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

/** Runs one content command against a stubbed fetch and returns the requests it sent. */
async function requestsFor(kind: "page" | "post", args: string[], flags: Record<string, string | true>) {
  vi.spyOn(process.stdout, "write").mockImplementation(() => true);
  const requests: Array<{ url: string; method: string | undefined }> = [];
  vi.stubGlobal("fetch", async (input: RequestInfo | URL, init?: RequestInit) => {
    requests.push({ url: String(input), method: init?.method });
    return Response.json({ data: { id: "item-id", version: 1, status: "draft", url: "/blog/item-slug" } });
  });
  await contentCommand(kind, { url: "https://dewee.sh", apiKey: "dwk_test" }, args, { json: true, ...flags });
  return requests;
}

describe("CLI content command paths", () => {
  it.each(["publish", "unpublish"] as const)("places the locale query after the %s action", async (action) => {
    expect(await requestsFor("post", [action, "post-slug"], { locale: "en" })).toEqual([
      { url: `https://dewee.sh/api/v1/posts/post-slug/${action}?locale=en`, method: "POST" },
    ]);
  });

  it.each(["publish", "unpublish"] as const)("does the same for a nested page slug on %s", async (action) => {
    expect(await requestsFor("page", [action, "guides/setup"], { locale: "vi" })).toEqual([
      { url: `https://dewee.sh/api/v1/pages/guides%2Fsetup/${action}?locale=vi`, method: "POST" },
    ]);
  });

  it("sends no query when publishing by id", async () => {
    expect(await requestsFor("post", ["publish", "item-id"], {})).toEqual([
      { url: "https://dewee.sh/api/v1/posts/item-id/publish", method: "POST" },
    ]);
  });

  it("keeps the locale query on get", async () => {
    expect(await requestsFor("post", ["get", "post-slug"], { locale: "en" })).toEqual([
      { url: "https://dewee.sh/api/v1/posts/post-slug?locale=en", method: "GET" },
    ]);
  });
});

describe("CLI docs command", () => {
  it("sends an update as PATCH with the expected SHA and prints the pull request", async () => {
    const { docsCommand } = await import("../../cli/src/commands/docs.js");
    const { mkdtempSync, writeFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    const { tmpdir } = await import("node:os");
    const file = join(mkdtempSync(join(tmpdir(), "dewee-docs-")), "quickstart.md");
    writeFileSync(file, "---\ntitle: Quickstart\n---\n\nBody.\n");
    const out: string[] = [];
    vi.spyOn(process.stdout, "write").mockImplementation((s) => (out.push(String(s)), true));
    vi.spyOn(process.stderr, "write").mockImplementation(() => true);
    const requests: Array<{ url: string; method: string | undefined; body: any }> = [];
    vi.stubGlobal("fetch", async (input: RequestInfo | URL, init?: RequestInit) => {
      requests.push({ url: String(input), method: init?.method, body: JSON.parse(String(init?.body)) });
      return Response.json({ data: { replayed: false, branch: "docs/update-x", pull_request: { number: 7, url: "https://github.com/acme/site/pull/7" }, validation: null } }, { status: 201 });
    });

    await docsCommand({ url: "https://dewee.sh", apiKey: "dwk_test" }, ["update", "get-started/quickstart"], { en: file, "en-sha": "a".repeat(40), note: "Fix" });

    expect(requests).toEqual([
      { url: "https://dewee.sh/api/v1/docs/get-started/quickstart", method: "PATCH", body: { en: { content: "---\ntitle: Quickstart\n---\n\nBody.\n", expected_sha: "a".repeat(40) }, note: "Fix" } },
    ]);
    expect(out.join("")).toContain("https://github.com/acme/site/pull/7");
  });

  it("refuses a page name without a section", async () => {
    const { docsCommand } = await import("../../cli/src/commands/docs.js");
    await expect(docsCommand({ url: "https://dewee.sh", apiKey: "dwk_test" }, ["get", "quickstart"], {})).rejects.toThrow("<section>/<slug>");
  });
});
