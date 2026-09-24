import { describe, expect, it } from "vitest";
import { PUBLIC_EMAIL, sanitiseReleaseName, sanitiseReleaseNotes } from "../src/lib/server/seo/changelog/release-notes-sanitiser";

const repo = "acme/private-app";
const clean = (body: string, tag?: string) => sanitiseReleaseNotes(body, { repo, tag });

describe("sanitiseReleaseNotes", () => {
  it("returns an empty string for missing notes", () => {
    expect(sanitiseReleaseNotes(null, { repo })).toBe("");
    expect(sanitiseReleaseNotes(undefined, { repo })).toBe("");
    expect(sanitiseReleaseNotes("", { repo })).toBe("");
  });

  it("drops GitHub's generated boilerplate and keeps the change itself", () => {
    const body = [
      "## v1.2.0",
      "",
      "## What's Changed",
      "* Add SSO login by @alice in https://github.com/acme/private-app/pull/12",
      "* Merge pull request #13 from acme/feature",
      "* Fix retry loop (#14, #15)",
      "",
      "## New Contributors",
      "* @bob made their first contribution in https://github.com/acme/private-app/pull/11",
      "",
      "**Full Changelog**: https://github.com/acme/private-app/compare/v1.1.0...v1.2.0",
    ].join("\r\n");
    expect(clean(body, "v1.2.0")).toBe("## What's Changed\n* Add SSO login\n* Fix retry loop");
  });

  it("removes issue refs, ranges, repo refs and commit SHAs but keeps version numbers and words", () => {
    expect(clean("- Fix #308-#320 and #12, #13 in the gateway")).toBe("- Fix and in the gateway");
    expect(clean("- Ported from acme/private-app#44 and acme/private-app@1a2b3c4d")).toBe("- Ported from and");
    expect(clean("- Reverts 9f8e7d6c5b4a (bump to 3.2.1)")).toBe("- Reverts (bump to 3.2.1)");
    expect(clean("- Cache is now 1024000 bytes, decade-old facade")).toBe("- Cache is now 1024000 bytes, decade-old facade");
  });

  it("keeps the text of links into the private repo and removes bare repo URLs", () => {
    expect(clean("- See [the design notes](https://github.com/acme/private-app/blob/main/docs/x.md)")).toBe("- See the design notes");
    expect(clean("- Details: <https://github.com/acme/private-app/issues/9>")).toBe("- Details:");
    expect(clean("- Upstream fix: https://github.com/other/public-lib/pull/3")).toBe("- Upstream fix: https://github.com/other/public-lib/pull/3");
  });

  it("drops list items that only held a private reference", () => {
    expect(clean("## Fixes\n- Real fix\n- #42\n- https://github.com/acme/private-app/pull/43")).toBe("## Fixes\n- Real fix");
  });

  it("removes internal hosts, private IPs and preview deployments", () => {
    expect(clean("- Tested on [staging](http://10.0.3.7:8080/health) and https://api.svc.cluster.local/v1")).toBe("- Tested on staging and");
    expect(clean("- Call gateway.prod.internal or 192.168.1.20:5432 directly")).toBe("- Call or directly");
    expect(clean("- Preview: https://pr-12.acme.pages.dev and http://localhost:3000")).toBe("- Preview: and");
    expect(clean("- Docs moved to https://dewee.sh/docs")).toBe("- Docs moved to https://dewee.sh/docs");
  });

  it("redacts tokens, secret assignments, private keys and emails other than the public contact", () => {
    const token = "ghp_" + "a1B2c3D4e5F6g7H8i9J0k1L2";
    expect(clean(`- Rotated ${token}`)).toBe("- Rotated [redacted]");
    expect(clean("- Set API_KEY=supersecretvalue123 in prod")).toBe("- Set API_KEY=[redacted] in prod");
    expect(clean('- password: "hunter2hunter2"')).toBe('- password: "[redacted]"');
    expect(clean(`- Ask ops@acme.io or ${PUBLIC_EMAIL}`)).toBe(`- Ask [redacted] or ${PUBLIC_EMAIL}`);
    const key = ["-----BEGIN RSA PRIVATE KEY-----", "MIIEowIBAAKCAQEA", "-----END RSA PRIVATE KEY-----"].join("\n");
    expect(clean(`Key:\n${key}\nDone`)).toBe("Key:\n[redacted]\nDone");
  });

  it("leaves fenced code as written apart from secrets, and keeps its indentation", () => {
    const body = ["## Upgrade", "```bash", "# pull the image", "  docker pull dewee:3.3  ", "```"].join("\n");
    expect(clean(body)).toBe(body);
    expect(clean("```\nexport TOKEN=abcdefgh12345678\n```")).toBe("```\nexport TOKEN=[redacted]\n```");
  });

  it("keeps nested list indentation when a line is tidied", () => {
    expect(clean("- Parent\n  - Child fix (#12)")).toBe("- Parent\n  - Child fix");
  });

  it("drops headings left with nothing under them", () => {
    expect(clean("## Features\n\n## Fixes\n- #12\n\n## Notes\nKeep this")).toBe("## Notes\nKeep this");
    expect(clean("## Changes\n### API\n- New endpoint")).toBe("## Changes\n### API\n- New endpoint");
  });

  it("drops automated release lines and only the heading that repeats the tag", () => {
    expect(clean("## v2.0.0-beta.1\nAutomated beta release from main\n- Faster boot", "v2.0.0-beta.1")).toBe("- Faster boot");
    expect(clean("## Highlights\n- Faster boot", "v2.0.0")).toBe("## Highlights\n- Faster boot");
  });
});

describe("sanitiseReleaseName", () => {
  it("cleans a name to one line and falls back to the tag", () => {
    expect(sanitiseReleaseName("Spring release (#12)", "v1.0.0", repo)).toBe("Spring release");
    expect(sanitiseReleaseName("#12", "v1.0.0", repo)).toBe("v1.0.0");
    expect(sanitiseReleaseName(null, "v1.0.0", repo)).toBe("v1.0.0");
  });
});
