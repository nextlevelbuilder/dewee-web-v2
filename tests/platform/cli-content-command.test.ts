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
