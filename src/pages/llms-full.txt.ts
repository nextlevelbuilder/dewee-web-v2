/**
 * GET /llms-full.txt: the English site in one Markdown file (docs first, then the product, then
 * the rest; built at deploy time) plus published English posts, under about 2 MB.
 */
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { llmsFullResponse } from "~/lib/server/seo/llms-responses";

export const prerender = false;

export const GET: APIRoute = ({ url }) => llmsFullResponse(env, url);
