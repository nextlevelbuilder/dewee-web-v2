/**
 * GET /sitemap-dynamic.xml: server-rendered pages from D1 (published posts at /blog/<slug>,
 * page-builder pages at /p/<slug>, the blog index once posts exist) and the changelog.
 */
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { loadDiscovery } from "~/lib/server/seo/discovery-sources";
import { discoveryResponse, siteOrigin, XML } from "~/lib/server/seo/discovery-response";
import { toSitemapUrls, urlsetXml } from "~/lib/server/seo/sitemap-xml";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const { dynamicPages } = await loadDiscovery(env);
  return discoveryResponse(urlsetXml(siteOrigin(env, url), toSitemapUrls(dynamicPages)), XML);
};
