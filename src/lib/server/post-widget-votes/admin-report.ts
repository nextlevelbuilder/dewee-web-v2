/**
 * Admin-only view of reader answers (/admin/widgets): which widgets have answers, aggregates per
 * question, survey free text, and a CSV export. Free text is never shown anywhere public. The
 * report reads the widget's current definition, so counts match what the post shows.
 */
import { tallyOptions, type OptionTally, type PollProps, type QuizProps, type SurveyProps } from "../../blocks/interactive-answers";
import { validateBlocks } from "../../blocks/registry";
import { POST_ID_RE } from "./response-store";

export type WidgetSummary = { post_id: string; widget_id: string; widget_type: string; responses: number; last_at: string; title: string | null; locale: string | null; slug: string | null; status: string | null };

export async function listWidgetSummaries(db: D1Database): Promise<WidgetSummary[]> {
  const { results } = await db
    .prepare(
      "SELECT r.post_id, r.widget_id, r.widget_type, COUNT(*) AS responses, MAX(r.updated_at) AS last_at, p.title, p.locale, p.slug, p.status " +
        "FROM widget_responses r LEFT JOIN pages p ON p.id = r.post_id GROUP BY r.post_id, r.widget_id, r.widget_type ORDER BY last_at DESC LIMIT 200",
    )
    .all<WidgetSummary>();
  return results.map((r) => ({ ...r, responses: Number(r.responses) }));
}

export type QuestionReport = { id: string; prompt: string; kind: "single" | "multi" | "text"; answered: number; options?: OptionTally[]; texts?: { text: string; at: string }[] };
export type WidgetReport = {
  post: { id: string; title: string; locale: string; slug: string; status: string };
  widgetId: string;
  type: "Poll" | "Quiz" | "Survey";
  responses: number;
  question?: string;
  options?: OptionTally[];
  correctRate?: number;
  questions?: QuestionReport[];
  /** Survey rows for the CSV export, newest first, and the definition that labels them. */
  rows?: { at: string; answers: Record<string, string | string[]> }[];
  survey?: SurveyProps;
};

/** Most survey rows one report reads; older rows stay in D1 and are counted. */
export const REPORT_ROW_LIMIT = 5000;

export async function widgetReport(db: D1Database, postId: string, widgetId: string): Promise<WidgetReport | null> {
  if (!POST_ID_RE.test(postId)) return null;
  const page = await db.prepare("SELECT id, title, locale, slug, status, blocks FROM pages WHERE id = ? AND kind = 'post'").bind(postId).first<{ id: string; title: string; locale: string; slug: string; status: string; blocks: string }>();
  if (!page) return null;
  let blocks: unknown = [];
  try {
    blocks = JSON.parse(page.blocks);
  } catch {
    blocks = [];
  }
  const raw = (Array.isArray(blocks) ? blocks : []).find((b) => (b as { id?: unknown })?.id === widgetId);
  const valid = raw ? validateBlocks([raw], { context: "post" }) : null;
  const block = valid?.ok ? valid.blocks[0] : null;
  if (!block || !["Poll", "Quiz", "Survey"].includes(block.type)) return null;
  const type = block.type as WidgetReport["type"];
  const post = { id: page.id, title: page.title, locale: page.locale, slug: page.slug, status: page.status };
  const total = await db.prepare("SELECT COUNT(*) AS n FROM widget_responses WHERE post_id = ? AND widget_id = ? AND widget_type = ?").bind(postId, widgetId, type).first<{ n: number }>();
  const responses = Number(total?.n ?? 0);

  if (type !== "Survey") {
    const props = block.props as unknown as PollProps;
    const { results } = await db
      .prepare("SELECT choice, COUNT(*) AS n FROM widget_responses WHERE post_id = ? AND widget_id = ? AND widget_type = ? GROUP BY choice")
      .bind(postId, widgetId, type)
      .all<{ choice: string | null; n: number }>();
    const tally = tallyOptions(props.options, new Map(results.filter((r) => r.choice).map((r) => [r.choice as string, Number(r.n)])));
    const answer = type === "Quiz" ? (block.props as unknown as QuizProps).answer : null;
    const correct = answer ? (tally.options.find((o) => o.id === answer)?.count ?? 0) : 0;
    return { post, widgetId, type, responses, question: props.question, options: tally.options, ...(answer ? { correctRate: tally.total ? Math.round((correct / tally.total) * 100) : 0 } : {}) };
  }

  const props = block.props as unknown as SurveyProps;
  const { results } = await db
    .prepare("SELECT answers, created_at FROM widget_responses WHERE post_id = ? AND widget_id = ? AND widget_type = 'Survey' ORDER BY created_at DESC LIMIT ?")
    .bind(postId, widgetId, REPORT_ROW_LIMIT)
    .all<{ answers: string | null; created_at: string }>();
  const rows = results.map((r) => {
    let answers: Record<string, string | string[]> = {};
    try {
      const parsed: unknown = JSON.parse(r.answers ?? "{}");
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) answers = parsed as Record<string, string | string[]>;
    } catch {
      /* a malformed row counts as unanswered */
    }
    return { at: r.created_at, answers };
  });
  const questions: QuestionReport[] = props.questions.map((q) => {
    const values = rows.map((r) => ({ at: r.at, v: r.answers[q.id] })).filter((x) => x.v !== undefined && x.v !== "");
    if (q.kind === "text") return { id: q.id, prompt: q.prompt, kind: q.kind, answered: values.length, texts: values.filter((x) => typeof x.v === "string").map((x) => ({ text: x.v as string, at: x.at })) };
    const counts = new Map<string, number>();
    for (const { v } of values) for (const id of Array.isArray(v) ? v : [v]) counts.set(id, (counts.get(id) ?? 0) + 1);
    const tally = tallyOptions(q.options ?? [], counts);
    // Multi-choice percentages are of respondents to the question, so they can add up past 100.
    const options = q.kind === "multi" ? tally.options.map((o) => ({ ...o, percent: values.length ? Math.round((o.count / values.length) * 100) : 0 })) : tally.options;
    return { id: q.id, prompt: q.prompt, kind: q.kind, answered: values.length, options };
  });
  return { post, widgetId, type, responses, questions, rows, survey: props };
}

/** A spreadsheet cell: quoted, and text that a spreadsheet would run as a formula is defused. */
export function csvCell(value: string): string {
  // Spreadsheets skip leading whitespace before reading a formula, so look past it too.
  const safe = /^[\t\r]|^\s*[=+\-@]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** Survey answers as CSV: one row per response, one column per question (option labels, not ids). */
export function surveyCsv(report: WidgetReport): string {
  const props = report.survey ?? { questions: [] };
  const labelOf = new Map(props.questions.flatMap((q) => (q.options ?? []).map((o) => [`${q.id}:${o.id}`, o.label] as const)));
  const head = ["submitted_at", ...props.questions.map((q) => q.prompt)].map(csvCell).join(",");
  const lines = (report.rows ?? []).map((r) =>
    [r.at, ...props.questions.map((q) => {
      const v = r.answers[q.id];
      if (v === undefined) return "";
      const list = Array.isArray(v) ? v : [v];
      return q.kind === "text" ? list.join(" ") : list.map((id) => labelOf.get(`${q.id}:${id}`) ?? id).join("; ");
    })]
      .map(csvCell)
      .join(","),
  );
  return [head, ...lines].join("\r\n") + "\r\n";
}
