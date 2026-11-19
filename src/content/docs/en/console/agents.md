---
title: Agents
description: "Create and manage the agents in a workspace: their model, instructions and context files, skills and tools, who may use them, heartbeat and optimization."
section: console
order: 3
screens: [agents]
updated: 2026-10-14
---

An agent is a configured assistant that runs on the workspace runtime. It has its own model, instructions and context files, and a set of skills and tools it is allowed to use. People reach it through Chat, connected channels, schedules, workflows or the API. The **Agents** page is where you create agents and keep them in shape.

## Who can use it

Opening **Agents** requires `agents.manage`. Without it, the page tells you your role doesn't include agent management. Creating, editing, pausing or deleting an agent also requires the workspace owner or Admin role; anyone else with `agents.manage` sees the page read-only. Built-in agents marked **System** are read-only for everyone.

Changing who may use an agent is open to workspace admins and to people holding **Manage** on it. Anyone else sees the list of people with a view-only notice. See [Members, roles and API keys](/docs/console/members-roles-and-api-keys).

## What an agent holds

| Part | What it is | Where you set it |
|---|---|---|
| Provider and model | The connected provider and the model the agent calls | **New agent** dialog, **Profile** tab |
| Instructions and context files | Allowlisted files such as `SOUL.md` and `IDENTITY.md` that shape the system prompt | **Instructions** tab |
| Skills | Reusable instructions the agent can load | **Skills** tab, or [Skills](/docs/console/skills) |
| Tools | Built-in tools and MCP server tools the agent may call | **MCP** tab, or [Built-in tools, MCP servers and hooks](/docs/console/tools-mcp-and-hooks) |
| Channels | Chat apps whose messages route to this agent | **Channels** tab, or [Channels](/docs/console/channels-and-contacts) |
| Access grants | People allowed to **Use** or **Manage** the agent | **Permissions** tab, or **Grants** in the quick peek |

Private runtime prompts, context file paths and internal IDs are never shown in the console.

## Predefined and open agents

Every agent has a type, chosen when you create it:

- **Predefined**: the agent follows its own instructions, the same for everyone. Use this for a support or operations agent with a fixed role.
- **Open**: the agent can shape its own instructions, so it adapts to each person who uses it.

Your first agent, the super agent, is created during setup. On **Overview** you pick a model from a connected provider, select **Verify health**, then **Create Super Agent**. It is the workspace's own agent for chat and safe workspace tools.

## Find an agent

The list shows each agent with its type, model, status, requests and errors over the last 7 days. Search by name, key, description, provider, model or owner, and filter by:

- **Status**: **Active**, **Paused**, **Setting up** or **Setup failed**.
- **Type**: **Predefined** or **Open**.
- **Provider** and **Owner**.

The list shows 10 agents per page. Select rows to **Pause** or **Delete** several agents at once. **Templates** opens the skill templates on the [Skills](/docs/console/skills) page.

::shot{id="agents"}

Select a row to open the agent's full page. Each row's menu also has:

- **Quick peek**: a side panel with the **Profile**, **Status**, **Grants**, **Context** and **Activity** tabs, plus **Open full page**, **Chat** and a menu with **Edit profile**, **Pause** or **Resume**, and **Delete**.
- **Chat**: open [Chat](/docs/console/chat-and-sessions) with this agent selected.
- **Pause** or **Resume**, and **Delete**.

## Create an agent

1. Select **New agent**.
2. Pick a template card, or select **Start blank**. Templates come from the workspace's skills; if your role can't view skills, only **Start blank** is offered.
3. Fill in the form:
   - **Name**: 2 to 80 characters. Required.
   - **Emoji** and **Description** (up to 600 characters): optional.
   - **Provider** and **Model**: pick a connected provider and one of its models. If none is connected, add one first in [Providers and models](/docs/console/providers-and-models).
   - **Capability planning**: pick up to 4 of **MCP servers**, **Skills**, **Built-in tools** and **Schedules** to note what to set up next. Nothing is granted here; you grant them on the agent's own tabs after it exists.
4. Optionally open **Context and limits** to set the **Agent type**, **Context window** (0 to 2,000,000 tokens), **Task status updates**, **Tool iterations** (0 to 100), **Prompt mode**, **Thinking level** and **Max tokens**. Leave a field empty to keep the runtime or provider default.
5. Optionally open **Advanced configuration** to paste per-agent settings as JSON.
6. Select **Create agent**. The new agent opens in the quick peek on its **Profile** tab.

## Manage an agent

The agent's full page has a header with **Chat** and a **More** menu with **Pause** or **Resume** and **Delete agent**. Changes on a tab are not saved until you save them from the bar that appears. The tabs are:

- **Overview**: identity, requests, error rate, health checks, pending optimization suggestions and recent sessions.
- **Profile**: name, emoji, description, type, status, provider and model.
- **Instructions**: read and edit the allowlisted context files, within a size limit per file.
- **Permissions**: the people who share the agent in the runtime. New grants offer **Use**, to chat with it, and **Manage**, to also give or take away access. An existing **Edit** or **Admin** share is shown and can be changed but is not offered, because editing or deleting an agent here still needs a workspace admin. The runtime records every change; see [Access grants](/docs/security/access-grants).
- **Skills**: grant skills to the agent, each pinned to a version, or revoke them.
- **MCP**: grant MCP servers whose tools the agent can call, or revoke them.
- **Hooks**: add, enable or delete hooks that run on the agent's events.
- **Channels**: the channels the agent answers on. Bind channels on the [Channels](/docs/console/channels-and-contacts) page.
- **Sessions**: conversations the agent has taken part in.
- **Optimization**: suggestions the agent proposed for itself, from its own metrics. **Approve** or **Reject** a pending suggestion, or **Roll back** one that was applied.
- **Heartbeat**: wake the agent on an interval (minimum 300 seconds) between **Active from** and **Active until** in a time zone, and **Run test**.
- **Routing**: shown only for agents that route through a ChatGPT/Codex OAuth account pool.
- **Activities**: recent changes to the agent, with links to its traces and events.
- **Advanced**: per-agent settings in groups: **Model and reasoning**, **Context and tools**, **Behavior**, **Memory and knowledge** and **Capabilities**. Settings the runtime doesn't report are shown but can't be changed. Sandbox, advisor and workspace-path settings are managed by the platform operator.

## Pause or delete

**Pause** stops the agent from answering new chats and channel messages. Its profile, instructions and grants are kept, and **Resume** turns it back on. **Delete** removes the agent and its configuration. Existing chats with it stop working, and channels bound to it stop replying. The workspace's default agent cannot be deleted.

> [!WARNING]
> Deleting an agent cannot be undone. Pause it instead if you may need it again.

## Related

- [The agent loop](/docs/concepts/agent-loop)
- [Tools and permissions](/docs/concepts/tools-and-permissions)
- [Skills](/docs/concepts/skills)
- [Schedules and heartbeat](/docs/concepts/schedules-and-heartbeat)
- [Agent teams and approvals](/docs/console/agent-teams)
