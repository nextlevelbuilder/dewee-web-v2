/**
 * OpenAPI 3.1 document generated from the v1 route table and its zod schemas.
 * Served at /api/v1/openapi.json.
 */
import { z } from "zod";
import { API_SCOPES } from "../auth/api-key-format";
import type { ResponseShape, RouteDef } from "./v1-route-types";
import { V1_ROUTES } from "./v1-routes";

type Json = Record<string, unknown>;

function jsonSchema(schema: z.ZodType): Json {
  const { $schema: _drop, ...rest } = z.toJSONSchema(schema, { io: "input", unrepresentable: "any" }) as Json;
  return rest;
}

const ref = (name: string) => ({ $ref: `#/components/schemas/${name}` });
const dataOf = (schema: Json) => ({ type: "object", required: ["data"], properties: { data: schema } });
const listOf = (item: Json) => ({ type: "object", required: ["data", "pagination"], properties: { data: { type: "array", items: item }, pagination: ref("Pagination") } });

const PAGE_FIELDS: Json = {
  id: { type: "string", format: "uuid" },
  kind: { type: "string", enum: ["page", "post"] },
  locale: { type: "string", enum: ["en", "vi"] },
  slug: { type: "string" },
  title: { type: "string" },
  description: { type: "string" },
  layout: { type: "string", enum: ["default", "landing", "article"] },
  seo: { type: "object" },
  cover: { type: ["string", "null"] },
  tags: { type: "array", items: { type: "string" } },
  author: { type: ["string", "null"] },
  status: { type: "string", enum: ["draft", "published", "archived"] },
  translation_key: { type: ["string", "null"] },
  published_at: { type: ["string", "null"], format: "date-time" },
  created_at: { type: "string", format: "date-time" },
  updated_at: { type: "string", format: "date-time" },
  version: { type: "integer", description: "Send back as If-Match (or `version`) when you write." },
  url: { type: "string", description: "Public path once published." },
};

const COMPONENT_SCHEMAS: Json = {
  Error: {
    type: "object",
    required: ["error"],
    properties: {
      error: {
        type: "object",
        required: ["code", "message"],
        properties: {
          code: { type: "string", examples: ["validation_failed", "version_conflict", "not_found"] },
          message: { type: "string" },
          details: { description: "For validation errors: `[{ path, message }]`." },
        },
      },
    },
  },
  Pagination: { type: "object", properties: { limit: { type: "integer" }, offset: { type: "integer" }, total: { type: "integer" } } },
  Block: { type: "object", required: ["type", "props"], properties: { type: { type: "string" }, props: { type: "object" }, section: { type: "object" } } },
  PageSummary: { type: "object", properties: PAGE_FIELDS },
  Page: { type: "object", properties: { ...PAGE_FIELDS, blocks: { type: "array", items: ref("Block") }, body_md: { type: ["string", "null"] } } },
  RevisionSummary: {
    type: "object",
    properties: { id: { type: "integer" }, version: { type: "integer" }, actor: { type: "string" }, note: { type: ["string", "null"] }, created_at: { type: "string", format: "date-time" } },
  },
};

const RESPONSES: Record<ResponseShape, Json> = {
  Me: dataOf({ type: "object", properties: { email: { type: "string" }, auth: { type: "string", enum: ["api_key", "session"] }, scopes: { type: "array", items: { type: "string", enum: [...API_SCOPES] } }, key_id: { type: ["string", "null"] } } }),
  Page: dataOf(ref("Page")),
  PageList: listOf(ref("PageSummary")),
  Deleted: dataOf({ type: "object", properties: { id: { type: "string" }, deleted: { const: true } } }),
  RevisionList: dataOf({ type: "array", items: ref("RevisionSummary") }),
  Revision: dataOf({ allOf: [ref("RevisionSummary"), { type: "object", properties: { snapshot: ref("Page") } }] }),
  BlockList: dataOf({ type: "array", items: { type: "object", properties: { type: { type: "string" }, category: { type: "string" }, description: { type: "string" }, example: { type: "object" } } } }),
  BlockSchema: dataOf({ type: "object", properties: { type: { type: "string" }, description: { type: "string" }, props: { type: "object", description: "JSON Schema of the props." }, section: { type: "object" }, example: ref("Block") } }),
  BlockValidation: dataOf({ type: "object", properties: { valid: { type: "boolean" }, issues: { type: "array", items: { type: "object", properties: { path: { type: "string" }, message: { type: "string" } } } } } }),
  Media: dataOf({ type: "object", properties: { key: { type: "string" }, url: { type: "string", format: "uri" }, fallback_url: { type: "string" }, content_type: { type: "string" }, size: { type: "integer" } } }),
  LeadList: listOf({ type: "object", properties: { id: { type: "integer" }, kind: { type: "string" }, email: { type: ["string", "null"] }, name: { type: ["string", "null"] }, company: { type: ["string", "null"] }, locale: { type: ["string", "null"] }, source: { type: ["string", "null"] }, payload: { type: "object" }, created_at: { type: "string" } } }),
};

