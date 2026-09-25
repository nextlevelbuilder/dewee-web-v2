---
title: Frequently asked questions
description: "Straight answers to what CTOs and operators ask about dewee: the GoClaw names, data location, licence checks, safe defaults, models, backups and chat channels."
section: resources
order: 1
updated: 2026-09-25
---

Questions about prices, plans and refunds are answered on the [pricing page](/pricing). This page covers the technical side.

## Product

### Is dewee open source?

No. dewee grew out of GoClaw, but it is a separate, closed-source product with a customer console, licensing and a team that supports you. GoClaw remains open and free for non-commercial use.

### Why do some settings and headers say GoClaw?

GoClaw is the runtime's original name, and many environment variables (`GOCLAW_*`) and HTTP headers (`X-GoClaw-*`) still use it. Where a `DEWEE_*` variable exists, such as `DEWEE_SERVER` or `DEWEE_API_KEY` for the CLI, it takes precedence. Use the names exactly as the docs show them.

### Which models can we use?

Anthropic, OpenAI, Gemini, DeepSeek, Qwen, Mistral, xAI, OpenRouter, Groq, Ollama and many more, including any OpenAI-compatible endpoint. You bring your own keys and pay the providers directly. See [LLM and voice providers](/docs/integrations/llm-providers).

### Which chat apps are ready for production?

Telegram has been validated with real users. Slack, Discord, WhatsApp, Feishu/Lark, Zalo OA and Zalo Personal are implemented but not yet tested end to end in production, so pilot them with a small group first. See [Chat channels](/docs/integrations/channels).

## Data and deployment

### Where is our data stored?

In the runtime's database and file storage, wherever the runtime runs. On shared AaaS that is our cloud; with Dedicated it is a runtime reserved for you on TOSE; with On-Premises it is your own VPS or Mac mini. With Self-install it is your own machine or server. In Vietnam, we offer Self-install and On-Premises. See [Choose a deployment](/docs/get-started/deployment-options).

### What does an On-Premises runtime send to you?

A licence check-in every five minutes, made with an activation ID and a runtime credential rather than the licence key itself. If our licence service cannot be reached, the runtime keeps working for up to 24 hours from the last successful check-in. See [Licence activation](/docs/runtime/licence).

### Which database does the runtime need?

PostgreSQL with the pgvector extension for the Standard edition. With SQLite the runtime runs as the Lite edition, with lower limits and without workflows, role-based access, the knowledge graph or vector search. See [Install and run](/docs/runtime/install-and-run#editions).

### Can one runtime serve several teams or clients?

Yes. Each tenant is isolated: agents, sessions, memory, providers and tools belong to exactly one tenant, and every query is scoped to it. See [Multi-tenancy](/docs/concepts/multi-tenancy).

## Security

### Is a new runtime locked down by default?

The edge is: the gateway refuses to start on a network address without a gateway token, and new senders on console-created channels wait for pairing approval. What agents may do is deliberately permissive at first, with the full tool profile, no command approval and no sandbox. Tighten those before agents touch real data; the [security overview](/docs/security/overview#before-you-go-live) has a checklist.

### How are provider keys and other secrets protected?

They are encrypted in the database with the runtime's encryption key, and the API never returns them. API keys are stored only as a hash. See [Secrets, roles and audit](/docs/security/secrets-roles-and-audit).

### What happens if an agent gets something wrong?

Every run leaves a trace of its model and tool calls, risky shell commands can require approval, and you can abort a reply in the console chat or send `/stop` in a chat channel. See [The agent loop](/docs/concepts/agent-loop).

## Operations

### How do we back up and upgrade?

`dewee backup` writes the database and data files to one archive, and `dewee restore smoke` proves the archive restores before you need it. `dewee upgrade` brings the schema up to date and is safe to run more than once. See [Backups and restores](/docs/runtime/install-and-run#backups-and-restores) and [Upgrades](/docs/runtime/install-and-run#upgrades).

### Can we automate what we do in the console?

Mostly. Agents, sessions, providers, channels, tools and memory are all managed through the runtime's API, and the `dewee` CLI covers the same ground. Members, billing and support stay in the console. See [API overview](/docs/api/overview) and [CLI](/docs/runtime/cli).

### Can we use our workspace from a code editor?

Yes, through the runtime's public MCP endpoint, which is off by default on On-Premises runtimes. Claude Code, Cursor, VS Code and Gemini CLI can then search memory and skills and work with workflows. See [Webhooks and MCP](/docs/api/webhooks-and-mcp#the-public-mcp-server).

### Where do we get help?

Open **Support** in the console, or [contact us](/contact).
