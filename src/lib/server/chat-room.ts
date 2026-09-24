/**
 * One Durable Object per visitor conversation (keyed by the visitor's session id).
 * Holds the transcript in its own SQLite storage and fans messages out between:
 *   - visitor sockets (the website widget),
 *   - agent sockets (dewee's own support agent or a human operator, via the API),
 *   - an optional webhook (CHAT_AGENT_WEBHOOK_URL) for agents that answer through REST.
 * With nobody attached it answers from the FAQ and asks for an email.
 * Uses the hibernation API so idle conversations cost nothing.
 */
import { DurableObject } from "cloudflare:workers";
import { answerFromFaq } from "./chat-faq";
import { EMAIL_RE, notifyTeam } from "./notify";

type Role = "user" | "agent" | "system";
export type ChatMessage = { role: Role; text: string; at: number };

const MAX_TEXT = 2000;
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
    if (this.recentUserMessages() >= RATE_MAX) {
      ws.send(JSON.stringify({ type: "message", msg: this.systemMsg("slow") }));
      return;
    }
    const msg = this.insert("user", text);
    const first = this.count("user") === 1;
    this.broadcast("agent", { type: "message", msg });
    await this.touchSession(text, first);

    if (this.ctx.getWebSockets("agent").length) {
      ws.send(JSON.stringify({ type: "typing" }));
      return;
    }
    if (this.env.CHAT_AGENT_WEBHOOK_URL) {
      ws.send(JSON.stringify({ type: "typing" }));
      const ok = await this.forwardToAgent(text);
      if (ok) return;
    }
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
    await this.env.DB.prepare("UPDATE chat_sessions SET last_at = ?1, messages = messages + 1 WHERE sid = ?2").bind(new Date().toISOString(), this.getMeta("sid")).run().catch(() => undefined);
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
    const sid = this.getMeta("sid");
    const now = new Date().toISOString();
    await this.env.DB.batch([
      this.env.DB.prepare("UPDATE chat_sessions SET email = ?1, last_at = ?2 WHERE sid = ?3").bind(clean, now, sid),
      this.env.DB.prepare("INSERT INTO leads (kind, email, locale, source, payload, created_at) VALUES ('chat', ?1, ?2, 'chat-widget', ?3, ?4)").bind(clean, this.locale(), JSON.stringify({ sid }), now),
    ]).catch((err) => console.error("chat email save failed", err));
    await notifyTeam(this.env, "New chat lead", { Email: clean, Session: sid ?? undefined, Transcript: this.history(8).map((m) => `${m.role}: ${m.text}`).join("\n") });
    ws.send(JSON.stringify({ type: "ack-email" }));
  }

  private async forwardToAgent(text: string): Promise<boolean> {
    try {
      const res = await fetch(this.env.CHAT_AGENT_WEBHOOK_URL!, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ sid: this.getMeta("sid"), locale: this.locale(), text, history: this.history(20) }),
        signal: AbortSignal.timeout(8000),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  private async touchSession(text: string, first: boolean) {
    const now = new Date().toISOString();
    const sid = this.getMeta("sid");
    await this.env.DB.prepare(
      `INSERT INTO chat_sessions (sid, locale, first_message, messages, status, created_at, last_at) VALUES (?1, ?2, ?3, 1, 'open', ?4, ?4)
       ON CONFLICT(sid) DO UPDATE SET messages = messages + 1, last_at = ?4`,
    ).bind(sid, this.locale(), text.slice(0, 500), now).run().catch((err) => console.error("chat session upsert failed", err));
    if (first) await notifyTeam(this.env, "New website chat", { Locale: this.locale(), Message: text, Session: sid ?? undefined });
  }

  private online(excludingClosing = false) {
    const agents = this.ctx.getWebSockets("agent").length - (excludingClosing ? 1 : 0);
    return agents > 0 || Boolean(this.env.CHAT_AGENT_WEBHOOK_URL);
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

  private systemMsg(kind: "slow"): ChatMessage {
    const vi = this.locale() === "vi";
    const text = kind === "slow" ? (vi ? "Bạn gửi hơi nhanh, đợi vài phút rồi thử lại nhé." : "You're typing faster than we can read. Try again in a few minutes.") : "";
    return { role: "system", text, at: Date.now() };
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
