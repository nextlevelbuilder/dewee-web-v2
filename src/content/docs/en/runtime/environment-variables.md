---
title: Environment variables
description: Every environment variable the dewee installer, gateway and control panel read, with defaults, what each one does, what it needs and which ones are secrets.
section: runtime
order: 4
updated: 2026-11-25
---

This page lists the environment variables dewee reads, grouped by the part that reads them. For the steps to install and run, start with [Install and run the gateway](/docs/runtime/install-and-run) or [Self-install](/docs/get-started/self-install).

## How to read this page

- **Two prefixes.** The runtime gateway keeps its original `GOCLAW_` prefix for most settings. Newer settings, the installer and the control panel use `DEWEE_`. Use the names exactly as shown.
- **Environment beats the config file.** The gateway reads `config.json` first and then lets the environment override it. The exceptions are `GOCLAW_PROVIDER` and `GOCLAW_MODEL`, which only apply when the config file leaves them empty.
- **Restart after every change.** Every variable is read when the process starts. Edit `dewee.env` (binary install) or your `.env` / Compose file (Docker), then restart dewee.
- **Defaults.** "unset" means there is no value and the feature that needs it stays off. "off" means a switch that is disabled unless you turn it on.
- **Secrets.** Rows marked **secret** hold credentials. Keep them out of Git, chat and logs, and back up the encryption key with your database backups. This page never shows example values for them.

## Installer options

These are read by `install.sh` while it installs or upgrades dewee. They are not stored for the running service, except where noted.

| Variable | Default | What it does |
|---|---|---|
| `DEWEE_VERSION` | newest on the channel | Version to install, for example `3.60.0` (a leading `v` is fine). `latest` means the newest. |
| `DEWEE_CHANNEL` | `stable` | `stable` or `beta`. |
| `DEWEE_HOME` | `~/.dewee` | Install folder. Must be a dedicated folder, not `/` or your home folder. Same as `--dir`. The `dewee` CLI also uses it to find `dewee.env`. |
| `DEWEE_APP_PORT` | `4321` | Port of the control panel. Any port except `18790`, which the runtime uses. Same as `--port`. |
| `DEWEE_BIND_ADDR` | `127.0.0.1` | Address the control panel listens on. A non-loopback address prints a warning; put a TLS proxy in front. |
| `DEWEE_INSTALL_MODE` | `binary` | `binary` or `docker`. Same as `--docker`. |
| `DEWEE_INSTALL_POSTGRES` | `0` | `1` lets the installer install PostgreSQL 17 with pgvector through Homebrew or apt. |
| `GOCLAW_POSTGRES_DSN`, `DEWEE_APP_POSTGRES_DSN` | generated | Bring your own databases for the runtime and the control panel. Give both. Same as `--postgres-dsn-runtime` and `--postgres-dsn-app`. **Secret** (contains the password). |
| `DEWEE_NO_START` | `0` | `1` installs without starting the service. |
| `DEWEE_NO_OPEN` | `0` | `1` does not open the browser at the end. |
| `DEWEE_YES` | `0` | `1` accepts the defaults without asking. It never installs PostgreSQL unless `DEWEE_INSTALL_POSTGRES=1`, and it is required to downgrade. |
| `DEWEE_CDN_BASE` | `https://cdn.dewee.sh` | Where release bundles and checksums are downloaded from. Must be HTTPS. |
| `DEWEE_READY_TIMEOUT` | `120` (binary), `180` (Docker) | Seconds to wait for dewee to answer before the installer gives up. |

In Docker mode the installer also writes `DEWEE_VERSION`, `DEWEE_APP_PORT` and `DEWEE_BIND_ADDR` to `.env` next to `docker-compose.yml`.

### What the installer writes to `dewee.env`

A binary install keeps its settings in `dewee.env` inside the install folder. Secrets are generated once by `dewee selfhost init-secrets` and are never overwritten by a later install or upgrade. Port, bind address and database settings are only replaced when you pass the matching option again.

