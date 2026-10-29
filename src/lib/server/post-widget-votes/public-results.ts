/**
 * What readers may see about answers (pure). Polls: aggregate counts and percentages. Quizzes:
 * the same plus the correct answer and explanation, but only for a reader who has answered.
 * Surveys: only whether this reader has answered; their aggregates and free text are admin-only.
 */
import { isClosed, tallyOptions, type OptionTally, type PollProps, type QuizProps } from "../../blocks/interactive-answers";
import type { ResponseWidget } from "./response-store";

export type PublicResult =
  | { type: "Poll"; closed: boolean; voted: boolean; choice: string | null; total: number; options: OptionTally[] }
  | { type: "Quiz"; closed: boolean; answered: false }
  | { type: "Quiz"; closed: boolean; answered: true; choice: string | null; answer: string; correct: boolean; explanation: string; total: number; options: OptionTally[] }
  | { type: "Survey"; closed: boolean; answered: boolean };

const key = (w: ResponseWidget) => `${w.type}:${w.id}`;

export function publicResult(widget: ResponseWidget, counts: ReadonlyMap<string, ReadonlyMap<string, number>>, mine: ReadonlyMap<string, string>, now = Date.now()): PublicResult {
  const closed = isClosed(widget.props, now);
  const own = mine.get(key(widget));
  if (widget.type === "Survey") return { type: "Survey", closed, answered: own !== undefined };
  const props = widget.props as unknown as PollProps;
  // A stale choice (an option removed since) counts as no choice.
  const choice = own && props.options.some((o) => o.id === own) ? own : null;
  const tally = tallyOptions(props.options, counts.get(key(widget)) ?? new Map());
  if (widget.type === "Poll") return { type: "Poll", closed, voted: choice !== null, choice, ...tally };
  if (own === undefined) return { type: "Quiz", closed, answered: false };
  const quiz = widget.props as unknown as QuizProps;
  return { type: "Quiz", closed, answered: true, choice, answer: quiz.answer, correct: choice === quiz.answer, explanation: quiz.explanation, ...tally };
}

export function publicResults(widgets: ResponseWidget[], counts: ReadonlyMap<string, ReadonlyMap<string, number>>, mine: ReadonlyMap<string, string>, now = Date.now()): Record<string, PublicResult> {
  return Object.fromEntries(widgets.map((w) => [w.id, publicResult(w, counts, mine, now)]));
}
