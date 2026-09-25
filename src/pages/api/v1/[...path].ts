/**
 * REST API v1 (JSON). One catch-all hands every method to the route table in
 * src/lib/server/api/v1-routes.ts; the OpenAPI document lives next door at openapi.json.
 */
import type { APIRoute } from "astro";
import { handleV1 } from "~/lib/server/api/v1-router";

export const prerender = false;

export const ALL: APIRoute = (ctx) => handleV1(ctx);