| Variable | Value | Notes |
|---|---|---|
| `GOCLAW_GATEWAY_TOKEN` | 32 random bytes | **Secret.** |
| `GOCLAW_ENCRYPTION_KEY` | 32 random bytes | **Secret.** Back it up. |
| `DEWEE_APP_ACCESS_SECRET` | 32 random bytes | **Secret.** Signs setup and recovery links. |
| `DEWEE_PROVISIONING_KEY_ID`, `DEWEE_PROVISIONING_SECRET` | `self-hosted`, 32 random bytes | Key the control panel uses to call the runtime. The secret is **secret**. |
| `DEWEE_APP_POSTGRES_PASSWORD`, `POSTGRES_PASSWORD` | 32 random bytes | **Secret.** Database passwords. |
| `GOCLAW_POSTGRES_DSN`, `DEWEE_APP_POSTGRES_DSN` | generated | **Secret.** |
| `GOCLAW_HOST`, `GOCLAW_PORT` | `127.0.0.1`, `18790` | The runtime only listens locally; the control panel proxies to it. |
| `GOCLAW_TRUSTED_PROXIES` | `127.0.0.1,::1` | The control panel on the same machine. |
| `GOCLAW_DATA_DIR`, `GOCLAW_WORKSPACE`, `GOCLAW_CONFIG`, `GOCLAW_SKILLS_DIR`, `GOCLAW_BUNDLED_SKILLS_DIR`, `GOCLAW_MIGRATIONS_DIR` | folders under the install folder | |
| `DEWEE_APP_EDITION` | `self_hosted` | |
| `DEWEE_DEPLOYMENT_MODE` | `on_prem` | |
| `DEWEE_LICENSE_MODE` | `channels_license` | |
| `DEWEE_LICENSE_GATE` | `channels` | |
| `DEWEE_RGD_MOUNT` | `hidden` | |
| `DEWEE_RUNTIME_URL`, `DEWEE_RUNTIME_HTTP_URL` | `http://127.0.0.1:18790`, `/_runtime` | How the control panel reaches the runtime. |
| `DEWEE_CUSTOMER_BUNDLE_DIR` | release folder | Assets the control panel serves. |
| `DEWEE_SETUP_TOKEN_MODE` | `required` | See [Control panel](#control-panel). |
| `DEWEE_PUBLISHED_BIND_ADDR`, `HOST`, `PORT` | your bind address and port | |
| `DEWEE_INVITE_EMAIL_PROVIDER` | `disabled` | See [Control panel](#control-panel). |

## Runtime core

Read by the gateway (`dewee` with no subcommand).

### Listening and paths

| Variable | Default | What it does |
|---|---|---|
| `GOCLAW_CONFIG` | `config.json` in the working folder | Config file. The `--config` flag wins. |
| `GOCLAW_HOST` | `0.0.0.0` | Bind address. On a non-loopback address the gateway needs a gateway token. |
| `GOCLAW_PORT` | `18790` | Port of the HTTP API and the WebSocket at `/ws`. |
| `GOCLAW_DATA_DIR` | `~/.goclaw/data` | Data folder: the SQLite file, the skills store and similar. |
| `GOCLAW_WORKSPACE` | `~/.goclaw/workspace` | Root of the agents' working files. |
| `GOCLAW_MIGRATIONS_DIR` | `migrations` next to the binary | SQL migrations. |
| `GOCLAW_PUBLIC_URL` | unset | The gateway's public address, for example `https://dewee.example.com`. Used for channel callbacks, webhook URLs, download links, OAuth and credential links. Must be HTTPS unless it is a loopback address. When set, no request can change it. |
| `GOCLAW_SHUTDOWN_GRACE_PERIOD_SEC` | `30` | Seconds to let open requests finish on shutdown. |

### Database, edition and scale

| Variable | Default | What it does |
|---|---|---|
| `GOCLAW_POSTGRES_DSN` | unset | PostgreSQL connection string. Required by the standard build. **Secret.** |
| `GOCLAW_STORAGE_BACKEND` | `postgres` | `postgres` or `sqlite`. SQLite needs a build with SQLite support and runs on one machine only. |
| `GOCLAW_SQLITE_PATH` | `<data dir>/dewee.db` | SQLite file, when the backend is `sqlite`. |
| `GOCLAW_REDIS_DSN` | unset | Redis connection string, only for builds with Redis support. **Secret.** |
| `GOCLAW_EDITION` | `lite` on SQLite, otherwise `standard` | Forces `standard` or `lite`. An unknown value logs a warning and uses `standard`. |
| `GOCLAW_REPLICA_MODE` | `single` | `single` or `multi`. `multi` refuses to start unless the four settings below use PostgreSQL and `GOCLAW_TENANT_TRANSFER_REPLICA_ORIGINS` is set. |
| `GOCLAW_COORDINATION_BACKEND`, `GOCLAW_CACHE_BACKEND`, `GOCLAW_EVENT_FANOUT_BACKEND` | local | Set to `postgres` for `multi`. |
| `GOCLAW_STORAGE_MODE` | `local` | File storage. Only `local` works with `multi` today. |
| `GOCLAW_WS_SCALE_MODE` | local | `sticky` or `event-fanout` for `multi`. |
| `GOCLAW_TENANT_TRANSFER_REPLICA_ORIGINS` | unset | Comma-separated origins of the other replicas. Required for `multi`. |

`GOCLAW_MODE` was removed. Setting it only logs a warning.

### Authentication, encryption and proxies

| Variable | Default | What it does |
|---|---|---|
| `GOCLAW_GATEWAY_TOKEN` | unset | Bearer token clients send to the gateway. Required on a non-loopback address. **Secret.** |
| `GOCLAW_ENCRYPTION_KEY` | unset | Key that encrypts stored secrets with AES-256-GCM: 64 hex characters or base64 of 32 bytes. Without it the gateway only warns and stores secrets unencrypted. Changing it later makes stored secrets unreadable. **Secret.** |
| `GOCLAW_REQUIRE_AUTH` | off | Makes the token mandatory everywhere and requires at least 32 characters. Cannot be combined with `GOCLAW_ALLOW_INSECURE_NO_AUTH`. |
| `GOCLAW_ALLOW_INSECURE_NO_AUTH` | off | Local development only: allows no token on a non-loopback address. |
| `GOCLAW_TRUSTED_PROXIES` | empty | Comma-separated IP addresses, CIDR ranges or hostnames allowed to send `X-Forwarded-Host` and `X-Forwarded-Proto`. An invalid entry stops startup. |
| `GOCLAW_ALLOWED_ORIGINS` | empty | Comma-separated browser origins allowed by CORS. |
| `GOCLAW_OWNER_IDS` | empty | Comma-separated user IDs treated as system owners. |
| `GOCLAW_ALLOW_PRIVATE_PROVIDER_URLS` | off | Allows model provider base URLs on private or loopback addresses, for example a local Ollama. This turns off a protection against server-side request forgery; turn it on only if you need it. |
| `GOCLAW_TSNET_AUTH_KEY` | unset | Tailscale auth key, when the gateway joins a tailnet. **Secret.** `GOCLAW_TSNET_HOSTNAME` and `GOCLAW_TSNET_DIR` set the node name and state folder. |

### Logging

| Variable | Default | What it does |
|---|---|---|
| `GOCLAW_LOG_LEVEL` | `info` | `debug`, `info`, `warn` or `error`. |
| `GOCLAW_LOG_FILE` | `/var/log/dewee/dewee.log` if that folder exists, otherwise standard output only | Log file. Lines are also written to standard output. |
| `GOCLAW_TRACE_VERBOSE` | off | Any value turns on verbose tracing. |
| `GOCLAW_DEBUG` | off | `1` logs details of the Claude CLI provider. |

### Concurrency lanes

How many runs of each kind can work at once. Positive whole numbers only; anything else uses the default.

| Variable | Default |
|---|---|
| `GOCLAW_LANE_MAIN` | `30` |
| `GOCLAW_LANE_SUBAGENT` | `50` |
| `GOCLAW_LANE_TEAM` (older name `GOCLAW_LANE_DELEGATE`) | `100` |
| `GOCLAW_LANE_CRON` | `30` |
| `GOCLAW_LANE_WORKFLOW` | `20` |
| `GOCLAW_LANE_EVENT` | `10` |

### Sandbox, skills and packages

| Variable | Default | What it does |
|---|---|---|
| `GOCLAW_SANDBOX_MODE`, `GOCLAW_SANDBOX_IMAGE`, `GOCLAW_SANDBOX_SCOPE`, `GOCLAW_SANDBOX_WORKSPACE_ACCESS` | from the config file | Sandbox for agent commands. |
| `GOCLAW_SANDBOX_MEMORY_MB` | `512` | Memory limit of a sandbox container. |
| `GOCLAW_SANDBOX_CPUS`, `GOCLAW_SANDBOX_TIMEOUT_SEC` | from the config file | CPU limit and timeout. |
| `GOCLAW_SANDBOX_NETWORK` | off | `true` or `1` gives the sandbox network access. |
| `GOCLAW_SKILLS_DIR` | `<data dir>/skills` | Shared skills folder. |
| `GOCLAW_BUNDLED_SKILLS_DIR` (or `GOCLAW_BUILTIN_SKILLS_DIR`) | `/app/bundled-skills` if found | Skills that ship with dewee. |
| `GOCLAW_DISABLE_PERSONAL_SKILLS` | off | `1` stops loading personal skills from the home folder. |
| `GOCLAW_SKILLS_MAX_UPLOAD_SIZE_MB` | `20` | Largest skill upload. |
| `GOCLAW_PACKAGES_MAX_ASSET_SIZE_MB` | `200` | Largest package downloaded from GitHub. |
| `GOCLAW_PACKAGES_GITHUB_TOKEN` | unset | GitHub token for package installs. **Secret.** |
| `GOCLAW_PACKAGES_GITHUB_ALLOWED_ORGS` | unset | Comma-separated GitHub organisations packages may come from. |
| `GOCLAW_PACKAGES_GITHUB_BIN_DIR`, `GOCLAW_PACKAGES_GITHUB_MANIFEST` | unset | Where installed package binaries and their manifest go. |

### Upgrades, pricing and other runtime settings

| Variable | Default | What it does |
|---|---|---|
| `GOCLAW_AUTO_UPGRADE` | off | Exactly `true` applies database migrations automatically when the schema is behind. |
| `GOCLAW_UPGRADE_TRIGGER_TOKEN` | unset | Token that guards the HTTP upgrade trigger. **Secret.** `GOCLAW_UPGRADE_SCRIPT` and `GOCLAW_UPGRADE_STATUS_PATH` point at the script and its status file. |
| `GOCLAW_PRICING_SYNC_INTERVAL` | `6h` | How often model prices are refreshed. At least `15m`; `0` or `off` turns it off. |
| `GOCLAW_BROWSER_REMOTE_URL` | unset | Address of a remote browser. Setting it turns on the browser tool. |
| `GOCLAW_EXEC_TENANT_HOST_POLICY` | from the config file | Whether workspace agents may run commands on the host. An invalid value stops startup. |
| `GOCLAW_CREDENTIAL_LINK_BASE_URL` | unset | Origin of the secure form where people enter credentials. HTTPS (or loopback HTTP), no path. Without it, credential links are not offered. |
| `GOCLAW_CREDENTIAL_LINK_FRAGMENT` | on | Keeps the link token in the URL fragment. `0`, `false`, `no` or `off` moves it to the query string. |
| `DEWEE_UPDATE_CHANNEL_URL` | `https://cdn.dewee.sh` | Where the gateway checks for new releases. |
| `DEWEE_INTERACTION_NOTICE_RATE_PER_MIN` | `60` | Notices to approvers per workspace per minute. `0` turns them off. |
| `DEWEE_CCP_URL` | unset | Public address of the control panel, used in links inside emails about cases. No link without it. |
| `DEWEE_INTERACTION_LINK_SECRET` | derived from the encryption key | Signs those links. **Secret.** |
| `DEWEE_EMAIL_FROM`, `RESEND_API_KEY` | unset | Sender address and Resend key for runtime emails. Both are needed. The key is **secret**. |

Deploy and backup scripts in the dewee repository read more `GOCLAW_*` variables (for example `GOCLAW_BACKUP_*` and `GOCLAW_RELEASE_*`). Those belong to the scripts, not to the gateway, and are not listed here.

## Model providers, speech and channels

Model provider keys are usually added in the console, where they are stored encrypted. The gateway also reads these at startup. Every key is **secret**.

| Variable | Default base URL |
|---|---|
| `GOCLAW_ANTHROPIC_API_KEY`, `GOCLAW_ANTHROPIC_BASE_URL` | `https://api.anthropic.com/v1` |
| `GOCLAW_OPENAI_API_KEY`, `GOCLAW_OPENAI_BASE_URL` | `https://api.openai.com/v1` |
| `GOCLAW_OPENROUTER_API_KEY` | `https://openrouter.ai/api/v1` |
| `GOCLAW_GEMINI_API_KEY` | `https://generativelanguage.googleapis.com` |
| `GOCLAW_GROQ_API_KEY` | `https://api.groq.com/openai/v1` |
| `GOCLAW_DEEPSEEK_API_KEY` | `https://api.deepseek.com/v1` |
| `GOCLAW_MISTRAL_API_KEY` | `https://api.mistral.ai/v1` |
| `GOCLAW_XAI_API_KEY` | `https://api.x.ai/v1` |
| `GOCLAW_MINIMAX_API_KEY` | `https://api.minimax.io/v1` |
| `GOCLAW_COHERE_API_KEY` | `https://api.cohere.ai/compatibility/v1` |
| `GOCLAW_PERPLEXITY_API_KEY` | `https://api.perplexity.ai` |
| `GOCLAW_DASHSCOPE_API_KEY`, `GOCLAW_BAILIAN_API_KEY` | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1` |
| `GOCLAW_ZAI_API_KEY` | `https://api.z.ai/api/paas/v4` |
| `GOCLAW_ZAI_CODING_API_KEY` | `https://api.z.ai/api/coding/paas/v4` |
| `GOCLAW_OLLAMA_HOST` (no key) | `http://localhost:11434` |
| `GOCLAW_OLLAMA_CLOUD_API_KEY`, `GOCLAW_OLLAMA_CLOUD_API_BASE` | |
| `GOCLAW_VERCEL_AI_GATEWAY_API_KEY`, `GOCLAW_VERCEL_AI_GATEWAY_API_BASE` | |
| `GOCLAW_ATLASCLOUD_API_KEY`, `GOCLAW_ATLASCLOUD_API_BASE` | |
| `GOCLAW_VERTEX_API_KEY` or `GOCLAW_VERTEX_CREDENTIALS_FILE`, with `GOCLAW_VERTEX_PROJECT_ID`, `GOCLAW_VERTEX_REGION`, `GOCLAW_VERTEX_MODEL` | Google Vertex AI. The credentials file is a path to a service-account JSON file; protect the file. |

- `GOCLAW_PROVIDER` and `GOCLAW_MODEL` choose the default provider and model, only when the config file has none.
- `GOCLAW_CLAUDE_CLI_PATH`, `GOCLAW_CLAUDE_CLI_MODEL` and `GOCLAW_CLAUDE_CLI_WORK_DIR` configure the Claude CLI provider.
- Text to speech: `GOCLAW_TTS_OPENAI_API_KEY`, `GOCLAW_TTS_ELEVENLABS_API_KEY`, `GOCLAW_TTS_GEMINI_API_KEY`, `GOCLAW_TTS_MINIMAX_API_KEY` with `GOCLAW_TTS_MINIMAX_GROUP_ID`. All **secret**.
- Channels: `GOCLAW_TELEGRAM_TOKEN`, `GOCLAW_DISCORD_TOKEN`, `GOCLAW_ZALO_TOKEN`, `GOCLAW_SLACK_BOT_TOKEN`, `GOCLAW_SLACK_APP_TOKEN`, `GOCLAW_SLACK_USER_TOKEN`, and for Lark/Feishu `GOCLAW_LARK_APP_ID` with `GOCLAW_LARK_APP_SECRET`, `GOCLAW_LARK_ENCRYPT_KEY`, `GOCLAW_LARK_VERIFICATION_TOKEN`. All except the app ID are **secret**. Channels are normally connected in the console instead.

## Feature flags

Feature flags switch on parts of dewee that are new, experimental or only needed by some installs. All of them are **off** unless noted, and all need a restart.

> Values are not read the same way everywhere. Unless a row says otherwise, use `1` or `true`; a misspelt value is quietly treated as off. The MCP workspace flags are strict: a misspelt value stops the gateway from starting.

### Model routing

| Variable | What it does | Depends on |
|---|---|---|
| `DEWEE_ROUTING_PRESETS_ENABLED` | Routing presets, routes and commands. The switch for the whole routing area. | |
| `DEWEE_ROUTING_ACTIVE_ENABLED` | Lets presets actually route traffic: canaries and model routes take effect. | `DEWEE_ROUTING_PRESETS_ENABLED` |
| `DEWEE_ROUTING_PUBLIC_LIBRARY_ENABLED` | The public preset library. | `DEWEE_ROUTING_PRESETS_ENABLED` |
| `DEWEE_ROUTING_PRESET_SHARING_ENABLED` | Sharing presets. | `DEWEE_ROUTING_PRESETS_ENABLED` |
| `DEWEE_ROUTING_EXPERIMENTS_ENABLED` | Checkpoints and fork experiments. | Its own switch; forks need PostgreSQL. |
| `DEWEE_ROUTING_CACHE_TTLS` | Not a switch. Overrides how long each provider's prompt cache is assumed to live, as `type=duration` pairs separated by commas. Defaults: `anthropic_native=5m`, `chatgpt_oauth=10m`; `0` removes one. Used only when active routing is on. | `DEWEE_ROUTING_ACTIVE_ENABLED` |

See [Providers and routing](/docs/concepts/providers-and-routing) for what these do in practice.

### Memory

| Variable | What it does | Notes |
|---|---|---|
| `DEWEE_ASSOCIATIVE_RECALL_ENABLE` | Allows agents to use associative recall in active mode. Shadow mode is set per agent and does not need this. | Exactly `1`. |
| `DEWEE_ASSOCIATIVE_RECALL_KILL` | Turns active associative recall off for every agent. | Any value except `0` or `false` turns it on. |
| `DEWEE_EPISODIC_SCREEN` | Checks each new memory episode for injected instructions and keeps flagged ones out of recall. Costs one background model call per episode. | Exactly `1`. |

### Proactive agents

Each level needs the one above it. Every value must be exactly `1`.

| Variable | What it does |
|---|---|
| `DEWEE_PROACTIVE_AGENTS_ENABLED` | Shows Proactive in the API, CLI, MCP and console. |
| `DEWEE_PROACTIVE_AGENTS_ENGINE_ENABLED` | Runs the background review worker. |
| `DEWEE_PROACTIVE_AGENTS_PLANNER_ENABLED` | Lets reviews call a model, which spends tokens. Needs the engine. |
| `DEWEE_PROACTIVE_AGENTS_REFLEX_SHADOW` | Records what the fast replanner would do without acting on it. Needs the engine. |
| `DEWEE_PROACTIVE_AGENTS_KILL` | Forces every flag above off. Only `1` works; `true` does not. |

### Public MCP endpoint

The agent MCP endpoint at `/mcp/server`. Read [Webhooks and MCP](/docs/api/webhooks-and-mcp) before you turn it on.

| Variable | Default | What it does |
|---|---|---|
| `GOCLAW_MCP_PUBLIC_ENABLED` | off | Turns the endpoint on. |
| `GOCLAW_MCP_SERVER_TOKEN` | unset | Operator token for the endpoint, bound to the workspace in `GOCLAW_MCP_SERVER_TENANT_ID`. Environment only. **Secret.** |
| `GOCLAW_MCP_PUBLIC_OAUTH_ENABLED` | off | OAuth 2.1 sign-in for the endpoint. Needs `GOCLAW_MCP_PUBLIC_ENABLED`, `GOCLAW_MCP_PUBLIC_OAUTH_ISSUER` and `GOCLAW_MCP_PUBLIC_OAUTH_JWKS_URI` (HTTPS, same origin) and the provisioning key; the gateway refuses to start without them. |
| `GOCLAW_MCP_OAUTH_PUBLIC_URL` | `GOCLAW_PUBLIC_URL` | Public origin used for OAuth callbacks. |
| `GOCLAW_MCP_PUBLIC_MAX_BODY_BYTES` | `1048576` (1 MiB) | Largest request body. |
| `GOCLAW_MCP_PUBLIC_REQUESTS_PER_MINUTE` | `120` | Requests per credential per minute. |
| `GOCLAW_MCP_PUBLIC_MAX_CONCURRENT_TOOL_CALLS` | `4` | Tool calls running at once per credential. |
| `GOCLAW_MCP_PUBLIC_TOOL_CALL_TIMEOUT_SECONDS` | `60` | Time limit of one tool call. |
| `GOCLAW_MCP_PUBLIC_FAILURES_PER_MINUTE` | `60` | Failed sign-ins per credential per minute. |
| `GOCLAW_MCP_PUBLIC_GLOBAL_FAILURES_PER_MINUTE` | `600` | Failed sign-ins per minute in total. |
| `GOCLAW_MCP_PUBLIC_TENANT_REQUESTS_PER_MINUTE` | `600` | Requests per workspace per minute. |
| `GOCLAW_MCP_PUBLIC_TENANT_MAX_CONCURRENT_TOOL_CALLS` | `16` | Tool calls at once per workspace. |
| `GOCLAW_MCP_EVENTS_CLIENT_ENABLED` | off | A workspace can subscribe to events from the MCP servers it uses. |
| `GOCLAW_MCP_EVENTS_SERVER_ENABLED` | off | MCP clients can subscribe to a workspace's events. Needs the workspace endpoint below. |
| `DEWEE_MCP_INSTALL_MANAGE_GRANT_ENABLED` | off | Members with the `integrations.manage` permission can decide requests to install remote MCP servers. Exactly `true`. |

### MCP workspace endpoint

The workspace management endpoint at `/mcp/workspace`. These switches are strict: a misspelt value stops startup.

| Variable | What it does | Depends on |
|---|---|---|
| `GOCLAW_MCP_WORKSPACE_ENABLED` | Turns the endpoint on. | `GOCLAW_MCP_WORKSPACE_RESOURCE_ORIGIN` |
| `GOCLAW_MCP_WORKSPACE_RESOURCE_ORIGIN` | Public origin of the endpoint. Never taken from the request. | |
| `GOCLAW_MCP_WORKSPACE_RESOURCE_ALIAS_ORIGINS` | Other origins that also reach it, comma-separated. | |
| `GOCLAW_MCP_WORKSPACE_TENANTS` | Comma-separated workspace IDs that may use it. Unset means every eligible workspace; an empty list means none. The master workspace is never allowed. | |
| `GOCLAW_MCP_WORKSPACE_READ` | Read-only access. | |
| `GOCLAW_MCP_WORKSPACE_CONFIG_WRITE` | Low-risk configuration changes. | `_TENANTS` or `_DEFAULT_WRITE` |
| `GOCLAW_MCP_WORKSPACE_PRIVILEGED_WRITE` | Running, publishing and access changes. | `_TENANTS` or `_DEFAULT_WRITE` |
| `GOCLAW_MCP_WORKSPACE_DEFAULT_WRITE` | Write access for eligible workspaces when `_TENANTS` is unset. | |
| `GOCLAW_MCP_WORKSPACE_OAUTH` | OAuth sign-in for the endpoint. | `GOCLAW_MCP_PUBLIC_OAUTH_ISSUER`, `_JWKS_URI`, PostgreSQL |
| `GOCLAW_MCP_WORKSPACE_DIRECT_EXECUTION` | `off`, `shadow` or `on`. | |
| `GOCLAW_MCP_WORKSPACE_PLATFORM_OPERATOR` | Operator-only actions on the master workspace, approved by a second operator. | |
| `GOCLAW_MCP_WORKSPACE_PLATFORM_WRITE` | Install-wide changes through the master workspace. | `_PLATFORM_OPERATOR` |
| `GOCLAW_MCP_WORKSPACE_PLATFORM_OWNER_CONFIRMATION` | Lets the owner confirm their own operator request. | `_PLATFORM_OPERATOR` |

### Identity

| Variable | What it does | Depends on |
|---|---|---|
| `GOCLAW_IDENTITY_ENABLED` | Resolves who a channel user really is (trusted user context). | |
| `GOCLAW_IDENTITY_ENFORCE_ENABLED` | Enforces that identity on tools scoped to a person. | `GOCLAW_IDENTITY_ENABLED` |
| `GOCLAW_IDENTITY_EXCHANGE_ENABLED` | Session exchange, account links and lifecycle routes. An invalid value logs an error and leaves them off. | `GOCLAW_IDENTITY_ENABLED` |
| `GOCLAW_IDENTITY_CONNECT_ENABLED` | Hosted Dewee Connect pages where people prove who they are. | `GOCLAW_IDENTITY_ENABLED`, and `GOCLAW_IDENTITY_CONNECT_BASE_URL` or `GOCLAW_PUBLIC_URL` over HTTPS |
| `GOCLAW_IDENTITY_TEST_MODE_ENABLED` | A simulated test channel. Development builds only; release builds refuse it and log a security event. | `GOCLAW_IDENTITY_ENABLED` |
| `GOCLAW_IDENTITY_PROOF_BUDGET_PER_SENDER`, `_PER_TENANT`, `_WINDOW_SECONDS` | Limits on proof-code attempts. Numbers, not switches; an invalid value stops startup. | |
| `GOCLAW_WEBCHAT_MEMBER_LINK_PROOF_ENABLED` | Lets website chat visitors prove they are a workspace member. | `GOCLAW_IDENTITY_EXCHANGE_ENABLED` |

### Credentials and delegation

These control how agents use stored credentials. Use `true` or `1`.

| Variable | What it does |
|---|---|
| `GOCLAW_CREDENTIAL_POLICY_READ_ENABLED`, `GOCLAW_CREDENTIAL_POLICY_WRITE_ENABLED` | Read and change the policy for running command-line tools with credentials. |
| `GOCLAW_CREDENTIAL_FALLBACK_READ_ENABLED`, `GOCLAW_CREDENTIAL_FALLBACK_WRITE_ENABLED` | Read and change fallback credential grants. |
| `GOCLAW_CREDENTIAL_FALLBACK_EFFECT_ENABLED` | Makes fallback grants apply to commands and remote MCP calls. |
| `GOCLAW_SERVICE_BINDING_WRITE_ENABLED` | Change which service account a credential is bound to. |
| `GOCLAW_SERVICE_CONSENT_ENABLED` | Ask for consent before a service credential is used. |
| `GOCLAW_JOB_GRANT_READ_ENABLED`, `GOCLAW_JOB_GRANT_WRITE_ENABLED` | Read and change delegation grants for background jobs. |

### Website chat, work requests and Vault

| Variable | What it does |
|---|---|
| `GOCLAW_WEBCHAT_CREDENTIAL_REQUESTS_ENABLED` | A website chat agent can ask a signed-in visitor for a credential. |
| `GOCLAW_WORK_REQUESTS_ENABLED` | The staff work request API and its website chat feature. |
| `GOCLAW_VAULT_OPT_IN_INGESTION` | Agents can opt out of adding files to the Knowledge Vault automatically. |
| `GOCLAW_VAULT_OCR` | Reads text from scanned PDFs and images. |
| `GOCLAW_VAULT_EVIDENCE_HANDLES` | Adds passage citations to Vault search results. |

### Skill slash commands

These are **on** by default, and a value saved in the console's system settings overrides the environment.

| Variable | Default | What it does |
|---|---|---|
| `GOCLAW_SKILLS_SLASH_COMMANDS_ENABLED` | on | Lets people start a skill with a slash command. |
| `GOCLAW_SKILLS_SLASH_COMMANDS_SUGGEST_NOT_FOUND` | on | Suggests close matches for an unknown command. |
| `GOCLAW_SKILLS_SLASH_COMMANDS_PARTIAL_MATCHING` | off | Accepts the start of a command name. |
| `GOCLAW_SKILLS_SLASH_COMMANDS_PREFIX` | `/` | The command prefix. |

### Telemetry, metrics and platform

| Variable | Default | What it does |
|---|---|---|
| `GOCLAW_TELEMETRY_ENABLED` | off | Exports traces over OpenTelemetry (OTLP). Exactly `true` or `1`. |
| `GOCLAW_TELEMETRY_ENDPOINT`, `GOCLAW_TELEMETRY_PROTOCOL`, `GOCLAW_TELEMETRY_SERVICE_NAME` | unset | Where and how traces are sent. |
| `GOCLAW_TELEMETRY_INSECURE` | off | Sends traces without TLS. |
| `DEWEE_METRICS_REPORTING` | off | Sends usage reports. Also needs `DEWEE_METRICS_REPORT_URL` (HTTPS) and `DEWEE_METRICS_REPORT_TOKEN` (**secret**); if anything is wrong it stays off. |
| `DEWEE_METRICS_SHARING_WRITE` | off | Lets workspace owners change how much they share. Exactly `true`. |
| `DEWEE_METRICS_SHARING_CEILING` | no limit | Highest sharing level any workspace can choose. An invalid value falls back to local only. |
| `DEWEE_DEPLOYMENT_KIND` | unknown | Label in reports: `shared_saas`, `cloud_dedicated`, `on_prem` or `self_install`. |
| `DEWEE_PLATFORM_ACTIVITY_ROLLUP` | off | Product activity summary. Exactly `true`; needs PostgreSQL. |
| `DEWEE_PLATFORM_SUPPORT_ACCESS` | off | Support access grants. Exactly `true`. |
| `DEWEE_FLEET_CONTROLLER_ENABLED` | off | Fleet controller for package jobs. |

### Coming: feature flags in Settings

A change in review will let you turn these flags on and off in Settings and with the `dewee` CLI, without editing the environment. This page will describe it once it is released.

## Licence

| Variable | Default | What it does |
|---|---|---|
| `DEWEE_LICENSE_GATE` | `off` | `off`, `admission` or `channels`. A misspelt value stops startup. Self-install sets `channels`. Not the same as `DEWEE_LICENSE_MODE`. |
| `DEWEE_LICENSE_REQUIRED` | off | Requires a licence before workspaces are admitted. |
| `DEWEE_LICENSE_SERVER` | `https://app.dewee.sh` with `channels` | Licence authority. |
| `DEWEE_LICENSE_STATE_FILE` | `<data dir>/license/state.json` with `channels` | Where licence state is kept. |
| `DEWEE_LICENSE_KEY_FILE`, `DEWEE_LICENSE_KEY_FD` | unset | Read the licence key from a file or a file descriptor, for installs without a console. The key is **secret**. |
| `DEWEE_LICENSE_WORKSPACE_ID` | unset | Workspace for a single-workspace licence. |

See [Licence](/docs/runtime/licence).

## Control panel

Read by the self-hosted control panel (the dashboard on port `4321`).

| Variable | Default | What it does |
|---|---|---|
| `HOST`, `PORT` | `0.0.0.0`, `4321` | Where the control panel listens. The installer sets them from `DEWEE_BIND_ADDR` and `DEWEE_APP_PORT`. |
| `DEWEE_APP_EDITION` | `self_hosted` | `self_hosted` or `hosted`. |
| `DEWEE_DEPLOYMENT_MODE` | `on_prem` when self-hosted | `shared_saas`, `dedicated_tose` or `on_prem`. |
| `DEWEE_LICENSE_MODE` | `annual_license_required` outside SaaS | `subscription_entitlement`, `annual_license_required`, `operator_managed` or `channels_license`. |
| `DEWEE_APP_PUBLIC_URL` | unset | Public address of the control panel. Needed for invite emails. |
| `DEWEE_RUNTIME_URL`, `DEWEE_RUNTIME_HTTP_URL` | set by the installer | How the control panel reaches the runtime. |
| `DEWEE_APP_POSTGRES_DSN` | generated | The control panel's database. **Secret.** |
| `DEWEE_APP_ACCESS_SECRET` | generated | Signs setup and recovery links; base64 of at least 32 bytes. **Secret.** |
| `DEWEE_PROVISIONING_KEY_ID`, `DEWEE_PROVISIONING_SECRET` | generated | Key the control panel uses to call the runtime. `DEWEE_PROVISIONING_KEYS` (a comma-separated `id=secret` list) replaces the pair for key rotation. **Secret.** |
| `DEWEE_SETUP_TOKEN_MODE` | `required` | The first-run setup page asks for the setup token. `loopback` skips the token only when both the control panel and the visitor are on the same machine. |
| `DEWEE_TRUSTED_PROXY_CIDRS` | empty | Comma-separated addresses and CIDR ranges of a reverse proxy in front of the control panel. An invalid entry or a `/0` range stops startup. The installer does not write it; add it yourself. Not the same as `GOCLAW_TRUSTED_PROXIES`. |
| `DEWEE_INVITE_EMAIL_PROVIDER` | `disabled` | `disabled` or `resend`. `resend` also needs `RESEND_API_KEY` (**secret**), `DEWEE_INVITE_EMAIL_FROM` and `DEWEE_APP_PUBLIC_URL`. |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | unset | Sign in with GitHub or Google. The secrets are **secret**. |

The hosted service at app.dewee.sh reads more variables (billing, analytics, hosted sign-in). Self-hosted installs do not need them.

## The `dewee` CLI

Read by the `dewee` command when it talks to a gateway. See [CLI](/docs/runtime/cli).

| Variable | Default | What it does |
|---|---|---|
| `DEWEE_SERVER` (older names `GOCLAW_SERVER`, `GOCLAW_GATEWAY_URL`) | config, then `http://127.0.0.1:18790` | Gateway address. |
| `DEWEE_API_KEY` | unset | API key. Order: `--token`, then `DEWEE_API_KEY`, then `GOCLAW_GATEWAY_TOKEN`, then the config file. **Secret.** |
| `DEWEE_TENANT_ID` (older name `GOCLAW_TENANT_ID`) | master workspace | Workspace to act in. |
| `GOCLAW_GATEWAY_USER_ID` | unset | User to act as; `--user-id` wins. |
| `DEWEE_HOME` | `~/.dewee` | Install folder, used to find `dewee.env`. |
| `DEWEE_SELFHOST_APP_URL`, `DEWEE_SELFHOST_PUBLIC_URL` | `http://localhost:4321` | Control panel address the CLI calls, and the base of setup links it prints. |
| `DEWEE_MCP_TOKEN` | unset | Token placed in generated MCP client config. **Secret.** |
| `DEWEE_NO_INTERACTIVE` | unset | Any value makes prompts fail instead of waiting, for scripts. |
