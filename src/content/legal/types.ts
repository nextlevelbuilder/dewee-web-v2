/**
 * Shapes shared by the legal pages (/terms, /policy, /privacy, /cookies, /gdpr).
 * Bodies are a short list of typed blocks instead of Markdown, so every page renders through
 * the same safe inline markup (*em*, [text](/path), `code`) and content never carries HTML.
 */

/** One piece of a section body. A bare string is a paragraph. */
export type LegalBlock =
  | string
  /** A small sub-heading (h3) inside a section */
  | { sub: string }
  /** Bullet list */
  | { list: string[] }
  /** Numbered list, for step-by-step instructions */
  | { steps: string[] }
  /** Term and explanation pairs, e.g. each GDPR right */
  | { defs: [term: string, text: string][] }
  /** A small table; on narrow screens each row becomes a labelled card */
  | { table: { head: string[]; rows: string[][] } };

export type LegalSection = {
  /** Stable anchor used by other pages, e.g. "refunds" for /policy#refunds */
  id: string;
  title: string;
  /** The plain-language "short version" shown above the full text */
  short: string;
  body: LegalBlock[];
};

export type LegalDoc = {
  meta: { title: string; description: string; crumb: string };
  hero: { eyebrow: string; title: string; lede: string };
  sections: LegalSection[];
};

export type LegalSlug = "terms" | "policy" | "privacy" | "cookies" | "gdpr";
