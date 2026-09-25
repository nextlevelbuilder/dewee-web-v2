/**
 * Signed chat session for the widget. Before the WebSocket opens, the browser asks
 * /api/chat/session for a short-lived token, passing a Cloudflare Turnstile check first when the
 * site has one (invisible unless Cloudflare wants an interaction). The token is cached per tab.
 */
type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
type Cached = { sid: string; token: string; exp: number };

const CACHE_KEY = "dewee.chat.session";
const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let scriptLoad: Promise<TurnstileApi> | null = null;

function loadTurnstile(): Promise<TurnstileApi> {
  scriptLoad ??= new Promise<TurnstileApi>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SCRIPT;
    s.async = true;
    s.onload = () => {
      const api = (window as unknown as { turnstile?: TurnstileApi }).turnstile;
      if (api) resolve(api); else reject(new Error("turnstile missing"));
    };
    s.onerror = () => { scriptLoad = null; reject(new Error("turnstile blocked")); };
    document.head.appendChild(s);
  });
  return scriptLoad;
}

/** Runs the challenge inside the chat log `host` (shown only if Cloudflare asks the visitor to click). */
async function challenge(siteKey: string, host: HTMLElement): Promise<string> {
  const api = await loadTurnstile();
  const box = document.createElement("li");
  box.className = "chat__challenge";
  host.appendChild(box);
  try {
    return await new Promise<string>((resolve, reject) => {
      const id = api.render(box, {
        sitekey: siteKey,
        action: "chat",
        appearance: "interaction-only",
        callback: (token: string) => { resolve(token); api.remove(id); },
        "error-callback": () => reject(new Error("challenge failed")),
        "expired-callback": () => reject(new Error("challenge expired")),
      });
    });
  } finally {
    box.remove();
  }
}

function readCache(sid: string): string | null {
  try {
    const c = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null") as Cached | null;
    return c && c.sid === sid && c.exp - 60_000 > Date.now() ? c.token : null;
  } catch {
    return null;
  }
}

export function forgetChatSession() {
  try { sessionStorage.removeItem(CACHE_KEY); } catch { /* storage off */ }
}

/**
 * A token for this session id, or "" when the site runs unsigned sessions.
 * Throws when the challenge fails or the visitor has opened too many sessions.
 */
export async function chatSessionToken(sid: string, host: HTMLElement): Promise<string> {
  const cached = readCache(sid);
  if (cached) return cached;
  const info = (await (await fetch("/api/chat/session", { cache: "no-store" })).json()) as { required: boolean; siteKey: string | null };
  if (!info.required) return "";
  const turnstile = info.siteKey ? await challenge(info.siteKey, host) : "";
  const res = await fetch("/api/chat/session", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ sid, turnstile }),
  });
  const body = (await res.json().catch(() => ({}))) as { token?: string; exp?: number; error?: string };
  if (!res.ok || !body.token || !body.exp) throw new Error(body.error || `session ${res.status}`);
  try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ sid, token: body.token, exp: body.exp } satisfies Cached)); } catch { /* storage off */ }
  return body.token;
}
