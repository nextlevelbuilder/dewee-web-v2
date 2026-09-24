/**
 * Browser side of the support chat. Protocol (JSON frames over /api/chat/ws):
 *   server → { type: "hello", online, history: Msg[] } | { type: "message", msg: Msg, askEmail? } | { type: "typing" }
 *          | { type: "presence", online } | { type: "ack-email" }
 *   client → { type: "message", text } | { type: "email", email }
 * A visitor keeps one session id (localStorage) so a refresh resumes the same conversation.
 * While the panel is open a dropped socket reconnects with backoff (at once when the browser
 * comes back online); messages typed meanwhile wait in an outbox, and replies sent while the
 * visitor was away arrive with the next "hello".
 */
type Role = "user" | "agent" | "system";
type Msg = { role: Role; text: string; at: number };
type Strings = Record<"connecting" | "online" | "offline" | "emailPrompt" | "emailSave" | "emailThanks" | "error" | "you", string>;

const SID_KEY = "dewee.chat.sid";

function sessionId(): string {
  try {
    const existing = localStorage.getItem(SID_KEY);
    if (existing && /^[a-z0-9-]{16,64}$/i.test(existing)) return existing;
    const sid = crypto.randomUUID();
    localStorage.setItem(SID_KEY, sid);
    return sid;
  } catch {
    return crypto.randomUUID();
  }
}

