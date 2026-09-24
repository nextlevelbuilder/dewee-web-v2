/**
 * `pages …` and `posts …`: list, get, create, update, publish, unpublish. Pages take JSON (a
 * fields file and/or flags); posts take a Markdown file whose front matter holds the metadata.
 */
import { readFile } from "node:fs/promises";
import { intFlag, stringFlag } from "../args.js";
import { parseFrontMatter } from "../front-matter.js";
import { apiRequest, itemPath } from "../http.js";
import { info, printJson, printTable } from "../output.js";

const POST_KEYS = new Set(["title", "slug", "locale", "description", "tags", "author", "cover", "translation_key", "translationKey", "seo", "layout", "status"]);

/** @param {string} path */
async function readJsonFile(path) {
  let text;
  try {
    text = await readFile(path, "utf8");
  } catch (err) {
    throw new Error(`Cannot read ${path}: ${err instanceof Error ? err.message : err}`);
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    throw new Error(`${path} is not valid JSON: ${err instanceof Error ? err.message : err}`);
  }
}

/**
 * Metadata + body from a Markdown post file.
 * @param {string} path
 * @returns {Promise<Record<string, unknown>>}
 */
export async function postFieldsFromMarkdown(path) {
  const { data, body } = parseFrontMatter(await readFile(path, "utf8"));
  /** @type {Record<string, unknown>} */
  const fields = {};
  for (const [key, value] of Object.entries(data)) {
    if (!POST_KEYS.has(key)) throw new Error(`${path}: unknown front matter key "${key}". Allowed: ${[...POST_KEYS].join(", ")}.`);
    if (value === null) continue;
    if (key === "translationKey") fields.translation_key = value;
    else if (key === "tags") fields.tags = Array.isArray(value) ? value.map(String) : String(value).split(",").map((t) => t.trim()).filter(Boolean);
    else fields[key] = value;
  }
  fields.body_md = body.replace(/^\n+/, "");
  return fields;
}

/**
 * Page fields from `--file` plus individual flags (flags win).
 * @param {Record<string, string | true>} flags
 */
async function pageFieldsFromFlags(flags) {
  const file = stringFlag(flags, "file");
  /** @type {Record<string, unknown>} */
  const fields = file ? await readJsonFile(file) : {};
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) throw new Error("--file must contain a JSON object of page fields.");
  const map = { title: "title", slug: "slug", locale: "locale", description: "description", layout: "layout", "translation-key": "translation_key", note: "note" };
  for (const [flag, key] of Object.entries(map)) {
    const v = stringFlag(flags, flag);
    if (v !== undefined) fields[key] = v;
  }
  const blocks = stringFlag(flags, "blocks");
  if (blocks) fields.blocks = await readJsonFile(blocks);
  return fields;
}

/**
 * @param {"page" | "post"} kind
 * @param {{ url: string, apiKey: string | null }} config
 * @param {string[]} args  positionals after the sub-command
 * @param {Record<string, string | true>} flags
 */
export async function contentCommand(kind, config, [action, ...args], flags) {
  const plural = kind === "page" ? "pages" : "posts";
  const locale = stringFlag(flags, "locale");
  const version = intFlag(flags, "version");
  const need = (/** @type {string | undefined} */ v, /** @type {string} */ what) => {
    if (!v) throw new Error(`Missing ${what}. See \`dewee-web ${plural} --help\`.`);
    return v;
  };
  const show = (/** @type {any} */ res, /** @type {string} */ verb) => {
    if (flags.json) return printJson(res.data);
    const r = res.data.data;
    info(`${verb} ${kind} ${r.id} (v${r.version}, ${r.status}) ${config.url}${r.url}`);
  };

  switch (action) {
    case "list": {
      const q = new URLSearchParams();
      for (const k of ["q", "status", "locale", "tag"]) {
        const v = stringFlag(flags, k);
        if (v) q.set(k, v);
      }
      for (const k of ["limit", "offset"]) {
        const v = intFlag(flags, k);
        if (v !== undefined) q.set(k, String(v));
      }
      const res = await apiRequest(config, "GET", `/${plural}${q.size ? `?${q}` : ""}`);
      if (flags.json) return printJson(res.data);
      const rows = res.data.data.map((/** @type {any} */ p) => [p.id, p.locale, p.status, p.version, p.slug, p.title]);
      printTable(["id", "lang", "status", "v", "slug", "title"], rows);
      info(`${res.data.data.length} of ${res.data.pagination.total}`);
      return;
    }
    case "get": {
      const res = await apiRequest(config, "GET", `/${plural}/${itemPath(need(args[0], "an id or slug"), locale)}`);
      return printJson(res.data.data);
    }
    case "create": {
      const fields = kind === "post" ? await postFieldsFromMarkdown(need(args[0], "a Markdown file")) : await pageFieldsFromFlags(flags);
      if (kind === "post" && locale) fields.locale = locale;
      if (flags.publish) fields.status = "published";
      const res = await apiRequest(config, "POST", `/${plural}`, { json: fields, headers: idempotency(flags) });
      return show(res, "Created");
    }
    case "update": {
      const ref = need(args[0], "an id or slug");
      const fields = kind === "post" ? await postFieldsFromMarkdown(need(args[1], "a Markdown file")) : await pageFieldsFromFlags(flags);
      delete fields.status;
      if (version !== undefined) fields.version = version;
      const note = stringFlag(flags, "note");
      if (note) fields.note = note;
      const res = await apiRequest(config, "PATCH", `/${plural}/${itemPath(ref, locale)}`, { json: fields });
      return show(res, "Updated");
    }
    case "publish":
    case "unpublish": {
      const ref = need(args[0], "an id or slug");
      const res = await apiRequest(config, "POST", `/${plural}/${itemPath(ref, locale)}/${action}`, { json: version !== undefined ? { version } : {} });
      return show(res, action === "publish" ? "Published" : "Unpublished");
    }
    default:
      throw new Error(`Unknown command "${plural} ${action ?? ""}". See \`dewee-web ${plural} --help\`.`);
  }
}

/** @param {Record<string, string | true>} flags */
function idempotency(flags) {
  const key = stringFlag(flags, "idempotency-key");
  return key ? { "idempotency-key": key } : {};
}
