/**
 * Poll, Quiz and Survey as real <form>s that POST to /api/post-widgets/vote. Without JavaScript
 * the browser submits the form and the endpoint answers with a small results page; with it,
 * interactive-widgets-client.ts submits through fetch and shows the results inline. A quiz's
 * answer and explanation are never in this HTML: the endpoint reveals them after an answer.
 * In the admin preview (no post id) the form renders disabled.
 */
import type { PollProps, QuizProps, SurveyProps, SurveyQuestion } from "../interactive-answers";
import { SURVEY_TEXT_MAX } from "../interactive-block-schemas";
import type { PostWidget } from "./post-widget-types";
import { attrs, esc, fill, type WidgetContext, type WidgetLabels } from "./widget-html";

export const VOTE_ACTION = "/api/post-widgets/vote";

/** The strings the client needs to draw results and errors, carried on each form. */
export function formClientLabels(labels: WidgetLabels): Record<string, string> {
  const keys = ["formResults", "formVotes", "formVoteOne", "formYours", "formCorrect", "formIncorrect", "formAnswerIs", "formChange", "formThanks", "formClosed", "formErrorPick", "formErrorRate", "formErrorAlready", "formError"] as const;
  return Object.fromEntries(keys.map((k) => [k, labels[k]]));
}

const choiceList = (name: string, type: "radio" | "checkbox", options: { id: string; label: string }[], idBase: string, required: boolean) =>
  `<div class="pw-form__options">${options
    .map((o) => `<label class="pw-form__option" for="${esc(`${idBase}-${o.id}`)}"><input${attrs({ type, id: `${idBase}-${o.id}`, name, value: o.id, required: required && type === "radio" })} /><span>${esc(o.label)}</span></label>`)
    .join("")}</div>`;

type Shell = { type: "Poll" | "Quiz" | "Survey"; ctx: WidgetContext; body: string; submit: string; notice: string; closesAt?: string };

function formShell({ type, ctx, body, submit, notice, closesAt }: Shell): string {
  const live = Boolean(ctx.postId && ctx.widgetId);
  const anchor = ctx.widgetId ? `pw-${ctx.widgetId}` : undefined;
  return (
    `<form${attrs({
      class: `pw-form pw-form--${type.toLowerCase()}`,
      id: anchor,
      method: "post",
      action: VOTE_ACTION,
      "data-pw-form": live ? type : undefined,
      "data-pw-post": live ? ctx.postId : undefined,
      "data-pw-widget": live ? ctx.widgetId : undefined,
      "data-pw-closes": closesAt,
      "data-pw-labels": live ? JSON.stringify(formClientLabels(ctx.labels)) : undefined,
    })}>` +
    (live ? `<input type="hidden" name="post" value="${esc(ctx.postId ?? "")}" /><input type="hidden" name="widget" value="${esc(ctx.widgetId ?? "")}" />` : "") +
    `<fieldset class="pw-form__set"${live ? "" : " disabled"} data-pw-set>${body}` +
    `<div class="pw-form__actions"><button class="btn btn--primary" type="submit">${esc(submit)}</button></div></fieldset>` +
    `<div class="pw-form__results" data-pw-results hidden></div>` +
    `<p class="pw-form__status" role="status" aria-live="polite" data-pw-status></p>` +
    `<p class="pw-form__note">${esc(live ? notice : ctx.labels.formPreview)}</p></form>`
  );
}

const idBase = (ctx: WidgetContext, suffix: string) => `pw-${ctx.widgetId ?? "x"}-${suffix}`;

function choiceForm(type: "Poll" | "Quiz", p: PollProps, ctx: WidgetContext): string {
  const body = `<legend class="pw-form__question">${esc(p.question)}</legend>${choiceList("choice", "radio", p.options, idBase(ctx, "o"), true)}`;
  return formShell({ type, ctx, body, submit: type === "Poll" ? ctx.labels.formVote : ctx.labels.formCheck, notice: ctx.labels.formNotice, closesAt: p.closesAt });
}

function surveyQuestion(q: SurveyQuestion, ctx: WidgetContext): string {
  const optional = q.required ? "" : ` <span class="pw-form__optional">(${esc(ctx.labels.formOptional)})</span>`;
  const base = idBase(ctx, q.id);
  if (q.kind === "text") {
    const hint = fill(ctx.labels.formTextHint, { max: SURVEY_TEXT_MAX });
    return (
      `<div class="pw-form__q"><label class="pw-form__prompt" for="${esc(base)}">${esc(q.prompt)}${optional}</label>` +
      `<textarea${attrs({ id: base, name: `q.${q.id}`, rows: 3, maxlength: SURVEY_TEXT_MAX, required: q.required === true, "aria-describedby": `${base}-hint` })}></textarea>` +
      `<p class="pw-form__hint" id="${esc(`${base}-hint`)}">${esc(hint)}</p></div>`
    );
  }
  return (
    `<fieldset class="pw-form__q"><legend class="pw-form__prompt">${esc(q.prompt)}${optional}</legend>` +
    choiceList(`q.${q.id}`, q.kind === "multi" ? "checkbox" : "radio", q.options ?? [], base, q.required === true) +
    `</fieldset>`
  );
}

const optionsMd = (options: { label: string }[]) => options.map((o) => `- ${o.label}`).join("\n");

export const INTERACTIVE_WIDGETS: Record<string, PostWidget> = {
  Poll: {
    html: (p, ctx) => choiceForm("Poll", p as PollProps, ctx),
    twinFromMarkdown: true,
    markdown: (p) => `**${(p as PollProps).question}**\n\n${optionsMd((p as PollProps).options)}`,
  },
  Quiz: {
    html: (p, ctx) => choiceForm("Quiz", p as QuizProps, ctx),
    twinFromMarkdown: true,
    // The answer stays out of text exports too: feeds and agents get the question, not the key.
    markdown: (p) => `**${(p as QuizProps).question}**\n\n${optionsMd((p as QuizProps).options)}`,
  },
  Survey: {
    twinFromMarkdown: true,
    html: (p, ctx) => {
      const s = p as SurveyProps;
      const head = (s.title ? `<legend class="pw-form__question">${esc(s.title)}</legend>` : "") + (s.intro ? `<p class="pw-form__intro">${esc(s.intro)}</p>` : "");
      const body = head + s.questions.map((q) => surveyQuestion(q, ctx)).join("");
      return formShell({ type: "Survey", ctx, body, submit: ctx.labels.formSend, notice: ctx.labels.formSurveyNotice, closesAt: s.closesAt });
    },
    markdown: (p) => {
      const s = p as SurveyProps;
      const qs = s.questions.map((q, i) => `${i + 1}. ${q.prompt}${q.options ? ` (${q.options.map((o) => o.label).join(" / ")})` : ""}`).join("\n");
      return `${s.title ? `**${s.title}**\n\n` : ""}${s.intro ? `${s.intro}\n\n` : ""}${qs}`;
    },
  },
};
