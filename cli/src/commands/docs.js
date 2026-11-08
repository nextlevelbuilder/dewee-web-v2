/**
 * `docs …`: read the bilingual docs from Git and propose changes as pull requests. Files are whole
 * Markdown docs (front matter + body); `get --locale en --out f.md` and `update --en f.md` round-trip.
 */
import { readFile, writeFile } from "node:fs/promises";
import { stringFlag } from "../args.js";
import { apiRequest } from "../http.js";
import { info, printJson, printTable } from "../output.js";

const USAGE = "Usage: dewee-web docs list|get|validate|create|update <section/slug> …";

/** @param {string | undefined} id */
function docRef(id) {
  const m = /^([a-z0-9-]+)\/([a-z0-9-]+)$/.exec(id ?? "");
  if (!m) throw new Error(`Name the page as <section>/<slug>, e.g. get-started/quickstart.\n${USAGE}`);
  return { section: m[1], slug: m[2] };
}

/**
 * `{ en?, vi? }` from `--en file --en-sha …` and `--vi file --vi-sha …`.
 * @param {Record<string, string | true>} flags
 */
async function localeFiles(flags) {
  /** @type {Record<string, { content: string, expected_sha?: string }>} */
  const out = {};
  for (const locale of ["en", "vi"]) {
    const file = stringFlag(flags, locale);
    if (!file) continue;
    let content;
    try {
      content = await readFile(file, "utf8");
    } catch (err) {
      throw new Error(`Cannot read ${file}: ${err instanceof Error ? err.message : err}`);
    }
    const sha = stringFlag(flags, `${locale}-sha`);
    out[locale] = sha ? { content, expected_sha: sha } : { content };
  }
  if (!out.en && !out.vi) throw new Error("Pass --en <file>, --vi <file> or both.");
  return out;
}

/** @param {any} report */
function printIssues(report) {
  for (const e of report.errors ?? []) info(`error   ${e.path}: ${e.message}`);
  for (const w of report.warnings ?? []) info(`warning ${w.path}: ${w.message}`);
}

/**
 * @param {{ url: string, apiKey: string | null }} config
 * @param {string[]} args
 * @param {Record<string, string | true>} flags
 */
export async function docsCommand(config, [action, id], flags) {
  if (action === "list") {
    const query = new URLSearchParams();
    for (const key of ["locale", "section", "q"]) {
      const value = stringFlag(flags, key);
      if (value) query.set(key, value);
    }
    const res = await apiRequest(config, "GET", `/docs${query.size ? `?${query}` : ""}`);
    if (flags.json) return printJson(res.data);
    const list = res.data.data;
    printTable(["id", "locale", "title", "sha"], list.docs.map((/** @type {any} */ d) => [d.id, d.locale, d.title ?? "", d.sha.slice(0, 12)]), 60);
    info(`${list.total} files at ${list.ref}@${list.commit_sha.slice(0, 12)} (Git source, may differ from the deployed site).`);
    return;
  }

  if (action === "get") {
    const ref = docRef(id);
    const locale = stringFlag(flags, "locale");
    const res = await apiRequest(config, "GET", `/docs/${ref.section}/${ref.slug}${locale ? `?locale=${encodeURIComponent(locale)}` : ""}`);
    if (flags.json) return printJson(res.data);
    const doc = res.data.data;
    const out = stringFlag(flags, "out");
    if (locale && doc[locale]) {
      if (out) {
        await writeFile(out, doc[locale].content, "utf8");
        info(`Wrote ${out}. Update it with: dewee-web docs update ${id} --${locale} ${out} --${locale}-sha ${doc[locale].sha}`);
      } else process.stdout.write(doc[locale].content);
      return;
    }
    if (out) throw new Error("--out needs --locale en or --locale vi.");
    printTable(["locale", "path", "sha"], ["en", "vi"].filter((l) => doc[l]).map((l) => [l, doc[l].path, doc[l].sha]), 80);
    return;
  }

  if (action === "validate" || action === "create" || action === "update") {
    const ref = docRef(id);
    const note = stringFlag(flags, "note");
    const fields = { ...(await localeFiles(flags)), ...(note ? { note } : {}) };
    if (action === "validate") {
      const mode = flags.create ? "create" : "update";
      const res = await apiRequest(config, "POST", "/docs/validate", { json: { mode, ...ref, ...fields } });
      if (flags.json) return printJson(res.data);
      const report = res.data.data;
      for (const change of report.changes ?? []) process.stdout.write(change.diff);
      printIssues(report);
      info(report.valid ? "Valid: no blocking errors." : "Not valid: fix the errors above.");
      return report.valid ? undefined : 2;
    }
    const key = stringFlag(flags, "idempotency-key");
    const headers = key ? { "idempotency-key": key } : undefined;
    const res =
      action === "create"
        ? await apiRequest(config, "POST", "/docs", { json: { ...ref, ...fields }, headers })
        : await apiRequest(config, "PATCH", `/docs/${ref.section}/${ref.slug}`, { json: fields, headers });
    if (flags.json) return printJson(res.data);
    const result = res.data.data;
    printIssues(result.validation ?? {});
    info(`${result.replayed ? "Already proposed" : "Proposed"} on branch ${result.branch}. Nothing is published until the pull request is merged and deployed.`);
    process.stdout.write(`${result.pull_request.url}\n`);
    return;
  }

  throw new Error(`Unknown command "docs ${action ?? ""}". ${USAGE}`);
}
