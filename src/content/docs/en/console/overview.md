---
title: Console tour and overview
description: Sign in to the dewee console, switch between workspaces, learn the navigation groups, read the runtime status and see where each console area is documented.
section: console
order: 1
screens: [sign-in, overview]
updated: 2026-10-14
---

The console is where you run a dewee workspace day to day. Agents, channels, knowledge, monitoring and administration sit in one place, and every area checks your role before it shows or changes anything. This page covers signing in, the layout, what changes with your deployment mode, and where each area is explained.

## Sign in

On the console that dewee hosts, choose **Continue with GitHub** or **Continue with Google**, or enter your **Work email** and select **Send magic link**. There is no password. A sign-in link works once and expires after 15 minutes; if it has expired, request a new one from the sign-in page.

::shot{id="sign-in"}

A console you install yourself signs you in with **Email** and **Password**. GitHub, Google and email links appear there only when the operator has configured them. If you forget your password, the sign-in page shows the command to run on the machine where dewee is installed.

Invitations use the same sign-in. Sign in with the email address the invite was sent to, then join the workspace. See [Members, roles and API keys](/docs/console/members-roles-and-api-keys).

## Workspaces and the switcher

Everything in the console belongs to a workspace, and each workspace is bound to its own tenant on the runtime. If you belong to more than one workspace, use the workspace switcher at the top of the navigation to move between them. Your role is set per workspace, so the same person can be an owner in one and a member in another.

The **Search or jump to…** box in the top bar, or ⌘K / Ctrl+K, jumps to any area by name.

## Navigation groups

The left navigation groups areas by purpose:

| Group | Areas |
|---|---|
| Workspace | Overview, Chat, Sessions, Agents, Agent teams, Tasks & approvals |
| Capabilities | Providers & models, Skills, MCP servers, Runtime packages, Built-in tools, Schedules, Workflows, Hooks, Voice (TTS & STT) |
| Connect | Channels, Event triggers, Pairing inbox, Contacts, Pending messages |
| Data | Memory, Knowledge base, Knowledge graph, Storage |
| Monitor | Usage, Activity, Traces, Runtime health |
| Admin | Roles, Members, API keys & docs, Billing, Settings, Backup, Support, System configuration, Import / export, Workstations |

You only see the areas your role and deployment mode allow. Each area is guarded by a permission key such as `agents.manage` or `observability.read`. The workspace owner holds every permission, the built-in Admin role holds every permission key, and a Member holds only what their custom role grants. The page for each area names its key.

## What depends on the deployment mode

dewee runs as Self-install, AaaS, Dedicated or On-Premises (see [Deployment options](/docs/get-started/deployment-options)). With Self-install, you open the console on your own machine at `http://localhost:4321`. The console is the same in every mode, with these differences:

- **Billing** appears only on the console that dewee hosts. A console you install yourself does not show it.
- **System configuration**, **Import / export** and **Workstations** appear only on Dedicated and On-Premises, and only the workspace owner can use them.
- **License binding** is also Dedicated and On-Premises only and owner-only. It is not listed in the navigation; see [Licence activation](/docs/runtime/licence).
- **Backup** is operator-managed on AaaS and self-serve on Dedicated and On-Premises.
- **Channels** on Self-install need a licence key, which the owner activates in the console; see [Install dewee yourself](/docs/get-started/self-install).

## Runtime status

The chip at the top of the console shows **Runtime ready**, **Runtime setting up** or **Runtime failed**. Select it to see the status, the mode, a **Support reference** for the workspace and the package policy, and a **Runtime health** button. Areas that talk to the runtime, such as Chat, need it to be ready. See [Usage, activity, traces and health](/docs/console/monitoring).

## The Overview page

**Overview** is the first page of a workspace. Until setup is done, it shows **Set up your workspace** and the rest of the navigation stays closed.

- While the runtime is being provisioned, a stepper shows three steps: **Runtime**, **Provider** and **Super Agent**. Use **Refresh status** to check again. If provisioning fails, use **Retry setup** or **Open support**.
- Once the runtime is up, a **Setup assistant** asks a few questions and does the rest. Select **Set up manually instead** to use the stepper's forms: **Connect provider**, then **Create Super Agent**.
- A member who cannot change setup sees **Your workspace owner is finishing setup** until the owner or an admin is done.

After setup, Overview becomes a dashboard of how the workspace is running: requests, tokens, cost, latency and errors for the chosen date range, with **Compare** against the previous period and **Export summary**. Below that are **Leaderboards** for top agents and channels, and panels for **Pending approvals**, **Recent failed traces** and **Runtime health**. Days are UTC calendar days, as on the Usage page.

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
| Memory, Knowledge base, Knowledge graph, Storage | [Memory, knowledge base and storage](/docs/console/memory-and-knowledge) |
| Usage, Activity, Traces, Runtime health | [Usage, activity, traces and health](/docs/console/monitoring) |
| Members, Roles, API keys & docs | [Members, roles and API keys](/docs/console/members-roles-and-api-keys) |
| Settings, Backup and owner-only admin areas | [Settings and backup](/docs/console/settings-and-backup) |
| Support, Billing | [Support and billing](/docs/console/support-and-billing) |

## Related

- [Quickstart](/docs/get-started/quickstart)
- [How dewee works](/docs/get-started/how-it-works)
- [Multi-tenant isolation](/docs/concepts/multi-tenancy)
- [Secrets, roles and audit](/docs/security/secrets-roles-and-audit)
