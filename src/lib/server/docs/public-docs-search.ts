/**
 * Search and read the published docs for the public docs MCP tools. Pure: it works on the docs
 * corpus that the build writes to /docs/corpus.json (and /vi/docs/corpus.json), so it answers
 * from what is deployed, not from Git, and runs under vitest.
 */
import { fold, prepare, searchDocs, terms, type PreparedDoc } from "../../../components/docs/docs-search-core";
import { markdownToPlainText } from "../../docs-plain-text";

/** One published docs page in the corpus. */
export interface CorpusDoc {
  /** Path inside the locale, e.g. `runtime/environment-variables`. */
  slug: string;
  /** Site path, e.g. `/vi/docs/runtime/environment-variables`. */
  url: string;
  title: string;
  description: string;
  section: string;
  sectionTitle: string;
  /** Level 2 and 3 headings: [text, anchor id]. */
  headings: [string, string][];
  /** Page Markdown without front matter; screenshot markers already turned into images. */
  markdown: string;
}

export interface DocsSearchHit {
  slug: string;
  title: string;
  description: string;
  section: string;
  url: string;
  heading?: string;
  snippet: string;
}

const SNIPPET_RADIUS = 140;

type Indexed = { prepared: PreparedDoc[]; bySlug: Map<string, CorpusDoc>; plain: Map<string, string> };
const indexes = new WeakMap<CorpusDoc[], Indexed>();

function indexOf(corpus: CorpusDoc[]): Indexed {
  let idx = indexes.get(corpus);
  if (!idx) {
    const plain = new Map<string, string>();
    const prepared = corpus.map((d) => {
      const text = markdownToPlainText(d.markdown);
      plain.set(d.url, text);
      return prepare({ t: d.title, s: d.sectionTitle, d: d.description, u: d.url, h: d.headings, x: text });
    });
    idx = { prepared, bySlug: new Map(corpus.map((d) => [d.slug, d])), plain };
    indexes.set(corpus, idx);
  }
  return idx;
}

/** A short excerpt around the first query term found in the page text (falls back to the start). */
function snippet(text: string, query: string): string {
  const folded = fold(text);
  let at = -1;
  for (const term of terms(query)) {
    at = folded.indexOf(term);
    if (at >= 0) break;
  }
  const from = Math.max(0, (at < 0 ? 0 : at) - SNIPPET_RADIUS);
  const to = Math.min(text.length, (at < 0 ? 0 : at) + SNIPPET_RADIUS * 2);
  return `${from > 0 ? "…" : ""}${text.slice(from, to).trim()}${to < text.length ? "…" : ""}`;
}

/** Every query word must appear somewhere in a page; titles weigh most, then headings, then text. */
export function searchCorpus(corpus: CorpusDoc[], query: string, limit: number, origin: string): DocsSearchHit[] {
  const idx = indexOf(corpus);
  return searchDocs(idx.prepared, query, limit).map((hit) => {
    const doc = corpus.find((d) => d.url === hit.doc.u)!;
    return {
      slug: doc.slug,
      title: doc.title,
      description: doc.description,
      section: doc.sectionTitle,
      url: origin + hit.url,
      ...(hit.heading ? { heading: hit.heading[0] } : {}),
      snippet: snippet(idx.plain.get(doc.url) ?? "", query),
    };
  });
}

/** Accepts `runtime/cli`, `/docs/runtime/cli`, `/vi/docs/runtime/cli#x` or a full URL. */
export function normaliseSlug(input: string): string {
  let s = input.trim();
  try {
    if (/^https?:\/\//i.test(s)) s = new URL(s).pathname;
  } catch {
    /* not a URL: treat as a path */
  }
  s = s.replace(/[#?].*$/, "").replace(/\.md$/, "").replace(/^\/+|\/+$/g, "");
  s = s.replace(/^vi\//, "").replace(/^docs(\/|$)/, "");
  return s;
}

export interface ReadDocResult {
  slug: string;
  title: string;
  description: string;
  section: string;
  url: string;
  headings: string[];
  markdown: string;
  /** Characters of Markdown in the whole page. */
  total_chars: number;
  /** Offset to pass back for the rest of the page; absent when this is the end. */
  next_offset?: number;
}

/** One page's Markdown, cut into pieces of at most `maxChars` so large pages fit a reply. */
export function readCorpusDoc(corpus: CorpusDoc[], slugInput: string, offset: number, maxChars: number, origin: string): ReadDocResult | null {
  const doc = indexOf(corpus).bySlug.get(normaliseSlug(slugInput));
  if (!doc) return null;
  const piece = doc.markdown.slice(offset, offset + maxChars);
  const end = offset + piece.length;
  return {
    slug: doc.slug,
    title: doc.title,
    description: doc.description,
    section: doc.sectionTitle,
    url: origin + doc.url,
    headings: doc.headings.map(([text]) => text),
    markdown: piece,
    total_chars: doc.markdown.length,
    ...(end < doc.markdown.length ? { next_offset: end } : {}),
  };
}
