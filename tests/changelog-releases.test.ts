import { describe, expect, it } from "vitest";
import {
  changelogHref,
  channelOf,
  compareTags,
  displayName,
  groupReleases,
  minorOf,
  pageOfGroups,
  parseChannel,
  type ReleaseMeta,
} from "../src/lib/server/seo/changelog/release-groups";
import { renderReleaseNotes, safeHref } from "../src/lib/server/seo/changelog/release-markdown";
import { atomFeed } from "../src/lib/server/seo/changelog/changelog-atom-feed";
import { newestStable } from "../src/lib/server/seo/changelog/changelog-view";
import { CHANGELOG, fill, plural } from "../src/content/pages/changelog";

const rel = (tag: string, publishedAt = "2026-09-01T00:00:00Z"): ReleaseMeta => ({
  tag,
  name: tag,
  channel: channelOf(tag, false),
  publishedAt,
});

describe("release ordering", () => {
  it("sorts tags by semver precedence, not by string or date", () => {
    const tags = ["v3.9.0", "v3.10.0-beta.2", "v3.10.0", "v3.10.0-beta.10", "v3.10.1-beta.1", "v3.9.1", "not-a-tag"];
    expect([...tags].sort(compareTags)).toEqual(["not-a-tag", "v3.9.0", "v3.9.1", "v3.10.0-beta.2", "v3.10.0-beta.10", "v3.10.0", "v3.10.1-beta.1"]);
  });

  it("derives the minor version and the channel from the tag", () => {
    expect(minorOf("v3.34.0-beta.4")).toBe("3.34");
    expect(minorOf("latest")).toBeNull();
    expect(channelOf("v3.34.0-beta.4", false)).toBe("beta");
    expect(channelOf("v3.34.0-rc.1", false)).toBe("beta");
    expect(channelOf("v3.34.0", true)).toBe("beta");
    expect(channelOf("v3.34.0", false)).toBe("stable");
  });

  it("accepts only known channels, defaulting to stable", () => {
    expect(parseChannel("beta")).toBe("beta");
    expect(parseChannel("all")).toBe("all");
    expect(parseChannel("nightly")).toBe("stable");
    expect(parseChannel(null)).toBe("stable");
  });
});

describe("groupReleases", () => {
  const releases = [rel("v3.9.0"), rel("v3.10.0-beta.1"), rel("v3.10.0"), rel("v3.10.1"), rel("v3.11.0-beta.2"), rel("v3.11.0-beta.10")];

  it("groups by minor, newest first, with betas folded under the stable releases", () => {
    const all = groupReleases(releases, "all");
    expect(all.map((g) => g.minor)).toEqual(["3.11", "3.10", "3.9"]);
    expect(all[1].stables.map((r) => r.tag)).toEqual(["v3.10.1", "v3.10.0"]);
    expect(all[1].betas.map((r) => r.tag)).toEqual(["v3.10.0-beta.1"]);
    expect(all[0].betas.map((r) => r.tag)).toEqual(["v3.11.0-beta.10", "v3.11.0-beta.2"]);
  });

  it("filters by channel and leaves out groups with nothing to show", () => {
    expect(groupReleases(releases, "stable").map((g) => g.minor)).toEqual(["3.10", "3.9"]);
    expect(groupReleases(releases, "stable").every((g) => g.betas.length === 0)).toBe(true);
    expect(groupReleases(releases, "beta").map((g) => g.minor)).toEqual(["3.11", "3.10"]);
  });

  it("names the newest stable release as latest", () => {
    expect(newestStable(releases)).toBe("v3.10.1");
    expect(newestStable([rel("v1.0.0-beta.1")])).toBeUndefined();
  });
});

describe("pageOfGroups", () => {
  const groups = ["3.14", "3.13", "3.12", "3.11", "3.10"].map((minor) => ({ minor, stables: [], betas: [] }));

  it("pages by minor-version cursor", () => {
    expect(pageOfGroups(groups, null, 2)).toMatchObject({ newer: null, older: "3.12" });
    const second = pageOfGroups(groups, "3.12", 2);
    expect(second.groups.map((g) => g.minor)).toEqual(["3.12", "3.11"]);
    expect(second).toMatchObject({ newer: "3.14", older: "3.10" });
    expect(pageOfGroups(groups, "3.10", 2)).toMatchObject({ newer: "3.12", older: null });
  });

  it("lands an unknown or stale cursor on the next older group and ignores junk", () => {
    expect(pageOfGroups(groups, "3.125", 2).groups[0].minor).toBe("3.14");
    expect(pageOfGroups(groups, "3.99", 2).groups[0].minor).toBe("3.14");
    expect(pageOfGroups(groups, "3.0", 2).groups).toEqual([]);
    expect(pageOfGroups(groups, "<script>", 2).groups[0].minor).toBe("3.14");
  });
});

