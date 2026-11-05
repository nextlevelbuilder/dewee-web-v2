import { describe, expect, it } from "vitest";
import { syncChangelog } from "../src/lib/server/changelog-sync";

describe("syncChangelog", () => {
  it("fails loudly when GITHUB_TOKEN is missing", async () => {
    const env = { CHANGELOG_REPO: "nextlevelbuilder/dewee" } as unknown as Env;
    await expect(syncChangelog(env)).rejects.toThrow(/GITHUB_TOKEN/);
  });
});
