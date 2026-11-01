/**
 * Reads the docs straight from Git: one GraphQL query returns the base branch's commit and every
 * `src/content/docs/<locale>/<section>/<slug>.md` blob (text + SHA) from that same commit, so a
 * listing, a page and a proposal's checks all see one consistent revision. This is source content
 * on the base branch; production only changes after review, merge and deploy.
 */
import { DOC_SECTION_IDS } from "~/content/pages/docs";
import { parseFrontMatter } from "../../../../cli/src/front-matter.js";
import { notFound } from "../api/api-errors";
import { docId, docPath, docUrl, parseDocPath, DOC_LOCALES, type DocLocale, type DocRef } from "./doc-paths";
import type { GitHub } from "./github-client";

export type DocFile = { path: string; locale: DocLocale; ref: DocRef; sha: string; text: string };
export type DocsSnapshot = { commitSha: string; treeSha: string; files: Map<string, DocFile> };

/** Regular, non-executable file. Symlinks (0o120000) and anything else are never read or written. */
const REGULAR_FILE_MODE = 0o100644;

type Entry = { name: string; type: string; mode: number; oid?: string; object?: { entries?: Entry[]; text?: string | null; isBinary?: boolean; isTruncated?: boolean } | null };

const QUERY = `query DocsSnapshot($owner: String!, $name: String!, $ref: String!) {
  repository(owner: $owner, name: $name) {
    ref(qualifiedName: $ref) {
      target {
        ... on Commit {
          oid
          tree { oid }
          file(path: "src/content/docs") {
            object { ... on Tree { entries { name type mode object { ... on Tree { entries { name type mode object { ... on Tree {
              entries { name type mode oid object { ... on Blob { text isBinary isTruncated } } }
            } } } } } } } }
          }
        }
      }
    }
  }
}`;

type QueryData = {
  repository: { ref: { target: { oid: string; tree: { oid: string }; file: { object: { entries?: Entry[] } | null } | null } | null } | null } | null;
};

export async function readDocsSnapshot(gh: GitHub): Promise<DocsSnapshot> {
  const data = await gh.graphql<QueryData>(QUERY, { owner: gh.cfg.owner, name: gh.cfg.repo, ref: `refs/heads/${gh.cfg.base}` });
  const target = data.repository?.ref?.target;
  if (!target?.oid) throw notFound(`The docs base branch "${gh.cfg.base}" does not exist in ${gh.cfg.owner}/${gh.cfg.repo}.`);
  const files = new Map<string, DocFile>();
  const pending: Promise<void>[] = [];
  for (const locale of target.file?.object?.entries ?? []) {
    for (const section of locale.object?.entries ?? []) {
      for (const file of section.object?.entries ?? []) {
        const path = `src/content/docs/${locale.name}/${section.name}/${file.name}`;
        const parsed = parseDocPath(path);
        if (!parsed || file.type !== "blob" || file.mode !== REGULAR_FILE_MODE || !file.oid || file.object?.isBinary) continue;
        const { locale: loc, ...ref } = parsed;
        const entry: DocFile = { path, locale: loc, ref, sha: file.oid, text: file.object?.text ?? "" };
        files.set(path, entry);
        if (file.object?.isTruncated) {
          pending.push(
            gh.rest<{ content: string }>("GET", `/git/blobs/${file.oid}`).then((blob) => {
              entry.text = new TextDecoder().decode(Uint8Array.from(atob(blob.content.replace(/\s+/g, "")), (c) => c.charCodeAt(0)));
            }),
          );
        }
      }
    }
  }
  await Promise.all(pending);
  return { commitSha: target.oid, treeSha: target.tree.oid, files };
}

function frontMatterOf(text: string): Record<string, unknown> {
  try {
    return parseFrontMatter(text).data;
  } catch {
    return {};
  }
}

const SOURCE_NOTE = "Source content on the docs base branch in Git. It can differ from what is deployed until changes are merged and promoted to production.";

export type DocListQuery = { locale?: DocLocale; section?: DocRef["section"]; q?: string };

export function listDocsFromSnapshot(gh: GitHub, snap: DocsSnapshot, query: DocListQuery) {
  const q = query.q?.trim().toLowerCase();
  const docs = [...snap.files.values()]
    .filter((f) => (!query.locale || f.locale === query.locale) && (!query.section || f.ref.section === query.section))
    .map((f) => {
      const fm = frontMatterOf(f.text);
      return {
        id: docId(f.ref),
        locale: f.locale,
        section: f.ref.section,
        slug: f.ref.slug,
        title: typeof fm.title === "string" ? fm.title : null,
        description: typeof fm.description === "string" ? fm.description : null,
        order: typeof fm.order === "number" ? fm.order : null,
        path: f.path,
        sha: f.sha,
        url: docUrl(f.locale, f.ref),
      };
    })
    .filter((d) => !q || [d.id, d.title ?? "", d.description ?? ""].some((s) => s.toLowerCase().includes(q)))
    .sort(
      (a, b) =>
        DOC_SECTION_IDS.indexOf(a.section) - DOC_SECTION_IDS.indexOf(b.section) ||
        (a.order ?? 0) - (b.order ?? 0) ||
        a.slug.localeCompare(b.slug) ||
        a.locale.localeCompare(b.locale),
    );
  return { source: "git", repository: `${gh.cfg.owner}/${gh.cfg.repo}`, ref: gh.cfg.base, commit_sha: snap.commitSha, note: SOURCE_NOTE, total: docs.length, docs };
}

export function getDocFromSnapshot(gh: GitHub, snap: DocsSnapshot, ref: DocRef, only?: DocLocale) {
  const locales = only ? [only] : [...DOC_LOCALES];
  const out: Record<string, unknown> = {};
  let found = 0;
  for (const locale of locales) {
    const file = snap.files.get(docPath(locale, ref));
    if (!file) {
      out[locale] = null;
      continue;
    }
    found++;
    const { data, body } = (() => {
      try {
        return parseFrontMatter(file.text);
      } catch {
        return { data: {}, body: file.text };
      }
    })();
    out[locale] = {
      path: file.path,
      sha: file.sha,
      url: docUrl(locale, ref),
      source_url: `https://github.com/${gh.cfg.owner}/${gh.cfg.repo}/blob/${snap.commitSha}/${file.path}`,
      content: file.text,
      front_matter: data,
      body,
    };
  }
  if (!found) throw notFound(`No docs page "${docId(ref)}"${only ? ` in ${only}` : ""} on ${gh.cfg.base}. Call list_docs for the catalogue.`);
  return { source: "git", repository: `${gh.cfg.owner}/${gh.cfg.repo}`, ref: gh.cfg.base, commit_sha: snap.commitSha, id: docId(ref), note: SOURCE_NOTE, ...out };
}
