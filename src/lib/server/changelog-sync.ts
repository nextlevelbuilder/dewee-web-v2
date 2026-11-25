/**
 * Hourly cron: pull the latest releases of the (private) dewee repo from GitHub into D1 `releases`.
 * Requires a read-only GITHUB_TOKEN secret; without it every run throws so the cron logs the failure.
 * Notes are sanitised with the same rules as the seed (scripts/snapshot-releases.ts) before they
 * are stored, and no github.com URL is kept: the repository is private.
 */
import { sanitiseReleaseName, sanitiseReleaseNotes } from "./seo/changelog/release-notes-sanitiser";
import { channelOf, parseTag } from "./seo/changelog/release-groups";

type GithubRelease = { tag_name: string; name: string | null; prerelease: boolean; draft: boolean; published_at: string | null; body: string | null };

/** Releases per GitHub page. */
const PER_PAGE = 100;
/** Pages per run (1,000 releases). Every run walks all pages so a gap left by an outage is filled;
 * the newest page is always rewritten (notes get edited), older pages only add missing tags. */
const MAX_PAGES = 10;

function isRelease(value: unknown): value is GithubRelease {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return typeof r.tag_name === "string" && typeof r.prerelease === "boolean" && typeof r.draft === "boolean";
}

export async function syncChangelog(env: Env): Promise<{ synced: number }> {
  // Throw rather than skip: a missing token once left /changelog frozen on the seed for weeks unnoticed.
  if (!env.GITHUB_TOKEN) throw new Error("GITHUB_TOKEN is not set; changelog sync cannot read releases");
  const repo = env.CHANGELOG_REPO;
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo ?? "")) throw new Error("CHANGELOG_REPO must be owner/name");
  const known = new Set(
    ((await env.DB.prepare("SELECT tag FROM releases").all<{ tag: string }>()).results ?? []).map((r) => r.tag),
  );
  const payload: GithubRelease[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const batch = await fetchReleasePage(repo, env.GITHUB_TOKEN, page);
    payload.push(...(page === 1 ? batch : batch.filter((r) => !known.has(r.tag_name))));
    if (batch.length < PER_PAGE) break;
  }
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

async function fetchReleasePage(repo: string, token: string, page: number): Promise<GithubRelease[]> {
  const res = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=${PER_PAGE}&page=${page}`, {
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "user-agent": "dewee.sh-changelog-sync",
      "x-github-api-version": "2022-11-28",
    },
  });
  if (!res.ok) throw new Error(`GitHub releases ${res.status}`);
  const payload: unknown = await res.json();
  if (!Array.isArray(payload)) throw new Error("GitHub releases: unexpected response");
  return payload.filter(isRelease);
}
