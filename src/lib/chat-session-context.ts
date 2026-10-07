/**
 * Where a chat visitor came from: page, first-touch landing page, external referrer and UTM tags,
 * plus the Cloudflare country the edge adds. Shared by the widget (which reads it from the
 * browser) and the worker (which re-validates everything, because query parameters are untrusted).
 * Every value is clipped and pattern-checked; anything that does not fit is dropped, not repaired.
 */

export type ChatContext = {
  page?: string;
  landing?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  country?: string;
};

/** Query parameter for each field on the /api/chat/ws URL (short, since they ride a WebSocket URL). */
export const CONTEXT_PARAMS = {
  page: "pg",
  landing: "lp",
  referrer: "rf",
  utmSource: "us",
  utmMedium: "um",
  utmCampaign: "uc",
  country: "cc",
} as const satisfies Record<keyof ChatContext, string>;

const PATH_MAX = 200;
const REFERRER_MAX = 200;
const UTM_MAX = 80;
const PATH_RE = /^\/(?!\/)[A-Za-z0-9/_\-.~%]*$/;
const UTM_RE = /^[\p{L}\p{N} _.+\-]+$/u;

/** A same-site path without query or fragment: "/pricing", "/vi/install". */
export function cleanPath(raw: string | null | undefined): string | undefined {
  const path = raw?.trim().split(/[?#]/)[0] ?? "";
  if (!path || path.length > PATH_MAX || !PATH_RE.test(path)) return undefined;
  return path;
}

/**
 * An external referrer reduced to host + path (queries can carry tokens or search terms).
 * Same-site referrers are dropped: they say nothing about where the visit came from.
 */
export function cleanReferrer(raw: string | null | undefined, siteHost?: string): string | undefined {
  const text = raw?.trim();
  if (!text) return undefined;
  // The widget sends "host/path"; a full URL (document.referrer) is accepted too.
  const url = URL.parse(text.includes("://") ? text : `https://${text}`);
  if (!url || !url.hostname.includes(".") || (url.protocol !== "https:" && url.protocol !== "http:")) return undefined;
  const host = url.hostname.toLowerCase();
  if (siteHost && (host === siteHost || host.endsWith(`.${siteHost}`))) return undefined;
  const path = url.pathname === "/" ? "" : url.pathname;
  return `${host}${path}`.slice(0, REFERRER_MAX);
}

/** A UTM value: letters, digits, space and _ . + - only, lower-cased, at most 80 characters. */
export function cleanUtm(raw: string | null | undefined): string | undefined {
  const value = raw?.trim().replace(/\s+/g, " ").toLowerCase().slice(0, UTM_MAX) ?? "";
  return value && UTM_RE.test(value) ? value : undefined;
}

/** Cloudflare's two-letter country code (also "T1" for Tor, "XX" for unknown). */
export function cleanCountry(raw: string | null | undefined): string | undefined {
  const code = raw?.trim().toUpperCase() ?? "";
  return /^[A-Z][A-Z0-9]$/.test(code) ? code : undefined;
}

/** Validated context from query parameters (the widget's, or the edge's forward to the room). */
export function readChatContext(params: URLSearchParams, siteHost?: string): ChatContext {
  const get = (k: keyof ChatContext) => params.get(CONTEXT_PARAMS[k]);
  return dropEmpty({
    page: cleanPath(get("page")),
    landing: cleanPath(get("landing")),
    referrer: cleanReferrer(get("referrer"), siteHost),
    utmSource: cleanUtm(get("utmSource")),
    utmMedium: cleanUtm(get("utmMedium")),
    utmCampaign: cleanUtm(get("utmCampaign")),
    country: cleanCountry(get("country")),
  });
}

/** Writes the present fields of `ctx` onto `params`. */
export function writeChatContext(params: URLSearchParams, ctx: ChatContext): void {
  for (const key of Object.keys(CONTEXT_PARAMS) as (keyof ChatContext)[]) {
    const value = ctx[key];
    if (value) params.set(CONTEXT_PARAMS[key], value);
  }
}

/**
 * Keeps the first visit's landing, referrer, UTM and country, and takes the newest page.
 * A returning visitor's later connection must not overwrite how they first arrived.
 */
export function mergeChatContext(stored: ChatContext, fresh: ChatContext): ChatContext {
  return dropEmpty({
    page: fresh.page ?? stored.page,
    landing: stored.landing ?? fresh.landing,
    referrer: stored.referrer ?? fresh.referrer,
    utmSource: stored.utmSource ?? fresh.utmSource,
    utmMedium: stored.utmMedium ?? fresh.utmMedium,
    utmCampaign: stored.utmCampaign ?? fresh.utmCampaign,
    country: stored.country ?? fresh.country,
  });
}

function dropEmpty(ctx: ChatContext): ChatContext {
  return Object.fromEntries(Object.entries(ctx).filter(([, v]) => v)) as ChatContext;
}
