---
title: CLI reference
description: "The dewee command line: global flags, how it finds the gateway and your key, output formats, and every command group for agents, skills, workflows and more."
section: runtime
order: 2
updated: 2026-11-08
---

The same `dewee` binary that runs the gateway is also its command-line client. Most commands talk to a running gateway over HTTP or WebSocket, locally or remotely, so an operator can script almost everything the console does. A few maintenance commands work on the database directly and are meant for the host.

## Global flags

These flags work with every command, before or after the subcommand.

| Flag | Meaning |
|---|---|
| `--server` | URL of the gateway to talk to |
| `--token` | Bearer token for that gateway: the gateway token or an API key |
| `--tenant` | Tenant ID or slug to act in |
| `--user-id` | User ID recorded for attribution. Default: `system` |
| `--config` | Config file for commands that read it locally |
| `-v`, `--verbose` | Debug logging |

Running `dewee` with no subcommand starts the gateway; there is no separate start command. `dewee version` prints the version and protocol number, and every command describes its own flags in its built-in help.

## Talking to a remote gateway

Pass the server and a key as flags, or set them once in the environment:

```bash
dewee --server https://dewee.example.com --token "<api-key>" agent list

export DEWEE_SERVER=https://dewee.example.com
export DEWEE_API_KEY=<api-key>
dewee agent list --json
```

The CLI resolves each value in this order:

- **Server:** `--server`, then `DEWEE_SERVER`, then `GOCLAW_SERVER` or `GOCLAW_GATEWAY_URL`, then the host and port in the local config. The fallback is `http://127.0.0.1:18790`.
- **Key:** `--token`, then `DEWEE_API_KEY`, then `GOCLAW_GATEWAY_TOKEN`, then the local config.
- **Tenant:** `--tenant`, then `DEWEE_TENANT_ID`, then `GOCLAW_TENANT_ID`. It is sent in the `X-GoClaw-Tenant-Id` header.

> [!NOTE]
> As a safety check, the CLI will not send the `DEWEE_API_KEY` from your environment to a `--server` that differs from `DEWEE_SERVER`. Pass `--token` explicitly when you point at a different gateway on purpose.

Create API keys on the console's **API keys** page, or with `dewee api-keys create`. See [Authentication](/docs/api/authentication) for scopes.

## Output formats

There is no global output flag. Most read commands accept `--json` for machine-readable output. `traces`, `usage`, `fleet` and `cli-credentials` use `-o table` or `-o json` instead, and `workflows`, `memory`, `vault`, `kg` and `files` accept both forms. On `backup`, `tenant-backup` and `skills export`, `-o` is the output file path.

```bash
dewee usage summary --period 7d -o json
dewee mcp list --json
```

## Setup and diagnostics

| Command | What it does |
|---|---|
| `dewee onboard` | First-time setup on the host: database, secrets, migrations, `.env.local` |
| `dewee setup` | Interactive wizard for a provider, model, agent and channel. Needs a running gateway |
| `dewee workspace-setup` | `next` takes the next turn of the console's guided workspace setup; `--replace-key`, optionally with `--step <id>`, asks for a new key for a stored provider. See [The Overview page](/docs/console/overview#the-overview-page) |
| `dewee doctor` | Prints the version, config path and database status |
| `dewee config` | `show` (secrets redacted), `path`, `validate` |
| `dewee auth` | `status` and `logout` for a ChatGPT account connected through the gateway |

## Agents and conversations

| Command | Subcommands |
|---|---|
| `dewee agent` | `list`, `get`, `status`, `add`, `update`, `delete`, `chat`; `files` to read and set an agent's context files; `evolution` for suggested improvements; `access` for the agent's shares |
| `dewee sessions` | `list`, `get`, `history`, `status`, `send`, `rename`, `reset`, `delete` |
| `dewee contacts` | `list`, `get`, `merge`, `unmerge` |
| `dewee pairing` | `list`, `approve`, `revoke` for chat-app senders waiting for access |
| `dewee tasks` | `comments list` and `comments add` on team tasks |

Contact `merge` and `unmerge` accept at most 500 IDs per request, including duplicates. Larger selections return a validation error without partially changing contacts; split them into separate requests and check each result.