describe("changelog links and names", () => {
  it("builds permalinks with only the query they need", () => {
    expect(changelogHref("/changelog", "stable")).toBe("/changelog");
    expect(changelogHref("/vi/changelog", "beta", "3.33", "v3.33.0-beta.1")).toBe("/vi/changelog?channel=beta&from=3.33#v3.33.0-beta.1");
    expect(changelogHref("/changelog", "stable", "3.33", "v3.33.0")).toBe("/changelog?from=3.33#v3.33.0");
  });

  it("hides names that only repeat the tag", () => {
    expect(displayName("v3.33.0", "v3.33.0")).toBeUndefined();
    expect(displayName("dewee v3.33.0", "v3.33.0")).toBeUndefined();
    expect(displayName(" Spring release ", "v3.33.0")).toBe("Spring release");
  });

  it("pluralises and fills the page copy", () => {
    expect(plural(CHANGELOG.en.release.count, 1)).toBe(fill(CHANGELOG.en.release.count.one, { n: 1 }));
    expect(plural(CHANGELOG.en.release.betas, 3, { minor: "3.33" })).toContain("3");
    expect(plural(CHANGELOG.en.release.betas, 3, { minor: "3.33" })).toContain("v3.33");
    expect(fill("{a} and {b}", { a: 1 })).toBe("1 and {b}");
  });
});

describe("renderReleaseNotes", () => {
  it("renders Markdown with headings demoted under the release heading", () => {
    const html = renderReleaseNotes("## Features\n- **Fast** boot\n\n# Big");
    expect(html).toContain("<h4>Features</h4>");
    expect(html).toContain("<h4>Big</h4>");
    expect(html).toContain("<li><strong>Fast</strong> boot</li>");
    expect(renderReleaseNotes("###### Deep")).toContain("<h6>Deep</h6>");
    expect(renderReleaseNotes("   ")).toBe("");
  });

  it("shows raw HTML as text and drops unsafe links and images", () => {
    const html = renderReleaseNotes('<script>alert(1)</script>\n\n[x](javascript:alert(1)) ![pic](https://evil.example/p.png) <img src=x onerror=alert(1)>');
    expect(html).not.toMatch(/<script|<img|javascript:|onerror=alert\(1\)>/);
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("pic");
  });

  it("marks external links nofollow and keeps site links plain", () => {
    expect(renderReleaseNotes("[docs](https://dewee.sh/docs)")).toContain('<a href="https://dewee.sh/docs" rel="nofollow noopener">docs</a>');
    expect(renderReleaseNotes("[pricing](/pricing)")).toContain('<a href="/pricing">pricing</a>');
  });

  it("allows only http(s), mailto, paths and fragments", () => {
    expect(safeHref("mailto:hi@nextlevelbuilder.io")).toBe("mailto:hi@nextlevelbuilder.io");
    expect(safeHref("#v1")).toBe("#v1");
    expect(safeHref("//evil.example")).toBeNull();
    expect(safeHref("data:text/html,x")).toBeNull();
    expect(safeHref("")).toBeNull();
  });
});

describe("atomFeed", () => {
  const xml = atomFeed({
    siteUrl: "https://staging.dewee.sh/",
    title: "dewee stable releases",
    subtitle: "Newest first & safe",
    feedPath: "/changelog/feed.xml",
    changelogPath: "/changelog",
    entries: [
      { ...rel("v3.33.0", "2026-09-20T08:30:00.000Z"), name: "Spring <release>", html: "<p>Hi &amp; bye</p>" },
      { ...rel("v3.32.1", "2026-09-01T00:00:00Z"), html: "" },
    ],
  });

  it("is a well-formed Atom document with stable ids and permalinks", () => {
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<feed xmlns="http://www.w3.org/2005/Atom"')).toBe(true);
    expect(xml).toContain("<updated>2026-09-20T08:30:00Z</updated>");
    expect(xml).toContain("<id>tag:dewee.sh,2026:changelog/v3.33.0</id>");
    expect(xml).toContain('href="https://staging.dewee.sh/changelog?from=3.33#v3.33.0"');
    expect(xml).toContain('<link rel="self" type="application/atom+xml" href="https://staging.dewee.sh/changelog/feed.xml"/>');
    expect(xml.match(/<entry>/g)).toHaveLength(2);
  });

  it("escapes titles and HTML content", () => {
    expect(xml).toContain("<title>v3.33.0: Spring &lt;release&gt;</title>");
    expect(xml).toContain("<title>v3.32.1</title>");
    expect(xml).toContain("<subtitle>Newest first &amp; safe</subtitle>");
    expect(xml).toContain('<content type="html">&lt;p&gt;Hi &amp;amp; bye&lt;/p&gt;</content>');
  });

  it("still validates with no entries", () => {
    const empty = atomFeed({ siteUrl: "https://dewee.sh", title: "t", subtitle: "s", feedPath: "/f", changelogPath: "/c", entries: [] });
    expect(empty).toContain("<updated>1970-01-01T00:00:00Z</updated>");
    expect(empty).not.toContain("<entry>");
  });
});
