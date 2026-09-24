/**
 * REST routes for pages and posts (same shape, different scopes): list/search, get, create,
 * update, delete, publish/unpublish/archive and revision history with restore.
 */
import { z } from "zod";
import { findRow, getPage, listPages, listQuerySchema } from "../pages/page-queries";
import { getRevision, listRevisions, restoreRevision } from "../pages/page-revisions";
import { createPageInput, localeSchema, updatePageInput, type PageKind, type PageRecord } from "../pages/page-schema";
import { changeStatus, deletePage, updatePage, createPage, type StatusAction, type WriteContext } from "../pages/page-service";
import { badRequest, json, notFound, validationFailed } from "./api-errors";
import { route, type RouteCtx, type RouteDef } from "./v1-route-types";

const refQuery = z.object({ locale: localeSchema.optional() }).strict();
const actionBody = z
  .object({
    version: z.number().int().positive().optional().describe("The version you expect (same as If-Match)."),
    note: z.string().trim().max(200).optional().describe("Stored with the revision."),
  })
  .strict();

/** `{ data }` with the ETag clients send back as If-Match. */
function recordResponse(record: PageRecord, status = 200, extra: Record<string, string> = {}): Response {
  return json({ data: record }, { status, headers: { etag: `"${record.version}"`, ...extra } });
}

/** Resolves `{id}` (a UUID, or a slug plus `?locale=`) to the row id, or 404. */
async function resolveId(ctx: RouteCtx<z.infer<typeof refQuery>>, kind: PageKind): Promise<string> {
  const row = await findRow(ctx.env.DB, kind, ctx.params.id, ctx.query.locale ?? "en");
  if (!row) throw notFound(`No ${kind} with id or slug "${ctx.params.id}"${ctx.query.locale ? ` in ${ctx.query.locale}` : ""}.`);
  return row.id;
}

function writeContext(ctx: RouteCtx<unknown>): WriteContext {
  const parsed = actionBody.safeParse(ctx.body ?? {});
  if (!parsed.success) throw validationFailed(parsed.error);
  if (!ctx.principal) throw badRequest("A credential is required.");
  return { actor: ctx.principal.actor, ifMatch: parsed.data.version ?? ctx.ifMatch, note: parsed.data.note };
}

function revisionId(raw: string): number {
  const id = Number(raw);
  if (!Number.isSafeInteger(id) || id < 1) throw badRequest("Revision ids are positive integers.");
  return id;
}

