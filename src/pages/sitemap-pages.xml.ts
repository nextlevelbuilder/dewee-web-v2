/**
 * GET /sitemap-pages.xml: every indexable prerendered page from the build manifest, with
 * en/vi/x-default alternates when both language versions are listed.
 */
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { loadDiscovery } from "~/lib/server/seo/discovery-sources";
import { discoveryResponse, siteOrigin, XML } from "~/lib/server/seo/discovery-response";
import { toSitemapUrls, urlsetXml } from "~/lib/server/seo/sitemap-xml";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const { manifest, staticPages } = await loadDiscovery(env);
  // Without the manifest an empty sitemap would tell crawlers the site has no pages; ask them to retry.
  if (!manifest) {
    return new Response("Sitemap temporarily unavailable", { status: 503, headers: { "retry-after": "300", "content-type": "text/plain; charset=utf-8" } });
  }
  return discoveryResponse(urlsetXml(siteOrigin(env, url), toSitemapUrls(staticPages)), XML);
};
