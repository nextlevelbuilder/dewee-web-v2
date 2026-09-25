/**
 * Hourly cron: pull the latest releases of the (private) dewee repo from GitHub into D1 `releases`.
 * Requires a read-only GITHUB_TOKEN secret; without it the snapshot seeded by migrations stays.
 * Notes are sanitised with the same rules as the seed (scripts/snapshot-releases.ts) before they
 * are stored, and no github.com URL is kept: the repository is private.
 */
import { sanitiseReleaseName, sanitiseReleaseNotes } from "./seo/changelog/release-notes-sanitiser";
import { channelOf, parseTag } from "./seo/changelog/release-groups";

type GithubRelease = { tag_name: string; name: string | null; prerelease: boolean; draft: boolean; published_at: string | null; body: string | null };

/** Newest releases per run; bursts rarely exceed a few dozen an hour. */
const PER_PAGE = 100;

function isRelease(value: unknown): value is GithubRelease {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return typeof r.tag_name === "string" && typeof r.prerelease === "boolean" && typeof r.draft === "boolean";
}

export async function syncChangelog(env: Env): Promise<{ synced: number }> {
  if (!env.GITHUB_TOKEN) return { synced: 0 };
  const repo = env.CHANGELOG_REPO;
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo ?? "")) throw new Error("CHANGELOG_REPO must be owner/name");
  const res = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=${PER_PAGE}`, {
    headers: {
      authorization: `Bearer ${env.GITHUB_TOKEN}`,
      accept: "application/vnd.github+json",
      "user-agent": "dewee.sh-changelog-sync",
      "x-github-api-version": "2022-11-28",
    },
  });
  if (!res.ok) throw new Error(`GitHub releases ${res.status}`);
  const payload: unknown = await res.json();
  if (!Array.isArray(payload)) throw new Error("GitHub releases: unexpected response");
  const now = new Date().toISOString();
  const stmts = payload
    .filter(isRelease)
    .filter((r) => !r.draft && r.published_at && !Number.isNaN(Date.parse(r.published_at)) && parseTag(r.tag_name))
    .map((r) =>
      env.DB.prepare(
        `INSERT INTO releases (tag, name, channel, published_at, body, url, synced_at) VALUES (?1, ?2, ?3, ?4, ?5, NULL, ?6)
         ON CONFLICT(tag) DO UPDATE SET name = excluded.name, channel = excluded.channel, published_at = excluded.published_at, body = excluded.body, url = NULL, synced_at = excluded.synced_at`,
      ).bind(
        r.tag_name,
        sanitiseReleaseName(r.name, r.tag_name, repo),
        channelOf(r.tag_name, r.prerelease),
        r.published_at,
        sanitiseReleaseNotes(r.body, { repo, tag: r.tag_name }),
        now,
      ),
    );
  if (stmts.length) await env.DB.batch(stmts);
  return { synced: stmts.length };
}
