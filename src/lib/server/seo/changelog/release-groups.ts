/**
 * Changelog ordering and grouping (pure). Tags are `vX.Y.Z` (stable) or `vX.Y.Z-beta.N`; GitHub's
 * list order is by creation, not by version, so everything is sorted by semver precedence here.
 * Releases are grouped by minor version (`3.33`), newest first; a group's betas fold under its
 * stable releases on the "all" channel.
 */

export type Channel = "stable" | "beta";
export type ChannelFilter = Channel | "all";
export const CHANNEL_FILTERS: readonly ChannelFilter[] = ["stable", "beta", "all"];
export const DEFAULT_CHANNEL: ChannelFilter = "stable";

export type ReleaseMeta = { tag: string; name: string; channel: Channel; publishedAt: string };

export type ReleaseGroup = {
  /** `3.33` */
  minor: string;
  /** Stable releases, newest first */
  stables: ReleaseMeta[];
  /** Pre-releases, newest first */
  betas: ReleaseMeta[];
};

type SemVer = { major: number; minor: number; patch: number; pre: Array<string | number> };

const TAG_RE = /^v?(\d{1,6})\.(\d{1,6})\.(\d{1,6})(?:-([0-9A-Za-z.-]{1,40}))?$/;

export function parseTag(tag: string): SemVer | null {
  const m = TAG_RE.exec(tag.trim());
  if (!m) return null;
  const pre = m[4] ? m[4].split(".").map((p) => (/^\d+$/.test(p) ? Number(p) : p)) : [];
  return { major: Number(m[1]), minor: Number(m[2]), patch: Number(m[3]), pre };
}

/** Semver precedence: negative when `a` is older than `b`. Unparseable tags count as older than any version (last in newest-first lists). */
export function compareTags(a: string, b: string): number {
  const x = parseTag(a);
  const y = parseTag(b);
  if (!x || !y) return x ? 1 : y ? -1 : a.localeCompare(b);
  for (const k of ["major", "minor", "patch"] as const) if (x[k] !== y[k]) return x[k] - y[k];
  if (!x.pre.length || !y.pre.length) return y.pre.length - x.pre.length;
  for (let i = 0; i < Math.max(x.pre.length, y.pre.length); i++) {
    const p = x.pre[i];
    const q = y.pre[i];
    if (p === undefined) return -1;
    if (q === undefined) return 1;
    if (p === q) continue;
    if (typeof p === "number" && typeof q === "number") return p - q;
    if (typeof p === "number") return -1;
    if (typeof q === "number") return 1;
    return p < q ? -1 : 1;
  }
  return 0;
}

export function minorOf(tag: string): string | null {
  const v = parseTag(tag);
  return v ? `${v.major}.${v.minor}` : null;
}

/** Pre-release tags are beta whatever GitHub's flag says, and a flagged release is never shown as stable. */
export function channelOf(tag: string, prerelease: boolean): Channel {
  return prerelease || /-(?:alpha|beta|rc|pre|preview|canary|next)\b/i.test(tag) ? "beta" : "stable";
}

export function parseChannel(value: string | null | undefined): ChannelFilter {
  return (CHANNEL_FILTERS as readonly string[]).includes(value ?? "") ? (value as ChannelFilter) : DEFAULT_CHANNEL;
}

/** Newest-first groups for a channel; groups with nothing to show on that channel are left out. */
export function groupReleases(releases: ReleaseMeta[], channel: ChannelFilter): ReleaseGroup[] {
  const byMinor = new Map<string, ReleaseGroup>();
  for (const r of releases) {
    const minor = minorOf(r.tag);
    if (!minor) continue;
    const g = byMinor.get(minor) ?? { minor, stables: [], betas: [] };
    (r.channel === "stable" ? g.stables : g.betas).push(r);
    byMinor.set(minor, g);
  }
  const newestFirst = (a: ReleaseMeta, b: ReleaseMeta) => compareTags(b.tag, a.tag);
  const groups = [...byMinor.values()]
    .map((g) => ({
      minor: g.minor,
      stables: channel === "beta" ? [] : g.stables.sort(newestFirst),
      betas: channel === "stable" ? [] : g.betas.sort(newestFirst),
    }))
    .filter((g) => g.stables.length + g.betas.length > 0);
  return groups.sort((a, b) => compareTags(`${b.minor}.0`, `${a.minor}.0`));
}

export type GroupPage = { groups: ReleaseGroup[]; newer: string | null; older: string | null };

const MINOR_RE = /^\d{1,6}\.\d{1,6}$/;

/**
 * Cursor pagination by minor version: `from` is the newest minor on the page, so a permalink keeps
 * working as new releases arrive. An unknown `from` lands on the first group older than it.
 */
export function pageOfGroups(groups: ReleaseGroup[], from: string | null | undefined, perPage: number): GroupPage {
  let start = 0;
  if (from && MINOR_RE.test(from)) {
    const idx = groups.findIndex((g) => compareTags(`${g.minor}.0`, `${from}.0`) <= 0);
    start = idx === -1 ? groups.length : idx;
  }
  const slice = groups.slice(start, start + perPage);
  return {
    groups: slice,
    newer: start > 0 ? groups[Math.max(0, start - perPage)].minor : null,
    older: start + perPage < groups.length ? groups[start + perPage].minor : null,
  };
}

/** `/changelog?channel=beta&from=3.33`; the default channel and the first page need no query. */
export function changelogHref(basePath: string, channel: ChannelFilter, from?: string | null, hash?: string): string {
  const params = new URLSearchParams();
  if (channel !== "stable") params.set("channel", channel);
  if (from) params.set("from", from);
  const query = params.toString();
  return `${basePath}${query ? `?${query}` : ""}${hash ? `#${encodeURIComponent(hash)}` : ""}`;
}

/** A release name worth showing: not empty and not just the tag again ("dewee v3.33.0"). */
export function displayName(name: string, tag: string): string | undefined {
  const clean = name.trim();
  if (!clean || clean === tag || clean.toLowerCase() === `dewee ${tag}`.toLowerCase()) return undefined;
  return clean;
}
