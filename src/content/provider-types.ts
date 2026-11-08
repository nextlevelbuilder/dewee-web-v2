/**
 * The provider types the dewee runtime accepts as `provider_type`. This is a different count from
 * the providers the site features by name (PROVIDERS in integrations.ts): a type is a kind of
 * connection, so one vendor can need several (Z.ai and its Coding Plan, BytePlus and its Coding
 * Plan), and the list includes plain OpenAI-compatible endpoints.
 *
 * Source (verified 2026-10-29): `store.ValidProviderTypes` in internal/store/provider_store.go at
 * tag v3.43.0 of nextlevelbuilder/dewee, 32 keys (the same 32 at v3.40.0, v3.41.0 and v3.42.0). Re-count with
 *   git show v<tag>:internal/store/provider_store.go | awk '/^var ValidProviderTypes/,/^}/' | grep -c true
 * The runtime has no per-edition provider list, so no edition is recorded here.
 */

/** How a connection is authenticated, from the runtime's provider catalogue `credential_mode`. */
export type ProviderAuth = "api-key" | "service-account" | "oauth" | "cli" | "local";

export const PROVIDER_TYPES = [
  "anthropic_native",
  "openai_compat",
  "gemini_native",
  "openrouter",
  "groq",
  "deepseek",
  "mistral",
  "xai",
  "minimax_native",
  "cohere",
  "perplexity",
  "dashscope",
  "bailian",
  "alibaba_token_plan",
  "chatgpt_oauth",
  "claude_cli",
  "yescale",
  "zai",
  "zai_coding",
  "ollama",
  "ollama_cloud",
  "acp",
  "novita",
  "byteplus",
  "byteplus_coding",
  "kimi_coding",
  "vertex",
  "cloudflare_workers_ai",
  "cline_pass",
  "opencode_go",
  "vercel_ai_gateway",
  "atlascloud",
] as const;

export type ProviderType = (typeof PROVIDER_TYPES)[number];
