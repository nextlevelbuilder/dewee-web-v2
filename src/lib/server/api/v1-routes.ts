/**
 * The REST v1 route table: account, blocks, pages, posts, revisions, media and leads.
 * Paths are relative to /api/v1 and use OpenAPI `{param}` templates.
 */
import { z } from "zod";
import { blockJsonSchema, listBlocks, validateBlocks } from "../../blocks/registry";
import { decodeBase64Image, mediaJsonBody, uploadMedia } from "../media/media-upload";
import { badRequest, json, notFound, validationFailed } from "./api-errors";
import { leadsQuerySchema, listLeads } from "./leads-query";
import { contentRoutes } from "./v1-content-routes";
import { route, type RouteDef } from "./v1-route-types";

const validateBody = z.object({ blocks: z.array(z.unknown()).describe("Blocks to check, as stored on a page.") }).strict();

const mediaQuery = z.object({ filename: z.string().max(120).optional() }).strict();

export const V1_ROUTES: readonly RouteDef[] = [
  route({
    method: "GET",
    path: "/me",
    operationId: "whoami",
    tag: "Account",
    summary: "Who am I? The credential's owner and scopes",
    auth: "any",
    success: 200,
    response: "Me",
    handle: async ({ principal }) =>
      json({ data: principal && { email: principal.email, auth: principal.kind, scopes: principal.scopes, key_id: principal.keyId ?? null } }),
  }),
  route({
    method: "GET",
    path: "/blocks",
    operationId: "listBlocks",
    tag: "Blocks",
    summary: "List page-builder block types with a description and a valid example",
    auth: "public",
    success: 200,
    response: "BlockList",
    handle: async () => json({ data: listBlocks() }, { headers: { "cache-control": "public, max-age=300" } }),
  }),
  route({
    method: "GET",
    path: "/blocks/{type}",
    operationId: "getBlockSchema",
    tag: "Blocks",
    summary: "JSON Schema of one block type's props",
    auth: "public",
    success: 200,
    response: "BlockSchema",
    handle: async ({ params }) => {
      const schema = blockJsonSchema(params.type);
      if (!schema) throw notFound(`Unknown block type "${params.type}". GET /api/v1/blocks lists them.`);
      return json({ data: schema }, { headers: { "cache-control": "public, max-age=300" } });
    },
  }),
  route({
    method: "POST",
    path: "/blocks/validate",
    operationId: "validateBlocks",
    tag: "Blocks",
    summary: "Validate a blocks array without saving it",
    description: "Always 200; `valid` is false with `issues` (`path` + `message`) when something is wrong.",
    auth: "any",
    body: validateBody,
    bodyRequired: true,
    success: 200,
    response: "BlockValidation",
    handle: async ({ body }) => {
      const parsed = validateBody.safeParse(body ?? {});
      if (!parsed.success) throw validationFailed(parsed.error);
      const result = validateBlocks(parsed.data.blocks);
      return json({ data: result.ok ? { valid: true, issues: [] } : { valid: false, issues: result.issues } });
    },
  }),
  ...contentRoutes("page"),
  ...contentRoutes("post"),
  route({
    method: "POST",
    path: "/media",
    operationId: "uploadMedia",
    tag: "Media",
    summary: "Upload an image (PNG, JPEG, WebP, GIF or AVIF, up to 10 MB)",
    description:
      "Send the raw bytes with the image's Content-Type (optional `?filename=`), or JSON `{ data_base64, content_type?, filename? }`. " +
      "Returns the CDN URL and a same-origin `/media/…` fallback; use either as an image `src` in blocks.",
    auth: "media:write",
    query: mediaQuery,
    body: mediaJsonBody,
    bodyRequired: true,
    bodyKind: "media",
    idempotent: true,
    success: 201,
    response: "Media",
    handle: async ({ request, env, principal, query, body, bytes }) => {
      if (!principal) throw badRequest("A credential is required.");
      const type = (request.headers.get("content-type") ?? "").toLowerCase();
      if (type.startsWith("application/json")) {
        const parsed = mediaJsonBody.safeParse(body ?? {});
        if (!parsed.success) throw validationFailed(parsed.error);
        const data = decodeBase64Image(parsed.data.data_base64);
        const result = await uploadMedia(env, { bytes: data, contentType: parsed.data.content_type ?? null, filename: parsed.data.filename }, principal.actor);
        return json({ data: result }, { status: 201 });
      }
      const result = await uploadMedia(env, { bytes, contentType: type || null, filename: query.filename }, principal.actor);
      return json({ data: result }, { status: 201 });
    },
  }),
  route({
    method: "GET",
    path: "/leads",
    operationId: "listLeads",
    tag: "Leads",
    summary: "List leads from the contact and partner forms (read-only)",
    auth: "leads:read",
    query: leadsQuerySchema,
    success: 200,
    response: "LeadList",
    handle: async ({ env, query }) => json(await listLeads(env.DB, query)),
  }),
];
