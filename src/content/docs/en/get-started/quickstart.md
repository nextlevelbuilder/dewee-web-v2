---
title: Quickstart
description: Go from sign-in to your first agent reply in the console, or start a runtime on your own machine and talk to it from the terminal. Both paths, step by step.
section: get-started
order: 4
screens: [sign-in, providers, chat]
updated: 2026-09-25
---

There are two ways to start. Most teams use **the console path**: sign in, connect a model provider, and chat with the agent dewee creates for you. Operators who want to try the runtime on their own machine can take **the self-hosted path** further down. Both end with an agent answering a message.

## Before you start

- A work email, or a GitHub or Google account, to sign in.
- An account with at least one model provider, for example an API key from Anthropic, OpenAI, Google Gemini or OpenRouter. dewee does not include model credits; it calls the provider you connect.
- For the self-hosted path: Docker, or Go and PostgreSQL 18 with pgvector.

## The console path

### 1. Sign in

Open `app.dewee.sh` and choose **Continue with GitHub**, **Continue with Google**, or enter your email to receive a one-time sign-in link. There are no passwords to manage.

::shot{id="sign-in"}

### 2. Wait for the runtime

A new workspace first gets its runtime. On SaaS this happens automatically. On Dedicated and On-Premises, the runtime connects once its licence key is bound (see [Licence activation](/docs/runtime/licence)). The status pill at the top of the console shows when the runtime is online.

### 3. Connect a model provider

Go to **Providers & models**, pick your provider from the catalogue, paste the API key and save. The console verifies the key against the provider before you continue. Keys are stored encrypted, and the console never shows them again.

::shot{id="providers"}

> [!NOTE]
> Only the workspace owner, an admin, or a member whose role grants `provider.manage` can add providers. See [Members, roles and API keys](/docs/console/members-roles-and-api-keys).

### 4. Meet your super-agent

As soon as a provider is verified, dewee creates your first agent, `super-agent`, and gives it what it needs to manage the workspace on your behalf. You do not have to configure anything for this step.

### 5. Send the first message

Open **Chat**, pick `super-agent`, and ask it something, for example "What can you do in this workspace?". The first successful reply marks the workspace as ready.

::shot{id="chat"}

### What to do next

- Create more agents with their own instructions and tools: [Agents](/docs/console/agents).
- Put an agent on Telegram, Slack, Zalo or another chat app: [Channels, pairing and contacts](/docs/console/channels-and-contacts).
- Invite your team and set roles: [Members, roles and API keys](/docs/console/members-roles-and-api-keys).

## The self-hosted path

Use this path to run the runtime gateway on your own machine. It is the same runtime that powers every deployment.

### With Docker

```bash
./prepare-env.sh
make up
curl http://localhost:18790/health
```

`prepare-env.sh` creates `.env` and generates the gateway token and the encryption key if they are missing. `make up` pulls the published image, starts PostgreSQL with pgvector, and upgrades the database schema. A healthy gateway answers `{"status":"ok","protocol":3}`. Open `http://localhost:18790` for the dashboard.

### From source

```bash
make build
./dewee onboard
source .env.local && ./dewee
```

`dewee onboard` asks for the PostgreSQL connection string, tests it, generates the gateway token and encryption key, runs the migrations and writes those secrets to `.env.local`. Running `dewee` with no subcommand starts the gateway. `make build` produces an API-only binary; `make build-full` also embeds the web dashboard.

### Configure and chat from the terminal

With the gateway running, the setup wizard walks you through a provider, a model, an agent and, optionally, a channel:

```bash
./dewee setup
./dewee agent chat --name <agent-key> --message "Hello"
```

Leave out `--message` to start an interactive chat. The full command list is in the [CLI reference](/docs/runtime/cli), and production settings are covered in [Install and run the gateway](/docs/runtime/install-and-run).

> [!WARNING]
> The gateway binds to `0.0.0.0` by default and refuses to start on a non-loopback address without a gateway token. Stored secrets are only encrypted when `GOCLAW_ENCRYPTION_KEY` is set. Both scripts above generate the two values for you; keep them safe and keep them together if you move the setup.

## If something goes wrong

- **The console says the runtime is offline.** Open [Runtime health](/docs/console/monitoring) to see which check fails.
- **Provider verification fails.** Check that the key is active and has credit with the provider, then try again.
- **`curl /health` does not answer.** Run `./dewee doctor` to print the config path, database status and version.
