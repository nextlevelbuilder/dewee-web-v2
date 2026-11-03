/**
 * Pure helpers for "Insert at cursor" in the post editor: give the new widget an id no other
 * block uses, and put its `::widget{id="…"}` line in the body as a block of its own (blank lines
 * around it), at the cursor or, mid-line, after the current line.
 */

/** `gallery-1`, `gallery-2`, … from the type, skipping ids already taken. */
export function uniqueWidgetId(type: string, blocks: readonly unknown[]): string {
  const taken = new Set(blocks.map((b) => (b && typeof b === "object" ? (b as { id?: unknown }).id : undefined)).filter((id): id is string => typeof id === "string"));
  const base = type.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "widget";
  for (let n = 1; ; n++) {
    const id = `${base}-${n}`;
    if (!taken.has(id)) return id;
  }
}

/** The body with the directive inserted, and where to put the cursor (after the directive line). */
export function insertDirective(body: string, cursor: number, id: string): { text: string; cursor: number } {
  const at = Math.min(Math.max(cursor, 0), body.length);
  // Mid-line: move to the end of that line so a sentence is never cut in two.
  const lineEnd = body.indexOf("\n", at);
  const pos = body.slice(0, at).endsWith("\n") || at === 0 ? at : lineEnd === -1 ? body.length : lineEnd;
  const before = body.slice(0, pos).replace(/\n*$/, "");
  const after = body.slice(pos).replace(/^\n*/, "");
  const line = `::widget{id="${id}"}`;
  const head = before ? `${before}\n\n${line}` : line;
  return after ? { text: `${head}\n\n${after}`, cursor: head.length + 2 } : { text: `${head}\n`, cursor: head.length + 1 };
}
