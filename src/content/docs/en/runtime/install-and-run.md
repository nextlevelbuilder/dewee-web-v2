---
title: Install and run the gateway
description: Run the dewee runtime with Docker or from source, set the environment it needs, choose an edition, and keep it healthy with upgrades, backups and restores.
section: runtime
order: 1
updated: 2026-11-08
---

The runtime is the part of dewee that does the work: agents, tools, channels, schedules and workflows all run inside one gateway process. Every deployment runs the same gateway, whether we host it or you do. This page is for the operator who installs it, points it at a database and keeps it running.

## What you run

- **The gateway**, a single Go binary called `dewee`. Running `dewee` with no subcommand starts it. By default it listens on port `18790` and serves the HTTP API and the WebSocket at `/ws`.
- **PostgreSQL 18 with pgvector.** The standard build refuses to start without `GOCLAW_POSTGRES_DSN`. The first migration enables the `pgcrypto` and `vector` extensions.
- **Two secrets you generate once**: the gateway token, which clients send as a bearer token, and the encryption key for stored secrets.

The environment variables keep the runtime's original `GOCLAW_` prefix. That is expected; use the names exactly as shown here.

## Run with Docker

This is the recommended way to run the gateway.

```bash
./prepare-env.sh
make up
curl http://localhost:18790/health
```

`prepare-env.sh` creates `.env` from `.env.example` with owner-only permissions and generates `GOCLAW_GATEWAY_TOKEN` and `GOCLAW_ENCRYPTION_KEY` if they are missing. It never overwrites values you already set. `make up` pulls the published image, starts it next to a PostgreSQL container with pgvector, and then runs the schema upgrade.

| Command | What it does |
|---|---|
| `make up` | Pulls the latest published image and starts it, then upgrades the schema |
| `make up-build` | Builds the image from your local source instead of pulling it |
| `make down` | Stops the containers and keeps the data volumes |
| `make logs` | Follows the gateway logs |
| `make migrate` | Runs pending database migrations |
| `make reset` | Stops everything and **deletes the data volumes** |

The image is published as `ghcr.io/nextlevelbuilder/dewee`. The `latest` tag includes Python, `latest-base` is the minimal image, `latest-full` adds every runtime and skill dependency, and `latest-otel` adds OpenTelemetry export. Optional extras are switched on with a variable, for example `make up WITH_OTEL=1`: `WITH_BROWSER`, `WITH_OTEL`, `WITH_SANDBOX`, `WITH_TAILSCALE`, `WITH_REDIS` and `WITH_CLAUDE_CLI`.

## Run from source

You need Go 1.26 or later and a reachable PostgreSQL 18 with pgvector.

```bash
make build
./dewee onboard
source .env.local && ./dewee
```

`dewee onboard` asks for the connection string and tests it, generates the gateway token and encryption key, runs the migrations and writes those values to `.env.local`. The `config.json` it saves holds no secrets.

After the gateway starts, `./dewee setup` walks you through a provider, a model, an agent and a channel.

## Configuration

Settings come from a JSON config file and from environment variables, and the environment wins. The file is chosen by `--config`, then `GOCLAW_CONFIG`, then `config.json` in the working directory. Keep secrets in the environment, not in the file.

