/**
 * URL rules for the post media widgets (isomorphic, pure). Untrusted props never reach an
 * iframe or a media element as-is: video files must be https:// or /media/ paths with a known
 * extension, and YouTube/Vimeo embeds are reduced to a validated id from which we build the
 * player URL ourselves (privacy-enhanced hosts, click-to-load).
 */

import { DEMO_FRAME_ORIGINS } from "./demo-urls";

const UNSAFE_CHARS = /[\s<>"'`\\]/;

/** https:// (any host) or a /media/ path, ending in one of `exts` (a query string is allowed). */
export function isSafeMediaFile(src: string, exts: readonly string[]): boolean {
  if (UNSAFE_CHARS.test(src) || src.length > 500) return false;
  const pathOk = (path: string) => exts.some((ext) => path.toLowerCase().endsWith(`.${ext}`));
  if (src.startsWith("/media/")) return /^\/media\/[A-Za-z0-9/_.-]+$/.test(src) && !src.includes("..") && pathOk(src);
  try {
    const url = new URL(src);
    return url.protocol === "https:" && !url.username && !url.password && pathOk(url.pathname);
  } catch {
    return false;
  }
}

export const VIDEO_EXTS = ["mp4", "webm"] as const;
export const CAPTION_EXTS = ["vtt"] as const;

export type VideoProvider = "youtube" | "vimeo";
export type VideoEmbed = {
  provider: VideoProvider;
  id: string;
  /** Vimeo unlisted-video hash (`vimeo.com/<id>/<hash>`). */
  hash?: string;
  /** The page on the provider's site: the no-JS fallback link. */
  watchUrl: string;
  /** Static thumbnail we may show before the player loads (YouTube only; Vimeo needs its API). */
  thumbnail?: string;
};

/** Hosts the player iframes may load from; the post page's CSP allows exactly these. */
export const EMBED_FRAME_ORIGINS = ["https://www.youtube-nocookie.com", "https://player.vimeo.com"] as const;

/**
 * CSP for pages that render post bodies (the post page and the admin preview). Only `frame-src`
 * is set: the site has no CSP otherwise, and a full policy is a separate decision. Besides the
 * players it keeps the frames the layout already uses: Turnstile (chat) and the GTM noscript tag.
 * Demo hosts (demo-urls.ts) are appended so a sandboxed Demo widget can load.
 */
export const POST_PAGE_CSP = `frame-src 'self' ${EMBED_FRAME_ORIGINS.join(" ")} https://challenges.cloudflare.com https://www.googletagmanager.com ${DEMO_FRAME_ORIGINS.join(" ")}`;

const YT_ID = /^[A-Za-z0-9_-]{11}$/;
const VIMEO_ID = /^\d{6,12}$/;
const VIMEO_HASH = /^[0-9a-f]{6,20}$/;
const YT_HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be", "www.youtube-nocookie.com", "youtube-nocookie.com"]);
const VIMEO_HOSTS = new Set(["vimeo.com", "www.vimeo.com", "player.vimeo.com"]);

function parseUrl(raw: string): URL | null {
  if (UNSAFE_CHARS.test(raw) || raw.length > 500) return null;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" && !url.username && !url.password ? url : null;
  } catch {
    return null;
  }
}

function youtubeId(url: URL): string | null {
  const host = url.hostname.toLowerCase();
  if (!YT_HOSTS.has(host)) return null;
  const parts = url.pathname.split("/").filter(Boolean);
  const candidate = host === "youtu.be" ? parts[0] : parts[0] === "watch" || parts.length === 0 ? url.searchParams.get("v") : ["embed", "shorts", "live", "v"].includes(parts[0]) ? parts[1] : null;
  return candidate && YT_ID.test(candidate) ? candidate : null;
}

function vimeo(url: URL): { id: string; hash?: string } | null {
  const host = url.hostname.toLowerCase();
  if (!VIMEO_HOSTS.has(host)) return null;
  const parts = url.pathname.split("/").filter(Boolean);
  if (host === "player.vimeo.com") {
    if (parts[0] !== "video" || !VIMEO_ID.test(parts[1] ?? "")) return null;
    const h = url.searchParams.get("h");
    return { id: parts[1], ...(h && VIMEO_HASH.test(h) ? { hash: h } : {}) };
  }
  // vimeo.com/<id>, vimeo.com/<id>/<hash>, vimeo.com/channels/<name>/<id>, vimeo.com/groups/<g>/videos/<id>
  const at = parts.findIndex((p) => VIMEO_ID.test(p));
  if (at < 0) return null;
  const next = parts[at + 1];
  return { id: parts[at], ...(next && VIMEO_HASH.test(next) ? { hash: next } : {}) };
}

