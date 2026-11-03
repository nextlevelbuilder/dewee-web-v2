/**
 * Pure helpers for scripts/check-stable-release.ts: pick the newest stable release out of a GitHub
 * releases response and compare it with the version the site claims. No network and no file access
 * here, so tests/stable-release-check.test.ts can cover every branch.
 */

export type GithubRelease = { tag_name?: unknown; draft?: unknown; prerelease?: unknown; published_at?: unknown };
export type StableRelease = { version: string; publishedAt: string };
export type Claimed = { version: string; date: string };

export type Verdict =
  | { status: "ok"; latest: StableRelease; dateMatches: boolean }
  | { status: "stale"; latest: StableRelease }
  | { status: "no-stable-release" };

const STABLE_TAG = /^v?(\d+)\.(\d+)\.(\d+)$/;

/** Numeric [major, minor, patch] of a plain `x.y.z` version, or null for anything else. */
export function parseVersion(version: string): [number, number, number] | null {
  const m = STABLE_TAG.exec(version.trim());
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

/** Negative when a is older than b, positive when newer, 0 when equal. Both must be `x.y.z`. */
export function compareVersions(a: string, b: string): number {
  const pa = parseVersion(a);
  const pb = parseVersion(b);
  if (!pa || !pb) throw new Error(`Cannot compare "${a}" with "${b}": expected x.y.z versions`);
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] - pb[i];
  return 0;
}

/**
 * The newest stable release by version number. Drafts, prereleases (flagged or tagged `-beta.1`
 * and the like) and releases without a valid `published_at` are skipped. The ordering is by
 * version, and `published_at` is only reported: a commit or tag date says nothing about when users
 * could first install a release.
 */
export function latestStable(releases: unknown): StableRelease | null {
  if (!Array.isArray(releases)) return null;
  let best: StableRelease | null = null;
  for (const r of releases as GithubRelease[]) {
    if (!r || typeof r !== "object") continue;
    if (r.draft !== false || r.prerelease !== false) continue;
    if (typeof r.tag_name !== "string" || typeof r.published_at !== "string") continue;
    if (Number.isNaN(Date.parse(r.published_at))) continue;
    const version = r.tag_name.replace(/^v/, "");
    if (!parseVersion(version)) continue;
    if (!best || compareVersions(version, best.version) > 0) best = { version, publishedAt: r.published_at };
  }
  return best;
}

/** Compare what GitHub says with what the site claims. Stale means GitHub has a newer stable. */
export function judge(releases: unknown, claimed: Claimed): Verdict {
  const latest = latestStable(releases);
  if (!latest) return { status: "no-stable-release" };
  if (compareVersions(latest.version, claimed.version) > 0) return { status: "stale", latest };
  return { status: "ok", latest, dateMatches: latest.version !== claimed.version || latest.publishedAt.slice(0, 10) === claimed.date };
}

/** Reads `stableRelease: { version: "x.y.z", date: "YYYY-MM-DD" }` out of src/content/facts.ts source text. */
export function parseClaimed(factsSource: string): Claimed {
  const m = /stableRelease:\s*\{\s*version:\s*"(\d+\.\d+\.\d+)"\s*,\s*date:\s*"(\d{4}-\d{2}-\d{2})"\s*\}/.exec(factsSource);
  if (!m) throw new Error("Could not find stableRelease { version, date } in src/content/facts.ts");
  return { version: m[1], date: m[2] };
}
