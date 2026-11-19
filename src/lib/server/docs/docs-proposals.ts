/**
 * Plans a docs change against one Git snapshot, without writing anything: who may touch which
 * file, compare-and-swap on blob SHAs, validation of every proposed file, EN/VI pairing warnings
 * and a preview diff. `validate_doc` returns the plan; `create_doc` / `update_doc` turn a valid plan
 * into a pull request (docs-pull-requests.ts).
 */
import { z } from "zod";
import { ApiError, conflict, notFound } from "../api/api-errors";
import { docId, docPath, docSectionSchema, docSlugSchema, DOC_LOCALES, type DocLocale, type DocRef } from "./doc-paths";
import { MAX_DOC_CHARS, validateDocFile, type DocIssue } from "./doc-validate";
import type { DocsSnapshot } from "./docs-repo";
import { unifiedDiff } from "./text-diff";

const blobSha = z.string().regex(/^[0-9a-f]{40}$/, "A 40-character Git blob SHA from list_docs or get_doc.");
const localeChange = z
  .object({
    content: z.string().min(1).max(MAX_DOC_CHARS).describe("The whole Markdown file: --- front matter --- then the body."),
    expected_sha: blobSha.optional().describe("update_doc: the `sha` you last read for this locale. A different current SHA is a 409 version_conflict."),
  })
  .strict();

export const proposalShape = {
  section: docSectionSchema.describe("Docs section, e.g. get-started or console."),
  slug: docSlugSchema.describe("Page slug inside the section, shared by EN and VI."),
  en: localeChange.optional().describe("English file."),
  vi: localeChange.optional().describe("Vietnamese file."),
  note: z.string().max(1000).optional().describe("Why this change is proposed; shown to reviewers in the pull request."),
};
export const proposalInput = z.object(proposalShape).strict();
export type ProposalInput = z.infer<typeof proposalInput>;
export type ProposalMode = "create" | "update";

export type PlannedChange = { locale: DocLocale; path: string; baseSha: string | null; content: string; diff: string; added: number; removed: number };
export type ProposalPlan = { mode: ProposalMode; ref: DocRef; changes: PlannedChange[]; errors: DocIssue[]; warnings: DocIssue[] };

const normalise = (s: string) => {
  const text = s.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  return text.endsWith("\n") ? text : `${text}\n`;
};

export function planProposal(snap: DocsSnapshot, mode: ProposalMode, input: ProposalInput): ProposalPlan {
  const ref: DocRef = { section: input.section, slug: input.slug };
  const id = docId(ref);
  const errors: DocIssue[] = [];
  const warnings: DocIssue[] = [];
  const provided = DOC_LOCALES.filter((l) => input[l]);
  const existing = (l: DocLocale) => snap.files.get(docPath(l, ref)) ?? null;

  if (mode === "create") {
    const missing = DOC_LOCALES.filter((l) => !input[l]);
    if (missing.length) throw new ApiError(422, "validation_failed", `A new docs page needs both locales; missing: ${missing.join(", ")}.`, [{ path: missing[0], message: "Required when creating a page." }]);
    const taken = DOC_LOCALES.filter((l) => existing(l));
    if (taken.length) throw conflict(`The docs page "${id}" already exists. Use update_doc with its SHA.`, { paths: taken.map((l) => docPath(l, ref)) });
    for (const l of DOC_LOCALES) {
      if (input[l]?.expected_sha) errors.push({ path: `${l}.expected_sha`, message: "Leave expected_sha out when creating a page." });
    }
    const elsewhere = [...snap.files.values()].find((f) => f.ref.slug === ref.slug);
    if (elsewhere) warnings.push({ path: "slug", message: `The slug "${ref.slug}" is also used by ${docId(elsewhere.ref)}; a distinct slug avoids confusing links.` });
  } else {
    if (!provided.length) throw new ApiError(422, "validation_failed", "Send en, vi or both.", [{ path: "en", message: "Nothing to update." }]);
    if (!DOC_LOCALES.some((l) => existing(l))) throw notFound(`No docs page "${id}" on the base branch. Use create_doc for a new page.`);
    const stale: { locale: DocLocale; expected_sha: string | null; current_sha: string | null }[] = [];
    for (const l of provided) {
      const current = existing(l);
      const expected = input[l]?.expected_sha ?? null;
      if (!current) {
        errors.push({ path: l, message: `The ${l} file does not exist yet; ask an admin to restore the pair before updating it.` });
        continue;
      }
      if (!expected) errors.push({ path: `${l}.expected_sha`, message: "Required: the sha you last read with get_doc." });
      else if (expected !== current.sha) stale.push({ locale: l, expected_sha: expected, current_sha: current.sha });
    }
    if (stale.length) throw new ApiError(409, "version_conflict", "The docs file changed since you read it. Read it again with get_doc, re-apply your edit and send the new sha.", stale);
    for (const l of DOC_LOCALES) {
      if (!input[l] && existing(l)) warnings.push({ path: l, message: `The ${l} twin is not part of this proposal; it may need a translation follow-up.` });
    }
  }

  const known = new Set([...snap.files.values()].map((f) => docId(f.ref)).concat(id));
  const changes: PlannedChange[] = [];
  const fm: Partial<Record<DocLocale, { order: number; screens: string[] }>> = {};
  for (const l of DOC_LOCALES) {
    const proposed = input[l] ? normalise(input[l].content) : null;
    const source = proposed ?? existing(l)?.text;
    if (source === undefined) continue;
    const check = validateDocFile(source, { locale: l, ref, knownDocIds: known });
    if (check.frontMatter) fm[l] = { order: check.frontMatter.order, screens: [...(check.frontMatter.screens ?? [])].sort() };
    if (proposed === null) continue;
    errors.push(...check.errors);
    warnings.push(...check.warnings);
    const before = existing(l);
    const diff = unifiedDiff(before?.text ?? "", proposed, docPath(l, ref));
    if (before && !diff.diff) errors.push({ path: l, message: `The ${l} file is unchanged.` });
    changes.push({ locale: l, path: docPath(l, ref), baseSha: before?.sha ?? null, content: proposed, ...diff });
  }

  if (fm.en && fm.vi) {
    if (fm.en.order !== fm.vi.order) warnings.push({ path: "vi.front_matter.order", message: `EN order is ${fm.en.order} but VI order is ${fm.vi.order}; the sidebars will differ.` });
    if (fm.en.screens.join() !== fm.vi.screens.join()) warnings.push({ path: "vi.front_matter.screens", message: "EN and VI declare different screenshots." });
  }
  if (mode === "create" && fm.en) {
    const clash = [...snap.files.values()].find((f) => f.locale === "en" && f.ref.section === ref.section && new RegExp(`^order:\\s*${fm.en!.order}\\s*$`, "m").test(f.text));
    if (clash) warnings.push({ path: "en.front_matter.order", message: `Order ${fm.en.order} is already used by ${docId(clash.ref)} in this section.` });
  }
  return { mode, ref, changes, errors, warnings };
}

/** The preview returned by validate_doc (and inside a 422 when a write is refused). */
export function planReport(plan: ProposalPlan, base: { ref: string; sha: string }) {
  return {
    status: "validated" as const,
    valid: plan.errors.length === 0,
    id: docId(plan.ref),
    base,
    errors: plan.errors,
    warnings: plan.warnings,
    changes: plan.changes.map((c) => ({ locale: c.locale, path: c.path, base_sha: c.baseSha, added: c.added, removed: c.removed, diff: c.diff })),
  };
}
