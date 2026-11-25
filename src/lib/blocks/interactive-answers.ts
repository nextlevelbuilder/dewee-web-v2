/**
 * Reader answers for Poll, Quiz and Survey, checked against the widget's CURRENT definition
 * (isomorphic, pure). The vote endpoint parses with this; results are shaped here too, so the
 * page, the no-JS fallback and the admin view count the same way. Answers to options or
 * questions that no longer exist are ignored, never shown.
 */
import { ANSWER_ID_RE, SURVEY_TEXT_MAX } from "./interactive-block-schemas";

export const RESPONSE_WIDGETS = ["Poll", "Quiz", "Survey"] as const;
export type ResponseWidgetType = (typeof RESPONSE_WIDGETS)[number];

type Option = { id: string; label: string };
export type PollProps = { question: string; options: Option[]; closesAt?: string };
export type QuizProps = PollProps & { answer: string; explanation: string };
export type SurveyQuestion = { id: string; prompt: string; kind: "single" | "multi" | "text"; options?: Option[]; required?: boolean };
export type SurveyProps = { title?: string; intro?: string; questions: SurveyQuestion[]; closesAt?: string };

/** What a reader sent: `choice` for Poll/Quiz, `answers` (question id → option id(s) or text) for Survey. */
export type AnswerInput = { choice?: unknown; answers?: unknown };
export type SurveyAnswers = Record<string, string | string[]>;
export type ParsedAnswer = { choice: string; answers: null } | { choice: null; answers: SurveyAnswers };
export type AnswerResult = { ok: true; value: ParsedAnswer } | { ok: false; message: string };

export const isResponseWidget = (type: string): type is ResponseWidgetType => (RESPONSE_WIDGETS as readonly string[]).includes(type);

/** True once `closesAt` has passed. */
export function isClosed(props: { closesAt?: unknown }, now = Date.now()): boolean {
  if (typeof props.closesAt !== "string") return false;
  const at = Date.parse(props.closesAt);
  return Number.isFinite(at) && now >= at;
}

const fail = (message: string): AnswerResult => ({ ok: false, message });
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

function parseChoice(options: Option[], raw: unknown): AnswerResult {
  if (typeof raw !== "string" || !raw) return fail("Pick one option.");
  return options.some((o) => o.id === raw) ? { ok: true, value: { choice: raw, answers: null } } : fail(`Unknown option "${raw.slice(0, 40)}".`);
}

function parseSurvey(props: SurveyProps, raw: unknown): AnswerResult {
  if (raw !== undefined && !isRecord(raw)) return fail("Answers must be an object of question id → answer.");
  const given = (raw ?? {}) as Record<string, unknown>;
  const byId = new Map(props.questions.map((q) => [q.id, q]));
  for (const key of Object.keys(given)) if (!byId.has(key)) return fail(`Unknown question "${key.slice(0, 40)}".`);
  const out: SurveyAnswers = {};
  for (const q of props.questions) {
    const value = given[q.id];
    const ids = new Set((q.options ?? []).map((o) => o.id));
    if (q.kind === "text") {
      if (value !== undefined && typeof value !== "string") return fail(`"${q.id}" takes text.`);
      // Control characters are dropped; free text is shown only to admins, escaped.
      const textValue = (value ?? "").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();
      if (textValue.length > SURVEY_TEXT_MAX) return fail(`"${q.id}" is longer than ${SURVEY_TEXT_MAX} characters.`);
      if (textValue) out[q.id] = textValue;
    } else if (q.kind === "single") {
      if (value !== undefined && value !== "") {
        if (typeof value !== "string" || !ids.has(value)) return fail(`"${q.id}" has no option "${String(value).slice(0, 40)}".`);
        out[q.id] = value;
      }
    } else {
      const list = value === undefined || value === "" ? [] : Array.isArray(value) ? value : [value];
      if (list.some((v) => typeof v !== "string" || !ids.has(v))) return fail(`"${q.id}" has an unknown option.`);
      const unique = [...new Set(list as string[])];
      if (unique.length) out[q.id] = unique;
    }
    if (q.required && out[q.id] === undefined) return fail(`"${q.id}" is required.`);
  }
  if (!Object.keys(out).length) return fail("Answer at least one question.");
  return { ok: true, value: { choice: null, answers: out } };
}

/** Checks one reader's answer against a validated widget definition. */
export function parseWidgetAnswer(type: ResponseWidgetType, props: Record<string, unknown>, input: AnswerInput): AnswerResult {
  if (type === "Survey") return parseSurvey(props as SurveyProps, input.answers);
  return parseChoice((props as PollProps).options, input.choice);
}

/**
 * Form fields → AnswerInput: `choice` for Poll/Quiz; `q.<question id>` (repeated for multi-choice)
 * for Survey. Field names that are not well-formed ids are dropped and reported as unknown.
 */
export function answerFromForm(form: URLSearchParams): AnswerInput {
  const answers: Record<string, string | string[]> = {};
  for (const key of new Set(form.keys())) {
    if (!key.startsWith("q.")) continue;
    const id = key.slice(2);
    if (!ANSWER_ID_RE.test(id)) {
      answers[id.slice(0, 40) || "?"] = "";
      continue;
    }
    const all = form.getAll(key);
    answers[id] = all.length > 1 ? all : all[0];
  }
  return { choice: form.get("choice") ?? undefined, answers: Object.keys(answers).length ? answers : undefined };
}

export type OptionTally = { id: string; label: string; count: number; percent: number };

/** Counts per current option, with whole percentages; stale option ids are not counted. */
export function tallyOptions(options: Option[], counts: ReadonlyMap<string, number>): { total: number; options: OptionTally[] } {
  const rows = options.map((o) => ({ id: o.id, label: o.label, count: counts.get(o.id) ?? 0 }));
  const total = rows.reduce((sum, r) => sum + r.count, 0);
  return { total, options: rows.map((r) => ({ ...r, percent: total ? Math.round((r.count / total) * 100) : 0 })) };
}
