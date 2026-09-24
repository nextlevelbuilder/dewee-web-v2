---
title: Providers, fallback and reasoning
description: How dewee talks to 31 LLM provider types, what happens when a call fails, how usage caps and prompt caching work, and how reasoning effort is set per agent.
section: concepts
order: 3
updated: 2026-09-25
---

The agent loop never talks to a model vendor directly. It calls one provider interface, and an adapter translates each request into the vendor's wire format. This page covers the provider types, what happens when a call fails, spending caps and reasoning settings.

## Provider types and adapters

A provider is an account you register in a tenant: a name, a `provider_type`, a key or other credential, and a base URL where needed. There are 31 provider types, served by six adapter families.

| Adapter family | Provider types |
|---|---|
| Anthropic native (HTTP + SSE) | `anthropic_native` |
| OpenAI-compatible | `openai_compat`, `openrouter`, `groq`, `deepseek`, `gemini_native`, `vertex`, `mistral`, `xai`, `minimax_native`, `cohere`, `perplexity`, `bailian`, `alibaba_token_plan`, `yescale`, `zai`, `zai_coding`, `ollama`, `ollama_cloud`, `novita`, `byteplus`, `byteplus_coding`, `kimi_coding`, `cloudflare_workers_ai`, `cline_pass`, `opencode_go`, `vercel_ai_gateway` |
| DashScope (Qwen) | `dashscope` |
| ChatGPT subscription (Codex OAuth) | `chatgpt_oauth` |
| Claude CLI (local binary) | `claude_cli` |
| ACP (external coding agents over JSON-RPC) | `acp` |

HTTP providers use a 300-second request timeout. ACP providers run an external agent as a subprocess, with a permission mode of `approve-all` (the default), `approve-reads` or `deny-all`.

Providers registered in the database take precedence over providers of the same name in the config file. When `GOCLAW_ENCRYPTION_KEY` is set, provider keys are encrypted with AES-256-GCM before they are stored. Without that key they are stored as entered, so set it before you add providers.

## When a call fails

### Retries

Each provider call gets up to 3 attempts in total. The delay starts at 300 ms, doubles each time up to 30 s, and varies by 10% jitter. A `Retry-After` header on a 429 or 503 replaces the computed delay. HTTP 429, 500, 502, 503 and 504 and network errors are retried; 400, 401, 403 and 404 are not.

### Model fallback

An agent can list backup provider and model pairs in `model_fallback`. The agent's own provider and model are always tried first, then the candidates in the order you list them:

```json
{
  "model_fallback": {
    "enabled": true,
    "candidates": [
      { "provider": "openai-codex", "model": "gpt-5.5" },
      { "provider": "openrouter", "model": "<model-id>" }
    ]
  }
}
```

Fallback happens on rate limits, overload, timeouts and network failures, authentication and billing errors, model-not-found errors, and exhausted ChatGPT OAuth routes or transient Codex failures. It does not happen when:

- the context window overflows, because that needs compaction rather than another model;
- the error cannot be classified;
- the request names a provider or model explicitly, as manual runs and heartbeats can;
- a streamed reply has already sent any text, thinking or image chunk.

### Cooldowns

While fallback is on, a route that fails for a known reason is put on cooldown, and later requests skip it until the cooldown ends or a periodic probe succeeds. Cooldowns are on by default (`cooldown_enabled`), and `max_attempts` limits how many routes one request tries.

| Reason | Cooldown |
|---|---|
| Rate limit | 30 s |
| Overloaded | 60 s, rising to 120 s |
| Timeout | 15 s |
| Billing | 5 min |
| Authentication | 10 min |
| Permanent auth failure or model not found | 1 h |

## Usage caps and pricing

On the Standard edition, you can cap spending in tokens or US dollars per tenant, agent, provider, provider type or model. Before each call, dewee reserves the estimated tokens and cost, then reconciles them with the usage the provider reports. Memory flush, compaction, media-reading tools and sub-agents go through the same check.

Prices come from the OpenRouter model catalog, and you can override them per tenant, provider or model. Price units are input, output, cache read, cache write, reasoning, request, image and web search. Subscription and local providers (`chatgpt_oauth`, `claude_cli`, `bailian`, `acp`, `ollama`) are not priced. The older per-agent `budget_monthly_cents` setting is converted into a monthly USD cap for that agent.

## Prompt caching and account pools

dewee splits the system prompt into a stable part and a per-turn part. For Anthropic, the stable block is marked for caching, so later turns reuse it instead of paying for it again. Cache reads and writes are counted in usage and priced as their own units.

A tenant can connect several ChatGPT subscription accounts, each as its own `chatgpt_oauth` provider. One of them can own a pool of the others:

```json
{
  "name": "openai-codex",
  "provider_type": "chatgpt_oauth",
  "settings": {
    "codex_pool": {
      "strategy": "round_robin",
      "extra_provider_names": ["codex-work"]
    }
  }
}
```

`round_robin` spreads requests across the accounts. `priority_order` uses the main account first and moves down the list. A retryable failure moves on to the next account within the same request. Recent routing and account health for an agent are available at `GET /v1/agents/{id}/codex-pool-activity`.

## Reasoning

Reasoning (extended thinking) is off unless a provider default or an agent setting turns it on.

- **Provider default.** `settings.reasoning_defaults` on the provider holds an `effort` and a `fallback`, shared by every agent that uses it.
- **Agent override.** `reasoning_config.override_mode` is `inherit` (use the provider default) or `custom` (the agent's own `effort` and `fallback`).
- **Effort values.** `off`, `auto`, `none`, `minimal`, `low`, `medium`, `high`, `xhigh` and `max`.
- **Fallback.** `downgrade` drops to the highest level the model supports, `off` turns reasoning off, and `provider_default` uses the provider's setting.
- **Legacy level.** The older `thinking_level` setting (`off`, `low`, `medium`, `high`) still works.

Each adapter maps the level in its own way:

| Provider | Behaviour |
|---|---|
| Anthropic | Thinking budgets of 4,096, 10,000 and 32,000 tokens for low, medium and high. `max_tokens` is raised to at least the budget plus 4,096, and temperature is not sent. Newer Claude models use adaptive thinking with an effort level instead of a budget. |
| OpenAI and Codex | `reasoning_effort`, adjusted to what the model supports. |
| DashScope | Budgets of 4,096, 16,384 and 32,768 tokens. When tools are present, the reply is not streamed. |

The effort used and where it came from are recorded in the trace metadata (`metadata.reasoning`).

## Embeddings

Vector search in the knowledge vault and episodic memory uses one of two embedding providers: OpenAI `text-embedding-3-small` (1,536 dimensions) or Voyage (1,024 dimensions, stored at 1,536). Vector search needs PostgreSQL with pgvector; the Lite edition uses keyword search only.

## Related

- [Providers and models](/docs/console/providers-and-models): adding provider accounts and choosing models in the console.
- [LLM providers](/docs/integrations/llm-providers): setup notes for each vendor.
- [The agent loop](/docs/concepts/agent-loop): where the model call sits in a run.
- [Tracing and observability](/docs/concepts/tracing): tokens, cost and fallback attempts per call.
- [Security model](/docs/security/overview): how keys and secrets are protected.
