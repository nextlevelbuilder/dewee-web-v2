/**
 * GET /sitemap.xml: sitemap index of the prerendered pages (build manifest) and the
 * server-rendered ones (D1), each with the newest lastmod it contains.
 */
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { loadDiscovery } from "~/lib/server/seo/discovery-sources";
import { discoveryResponse, siteOrigin, XML } from "~/lib/server/seo/discovery-response";
import { newest, sitemapIndexXml } from "~/lib/server/seo/sitemap-xml";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const { staticPages, dynamicPages } = await loadDiscovery(env);
  const xml = sitemapIndexXml(siteOrigin(env, url), [
    { path: "/sitemap-pages.xml", lastmod: newest(staticPages.map((p) => p.lastmod)) },
    { path: "/sitemap-dynamic.xml", lastmod: newest(dynamicPages.map((p) => p.lastmod)) },
  ]);
  return discoveryResponse(xml, XML);
};
