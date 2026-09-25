---
title: Glossary
description: Short definitions of the terms used across the dewee docs and console, from agent and tenant to pairing, skills, traces and editions, with links to more.
section: get-started
order: 5
updated: 2026-09-25
---

The words below appear throughout the console and these docs. Where a term has its own page, the entry links to it.

## People, places and boundaries

| Term | Meaning |
|---|---|
| Console | The web app where your team manages agents and reads what they did. See [Console overview](/docs/console/overview) |
| Runtime, gateway | The service that runs agents, calls models and tools, and serves the API. See [Install and run](/docs/runtime/install-and-run) |
| Workspace | Your team's space in the console. Each workspace is bound to one tenant on one runtime |
| Tenant | The isolation boundary on a runtime. Everything an agent owns belongs to exactly one tenant. See [Multi-tenancy](/docs/concepts/multi-tenancy) |
| Member, role | A person in a workspace and what they are allowed to do. See [Members, roles and API keys](/docs/console/members-roles-and-api-keys) |
| Edition | Standard runs on PostgreSQL with the full feature set; Lite runs on SQLite with lower limits. See [Install and run](/docs/runtime/install-and-run) |
| Licence | What activates an On-Premises runtime and keeps it in contact with us. See [Licence activation](/docs/runtime/licence) |

## Agents and conversations

| Term | Meaning |
|---|---|
| Agent | A model plus instructions, tools, memory and access rules. See [Agents](/docs/console/agents) |
| Agent loop | The cycle of calling the model, running the tools it asks for and feeding back the results. See [The agent loop](/docs/concepts/agent-loop) |
| Session | One conversation with its history, for example a chat with one person in one channel. See [Chat and sessions](/docs/console/chat-and-sessions) |
| Context files | Files such as `AGENTS.md` and `SOUL.md` that describe an agent's rules and persona and are added to its prompt |
| Delegation | An agent handing a task to another agent that is better suited to it |
| Team | Agents that share a task board and work together under a lead. See [Agent teams](/docs/console/agent-teams) |

## Models

| Term | Meaning |
|---|---|
| Provider | A connected model service such as Anthropic, OpenAI or a local Ollama. See [LLM and voice providers](/docs/integrations/llm-providers) |
| Fallback | Another provider and model an agent tries when its first choice fails. See [Providers, fallback and reasoning](/docs/concepts/providers-and-routing) |
| Reasoning, thinking | Extra model effort before answering, set per agent from off to high |
| Embedding | A numeric form of text used for vector search in memory and the knowledge base |

## What agents can use

| Term | Meaning |
|---|---|
| Tool | An action an agent can take, such as reading a file, running a command or fetching a web page. See [Tools and permissions](/docs/concepts/tools-and-permissions) |
| Tool profile, policy | The rules that decide which tools an agent may call |
| Exec approval | A hold on shell commands until a person approves them |
| Skill | A packaged set of instructions, a `SKILL.md` bundle, that an agent loads when a task needs it. See [Skills](/docs/concepts/skills) |
| MCP server | An external tool server that dewee connects to over the Model Context Protocol. See [Tools, MCP and hooks](/docs/console/tools-mcp-and-hooks) |
| Hook | A rule or script that runs at a set point, for example before a tool call, and can block it |
| Memory | What an agent keeps from past conversations. See [Memory and knowledge](/docs/concepts/memory-and-knowledge) |
| Knowledge base, vault | Documents and notes agents can search and cite |
| Knowledge graph | People, things and the links between them, extracted from conversations |

## Channels and access

| Term | Meaning |
|---|---|
| Channel | A connection between an agent and a chat app such as Telegram or Zalo. See [Chat channels](/docs/integrations/channels) |
| DM policy, group policy | Who may talk to the agent in direct messages and in groups: pairing, allowlist, open or disabled |
| Pairing | Approving a new sender with a short code before the agent answers them |
| Mention gating | In groups, the agent answers only when it is mentioned |
| Contact | A person an agent has talked to on any channel. See [Channels, pairing and contacts](/docs/console/channels-and-contacts) |

## Automation and oversight

| Term | Meaning |
|---|---|
| Schedule, cron job | A task an agent runs at set times. See [Schedules and workflows](/docs/console/schedules-and-workflows) |
| Heartbeat | A periodic check-in where an agent works through its `HEARTBEAT.md` checklist and reports only when something needs attention |
| Workflow | A versioned sequence of steps, with agents, tools and human approvals. See [Workflows](/docs/concepts/workflows) |
| Trace, span | The record of one run, and each model call or tool call inside it |
| Usage | Tokens and estimated cost over time |
| Activity | The log of who changed what in the workspace |
| API key | A credential for scripts and integrations, limited by scopes. See [Authentication](/docs/api/authentication) |
| Webhook | An endpoint that lets another system start an agent or send a message. See [Webhooks and MCP](/docs/api/webhooks-and-mcp) |
