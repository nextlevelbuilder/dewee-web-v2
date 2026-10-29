/**
 * POST /api/post-widgets/vote: a reader's answer to a Poll, Quiz or Survey in a published post.
 * Logic and checks live in src/lib/server/post-widget-votes/vote-handler.ts.
 */
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { handleVote } from "~/lib/server/post-widget-votes/vote-handler";

export const prerender = false;

export const POST: APIRoute = ({ request }) => handleVote(request, env);

export const ALL: APIRoute = ({ request }) => handleVote(request, env);
