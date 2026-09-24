---
title: Agents
description: "Create and manage the agents in a workspace: their model, instructions and context files, skills and tools, who may use them, heartbeat and evolution."
section: console
order: 3
screens: [agents]
updated: 2026-09-25
---

An agent is a configured assistant that runs on the workspace runtime. It has its own model, instructions and context files, and a set of skills and tools it is allowed to use. People reach it through Chat, connected channels, schedules, workflows or the API. The **Agents** page is where you create agents and keep them in shape.

## Who can use it

Opening **Agents** requires `agents.manage`. Creating, editing, disabling or deleting an agent, and changing who may use it, also requires the workspace owner or Admin role. For anyone else the page is read-only. See [Members, roles and API keys](/docs/console/members-roles-and-api-keys).

## What an agent holds

| Part | What it is | Where you set it |
|---|---|---|
| Provider and model | The connected provider and the model the agent calls | Create wizard, **Profile** |
| Instructions and context files | Allowlisted files such as `AGENTS.md` and `SOUL.md` that shape the system prompt | **Files** tab |
| Skills | Reusable instructions the agent can load | [Skills](/docs/console/skills) |
| Tools | Built-in tools and MCP server tools the agent may call | [Built-in tools, MCP servers and hooks](/docs/console/tools-mcp-and-hooks) |
| Channels | Chat apps whose messages route to this agent | [Channels](/docs/console/channels-and-contacts) |
| Access grants | Members or roles allowed to **View**, **Use** or **Manage** the agent | **Grants** tab |

Private runtime prompts, context file paths and internal IDs are never shown in the console.

## Predefined and open agents

Every agent has a type, chosen when you create it:

- **Predefined**: the context files belong to the agent and are the same for everyone, plus a per-user `USER.md`. Use this for a support or operations agent with a fixed role.
- **Open**: every context file is kept per user, so each person shapes the agent for themselves.

Your first agent, the super-agent, is created during setup. On **Overview** you pick a model from a connected provider, select **Verify health**, then **Create Super Agent**. It is the workspace's own agent for chat and safe workspace tools.

## Find an agent

The list shows each agent with its type, owner, provider, model, access and status. Search by name and filter by **Status** (Active, Inactive, Summoning or Summon Failed) and **Type** (Predefined or Open).

::shot{id="agents"}

## Create an agent

1. Select **New agent**.
2. **Template**: start from a template, or create a blank agent.
3. **Profile**: enter a name (2 to 80 characters), an optional emoji and a summary of up to 600 characters.
4. **Provider & model**: pick a connected provider and one of its models. If none is connected, add one first in [Providers and models](/docs/console/providers-and-models).
5. **Capabilities**: note which skills, MCP servers and built-in tools the agent will need. You grant them on their own pages after the agent exists.
6. **Context**: choose the agent type and, if needed, the context window (0 to 2,000,000 tokens), tool iterations (0 to 100), prompt mode, thinking level, max tokens and task status updates. Leave a field empty to keep the runtime default.
7. **Review** and select **Create agent**.

## Manage an agent

Select **Manage** on a row to open its detail tabs:

- **Profile**, **Status** and **Context**: name, summary, provider, model and limits.
- **Grants**: give a workspace member or a workspace role **View**, **Use** or **Manage** access. Every grant and revoke is written to the audit log.
- **Files**: read and edit the allowlisted context files, with a read-only prompt preview.
- **Heartbeat**: wake the agent on an interval (minimum 300 seconds) within active hours and a time zone, and run a test.
- **Evolution**: review suggestions derived from the agent's own metrics, then approve, reject or roll back.
- **Routing**: shown only for agents that route through a ChatGPT/Codex OAuth account pool.
- **Activity**: links to the agent's traces and events.

Advanced settings, such as model fallback, compaction, context pruning, memory, sandbox and sub-agents, are edited as JSON per agent. Runtime-wide settings are not editable here.

## Disable or delete

**Disable** stops an agent but keeps its profile and grants for later review. **Delete** removes the runtime agent profile. The workspace's default agent cannot be deleted.

> [!WARNING]
> Deleting an agent cannot be undone. Disable it first if you may need it again.

## Related

- [The agent loop](/docs/concepts/agent-loop)
- [Tools and permissions](/docs/concepts/tools-and-permissions)
- [Skills](/docs/concepts/skills)
- [Schedules and heartbeat](/docs/concepts/schedules-and-heartbeat)
- [Agent teams and approvals](/docs/console/agent-teams)
