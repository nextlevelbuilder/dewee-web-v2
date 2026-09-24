/**
 * GET /changelog/feed.xml: Atom feed of the latest stable releases, notes rendered to safe HTML.
 * Linked from /changelog (and its <head>); betas stay on the page, not in readers' inboxes.
 */
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { CHANGELOG } from "~/content/pages/changelog";
import { atomFeed } from "~/lib/server/seo/changelog/changelog-atom-feed";
import { renderReleaseNotes } from "~/lib/server/seo/changelog/release-markdown";
import { sanitiseReleaseName, sanitiseReleaseNotes } from "~/lib/server/seo/changelog/release-notes-sanitiser";
import { latestStableReleases } from "~/lib/server/seo/changelog/release-store";
import { ATOM, discoveryResponse, siteOrigin } from "~/lib/server/seo/discovery-response";

export const prerender = false;

const FEED_ENTRIES = 30;

export const GET: APIRoute = async ({ url }) => {
  try {
    const releases = await latestStableReleases(env.DB, FEED_ENTRIES);
    const copy = CHANGELOG.en.feed;
    const xml = atomFeed({
      siteUrl: siteOrigin(env, url),
      title: copy.title,
      subtitle: copy.subtitle,
      feedPath: "/changelog/feed.xml",
      changelogPath: "/changelog",
      entries: releases.map((r) => ({
        ...r,
        name: sanitiseReleaseName(r.name, r.tag, env.CHANGELOG_REPO),
        html: renderReleaseNotes(sanitiseReleaseNotes(r.body, { repo: env.CHANGELOG_REPO, tag: r.tag })),
      })),
    });
    return discoveryResponse(xml, ATOM);
  } catch (err) {
    console.error("changelog feed failed", err instanceof Error ? err.message : err);
    return new Response("Feed temporarily unavailable", { status: 503, headers: { "retry-after": "60", "content-type": "text/plain; charset=utf-8" } });
  }
};
