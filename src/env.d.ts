/// <reference types="astro/client" />

/** Bindings and vars declared in wrangler.jsonc, plus optional secrets set with `wrangler secret put`. */
interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  KV: KVNamespace;
  SESSION: KVNamespace;
  MEDIA: R2Bucket;
  CHAT_ROOM: DurableObjectNamespace<import("./lib/server/chat-room").ChatRoom>;
  SITE_URL: string;
  CDN_URL: string;
  ENVIRONMENT: "production" | "staging" | "development";
  CHANGELOG_REPO: string;
  /** Read-only GitHub token for the hourly changelog sync (optional). */
  GITHUB_TOKEN?: string;
  /** Resend key for admin sign-in codes (optional; API-key sign-in works without it). */
  RESEND_API_KEY?: string;
  /** Discord webhook that receives new chat sessions, leads and partner applications (optional). */
  DISCORD_WEBHOOK_URL?: string;
  /** Where visitor chat messages are forwarded for dewee's own agent to answer (optional). */
  CHAT_AGENT_WEBHOOK_URL?: string;
}

/** Types `env` from "cloudflare:workers" with the same bindings. */
type WorkerEnv = Env;
declare namespace Cloudflare {
  interface Env extends WorkerEnv {}
}

declare namespace App {
  interface Locals {
    cfContext?: ExecutionContext;
  }
}
