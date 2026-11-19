/**
 * POST /api/post-widgets/vote and GET /api/post-widgets/results (logic only; the Astro routes
 * pass the request and bindings in, so tests run without the runtime).
 *
 * Vote: origin → content type → size → parse → ids → rate limit (cookie or cookieless IP, then IP) → published post
 * → widget in its CURRENT blocks → closed? → answer against the definition → save → results.
 * The body is a form (`post`, `widget`, `choice` or `q.<question id>`) or the same as JSON.
 * Callers that accept JSON get `{ ok, result? , error?, message? }`; a plain form post gets a small
 * HTML page (fallback-page.ts), so the widgets work without JavaScript.
 */
import { WIDGET_ID_RE } from "../../blocks/registry";
import { answerFromForm, isClosed, parseWidgetAnswer, type AnswerInput } from "../../blocks/interactive-answers";
import { widgetLabels } from "../../blocks/post-widgets/widget-labels";
import type { Locale } from "../../../i18n/config";
import { rateLimit } from "../auth/rate-limit";
import { fallbackPage, postPath } from "./fallback-page";
import { publicResult, publicResults, type PublicResult } from "./public-results";
import { choiceCounts, publishedPost, responseWidgets, saveResponse, voterChoices, type PublishedPost, type ResponseWidget } from "./response-store";
import { hasVoterCookie, newVoterId, rateKeys, readVoterId, voterCookie, voterKey, voterSalt } from "./voter";

/**
 * Writes per window: one browser (cookie) and one network (IP hash, shared by offices and NAT).
 * A request without a cookie this server signed gets a fresh voter id every time, so the
 * per-voter limit cannot hold it; those requests share the stricter `cookielessIp` budget per
 * network instead. Trade-off: first-time voters behind one busy NAT share those 10 votes.
 */
export const VOTE_LIMITS = { voter: 10, cookielessIp: 10, ip: 40, windowSeconds: 600 } as const;
const MAX_BODY_BYTES = 32 * 1024;

export type VoteError = "invalid" | "not_found" | "closed" | "already_answered" | "rate_limited" | "forbidden_origin" | "unsupported_media_type" | "payload_too_large" | "method_not_allowed" | "server_error";
export type VoteEnv = Pick<Env, "DB" | "KV">;

const json = (body: unknown, status: number, headers?: HeadersInit) => {
  const h = new Headers(headers);
  h.set("content-type", "application/json; charset=utf-8");
  h.set("cache-control", "no-store");
  return new Response(JSON.stringify(body), { status, headers: h });
};

/** Same rule as admin writes: Origin must be ours; without Origin, Sec-Fetch-Site must say same-origin. */
export function sameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (origin) return origin === new URL(request.url).origin;
  return request.headers.get("sec-fetch-site") === "same-origin";
}

/**
 * Reads the body as text but stops (and cancels the stream) once it passes `maxBytes`, so a client
 * that lies about or omits Content-Length cannot make the worker buffer a large body.
 * Returns null when the body is too large.
 */
export async function readBodyCapped(request: Request, maxBytes: number): Promise<string | null> {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel().catch(() => {});
      return null;
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const c of chunks) {
    bytes.set(c, offset);
    offset += c.byteLength;
  }
  return new TextDecoder().decode(bytes);
}

const clientIp = (request: Request) => request.headers.get("cf-connecting-ip") ?? "unknown";
const str = (v: unknown) => (typeof v === "string" ? v : "");

function parseBody(type: string, body: string): { post: string; widget: string; input: AnswerInput } | null {
  if (type === "application/json") {
    try {
      const v: unknown = JSON.parse(body);
      if (!v || typeof v !== "object" || Array.isArray(v)) return null;
      const o = v as Record<string, unknown>;
      return { post: str(o.post), widget: str(o.widget), input: { choice: o.choice, answers: o.answers } };
    } catch {
      return null;
    }
  }
  const form = new URLSearchParams(body);
  return { post: form.get("post") ?? "", widget: form.get("widget") ?? "", input: answerFromForm(form) };
}

type Reply = (status: number, error: VoteError | null, extra?: { message?: string; result?: PublicResult; headers?: HeadersInit }) => Response;

