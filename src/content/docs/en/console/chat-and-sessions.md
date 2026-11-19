---
title: Chat and sessions
description: Talk to your agents, attach files, follow tool calls as they run, decide on agent requests right in the conversation, and review past sessions.
section: console
order: 2
screens: [chat, sessions]
updated: 2026-10-14
---

**Chat** is the quickest way to work with an agent: you type, the agent answers, and you watch the tools it uses along the way. **Sessions** is the record of every conversation your agents have had, from the console and from connected channels, so you can check what was said and which traces belong to it.

## Who can use it

| Area | Permission key | What it allows |
|---|---|---|
| Chat | `chat.use` | Send messages to agents from the console |
| Sessions | `sessions.read` | List sessions and open session detail |

The workspace owner and the built-in Admin role hold both keys. For a Member, grant them through a custom role; see [Members, roles and API keys](/docs/console/members-roles-and-api-keys). Without `sessions.read`, Chat still works but its sidebar cannot list earlier conversations.

## Chat with an agent

The Chat page has an agent picker and your conversations on the left, the message thread in the middle, and the composer at the bottom. The picker lists the active agents you may chat with, with the super agent first. While an agent works, the thread shows its tool calls with their **Arguments**, **Result** and status (**Queued**, **Running…**, **Done**, **Failed** or **Stopped**), plus the input and output tokens used for each reply. **Run activity** opens a side panel with the run's tool calls and activity.

::shot{id="chat"}

To start a conversation:

1. Open **Chat** and pick an agent. A new workspace starts with the super agent created during setup. You can also open Chat from an agent's **Chat** button on the [Agents](/docs/console/agents) page.
2. Type your message. Press Enter to send, Shift+Enter for a new line.
3. To include a file, use **Attach a file**. In browsers that allow it, you can also **Record voice message**.
4. Watch the reply stream in. Expand a tool call to see its arguments and result. Use **Stop generating** to stop a reply.

To continue an earlier conversation, select it in the list. Use **Load earlier messages** to scroll back further. Select **New conversation** to start a fresh one with the same agent.

### Rename, reset or delete a conversation

Open the actions menu next to a conversation in the Chat sidebar:

- **Rename**: give the conversation a name you will recognise. Leave it empty to clear the name.
- **Reset conversation**: clear every message but keep the conversation.
- **Delete**: remove the conversation and its history for everyone.

> [!WARNING]
> Reset conversation and Delete remove messages permanently. There is no undo.

### Approve requests in a conversation

When an agent asks to run a command or install a package, the request appears in the conversation as a card with **Approve** and **Deny**. The card is the same approval you see on the **Approvals** tab of [Tasks & approvals](/docs/console/agent-teams), so the same permissions apply.

- For a destructive action, type the resource name to confirm before you approve.
- **Deny** asks for a reason; select **Deny request** to send it.

Once a request is decided, or no longer pending, the card shows the result without buttons.

## Browse sessions

**Sessions** lists every conversation in the workspace, from Chat and from connected channels. Cards at the top show the number of sessions, messages and tokens, and how many are **Active now**. Each row shows the **Session**, **Agent**, **Channel**, **Model**, **Messages**, **Tokens in/out**, **Traces** and when it was **Updated**.

::shot{id="sessions"}

- Filter by **Channel** and choose 10, 25 or 50 rows per page.
- Sort by **Last updated**, **Newest created** or **Most messages**.
- Search by session key, agent or model.

Search and sort apply to the page that is loaded, not the whole history.

If the list is empty, nobody has messaged an agent yet; **Open chat** to start. If the runtime is not reachable, the page says so instead of showing stale data.

## Session detail

Select a session to open its detail page. It shows the agent, channel, model, provider, status, session key, message count, tokens in and out, and when it was created and updated. **Metadata** and **Related traces** follow, with **Open traces** to see them in [Traces](/docs/console/monitoring).

The message timeline labels each entry as **User**, **Assistant**, **Tool call** or **System**. Switch the **Message view** between **Plain** and **Rendered**.

The detail view is read-only:

- Tool payloads are size-limited and redacted before they reach your browser.
- Long sessions show "Showing the latest 200 messages."
- A session from another workspace, or one that does not exist, shows "Session not found" without any content.

## When chat is not available

- **Chat isn't ready yet**: finish setting up your workspace. Connect a provider and create your first agent from **Overview**.
- **No agents to chat with**: every agent in the workspace was removed or paused. **Create an agent**, or resume one in [Agents](/docs/console/agents).
- **Runtime is offline**: your agents can't respond while the runtime is unreachable. Select **Check again**, or open **Runtime health**.

> [!NOTE]
> On dewee AaaS, access to the workspace, chat included, also depends on its subscription. See [Support and billing](/docs/console/support-and-billing).

## Related

- [Agents](/docs/console/agents)
- [Usage, activity, traces and health](/docs/console/monitoring)
- [The agent loop](/docs/concepts/agent-loop)
- [Tracing](/docs/concepts/tracing)
- [API overview](/docs/api/overview)