const errorResponse = (description: string) => ({ description, content: { "application/json": { schema: ref("Error") } } });

function parameters(def: RouteDef): Json[] {
  const params: Json[] = [...def.path.matchAll(/\{(\w+)\}/g)].map((m) => ({
    name: m[1],
    in: "path",
    required: true,
    schema: { type: "string" },
    description: m[1] === "id" ? "UUID, or the slug (with `?locale=`; encode `/` as `%2F`)." : undefined,
  }));
  if (def.query) {
    const schema = jsonSchema(def.query) as { properties?: Record<string, Json>; required?: string[] };
    for (const [name, prop] of Object.entries(schema.properties ?? {})) {
      params.push({ name, in: "query", required: schema.required?.includes(name) ?? false, schema: prop });
    }
  }
  if (def.ifMatch) params.push({ name: "If-Match", in: "header", required: false, schema: { type: "string" }, description: 'The version you edited, e.g. "3". 409 if it changed.' });
  if (def.idempotent) params.push({ name: "Idempotency-Key", in: "header", required: false, schema: { type: "string", maxLength: 255 }, description: "Retries with the same key replay the first response for 24 hours." });
  return params;
}

function requestBody(def: RouteDef): Json | undefined {
  if (!def.body) return undefined;
  const content: Json = { "application/json": { schema: jsonSchema(def.body) } };
  if (def.bodyKind === "media") {
    for (const type of ["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"]) content[type] = { schema: { type: "string", format: "binary" } };
  }
  return { required: Boolean(def.bodyRequired), content };
}

function operation(def: RouteDef): Json {
  const responses: Json = {
    [String(def.success)]: { description: "OK", content: { "application/json": { schema: RESPONSES[def.response] } } },
    "400": errorResponse("Bad request"),
    "422": errorResponse("Validation failed; `details` lists each problem"),
  };
  if (def.auth !== "public") Object.assign(responses, { "401": errorResponse("Missing or invalid credential"), "403": errorResponse("Missing scope") });
  if (def.path.includes("{")) responses["404"] = errorResponse("Not found");
  if (def.ifMatch || def.idempotent) responses["409"] = errorResponse("Version conflict or a concurrent idempotent request");
  const scopes = def.auth === "public" || def.auth === "any" ? [] : [def.auth];
  return {
    operationId: def.operationId,
    tags: [def.tag],
    summary: def.summary,
    ...(def.description ? { description: def.description } : {}),
    ...(def.auth === "public" ? { security: [] } : { security: [{ apiKey: scopes }], "x-required-scopes": scopes }),
    parameters: parameters(def),
    ...(requestBody(def) ? { requestBody: requestBody(def) } : {}),
    responses,
  };
}

export function openApiDocument(origin: string): Json {
  const paths: Record<string, Json> = {};
  for (const def of V1_ROUTES) (paths[def.path] ??= {})[def.method.toLowerCase()] = operation(def);
  return {
    openapi: "3.1.0",
    info: {
      title: "dewee.sh content API",
      version: "1.0.0",
      description:
        "Pages, posts, blocks, media and leads for dewee.sh. Authenticate with `Authorization: Bearer dwk_…` (keys are created by super admins in /admin/keys). " +
        "Send `Content-Type: application/json` on every write, including bodiless ones. Errors are `{ error: { code, message, details? } }`.",
    },
    servers: [{ url: `${origin}/api/v1` }],
    security: [{ apiKey: [] }],
    tags: ["Account", "Blocks", "Pages", "Posts", "Revisions", "Media", "Leads"].map((name) => ({ name })),
    paths,
    components: {
      securitySchemes: { apiKey: { type: "http", scheme: "bearer", bearerFormat: "dwk_<prefix>_<secret>", description: `Scopes: ${API_SCOPES.join(", ")}.` } },
      schemas: COMPONENT_SCHEMAS,
    },
  };
}
