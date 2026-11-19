/**
 * Shared bits for the post widget renderers (isomorphic): labels, escaping helpers and icons.
 * Renderers build HTML strings from props that the block registry has just validated; every
 * text and attribute still goes through `escapeHtml` (or `inlineMarkup`, which escapes first).
 */
import { ICONS, type IconName } from "../../../components/ui/icon-paths";
import { escapeHtml } from "../../inline-markup";

/** UI strings for one locale (copy lives in src/content/pages/blog.ts as `BLOG.widgets`). */
export type WidgetLabels = {
  copy: string;
  copied: string;
  copyFailed: string;
  plainCode: string;
  gallery: string;
  previous: string;
  next: string;
  slideOf: string;
  play: string;
  watchOn: string;
  videoFile: string;
  viewOn: string;
  postBy: string;
  previewOnly: string;
  noticeMissing: string;
  noticeInvalid: string;
  noticeMalformed: string;
  noticeNested: string;
  noticeDuplicate: string;
  noticeUnplacedInvalid: string;
  numberLocale: string;
  chartBar: string;
  chartLine: string;
  chartPie: string;
  chartDonut: string;
  chartRange: string;
  chartCategory: string;
  chartShare: string;
  viewData: string;
  source: string;
  diagramSource: string;
  diagramFailed: string;
  markYes: string;
  markNo: string;
  markPartial: string;
  criterion: string;
  recommended: string;
  before: string;
  after: string;
  compareSlider: string;
  compareValue: string;
  formVote: string;
  formCheck: string;
  formSend: string;
  formNotice: string;
  formSurveyNotice: string;
  formPreview: string;
  formOptional: string;
  formTextHint: string;
  formResults: string;
  formVotes: string;
  formVoteOne: string;
  formYours: string;
  formCorrect: string;
  formIncorrect: string;
  formAnswerIs: string;
  formChange: string;
  formThanks: string;
  formClosed: string;
  formErrorPick: string;
  formErrorRate: string;
  formErrorAlready: string;
  formError: string;
  formBack: string;
  formSaved: string;
  demoLoad: string;
  demoOpen: string;
  demoNote: string;
};

export type RenderMode = "public" | "preview";
/**
 * `postId` is set only on the public page (never in the preview or text exports) and `widgetId`
 * is the block's id; widgets that store reader answers need both to post their form.
 */
export type WidgetContext = { labels: WidgetLabels; postId?: string; widgetId?: string };

export const esc = escapeHtml;

/** Fills `{name}` placeholders; values are escaped by the caller's output path, not here. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

/** `name="value"` pairs for defined values only; booleans become bare attributes. */
export function attrs(pairs: Record<string, string | number | boolean | undefined | null>): string {
  return Object.entries(pairs)
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => (v === true ? ` ${k}` : ` ${k}="${esc(String(v))}"`))
    .join("");
}

export function icon(name: IconName, size = 18): string {
  return `<svg class="icon" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;
}

/** The optional heading reused page blocks carry; an h2 in a post, so heading levels never skip. */
export function blockHeading(heading: unknown, inline: (s: string) => string): string {
  if (!heading || typeof heading !== "object") return "";
  const h = heading as { eyebrow?: string; title?: string; lede?: string };
  if (!h.title) return "";
  return (
    `<header class="pw-head">` +
    (h.eyebrow ? `<p class="pw-head__eyebrow">${esc(h.eyebrow)}</p>` : "") +
    `<h2 class="pw-head__title">${inline(h.title)}</h2>` +
    (h.lede ? `<p class="pw-head__lede">${inline(h.lede)}</p>` : "") +
    `</header>`
  );
}
