---
title: Chat and sessions
description: Talk to your agents from the console, attach files, follow tool calls as they run, and review past conversations in a read-only, redacted session view.
section: console
order: 2
screens: [chat, sessions]
updated: 2026-09-25
---

**Chat** is the quickest way to work with an agent: you type, the agent answers, and you watch the tools it uses along the way. **Sessions** is the record of every conversation your agents have had, from the console and from connected channels, so you can check what was said and which traces belong to it.

## Who can use it

| Area | Permission key | What it allows |
|---|---|---|
| Chat | `chat.use` | Send messages to agents from the console |
| Sessions | `sessions.read` | List sessions and open session detail |

The workspace owner and the built-in Admin role hold both keys. For a Member, grant them through a custom role; see [Members, roles and API keys](/docs/console/members-roles-and-api-keys). Without `sessions.read`, Chat still works but its sidebar cannot list earlier sessions.

## Chat with an agent

The Chat page has three parts: an agent picker and your sessions on the left, the message thread in the middle, and the composer at the bottom. While an agent works, the thread shows its tool calls with their arguments, results and status (queued, running, done, failed or stopped), plus the input and output tokens used for the reply.

::shot{id="chat"}

To start a conversation:

1. Open **Chat** and pick an agent. A new workspace starts with the super-agent created during setup.
2. Type your message. Press Enter to send, Shift+Enter for a new line.
3. To include files, use **Attach files**. In browsers that allow it, you can also record a voice message.
4. Watch the reply stream in. Expand a tool call to see its arguments and result.

To continue an earlier conversation, select it in the session list. Use **New** to start a fresh one with the same agent.

### Rename, reset or delete a session

Open the actions menu next to a session in the Chat sidebar:

- **Rename**: give the session a name you will recognise. Leave it empty to clear the name.
- **Reset history**: remove the messages but keep the session.
- **Delete**: remove the session and its history.

> [!WARNING]
> Reset history and Delete remove messages permanently. There is no undo.

## Browse sessions

**Sessions** lists every conversation in the workspace with its channel, message count, model, input and output tokens, and last activity. Filter by channel, sort by last updated or by message count, and choose how many rows to show. Each row links to the traces recorded for that session.

::shot{id="sessions"}

If the list is empty, no conversation has happened yet: start a chat and it will appear here. If the runtime is not connected, the page says so instead of showing stale data.

## Session detail

Select a session to open its detail page. It shows the session key, token totals, the timeline of messages and events, tool calls and errors, and the related trace IDs, with a link to open them in **Traces**.

The detail view is read-only and redacted before it reaches your browser:

- Runtime API keys, provider keys (such as `sk-` keys) and bearer tokens are masked.
- Common secret fields in tool arguments, such as `api_key`, `authorization` and `token`, are masked.
- Only the latest 200 messages are shown.
- A session from another workspace, or one that does not exist, returns "Session not found" without any content.

## When chat is not available

- **Agent not ready**: the super-agent has not been created yet. Finish setup from **Overview**.
- **No active agents**: no agent in the workspace is active. Check their status in **Agents**.
- **Runtime is not reachable**: wait a moment and refresh, then check **Runtime health**.

> [!NOTE]
> On AaaS, a refunded subscription turns off chat, API keys and provider setup for the workspace. See [Support and billing](/docs/console/support-and-billing).

## Related

- [Agents](/docs/console/agents)
- [Usage, activity, traces and health](/docs/console/monitoring)
- [The agent loop](/docs/concepts/agent-loop)
- [Tracing](/docs/concepts/tracing)
- [API overview](/docs/api/overview)
