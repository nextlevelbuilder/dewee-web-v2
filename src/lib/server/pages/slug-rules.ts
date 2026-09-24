/**
 * Slug rules (pure). Lowercase kebab-case segments; pages may nest with "/" (up to four levels),
 * posts are a single segment. The first segment of a page may not shadow a site route, so a
 * custom page can never impersonate /pricing, /admin or the API, today or if pages move to the root.
 */
export const RESERVED_TOP_LEVEL: ReadonlySet<string> = new Set([
  // marketing and docs
  "features", "architecture", "security", "integrations", "changelog", "roadmap", "use-cases", "pricing",
  "story", "about", "partners", "contact", "developers", "docs", "blog", "search",
  // legal
  "terms", "policy", "privacy", "cookies", "gdpr", "legal",
  // platform and machine routes
  "api", "admin", "mcp", "p", "media", "preview", "login", "logout", "auth", "llms", "sitemap", "rss", "feed",
  "robots", "og", "img", "brand", "fonts", "shots", "assets", "static", "cdn-cgi", "well-known",
  // locales, errors and brand links
  "en", "vi", "404", "500", "index", "discord", "facebook", "x", "github",
]);

const SEGMENT = "[a-z0-9]+(?:-[a-z0-9]+)*";
const PAGE_SLUG_RE = new RegExp(`^${SEGMENT}(?:/${SEGMENT}){0,3}$`);
const POST_SLUG_RE = new RegExp(`^${SEGMENT}$`);
export const MAX_SLUG_LENGTH = 120;

export type SlugKind = "page" | "post";

/** Returns an error message, or null when the slug is valid for this kind. */
export function slugError(slug: string, kind: SlugKind): string | null {
  if (!slug) return "Slug is required.";
  if (slug.length > MAX_SLUG_LENGTH) return `Slug is longer than ${MAX_SLUG_LENGTH} characters.`;
  if (kind === "post") {
    if (!POST_SLUG_RE.test(slug)) return "Post slugs are lowercase kebab-case without slashes, e.g. introducing-dewee.";
    return null;
  }
  if (!PAGE_SLUG_RE.test(slug)) return "Page slugs are lowercase kebab-case segments joined by '/', up to four levels, e.g. events/webinar-2026.";
  const first = slug.split("/")[0];
  if (RESERVED_TOP_LEVEL.has(first)) return `"${first}" is reserved for a site route; choose another first segment.`;
  return null;
}

/** Title → slug: strips Vietnamese diacritics (đ → d), lowercases, joins words with "-". */
export function slugify(title: string, maxLength = 80): string {
  const base = title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[đĐ]/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base.slice(0, maxLength).replace(/-+$/, "");
}

/** Public URL path of a published page or post (unprefixed for EN, /vi for Vietnamese). */
export function publicPath(kind: SlugKind, locale: "en" | "vi", slug: string): string {
  const prefix = locale === "vi" ? "/vi" : "";
  return kind === "post" ? `${prefix}/blog/${slug}` : `${prefix}/p/${slug}`;
}
