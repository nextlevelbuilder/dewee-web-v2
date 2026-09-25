/**
 * One Durable Object per visitor conversation (keyed by the visitor's session id).
 * Holds the transcript in its own SQLite storage and fans messages out between:
 *   - visitor sockets (the website widget),
 *   - agent sockets (dewee's own support agent or a human operator, via the API),
 *   - an optional webhook (CHAT_AGENT_WEBHOOK_URL) for agents that answer through REST,
 *   - the dewee advisor agent on the dewee runtime (DEWEE_CHAT_AGENT_*), behind a daily budget.
 * With nobody attached, or the agent off or out of budget, it answers from the FAQ and asks for an email.
 * Limits: 30 messages / 10 min per room, 40 turns per conversation, 60 messages / hour per visitor IP.
 * Uses the hibernation API so idle conversations cost nothing.
 */
import { DurableObject } from "cloudflare:workers";
import { agentConfig, HISTORY_LINES } from "./chat-agent-client";
import { agentReply } from "./chat-agent-turn";
import { answerFromFaq } from "./chat-faq";
import { emailIn, replyAsksForEmail, wantsHuman } from "./chat-handoff";
import { CHAT_LIMITS } from "./chat-limits";
import { ipAllowsMessage } from "./chat-limiter";
import { forwardToWebhook, notifyHandoff, recordChatLead, recordReply, recordVisitorMessage, systemLine, type SystemLine } from "./chat-room-records";
import { EMAIL_RE } from "./notify";

type Role = "user" | "agent" | "system";
export type ChatMessage = { role: Role; text: string; at: number };

const MAX_TEXT = CHAT_LIMITS.maxChars;
const RATE_WINDOW_MS = 10 * 60_000;
const RATE_MAX = 30;

export class ChatRoom extends DurableObject<Env> {
  private sql: SqlStorage;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    ctx.blockConcurrencyWhile(async () => {
      this.sql.exec("CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, role TEXT NOT NULL, text TEXT NOT NULL, at INTEGER NOT NULL)");
      this.sql.exec("CREATE TABLE IF NOT EXISTS meta (k TEXT PRIMARY KEY, v TEXT NOT NULL)");
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== "/ws" || request.headers.get("upgrade")?.toLowerCase() !== "websocket") {
      return new Response("Not found", { status: 404 });
    }
    const role = url.searchParams.get("role") === "agent" ? "agent" : "visitor";
    const sid = url.searchParams.get("sid") ?? "";
    if (role === "visitor") {
      this.setMeta("sid", sid);
      this.setMeta("locale", url.searchParams.get("locale") === "vi" ? "vi" : "en");
      // Hashed visitor IP from the verified session token; absent when sessions are unsigned.
      const ipHash = url.searchParams.get("ih");
      if (ipHash && /^[0-9a-f]{32}$/.test(ipHash)) this.setMeta("ih", ipHash);
    }
    const { 0: client, 1: server } = new WebSocketPair();
    this.ctx.acceptWebSocket(server, [role]);
    server.send(JSON.stringify({ type: "hello", online: this.online(), history: role === "visitor" ? this.history(50) : this.history(200), sid }));
    if (role === "agent") this.broadcast("visitor", { type: "presence", online: true });
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer) {
    const role = this.ctx.getTags(ws)[0];
    let frame: { type?: string; text?: string; email?: string };
    try { frame = JSON.parse(typeof raw === "string" ? raw : new TextDecoder().decode(raw)); } catch { return; }

    if (role === "agent") {
      if (frame.type === "message" && frame.text) await this.reply(frame.text);
      else if (frame.type === "typing") this.broadcast("visitor", { type: "typing" });
      return;
    }

    if (frame.type === "email") return this.saveEmail(ws, frame.email ?? "");
    if (frame.type !== "message" || typeof frame.text !== "string") return;

    const text = frame.text.trim().slice(0, MAX_TEXT);
    if (!text) return;
    if (this.count("user") >= CHAT_LIMITS.turnsPerConversation) {
      ws.send(JSON.stringify({ type: "message", msg: this.systemMsg("turns"), askEmail: !this.getMeta("email") }));
      return;
    }
    if (this.recentUserMessages() >= RATE_MAX || !(await ipAllowsMessage(this.env, this.getMeta("ih")))) {
      ws.send(JSON.stringify({ type: "message", msg: this.systemMsg("slow") }));
      return;
    }
    const msg = this.insert("user", text);
    const first = this.count("user") === 1;
    this.broadcast("agent", { type: "message", msg });
    await recordVisitorMessage(this.env, this.getMeta("sid"), this.locale(), text, first);
    await this.handoff(ws, text);

    if (this.ctx.getWebSockets("agent").length) {
      ws.send(JSON.stringify({ type: "typing" }));
      return;
    }
    if (this.env.CHAT_AGENT_WEBHOOK_URL) {
      ws.send(JSON.stringify({ type: "typing" }));
      const ok = await forwardToWebhook(this.env.CHAT_AGENT_WEBHOOK_URL, { sid: this.getMeta("sid"), locale: this.locale(), text, history: this.history(20) });
      if (ok) return;
    }
    if (!agentConfig(this.env)) return this.answerFromFaq(ws, text);
    ws.send(JSON.stringify({ type: "typing" }));
    const answer = await agentReply(this.env, this.history(HISTORY_LINES), this.locale(), this.getMeta("sid") ?? "", (textSoFar) => {
      try { ws.send(JSON.stringify({ type: "delta", text: textSoFar })); } catch { /* visitor left */ }
    });
    if (answer) {
      const reply = this.insert("agent", answer);
      ws.send(JSON.stringify({ type: "message", msg: reply, askEmail: !this.getMeta("email") && replyAsksForEmail(answer) }));
      return;
    }
    return this.answerFromFaq(ws, text);
  }

