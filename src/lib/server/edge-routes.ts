/**
 * Requests the worker answers before Astro renders anything:
 *  - www.dewee.sh → dewee.sh (301, path and query kept)
 *  - brand links (/discord, /facebook, /x, /github) → 302 to the social profile
 *  - /api/chat/session → a signed chat session (Turnstile + per-IP limit), see chat-session-route
 *  - /api/chat/ws → the visitor's ChatRoom Durable Object (WebSocket, same origin, signed session)
 *  - /media/<key> → R2 bucket MEDIA
 *  - <any page>.md → the page's Markdown twin
 *  - /_seo/* (build manifest for the discovery routes) → 404
 */
import { BRAND_REDIRECTS } from "../../content/site";
import { chatSessionRoute, sameOrigin, SID_RE } from "./chat-session-route";
import { clientIp, hashIp, verifyChatSession } from "./chat-session-token";
import { markdownTwin } from "./markdown-twin";

type Render = (req: Request) => Promise<Response>;

export async function handleEdge(request: Request, env: Env, _ctx: ExecutionContext, render: Render): Promise<Response | null> {
  const url = new URL(request.url);

  if (url.hostname.startsWith("www.")) {
    url.hostname = url.hostname.slice(4);
    return Response.redirect(url.toString(), 301);
  }

  const brand = BRAND_REDIRECTS[url.pathname.replace(/\/$/, "")];
  if (brand) {
    return withSecurityHeaders(new Response(null, { status: 302, headers: { location: brand, "cache-control": "public, max-age=3600" } }), env);
  }

  // Build artefacts the discovery routes read through the ASSETS binding; not public URLs.
  if (url.pathname.startsWith("/_seo/")) {
    return withSecurityHeaders(new Response("Not found", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } }), env);
  }

  if (url.pathname === "/api/chat/session") return withSecurityHeaders(await chatSessionRoute(request, env, url), env);
  if (url.pathname === "/api/chat/ws") return chatSocket(request, env, url);

  if (url.pathname.startsWith("/media/") && (request.method === "GET" || request.method === "HEAD")) {
    return withSecurityHeaders(await serveMedia(request, env, decodeURIComponent(url.pathname.slice("/media/".length))), env);
  }

  if (url.pathname.endsWith(".md") && (request.method === "GET" || request.method === "HEAD")) {
    return withSecurityHeaders(await markdownTwin(request, env, render), env);
  }

  return null;
}

async function chatSocket(request: Request, env: Env, url: URL): Promise<Response> {
  if (request.headers.get("upgrade")?.toLowerCase() !== "websocket") {
    return new Response("Expected a WebSocket upgrade", { status: 426 });
  }
  // Browsers always send Origin; a missing one, "null" (sandboxed frames, file://) or another host is refused.
  if (!sameOrigin(request, url)) return new Response("Forbidden origin", { status: 403 });
  const sid = url.searchParams.get("sid") ?? "";
  if (!SID_RE.test(sid)) return new Response("Bad session id", { status: 400 });
  // With CHAT_SESSION_SECRET set, the socket needs a session signed for this sid and visitor IP.
  let ipHash = "";
  if (env.CHAT_SESSION_SECRET) {
    ipHash = await hashIp(env.CHAT_SESSION_SECRET, clientIp(request));
    const token = url.searchParams.get("token") ?? "";
    if (!(await verifyChatSession(env.CHAT_SESSION_SECRET, token, sid, ipHash))) return new Response("Chat session expired", { status: 401 });
  }
  const stub = env.CHAT_ROOM.get(env.CHAT_ROOM.idFromName(sid));
  const forward = new URL("https://chat.internal/ws");
  forward.searchParams.set("sid", sid);
  forward.searchParams.set("locale", url.searchParams.get("locale") === "vi" ? "vi" : "en");
  forward.searchParams.set("role", "visitor");
  if (ipHash) forward.searchParams.set("ih", ipHash);
  return stub.fetch(new Request(forward, request));
}

async function serveMedia(request: Request, env: Env, key: string): Promise<Response> {
  if (!key || key.includes("..")) return new Response("Not found", { status: 404 });
  const object = await env.MEDIA.get(key, { onlyIf: request.headers, range: request.headers });
  if (!object) return new Response("Not found", { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", /[.-][0-9a-f]{8,}\./.test(key) ? "public, max-age=31536000, immutable" : "public, max-age=86400");
  if (!("body" in object)) return new Response(null, { status: 304, headers });
  const status = request.headers.has("range") && object.range ? 206 : 200;
  return new Response(request.method === "HEAD" ? null : object.body, { status, headers });
}

/** Baseline hardening for every worker response. Static files get the same set via public/_headers. */
export function withSecurityHeaders(response: Response, env: Env): Response {
  if (response.status === 101 || (response as Response & { webSocket?: unknown }).webSocket) return response;
  const res = new Response(response.body, response);
  const h = res.headers;
  h.set("x-content-type-options", "nosniff");
  h.set("referrer-policy", "strict-origin-when-cross-origin");
  h.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=(), usb=()");
  if (!h.has("x-frame-options")) h.set("x-frame-options", "SAMEORIGIN");
  h.set("strict-transport-security", "max-age=31536000");
  if (env.ENVIRONMENT !== "production") h.set("x-robots-tag", "noindex, nofollow");
  return res;
}
