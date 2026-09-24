/** Terminal output: raw JSON with --json, aligned tables otherwise; messages go to stderr. */

/** @param {unknown} value */
export function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

/**
 * Fixed-width table; long cells are cut with an ellipsis.
 * @param {string[]} headers
 * @param {Array<Array<string | number | null | undefined>>} rows
 * @param {number} [max]
 */
export function printTable(headers, rows, max = 48) {
  const cells = rows.map((r) => r.map((c) => {
    const s = c === null || c === undefined ? "" : String(c);
    return s.length > max ? `${s.slice(0, max - 1)}…` : s;
  }));
  const widths = headers.map((h, i) => Math.max(h.length, ...cells.map((r) => (r[i] ?? "").length)));
  const line = (/** @type {string[]} */ r) => r.map((c, i) => c.padEnd(widths[i])).join("  ").trimEnd();
  process.stdout.write(`${line(headers)}\n${line(widths.map((w) => "-".repeat(w)))}\n`);
  for (const r of cells) process.stdout.write(`${line(r)}\n`);
}

/** @param {string} message */
export function info(message) {
  process.stderr.write(`${message}\n`);
}
