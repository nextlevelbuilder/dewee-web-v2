---
title: How dewee works
description: "Follow one message through dewee: how it reaches an agent, which checks it passes, how the agent loop answers it, and what the runtime records along the way."
section: get-started
order: 2
updated: 2026-09-25
---

dewee has two parts. The **runtime gateway** does the work: it receives messages, runs agents, calls models and tools, and stores everything. The **console** is where your team configures and watches that work; each workspace in the console is bound to one tenant on one runtime. This page follows a single message from arrival to reply.

## Where messages come from

An agent run always starts with a message. It can come from:

| Source | Example |
|---|---|
| A chat channel | A customer writes to your Telegram bot or Zalo Official Account. See [Chat channels](/docs/integrations/channels) |
| The console | A teammate uses **Chat** to talk to an agent directly |
| The API | Your software calls `POST /v1/chat/completions` or the WebSocket. See [API overview](/docs/api/overview) |
| A webhook | A CRM or form tool calls `POST /v1/webhooks/llm`. See [Webhooks and MCP](/docs/api/webhooks-and-mcp) |
| The agent's own schedule | A cron job, a heartbeat check-in or a workflow step fires |

## 1. The channel checks who is asking

Before any model is involved, the channel applies its access rules. A new sender in a direct message may need a pairing code approved by an admin; in a group, the agent answers only when it is mentioned. The runtime can merge messages that one person sends in quick succession into a single request, and always does so for a burst of attachments. Commands such as `/stop` skip that wait.

## 2. The runtime works out the context

The runtime resolves four things:

- **Tenant**: from the channel instance or the credential, never from what the message claims. See [Multi-tenancy](/docs/concepts/multi-tenancy).
- **Agent**: each channel connection points at one agent; API calls name the agent.
- **User**: the person on the other end, so memory and permissions can follow them.
- **Session**: the conversation this message belongs to, with its history.

## 3. The agent loop answers

The agent loop builds a prompt from the agent's instructions, its context files, relevant skills and memory, then calls the model through the agent's provider. If the model asks for tools, dewee checks each call against the tool policy, runs it, and feeds the result back. The loop repeats until the model gives a final answer or a limit stops it, 30 iterations by default. See [The agent loop](/docs/concepts/agent-loop).

Along the way:

- A failed model call is retried, and can fall back to another provider. See [Providers, fallback and reasoning](/docs/concepts/providers-and-routing).
- Risky shell commands can wait for a human to approve them. See [Tools and permissions](/docs/concepts/tools-and-permissions).
- The agent can hand part of the work to another agent or to its team.

## 4. The reply goes back

The answer returns through the same channel, formatted for that app and split to fit its length limit. Channels that support it show progress while the agent works, with a typing indicator, a status reaction or a message that is edited in place.

## 5. The runtime keeps a record

When the run ends, dewee saves the new messages to the session and closes the run's trace: every model call and tool call, with tokens and estimated cost. Usage totals update, and background workers turn the conversation into long-term memory. Your team sees the result in the console under **Traces** and **Usage**; changes people make to configuration go to **Activity**. See [Memory and knowledge](/docs/concepts/memory-and-knowledge).

## Where things live

| Piece | Where |
|---|---|
| Agents, sessions, memory, traces, settings | The runtime's database: PostgreSQL on the Standard edition, SQLite on Lite |
| Files agents read and write | Each agent's workspace folder on the runtime |
| Provider keys and other secrets | Encrypted in the database with the runtime's encryption key |
| Your team, roles and workspaces | The console |

Where the runtime itself runs depends on the deployment you choose. See [Choose a deployment](/docs/get-started/deployment-options).
