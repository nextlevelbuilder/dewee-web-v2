---
title: Install dewee yourself
description: Install dewee on your machine with one script, as a standalone binary or with Docker, then set it up in the local dashboard and add a licence for channels.
section: get-started
order: 4
updated: 2026-09-25
---

Self-install puts dewee on a computer or server you control, and you do the setup yourself. Installing it and using agents, providers and skills is free. You need a licence only when you want to connect channels. The public [install page](/install) has the same commands in one place.

## Choose a route

There are two ways to install, and both use our install files. We do not support installing from source for Self-install.

| Route | Runs on | Best for |
|---|---|---|
| **Standalone binary** | macOS or Linux, on amd64 or arm64 | A single machine where you want dewee to run directly |
| **Docker** | Any operating system with Docker | Keeping dewee in a container, and every Windows install |

> [!NOTE]
> On Windows, use the Docker route with Docker Desktop. There is no standalone Windows binary.

## Install the standalone binary

On macOS or Linux, run the install script in a terminal:

```bash
curl -fsSL https://dewee.sh/install.sh | bash
```

## Install with Docker

On macOS or Linux, download the Compose file and start dewee:

```bash
curl -fsSL https://dewee.sh/docker-compose.yml -o docker-compose.yml
docker compose up -d
```

On Windows, open PowerShell with Docker Desktop running:

```powershell
iwr https://dewee.sh/docker-compose.yml -OutFile docker-compose.yml
docker compose up -d
```

## Open the dashboard

When dewee is running, open `http://localhost:4321` in your browser. This is the dashboard, where you manage your install from now on.

## Set it up in the dashboard

The first visit walks you through onboarding:

1. **Create the owner account.** This is the account that manages the workspace, its members and its licence.
2. **Configure the workspace.** Give it a name and set the basics for your team.
3. **Add an LLM provider.** Paste an API key from a provider such as Anthropic, OpenAI, Google Gemini or OpenRouter. dewee does not include model credit; it calls the provider you connect. See [LLM providers](/docs/integrations/llm-providers).
4. **Create your first agent.** Give it a name, pick a model and send it a message to check that it answers.

## Add a licence to connect channels

Agents, providers and skills work without a licence. To connect channels such as Zalo, Telegram, Discord or Slack, you need a dewee licence key for that workspace, which costs $500 per year; each workspace needs its own. Once you have the key, paste it into the dashboard to activate it; channels then become available to connect. [Licence activation](/docs/runtime/licence) explains what the key does.

> [!TIP]
> Early Access: the first 50 licences get 50% off the first year, $250 instead of $500, until the end of 15 October 2026, Vietnam time. See [pricing](/pricing).

## Minimum requirements

These are the minimums, not a recommendation for heavy workloads:

- **Standalone binary:** 64-bit macOS 13 or later, or 64-bit Linux with glibc, and 2 GB of RAM.
- **Docker:** Docker 24 or later, and 2 GB of RAM.

## Keeping it up to date

With Self-install, you run the updates. We publish new versions; installing them, and backing up your data before you do, is up to you.

## Where to get help

Self-install does not include setup help. If you would rather have our team install and look after dewee for you, choose [On-Premises](/docs/get-started/deployment-options), which starts at $5K. For questions about licences or which option fits, [contact us](/contact).

## Next steps

- [Install page](/install): the install commands on one page.
- [Licence activation](/docs/runtime/licence): how a licence key is bound and what happens when it expires.
- [Quickstart](/docs/get-started/quickstart): from a connected provider to your first agent reply.
