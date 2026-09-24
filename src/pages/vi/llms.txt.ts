/** GET /vi/llms.txt: the Vietnamese pages of dewee.sh for language models, by Markdown twin. */
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { llmsTxtResponse } from "~/lib/server/seo/llms-responses";

export const prerender = false;

export const GET: APIRoute = ({ url }) => llmsTxtResponse(env, url, "vi");
