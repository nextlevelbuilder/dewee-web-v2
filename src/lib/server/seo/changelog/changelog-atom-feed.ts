/**
 * Atom 1.0 feed of stable releases (pure). Entry ids are tag URIs on dewee.sh so they never change
 * between environments or when the page's pagination moves; links point at the release's anchor
 * on the changelog page.
 */
import { xmlEscape, w3cDate } from "../sitemap-xml.ts";
import { changelogHref, displayName, minorOf, type ReleaseMeta } from "./release-groups.ts";

export type FeedEntry = ReleaseMeta & { html: string };

export function atomFeed(opts: {
  siteUrl: string;
  title: string;
  subtitle: string;
  feedPath: string;
  changelogPath: string;
  entries: FeedEntry[];
}): string {
  const site = opts.siteUrl.replace(/\/$/, "");
  const updated = w3cDate(opts.entries[0]?.publishedAt) ?? "1970-01-01T00:00:00Z";
  const entries = opts.entries.map((e) => {
    const at = w3cDate(e.publishedAt) ?? updated;
    const name = displayName(e.name, e.tag);
    const title = name ? `${e.tag}: ${name}` : e.tag;
    return [
      "  <entry>",
      `    <id>tag:dewee.sh,2026:changelog/${xmlEscape(e.tag)}</id>`,
      `    <title>${xmlEscape(title)}</title>`,
      `    <link rel="alternate" type="text/html" href="${xmlEscape(site + changelogHref(opts.changelogPath, e.channel, minorOf(e.tag), e.tag))}"/>`,
      `    <published>${at}</published>`,
      `    <updated>${at}</updated>`,
      `    <content type="html">${xmlEscape(e.html)}</content>`,
      "  </entry>",
    ].join("\n");
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom" xml:lang="en">',
    `  <id>tag:dewee.sh,2026:changelog</id>`,
    `  <title>${xmlEscape(opts.title)}</title>`,
    `  <subtitle>${xmlEscape(opts.subtitle)}</subtitle>`,
    `  <link rel="self" type="application/atom+xml" href="${xmlEscape(site + opts.feedPath)}"/>`,
    `  <link rel="alternate" type="text/html" href="${xmlEscape(site + opts.changelogPath)}"/>`,
    `  <updated>${updated}</updated>`,
    "  <author><name>NextLevelBuilder</name><uri>https://nextlevelbuilder.io</uri></author>",
    `  <icon>${xmlEscape(`${site}/brand/dewee-icon-144.png`)}</icon>`,
    ...entries,
    "</feed>",
    "",
  ].join("\n");
}
