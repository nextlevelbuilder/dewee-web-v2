/**
 * Checks one proposed docs file the way the build will: the shared front-matter schema, the
 * section implied by its path, screenshot markers (src/components/docs/render-doc-html.ts throws on
 * the same mistakes) and Markdown structure. Pure, so tests run it over every real docs file.
 * Errors block a proposal; warnings are reported to the operator and in the pull request.
 */
import { CCP_SCREENS } from "~/content/ccp-screens";
import { docFrontMatterSchema, type DocFrontMatter } from "~/lib/docs-schema";
import { parseFrontMatter } from "../../../../cli/src/front-matter.js";
import type { DocLocale, DocRef } from "./doc-paths";

export type DocIssue = { path: string; message: string };
export type DocCheck = { errors: DocIssue[]; warnings: DocIssue[]; frontMatter: DocFrontMatter | null; body: string };

export const MAX_DOC_CHARS = 100_000;

const SCREEN_IDS = new Set<string>(CCP_SCREENS.map((s) => s.id));
const CALLOUT_KINDS = new Set(["note", "tip", "important", "warning", "caution"]);
const SHOT_RE = /^::shot\{id="([a-z0-9-]+)"\}[ \t]*$/;
const FENCE_RE = /^ {0,3}(`{3,}|~{3,})/;
const DOCS_LINK_RE = /\]\((\/docs\/[^)\s#?]*)/g;

/** Plain YAML scalars that our parser accepts but the build's YAML parser reads differently or rejects. */
function unsafePlainScalars(source: string): string[] {
  const end = source.indexOf("\n---", 3);
  if (!source.startsWith("---\n") || end < 0) return [];
  return source
    .slice(4, end)
    .split("\n")
    .flatMap((line) => {
      const m = /^([A-Za-z0-9_-]+):[ \t]+(.+)$/.exec(line);
      if (!m) return [];
      const v = m[2].trim();
      if (/^["'[]/.test(v)) return [];
      return /: |\s#|^[&*!|>%@`{]/.test(v) ? [m[1]] : [];
    });
}

/** Lines outside fenced code blocks, with their 1-based line numbers; `unclosed` when a fence never ends. */
function proseLines(body: string): { lines: { n: number; text: string }[]; unclosed: number | null } {
  const lines: { n: number; text: string }[] = [];
  let fence: { mark: string; n: number } | null = null;
  body.split("\n").forEach((text, i) => {
    const m = FENCE_RE.exec(text);
    if (fence) {
      if (m && m[1][0] === fence.mark[0] && m[1].length >= fence.mark.length && text.trim() === m[1]) fence = null;
      return;
    }
    if (m) fence = { mark: m[1], n: i + 1 };
    else lines.push({ n: i + 1, text });
  });
  return { lines, unclosed: (fence as { n: number } | null)?.n ?? null };
}

/**
 * @param knownDocIds `section/slug` ids that will exist after the proposal (for link warnings);
 *   omit to skip the link check.
 */
