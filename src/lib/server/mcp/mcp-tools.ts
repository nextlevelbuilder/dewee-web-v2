/**
 * MCP tools for dewee.sh content: the same services as the REST API, exposed to agents.
 * A tool only appears in tools/list when the caller's API key has the scope it needs.
 */
import { z } from "zod";
import { blockJsonSchema, listBlocks } from "../../blocks/registry";
import { notFound } from "../api/api-errors";
import { leadsQuerySchema, listLeads } from "../api/leads-query";
import type { PlatformEnv } from "../api/platform-env";
import type { ApiScope } from "../auth/api-key-format";
import { requireScope, type Principal } from "../auth/request-auth";
import { decodeBase64Image, mediaJsonBody, uploadMedia } from "../media/media-upload";
import { findRow, getPage, listPages, listQuerySchema } from "../pages/page-queries";
import { listRevisions, restoreRevision } from "../pages/page-revisions";
import { createPageInput, kindSchema, localeSchema, updatePageInput, type PageKind } from "../pages/page-schema";
import { changeStatus, createPage, updatePage } from "../pages/page-service";
import type { McpServer, ToolDef } from "./json-rpc";

export type McpCtx = { env: PlatformEnv; principal: Principal };
type Tool = ToolDef<McpCtx>;

const has = (scope: ApiScope) => (ctx: McpCtx) => ctx.principal.scopes.includes(scope);
const scopeFor = (kind: PageKind, mode: "read" | "write"): ApiScope => `${kind}s:${mode}` as ApiScope;

const idField = z.string().min(1).max(200).describe("The UUID, or the slug (then set lookup_locale for Vietnamese).");
const lookupLocale = localeSchema.optional().describe("Locale used to resolve a slug id (default en).");
const refInput = z.object({ id: idField, lookup_locale: lookupLocale }).strict();
const statusInput = refInput.extend({ version: z.number().int().positive().optional().describe("Expected current version (409 if it changed).") }).strict();
const getInput = refInput.extend({ kind: kindSchema.default("page").describe("page (default) or post.") }).strict();
const updateInput = z.object({ id: idField, lookup_locale: lookupLocale, ...updatePageInput.shape }).strict();

async function resolveId(ctx: McpCtx, kind: PageKind, id: string, locale?: "en" | "vi"): Promise<string> {
  const row = await findRow(ctx.env.DB, kind, id, locale ?? "en");
  if (!row) throw notFound(`No ${kind} with id or slug "${id}"${locale ? ` in ${locale}` : ""}.`);
  return row.id;
}

function contentTools(kind: PageKind): Tool[] {
  const read = scopeFor(kind, "read");
  const write = scopeFor(kind, "write");
  const noun = kind === "page" ? "custom page" : "blog post";
  const tools: Tool[] = [
    {
      name: `list_${kind}s`,
      title: `List ${kind}s`,
      description: `List or search ${noun}s (newest first). Filters: locale, status, q (text search), tag. Listings omit blocks and body_md; use get_page for the full record.`,
      input: listQuerySchema,
      annotations: { readOnlyHint: true },
      enabled: has(read),
      run: (args, ctx) => listPages(ctx.env.DB, kind, listQuerySchema.parse(args)),
    },
    {
      name: `create_${kind}`,
      title: `Create a ${kind}`,
      description:
        kind === "page"
          ? "Create a custom page (served at /p/<slug>, or /vi/p/<slug>). Compose `blocks` from list_blocks / get_block_schema; the first block may be PageHero. Created as a draft unless status is published."
          : "Create a blog post (served at /blog/<slug>). Write the article in `body_md` (Markdown); set tags, author (duy, cuong or viet link to a founder), cover and description. Created as a draft unless status is published.",
      input: createPageInput,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
      enabled: has(write),
      run: (args, ctx) => createPage(ctx.env.DB, kind, args, { actor: ctx.principal.actor }),
    },
    {
      name: `update_${kind}`,
      title: `Update a ${kind}`,
      description: `Partially update a ${kind}: send only the fields to change, plus \`version\` from your last read to avoid overwriting someone else's edit. Every update keeps a revision.`,
      input: updateInput,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
      enabled: has(write),
      run: async (args, ctx) => {
        const { id, lookup_locale, ...patch } = updateInput.parse(args);
        return updatePage(ctx.env.DB, kind, await resolveId(ctx, kind, id, lookup_locale), patch, { actor: ctx.principal.actor });
      },
    },
    {
      name: `publish_${kind}`,
      title: `Publish a ${kind}`,
      description: `Publish a ${kind} so it is publicly visible. Returns the record with its public url.`,
      input: statusInput,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true },
      enabled: has(write),
      run: async (args, ctx) => {
        const a = statusInput.parse(args);
        return changeStatus(ctx.env.DB, kind, await resolveId(ctx, kind, a.id, a.lookup_locale), "publish", { actor: ctx.principal.actor, ifMatch: a.version });
      },
    },
  ];
  if (kind === "page") {
    tools.splice(1, 0, {
      name: "get_page",
      title: "Get a page or post",
      description: "Fetch one custom page (kind page, default) or blog post (kind post) with its blocks, Markdown body, status and version.",
      input: getInput,
      annotations: { readOnlyHint: true },
      enabled: (ctx) => has("pages:read")(ctx) || has("posts:read")(ctx),
      run: async (args, ctx) => {
        const a = getInput.parse(args);
        requireScope(ctx.principal, scopeFor(a.kind, "read"));
        return getPage(ctx.env.DB, a.kind, a.id, a.lookup_locale);
      },
    });
    tools.push({
      name: "unpublish_page",
      title: "Unpublish a page",
      description: "Move a published custom page back to draft (it stops being public).",
      input: statusInput,
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
      enabled: has(write),
      run: async (args, ctx) => {
        const a = statusInput.parse(args);
        return changeStatus(ctx.env.DB, kind, await resolveId(ctx, kind, a.id, a.lookup_locale), "unpublish", { actor: ctx.principal.actor, ifMatch: a.version });
      },
    });
  }
  return tools;
}

