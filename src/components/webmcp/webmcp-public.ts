/**
 * Public WebMCP tools on every page of dewee.sh: read the page as Markdown, switch language,
 * set the colour theme and open the support chat. Loaded once from BaseLayout.
 */
import { failure, modelContext, registerTools, str, text, type WebMcpTool } from "./webmcp-core";

function markdownUrl(): string {
  const path = location.pathname.replace(/\/$/, "") || "/";
  return path === "/" ? "/index.md" : `${path}.md`;
}

const tools: WebMcpTool[] = [
  {
    name: "get_page_markdown",
    description: "Returns the current dewee.sh page as clean Markdown (the same content as the page's .md twin).",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
    execute: async () => {
      const res = await fetch(markdownUrl(), { headers: { accept: "text/markdown" } });
      if (!res.ok) return failure(`No Markdown version of this page (HTTP ${res.status}).`);
      return text(await res.text());
    },
  },
  {
    name: "switch_language",
    description: "Switches the site between English (en) and Vietnamese (vi), staying on the equivalent page when one exists.",
    inputSchema: { type: "object", properties: { locale: { type: "string", enum: ["en", "vi"] } }, required: ["locale"], additionalProperties: false },
    execute: async (args) => {
      const locale = str(args, "locale");
      if (locale !== "en" && locale !== "vi") return failure('locale must be "en" or "vi".');
      if (document.documentElement.lang.toLowerCase().startsWith(locale)) return text(`Already showing ${locale}.`);
      const alt = document.querySelector<HTMLAnchorElement>(`a[hreflang="${locale}"]`)?.href ?? document.querySelector<HTMLLinkElement>(`link[rel="alternate"][hreflang="${locale}"]`)?.href;
      const target = alt ?? (locale === "vi" ? "/vi" : "/");
      location.assign(target);
      return text(`Opening ${target}`);
    },
  },
  {
    name: "set_theme",
    description: "Sets the colour theme: light (paper), dark (blackboard) or system.",
    inputSchema: { type: "object", properties: { theme: { type: "string", enum: ["light", "dark", "system"] } }, required: ["theme"], additionalProperties: false },
    execute: async (args) => {
      const theme = str(args, "theme");
      if (theme !== "light" && theme !== "dark" && theme !== "system") return failure('theme must be "light", "dark" or "system".');
      const control = document.querySelector<HTMLElement>(`[data-theme-seg] [data-value="${theme}"]`);
      if (control) {
        control.click();
      } else {
        try {
          localStorage.setItem("dewee.theme", theme);
        } catch {
          /* private mode: apply for this page only */
        }
        const dark = theme === "dark" || (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
        document.documentElement.dataset.theme = dark ? "dark" : "light";
        document.documentElement.dataset.themePref = theme;
      }
      return text(`Theme set to ${theme}.`);
    },
  },
  {
    name: "open_chat",
    description: "Opens the dewee support chat. An optional message is typed into the box for the visitor to review and send.",
    inputSchema: { type: "object", properties: { message: { type: "string", maxLength: 1000 } }, additionalProperties: false },
    execute: async (args) => {
      const panel = document.querySelector<HTMLElement>("[data-chat-panel]");
      if (!panel) return failure("The chat is not available on this page.");
      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.hidden = true;
      trigger.dataset.openChat = "";
      document.body.appendChild(trigger);
      trigger.click();
      trigger.remove();
      const message = str(args, "message", 1000);
      const input = panel.querySelector<HTMLTextAreaElement>("textarea");
      if (message && input) {
        input.value = message;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.focus();
      }
      return text(message ? "Chat opened with the message ready to send." : "Chat opened.");
    },
  },
];

if (modelContext()) registerTools(tools);