export function validateDocFile(source: string, opts: { locale: DocLocale; ref: DocRef; knownDocIds?: ReadonlySet<string> }): DocCheck {
  const at = (p: string) => (p ? `${opts.locale}.${p}` : opts.locale);
  const errors: DocIssue[] = [];
  const warnings: DocIssue[] = [];
  const text = source.replace(/^﻿/, "").replace(/\r\n?/g, "\n");

  if (text.length > MAX_DOC_CHARS) errors.push({ path: at(""), message: `A docs file is limited to ${MAX_DOC_CHARS} characters.` });
  if (text.includes("\u0000")) errors.push({ path: at(""), message: "The file contains a NUL character." });
  if (!text.startsWith("---\n")) {
    errors.push({ path: at("front_matter"), message: "The file must start with a --- front matter block (title, description, section, order, updated)." });
    return { errors, warnings, frontMatter: null, body: text };
  }

  let data: Record<string, unknown>;
  let body: string;
  try {
    ({ data, body } = parseFrontMatter(text));
  } catch (err) {
    errors.push({ path: at("front_matter"), message: err instanceof Error ? err.message : String(err) });
    return { errors, warnings, frontMatter: null, body: text };
  }
  for (const key of unsafePlainScalars(text)) {
    errors.push({ path: at(`front_matter.${key}`), message: 'Quote this value ("…"): it contains ": ", " #" or starts with a YAML indicator.' });
  }

  const allowed = new Set(Object.keys(docFrontMatterSchema.shape));
  for (const key of Object.keys(data)) {
    if (!allowed.has(key)) errors.push({ path: at(`front_matter.${key}`), message: `Unknown front matter key. Allowed: ${[...allowed].join(", ")}.` });
  }
  const parsed = docFrontMatterSchema.safeParse(data);
  let frontMatter: DocFrontMatter | null = null;
  if (!parsed.success) {
    for (const issue of parsed.error.issues) errors.push({ path: at(["front_matter", ...issue.path.map(String)].join(".")), message: issue.message });
  } else {
    frontMatter = parsed.data;
    if (frontMatter.section !== opts.ref.section) {
      errors.push({ path: at("front_matter.section"), message: `Must be "${opts.ref.section}", the section in the page's path.` });
    }
  }

  // Report file line numbers (what an editor shows), not body-relative ones.
  const all = text.split("\n");
  const offset = all.length - body.split("\n").length;
  const { lines: bodyLines, unclosed: bodyUnclosed } = proseLines(body);
  const lines = bodyLines.map((l) => ({ n: l.n + offset, text: l.text }));
  const unclosed = bodyUnclosed === null ? null : bodyUnclosed + offset;
  if (unclosed !== null) errors.push({ path: at(`body.line.${unclosed}`), message: "This code fence is never closed." });
  if (!lines.some((l) => l.text.trim())) errors.push({ path: at("body"), message: "The page body is empty." });

  const declared = new Set<string>(frontMatter?.screens ?? []);
  const placed = new Set<string>();
  const blank = (n: number) => !all[n - 1]?.trim();
  for (const { n, text: line } of lines) {
    if (line.includes("::shot")) {
      const m = SHOT_RE.exec(line);
      if (!m) {
        errors.push({ path: at(`body.line.${n}`), message: 'A screenshot marker must be a line of its own: ::shot{id="agents"}.' });
        continue;
      }
      const id = m[1];
      if (!SCREEN_IDS.has(id)) errors.push({ path: at(`body.line.${n}`), message: `Unknown screenshot id "${id}".` });
      else if (!declared.has(id)) errors.push({ path: at(`body.line.${n}`), message: `Screenshot "${id}" is placed but not listed in front matter \`screens\`.` });
      if (!blank(n - 1) || !blank(n + 1)) errors.push({ path: at(`body.line.${n}`), message: "Leave a blank line before and after a screenshot marker so it is a paragraph of its own." });
      placed.add(id);
    }
    const callout = /^>\s*\[!([A-Za-z]+)\]/.exec(line);
    if (callout && !CALLOUT_KINDS.has(callout[1].toLowerCase())) {
      errors.push({ path: at(`body.line.${n}`), message: `Unknown callout "[!${callout[1]}]". Use NOTE, TIP, IMPORTANT, WARNING or CAUTION.` });
    }
    if (/^#\s/.test(line)) warnings.push({ path: at(`body.line.${n}`), message: "The page title comes from front matter; start body headings at ##." });
    if (opts.knownDocIds) {
      for (const link of line.matchAll(DOCS_LINK_RE)) {
        const id = link[1].replace(/^\/docs\/?/, "").replace(/\/$/, "");
        if (id && !opts.knownDocIds.has(id)) warnings.push({ path: at(`body.line.${n}`), message: `Link to ${link[1]} does not match a docs page.` });
      }
    }
  }
  for (const id of declared) {
    if (!placed.has(id)) warnings.push({ path: at("front_matter.screens"), message: `Screenshot "${id}" is declared but never placed; the page shows it before the body.` });
  }

  return { errors, warnings, frontMatter, body };
}