/** An http(s) URL in running text, without trailing punctuation that ends the sentence. */
const URL_RE = /\bhttps?:\/\/[^\s<>"']+[^\s<>"'.,;:!?)\]]/g;

/** Splits message text into plain runs and http(s) links (never any other scheme). */
export function linkSegments(text: string): { text: string; href?: string }[] {
  const out: { text: string; href?: string }[] = [];
  let at = 0;
  for (const match of text.matchAll(URL_RE)) {
    let href: string;
    try { href = new URL(match[0]).href; } catch { continue; }
    if (match.index > at) out.push({ text: text.slice(at, match.index) });
    out.push({ text: match[0], href });
    at = match.index + match[0].length;
  }
  if (at < text.length) out.push({ text: text.slice(at) });
  return out;
}

/** Message text as DOM nodes: links open in a new tab so the conversation stays in view. */
function textWithLinks(text: string): Node[] {
  return linkSegments(text).map((seg) => {
    if (!seg.href) return document.createTextNode(seg.text);
    const a = document.createElement("a");
    a.href = seg.href;
    a.textContent = seg.text;
    a.target = "_blank";
    a.rel = "noopener";
    return a;
  });
}

export function initChatWidget() {
  const root = document.querySelector<HTMLElement>("[data-chat]");
  if (!root || root.dataset.wired) return;
  root.dataset.wired = "1";

  const strings = JSON.parse(root.dataset.strings || "{}") as Strings;
  const locale = root.dataset.locale || "en";
  const toggle = root.querySelector<HTMLButtonElement>("[data-chat-toggle]")!;
  const panel = root.querySelector<HTMLElement>("[data-chat-panel]")!;
  const log = root.querySelector<HTMLOListElement>("[data-chat-log]")!;
  const form = root.querySelector<HTMLFormElement>("[data-chat-form]")!;
  const input = form.querySelector<HTMLTextAreaElement>("textarea")!;
  const emailForm = root.querySelector<HTMLFormElement>("[data-chat-email]")!;
  const suggest = root.querySelector<HTMLElement>("[data-chat-suggest]")!;
  const statusText = root.querySelector<HTMLElement>("[data-chat-status-text]")!;

  let ws: WebSocket | null = null;
  let retries = 0;
  let retryTimer = 0;
  let typingEl: HTMLLIElement | null = null;
  let hydrated = false;
  /** Newest server timestamp on screen: a reconnect's history shows only what came after it. */
  let lastServerAt = 0;
  const outbox: string[] = [];

  const setState = (state: "connecting" | "online" | "offline", text = strings[state]) => {
    root.dataset.state = state;
    statusText.textContent = text;
  };

  const scrollDown = () => { log.scrollTop = log.scrollHeight; };

  const clearTyping = () => {
    typingEl?.remove();
    typingEl = null;
  };

  const render = (m: Msg, fromServer = false) => {
    if (fromServer) lastServerAt = Math.max(lastServerAt, m.at);
    clearTyping();
    const li = document.createElement("li");
    li.className = `msg msg--${m.role}`;
    const p = document.createElement("p");
    for (const node of textWithLinks(m.text)) p.appendChild(node);
    li.appendChild(p);
    log.appendChild(li);
    scrollDown();
  };

  const showTyping = () => {
    if (typingEl) return;
    typingEl = document.createElement("li");
    typingEl.className = "msg msg--agent msg--typing";
    typingEl.setAttribute("aria-label", "…");
    typingEl.innerHTML = "<i></i><i></i><i></i>";
    log.appendChild(typingEl);
    scrollDown();
  };

  const connect = () => {
    if (ws && ws.readyState <= 1) return;
    clearTimeout(retryTimer);
    setState("connecting", retries ? strings.error : strings.connecting);
    const proto = location.protocol === "https:" ? "wss" : "ws";
    const socket = new WebSocket(`${proto}://${location.host}/api/chat/ws?sid=${encodeURIComponent(sessionId())}&locale=${locale}`);
    ws = socket;
    socket.addEventListener("open", () => {
      retries = 0;
      while (outbox.length) socket.send(outbox.shift()!);
    });
    socket.addEventListener("message", (ev) => {
      let data: { type: string; online?: boolean; history?: Msg[]; msg?: Msg; askEmail?: boolean };
      try { data = JSON.parse(String(ev.data)); } catch { return; }
      if (data.type === "hello") {
        setState(data.online ? "online" : "offline");
        const history = data.history ?? [];
        if (!hydrated) {
          history.forEach((m) => render(m, true));
          if (history.length) suggest.hidden = true;
        } else {
          // Back after a drop: show replies that arrived meanwhile (the visitor's own lines are on screen).
          history.filter((m) => m.at > lastServerAt && m.role !== "user").forEach((m) => render(m, true));
        }
        hydrated = true;
      } else if (data.type === "message" && data.msg) {
        render(data.msg, true);
        if (data.askEmail && !emailForm.dataset.done) {
          emailForm.hidden = false;
          // The form takes room from the log: keep the reply that asked for it in view.
          scrollDown();
        }
      } else if (data.type === "typing") {
        showTyping();
      } else if (data.type === "presence") {
        setState(data.online ? "online" : "offline");
      } else if (data.type === "ack-email") {
        emailForm.hidden = true;
        emailForm.dataset.done = "1";
        render({ role: "system", text: strings.emailThanks, at: Date.now() });
      }
    });
    socket.addEventListener("close", () => {
      // A socket replaced by a newer one says nothing about the current connection.
      if (ws !== socket || panel.hidden) return;
      clearTyping();
      setState("connecting", strings.error);
      const delay = Math.min(15000, 800 * 2 ** retries++);
      retryTimer = window.setTimeout(connect, delay);
    });
  };

  // Offline: stop writing into a socket that cannot deliver (new lines wait in the outbox).
  // Online again: reconnect now instead of waiting out the backoff.
  window.addEventListener("offline", () => {
    if (ws?.readyState !== WebSocket.OPEN) return;
    ws.close();
    if (!panel.hidden) setState("connecting", strings.error);
  });
  window.addEventListener("online", () => {
    if (panel.hidden || (ws && ws.readyState <= 1)) return;
    retries = 0;
    connect();
  });

  const send = (frame: object) => {
    const raw = JSON.stringify(frame);
    if (ws?.readyState === WebSocket.OPEN) ws.send(raw);
    else { outbox.push(raw); connect(); }
  };

  const sendText = (text: string) => {
    const clean = text.trim().slice(0, 2000);
    if (!clean) return;
    render({ role: "user", text: clean, at: Date.now() });
    suggest.hidden = true;
    send({ type: "message", text: clean });
  };

  const open = (state: boolean) => {
    panel.hidden = !state;
    toggle.setAttribute("aria-expanded", String(state));
    if (state) {
      root.dataset.seen = "1";
      connect();
      requestAnimationFrame(() => input.focus());
    }
  };

  toggle.addEventListener("click", () => open(panel.hidden !== false));
  root.querySelector("[data-chat-close]")?.addEventListener("click", () => { open(false); toggle.focus(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) { open(false); toggle.focus(); } });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    sendText(input.value);
    input.value = "";
    input.style.height = "";
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); }
  });
  input.addEventListener("input", () => { input.style.height = "auto"; input.style.height = `${Math.min(input.scrollHeight, 128)}px`; });

  suggest.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-suggest]");
    if (!b) return;
    sendText(b.textContent || "");
    // The chips hide once the conversation starts; keep focus in the panel, on the composer.
    input.focus();
  });

  emailForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = (emailForm.elements.namedItem("email") as HTMLInputElement).value.trim();
    if (email) send({ type: "email", email });
  });

  // Deep link: any element with [data-open-chat] opens the panel.
  document.addEventListener("click", (e) => {
    const trigger = (e.target as HTMLElement).closest("[data-open-chat]");
    if (trigger) { e.preventDefault(); open(true); }
  });
}
