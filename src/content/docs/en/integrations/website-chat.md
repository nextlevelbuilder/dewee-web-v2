---
title: Embed an agent on your website
description: "Put a dewee agent on any website with dewee-webchat, the open-source chat widget: a script tag or a React, Vue or Astro component, plus a small backend handler."
section: integrations
order: 3
updated: 2026-11-08
---

[dewee-webchat](https://github.com/nextlevelbuilder/dewee-webchat) is an open-source (MIT) chat widget that puts one of your agents on your own website. Visitors chat with it in a floating bubble or an inline panel, and they see the agent work: its reasoning, the tools it calls and their results, and the answer in Markdown. The package is on npm as `dewee-webchat`.

Try it first in the [playground](https://webchat.dewee.sh). Its form lets you choose the options and generates the embed code for your framework.

## How it fits together

The widget never talks to your dewee gateway directly. A small backend that you host sits in between and holds the gateway token:

```text
browser <dewee-chat>  ──HTTPS + SSE──▶  your backend /api/dewee/*  ──WebSocket──▶  dewee gateway
   (visitor token only)                   (holds the gateway token)                (agents, MCP, tools)
```

- **The widget** is a Web Component, `<dewee-chat>`, rendered in Shadow DOM so your site's styles and its own do not collide. It ships with wrappers for React (`dewee-webchat/react`), Vue (`dewee-webchat/vue`) and Astro (`dewee-webchat/astro`), and a script tag that mounts itself from `data-*` attributes.
- **The backend** is `createDeweeHandler` from `dewee-webchat/server`, a standard `(Request) => Response` handler mounted at `/api/dewee/*`. It runs on Cloudflare Workers, Next.js, Astro, Bun, Deno and Node (through `toNodeHandler`). For PHP hosting there is a single-file backend, `php/dewee-webchat.php`, with no Composer needed.

## 1. Create a scoped API key

Give the website its own key, limited to what a chat needs:

```bash
dewee api-keys create --name "website chat" --scopes operator.read,operator.write
```

Keep the key on your server. See [API authentication](/docs/api/authentication) for what each scope allows.

## 2. Mount the backend

Install the package and mount the handler. In a Next.js App Router project:

```bash
npm i dewee-webchat
```

```ts
// app/api/dewee/[...path]/route.ts
import { createDeweeHandler, optionsFromEnv } from "dewee-webchat/server";

export const dynamic = "force-dynamic";
const handler = createDeweeHandler(optionsFromEnv(process.env));
export { handler as GET, handler as POST, handler as OPTIONS };
```

On Express, mount `toNodeHandler(createDeweeHandler(optionsFromEnv(process.env)))` at `/api/dewee/*path`. The repository has runnable examples for each runtime.

Then set the environment variables on the server:

| Variable | What it holds |
|---|---|
| `DEWEE_GATEWAY_URL` | Your gateway's address |
| `DEWEE_GATEWAY_TOKEN` | The key from step 1. Server only, never sent to the browser |
| `DEWEE_WEBCHAT_SECRET` | A random secret of 32 or more characters that signs visitor sessions |
| `DEWEE_AGENTS` | The agents visitors may reach, comma separated (`support,sales`) |
| `DEWEE_DEFAULT_AGENT` | Optional; the agent a new chat starts with |
| `DEWEE_ALLOWED_ORIGINS` | Optional; other sites allowed to embed the widget (the same origin always works) |
| `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Optional; a Cloudflare Turnstile check for new visitors |

## 3. Add the widget

The quickest way is the script tag from the CDN, with no build step:

```html
<script
  src="https://webchat-cdn.dewee.sh/dewee-webchat@0.1.1/dewee-webchat.js"
  data-endpoint="/api/dewee"
  data-title="Support"
  defer
></script>
```

In a React, Vue or Astro app, import `DeweeChat` from the matching wrapper and pass `endpoint="/api/dewee"`. Anywhere else, import `dewee-webchat` and write `<dewee-chat endpoint="/api/dewee"></dewee-chat>`.

## Options

Options are attributes on `<dewee-chat>` in kebab-case, `data-*` attributes on the script tag, or camelCase props in the framework wrappers.

| Option | What it does |
|---|---|
| `mode` | `floating` (a bubble that opens a panel) or `inline` (fills its container) |
| `theme` | `light`, `dark` or `auto` |
| `accent-color` | Any CSS colour |
| `locale` | `en` or `vi`; defaults to the page language |
| `show-reasoning` | Stream the model's thinking |
| `show-tool-calls` | Show tool calls with their arguments and results |
| `allow-agent-switch` | Let visitors pick another allowed agent |
| `persist` | Keep the conversation across page loads |

From your own scripts you can call `open()`, `close()`, `toggle()`, `send(text)`, `stop()` and `newConversation()`, and listen for the `dewee:ready`, `dewee:open`, `dewee:close`, `dewee:send`, `dewee:reply` and `dewee:error` events.

## Page context for a single message

For integrations that capture the current page, the gateway has a versioned page-context contract. Availability depends on the deployed gateway and website-chat ingress: check support before attaching anything. Do not assume that an existing widget or backend captures or forwards page context automatically.

- For a Gateway WebSocket client, inspect `page_context_versions` in the `connect` response. If it includes `1`, send the attachment as `pageContext` in `chat.send`.
- For a custom client of the customer control plane website-chat ingress, inspect `page_context.versions` in `GET config`. If it includes `1`, send the attachment as `page_context` in the `POST chat` body. If the list is missing or does not include `1`, send the message without an attachment.

Version 1 requires `version` and an absolute HTTP(S) `url`. It optionally accepts `title`, `description`, `captured_at`, `selection`, and `content` with `format` (`text` or `markdown`), `text`, and `truncated`. The encoded JSON envelope is limited to 64 KiB; unknown fields are rejected. A host can include `source` and `trust_level`, but the runtime ignores their supplied values and assigns its own. The gateway also enforces field limits and removes URL fragments, redacts secret-looking query values and credentials, and rejects URLs with userinfo.

The gateway treats the attachment as untrusted external data for the current run, not as instructions. It does not store page text in chat history, summaries, memory, logs or trace text, and the attachment changes neither tools nor permissions. A refused attachment rejects the whole send with `page_context_invalid` or `page_context_unsupported`; retry without it only if the person still wants the message sent. Never append the page text to the person's message as a fallback. The CLI and MCP have no page to attach, so this contract does not apply to them.

## Credential requests in website chat

Where the gateway and widget support it, an agent can ask a visitor with a verified chat identity for a credential with a card in the website conversation. This capability is off by default: a self-hosted operator must enable it on the gateway, the agent must have credential requests enabled, and the widget must support the capability. Anonymous visitors cannot use the card, and a verified chat identity does not grant credential administration.

On a supporting self-hosted gateway, set `GOCLAW_WEBCHAT_CREDENTIAL_REQUESTS_ENABLED=true` and configure `GOCLAW_CREDENTIAL_LINK_BASE_URL`. Enable `credential_requests` for the agent, and use a widget that advertises credential-request support. Check the deployed gateway and widget versions before enabling it.

The card never displays the secret. Select **Open secure form** to open a first-party hosted form in a new tab. A signed-in workspace approval admin must enter the secret there, not in chat. The request expires after one hour and can be cancelled from the card. Once the credential is saved, the original conversation continues once from where it stopped. Reloading the page restores the current pending, completed, expired or cancelled state. Opening the secure form is rate limited per visitor.

Website chat uses its own verified-identity flow. For credential links delivered through a messaging channel, see [Secrets, roles and audit](/docs/security/secrets-roles-and-audit).

## Security

- **The gateway token stays on your server.** The browser only holds a visitor token signed with HMAC.
- **Each visitor is a separate user** on the gateway, `webchat-<id>`, so one visitor's history is private to them.
- **Allowlists**: visitors reach only the agents in `DEWEE_AGENTS`, and only from allowed origins.
- **Limits**: 20 messages a minute per visitor, 10 new sessions per 10 minutes per IP address, and 4,000 characters per message.
- **Bots**: turn on Cloudflare Turnstile to check new visitors.

> [!TIP]
> A website chat talks to strangers. Give its agent only the tools and knowledge a member of the public should reach, the same care you take with an `open` channel. See [Tools and permissions](/docs/concepts/tools-and-permissions).

## Live examples

| Stack | Live demo |
|---|---|
| Plain HTML on a Worker (the playground) | [webchat.dewee.sh](https://webchat.dewee.sh) |
| Next.js | [webchat-next.dewee.sh](https://webchat-next.dewee.sh) |
| Astro | [webchat-astro.dewee.sh](https://webchat-astro.dewee.sh) |
| React | [webchat-react.dewee.sh](https://webchat-react.dewee.sh) |
| Vue | [webchat-vue.dewee.sh](https://webchat-vue.dewee.sh) |

Node with Express and PHP examples are in the [repository](https://github.com/nextlevelbuilder/dewee-webchat), along with every option and the wire format between the widget and the backend.
