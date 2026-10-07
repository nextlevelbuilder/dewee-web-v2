/**
 * Worker entry. Edge concerns (host canonicalisation, brand links, Markdown twins, R2 media,
 * the chat WebSocket) are answered here; everything else is rendered by Astro. The hourly cron syncs
 * the changelog and posts the daily website-chat digest.
 */
import astro from "@astrojs/cloudflare/entrypoints/server";
import { handleEdge, withSecurityHeaders } from "./lib/server/edge-routes";
import { syncChangelog } from "./lib/server/changelog-sync";
import { runDailyDigest } from "./lib/server/chat-digest-run";

export { ChatRoom } from "./lib/server/chat-room";
export { ChatLimiter } from "./lib/server/chat-limiter";

export default {
  async fetch(request, env, ctx) {
    const edge = await handleEdge(request, env, ctx, (req) => astro.fetch(req, env, ctx));
    if (edge) return edge;
    const response = await astro.fetch(request, env, ctx);
    return withSecurityHeaders(response, env);
  },

  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(syncChangelog(env).catch((err) => console.error("changelog sync failed", err)));
    // Hourly cron; the digest itself decides whether today's post is due (once a day from 01:00 UTC).
    ctx.waitUntil(runDailyDigest(env).then((run) => { if (run !== "not-due" && run !== "already-sent") console.log("chat digest", run); })
      .catch((err) => console.error("chat digest failed", err)));
  },
} satisfies ExportedHandler<Env>;
