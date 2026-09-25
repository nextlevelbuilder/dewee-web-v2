---
title: What is dewee
description: dewee runs AI agents for your business. Each agent gets a model, tools, memory and permissions, and your team manages them all from one console.
section: get-started
order: 1
screens: [overview]
updated: 2026-09-25
---

dewee is a platform for running AI agents inside a company. In dewee, an agent is a language model plus instructions, the tools it may use, a memory, and rules about who can talk to it and what it may touch. dewee hosts those agents, connects them to the chat apps your customers and staff already use, and records every step they take.

## Two parts: the runtime and the console

| Part | What it does |
|---|---|
| **Runtime gateway** | A single Go service that runs the agent loop, calls model providers, executes tools, stores memory in PostgreSQL and serves the HTTP and WebSocket API (port `18790` by default). |
| **Console** | The web app at `app.dewee.sh` where your team manages agents, providers, channels, members and API keys, and reads traces, usage and activity. |

The runtime can live on our shared cloud, on a dedicated runtime on TOSE, or on your own hardware. [Choose a deployment](/docs/get-started/deployment-options) explains the trade-offs.

::shot{id="overview"}

## What an agent can do

- **Hold conversations** in the console chat, through the API, or in a chat channel such as Telegram, Slack, Discord, WhatsApp, Zalo or Lark. See [Channels](/docs/integrations/channels).
- **Use tools**: read and write files in its own workspace, run shell commands behind a deny list and approval rules, search and fetch web pages, drive a browser, and call MCP servers or custom tools you define. See [Tools and permissions](/docs/concepts/tools-and-permissions).
- **Follow skills**: packaged instructions (`SKILL.md` bundles) that an agent loads when a task calls for them. See [Skills](/docs/concepts/skills).
- **Remember**: the current conversation, summaries of past sessions, a knowledge graph of people and things, and a knowledge vault of documents it can search. See [Memory and knowledge](/docs/concepts/memory-and-knowledge).
- **Work with other agents**: delegate a task to a specialist, or join a team that shares a task board. See [Agent teams](/docs/concepts/agent-teams).
- **Act on its own schedule**: cron jobs, periodic heartbeat check-ins, and versioned workflows with human approval steps. See [Schedules and heartbeat](/docs/concepts/schedules-and-heartbeat) and [Workflows](/docs/concepts/workflows).

## What your team gets

- **Isolation.** Agents, sessions, memory, providers, skills and MCP servers belong to one tenant, and every query is scoped to it. See [Multi-tenancy](/docs/concepts/multi-tenancy).
- **Control.** Roles and permissions for people, scoped API keys for programs, pairing approval before an agent answers a new sender, and approval for risky shell commands. See [Security model](/docs/security/overview).
- **Visibility.** Every agent run leaves a trace with its model calls, tool calls, tokens and estimated cost, and the activity log records who changed what. See [Tracing](/docs/concepts/tracing).
- **Your choice of models.** 31 provider types, from Anthropic, OpenAI and Gemini to OpenRouter, local Ollama and any OpenAI-compatible endpoint, with fallback when a provider fails. See [LLM providers](/docs/integrations/llm-providers).

## What dewee is not

- **Not a model vendor.** dewee does not train or host models. You connect provider accounts, and dewee calls them on your behalf.
- **Not a replacement for your chat apps.** Agents answer inside the apps people already use; the console is for the team that runs them.
- **Not a no-rules sandbox.** Agents can only reach what their tools, policies and grants allow, and new senders on a channel wait for approval by default.

## Where to go next

1. [How dewee works](/docs/get-started/how-it-works): the path of one message through the system.
2. [Choose a deployment](/docs/get-started/deployment-options): Self-install, AaaS, Dedicated on TOSE or On-Premises.
3. [Quickstart](/docs/get-started/quickstart): from sign-in to your first agent reply.

Prefer a product overview first? The [features page](/features) and the [security page](/security) summarise the same ground for a wider audience.
