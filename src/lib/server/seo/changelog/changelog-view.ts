/**
 * View model for /changelog: the requested channel and page of minor-version groups, each release
 * with rendered notes and a permalink. Metadata for all releases drives grouping; notes are loaded
 * only for what is on screen and sanitised again at render time (rows synced before the sanitiser
 * existed stay safe).
 */
import { sanitiseReleaseName, sanitiseReleaseNotes } from "./release-notes-sanitiser.ts";
import { renderReleaseNotes } from "./release-markdown.ts";
import { changelogHref, compareTags, displayName, groupReleases, pageOfGroups, type Channel, type ChannelFilter, type ReleaseMeta } from "./release-groups.ts";
import { listReleaseMeta, releaseBodies } from "./release-store.ts";

export const GROUPS_PER_PAGE = 5;

export type ReleaseView = {
  tag: string;
  /** Only when it says more than the tag */
  name?: string;
  channel: Channel;
  publishedAt: string;
  html: string;
  permalink: string;
  latest: boolean;
};
export type GroupView = { minor: string; stables: ReleaseView[]; betas: ReleaseView[] };
export type ChangelogView = {
  channel: ChannelFilter;
  groups: GroupView[];
  newer: string | null;
  older: string | null;
  counts: { stable: number; beta: number };
};

export function newestStable(releases: ReleaseMeta[]): string | undefined {
  return releases.filter((r) => r.channel === "stable").sort((a, b) => compareTags(b.tag, a.tag))[0]?.tag;
}

export async function loadChangelog(
  db: D1Database,
  opts: { channel: ChannelFilter; from: string | null; repo: string; basePath: string },
): Promise<ChangelogView> {
  const all = await listReleaseMeta(db);
  const counts = {
    stable: all.filter((r) => r.channel === "stable").length,
    beta: all.filter((r) => r.channel === "beta").length,
  };
  const page = pageOfGroups(groupReleases(all, opts.channel), opts.from, GROUPS_PER_PAGE);
  const onScreen = page.groups.flatMap((g) => [...g.stables, ...g.betas]);
  const bodies = await releaseBodies(db, onScreen.map((r) => r.tag));
  const latest = newestStable(all);

  const view = (minor: string) => (r: ReleaseMeta): ReleaseView => ({
    tag: r.tag,
    name: displayName(sanitiseReleaseName(r.name, r.tag, opts.repo), r.tag),
    channel: r.channel,
    publishedAt: r.publishedAt,
    html: renderReleaseNotes(sanitiseReleaseNotes(bodies.get(r.tag) ?? "", { repo: opts.repo, tag: r.tag })),
    permalink: changelogHref(opts.basePath, opts.channel, minor, r.tag),
    latest: r.tag === latest,
  });

  return {
    channel: opts.channel,
    groups: page.groups.map((g) => ({ minor: g.minor, stables: g.stables.map(view(g.minor)), betas: g.betas.map(view(g.minor)) })),
    newer: page.newer,
    older: page.older,
    counts,
  };
}