  private answerFromFaq(ws: WebSocket, text: string) {
    const answer = answerFromFaq(text, this.locale(), Boolean(this.getMeta("email")));
    const reply = this.insert("agent", answer.text);
    ws.send(JSON.stringify({ type: "message", msg: reply, askEmail: answer.askEmail }));
  }

  async webSocketClose(ws: WebSocket, code: number) {
    const role = this.ctx.getTags(ws)[0];
    try { ws.close(code === 1005 ? 1000 : code, "bye"); } catch { /* already closed */ }
    if (role === "agent" && this.ctx.getWebSockets("agent").length <= 1) this.broadcast("visitor", { type: "presence", online: this.online(true) });
  }

  /** RPC: an agent or operator answers through the REST API. */
  async reply(text: string): Promise<ChatMessage> {
    const msg = this.insert("agent", text.trim().slice(0, MAX_TEXT * 2));
    this.broadcast("visitor", { type: "message", msg });
    this.broadcast("agent", { type: "message", msg });
    await recordReply(this.env, this.getMeta("sid"));
    return msg;
  }

  /** RPC: transcript for the API / admin. */
  async transcript(limit = 200): Promise<{ sid: string | null; locale: string; email: string | null; messages: ChatMessage[] }> {
    return { sid: this.getMeta("sid"), locale: this.locale(), email: this.getMeta("email"), messages: this.history(limit) };
  }

  private async saveEmail(ws: WebSocket, email: string) {
    const clean = email.trim().toLowerCase();
    if (!EMAIL_RE.test(clean)) return;
    this.setMeta("email", clean);
    await recordChatLead(this.env, this.getMeta("sid"), this.locale(), clean, this.history(8));
    ws.send(JSON.stringify({ type: "ack-email" }));
  }

  /** An email typed into the chat becomes a lead; asking for a person pings the team once. */
  private async handoff(ws: WebSocket, text: string) {
    const email = emailIn(text);
    if (email && !this.getMeta("email")) return this.saveEmail(ws, email);
    if (!wantsHuman(text) || this.getMeta("handoff")) return;
    this.setMeta("handoff", "1");
    await notifyHandoff(this.env, this.getMeta("sid"), this.getMeta("email"), this.history(8));
  }

  private online(excludingClosing = false) {
    const agents = this.ctx.getWebSockets("agent").length - (excludingClosing ? 1 : 0);
    return agents > 0 || Boolean(this.env.CHAT_AGENT_WEBHOOK_URL) || agentConfig(this.env) !== null;
  }

  private insert(role: Role, text: string): ChatMessage {
    const at = Date.now();
    this.sql.exec("INSERT INTO messages (role, text, at) VALUES (?, ?, ?)", role, text, at);
    return { role, text, at };
  }

  private history(limit: number): ChatMessage[] {
    const rows = this.sql.exec<{ role: Role; text: string; at: number }>("SELECT role, text, at FROM messages ORDER BY id DESC LIMIT ?", limit).toArray();
    return rows.reverse();
  }

  private count(role: Role) {
    return this.sql.exec<{ n: number }>("SELECT COUNT(*) AS n FROM messages WHERE role = ?", role).one().n;
  }

  private recentUserMessages() {
    return this.sql.exec<{ n: number }>("SELECT COUNT(*) AS n FROM messages WHERE role = 'user' AND at > ?", Date.now() - RATE_WINDOW_MS).one().n;
  }

  private systemMsg(kind: SystemLine): ChatMessage {
    return { role: "system", text: systemLine(kind, this.locale()), at: Date.now() };
  }

  private broadcast(tag: "visitor" | "agent", payload: unknown) {
    const raw = JSON.stringify(payload);
    for (const s of this.ctx.getWebSockets(tag)) {
      try { s.send(raw); } catch { /* socket closing */ }
    }
  }

  private locale(): "en" | "vi" {
    return this.getMeta("locale") === "vi" ? "vi" : "en";
  }

  private getMeta(k: string): string | null {
    return this.sql.exec<{ v: string }>("SELECT v FROM meta WHERE k = ?", k).toArray()[0]?.v ?? null;
  }

  private setMeta(k: string, v: string) {
    this.sql.exec("INSERT INTO meta (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v", k, v);
  }
}
