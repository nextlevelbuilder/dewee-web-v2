/**
 * One Durable Object per visitor conversation (keyed by the visitor's session id).
 * Holds the transcript in its own SQLite storage and fans messages out between:
 *   - visitor sockets (the website widget),
 *   - agent sockets (dewee's own support agent or a human operator, via the API),
 *   - an optional webhook (CHAT_AGENT_WEBHOOK_URL) for agents that answer through REST,
 *   - the dewee advisor agent on the dewee runtime (DEWEE_CHAT_AGENT_*), behind a daily budget.
 * With nobody attached, or the agent off or out of budget, it answers from the FAQ and asks for an email.
 * The agent captures leads, asks for an email or hands off through structured actions in its reply
 * (chat-agent-actions); the room validates them against this conversation and strips them.
 * Limits: 30 messages / 10 min per room, 40 turns per conversation, 60 messages / hour per visitor IP.
 * Uses the hibernation API so idle conversations cost nothing.
 */
import { DurableObject } from "cloudflare:workers";
import { mergeChatContext, readChatContext } from "../chat-session-context";
import { leadEmailAllowed, type LeadFields } from "./chat-agent-actions";
import { agentConfig, HISTORY_LINES } from "./chat-agent-client";
import { agentReply, type AgentTurn } from "./chat-agent-turn";
import { answerFromFaq } from "./chat-faq";
import { saveChatLead, type LeadVia } from "./chat-lead-records";
import { CHAT_LIMITS } from "./chat-limits";
import { ipAllowsMessage } from "./chat-limiter";
import { ChatRoomStore, type ChatMessage } from "./chat-room-store";
import {
  announceNewChat, forwardToWebhook, leadThanks, notifyHandoff, recordHandoff, recordReply, recordTurn, recordVisitorMessage,
  systemLine, type SystemLine, type TurnResult,
} from "./chat-room-records";
import { emailIn } from "./chat-visitor-email";
import { EMAIL_RE } from "./notify";

export type { ChatMessage } from "./chat-room-store";

const MAX_TEXT = CHAT_LIMITS.maxChars;
const RATE_WINDOW_MS = 10 * 60_000;
const RATE_MAX = 30;

