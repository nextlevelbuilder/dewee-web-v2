/**
 * The shape of a REST v1 route. One table drives both request dispatch (v1-router.ts) and the
 * OpenAPI 3.1 document (openapi-spec.ts), so the docs cannot drift from what the server accepts.
 */
import type { z } from "zod";
import type { ApiScope } from "../auth/api-key-format";
import type { Principal } from "../auth/request-auth";
import type { PlatformEnv } from "./platform-env";

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

/** `public` needs no credential, `any` needs a valid key or session, otherwise the named scope. */
export type RouteAuth = "public" | "any" | ApiScope;

/** Named response schemas in the OpenAPI components section. */
export type ResponseShape = "Me" | "Page" | "PageList" | "Deleted" | "RevisionList" | "Revision" | "BlockList" | "BlockSchema" | "BlockValidation" | "Media" | "LeadList";

export type RouteCtx<Q = unknown> = {
  request: Request;
  url: URL;
  env: PlatformEnv;
  /** Decoded path parameters, e.g. `{ id }` for `/pages/{id}`. */
  params: Record<string, string>;
  /** Null only on public routes. */
  principal: Principal | null;
  /** Query parameters parsed by the route's `query` schema. */
  query: Q;
  /** Parsed JSON body (undefined when empty). */
  body: unknown;
  /** Raw request bytes (media uploads). */
  bytes: Uint8Array;
  /** Version from the If-Match header, if any. */
  ifMatch: number | null;
};

export type RouteDef = {
  method: HttpMethod;
  /** OpenAPI-style template relative to /api/v1, e.g. `/pages/{id}/publish`. */
  path: string;
  operationId: string;
  tag: "Account" | "Pages" | "Posts" | "Revisions" | "Blocks" | "Media" | "Leads";
  summary: string;
  description?: string;
  auth: RouteAuth;
  query?: z.ZodType;
  /** Request body schema (documentation; services validate with their own schemas and error paths). */
  body?: z.ZodType;
  bodyRequired?: boolean;
  /** `media` accepts a raw image body (or JSON base64) up to the media limit. */
  bodyKind?: "json" | "media";
  /** Honours If-Match for optimistic concurrency. */
  ifMatch?: boolean;
  /** Honours the Idempotency-Key header. */
  idempotent?: boolean;
  success: number;
  response: ResponseShape;
  handle: (ctx: RouteCtx) => Promise<Response>;
};

/**
 * Declares a route with a typed query. The router parses the query with `def.query` before calling
 * `handle`, so narrowing `ctx.query` to the schema's output type here is sound.
 */
export function route<Q = undefined>(def: Omit<RouteDef, "handle" | "query"> & { query?: z.ZodType<Q>; handle: (ctx: RouteCtx<Q>) => Promise<Response> }): RouteDef {
  const { handle, ...rest } = def;
  return { ...rest, handle: (ctx) => handle(ctx as RouteCtx<Q>) };
}