`dewee agent chat` opens an interactive chat with the agent named by `--name` (default `default`). Add `--message` for a single question and answer, and `--session` to continue a session.

For `dewee agent chat`, caller context resolves in order: explicit `--user-id`, `GOCLAW_GATEWAY_USER_ID`, legacy `GOCLAW_USER_ID`, then `system`. Empty environment values are unset; an explicitly empty flag, whitespace-only selected value or ASCII control characters are rejected before connecting. Surrounding spaces are trimmed. HTTP commands do not use the legacy fallback. This context is not proof of identity or authorization: credential binding, role, tenant and membership checks still apply.

```bash
dewee agent chat --name support-bot --message "Summarise today's open tickets"
```

## Capabilities

| Command | Subcommands |
|---|---|
| `dewee providers` | `list`, `add`, `update`, `delete`, `verify`; `access` for grants and the open/restricted mode |
| `dewee skills` | `list`, `show`, `upload`, `export`, `promote`, `metrics`, `activity`; plus `access`, `grant`, `revoke`, `deps`, `evolve` and `suggestions` |
| `dewee mcp` | `list`, `get`, `tools`, `test`, `reload`, `connect-config` (`--auth oauth` for a client that signs in with Dewee instead of a key); `access`, `grant`, `revoke`; `oauth` for servers that sign in with OAuth; `authorizations` (`list`, `revoke`) for apps connected to the public MCP endpoint by signing in, see [Webhooks and MCP](/docs/api/webhooks-and-mcp#review-and-revoke-connected-apps) |
| `dewee packages` | `list`, `get`, `runtimes`, `install`, `remove`, `verify`, `logs`; `approvals` to approve or deny install requests; `access` for grants and the open/restricted mode |
| `dewee hooks` | `access` only: which agents a hook runs for and who may change it |
| `dewee channels` | `list`, `add`, `delete` |
| `dewee tts`, `dewee stt` | Voice providers and their `config` |

Every `access` group has `list`, `grant`, `set-level`, `revoke` and `activity`, and on providers and packages also `mode get` and `mode set`. Levels, modes and what they enforce are explained in [Access grants](/docs/security/access-grants).

### Channel group writers

`dewee channels writers groups <instance-id>` lists groups and writer counts in sorted order. `list <instance-id> --group <scope>` lists writers (an empty group is `[]` with `-o json`), and `test <instance-id> --group <scope> --user <id>` reports `allowed` and `reason`. Use `add <instance-id> --group <scope> --user <id>`, optionally with `--display-name`, `--username` or `--dry-run`. Use `remove <instance-id> --group <scope> --user <id> --yes`, or `--dry-run` to preview; remove never prompts and requires one of those flags.

Every command accepts `-o json`. Group scope is `group:<channel>:<chatId>`, or `guild:<guildId>:*` on Discord. Add and remove require an admin. Exit codes are 2 for validation, 4 for permission denial, 5 for an unknown instance or missing writer, and 6 when removing the last writer.

## Automation

| Command | Subcommands |
|---|---|
| `dewee cron` | `list`, `get`, `create`, `update`, `toggle`, `run`, `runs`, `status`, `delete` |
| `dewee workflows` | `list`, `show`, `create`, `validate`, `apply`, `export`, `publish`, `rollback`, `enable`, `disable`, `trigger`, `delete`, `node-types`; `runs` to list, show, tail, cancel or retry runs |
| `dewee heartbeat` | `get`, `set`, `toggle`, `test`, `logs`, `targets` |
| `dewee reflex` | `status`, `config` (`set`, `set-key`, `reset`), `settings`, `overrides` (`set`, `reset`), `decisions`, `test`, `eval`; see [Decision layer](/docs/concepts/decision-layer) |

Workflows can be kept as files and applied from CI:

```bash
dewee workflows validate -f workflow.json
dewee workflows apply -f workflow.json
```

To protect a draft from concurrent edits, use `--expected-version <updated_at>` as described in [Workflows](/docs/concepts/workflows). Older CLI clients remain supported; the conditional update itself requires a compatible gateway.

For a paged schedule list, use `dewee cron list --limit 20 --json`; pass the returned `nextCursor` with `--cursor` to continue, keeping `--all` if it was used. Without paging flags, JSON output remains a complete array. If an older gateway does not provide page metadata, the CLI reports a compatibility error instead of retrying an unbounded request.

## Memory, knowledge and files

| Command | Subcommands |
|---|---|
| `dewee memory` | `list`, `get`, `search`, `chunks`, `put`, `delete`, `index`, `index-all`. Needs `--agent` |
| `dewee vault` | `list`, `get`, `search`, `tree`, `links`, `graph`, `upload`, `rescan`, `link`, `enrichment` |
| `dewee kg` | Knowledge graph: `entities`, `entity`, `traverse`, `stats`, `extract`, `dedup`, `merge` |
| `dewee files` | `list`, `get`, `upload`, `delete`, `move`, `size` |

## Observability and administration

| Command | Subcommands |
|---|---|
| `dewee traces` | `list`, `get`, `follow`, `timeline`, `export` |
| `dewee usage` | `summary`, `list`, `timeseries`, `events` |
| `dewee activity` | `list` |
| `dewee api-keys` | `list`, `create`, `revoke` |
| `dewee settings`, `dewee system-config` | `list`, `get`, `set` (and `reset` for settings) |
| `dewee import-export` | `preview`, `import` |
| `dewee workstations` | `list`, `create`, `delete` |

## Host maintenance

Platform operators can use `dewee tenant members list|add|remove` with the gateway token and a configured platform owner ID. Other credentials receive `PERMISSION_DENIED` (exit 4). `list` supports `--role`, `--limit` (1–500), `--offset` and `-o json`, returning `{users, total, limit, offset}`. `add` adds or changes a role (default `member`) and supports `--dry-run`. `remove` requires `--yes` or `--dry-run`; an absent member returns `NOT_FOUND` (exit 5). A non-platform tenant must retain an owner: add another before removing or demoting its last owner, otherwise the command returns `CONFLICT` (exit 6). Customer workspaces manage their own invitations and roles in the app; workspace MCP does not expose these operator commands.

### Complimentary access for operators

Where enabled, super admins can issue a grant to an explicit email list with `dewee admin access-grants bulk-issue`. Preview first with `--dry-run`, review each recipient's outcome, then run the same request without `--dry-run` and confirm. Keep the same idempotency key after a timeout or partial failure: already issued recipients are replayed and remaining recipients can be retried. Claim emails are opt-in with `--notify`. The limit is 100 recipients per batch and 10 new bulk commits per operator per hour; a retry under the same key does not consume another batch.

ACP Operations MCP offers `ops_access_grants_issue`, `ops_access_grants_bulk_issue`, `ops_access_grants_revoke` and `ops_access_grants_extend`. These write tools require super-admin `access_grants:admin` and the operator's rollout switches; a read-only connection cannot see or call them. For API or MCP issue calls, preview first and commit with the returned preview digest; REST uses `POST /api/access-grants/bulk`. These are ACP operations, separate from the workspace and website content MCPs. Run `dewee admin access-grants bulk-issue --help` and consult the [operator runbook](https://github.com/nextlevelbuilder/dewee/blob/dev/docs/runbooks/complimentary-access-grants.md) for the current flags and recovery steps.

Most of these commands run on the gateway host and work on the database and data directory directly. `tenant-transfer` is the exception: it goes through the gateway and needs an owner or admin key.

| Command | What it does |
|---|---|
| `dewee upgrade` | Upgrades the schema and data. `--status` and `--dry-run` to check first |
| `dewee migrate` | `up`, `down`, `version`, `force`, `goto` for recovery |
| `dewee backup` | Full backup of the database and files |
| `dewee restore` | Restores a backup. `--dry-run` to preview, `--force` to apply, `smoke` to test in a scratch database |
| `dewee tenant-backup`, `dewee tenant-restore` | The same for a single tenant |
| `dewee tenant-transfer` | Previews, copies or moves resources between tenants. In beta; PostgreSQL only |

How to use them safely is covered in [Install and run the gateway](/docs/runtime/install-and-run#backups-and-restores).
