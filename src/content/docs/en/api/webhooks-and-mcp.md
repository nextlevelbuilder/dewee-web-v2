---
title: Webhooks and MCP
description: Let other systems trigger agents and send channel messages through signed webhooks, and connect Claude Code, Cursor, VS Code or Gemini CLI to dewee over MCP.
section: api
order: 3
updated: 2026-09-25
---

Two endpoints exist for other software to call dewee. **Webhooks** let a system you run, such as a CRM, a form or a monitoring tool, start an agent or post a message to a chat app. The **public MCP server** lets an AI coding assistant search a workspace's memory and skills and work with its workflows. Both are narrow on purpose: each accepts only its own kind of credential and exposes a fixed set of actions.

## Webhooks

There are two kinds of webhook:

| Kind | Endpoint | What it does | Edition |
|---|---|---|---|
| `llm` | `POST /v1/webhooks/llm` | Runs an agent on the input you send and returns its answer | Standard and Lite |
| `message` | `POST /v1/webhooks/message` | Sends a message, with optional media, to a chat on a connected channel | Standard |

A tenant admin creates a webhook with `POST /v1/webhooks`, naming the kind and, for `llm`, the agent. The response contains the webhook secret, which starts with `wh_` and is shown only once. Webhooks need `GOCLAW_ENCRYPTION_KEY` on the gateway, because the secret is also kept encrypted to sign callbacks.

### Call an agent

```bash
curl https://dewee.example.com/v1/webhooks/llm \
  -H "Authorization: Bearer <webhook-secret>" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: <unique-request-id>" \
  -d '{"input": "Summarise the new ticket and suggest a reply", "session_key": "ticket-4812", "mode": "sync"}'
```

In `sync` mode the answer comes back in the response, and the call times out after 30 seconds with `504`. In `async` mode the gateway answers `202` straight away and posts the result to your `callback_url`, which must be HTTPS. A `session_key` keeps related calls in one conversation.

### Send a message

A `message` webhook takes a `channel_name`, a `chat_id` and `content` of up to 16 KB, plus an optional `media_url`. With `fallback_to_text`, media is dropped on channels that cannot show it instead of failing the call.

### Sign requests

A plain bearer secret is the simplest option. For stronger protection, sign each request with HMAC and set `require_hmac` so the bearer form is refused:

```text
X-Webhook-Id: <webhook-id>
X-GoClaw-Signature: t=<unix-seconds>,v1=<hex HMAC-SHA256 of "<t>.<raw body>">
```

The timestamp must be within 5 minutes of the gateway's clock, and a signature cannot be replayed. You can also restrict callers to an IP allowlist; it uses the connecting address and ignores `X-Forwarded-For`.

### Retries and idempotency

- Send an `Idempotency-Key` header. A retry with the same key and body returns the first result without running the agent again; the same key with a different body returns `409`.
- Callbacks are delivered at least once. Each carries a stable `X-Webhook-Delivery-Id` for de-duplication and an `X-Webhook-Signature` made with the same algorithm, so you can verify it with your webhook secret.
- Failed callbacks are retried after 30 seconds, 2 minutes, 10 minutes, 1 hour and 6 hours, then marked dead. A `4xx` reply other than `429` stops the retries.
- Each webhook and each tenant has a rate limit. Over it, the gateway answers `429` with `Retry-After`.

> [!WARNING]
> Rotating a secret with `POST /v1/webhooks/{id}/rotate` invalidates the old one immediately; there is no overlap. Update the sender at the same moment.

## The public MCP server

The gateway can act as an MCP server at `POST /mcp`, so an MCP client such as Claude Code, Cursor, VS Code or Gemini CLI can use a workspace from inside the editor. It is not the same as the MCP servers dewee itself connects to, which you manage under [Tools, MCP and hooks](/docs/console/tools-mcp-and-hooks).

On a self-hosted gateway the endpoint is **off by default**. An operator turns it on with `GOCLAW_MCP_PUBLIC_ENABLED=1` or `tools.mcp.public.enabled` in the config.

### What a client can do

| Available | Never available |
|---|---|
| `memory_search`, `memory_get` | Running commands, changing files |
| `skill_search`, `web_search` | Browser, messaging, schedules, spawning agents |
| `workflow`: list, get, validate, see node types, runs and run status | Admin, credential, provider and package operations |
| `workflow`: create and update drafts, with `mcp.tools.write` | Publishing or running workflows; tools from other MCP servers |

The client acts as one agent in its tenant, chosen with the `X-Dewee-Agent` header or the `?agent=` query parameter, and otherwise the `default` agent. The key's owner must have access to that agent, and an unknown or forbidden agent returns the same `404`.

### Connect a client

1. Create a key with the **MCP read** or **MCP read and write** preset on the console's **API keys** page. The page also shows copyable client configuration. From the CLI, the equivalent is `dewee api-keys create` with `mcp.tools.read` and an owner.
2. Export the key as `DEWEE_MCP_TOKEN` so it never lands in a config file.
3. Generate the configuration for your client and merge it into the client's settings:

```bash
export DEWEE_MCP_TOKEN=<mcp-api-key>
dewee mcp connect-config --client claude
```

`--client` accepts `claude`, `cursor`, `vscode`, `gemini` and `generic`. The rendered configuration refers to the environment variable and never contains the key itself.

### Limits

Each credential may send 120 requests per minute (bursts of 20) and run 4 tool calls at a time, each with a 60-second deadline. Request bodies are capped at 1 MiB. The server speaks the stateless Streamable HTTP transport of MCP `2026-07-28`, and older clients negotiate down. Generic HTTP clients are covered by automated tests; Claude Code, Cursor, VS Code with Copilot and Gemini CLI have been verified by hand.
