/**
 * Dry-run validation of a page or post write: the same parsing, block, widget-directive, slug and
 * translation checks as createPage/updatePage, reported as issues instead of thrown, and nothing
 * is written to D1.
 */
import { ApiError, zodIssues } from "../api/api-errors";
import { findRow } from "./page-queries";
import { createPageInput, updatePageInput, type PageKind } from "./page-schema";
import { assertTranslationSlotFree, checkVersion, createState, patchState, requireRow, type Editable } from "./page-service";

export type ContentIssue = { path: string; message: string };
export type ContentValidation = { valid: boolean; mode: "create" | "update"; issues: ContentIssue[]; current_version?: number };

/** Turns a thrown service error into issues; anything that is not an ApiError is a real failure. */
function issuesOf(err: unknown, fallbackPath: string): ContentIssue[] {
  if (!(err instanceof ApiError)) throw err;
  if (Array.isArray(err.details) && err.details.length) return err.details as ContentIssue[];
  return [{ path: fallbackPath, message: err.message }];
}

/** A slug already taken in that locale by another row fails the write on the UNIQUE index. */
async function slugIssues(db: D1Database, kind: PageKind, state: Editable, id: string): Promise<ContentIssue[]> {
  const clash = await findRow(db, kind, state.slug, state.locale);
  return clash && clash.id !== id ? [{ path: "slug", message: `Another ${kind} already uses the slug "${state.slug}" in ${state.locale} (${clash.id}).` }] : [];
}

/**
 * Validates `raw` as a create (no `ref`) or as a partial update of the row `ref` names.
 * A missing row still throws not_found: there is nothing to validate the patch against.
 */
export async function validateContent(db: D1Database, kind: PageKind, raw: unknown, ref?: string): Promise<ContentValidation> {
  if (ref === undefined) {
    const parsed = createPageInput.safeParse(raw);
    if (!parsed.success) return { valid: false, mode: "create", issues: zodIssues(parsed.error) };
    let state: Editable;
    try {
      state = createState(kind, parsed.data);
    } catch (err) {
      return { valid: false, mode: "create", issues: issuesOf(err, "(root)") };
    }
    const issues = await slugIssues(db, kind, state, "");
    try {
      await assertTranslationSlotFree(db, kind, state, "");
    } catch (err) {
      issues.push(...issuesOf(err, "translation_key"));
    }
    return { valid: issues.length === 0, mode: "create", issues };
  }

  const current = await requireRow(db, kind, ref);
  const base = { mode: "update" as const, current_version: current.version };
  const parsed = updatePageInput.safeParse(raw);
  if (!parsed.success) return { valid: false, ...base, issues: zodIssues(parsed.error) };
  const { version, note: _note, ...patch } = parsed.data;
  const issues: ContentIssue[] = [];
  try {
    checkVersion(kind, current, version);
  } catch (err) {
    issues.push(...issuesOf(err, "version"));
  }
  let state: Editable;
  try {
    state = patchState(kind, current, patch);
  } catch (err) {
    return { valid: false, ...base, issues: [...issues, ...issuesOf(err, "(root)")] };
  }
  issues.push(...(await slugIssues(db, kind, state, current.id)));
  try {
    await assertTranslationSlotFree(db, kind, state, current.id);
  } catch (err) {
    issues.push(...issuesOf(err, "translation_key"));
  }
  return { valid: issues.length === 0, ...base, issues };
}
