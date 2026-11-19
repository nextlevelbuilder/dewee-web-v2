/** RFC 8414 authorization server metadata (root and the path-suffixed form some clients try). */
import type { APIRoute } from "astro";
import { platformEnv } from "~/lib/server/api/platform-env";
import { siteOrigin } from "~/lib/server/seo/discovery-response";
import { oauthJson, preflight } from "~/lib/server/auth/oauth-http";
import { authorizationServerMetadata } from "~/lib/server/auth/oauth-store";

export const prerender = false;

export const GET: APIRoute = ({ params, url }) => {
  if (params.path && params.path !== "mcp") return oauthJson({ error: "not_found" }, 404);
  return oauthJson(authorizationServerMetadata(siteOrigin(platformEnv(), url)));
};
export const OPTIONS: APIRoute = preflight;
