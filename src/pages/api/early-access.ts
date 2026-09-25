/**
 * GET /api/early-access — the Early Access state for the browser block, proxied from dewee-app.
 * Logic lives in src/lib/server/early-access-proxy.ts.
 */
import type { APIRoute } from "astro";
import { handleEarlyAccessRequest } from "~/lib/server/early-access-proxy";

export const prerender = false;

export const GET: APIRoute = ({ request }) => handleEarlyAccessRequest(request);
