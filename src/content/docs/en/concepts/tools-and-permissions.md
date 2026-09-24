---
title: Tools and permissions
description: How dewee decides which tools an agent can call, how shell commands are filtered and approved, and which permissive defaults to tighten before production use.
section: concepts
order: 4
updated: 2026-09-25
---

Tools are how an agent acts. Before every model call, dewee filters the tool list through a policy pipeline, and each shell command passes further checks when it runs. The defaults are permissive; the last section lists what to tighten.

## Tool groups and profiles

Built-in tools are organised into groups that you can name as `group:<name>` in allow and deny lists.

| Group | Tools |
|---|---|
| `fs` | `read_file`, `write_file`, `list_files`, `search_files`, `edit`, `multi_edit`, `apply_patch`, `diff_preview`, `checkpoint`, `rollback` |
| `runtime` | `exec`, `wait` |
| `web` | `web_search`, `web_fetch` |
| `memory` | `memory_search`, `memory_get` |
| `sessions` | `sessions_list`, `sessions_history`, `sessions_send`, `spawn`, `session_status`, `session_tasks`, `native_job`, `native_task` |
| `ui` | `browser`, `AskUserQuestion` |
| `automation` | `cron` |
| `messaging` | `message`, `human_handoff`, `create_forum_topic`, `list_group_members` |
| `team` | `team_tasks` |
| `vault` | `vault_search`, `vault_read` |
| `dewee` | Every native tool, including media, skill and delegation tools |

A profile is a preset allow set:

| Profile | Allows |
|---|---|
| `full` | Everything. This is the default. |
| `coding` | `fs`, `runtime`, `sessions`, `memory`, `web` and `vault`, plus `read_image`, `create_image` and `skill_search`. |
| `messaging` | `messaging`, `web` and `vault`, `wait`, basic session tools, `read_image` and `skill_search`. |
| `minimal` | `session_status` only. |

## The policy pipeline

The tool list the model sees is built in this order:

1. Start from the global profile (`tools.profile`), then any per-provider profile.
2. Narrow with the global allow list, the per-provider allow list, the agent's allow list and the agent's per-provider allow list.
3. Narrow with the channel's per-request allow list, if it sends one. A Telegram forum topic, for example, can restrict tools per topic.
4. Remove anything in the deny lists, global first, then the agent's.
5. Add back anything in `alsoAllow`, which only ever adds.
6. For sub-agents, remove tools they may not use, such as `exec`, `cron` and memory search. At the maximum spawn depth, `spawn` and the session history tools go too.

MCP servers register as the groups `mcp` and `mcp:<server>`.

## Shell commands

`exec` runs with a default timeout of 60 seconds, adjustable from 1 to 3,600.

### Deny groups

Every command is checked against 16 deny groups, all on by default: `destructive_ops`, `data_exfiltration`, `reverse_shell`, `code_injection`, `privilege_escalation`, `dangerous_paths`, `env_injection`, `container_escape`, `crypto_mining`, `filter_bypass`, `network_recon`, `package_install`, `package_remove`, `persistence`, `process_control` and `env_dump`. Turn a group off globally in `tools.shellDenyGroups`, or per agent in `other_config.shell_deny_groups`, where the agent value wins for each group. Changes apply from the next turn.

A command that matches `package_install` is not rejected outright. It becomes an approval request.

### Exec approval

| Setting | Values | Default |
|---|---|---|
| `tools.execApproval.security` | `deny` (no commands), `allowlist` (only matching commands), `full` (any command that passes the deny groups) | `full` |
| `tools.execApproval.ask` | `off`, `on-miss` (ask when a command is not on the allowlist), `always` | `off` |

Each approval is a durable, tenant-scoped record that holds a redacted summary and a hash of the command, never the raw command or its output. Once it is approved, the agent retries the same command with a single-use `approval_token`. Approvals are reviewed on the web approvals page or from the CLI; buttons in chat channels cannot approve a command.

```bash
dewee packages approvals list --all
dewee packages approvals approve <approval-id>
dewee packages approvals deny <approval-id> --reason "not needed"
```

With `tools.execApproval.scopedPackageGrantsEnabled` (off by default), an always-allow decision creates a 30-minute grant for that package install only, tied to the session, workspace, command and lockfile.

## Custom tools, secrets and CLI credentials

- **Custom tools** are shell commands you define over the API, with JSON Schema parameters filled into `{{.param}}` placeholders, a timeout (60 seconds by default) and optional environment variables. Parameters are shell-escaped and the deny groups still apply. A custom tool is global or belongs to one agent.
- **Secrets** for built-in tools, such as a search API key, live in a tenant-scoped store, encrypted with AES-256-GCM when `GOCLAW_ENCRYPTION_KEY` is set.
- **Scrubbing.** Tool output is scanned for key, token and connection-string patterns, and for the live values of the runtime's own secrets. Matches become `[REDACTED]` before the model or the user sees them.
- **Credentialed CLIs.** Presets for `gh`, `gcloud`, `gws`, `aws`, `kubectl` and `terraform` let an agent run those tools with a stored credential that it never sees. They run without a shell, and variables starting with `GOCLAW_` or `DEWEE_` or ending in `_TOKEN`, `_SECRET`, `_KEY` or `_PASSWORD` are removed first.

## MCP servers

dewee connects to MCP servers over `stdio`, `sse` or `streamable-http`, checks their health every 30 seconds, and reconnects with backoff from 2 to 60 seconds for up to 10 attempts. Access is granted per agent and per user, each grant with its own `tool_allow` and `tool_deny` lists; deny wins. Users can also request access for an admin to approve.

When an agent has more than 40 MCP tools, they are no longer listed one by one. The agent finds them with `mcp_tool_search` instead. OAuth 2.1 with PKCE for remote servers is in beta.

## Sandbox

Commands can run in a Docker container instead of on the host. It is off by default.

| Setting | Values or limit |
|---|---|
| Mode | `off` (default), `non-main` (every agent except the default one), `all` |
| Scope | `session` (default), `agent`, `shared` |
| Container | Read-only root, all capabilities dropped, no network |
| Limits | 512 MB memory, 1 CPU, 256 processes, 1 MB output, 300 seconds |

When the sandbox is on and Docker is not available, `exec` fails instead of falling back to the host.

## Defaults to review

dewee is closed by default at the edge, but agent capabilities start open:

| Setting | Default | Tighter option |
|---|---|---|
| Tool profile | `full` | `coding`, `messaging` or `minimal`, plus deny lists |
| Exec approval | `security: full`, `ask: off` | `allowlist` with `on-miss` |
| Sandbox | `off` | `non-main` or `all` |
| `web_fetch` | `allow_all` (private addresses are always blocked) | `allowlist` with `allowed_domains` |
| Browser tool | On | Off |
| Tool rate limit | 150 calls per hour | A lower `rate_limit_per_hour` |

> [!WARNING]
> With the defaults, an agent can run any command that passes the deny groups, on the host, without asking. Tighten the profile, exec approval or sandbox before untrusted users reach your agents.

## Related

- [Tools, MCP and hooks](/docs/console/tools-mcp-and-hooks): managing tools, MCP servers and hooks in the console.
- [Security model](/docs/security/overview): edge controls and defence layers.
- [Secrets, roles and audit](/docs/security/secrets-roles-and-audit): how secrets are stored and who can change policy.
- [Hooks](/docs/concepts/hooks): blocking or rewriting a tool call before it runs.
- [Webhooks and MCP](/docs/api/webhooks-and-mcp): exposing dewee itself as an MCP server.
