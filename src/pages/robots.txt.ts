/**
 * GET /robots.txt: open to every crawler (AI crawlers named) in production, closed on staging.
 * Environment comes from the worker's ENVIRONMENT var, the sitemap URL from SITE_URL.
 */
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { discoveryResponse, isProduction, siteOrigin, TEXT } from "~/lib/server/seo/discovery-response";
import { robotsTxt } from "~/lib/server/seo/robots-txt";

export const prerender = false;

export const GET: APIRoute = ({ url }) =>
  discoveryResponse(robotsTxt({ siteUrl: siteOrigin(env, url), production: isProduction(env) }), TEXT);
