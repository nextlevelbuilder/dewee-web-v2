/**
 * Client for the dewee advisor agent on the dewee runtime (OpenAI-compatible /v1/chat/completions).
 * The runtime answers the last user message, so the bounded transcript travels inside that
 * message; the visitor's own words stay fenced as data, never as instructions.
 */

export type AgentConfig = { url: string; apiKey: string; agentId: string };
export type TranscriptLine = { role: "user" | "agent" | "system"; text: string };

/** How much of the conversation the agent sees. */
export const HISTORY_LINES = 12;
const LINE_CHARS = 1200;
const RUN_ERROR_RE = /^Error: /;

/** The agent config, or null when the kill switch is off or any setting is missing. */
export function agentConfig(env: Env): AgentConfig | null {
  if (env.CHAT_AGENT_ENABLED !== "true" || !env.CHAT_SESSION_SECRET) return null;
  const url = env.DEWEE_CHAT_AGENT_URL?.trim().replace(/\/+$/, "");
  const apiKey = env.DEWEE_CHAT_AGENT_API_KEY?.trim();
  const agentId = env.DEWEE_CHAT_AGENT_ID?.trim();
  if (!url || !apiKey || !agentId || !/^https:\/\//.test(url)) return null;
  return { url, apiKey, agentId };
}

/** One user message: earlier turns as context, then the visitor's newest message. */
export function buildAgentMessage(history: TranscriptLine[], locale: "en" | "vi"): string {
  const lines = history.filter((m) => m.role !== "system").slice(-HISTORY_LINES);
  const last = lines.pop();
  const clip = (t: string) => t.replace(/\s+/g, " ").trim().slice(0, LINE_CHARS);
  const earlier = lines.map((m) => `${m.role === "user" ? "Visitor" : "Advisor"}: ${clip(m.text)}`).join("\n");
  return [
    `[Website chat on dewee.sh. Page language: ${locale === "vi" ? "Vietnamese" : "English"}. Reply in the visitor's language.]`,
    earlier ? `[Earlier in this conversation]\n${earlier}` : "",
    `[Visitor's new message]\n${last ? clip(last.text) : ""}`,
  ].filter(Boolean).join("\n\n");
}

/**
 * Splits an SSE buffer into complete `data:` payloads and the unfinished remainder.
 * Returns the text deltas found and whether the stream said [DONE].
 */
export function parseSse(buffer: string): { deltas: string[]; done: boolean; rest: string } {
  const deltas: string[] = [];
  let done = false;
  const events = buffer.split(/\r?\n\r?\n/);
  const rest = events.pop() ?? "";
  for (const event of events) {
    for (const line of event.split(/\r?\n/)) {
      if (!line.startsWith("data:")) continue;
      const data = line.slice(5).trim();
      if (data === "[DONE]") { done = true; continue; }
      try {
        const chunk = JSON.parse(data) as { choices?: { delta?: { content?: string } }[] };
        const text = chunk.choices?.[0]?.delta?.content;
        if (typeof text === "string" && text) deltas.push(text);
      } catch { /* keep-alive or a partial frame from a misbehaving proxy */ }
    }
  }
  return { deltas, done, rest };
}

/** Text of a non-streamed completion, or "" when the shape is unexpected. */
export function completionText(body: unknown): string {
  const content = (body as { choices?: { message?: { content?: unknown } }[] })?.choices?.[0]?.message?.content;
  return typeof content === "string" ? content : "";
}

/**
 * Asks the agent and streams the reply. `onText` receives the full text so far.
 * Throws on HTTP or network errors; the caller falls back to the FAQ.
 */
export async function askAgent(
  cfg: AgentConfig,
  message: string,
  visitorId: string,
  onText: (textSoFar: string) => void,
  opts: { timeoutMs?: number; fetcher?: typeof fetch } = {},
): Promise<string> {
  const res = await (opts.fetcher ?? fetch)(`${cfg.url}/v1/chat/completions`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${cfg.apiKey}`,
      "content-type": "application/json",
      "x-goclaw-user-id": visitorId,
      "x-goclaw-agent-id": cfg.agentId,
    },
    body: JSON.stringify({ model: `agent:${cfg.agentId}`, stream: true, messages: [{ role: "user", content: message }] }),
    signal: AbortSignal.timeout(opts.timeoutMs ?? 45_000),
  });
  if (!res.ok) throw new Error(`agent HTTP ${res.status}`);
  if (!res.headers.get("content-type")?.includes("text/event-stream") || !res.body) {
    const text = completionText(await res.json());
    if (RUN_ERROR_RE.test(text)) throw new Error("agent run failed");
    return text;
  }
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  let text = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (value) buffer += value;
    const parsed = parseSse(done ? `${buffer}\n\n` : buffer);
    buffer = parsed.rest;
    if (parsed.deltas.length) {
      text += parsed.deltas.join("");
      if (!RUN_ERROR_RE.test(text)) onText(text);
    }
    if (done || parsed.done) break;
  }
  await reader.cancel().catch(() => undefined);
  // The runtime reports a failed run as a streamed "Error: …" reply; never show that to a visitor.
  if (RUN_ERROR_RE.test(text)) throw new Error("agent run failed");
  return text;
}
