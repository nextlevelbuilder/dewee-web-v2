/**
 * The stale-release check: which GitHub releases count as stable, how versions compare, and when the
 * site's claimed release is called out of date. Pure logic only, no network.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { compareVersions, judge, latestStable, parseClaimed, parseVersion } from "../scripts/lib/stable-release.ts";
import { FACTS } from "~/content/facts";

const rel = (tag: string, published_at: string | null, extra: Record<string, unknown> = {}) => ({
  tag_name: tag,
  draft: false,
  prerelease: false,
  published_at,
  ...extra,
});

const CLAIMED = { version: "3.42.0", date: "2026-10-27" };

describe("versions", () => {
  it("parses plain x.y.z only", () => {
    expect(parseVersion("v3.42.0")).toEqual([3, 42, 0]);
    expect(parseVersion("3.9.10")).toEqual([3, 9, 10]);
    expect(parseVersion("3.43.0-beta.1")).toBeNull();
    expect(parseVersion("latest")).toBeNull();
  });

  it("compares numerically, not as text", () => {
    expect(compareVersions("3.10.0", "3.9.0")).toBeGreaterThan(0);
    expect(compareVersions("3.42.0", "3.42.0")).toBe(0);
    expect(compareVersions("3.41.9", "3.42.0")).toBeLessThan(0);
    expect(() => compareVersions("3.42.0-beta.1", "3.42.0")).toThrow();
  });
});

describe("latestStable", () => {
  it("skips drafts and prereleases, however they are marked", () => {
    const latest = latestStable([
      rel("v3.44.0", "2026-10-29T10:00:00Z", { draft: true }),
      rel("v3.43.0-beta.1", "2026-10-28T10:00:00Z", { prerelease: true }),
      rel("v3.43.0-beta.2", "2026-10-28T11:00:00Z"),
      rel("v3.42.0", "2026-10-27T20:34:26Z"),
      rel("v3.41.0", "2026-10-21T12:06:55Z"),
    ]);
    expect(latest).toEqual({ version: "3.42.0", publishedAt: "2026-10-27T20:34:26Z" });
  });

  it("orders by version, whatever order GitHub returns them in", () => {
    expect(latestStable([rel("v3.41.0", "2026-10-21T12:06:55Z"), rel("v3.42.0", "2026-10-27T20:34:26Z")])?.version).toBe("3.42.0");
    // A backported patch on an older line is published later but is not newer.
    expect(latestStable([rel("v3.41.1", "2026-10-30T00:00:00Z"), rel("v3.42.0", "2026-10-27T20:34:26Z")])?.version).toBe("3.42.0");
  });

  it("ignores entries without a usable published_at or tag", () => {
    expect(latestStable([rel("v3.50.0", null), rel("v3.49.0", "not a date"), rel("nightly", "2026-10-29T00:00:00Z"), rel("v3.42.0", "2026-10-27T20:34:26Z")])?.version).toBe("3.42.0");
    expect(latestStable([{ tag_name: "v3.60.0", published_at: "2026-10-29T00:00:00Z" }])).toBeNull();
  });

  it("returns null for anything that is not a list of releases", () => {
    expect(latestStable([])).toBeNull();
    expect(latestStable({ message: "Not Found" })).toBeNull();
    expect(latestStable(null)).toBeNull();
    expect(latestStable([null, 7, "x"])).toBeNull();
  });
});

describe("judge", () => {
  it("is ok when the site already names the newest stable release", () => {
    const v = judge([rel("v3.42.0", "2026-10-27T20:34:26Z"), rel("v3.43.0-beta.1", "2026-10-28T00:00:00Z", { prerelease: true })], CLAIMED);
    expect(v).toMatchObject({ status: "ok", dateMatches: true });
  });

  it("calls the site stale when a newer stable release exists", () => {
    const v = judge([rel("v3.43.0", "2026-11-03T08:00:00Z"), rel("v3.42.0", "2026-10-27T20:34:26Z")], CLAIMED);
    expect(v).toMatchObject({ status: "stale", latest: { version: "3.43.0" } });
  });

  it("is not stale when the site is ahead of what GitHub lists", () => {
    expect(judge([rel("v3.41.0", "2026-10-21T12:06:55Z")], CLAIMED).status).toBe("ok");
  });

  it("flags a wrong date for the claimed version without failing", () => {
    const v = judge([rel("v3.42.0", "2026-10-27T20:34:26Z")], { version: "3.42.0", date: "2026-10-15" });
    expect(v).toMatchObject({ status: "ok", dateMatches: false });
  });

  it("reports when there is nothing to compare", () => {
    expect(judge([rel("v3.43.0-beta.1", "2026-10-28T00:00:00Z", { prerelease: true })], CLAIMED)).toEqual({ status: "no-stable-release" });
  });
});

describe("parseClaimed", () => {
  it("reads the claimed release from facts.ts source", () => {
    expect(parseClaimed('x: 1,\n  stableRelease: { version: "3.42.0", date: "2026-10-27" },\n')).toEqual(CLAIMED);
  });

  it("throws when the shape changes, so the check cannot silently pass", () => {
    expect(() => parseClaimed("export const FACTS = {}")).toThrow(/stableRelease/);
  });

  it("matches the real FACTS", () => {
    const source = readFileSync(new URL("../src/content/facts.ts", import.meta.url), "utf8");
    expect(parseClaimed(source)).toEqual({ version: FACTS.stableRelease.version, date: FACTS.stableRelease.date });
  });
});
