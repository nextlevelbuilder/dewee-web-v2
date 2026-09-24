/**
 * RSS 2.0 feeds of the latest published posts: /blog/rss.xml (English) and /vi/blog/rss.xml.
 * Each item carries the description and the full post as safe HTML (the same renderer as the
 * post page), so readers show the whole article without loading the site.
 */
import type { APIRoute } from "astro";
import { localePath, pick } from "~/i18n/config";
import { BLOG } from "~/content/pages/blog";
import { SITE } from "~/content/site";
import { renderMarkdown } from "~/lib/blocks/safe-markdown";
import { platformEnv } from "~/lib/server/api/platform-env";
import { listPublishedPosts } from "~/lib/server/pages/page-queries";

export const prerender = false;

const FEED_SIZE = 20;

/** XML text escaping for element content and attribute values. */
function xml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

/** CDATA cannot contain "]]>"; split it across two sections. */
function cdata(text: string): string {
  return `<![CDATA[${text.replace(/]]>/g, "]]]]><![CDATA[>")}]]>`;
}

/** Feed readers have no base URL: make site-relative links and images absolute. */
function absoluteLinks(html: string): string {
  return html.replace(/\b(href|src)="\/(?!\/)/g, `$1="${SITE.url}/`);
}

export const GET: APIRoute = async ({ params }) => {
  const { lang } = params;
  if (lang !== undefined && lang !== "vi") return new Response("Not found", { status: 404 });
  const locale = lang === "vi" ? "vi" : "en";

  let posts;
  try {
    ({ posts } = await listPublishedPosts(platformEnv().DB, locale, { limit: FEED_SIZE }));
  } catch (err) {
    console.error("blog rss: query failed", err instanceof Error ? err.message : err);
    return new Response("Feed temporarily unavailable", { status: 503, headers: { "retry-after": "30" } });
  }

  const abs = (p: string) => new URL(localePath(locale, p), SITE.url).href;
  const feedUrl = abs("/blog/rss.xml");
  const newest = posts[0]?.published_at ?? posts[0]?.created_at;
  const items = posts.map((post) => {
    const link = abs(`/blog/${post.slug}`);
    const date = new Date(post.published_at ?? post.created_at).toUTCString();
    return [
      "    <item>",
      `      <title>${xml(post.title)}</title>`,
      `      <link>${xml(link)}</link>`,
      `      <guid isPermaLink="false">${xml(post.id)}</guid>`,
      `      <pubDate>${date}</pubDate>`,
      post.description ? `      <description>${xml(post.description)}</description>` : "",
      `      <content:encoded>${cdata(absoluteLinks(renderMarkdown(post.body_md ?? "")))}</content:encoded>`,
      ...post.tags.map((tag) => `      <category>${xml(tag)}</category>`),
      "    </item>",
    ]
      .filter(Boolean)
      .join("\n");
  });

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">',
    "  <channel>",
    `    <title>${xml(pick(BLOG.rss.title, locale))}</title>`,
    `    <link>${xml(abs("/blog"))}</link>`,
    `    <description>${xml(pick(BLOG.meta.description, locale))}</description>`,
    `    <language>${locale === "vi" ? "vi-VN" : "en"}</language>`,
    `    <atom:link href="${xml(feedUrl)}" rel="self" type="application/rss+xml" />`,
    newest ? `    <lastBuildDate>${new Date(newest).toUTCString()}</lastBuildDate>` : "",
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ]
    .filter((line) => line !== "")
    .join("\n");

  return new Response(`${body}\n`, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
    },
  });
};
