/**
 * Hourly cron: pull releases of the (private) dewee repo from GitHub into D1 `releases`.
 * Requires a read-only GITHUB_TOKEN secret; without it the snapshot seeded at deploy time stays.
 */
export async function syncChangelog(env: Env): Promise<{ synced: number }> {
  if (!env.GITHUB_TOKEN) return { synced: 0 };
  const res = await fetch(`https://api.github.com/repos/${env.CHANGELOG_REPO}/releases?per_page=50`, {
    headers: {
      authorization: `Bearer ${env.GITHUB_TOKEN}`,
      accept: "application/vnd.github+json",
      "user-agent": "dewee.sh-changelog-sync",
      "x-github-api-version": "2022-11-28",
    },
  });
  if (!res.ok) throw new Error(`GitHub releases ${res.status}`);
  const releases = (await res.json()) as Array<{ tag_name: string; name: string | null; prerelease: boolean; draft: boolean; published_at: string | null; body: string | null; html_url: string }>;
  const now = new Date().toISOString();
  const stmts = releases
    .filter((r) => !r.draft && r.published_at)
    .map((r) =>
      env.DB.prepare(
        `INSERT INTO releases (tag, name, channel, published_at, body, url, synced_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
         ON CONFLICT(tag) DO UPDATE SET name = excluded.name, channel = excluded.channel, published_at = excluded.published_at, body = excluded.body, url = excluded.url, synced_at = excluded.synced_at`,
      ).bind(r.tag_name, r.name ?? r.tag_name, r.prerelease || /-(beta|rc|alpha)/i.test(r.tag_name) ? "beta" : "stable", r.published_at, r.body ?? "", r.html_url, now),
    );
  if (stmts.length) await env.DB.batch(stmts);
  return { synced: stmts.length };
}
