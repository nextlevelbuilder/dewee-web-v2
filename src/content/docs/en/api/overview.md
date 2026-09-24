---
title: API overview
description: "The runtime's REST API, WebSocket RPC, OpenAI-compatible chat, public MCP server and webhooks: what each is for, where the reference lives, how errors look."
section: api
order: 1
updated: 2026-09-25
---

The runtime's API covers what agents do and how they are configured: agents, sessions, providers, channels, tools, memory and more, so that work can be automated as well as clicked. Console-only matters such as members, billing and support stay in the console. The gateway serves all of it on one port: a REST API under `/v1`, a WebSocket for live sessions, and a few endpoints built for other tools to call. This page maps them out; [Authentication](/docs/api/authentication) explains the keys, and [Webhooks and MCP](/docs/api/webhooks-and-mcp) covers the two integration endpoints.

## Base URL and reference

On a runtime you operate, the base URL is the address of your gateway, for example `https://dewee.example.com`. For a workspace in the console, the **API keys** page shows the base URL together with ready-to-copy examples in cURL, JavaScript, Python and WebSocket.

Every gateway also publishes its own reference:

- `/docs` serves an interactive Swagger UI.
- `/v1/openapi.json` is the OpenAPI 3.0 specification, for generating clients.

The reference on your gateway always matches the version you run, so prefer it over any copy.

## The surfaces

| Surface | Path | Use it for |
|---|---|---|
| REST API | `/v1/...` | Managing agents, sessions, providers, skills, workflows, channels, memory, files, usage and more |
| WebSocket RPC | `/ws` | Live chat with streaming, agent and team events, approvals |
| Chat completions | `POST /v1/chat/completions` | Talking to an agent from any OpenAI-compatible client |
| Responses | `POST /v1/responses` | The same, for clients that use the OpenAI Responses format |
| Public MCP server | `POST /mcp` | Letting Claude Code, Cursor, VS Code or Gemini CLI use a workspace's knowledge and workflows |
| Webhooks | `POST /v1/webhooks/llm`, `POST /v1/webhooks/message` | Letting another system trigger an agent or send a message on a channel |
| Health | `/health`, `/livez`, `/readyz` | Load balancer and orchestrator checks; no authentication |

## Chat with an agent

The chat endpoint speaks the OpenAI Chat Completions format, so existing SDKs work by changing the base URL and key. Choose the agent with an `agent:` prefix in `model`, or with the `X-GoClaw-Agent-Id` header; without either, the request goes to the agent called `default`.

```bash
curl https://dewee.example.com/v1/chat/completions \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "agent:<agent-key>",
    "messages": [{"role": "user", "content": "Summarise yesterday'\''s support tickets"}],
    "stream": false
  }'
```

Set `"stream": true` to receive server-sent events, ending with `data: [DONE]`. To keep a conversation going across requests, send the same `X-GoClaw-Session-Key` header each time. The agent runs its full loop, with its own tools, skills and memory, before it answers; see [Agent loop](/docs/concepts/agent-loop).

## WebSocket RPC

The WebSocket at `/ws` is what the console uses for live chat. The first frame must be a `connect` request with your key; anything else is rejected.

```json
{"type": "req", "id": "1", "method": "connect", "params": {"token": "<api-key>", "locale": "en"}}
```

The reply tells you your role and tenant. After that, each request is a `req` frame with a `method` and `params`, answered by a `res` frame with the same `id`. The server pushes `event` frames for streamed replies, tool calls, team tasks, approvals and trace updates. The protocol version is 3; `/health` reports it too.

## Errors and limits

- Errors come back as JSON with an `error` field and the usual status codes: `400`, `401`, `403`, `404`, `409`, `429` and `500`.
- On the WebSocket, failed requests return `ok: false` with an error `code`, `message`, and a `retryable` hint.
- Chat is rate-limited per user or IP, 20 requests per minute by default; over the limit you get `429` with `Retry-After`.
- HTTP bodies are limited to 1 MB and WebSocket frames to 512 KB.

## Route groups

| Group | Examples of what you can manage |
|---|---|
| Agents and conversations | Agents and their sharing, sessions, tasks, skills, episodic memory, knowledge graph, vault |
| Models and tools | Providers and their models, model pricing, MCP servers dewee connects to, custom tools, voices |
| Channels and people | Channel connections, contacts, tenant users, agent teams, pending messages |
| Automation | Workflows and their runs, webhooks |
| Execution controls | CLI credentials, packages, shell deny groups |
| Observability | Traces, runs, costs, usage, activity |
| Files | Storage, media and signed file links |
| Administration | API keys, tenants, system configuration, backups and restores |

A few operations, such as schedule management and patching sessions, exist only as WebSocket methods. The [CLI](/docs/runtime/cli) wraps both surfaces, which is often the quickest way to script them.
