---
title: Access grants
description: Choose which agents and people may use, edit or manage each skill, MCP server, package, provider, hook and agent, and see where dewee enforces and logs it.
section: security
order: 3
updated: 2026-10-14
---

Roles decide what a person may do across a workspace. Access grants work one level down: for a single skill, MCP server, package, provider, hook or agent, they say which agents may use it and which people may change it or hand it on. The gateway stores grants in your tenant, checks them when an agent runs, and records every change and every refusal.

Nothing changes for a workspace that grants nothing. Providers and packages stay open to every agent until a workspace admin restricts them, and skills and MCP servers keep the access rules they already had.

## Levels

There are four levels, `use`, `edit`, `manage` and `admin` (**Use**, **Edit**, **Manage** and **Admin** in the console), and each one includes the levels below it. Not every level exists for every resource:

| Resource | Agents can hold | People can hold |
|---|---|---|
| Skill | `use`, `manage` | `use`, `edit`, `manage` |
| MCP server | `use` | `use`, `edit`, `manage` |
| Package | `use` | none: packages are installed for the whole instance |
| Provider | `use` | none |
| Hook | `use`, which means the hook runs for that agent | `edit`, `manage` |
| Agent | none | `use`, `edit`, `manage`, `admin` |

What a level unlocks depends on the resource:

- **Skills.** An agent with `use` sees the skill and may load it. An agent with `manage` may also update or delete it. For people, `use` makes the skill available in their chats, `edit` currently gives the same access as `use`, and `manage` lets them grant and revoke access up to their own level and read the skill's activity.
- **MCP servers.** An agent with `use` may call the server's tools; the per-tool allow and deny lists still apply. For people, `use` keeps its existing meaning, the chat users an agent may call the server for. `edit` currently gives the same access as `use`, and `manage` lets them grant, revoke and read activity, as for skills.
- **Packages and providers.** An agent with `use` may run the package's commands, or run on the provider, after the resource is restricted. While a resource is open, the grant changes nothing.
- **Hooks.** `edit` lets a person change a hook that runs for specific agents. `manage` also lets them change which agents it runs for, switch it on or off, delete it, and manage its grants. Changing a hook, or which agents it runs for, also needs an `edit` share on each agent involved, because a hook sees all of that agent's events and can block its tool calls. Hooks that run for the whole workspace stay with workspace admins.
- **Agents.** These grants are the agent shares described in [Secrets, roles and audit](/docs/security/secrets-roles-and-audit#roles-in-the-runtime). `use` allows chat. `edit` lets the holder change the agent's name, description, model and prompt settings, and regenerate it. `manage` adds raising its cost limits and managing its shares. `admin` adds deleting the agent, except the workspace's default agent. The agent's key, status, workspace, sandbox, tool policy and budget stay with workspace admins. These powers apply through the gateway. In the console, changing or deleting an agent needs a workspace admin whatever the share, so the console does not offer `edit` or `admin` there (see [Where to manage grants](#where-to-manage-grants)).

Workspace owners, admins and agent owners keep exactly the access they had before; grants only add rights for the people who hold them. To use an `edit`, `manage` or `admin` share from a script, a person needs an API key bound to them with write access (operator or above).

## Who can grant

A workspace admin can grant any level the resource allows. A person with `manage` on a resource can grant and revoke too, but never above their own level, and cannot change or remove someone else's grant that is above it. An agent always keeps at least one admin, and its owner counts as one.

Built-in skills, providers shared across the whole instance and global hooks are open to every workspace and cannot be granted or restricted from a workspace.

## Open and restricted

Providers and packages have an access mode, set in the console with the **Restricted access** switch. **Open**, the default, lets every agent of the workspace use them. **Restricted** limits them to agents holding a `use` grant. Only a workspace admin can change the mode.

Restricting a provider can stop agents that run on it, so dewee shows the impact first. It lists the agents that would lose access: those that use the provider as their main provider, as an enabled fallback, or through a ChatGPT OAuth account pool, and have no grant. The dashboard asks for confirmation with that list and then offers to grant all of them `use` in one step. In the CLI, `--dry-run` prints the same list without changing anything. Packages report no affected agents.

Skills keep their own visibility modes, described in [Skills](/docs/concepts/skills#access-and-grants). An MCP server is already unavailable to an agent until it is granted.

## What is enforced at run time

A run is checked as its agent, so an admin chatting with an agent does not lift that agent's grants.

| Resource | When the agent lacks access |
|---|---|
| Skill | The skill is not listed in the prompt, in skill search or as a slash command. Loading it, or reading its files with `read_file`, returns a tool error |
| MCP server | The server's tools return an error when the agent calls them |
| Package (restricted) | Running one of the package's commands through `exec` returns a tool error, also when the command is wrapped in `sh -c`, `env` or `xargs` |
| Provider (restricted) | The run fails with `provider_not_granted` and is never switched to another provider. A fallback model without a grant is skipped. Creating an agent on the provider, or moving an agent onto it, is refused |

Grant and mode changes apply from the agent's next run; a run already in progress keeps its provider until it ends. If the grant store cannot be read, skill and MCP checks refuse. For providers and packages, a workspace that restricts none keeps running as before, while one that restricts some refuses until the store is back.

### What grants do not cover

- **Package libraries.** A package grant blocks the commands a package installs, by name. It does not stop code from importing the package as a library, a renamed copy of a command, or a script inside the package run through an interpreter. Use the [Docker sandbox](/docs/security/overview#isolation) when you need real isolation.
- **Skill files outside `read_file`.** Shell commands, `search_files` and `list_files` can still reach a skill's files.
- **MCP servers from the gateway config file.** They have no grants and stay open to anyone who can call them.
- **Background work.** Memory, embeddings, voice and summaries that use a workspace provider outside an agent run are not checked against provider grants yet.
- **The Lite edition.** Lite has no grant store: the access panel and commands do not work there, providers and packages cannot be restricted, and skills, MCP servers, agents and hooks keep their earlier rules.

## Activity

Each resource has an activity feed with three kinds of events:

- **Grant changes.** Granting, changing a level, revoking and changing the mode, each with who did it. The record is written together with the change.
- **Denials.** Each refusal at run time, folded to at most one entry per agent, resource and action per minute. The gateway also logs it as `security.resource_grant_denied`. An MCP tool call refused during a chat is logged by the gateway but does not appear in the feed.
- **Uses.** Skill runs, hook executions and model calls on a provider from the last 7 days. MCP servers, packages and agents have no use events yet.

Workspace admins and people with `manage` on the resource can read the feed.

## Where to manage grants

- **The gateway's built-in dashboard.** An **Access** panel on skills (a tab of the skill dialog), providers (the provider page), packages (an action on each row of the pip, npm, system and GitHub lists), hooks and agents (a tab on their pages). It lists grants, adds agents or people at the levels the resource allows, changes and revokes grants, shows the activity feed, and holds the open/restricted switch for providers and packages.
- **The CLI.** `dewee skills`, `mcp`, `providers`, `packages`, `agent` and `hooks` each have an `access` group with `list`, `grant`, `set-level`, `revoke` and `activity`; providers and packages add `mode get` and `mode set`. See the [CLI reference](/docs/runtime/cli).
- **The HTTP API.** `/v1/resource-grants/{type}/{id}`, with the same rules as the dashboard.
- **The console.** On app.dewee.sh, skills, MCP servers, providers and packages have an **Access** tab and an activity tab, agents have a **Permissions** tab, and every hook has an **Access** tab. New grants offer only levels the console honours: a person gets **Use** or **Manage** on a skill, MCP server or agent, and **Edit** or **Manage** on a hook, whose agents are listed under **Runs for**. On an agent, **Edit** works like **Use** and **Admin** like **Manage**, so neither is offered; a grant that already holds one is still shown and can be changed. Workspace admins also get the **Restricted access** switch for providers and packages. Restricting a provider opens a confirmation that first lists the agents that would lose access. After you confirm, it offers **Grant them use** for the agents that lost access. Restricting a package asks for confirmation without a preview. GitHub release packages, workspace-wide hooks and built-in or instance-shared hooks show a notice instead of controls, and members the gateway would refuse see grants without controls. See [Agents](/docs/console/agents), [Skills](/docs/console/skills), [Providers and models](/docs/console/providers-and-models) and [Built-in tools, MCP servers and hooks](/docs/console/tools-mcp-and-hooks).

```bash
dewee skills access grant git-helper --agent support-bot --level use
dewee agent access set-level support-bot --user <user-id> --level edit
dewee providers access mode set anthropic restricted --dry-run
dewee providers access mode set anthropic restricted --yes
dewee packages access grant pip:requests --agent support-bot
dewee hooks access activity <hook-id> --type denied
```

`revoke` always needs `--yes` or `--dry-run`. Restricting with `mode set` asks for confirmation in a terminal and needs `--yes` or `--dry-run` anywhere else; opening needs no confirmation.
