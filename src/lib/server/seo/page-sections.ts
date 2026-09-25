/**
 * Which part of the site a page belongs to, derived from its unprefixed path so new pages are
 * classified without a route list. Used for the social-card eyebrow, the llms.txt sections and
 * the llms-full.txt order. Unknown paths fall into "other" (listed under "Optional").
 */
import type { Bi } from "../../../i18n/config.ts";

export type SectionId =
  | "home" | "product" | "changelog" | "use-cases" | "docs" | "pricing" | "legal"
  | "company" | "blog" | "developers" | "pages" | "other";

const RULES: Array<[RegExp, SectionId]> = [
  [/^\/$/, "home"],
  [/^\/docs(\/|$)/, "docs"],
  [/^\/use-cases(\/|$)/, "use-cases"],
  [/^\/(features|architecture|security|integrations|roadmap)(\/|$)/, "product"],
  [/^\/changelog(\/|$)/, "changelog"],
  [/^\/(pricing|install)(\/|$)/, "pricing"],
  [/^\/(terms|policy|privacy|cookies|gdpr)(\/|$)/, "legal"],
  [/^\/(story|about|partners|contact)(\/|$)/, "company"],
  [/^\/blog(\/|$)/, "blog"],
  [/^\/(developers|api-docs)(\/|$)/, "developers"],
  [/^\/p\//, "pages"],
];

export function sectionOf(path: string): SectionId {
  return RULES.find(([re]) => re.test(path))?.[1] ?? "other";
}

/** Eyebrow shown on the page's social card. */
export const SECTION_LABEL: Record<SectionId, Bi> = {
  home: { en: "Enterprise AI agents", vi: "AI agent cho doanh nghiệp" },
  product: { en: "Product", vi: "Sản phẩm" },
  changelog: { en: "Changelog", vi: "Nhật ký thay đổi" },
  "use-cases": { en: "Use cases", vi: "Ứng dụng" },
  docs: { en: "Docs", vi: "Tài liệu" },
  pricing: { en: "Pricing & deployment", vi: "Bảng giá & triển khai" },
  legal: { en: "Legal", vi: "Pháp lý" },
  company: { en: "Company", vi: "Công ty" },
  blog: { en: "Blog", vi: "Blog" },
  developers: { en: "Developers", vi: "Nhà phát triển" },
  pages: { en: "dewee", vi: "dewee" },
  other: { en: "dewee", vi: "dewee" },
};

/** llms.txt sections, in reading order; `Optional` is the llmstxt.org "skippable" section. */
export const LLMS_GROUPS: Array<{ title: Bi; members: SectionId[] }> = [
  { title: { en: "Product", vi: "Sản phẩm" }, members: ["home", "product", "changelog"] },
  { title: { en: "Use cases", vi: "Ứng dụng" }, members: ["use-cases"] },
  { title: { en: "Docs", vi: "Tài liệu" }, members: ["docs"] },
  { title: { en: "Pricing & legal", vi: "Bảng giá & pháp lý" }, members: ["pricing", "legal"] },
  { title: { en: "Company", vi: "Công ty" }, members: ["company", "blog"] },
  { title: { en: "Developers", vi: "Nhà phát triển" }, members: ["developers"] },
  { title: { en: "Optional", vi: "Optional" }, members: ["pages", "other"] },
];

/** llms-full.txt order: docs first, then the product story, then everything else. */
const FULL_ORDER: SectionId[] = ["docs", "home", "product", "use-cases", "pricing", "developers", "changelog", "company", "blog", "legal", "pages", "other"];

export function fullTextRank(section: SectionId): number {
  const i = FULL_ORDER.indexOf(section);
  return i === -1 ? FULL_ORDER.length : i;
}
