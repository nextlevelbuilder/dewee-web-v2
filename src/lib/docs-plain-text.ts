/**
 * Docs Markdown → plain text for matching words (not for display). Pure, so the build-time search
 * index, the docs corpus and the worker-side docs search share it, and vitest can import it
 * without `astro:content`.
 */

/**
 * A screenshot marker is a paragraph of its own: `::shot{id="agents"}`.
 * The HTML form tolerates the curly quotes that smart punctuation produces.
 */
export const SHOT_LINE_RE = /^::shot\{id="([a-z0-9-]+)"\}[ \t]*$/gm;

export function markdownToPlainText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(SHOT_LINE_RE, " ")
    .replace(/^>\s*\[![a-z]+\]/gim, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+>]\s?/gm, " ")
    .replace(/\|/g, " ")
    .replace(/[*`~]|-{3,}/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
