/**
 * Browser side of the support chat. Protocol (JSON frames over /api/chat/ws):
 *   server → { type: "hello", online, history: Msg[] } | { type: "message", msg: Msg } | { type: "typing" } | { type: "ack-email" }
 *   client → { type: "message", text } | { type: "email", email }
 * A visitor keeps one session id (localStorage) so a refresh resumes the same conversation.
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
  let typingEl: HTMLLIElement | null = null;
  let hydrated = false;
  const outbox: string[] = [];

  const setState = (state: "connecting" | "online" | "offline") => {
    root.dataset.state = state;
    statusText.textContent = strings[state];
  };

  const scrollDown = () => { log.scrollTop = log.scrollHeight; };

  const render = (m: Msg) => {
    typingEl?.remove();
    typingEl = null;
    const li = document.createElement("li");
    li.className = `msg msg--${m.role}`;
    const p = document.createElement("p");
    p.textContent = m.text;
    li.append(p);
    log.append(li);
    scrollDown();
  };

  const showTyping = () => {
    if (typingEl) return;
    typingEl = document.createElement("li");
    typingEl.className = "msg msg--agent msg--typing";
    typingEl.setAttribute("aria-label", "…");
    typingEl.innerHTML = "<i></i><i></i><i></i>";
    log.append(typingEl);
    scrollDown();
  };

  const connect = () => {
    if (ws && ws.readyState <= 1) return;
    setState("connecting");
    const proto = location.protocol === "https:" ? "wss" : "ws";
    ws = new WebSocket(`${proto}://${location.host}/api/chat/ws?sid=${encodeURIComponent(sessionId())}&locale=${locale}`);
    ws.addEventListener("open", () => {
      retries = 0;
      while (outbox.length) ws!.send(outbox.shift()!);
    });
    ws.addEventListener("message", (ev) => {
      let data: { type: string; online?: boolean; history?: Msg[]; msg?: Msg; askEmail?: boolean };
      try { data = JSON.parse(String(ev.data)); } catch { return; }
      if (data.type === "hello") {
        setState(data.online ? "online" : "offline");
        if (!hydrated && data.history?.length) {
          data.history.forEach(render);
          suggest.hidden = true;
        }
        hydrated = true;
      } else if (data.type === "message" && data.msg) {
        render(data.msg);
        if (data.askEmail && !emailForm.dataset.done) emailForm.hidden = false;
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
    ws.addEventListener("close", () => {
      if (panel.hidden) return;
      setState("connecting");
      const delay = Math.min(15000, 800 * 2 ** retries++);
      setTimeout(connect, delay);
    });
  };

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

  toggle.addEventListener("click", () => open(panel.hidden));
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
    if (b) sendText(b.textContent || "");
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
