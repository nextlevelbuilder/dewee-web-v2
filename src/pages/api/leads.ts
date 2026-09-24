/**
 * POST /api/leads — contact requests, partner applications and newsletter sign-ups.
 * All logic lives in src/lib/server/leads.ts so it can be unit-tested without the runtime.
 */
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { handleLeadRequest, methodNotAllowed } from "~/lib/server/leads";

export const prerender = false;

// `cloudflare:workers` types `env` as the ambient (empty) Cloudflare.Env; the real bindings are declared on `Env` in src/env.d.ts.
const bindings = env as unknown as Env;

export const POST: APIRoute = ({ request, locals }) => handleLeadRequest(request, bindings, locals.cfContext);

export const ALL: APIRoute = () => methodNotAllowed();
