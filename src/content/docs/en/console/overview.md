---
title: Console tour and overview
description: Sign in to the dewee console, switch between workspaces, learn the navigation groups, read the runtime status and see where each console area is documented.
section: console
order: 1
screens: [sign-in, overview]
updated: 2026-09-25
---

The console is where you run a dewee workspace day to day. Agents, channels, knowledge, monitoring and administration sit in one place, and every area checks your role before it shows or changes anything. This page covers signing in, the layout, what changes with your deployment mode, and where each area is explained.

## Sign in

Choose **Continue with GitHub**, **Continue with Google**, or enter your work email to receive a sign-in link. There are no passwords. An email link is valid for 15 minutes and works once; if it has expired, request a new one from the sign-in page.

::shot{id="sign-in"}

Invitations use the same sign-in. Sign in with the email address the invite was sent to, then join the workspace. See [Members, roles and API keys](/docs/console/members-roles-and-api-keys).

## Workspaces and the switcher

Everything in the console belongs to a workspace, and each workspace is bound to its own tenant on the runtime. If you belong to more than one workspace, use the workspace switcher at the top of the navigation to move between them. Your role is set per workspace, so the same person can be an owner in one and a member in another.

The search box in the top bar jumps to any area by name.

## Navigation groups

The left navigation groups areas by purpose:

| Group | Areas |
|---|---|
| Workspace | Overview, Chat, Sessions, Agents, Agent teams, Tasks & approvals |
| Capabilities | Providers & models, Skills, MCP servers, Runtime packages, Built-in tools, Schedules, Workflows, Hooks, Voice (TTS & STT) |
| Connect | Channels, Pairing inbox, Contacts, Pending messages |
| Data | Memory, Knowledge base, Knowledge graph, Storage |
| Monitor | Usage, Activity, Traces, Runtime health |
| Admin | Members, Roles, API keys & docs, Billing, Settings, Backup, Support |

Each area is guarded by a permission key such as `agents.manage` or `observability.read`. The workspace owner holds every permission, the built-in Admin role holds every permission key, and a Member holds only what their custom role grants. The page for each area names its key.

## What depends on the deployment mode

dewee runs as AaaS, Dedicated or On-Premises (see [Deployment options](/docs/get-started/deployment-options)). The console is the same in all three, with these differences:

- **Billing** appears only on AaaS workspaces.
- **System configuration**, **Workstations** and **Import / export** appear only on Dedicated and On-Premises, and only the workspace owner can use them.
- **License binding** is also Dedicated and On-Premises only and owner-only. It is not listed in the navigation; see [Licence activation](/docs/runtime/licence).
- **Backup** is operator-managed on AaaS and self-serve on Dedicated and On-Premises.

## Runtime status

The status indicator at the top of the console shows whether the workspace's runtime is ready, still setting up, or has failed. Areas that talk to the runtime, such as Chat, need it to be ready. If it is not, open **Runtime health** to see which check fails; see [Usage, activity, traces and health](/docs/console/monitoring).

## The Overview page

**Overview** is the first page of a workspace. While setup is incomplete it shows a **Finish setting up your workspace** checklist, starting with the runtime, a model provider and the super-agent, and a **Continue setup** button that takes you to the next step. Once setup is done, it links you into the main areas: building agents, operating them, knowledge, monitoring, connections and administration.

::shot{id="overview"}

> [!NOTE]
> The screenshots in these pages come from a demo workspace, "Acme Support", filled with sample data. Names, numbers and plan labels you see in them are examples, not defaults or prices.

## Where each area is documented

| Console area | Docs page |
|---|---|
| Chat, Sessions | [Chat and sessions](/docs/console/chat-and-sessions) |
| Agents | [Agents](/docs/console/agents) |
| Agent teams, Tasks & approvals | [Agent teams and approvals](/docs/console/agent-teams) |
| Providers & models | [Providers and models](/docs/console/providers-and-models) |
| Skills, templates | [Skills and templates](/docs/console/skills) |
| Built-in tools, MCP servers, Hooks, Runtime packages, Voice | [Built-in tools, MCP servers and hooks](/docs/console/tools-mcp-and-hooks) |
| Schedules, Workflows | [Schedules and workflows](/docs/console/schedules-and-workflows) |
| Channels, Pairing inbox, Contacts, Pending messages | [Channels, pairing and contacts](/docs/console/channels-and-contacts) |
| Memory, Knowledge base, Storage | [Memory, knowledge base and storage](/docs/console/memory-and-knowledge) |
| Usage, Activity, Traces, Runtime health | [Usage, activity, traces and health](/docs/console/monitoring) |
| Members, Roles, API keys & docs | [Members, roles and API keys](/docs/console/members-roles-and-api-keys) |
| Settings, Backup and owner-only admin areas | [Settings and backup](/docs/console/settings-and-backup) |
| Support, Billing | [Support and billing](/docs/console/support-and-billing) |

## Related

- [Quickstart](/docs/get-started/quickstart)
- [How dewee works](/docs/get-started/how-it-works)
- [Multi-tenant isolation](/docs/concepts/multi-tenancy)
- [Secrets, roles and audit](/docs/security/secrets-roles-and-audit)
