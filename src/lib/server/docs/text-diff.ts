/**
 * A compact unified diff for previewing a docs proposal. Common head and tail lines are trimmed
 * first, so the LCS table only covers the changed middle; very large rewrites fall back to
 * "replace everything" hunks instead of spending CPU.
 */
const MAX_CELLS = 4_000_000;
const CONTEXT = 3;

type Op = { kind: " " | "-" | "+"; text: string; a: number; b: number };

function middleOps(a: string[], b: string[], offset: number): Op[] {
  if (a.length * b.length > MAX_CELLS) {
    return [...a.map((text, i) => ({ kind: "-" as const, text, a: offset + i, b: -1 })), ...b.map((text, j) => ({ kind: "+" as const, text, a: -1, b: offset + j }))];
  }
  const w = b.length + 1;
  const lcs = new Uint32Array((a.length + 1) * w);
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i * w + j] = a[i] === b[j] ? lcs[(i + 1) * w + j + 1] + 1 : Math.max(lcs[(i + 1) * w + j], lcs[i * w + j + 1]);
    }
  }
  const ops: Op[] = [];
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) ops.push({ kind: " ", text: a[i++], a: offset + i - 1, b: offset + j++ });
    else if (i < a.length && (j === b.length || lcs[(i + 1) * w + j] >= lcs[i * w + j + 1])) ops.push({ kind: "-", text: a[i++], a: offset + i - 1, b: -1 });
    else ops.push({ kind: "+", text: b[j++], a: -1, b: offset + j - 1 });
  }
  return ops;
}

export function unifiedDiff(before: string, after: string, path: string): { diff: string; added: number; removed: number } {
  const a = before === "" ? [] : before.split("\n");
  const b = after.split("\n");
  let head = 0;
  while (head < a.length && head < b.length && a[head] === b[head]) head++;
  let tail = 0;
  while (tail < a.length - head && tail < b.length - head && a[a.length - 1 - tail] === b[b.length - 1 - tail]) tail++;

  const ops: Op[] = [
    ...a.slice(0, head).map((text, k) => ({ kind: " " as const, text, a: k, b: k })),
    ...middleOps(a.slice(head, a.length - tail), b.slice(head, b.length - tail), head),
    ...a.slice(a.length - tail).map((text, k) => ({ kind: " " as const, text, a: a.length - tail + k, b: b.length - tail + k })),
  ];
  const added = ops.filter((o) => o.kind === "+").length;
  const removed = ops.filter((o) => o.kind === "-").length;
  if (!added && !removed) return { diff: "", added, removed };

  const out = [`--- ${before === "" ? "/dev/null" : `a/${path}`}`, `+++ b/${path}`];
  const changed = ops.map((o, k) => (o.kind === " " ? -1 : k)).filter((k) => k >= 0);
  let start = 0;
  while (start < changed.length) {
    let end = start;
    while (end + 1 < changed.length && changed[end + 1] - changed[end] <= CONTEXT * 2 + 1) end++;
    const from = Math.max(0, changed[start] - CONTEXT);
    const to = Math.min(ops.length - 1, changed[end] + CONTEXT);
    const slice = ops.slice(from, to + 1);
    const aLines = slice.filter((o) => o.kind !== "+");
    const bLines = slice.filter((o) => o.kind !== "-");
    const aStart = aLines.length ? aLines[0].a + 1 : 0;
    const bStart = bLines.length ? bLines[0].b + 1 : 0;
    out.push(`@@ -${aStart},${aLines.length} +${bStart},${bLines.length} @@`);
    for (const o of slice) out.push(`${o.kind}${o.text}`);
    start = end + 1;
  }
  return { diff: out.join("\n"), added, removed };
}
