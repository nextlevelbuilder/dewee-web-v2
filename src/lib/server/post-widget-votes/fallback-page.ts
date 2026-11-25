/**
 * The no-JavaScript answer to a widget form: a small, private HTML page with the outcome, the
 * results the reader may see (public-results.ts) and a link back to the widget in the post.
 * Readers with JavaScript never see it; the client renders the same data inline.
 */
import { localePath, type Locale } from "../../../i18n/config";
import { escapeHtml as esc } from "../../inline-markup";
import { fill, type WidgetLabels } from "../../blocks/post-widgets/widget-html";
import type { OptionTally } from "../../blocks/interactive-answers";
import type { PublicResult } from "./public-results";

export type FallbackInput = {
  locale: Locale;
  labels: WidgetLabels;
  status: number;
  /** A sentence for the reader: the thanks line or the error. */
  message: string;
  question?: string;
  result?: PublicResult;
  /** Where "Back to the post" leads: the post path plus the widget anchor. */
  back: string;
};

function tallyHtml(options: OptionTally[], total: number, labels: WidgetLabels, mark: (id: string) => string): string {
  const votes = total === 1 ? labels.formVoteOne : fill(labels.formVotes, { n: total });
  const rows = options
    .map((o) => `<li><span>${esc(o.label)}${mark(o.id)}</span><b>${o.percent}%</b><meter min="0" max="100" value="${o.percent}">${o.percent}%</meter></li>`)
    .join("");
  return `<h2>${esc(labels.formResults)}</h2><ul>${rows}</ul><p class="muted">${esc(votes)}</p>`;
}

function resultHtml(result: PublicResult | undefined, labels: WidgetLabels): string {
  if (!result || result.type === "Survey") return "";
  if (result.type === "Poll") return tallyHtml(result.options, result.total, labels, (id) => (id === result.choice ? ` <em>(${esc(labels.formYours)})</em>` : ""));
  if (!result.answered) return "";
  const answer = result.options.find((o) => o.id === result.answer)?.label ?? "";
  return (
    `<p><strong>${esc(result.correct ? labels.formCorrect : labels.formIncorrect)}</strong> ${esc(fill(labels.formAnswerIs, { answer }))}</p>` +
    `<p>${esc(result.explanation)}</p>` +
    tallyHtml(result.options, result.total, labels, (id) => (id === result.choice ? ` <em>(${esc(labels.formYours)})</em>` : ""))
  );
}

export function postPath(locale: Locale, slug: string, widgetId?: string): string {
  return `${localePath(locale, `/blog/${slug}`)}${widgetId ? `#pw-${widgetId}` : ""}`;
}

export function fallbackPage(input: FallbackInput): Response {
  const { labels } = input;
  const title = input.status < 300 ? labels.formSaved : labels.formError;
  const html =
    `<!doctype html><html lang="${input.locale}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">` +
    `<meta name="robots" content="noindex"><meta name="color-scheme" content="light dark"><title>${esc(title)}</title>` +
    `<style>body{font:1rem/1.6 system-ui,sans-serif;max-width:40rem;margin:2rem auto;padding:0 1rem}ul{list-style:none;padding:0}li{display:grid;grid-template-columns:1fr auto;gap:.25rem 1rem;margin:.75rem 0}meter{grid-column:1/-1;width:100%}.muted{opacity:.75}a{display:inline-block;padding:.75rem 0}</style></head>` +
    `<body><main><h1>${esc(title)}</h1>${input.question ? `<p><strong>${esc(input.question)}</strong></p>` : ""}<p>${esc(input.message)}</p>` +
    resultHtml(input.result, labels) +
    `<p><a href="${esc(input.back)}">${esc(labels.formBack)}</a></p></main></body></html>`;
  return new Response(html, {
    status: input.status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex, nofollow" },
  });
}
