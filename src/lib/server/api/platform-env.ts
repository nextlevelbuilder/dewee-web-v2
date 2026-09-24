/**
 * Worker bindings for Astro routes. The Astro 7 Cloudflare adapter removed `Astro.locals.runtime.env`;
 * bindings come from the `cloudflare:workers` module instead, and `Astro.locals.cfContext` carries
 * the ExecutionContext. Every platform module reads bindings through this one accessor.
 */
import { env as workerEnv } from "cloudflare:workers";

/** `Env` plus the optional vars this platform reads that are not declared in src/env.d.ts yet. */
export type PlatformEnv = Env & {
  /** Cloudflare Access team domain, e.g. `nextlevelbuilder.cloudflareaccess.com` (optional). */
  CF_ACCESS_TEAM_DOMAIN?: string;
  /** Cloudflare Access application audience tag (optional). */
  CF_ACCESS_AUD?: string;
};

export function platformEnv(): PlatformEnv {
  return workerEnv as unknown as PlatformEnv;
}

export function isProduction(env: PlatformEnv): boolean {
  return env.ENVIRONMENT === "production";
}
