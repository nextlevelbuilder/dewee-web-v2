---
title: LLM and voice providers
description: The model providers dewee connects to, from Anthropic, OpenAI and Gemini to local Ollama and coding agents, plus the speech providers behind voice features.
section: integrations
order: 2
updated: 2026-09-25
---

dewee does not ship its own model. Each workspace connects the providers it already uses, with its own keys or subscriptions, and pays those providers directly; our prices never include model usage. Each agent then picks a provider and model, with other providers as fallbacks. This page lists what you can connect. How a provider is chosen at run time is in [Providers, fallback and reasoning](/docs/concepts/providers-and-routing), and the steps in the console are in [Providers and models](/docs/console/providers-and-models).

## Supported providers

| Family | Providers |
|---|---|
| Model makers | Anthropic, OpenAI or any OpenAI-compatible endpoint, Google Gemini, Google Vertex AI, xAI (Grok), Mistral AI, DeepSeek, Cohere, Perplexity |
| Regional platforms and coding plans | DashScope (Qwen), Bailian Coding, Z.ai and Z.ai Coding Plan, BytePlus ModelArk and BytePlus Coding Plan, Kimi Coding (Moonshot), MiniMax |
| Routers and gateways | OpenRouter, Groq, Novita AI, YesScale, Cloudflare Workers AI, Vercel AI Gateway, ClinePass, OpenCode Go |
| Local and self-hosted | Ollama on your own hardware, Ollama Cloud |
| Subscriptions and coding agents | ChatGPT subscription (OAuth), Claude CLI, and ACP coding agents such as Claude Code, Codex CLI and Gemini CLI |

Under the hood these run on six adapters: Anthropic's native API, an OpenAI-compatible adapter that covers most of the list, the Claude CLI, the ChatGPT subscription backend, ACP for coding agents, and DashScope. A provider that speaks the OpenAI API but is not listed can be added as **OpenAI Compatible** with its base URL.

## What each kind needs

| Kind | You provide | Notes |
|---|---|---|
| API key | The key, and a base URL where the provider needs one | The usual case |
| OAuth | A sign-in to the provider's account | ChatGPT subscription |
| Local binary | A CLI installed on the runtime's host | Claude CLI and ACP agents run as processes on the host, so they need a runtime you operate |
| Local server | The address of the model server | Ollama; the runtime must be able to reach it |

After you save a provider, **verify** it to confirm that the credential and model work. A successful check reflects access at that moment, not later changes to your account or plan.

## How keys are handled

- Keys are encrypted at rest with the runtime's encryption key.
- The API never returns a stored key. Reads show `***`, and saving a form that still shows `***` keeps the stored key.
- Providers saved in the console or through the API take precedence over ones in the runtime's config file.
- Only people with the provider-management permission can add, change or remove providers. See [Secrets, roles and audit](/docs/security/secrets-roles-and-audit).

## Costs and limits

On the Standard edition, admins can cap tokens or spending for a workspace, an agent, a provider, a provider type or a model, and a call that would exceed a cap is stopped before it is sent. Prices for API-key providers come from OpenRouter's model catalogue, and admins can override them. Subscription providers such as the ChatGPT subscription, Claude CLI and Bailian Coding are not priced per token, and local providers such as Ollama and ACP agents are not counted. Spending shows up on **Usage**.

## Embeddings

Vector search over memory and the knowledge base uses an embedding model, either OpenAI's `text-embedding-3-small` or Voyage. It needs PostgreSQL with pgvector; the Lite edition uses keyword search only.

## Voice

Agents can listen and speak when a voice provider is set up:

| Direction | Providers |
|---|---|
| Speech to text, for voice notes in chat | Soniox, ElevenLabs, or a proxy service you run |
| Text to speech, for spoken replies | OpenAI, ElevenLabs, Edge, MiniMax, Gemini |

Voice notes are transcribed on Telegram, Discord and Feishu; WhatsApp stays off until an admin turns it on. See [Chat channels](/docs/integrations/channels).

## From the command line

On a runtime you operate, `dewee providers` lists, adds, updates, deletes and verifies providers, and `dewee tts` lists voice providers and voices and tests a provider's connection. See [CLI](/docs/runtime/cli).

For the full list of partners and platforms, see [Integrations](/integrations).
