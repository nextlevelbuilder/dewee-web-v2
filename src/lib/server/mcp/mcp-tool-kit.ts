/**
 * Shared pieces of the content MCP tools: the call context, scope checks and the id/slug lookup
 * every page and post tool accepts.
 */
import { z } from "zod";
import { notFound } from "../api/api-errors";
import type { PlatformEnv } from "../api/platform-env";
import type { ApiScope } from "../auth/api-key-format";
import type { Principal } from "../auth/request-auth";
import { findRow } from "../pages/page-queries";
import { localeSchema, type PageKind } from "../pages/page-schema";
import type { ToolDef } from "./json-rpc";

export type McpCtx = { env: PlatformEnv; principal: Principal };
export type Tool = ToolDef<McpCtx>;

export const has = (scope: ApiScope) => (ctx: McpCtx) => ctx.principal.scopes.includes(scope);
export const scopeFor = (kind: PageKind, mode: "read" | "write"): ApiScope => `${kind}s:${mode}` as ApiScope;

export const idField = z.string().min(1).max(200).describe("The UUID, or the slug (then set lookup_locale for Vietnamese).");
export const lookupLocale = localeSchema.optional().describe("Locale used to resolve a slug id (default en).");
export const versionField = z.number().int().positive().describe("Expected current version (409 if it changed).");
export const refInput = z.object({ id: idField, lookup_locale: lookupLocale }).strict();

export async function resolveId(ctx: McpCtx, kind: PageKind, id: string, locale?: "en" | "vi"): Promise<string> {
  const row = await findRow(ctx.env.DB, kind, id, locale ?? "en");
  if (!row) throw notFound(`No ${kind} with id or slug "${id}"${locale ? ` in ${locale}` : ""}.`);
  return row.id;
}
