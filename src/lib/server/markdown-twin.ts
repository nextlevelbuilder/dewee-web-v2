/**
 * `/<path>.md` for every page. Prerendered pages have a twin written at build time
 * (scripts/postbuild-markdown-and-og.ts); server-rendered pages (blog, page builder, changelog)
 * are rendered to HTML here, converted, and cached at the edge for 10 minutes. The query string
 * is kept (`/changelog.md?channel=beta`), and every twin points at its HTML page as canonical.
 */
import { htmlToMarkdown } from "../html-to-markdown";
import { pageForTwin } from "./seo/seo-paths";

type Render = (req: Request) => Promise<Response>;

function headers(canonical: string): HeadersInit {
  return {
    "content-type": "text/markdown; charset=utf-8",
    "cache-control": "public, max-age=600",
    "access-control-allow-origin": "*",
    "x-robots-tag": "noindex",
    link: `<${canonical}>; rel="canonical"`,
  };
}

export async function markdownTwin(request: Request, env: Env, render: Render): Promise<Response> {
  const url = new URL(request.url);
  const origin = (env.SITE_URL || url.origin).replace(/\/$/, "");
  const htmlPath = pageForTwin(url.pathname);
  const canonical = `${origin}${htmlPath}`;

  if (!url.search) {
    const staticTwin = await env.ASSETS.fetch(new Request(new URL(url.pathname, url.origin)));
    if (staticTwin.ok) return new Response(request.method === "HEAD" ? null : staticTwin.body, { headers: headers(canonical) });
  }

  const cache = (caches as unknown as { default: Cache }).default;
  const cacheKey = new Request(url.toString(), { method: "GET" });
  const hit = await cache.match(cacheKey);
  if (hit) return hit;

  const page = await render(new Request(new URL(`${htmlPath}${url.search}`, url.origin), { headers: { accept: "text/html" } }));
  const type = page.headers.get("content-type") ?? "";
  if (!page.ok || !type.includes("text/html")) {
    const unavailable = page.status >= 500;
    const body = unavailable ? `# Temporarily unavailable\n\nTry ${canonical} again in a minute.\n` : `# Not found\n\nThere is no page at ${htmlPath}.\n`;
    return new Response(body, { status: unavailable ? 503 : 404, headers: { ...headers(canonical), "cache-control": "no-store" } });
  }
  const { markdown } = htmlToMarkdown(await page.text(), origin);
  const response = new Response(markdown, { headers: headers(canonical) });
  await cache.put(cacheKey, response.clone());
  return request.method === "HEAD" ? new Response(null, response) : response;
}