export class ChatRoom extends DurableObject<Env> {
  private store: ChatRoomStore;
  /** Lead writes run one at a time, so an email-form submit during an agent turn cannot create a second row. */
  private leadQueue: Promise<void> = Promise.resolve();

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.store = new ChatRoomStore(ctx.storage.sql);
    ctx.blockConcurrencyWhile(async () => this.store.init());
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname !== "/ws" || request.headers.get("upgrade")?.toLowerCase() !== "websocket") {
      return new Response("Not found", { status: 404 });
    }
    const role = url.searchParams.get("role") === "agent" ? "agent" : "visitor";
    const sid = url.searchParams.get("sid") ?? "";
    if (role === "visitor") {
      this.store.set("sid", sid);
      this.store.set("locale", url.searchParams.get("locale") === "vi" ? "vi" : "en");
      // Hashed visitor IP from the verified session token; absent when sessions are unsigned.
      const ipHash = url.searchParams.get("ih");
      if (ipHash && /^[0-9a-f]{32}$/.test(ipHash)) this.store.set("ih", ipHash);
      // Page, landing, referrer, UTM and country, already validated by the edge; first visit wins.
      this.store.set("ctx", JSON.stringify(mergeChatContext(this.store.context(), readChatContext(url.searchParams))));
    }
    const { 0: client, 1: server } = new WebSocketPair();
    this.ctx.acceptWebSocket(server, [role]);
    server.send(JSON.stringify({ type: "hello", online: this.online(), history: role === "visitor" ? this.store.history(50) : this.store.history(200), sid }));
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
    if (this.store.count("user") >= CHAT_LIMITS.turnsPerConversation) {
      ws.send(JSON.stringify({ type: "message", msg: this.systemMsg("turns"), askEmail: !this.store.get("email") }));
      return;
    }
    if (this.store.userMessagesSince(Date.now() - RATE_WINDOW_MS) >= RATE_MAX || !(await ipAllowsMessage(this.env, this.store.get("ih")))) {
      ws.send(JSON.stringify({ type: "message", msg: this.systemMsg("slow") }));
      return;
    }
    const msg = this.store.insert("user", text);
    // Show "thinking" at once; recording the message and pinging the team can take a moment.
    ws.send(JSON.stringify({ type: "typing" }));
    this.broadcast("agent", { type: "message", msg });
    const sid = this.store.get("sid");
    await recordVisitorMessage(this.env, sid, this.store.locale(), text, this.store.context());
    await this.announceOnce();
    const typed = emailIn(text);

    if (this.ctx.getWebSockets("agent").length) return this.leadFromChat(ws, typed);
    if (this.env.CHAT_AGENT_WEBHOOK_URL) {
      const ok = await forwardToWebhook(this.env.CHAT_AGENT_WEBHOOK_URL, { sid, locale: this.store.locale(), text, history: this.store.history(20) });
      if (ok) return this.leadFromChat(ws, typed);
    }
    const turn = await agentReply(this.env, this.store.history(HISTORY_LINES), this.store.locale(), sid ?? "", (visible) => {
      try { ws.send(JSON.stringify({ type: "delta", text: visible })); } catch { /* visitor left */ }
    }, { page: this.store.context().page, visitorTurn: this.store.count("user"), emailOnFile: Boolean(this.store.get("email")) });
    if (!turn.ok) {
      await this.leadFromChat(ws, typed);
      return this.answerFromFaq(ws, text, turn.reason === "error" ? "agent_failure" : "faq");
    }
    return this.applyAgentTurn(ws, turn, text, typed);
  }

  /** Acts on the agent's validated actions, then shows its reply (actions already stripped). */
  private async applyAgentTurn(ws: WebSocket, turn: Extract<AgentTurn, { ok: true }>, visitorText: string, typed: string | null) {
    const { actions } = turn;
    const agentLead = actions.lead && leadEmailAllowed(actions.lead.email, this.store.visitorTexts(), this.store.get("email")) ? actions.lead : null;
    if (actions.lead && !agentLead) console.warn("chat lead refused: the visitor never gave that email", { sid: this.store.get("sid") });
    if (agentLead) await this.captureLead(ws, agentLead, "agent");
    else await this.leadFromChat(ws, typed);
    if (actions.handoff) await this.handoffOnce(actions.handoffReason);

    const email = this.store.get("email");
    // A reply that was only a (refused) lead block leaves nothing to show: answer from the FAQ instead.
    if (!turn.text && !email) return this.answerFromFaq(ws, visitorText, "agent_failure");
    const text = turn.text || leadThanks(this.store.locale(), email ?? "");
    const reply = this.store.insert("agent", text);
    const askEmail = !email && (actions.requestEmail || actions.handoff);
    ws.send(JSON.stringify({ type: "message", msg: reply, askEmail }));
    await recordTurn(this.env, this.store.get("sid"), "answered");
  }

  private async answerFromFaq(ws: WebSocket, text: string, result: TurnResult) {
    const answer = answerFromFaq(text, this.store.locale(), Boolean(this.store.get("email")));
    const reply = this.store.insert("agent", answer.text);
    ws.send(JSON.stringify({ type: "message", msg: reply, askEmail: answer.askEmail }));
    if (answer.handoff) await this.handoffOnce();
    await recordTurn(this.env, this.store.get("sid"), result);
  }

  async webSocketClose(ws: WebSocket, code: number) {
    const role = this.ctx.getTags(ws)[0];
    try { ws.close(code === 1005 ? 1000 : code, "bye"); } catch { /* already closed */ }
    if (role === "agent" && this.ctx.getWebSockets("agent").length <= 1) this.broadcast("visitor", { type: "presence", online: this.online(true) });
  }

  /** RPC: an agent or operator answers through the REST API. */
  async reply(text: string): Promise<ChatMessage> {
    const msg = this.store.insert("agent", text.trim().slice(0, MAX_TEXT * 2));
    this.broadcast("visitor", { type: "message", msg });
    this.broadcast("agent", { type: "message", msg });
    await recordReply(this.env, this.store.get("sid"));
    return msg;
  }

  /** RPC: transcript for the API / admin. */
  async transcript(limit = 200): Promise<{ sid: string | null; locale: string; email: string | null; messages: ChatMessage[] }> {
    return { sid: this.store.get("sid"), locale: this.store.locale(), email: this.store.get("email"), messages: this.store.history(limit) };
  }

  /** The email form: a valid address becomes (or updates) this conversation's lead. */
  private async saveEmail(ws: WebSocket, email: string) {
    const clean = email.trim().toLowerCase();
    if (clean.length > 254 || !EMAIL_RE.test(clean)) return;
    await this.captureLead(ws, { email: clean }, "form");
  }

  /** An email the visitor typed into the chat becomes a lead when it is new. */
  private async leadFromChat(ws: WebSocket, typed: string | null) {
    if (typed && typed !== this.store.get("email")) await this.captureLead(ws, { email: typed }, "chat");
  }

  /** Stores or enriches this conversation's one lead; the session id is always the room's own. */
  private captureLead(ws: WebSocket, fields: LeadFields, via: LeadVia): Promise<void> {
    this.leadQueue = this.leadQueue.then(() => this.writeLead(ws, fields, via)).catch((err) => console.error("chat lead capture failed", err));
    return this.leadQueue;
  }

  private async writeLead(ws: WebSocket, fields: LeadFields, via: LeadVia) {
    const leadId = Number(this.store.get("lead-id")) || null;
    const saved = await saveChatLead(this.env, {
      sid: this.store.get("sid"), locale: this.store.locale(), leadId, previous: this.store.json<LeadFields>("lead"), fields, via,
      ctx: this.store.context(), transcript: this.store.history(8),
    });
    if (saved.leadId !== null) this.store.set("lead-id", String(saved.leadId));
    this.store.set("lead", JSON.stringify(saved.fields));
    const newEmail = this.store.get("email") !== saved.fields.email;
    this.store.set("email", saved.fields.email);
    if (newEmail) ws.send(JSON.stringify({ type: "ack-email" }));
  }

  /** Marks the session handed off once, and pings the team until Discord has taken the ping. */
  private async handoffOnce(reason?: string) {
    if (!this.store.get("handoff")) {
      this.store.set("handoff", "1");
      await recordHandoff(this.env, this.store.get("sid"));
    }
    if (this.store.get("handoff-sent")) return;
    if (await notifyHandoff(this.env, this.store.get("sid"), this.store.get("email"), this.store.context(), this.store.history(8), reason)) this.store.set("handoff-sent", "1");
  }

  /**
   * "New website chat" for the team, retried on the visitor's next message until Discord accepts
   * it. It used to be a one-shot on message one, so a single refused or failed post lost it.
   */
  private async announceOnce() {
    if (this.store.get("announced")) return;
    const first = this.store.visitorTexts()[0] ?? "";
    if (await announceNewChat(this.env, this.store.get("sid"), this.store.locale(), first, this.store.context())) this.store.set("announced", "1");
  }

  private online(excludingClosing = false) {
    const agents = this.ctx.getWebSockets("agent").length - (excludingClosing ? 1 : 0);
    return agents > 0 || Boolean(this.env.CHAT_AGENT_WEBHOOK_URL) || agentConfig(this.env) !== null;
  }

  private systemMsg(kind: SystemLine): ChatMessage {
    return { role: "system", text: systemLine(kind, this.store.locale()), at: Date.now() };
  }

  private broadcast(tag: "visitor" | "agent", payload: unknown) {
    const raw = JSON.stringify(payload);
    for (const s of this.ctx.getWebSockets(tag)) {
      try { s.send(raw); } catch { /* socket closing */ }
    }
  }
}
