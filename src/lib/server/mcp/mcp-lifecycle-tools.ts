/**
 * MCP tools for the rest of a page or post lifecycle, at parity with the REST routes: unpublish,
 * archive, delete, dry-run validation and reading one revision snapshot. Each calls the same
 * service as REST and is gated by the same per-kind scope.
 */
import { z } from "zod";
import { badRequest, notFound } from "../api/api-errors";
import { requireScope } from "../auth/request-auth";
import { findRow } from "../pages/page-queries";
import { getRevision } from "../pages/page-revisions";
import { kindSchema, type PageKind } from "../pages/page-schema";
import { changeStatus, deletePage, type StatusAction } from "../pages/page-service";
import { validateContent } from "../pages/page-validation";
import { has, idField, lookupLocale, refInput, resolveId, scopeFor, versionField, type Tool } from "./mcp-tool-kit";

const noteField = z.string().trim().max(200).optional().describe("Stored with the revision.");
export const statusInput = refInput.extend({ version: versionField.optional(), note: noteField }).strict();
const deleteInput = refInput
  .extend({
    version: versionField.describe("Required: the version you last read. A stale version deletes nothing (409)."),
    confirm_slug: z.string().min(1).max(120).describe("Required: the record's current slug, typed back to confirm the permanent delete."),
    note: noteField,
  })
  .strict();
const validateInput = z
  .object({
    id: idField.optional().describe("Omit to check a new record (create). Set to check a partial update of this record."),
    lookup_locale: lookupLocale,
    content: z.record(z.string(), z.unknown()).describe("The fields you would send to create_* (no id) or update_* (with id), including blocks, body_md and version."),
  })
  .strict();
const revisionInput = z.object({ kind: kindSchema.default("page"), id: idField, lookup_locale: lookupLocale, revision_id: z.number().int().positive() }).strict();

const STATUS_TEXT: Record<Exclude<StatusAction, "publish">, string> = {
  unpublish: "Move a published %s back to draft so it stops being public. Reversible with publish_%k.",
  archive: "Archive a %s: it stops being public and is marked archived; its history is kept. Reversible with publish_%k.",
};

/** unpublish_*, archive_*, validate_* and delete_* for one kind. */
export function lifecycleTools(kind: PageKind): Tool[] {
  const read = scopeFor(kind, "read");
  const write = scopeFor(kind, "write");
  const noun = kind === "page" ? "custom page" : "blog post";
  const status = (action: Exclude<StatusAction, "publish">): Tool => ({
    name: `${action}_${kind}`,
    title: `${action === "archive" ? "Archive" : "Unpublish"} a ${kind}`,
    description: `${STATUS_TEXT[action].replace("%s", noun).replace("%k", kind)} Already in that state: no change, no new version. Pass \`version\` so a stale read cannot change the status (409).`,
    input: statusInput,
    annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
    enabled: has(write),
    run: async (args, ctx) => {
      const a = statusInput.parse(args);
      return changeStatus(ctx.env.DB, kind, await resolveId(ctx, kind, a.id, a.lookup_locale), action, { actor: ctx.principal.actor, ifMatch: a.version, note: a.note });
    },
  });
  return [
    status("unpublish"),
    status("archive"),
    {
      name: `validate_${kind}`,
      title: `Validate a ${kind} (dry run)`,
      description: `Check a ${noun} create or update without saving anything: the same schema, block, ${kind === "post" ? '::widget{id="…"} directive, ' : ""}slug, translation and version checks as create_${kind} / update_${kind}. Returns { valid, mode, issues: [{ path, message }] }.`,
      input: validateInput,
      annotations: { readOnlyHint: true, idempotentHint: true },
      enabled: (ctx) => has(read)(ctx) || has(write)(ctx),
      run: async (args, ctx) => {
        const a = validateInput.parse(args);
        const ref = a.id === undefined ? undefined : await resolveId(ctx, kind, a.id, a.lookup_locale);
        return validateContent(ctx.env.DB, kind, a.content, ref);
      },
    },
    {
      name: `delete_${kind}`,
      title: `Delete a ${kind} permanently`,
      description: `Permanently delete a ${noun} and all its revisions. Cannot be undone; prefer archive_${kind}. Requires the current \`version\` and \`confirm_slug\`. Not safe to retry blindly: after a success a retry returns not_found.`,
      input: deleteInput,
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false },
      enabled: has(write),
      run: async (args, ctx) => {
        const a = deleteInput.parse(args);
        const row = await findRow(ctx.env.DB, kind, a.id, a.lookup_locale ?? "en");
        if (!row) throw notFound(`No ${kind} with id or slug "${a.id}"${a.lookup_locale ? ` in ${a.lookup_locale}` : ""}.`);
        if (a.confirm_slug !== row.slug) throw badRequest(`confirm_slug must be this ${kind}'s current slug ("${row.slug}"). Nothing was deleted.`, [{ path: "confirm_slug", message: "Does not match the current slug." }]);
        return deletePage(ctx.env.DB, kind, row.id, { actor: ctx.principal.actor, ifMatch: a.version, note: a.note });
      },
    },
  ];
}

export const getRevisionTool: Tool = {
  name: "get_revision",
  title: "Get a revision snapshot",
  description: "Read one revision of a page or post (from list_revisions): its version, actor, note and the full snapshot of the content at that version. Compare before restore_revision.",
  input: revisionInput,
  annotations: { readOnlyHint: true },
  enabled: (ctx) => has("pages:read")(ctx) || has("posts:read")(ctx),
  run: async (args, ctx) => {
    const a = revisionInput.parse(args);
    requireScope(ctx.principal, scopeFor(a.kind, "read"));
    return getRevision(ctx.env.DB, a.kind, await resolveId(ctx, a.kind, a.id, a.lookup_locale), a.revision_id);
  },
};