/** Parses a YouTube or Vimeo page/player URL into a provider and a validated id, or null. */
export function parseVideoEmbed(raw: string): VideoEmbed | null {
  const url = parseUrl(raw.trim());
  if (!url) return null;
  const yt = youtubeId(url);
  if (yt) return { provider: "youtube", id: yt, watchUrl: `https://www.youtube.com/watch?v=${yt}`, thumbnail: `https://i.ytimg.com/vi/${yt}/hqdefault.jpg` };
  const vm = vimeo(url);
  if (vm) return { provider: "vimeo", ...vm, watchUrl: `https://vimeo.com/${vm.id}${vm.hash ? `/${vm.hash}` : ""}` };
  return null;
}

/** The player URL built only from validated parts: youtube-nocookie, or Vimeo with Do Not Track. */
export function embedPlayerUrl(embed: VideoEmbed, start?: number): string {
  const t = start && Number.isInteger(start) && start > 0 ? start : 0;
  if (embed.provider === "youtube") return `${EMBED_FRAME_ORIGINS[0]}/embed/${embed.id}?autoplay=1&rel=0${t ? `&start=${t}` : ""}`;
  return `${EMBED_FRAME_ORIGINS[1]}/video/${embed.id}?dnt=1&autoplay=1${embed.hash ? `&h=${embed.hash}` : ""}${t ? `#t=${t}s` : ""}`;
}

export type SocialPlatform = "x" | "reddit" | "linkedin" | "facebook" | "threads" | "bluesky" | "mastodon" | "hackernews" | "instagram" | "tiktok" | "youtube" | "web";

export const SOCIAL_PLATFORM_NAMES: Record<SocialPlatform, string> = {
  x: "X",
  reddit: "Reddit",
  linkedin: "LinkedIn",
  facebook: "Facebook",
  threads: "Threads",
  bluesky: "Bluesky",
  mastodon: "Mastodon",
  hackernews: "Hacker News",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  web: "Web",
};

const SOCIAL_HOSTS: [RegExp, SocialPlatform][] = [
  [/^(?:www\.|mobile\.)?(?:x|twitter)\.com$/, "x"],
  [/^(?:www\.|old\.|new\.)?reddit\.com$|^redd\.it$/, "reddit"],
  [/^(?:[a-z]{2,3}\.|www\.)?linkedin\.com$|^lnkd\.in$/, "linkedin"],
  [/^(?:www\.|m\.|web\.)?facebook\.com$|^fb\.(?:com|watch)$/, "facebook"],
  [/^(?:www\.)?threads\.(?:net|com)$/, "threads"],
  [/^bsky\.app$/, "bluesky"],
  [/^news\.ycombinator\.com$/, "hackernews"],
  [/^(?:www\.)?instagram\.com$/, "instagram"],
  [/^(?:www\.|m\.)?tiktok\.com$/, "tiktok"],
  [/^(?:www\.|m\.)?youtube\.com$|^youtu\.be$/, "youtube"],
];

/** The platform behind a public post URL (https only). Mastodon runs on many hosts: we detect its `/@user/<id>` paths. */
export function socialPlatform(raw: string): SocialPlatform | null {
  const url = parseUrl(raw.trim());
  if (!url) return null;
  const host = url.hostname.toLowerCase();
  for (const [re, platform] of SOCIAL_HOSTS) if (re.test(host)) return platform;
  if (/^\/@[A-Za-z0-9_.-]+(?:@[A-Za-z0-9.-]+)?\/\d+\/?$/.test(url.pathname)) return "mastodon";
  return "web";
}

/** `https://example.com/a` → `example.com`; used to label links whose platform we do not know. */
export function hostLabel(raw: string): string {
  return parseUrl(raw)?.hostname.replace(/^www\./, "") ?? "";
}
