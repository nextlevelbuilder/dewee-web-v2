/**
 * `/<path>.md` for every page. Static pages have a twin written at build time
 * (scripts/postbuild-markdown-and-og.ts); dynamic pages (blog, page builder, changelog)
 * are rendered to HTML here, converted, and cached at the edge for 10 minutes.
 */
import { htmlToMarkdown } from "../html-to-markdown";

type Render = (req: Request) => Promise<Response>;

const HEADERS = {
  "content-type": "text/markdown; charset=utf-8",
  "cache-control": "public, max-age=600",
  "access-control-allow-origin": "*",
  "x-robots-tag": "noindex",
};

export async function markdownTwin(request: Request, env: Env, render: Render): Promise<Response> {
  const url = new URL(request.url);
  const staticTwin = await env.ASSETS.fetch(new Request(new URL(url.pathname, url.origin)));
  if (staticTwin.ok) return new Response(staticTwin.body, { headers: HEADERS });

  const cache = (caches as unknown as { default: Cache }).default;
  const cacheKey = new Request(url.toString(), { method: "GET" });
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  const htmlPath = url.pathname === "/index.md" ? "/" : url.pathname.slice(0, -3);
  const page = await render(new Request(new URL(htmlPath, url.origin), { headers: { accept: "text/html" } }));
  const type = page.headers.get("content-type") ?? "";
  if (!page.ok || !type.includes("text/html")) {
    return new Response(`# Not found\n\nThere is no page at ${htmlPath}.\n`, { status: 404, headers: HEADERS });
  }
  const { markdown } = htmlToMarkdown(await page.text(), env.SITE_URL || url.origin);
  const response = new Response(markdown, { headers: HEADERS });
  await cache.put(cacheKey, response.clone());
  return response;
}
