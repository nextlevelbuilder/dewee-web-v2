/**
 * Worker bindings for Astro routes. The Astro 7 Cloudflare adapter removed `Astro.locals.runtime.env`;
 * bindings come from the `cloudflare:workers` module instead, and `Astro.locals.cfContext` carries
 * the ExecutionContext. Every platform module reads bindings through this one accessor.
 */
import { env as workerEnv } from "cloudflare:workers";

/** The worker bindings the platform reads (declared in src/env.d.ts). */
export type PlatformEnv = Env;

export function platformEnv(): PlatformEnv {
  return workerEnv as unknown as PlatformEnv;
}

export function isProduction(env: PlatformEnv): boolean {
  return env.ENVIRONMENT === "production";
}