| Variable | Purpose |
|---|---|
| `GOCLAW_POSTGRES_DSN` | PostgreSQL connection string. Required. |
| `GOCLAW_GATEWAY_TOKEN` | Bearer token clients use to call the gateway. |
| `GOCLAW_ENCRYPTION_KEY` | 32-byte key (hex or base64) that encrypts stored secrets with AES-256-GCM. |
| `GOCLAW_HOST`, `GOCLAW_PORT` | Bind address and port. Defaults: `0.0.0.0` and `18790`. |
| `GOCLAW_DATA_DIR`, `GOCLAW_WORKSPACE` | Where the gateway keeps its data and the agents' working files. |
| `GOCLAW_LOG_LEVEL`, `GOCLAW_LOG_FILE` | `debug`, `info`, `warn` or `error`, and an optional log file. |
| `GOCLAW_EDITION` | `standard` or `lite`. See below. |
| `GOCLAW_REQUIRE_AUTH` | `1` makes the gateway require authentication even on a loopback address. Set it behind a reverse proxy on the same host; see [below](#behind-a-reverse-proxy-on-the-same-host). |

Model provider keys are usually added in the dashboard or the console, where they are stored encrypted. `GOCLAW_ANTHROPIC_API_KEY`, `GOCLAW_OPENAI_API_KEY` and `GOCLAW_OPENROUTER_API_KEY` are also read at startup.

> [!WARNING]
> Without `GOCLAW_ENCRYPTION_KEY` the gateway only logs a warning and stores provider keys and other secrets unencrypted. Set the key before the first start and store it with your backups: without it, encrypted secrets in a backup cannot be restored.

## Network and authentication

The gateway refuses to start on a non-loopback address without a gateway token. Only for local development can you bypass this with `GOCLAW_ALLOW_INSECURE_NO_AUTH=1`. On a loopback address such as `127.0.0.1`, a gateway without a token stays open, which is meant for local development. Put the gateway behind your own TLS terminator or reverse proxy when it is reachable from other machines.

### Behind a reverse proxy on the same host

When a reverse proxy on the same host publishes the gateway, such as Nginx, Caddy or a hosting platform's router, requests reach the gateway from the same machine. Set `GOCLAW_REQUIRE_AUTH=1` so the gateway still asks every caller for a credential:

- The gateway always requires authentication, even when it is bound to `127.0.0.1`.
- It refuses to start unless `GOCLAW_GATEWAY_TOKEN` is set and at least 32 characters long. Tokens made with `openssl rand -hex 32`, `./prepare-env.sh` or `dewee onboard` all qualify. The token must come from the environment or the config file, not only from the database.
- Setting it together with `GOCLAW_ALLOW_INSECURE_NO_AUTH` is rejected at startup.
- Config writes from the dashboard or through `config.apply` and `config.patch` cannot remove or shorten the gateway token.
- Webhooks limited to local callers with `localhost_only` refuse every caller; see [Webhooks behind a reverse proxy](/docs/api/webhooks-and-mcp#webhooks-behind-a-reverse-proxy).
- Browser pairing still works: a pairing request gains access only after an operator authenticated with the gateway token, or an admin API key, approves it.

Any value other than empty, `0`, `false`, `no` or `off` turns it on. Without the variable, local development works as before. `docker-compose.selfhosted.yml` passes `GOCLAW_REQUIRE_AUTH` through to the gateway; set it to `1` when a proxy publishes the runtime.

Set `GOCLAW_PUBLIC_URL` to the gateway's public address (for example `https://dewee.example.com`). The gateway hands this address to outside services, such as channel callback and webhook URLs and download links. When it is set, no request can change it. Without it, the gateway learns the address from requests by the system owner or admins of the master tenant only. Other workspaces never change it.

The gateway reads `X-Forwarded-Host` and `X-Forwarded-Proto` only from the proxies listed in `GOCLAW_TRUSTED_PROXIES`, a comma-separated list of IP addresses, CIDR ranges or hostnames (for example `127.0.0.1,::1` when nginx runs on the same machine, or the proxy container's Docker Compose service name). From any other client those headers are ignored. The self-hosted installer and Compose files already set it for the proxy they ship; elsewhere the list is empty by default. An invalid entry stops the gateway from starting.

Public MCP access to the gateway (`GOCLAW_MCP_PUBLIC_ENABLED`) is off by default. See [Webhooks and MCP](/docs/api/webhooks-and-mcp) before you turn it on; its per-workspace limits, `GOCLAW_MCP_PUBLIC_TENANT_REQUESTS_PER_MINUTE` and `GOCLAW_MCP_PUBLIC_TENANT_MAX_CONCURRENT_TOOL_CALLS`, are explained under [Limits, quota and revocation](/docs/api/webhooks-and-mcp#limits-quota-and-revocation).

## Editions

The default build runs the **Standard** edition with every feature on. The **Lite** edition is meant for small single-machine setups. The gateway picks Lite automatically when it runs on SQLite, which is a separate build option, and you can force either one with `GOCLAW_EDITION`.

| | Standard | Lite |
|---|---|---|
| Agents | No edition limit | 5 |
| Agent teams | No edition limit | 1 team, 5 members |
| Telegram and Discord channels | No edition limit | 1 of each |
| Subagents | No edition limit | 2 at a time, one level deep |
| Workflows, RBAC, knowledge graph | Yes | No |
| Search | Full-text and vector | Full-text only |
| Installing pip, npm or apk packages | Yes | No |

## Health checks

- `/health` answers `{"status":"ok","protocol":3}` while the process is up.
- `/livez` is the liveness probe and `/readyz` the readiness probe. `/readyz` stays not-ready while the gateway waits for [licence activation](/docs/runtime/licence).

Run `./dewee doctor` on the host to print the version, the config path and whether the database is reachable.

## Upgrades

`dewee upgrade` brings the database schema up to date and runs data migrations. It is safe to run more than once, and the Docker image runs it on every start. Check first with `dewee upgrade --status` or `dewee upgrade --dry-run`. The lower-level `dewee migrate` command (`up`, `down`, `version`, `force`, `goto`) exists for recovery work. A binary refuses to start on a database whose schema is newer than it supports, on PostgreSQL and on the Lite (SQLite) edition alike, and the error names both versions. To roll back, run the newer binary's `dewee migrate down` first on PostgreSQL; Lite has no down migrations, so restore the backup taken before the upgrade.

### Signed release metadata

The hosted release catalog verifies signed release metadata against the currently trusted public keys. Unsigned or untrusted releases must not be offered for update, and removing a signing key withdraws catalog entries that can no longer be verified. During key rotation, deploy trust for the new public key before retiring the old one; keep the signing private key in the release secret store and follow the [release signing script](https://github.com/nextlevelbuilder/dewee/blob/dev/scripts/ci/release-manifest-signing.mjs) and deployed operator procedures. A self-install release notice does not grant remote control of the installation. Reviewed plan, apply and rollback controls have separate rollout gates; do not assume they are available until your operator confirms them.

## Backups and restores

Back up the database before upgrading. SQLite upgrades preserve the instant of legacy API-key expiry and previous-secret grace times from non-UTC hosts, repair stale pending-message cleanup, and normalize historical workflow timestamps for reliable filtering and ordering. Session-task cursor comparisons use stored UTC milliseconds. This does not enable the Lite workflow engine or change response shapes. To roll back SQLite after normalization, restore the pre-upgrade database backup with a compatible binary; do not try to reverse the normalization.

```bash
./dewee backup -o dewee-backup.tar.gz
./dewee restore dewee-backup.tar.gz --dry-run
./dewee restore smoke dewee-backup.tar.gz --target-dsn "<scratch-database-dsn>" --verify-secrets
```

`dewee backup` saves the database and the data files in one archive, and `--upload-s3` sends it to S3. `dewee restore` changes nothing until you add `--force`. `restore smoke` restores into a scratch database, refuses to touch the live one, and with `--verify-secrets` checks that your encryption key can still decrypt the stored secrets. For one tenant at a time, use `dewee tenant-backup` and `dewee tenant-restore`. All maintenance commands are listed in the [CLI reference](/docs/runtime/cli).