export async function handleVote(request: Request, env: VoteEnv): Promise<Response> {
  if (request.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405, { allow: "POST" });
  if (!sameOriginRequest(request)) return json({ ok: false, error: "forbidden_origin" }, 403);

  const type = (request.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (type !== "application/json" && type !== "application/x-www-form-urlencoded") return json({ ok: false, error: "unsupported_media_type" }, 415);
  if (Number(request.headers.get("content-length") ?? "0") > MAX_BODY_BYTES) return json({ ok: false, error: "payload_too_large" }, 413);
  const body = await readBodyCapped(request, MAX_BODY_BYTES);
  if (body === null) return json({ ok: false, error: "payload_too_large" }, 413);

  const wantsJson = type === "application/json" || (request.headers.get("accept") ?? "").includes("application/json");
  const parsed = parseBody(type, body);
  let post: PublishedPost | null = null;
  let widget: ResponseWidget | undefined;
  const reply: Reply = (status, error, extra = {}) => {
    if (wantsJson) return json(error ? { ok: false, error, ...(extra.message ? { message: extra.message } : {}) } : { ok: true, result: extra.result }, status, extra.headers);
    const locale: Locale = post?.locale ?? "en";
    const labels = widgetLabels(locale);
    const messages: Record<VoteError, string> = {
      invalid: labels.formErrorPick, closed: labels.formClosed, already_answered: labels.formErrorAlready, rate_limited: labels.formErrorRate,
      not_found: labels.formError, forbidden_origin: labels.formError, unsupported_media_type: labels.formError, payload_too_large: labels.formError, method_not_allowed: labels.formError, server_error: labels.formError,
    };
    const question = widget ? str(widget.props.question) || str(widget.props.title) || undefined : undefined;
    const res = fallbackPage({ locale, labels, status, message: error ? messages[error] : labels.formThanks, question, result: extra.result, back: post ? postPath(post.locale, post.slug, widget?.id) : "/blog" });
    new Headers(extra.headers).forEach((v, k) => res.headers.append(k, v));
    return res;
  };

  if (!parsed) return reply(400, "invalid", { message: "Send a form or a JSON object." });
  if (!parsed.post || !parsed.widget || !WIDGET_ID_RE.test(parsed.widget)) return reply(400, "invalid", { message: "`post` and `widget` are required." });

  try {
    const salt = await voterSalt(env.DB);
    const cookieId = await readVoterId(request, salt);
    const voterId = cookieId ?? newVoterId();
    const keys = await rateKeys(salt, voterId, clientIp(request));
    const first = cookieId
      ? await rateLimit(env.KV, `pw-voter:${keys.voter}`, VOTE_LIMITS.voter, VOTE_LIMITS.windowSeconds)
      : await rateLimit(env.KV, `pw-ip-nocookie:${keys.ip}`, VOTE_LIMITS.cookielessIp, VOTE_LIMITS.windowSeconds);
    const byIp = first.ok ? await rateLimit(env.KV, `pw-ip:${keys.ip}`, VOTE_LIMITS.ip, VOTE_LIMITS.windowSeconds) : first;
    if (!byIp.ok) return reply(429, "rate_limited", { headers: { "retry-after": String(VOTE_LIMITS.windowSeconds) } });

    post = await publishedPost(env.DB, parsed.post);
    if (!post) return reply(404, "not_found", { message: "No published post has this id." });
    widget = responseWidgets(post).find((w) => w.id === parsed.widget);
    if (!widget) return reply(404, "not_found", { message: "This post has no poll, quiz or survey with this id." });
    if (isClosed(widget.props)) return reply(409, "closed");

    const answer = parseWidgetAnswer(widget.type, widget.props, parsed.input);
    if (!answer.ok) return reply(400, "invalid", { message: answer.message });

    const voter = await voterKey(salt, post.id, voterId);
    const outcome = await saveResponse(env.DB, post.id, widget, voter, answer.value);
    const [counts, mine] = await Promise.all([choiceCounts(env.DB, post.id), voterChoices(env.DB, post.id, voter)]);
    const result = publicResult(widget, counts, mine);
    const headers = cookieId ? undefined : { "set-cookie": await voterCookie(salt, voterId) };
    if (outcome === "already_answered") return reply(409, "already_answered", { result, headers });
    return reply(200, null, { result, headers });
  } catch (err) {
    console.error("post widget vote failed", err instanceof Error ? err.message : err);
    return reply(500, "server_error");
  }
}

/** Results for every Poll, Quiz and Survey in one published post, for this reader. */
export async function handleResults(request: Request, env: VoteEnv): Promise<Response> {
  if (request.method !== "GET") return json({ ok: false, error: "method_not_allowed" }, 405, { allow: "GET" });
  const id = new URL(request.url).searchParams.get("post") ?? "";
  try {
    const post = await publishedPost(env.DB, id);
    if (!post) return json({ ok: false, error: "not_found" }, 404);
    const widgets = responseWidgets(post);
    if (!widgets.length) return json({ ok: true, widgets: {} }, 200);
    const salt = hasVoterCookie(request) ? await voterSalt(env.DB) : null;
    const cookieId = salt ? await readVoterId(request, salt) : null;
    const voter = salt && cookieId ? await voterKey(salt, post.id, cookieId) : null;
    const [counts, mine] = await Promise.all([choiceCounts(env.DB, post.id), voter ? voterChoices(env.DB, post.id, voter) : Promise.resolve(new Map<string, string>())]);
    return json({ ok: true, widgets: publicResults(widgets, counts, mine) }, 200);
  } catch (err) {
    console.error("post widget results failed", err instanceof Error ? err.message : err);
    return json({ ok: false, error: "server_error" }, 500);
  }
}
