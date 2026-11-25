/** RFC 9728 protected resource metadata for /mcp, at both the root and the path-suffixed URL. */
import type { APIRoute } from "astro";
import { platformEnv } from "~/lib/server/api/platform-env";
import { siteOrigin } from "~/lib/server/seo/discovery-response";
import { oauthJson, preflight } from "~/lib/server/auth/oauth-http";
import { protectedResourceMetadata } from "~/lib/server/auth/oauth-store";

export const prerender = false;

export const GET: APIRoute = ({ params, url }) => {
  if (params.path && params.path !== "mcp") return oauthJson({ error: "not_found" }, 404);
  return oauthJson(protectedResourceMetadata(siteOrigin(platformEnv(), url)));
};
export const OPTIONS: APIRoute = preflight;
