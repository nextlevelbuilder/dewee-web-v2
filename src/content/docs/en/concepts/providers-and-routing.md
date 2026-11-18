---
title: Providers, fallback and reasoning
description: How dewee talks to 32 LLM provider types, handles failed calls, caps usage, caches prompts, routes adaptively and sets reasoning effort per agent.
section: concepts
order: 3
updated: 2026-11-18
---

The agent loop never talks to a model vendor directly. It calls one provider interface, and an adapter translates each request into the vendor's wire format. This page covers the provider types, what happens when a call fails, spending caps and reasoning settings.

## Provider types and adapters

A provider is an account you register in a tenant: a name, a `provider_type`, a key or other credential, and a base URL where needed. There are 32 provider types, served by six adapter families. A provider type is a kind of connection the runtime accepts, not a vendor: one vendor can need more than one (Z.ai and its Coding Plan, for example).

| Adapter family | Provider types |
|---|---|
| Anthropic native (HTTP + SSE) | `anthropic_native` |
| OpenAI-compatible | `openai_compat`, `openrouter`, `groq`, `deepseek`, `gemini_native`, `vertex`, `mistral`, `xai`, `minimax_native`, `cohere`, `perplexity`, `bailian`, `alibaba_token_plan`, `yescale`, `zai`, `zai_coding`, `ollama`, `ollama_cloud`, `novita`, `byteplus`, `byteplus_coding`, `kimi_coding`, `cloudflare_workers_ai`, `cline_pass`, `opencode_go`, `vercel_ai_gateway`, `atlascloud` |
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

## Adaptive routing

Adaptive routing lets a routing preset choose the provider and model for a run instead of always using the agent's own. It ships dark: presets need `DEWEE_ROUTING_PRESETS_ENABLED=true`, and routes only take effect (canaries, and the decision model's route answer) when `DEWEE_ROUTING_ACTIVE_ENABLED=true` is set as well. Both are off by default, so a gateway without them runs every request exactly as the agent is configured.

### Session affinity and cache expiry

Once a session has a routed provider, it keeps that provider so the provider's prompt cache of the session history can be reused. That saving is gone once the cache has certainly expired. With active routing on, a session whose last turn is older than its provider's cache lifetime asks the decision model again, still within the pinned provider. If that new decision fails, the session keeps its previous route and is not asked again on every turn.

Cache lifetimes are set per provider type: 5 minutes for `anthropic_native` and 10 minutes for `chatgpt_oauth` by default. Other provider types have no known lifetime and never trigger a re-decision. Override the table with `DEWEE_ROUTING_CACHE_TTLS`, a comma-separated list of `provider_type=duration` in Go duration format:

```bash
DEWEE_ROUTING_CACHE_TTLS="anthropic_native=1h,openai_compat=10m"
```

A duration of `0` removes a provider type from the table. Malformed entries are logged once and ignored.

### Measuring routing choices

When run measurement is on (`run_measurement.enabled`), each routed run records whether its route was `initial` (the session's first routed turn), `kept` (same route and preset version as before, so the prompt cache could be reused) or `switched`. A retry is linked to an earlier attempt of the same task only when both ran in the same routing cohort (route, preset version and canary arm), so time to success is never shared across canary arms.

Tenant owners and admins compare the choices with `GET /v1/usage/runs/route-choices` or the CLI:

```bash
dewee usage route-choices --agent-id <agent-uuid> -o json
```

It takes the same filters as `dewee usage runs` except `--group-by` and `--include-runs`, and reports runs, proxy success rate, cost and run duration p50/p95 per choice. When the gateway also runs with `DEWEE_ROUTING_EXPERIMENTS_ENABLED=true`, it adds fork experiment arms grouped by kind (`sticky`, `checkpoint`, `switch`). Arms are replays and are never added to live runs.

When a decision only recommends a route without applying it (shadow mode), `summary.shadow` in `GET /v1/usage/runs` estimates what the runs where the recommendation differed would have cost on the recommended model: `diverged_estimated_cost_usd`, `diverged_estimated_runs`, `diverged_unestimated_runs`, `estimate_coverage` and `estimated_cost_delta_pct` (negative when the recommendation would have been cheaper). The estimate assumes the same token counts, states its basis in `estimate_basis`, and is `null` rather than zero when a model cannot be priced.

### Checkpoints and fork experiments

With `DEWEE_ROUTING_EXPERIMENTS_ENABLED=true`, the [workspace MCP endpoint](/docs/api/workspace-mcp) offers these tools. They only see your own sessions, even for a workspace owner or admin.

| Tool | What it does |
|---|---|
| `routing_checkpoints_list` | Lists the routing checkpoints of your sessions: the provider and model that served a session at a point in its history. A checkpoint holds no message content |
| `routing_checkpoint_create` | Records a checkpoint of one session. A session keeps its newest 8; an unused one expires after 24 hours |
| `routing_checkpoint_delete` | Deletes a checkpoint |
| `routing_fork_experiments_list` | Lists the fork experiments of your sessions with each arm's cost, time and cache tokens |
| `routing_fork_experiments_get` | Reads one experiment's status and, once it is done, each arm's result |
| `routing_fork_experiment_start` | Replays the session's latest user turn on in-memory copies under 1 to 3 arms (`sticky`, `checkpoint`, `switch`). The session itself is not changed |

The three writes need an `idempotency_key` and the approval of a workspace owner or admin before they run. Every experiment arm is a real model call that spends budget, and a `switch` arm sends the session history to another provider, so the workspace must also have consented to that. Success in an experiment is an outcome proxy, not ground truth.

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
