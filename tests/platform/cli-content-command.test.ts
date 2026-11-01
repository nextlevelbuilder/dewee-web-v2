import { afterEach, describe, expect, it, vi } from "vitest";
import { contentCommand } from "../../cli/src/commands/content.js";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("CLI content command paths", () => {
  it.each(["publish", "unpublish"] as const)("places the locale query after the %s action", async (action) => {
    vi.spyOn(process.stdout, "write").mockImplementation(() => true);
    const requests: Array<{ url: string; method: string | undefined }> = [];
    vi.stubGlobal("fetch", async (input: RequestInfo | URL, init?: RequestInit) => {
      requests.push({ url: String(input), method: init?.method });
      return Response.json({
        data: {
          id: "post-id",
          version: 1,
          status: action === "publish" ? "published" : "draft",
          url: "/blog/post-slug",
        },
      });
    });

    await contentCommand(
      "post",
      { url: "https://dewee.sh", apiKey: "dwk_test" },
      [action, "post-slug"],
      { locale: "en", json: true },
    );

    expect(requests).toEqual([
      {
        url: `https://dewee.sh/api/v1/posts/post-slug/${action}?locale=en`,
        method: "POST",
      },
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
