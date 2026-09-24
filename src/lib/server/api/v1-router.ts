/**
 * Dispatches /api/v1/* requests through the route table: match the path, authenticate, check the
 * scope, parse the query, read the body within limits, apply Idempotency-Key, run the handler,
 * and turn every failure into `{ error: { code, message, details? } }`.
 */
import type { APIContext } from "astro";
import { authenticate, requireScope, type Principal } from "../auth/request-auth";
import { toHex } from "../auth/crypto-helpers";
import { MAX_MEDIA_BYTES } from "../media/media-upload";
import { parseIfMatch } from "../pages/page-service";
import { ApiError, badRequest, errorResponse, notFound, validationFailed } from "./api-errors";
import { withIdempotency } from "./idempotency";
import { platformEnv } from "./platform-env";
import type { RouteDef } from "./v1-route-types";
import { V1_ROUTES } from "./v1-routes";

const API_PREFIX = "/api/v1";
const MAX_JSON_BYTES = 1_000_000;
/** Base64 inflates by 4/3; leave room for the JSON wrapper. */
const MAX_MEDIA_JSON_BYTES = Math.ceil((MAX_MEDIA_BYTES * 4) / 3) + 4096;

type Compiled = { def: RouteDef; segments: string[] };
const COMPILED: Compiled[] = V1_ROUTES.map((def) => ({ def, segments: def.path.split("/").filter(Boolean) }));

/** Splits the raw (still percent-encoded) path so `%2F` inside a slug stays one segment. */
function pathSegments(pathname: string): string[] {
  const rest = pathname.slice(API_PREFIX.length);
  return rest
    .split("/")
    .filter(Boolean)
    .map((s) => {
      try {
        return decodeURIComponent(s);
      } catch {
        throw badRequest("The URL path is not valid percent-encoding.");
      }
    });
}

function matchSegments(template: string[], actual: string[]): Record<string, string> | null {
  if (template.length !== actual.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < template.length; i++) {
    const t = template[i];
    if (t.startsWith("{") && t.endsWith("}")) params[t.slice(1, -1)] = actual[i];
    else if (t !== actual[i]) return null;
  }
  return params;
}

/** Literal segments beat parameters, so `/blocks/validate` wins over `/blocks/{type}`. */
function findRoute(method: string, segments: string[]): { def: RouteDef; params: Record<string, string> } {
  const candidates = COMPILED.map((c) => ({ c, params: matchSegments(c.segments, segments) }))
    .filter((m): m is { c: Compiled; params: Record<string, string> } => m.params !== null)
    .sort((a, b) => Object.keys(a.params).length - Object.keys(b.params).length);
  if (!candidates.length) throw notFound("No such API endpoint. See /api/v1/openapi.json.");
  const hit = candidates.find((m) => m.c.def.method === method);
  if (!hit) {
    const allow = [...new Set(candidates.map((m) => m.c.def.method))].join(", ");
    throw new ApiError(405, "method_not_allowed", `Use ${allow} for this endpoint.`, { allow });
  }
  return { def: hit.c.def, params: hit.params };
}

async function readBytes(request: Request, limit: number): Promise<Uint8Array> {
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (declared > limit) throw new ApiError(413, "payload_too_large", `The request body is limited to ${limit} bytes.`);
  const bytes = new Uint8Array(await request.arrayBuffer());
  if (bytes.length > limit) throw new ApiError(413, "payload_too_large", `The request body is limited to ${limit} bytes.`);
  return bytes;
}

function parseJsonBody(bytes: Uint8Array, contentType: string, def: RouteDef): unknown {
  if (!bytes.length) {
    if (def.bodyRequired) throw badRequest("This endpoint needs a JSON body.");
    return undefined;
  }
  if (!contentType.startsWith("application/json")) {
    throw new ApiError(415, "unsupported_media_type", "Send the body as JSON with `Content-Type: application/json`.");
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw badRequest("The request body is not valid JSON.");
  }
}

async function fingerprint(method: string, path: string, ifMatch: string | null, bytes: Uint8Array): Promise<string> {
  const head = new TextEncoder().encode(`${method} ${path} ${ifMatch ?? ""}\n`);
  const all = new Uint8Array(head.length + bytes.length);
  all.set(head);
  all.set(bytes, head.length);
  return toHex(new Uint8Array(await crypto.subtle.digest("SHA-256", all)));
}

async function dispatch(ctx: APIContext): Promise<Response> {
  const { request, url } = ctx;
  const env = platformEnv();
  const { def, params } = findRoute(request.method, pathSegments(url.pathname));

  let principal: Principal | null = null;
  if (def.auth !== "public") {
    principal = await authenticate({ request, cookies: ctx.cookies, locals: ctx.locals, clientAddress: ctx.clientAddress });
    if (def.auth !== "any") requireScope(principal, def.auth);
  }

  let query: unknown = undefined;
  const rawQuery = Object.fromEntries(url.searchParams);
  if (def.query) {
    const parsed = def.query.safeParse(rawQuery);
    if (!parsed.success) throw validationFailed(parsed.error, "The query string did not pass validation.");
    query = parsed.data;
  } else if (Object.keys(rawQuery).length) {
    throw badRequest(`This endpoint takes no query parameters (got ${Object.keys(rawQuery).join(", ")}).`);
  }

  const contentType = (request.headers.get("content-type") ?? "").toLowerCase();
  const isMedia = def.bodyKind === "media";
  const hasBody = def.method !== "GET";
  const limit = isMedia ? (contentType.startsWith("application/json") ? MAX_MEDIA_JSON_BYTES : MAX_MEDIA_BYTES + 1) : MAX_JSON_BYTES;
  const bytes = hasBody ? await readBytes(request, limit) : new Uint8Array();
  if (isMedia && !bytes.length) throw badRequest("Send the image bytes as the request body.");
  const body = hasBody && (!isMedia || contentType.startsWith("application/json")) ? parseJsonBody(bytes, contentType, def) : undefined;

  const ifMatchHeader = request.headers.get("if-match");
  const ifMatch = def.ifMatch ? parseIfMatch(ifMatchHeader) : null;
  if (def.ifMatch && ifMatchHeader && ifMatch === null && ifMatchHeader.trim() !== "*") {
    throw badRequest('If-Match must be a version number such as "3".');
  }

  const run = () => def.handle({ request, url, env, params, principal, query, body, bytes, ifMatch });
  const idemKey = request.headers.get("idempotency-key");
  if (!def.idempotent || !idemKey || !principal) return run();
  return withIdempotency(
    env.DB,
    { key: idemKey, actor: principal.actor, method: def.method, path: url.pathname, fingerprint: await fingerprint(def.method, url.pathname + url.search, ifMatchHeader, bytes) },
    run,
  );
}

export async function handleV1(ctx: APIContext): Promise<Response> {
  try {
    const response = await dispatch(ctx);
    if (!response.headers.has("x-robots-tag")) response.headers.set("x-robots-tag", "noindex");
    return response;
  } catch (err) {
    const response = errorResponse(err);
    if (err instanceof ApiError && err.status === 405) {
      const allow = (err.details as { allow?: string } | undefined)?.allow;
      if (allow) response.headers.set("allow", allow);
    }
    response.headers.set("x-robots-tag", "noindex");
    return response;
  }
}

