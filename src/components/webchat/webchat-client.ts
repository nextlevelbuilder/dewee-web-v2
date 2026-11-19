/**
 * Mounts the dewee-webchat widget and wires it into the site:
 *  - mounts only when /api/dewee/config answers, so a deployment without the integration shows nothing;
 *  - follows the site's theme toggle (html[data-theme]) rather than the OS setting;
 *  - any [data-open-chat] element opens it (CTAs, 404, contact page, the WebMCP open_chat tool);
 *  - registers the `capture_lead` page action: the widget asks the visitor to confirm what is sent,
 *    then the page posts it to /api/chat/lead, which stores it in the site's `leads` table.
 */
import { mount, type PageAction } from "dewee-webchat";
import type { WebchatStrings } from "~/content/webchat";

type Chat = ReturnType<typeof mount>;
type LeadArgs = { email: string; name?: string; phone?: string; company?: string; useCase?: string; teamSize?: string; plan?: string; consent: boolean };

const ACCENT = "#5446e8"; // --brand-iris; the widget's shadow DOM cannot read our tokens.
/** PostHog is loaded only after cookie consent rules allow it; absent means no tracking. */
const track = (event: string, props?: Record<string, unknown>) =>
  (window as unknown as { posthog?: { capture(e: string, p?: Record<string, unknown>): void } }).posthog?.capture(event, props);
const siteTheme = () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

let conversationId: string | undefined;

function leadAction(locale: string, description: string): PageAction<LeadArgs> {
  const str = (max: number) => ({ type: "string", maxLength: max });
  return {
    name: "capture_lead",
    description,
    sensitivity: "mutate", // the widget shows the details and the visitor approves before anything is sent
    parameters: {
      type: "object",
      properties: {
        email: { type: "string", maxLength: 254, pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" },
        name: str(120), phone: { type: "string", maxLength: 40, pattern: "^[+()0-9 .-]{6,40}$" }, company: str(160),
        useCase: str(1000), teamSize: str(40), plan: str(40),
        consent: { type: "boolean", const: true },
      },
      required: ["email", "consent"],
      additionalProperties: false,
    },
    handler: async (args) => {
      const res = await fetch("/api/chat/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...args, locale, page: location.pathname, conversationId }),
      });
      const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !body.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
      track("chat_lead_captured", { page: location.pathname });
      return { saved: true };
    },
  };
}

function openWith(chat: Chat, message?: string) {
  chat.open();
  if (!message) return;
  // Put the text in the box for the visitor to review; never send on their behalf.
  const input = chat.shadowRoot?.querySelector<HTMLTextAreaElement>("textarea");
  if (input) { input.value = message; input.dispatchEvent(new Event("input", { bubbles: true })); input.focus(); }
}

async function init() {
  const host = document.querySelector<HTMLElement>("[data-webchat]");
  if (!host) return;
  const locale = host.dataset.locale === "vi" ? "vi" : "en";
  const strings = JSON.parse(host.dataset.strings ?? "{}") as WebchatStrings;

  try {
    const res = await fetch("/api/dewee/config", { headers: { accept: "application/json" } });
    if (!res.ok) return;
  } catch { return; }

  const chat = mount({
    endpoint: "/api/dewee",
    locale,
    theme: siteTheme(),
    accentColor: ACCENT,
    title: strings.title,
    subtitle: strings.subtitle,
    greeting: strings.greeting,
    intro: strings.intro,
    placeholder: strings.placeholder,
    suggestions: strings.suggestions,
    avatar: "/brand/dewee-icon-144.png",
    launcherAvatar: true,
    showReasoning: false,
    actions: [leadAction(locale, strings.leadAction)],
  });
  chat.dataset.chat = "";
  chat.addEventListener("dewee:reply", (e) => {
    const id = (e as CustomEvent<{ conversationId?: string }>).detail?.conversationId;
    if (id) conversationId = id;
  });

  chat.addEventListener("dewee:open", () => track("chat_opened"));

  new MutationObserver(() => chat.configure({ theme: siteTheme() }))
    .observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  document.addEventListener("click", (e) => {
    const trigger = (e.target as HTMLElement).closest<HTMLElement>("[data-open-chat]");
    if (!trigger) return;
    e.preventDefault();
    openWith(chat, trigger.dataset.chatMessage);
  });
}

void init();
