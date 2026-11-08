/**
 * GET /api/post-widgets/results?post=<id>: aggregate Poll and Quiz results for one published post,
 * plus whether this reader has answered. Never survey answers. Logic: vote-handler.ts.
 */
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { handleResults } from "~/lib/server/post-widget-votes/vote-handler";

export const prerender = false;

export const GET: APIRoute = ({ request }) => handleResults(request, env);

export const ALL: APIRoute = ({ request }) => handleResults(request, env);