const blockTypeInput = z.object({ type: z.string().min(1).max(40).describe("A block type from list_blocks, e.g. FeatureGrid.") }).strict();
const revisionsInput = z.object({ kind: kindSchema.default("page"), id: idField, lookup_locale: lookupLocale }).strict();
const restoreInput = revisionsInput.extend({ revision_id: z.number().int().positive(), version: z.number().int().positive().optional() }).strict();

export const MCP_TOOLS: readonly Tool[] = [
  {
    name: "list_blocks",
    title: "List page-builder blocks",
    description: "All block types with a description and a valid example. Pages are an ordered array of { type, props, section? }.",
    input: z.object({}).strict(),
    annotations: { readOnlyHint: true },
    run: async () => ({ blocks: listBlocks() }),
  },
  {
    name: "get_block_schema",
    title: "Get a block's JSON Schema",
    description: "JSON Schema of one block type's props, the shared section options, and an example.",
    input: blockTypeInput,
    annotations: { readOnlyHint: true },
    run: async (args) => {
      const { type } = blockTypeInput.parse(args);
      const schema = blockJsonSchema(type);
      if (!schema) throw notFound(`Unknown block type "${type}". Call list_blocks for the catalogue.`);
      return schema;
    },
  },
  ...contentTools("page"),
  ...contentTools("post"),
  {
    name: "upload_media",
    title: "Upload an image",
    description: "Upload a PNG, JPEG, WebP, GIF or AVIF image (base64, up to 10 MB). Returns a CDN url and a /media/ fallback to use as an image src in blocks or as a post cover.",
    input: mediaJsonBody,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
    enabled: has("media:write"),
    run: async (args, ctx) => {
      const a = mediaJsonBody.parse(args);
      return uploadMedia(ctx.env, { bytes: decodeBase64Image(a.data_base64), contentType: a.content_type ?? null, filename: a.filename }, ctx.principal.actor);
    },
  },
  {
    name: "list_leads",
    title: "List leads",
    description: "Read-only list of contact and partner form submissions, newest first. Filter by kind or search q (email, name, company).",
    input: leadsQuerySchema,
    annotations: { readOnlyHint: true },
    enabled: has("leads:read"),
    run: (args, ctx) => listLeads(ctx.env.DB, leadsQuerySchema.parse(args)),
  },
  {
    name: "list_revisions",
    title: "List revisions",
    description: "Revision history of a page or post (newest first): id, version, actor, note, time.",
    input: revisionsInput,
    annotations: { readOnlyHint: true },
    enabled: (ctx) => has("pages:read")(ctx) || has("posts:read")(ctx),
    run: async (args, ctx) => {
      const a = revisionsInput.parse(args);
      requireScope(ctx.principal, scopeFor(a.kind, "read"));
      return { revisions: await listRevisions(ctx.env.DB, a.kind, await resolveId(ctx, a.kind, a.id, a.lookup_locale)) };
    },
  },
  {
    name: "restore_revision",
    title: "Restore a revision",
    description: "Copy a revision's content back onto the page or post as a new version (status unchanged; the restore itself can be undone).",
    input: restoreInput,
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
    enabled: (ctx) => has("pages:write")(ctx) || has("posts:write")(ctx),
    run: async (args, ctx) => {
      const a = restoreInput.parse(args);
      requireScope(ctx.principal, scopeFor(a.kind, "write"));
      const id = await resolveId(ctx, a.kind, a.id, a.lookup_locale);
      return restoreRevision(ctx.env.DB, a.kind, id, a.revision_id, { actor: ctx.principal.actor, ifMatch: a.version });
    },
  },
];

export const MCP_SERVER: McpServer<McpCtx> = {
  name: "dewee-web",
  title: "dewee.sh content",
  version: "1.0.0",
  instructions:
    "Manage dewee.sh custom pages (/p/<slug>) and blog posts (/blog/<slug>) in English (en) and Vietnamese (vi). " +
    "Before composing a page, call list_blocks and get_block_schema. New content is a draft until published. " +
    "Pass the `version` you last read when updating to avoid overwriting other edits. Link EN and VI versions with the same translation_key.",
  tools: MCP_TOOLS,
};
