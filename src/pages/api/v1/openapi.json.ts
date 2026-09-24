/** OpenAPI 3.1 description of the REST API, generated from the same route table the server uses. */
import type { APIRoute } from "astro";
import { json } from "~/lib/server/api/api-errors";
import { openApiDocument } from "~/lib/server/api/openapi-spec";

export const prerender = false;

export const GET: APIRoute = ({ url }) =>
  json(openApiDocument(url.origin), {
    headers: { "cache-control": "public, max-age=300", "access-control-allow-origin": "*", "x-robots-tag": "noindex" },
  });
