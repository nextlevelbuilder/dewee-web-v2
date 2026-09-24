/**
 * POST /api/leads — contact requests, partner applications and newsletter sign-ups.
 * All logic lives in src/lib/server/leads.ts so it can be unit-tested without the runtime.
 */
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { handleLeadRequest, methodNotAllowed } from "~/lib/server/leads";

export const prerender = false;

export const POST: APIRoute = ({ request, locals }) => handleLeadRequest(request, env, locals.cfContext);

export const ALL: APIRoute = () => methodNotAllowed();
