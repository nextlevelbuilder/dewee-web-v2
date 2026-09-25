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
  /** Cloudflare Access team domain, e.g. `nextlevelbuilder.cloudflareaccess.com`; enables Access sign-in (optional). */
  CF_ACCESS_TEAM_DOMAIN?: string;
  /** Cloudflare Access application audience tag (optional). */
  CF_ACCESS_AUD?: string;
  /** Resend key for admin sign-in codes (optional; API-key sign-in works without it). */
  RESEND_API_KEY?: string;
  /** Sender for Resend mail, e.g. `dewee <hi@dewee.sh>` (optional; defaults to noreply@dewee.sh). */
  RESEND_FROM_EMAIL?: string;
  /** Discord webhook that receives new chat sessions, leads and partner applications (optional). */
  DISCORD_WEBHOOK_URL?: string;
  /** Where visitor chat messages are forwarded for dewee's own agent to answer (optional). */
  CHAT_AGENT_WEBHOOK_URL?: string;
  /** Per-IP and site-wide counters for the website chat. */
  CHAT_LIMITER: DurableObjectNamespace<import("./lib/server/chat-limiter").ChatLimiter>;
  /** HMAC key for signed chat sessions and hashed visitor IPs; without it the chat runs unsigned and the agent stays off (secret). */
  CHAT_SESSION_SECRET?: string;
  /** Kill switch: the dewee advisor agent answers only when this var is "true". */
  CHAT_AGENT_ENABLED?: string;
  /** Agent replies allowed per UTC day across the site (default 500); past it visitors get the FAQ. */
  CHAT_AGENT_DAILY_BUDGET?: string;
  /** Base URL of the dewee runtime that hosts the advisor agent, e.g. https://dewee.zuey.me. */
  DEWEE_CHAT_AGENT_URL?: string;
  /** Agent key or id of the advisor agent on that runtime. */
  DEWEE_CHAT_AGENT_ID?: string;
  /** Runtime API key used only for the advisor chat (secret). */
  DEWEE_CHAT_AGENT_API_KEY?: string;
  /** Cloudflare Turnstile site key (public) and secret key (secret); both unset skips the challenge. */
  TURNSTILE_SITE_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
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