export function contentRoutes(kind: PageKind): RouteDef[] {
  const plural = kind === "page" ? "pages" : "posts";
  const tag = kind === "page" ? "Pages" : "Posts";
  const read = kind === "page" ? "pages:read" : "posts:read";
  const write = kind === "page" ? "pages:write" : "posts:write";
  const Name = kind === "page" ? "Page" : "Post";
  const item = `/${plural}/{id}`;
  const statusRoute = (action: StatusAction, summary: string): RouteDef =>
    route({
      method: "POST",
      path: `${item}/${action}`,
      operationId: `${action}${Name}`,
      tag,
      summary,
      auth: write,
      query: refQuery,
      body: actionBody,
      ifMatch: true,
      idempotent: true,
      success: 200,
      response: "Page",
      handle: async (ctx) => recordResponse(await changeStatus(ctx.env.DB, kind, await resolveId(ctx, kind), action, writeContext(ctx))),
    });

  return [
    route({
      method: "GET",
      path: `/${plural}`,
      operationId: `list${Name}s`,
      tag,
      summary: `List and search ${plural}`,
      description: "Newest first. `q` searches title, description, slug and Markdown body. Listings omit `blocks` and `body_md`.",
      auth: read,
      query: listQuerySchema,
      success: 200,
      response: "PageList",
      handle: async (ctx) => json(await listPages(ctx.env.DB, kind, ctx.query)),
    }),
    route({
      method: "POST",
      path: `/${plural}`,
      operationId: `create${Name}`,
      tag,
      summary: `Create a ${kind}`,
      description: `Blocks are validated against the block registry (see /blocks). The slug defaults to a kebab-case form of the title.${kind === "post" ? " Posts are written in `body_md` (Markdown); blocks render after the body." : ""}`,
      auth: write,
      body: createPageInput,
      bodyRequired: true,
      idempotent: true,
      success: 201,
      response: "Page",
      handle: async (ctx) => {
        if (!ctx.principal) throw badRequest("A credential is required.");
        const record = await createPage(ctx.env.DB, kind, ctx.body ?? {}, { actor: ctx.principal.actor });
        return recordResponse(record, 201, { location: `/api/v1/${plural}/${record.id}` });
      },
    }),
    route({
      method: "GET",
      path: item,
      operationId: `get${Name}`,
      tag,
      summary: `Get one ${kind} by id, or by slug with ?locale=`,
      description: "Nested page slugs must encode `/` as `%2F`. The ETag is the version; send it back as If-Match.",
      auth: read,
      query: refQuery,
      success: 200,
      response: "Page",
      handle: async (ctx) => recordResponse(await getPage(ctx.env.DB, kind, ctx.params.id, ctx.query.locale)),
    }),
    route({
      method: "PATCH",
      path: item,
      operationId: `update${Name}`,
      tag,
      summary: `Update a ${kind} (partial)`,
      description: "Send only the fields you change. Pass `version` or If-Match to avoid overwriting someone else's edit (409 on mismatch). Every update stores a revision.",
      auth: write,
      query: refQuery,
      body: updatePageInput,
      bodyRequired: true,
      ifMatch: true,
      idempotent: true,
      success: 200,
      response: "Page",
      handle: async (ctx) => {
        if (!ctx.principal) throw badRequest("A credential is required.");
        return recordResponse(await updatePage(ctx.env.DB, kind, await resolveId(ctx, kind), ctx.body ?? {}, { actor: ctx.principal.actor, ifMatch: ctx.ifMatch }));
      },
    }),
    route({
      method: "DELETE",
      path: item,
      operationId: `delete${Name}`,
      tag,
      summary: `Delete a ${kind} and its revisions`,
      description: "Permanent. Prefer `archive` when in doubt.",
      auth: write,
      query: refQuery,
      body: actionBody,
      ifMatch: true,
      success: 200,
      response: "Deleted",
      handle: async (ctx) => json({ data: await deletePage(ctx.env.DB, kind, await resolveId(ctx, kind), writeContext(ctx)) }),
    }),
    statusRoute("publish", `Publish a ${kind}`),
    statusRoute("unpublish", `Move a ${kind} back to draft`),
    statusRoute("archive", `Archive a ${kind}`),
    route({
      method: "GET",
      path: `${item}/revisions`,
      operationId: `list${Name}Revisions`,
      tag: "Revisions",
      summary: `List revisions of a ${kind}`,
      auth: read,
      query: refQuery,
      success: 200,
      response: "RevisionList",
      handle: async (ctx) => json({ data: await listRevisions(ctx.env.DB, kind, await resolveId(ctx, kind)) }),
    }),
    route({
      method: "GET",
      path: `${item}/revisions/{revision}`,
      operationId: `get${Name}Revision`,
      tag: "Revisions",
      summary: `Get one revision snapshot of a ${kind}`,
      auth: read,
      query: refQuery,
      success: 200,
      response: "Revision",
      handle: async (ctx) => json({ data: await getRevision(ctx.env.DB, kind, await resolveId(ctx, kind), revisionId(ctx.params.revision)) }),
    }),
    route({
      method: "POST",
      path: `${item}/revisions/{revision}/restore`,
      operationId: `restore${Name}Revision`,
      tag: "Revisions",
      summary: `Restore a revision as the newest version of a ${kind}`,
      description: "Copies the snapshot's content onto the page as a new version; the status is unchanged.",
      auth: write,
      query: refQuery,
      body: actionBody,
      ifMatch: true,
      idempotent: true,
      success: 200,
      response: "Page",
      handle: async (ctx) => recordResponse(await restoreRevision(ctx.env.DB, kind, await resolveId(ctx, kind), revisionId(ctx.params.revision), writeContext(ctx))),
    }),
  ];
}
