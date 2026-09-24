/**
 * Pure search logic for the docs (no DOM, no imports), shared by the browser island and tests.
 * Matching is accent-insensitive so "kenh" finds "kênh", and every query term must match
 * somewhere in a page. Titles weigh most, then headings, section and description, then body text.
 */

/** One page in the prerendered index (short keys keep the JSON small). */
export interface SearchDoc {
  /** title */ t: string;
  /** section label */ s: string;
  /** description */ d: string;
  /** url */ u: string;
  /** headings: [text, anchor id] */ h: [string, string][];
  /** plain-text excerpt of the body */ x: string;
}

export interface PreparedDoc extends SearchDoc {
  ft: string;
  fs: string;
  fd: string;
  fx: string;
  fh: string[];
}

export interface SearchHit {
  doc: PreparedDoc;
  /** Best matching heading, when the title alone does not explain the match. */
  heading?: [string, string];
  url: string;
  score: number;
}

/** Lower-case and strip diacritics one character at a time, so indexes line up with the input. */
export function fold(input: string): string {
  let out = "";
  for (const ch of input) {
    if (ch === "đ" || ch === "Đ") {
      out += "d";
      continue;
    }
    // Keep one output unit per input unit so match offsets map back onto the original text.
    const base = ch.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const lower = ch.toLowerCase();
    out += base.length === ch.length ? base : lower.length === ch.length ? lower : ch;
  }
  return out;
}

export function terms(query: string): string[] {
  return [...new Set(fold(query).split(/[\s,.;:!?/()"'“”]+/).filter((t) => t.length > 0))].slice(0, 8);
}

export function prepare(doc: SearchDoc): PreparedDoc {
  return { ...doc, ft: fold(doc.t), fs: fold(doc.s), fd: fold(doc.d), fx: fold(doc.x), fh: doc.h.map(([text]) => fold(text)) };
}

const wordStart = (hay: string, term: string) => hay.startsWith(term) || hay.includes(` ${term}`);

export function searchDocs(docs: PreparedDoc[], query: string, limit = 8): SearchHit[] {
  const q = terms(query);
  if (q.length === 0) return [];
  const hits: SearchHit[] = [];
  for (const doc of docs) {
    let score = 0;
    let matchedAll = true;
    for (const term of q) {
      let s = 0;
      if (doc.ft.includes(term)) s += wordStart(doc.ft, term) ? 14 : 9;
      if (doc.fh.some((h) => h.includes(term))) s += 5;
      if (doc.fs.includes(term)) s += 3;
      if (doc.fd.includes(term)) s += 3;
      if (doc.fx.includes(term)) s += 1;
      if (s === 0) {
        matchedAll = false;
        break;
      }
      score += s;
    }
    if (!matchedAll) continue;
    let heading: [string, string] | undefined;
    if (!q.every((term) => doc.ft.includes(term))) {
      let best = 0;
      doc.fh.forEach((h, i) => {
        const n = q.filter((term) => h.includes(term)).length;
        if (n > best) {
          best = n;
          heading = doc.h[i];
        }
      });
    }
    hits.push({ doc, heading, url: heading ? `${doc.u}#${heading[1]}` : doc.u, score });
  }
  return hits.sort((a, b) => b.score - a.score || a.doc.t.localeCompare(b.doc.t)).slice(0, limit);
}

/** Split `text` into [segment, isMatch] pairs for highlighting the query terms. */
export function markTerms(text: string, query: string): [string, boolean][] {
  const q = terms(query);
  const folded = fold(text);
  const hit = new Array<boolean>(text.length).fill(false);
  for (const term of q) {
    for (let i = folded.indexOf(term); i !== -1; i = folded.indexOf(term, i + term.length)) {
      hit.fill(true, i, i + term.length);
    }
  }
  const out: [string, boolean][] = [];
  for (let i = 0; i < text.length; ) {
    let j = i;
    while (j < text.length && hit[j] === hit[i]) j++;
    out.push([text.slice(i, j), hit[i]]);
    i = j;
  }
  return out;
}
