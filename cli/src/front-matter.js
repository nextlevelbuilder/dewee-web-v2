// @ts-check
/**
 * Front matter for Markdown posts: a `---` fenced block of simple YAML at the top of the file.
 * Supported (enough for post metadata, no dependency): `key: value` scalars (plain, "double" or
 * 'single' quoted, true/false/null, numbers), inline lists `[a, b]`, block lists (`- item`), and
 * one level of nested maps (`seo:` followed by indented `key: value` lines). `#` starts a comment
 * outside quotes.
 */

/** @typedef {string | number | boolean | null | Scalar[]} Scalar */
/** @typedef {Record<string, Scalar | Record<string, Scalar>>} FrontMatter */

/** @param {string} line */
function stripComment(line) {
  let quote = "";
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quote) {
      if (c === quote) quote = "";
    } else if (c === '"' || c === "'") quote = c;
    else if (c === "#" && (i === 0 || /\s/.test(line[i - 1]))) return line.slice(0, i);
  }
  return line;
}

/**
 * @param {string} raw
 * @returns {Scalar}
 */
export function parseScalar(raw) {
  const v = raw.trim();
  if (v === "" || v === "~" || v === "null") return null;
  if (v === "true") return true;
  if (v === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  if (v.startsWith('"') && v.endsWith('"') && v.length >= 2) {
    return JSON.parse(v);
  }
  if (v.startsWith("'") && v.endsWith("'") && v.length >= 2) return v.slice(1, -1).replace(/''/g, "'");
  if (v.startsWith("[") && v.endsWith("]")) {
    const inner = v.slice(1, -1).trim();
    if (!inner) return [];
    return splitList(inner).map(parseScalar);
  }
  return v;
}

/** Splits `a, "b, c", d` on commas outside quotes. @param {string} s */
function splitList(s) {
  /** @type {string[]} */
  const out = [];
  let cur = "";
  let quote = "";
  for (const c of s) {
    if (quote) {
      if (c === quote) quote = "";
      cur += c;
    } else if (c === '"' || c === "'") {
      quote = c;
      cur += c;
    } else if (c === ",") {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out.map((x) => x.trim()).filter((x) => x !== "");
}

/**
 * @param {string} source
 * @returns {{ data: FrontMatter, body: string }}
 */
export function parseFrontMatter(source) {
  const text = source.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  if (!text.startsWith("---\n")) return { data: {}, body: text };
  const end = text.indexOf("\n---", 3);
  if (end === -1) throw new Error("Front matter starts with --- but never closes.");
  const afterFence = text.indexOf("\n", end + 4);
  const body = afterFence === -1 ? "" : text.slice(afterFence + 1);
  /** @type {FrontMatter} */
  const data = {};
  /** @type {{ key: string, kind: "list" | "map" | "pending" } | null} */
  let open = null;
  const lines = text.slice(4, end).split("\n");
  lines.forEach((rawLine, index) => {
    const line = stripComment(rawLine).replace(/\s+$/, "");
    if (!line.trim()) return;
    const indented = /^\s+/.test(line);
    const where = `front matter line ${index + 2}`;
    if (indented && open) {
      const item = line.trim();
      if (item.startsWith("- ") || item === "-") {
        if (open.kind === "map") throw new Error(`${where}: mixing a list into the map "${open.key}".`);
        if (open.kind === "pending") ((open.kind = "list"), (data[open.key] = []));
        /** @type {Scalar[]} */ (data[open.key]).push(parseScalar(item.slice(1)));
        return;
      }
      const m = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(item);
      if (!m) throw new Error(`${where}: expected "key: value".`);
      if (open.kind === "list") throw new Error(`${where}: mixing a map into the list "${open.key}".`);
      if (open.kind === "pending") ((open.kind = "map"), (data[open.key] = {}));
      /** @type {Record<string, Scalar>} */ (data[open.key])[m[1]] = parseScalar(m[2]);
      return;
    }
    if (indented) throw new Error(`${where}: unexpected indentation.`);
    const m = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (!m) throw new Error(`${where}: expected "key: value".`);
    const [, key, rest] = m;
    if (rest.trim() === "") {
      open = { key, kind: "pending" };
      data[key] = null;
    } else {
      open = null;
      data[key] = parseScalar(rest);
    }
  });
  return { data, body };
}
