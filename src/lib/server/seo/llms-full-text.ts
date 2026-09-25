/**
 * Builds the body of /llms-full.txt from Markdown twins: every section starts with
 * `# Title` and `Source: <url>`, and the twin's own headings move down one level so the
 * document keeps a single heading hierarchy. Shared by the build pass and the worker route.
 */

export const LLMS_FULL_MAX_BYTES = 2_000_000;

/** Removes the YAML front matter a twin starts with. */
export function stripFrontMatter(md: string): string {
  return md.replace(/^---\n[\s\S]*?\n---\n+/, "");
}

/** `#` → `##` … (capped at h6), leaving fenced code untouched. */
export function demoteHeadings(md: string): string {
  let fenced = false;
  return md
    .split("\n")
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) fenced = !fenced;
      if (fenced) return line;
      return line.replace(/^(#{1,5}) /, "#$1 ");
    })
    .join("\n");
}

export type FullTextEntry = { title: string; url: string; markdown: string };

/** One page's section of llms-full.txt. */
export function fullTextSection(entry: FullTextEntry): string {
  const body = demoteHeadings(stripFrontMatter(entry.markdown))
    .replace(/^## .*\n+/, (first) => (first.slice(3).trim() === entry.title.trim() ? "" : first))
    .trim();
  return `# ${entry.title}\n\nSource: ${entry.url}\n\n${body}\n`;
}

/** Joins sections in order, stopping before the byte budget is exceeded. */
export function joinWithinBudget(sections: string[], maxBytes = LLMS_FULL_MAX_BYTES): { text: string; included: number } {
  const encoder = new TextEncoder();
  const out: string[] = [];
  let bytes = 0;
  for (const section of sections) {
    const size = encoder.encode(section).length + 1;
    if (bytes + size > maxBytes) break;
    out.push(section);
    bytes += size;
  }
  return { text: out.join("\n"), included: out.length };
}
