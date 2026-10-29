/**
 * URL rules for the Demo post widget (isomorphic, pure). A demo is someone else's page in an
 * iframe, so it may only come from a host listed here: never our own origin, never a host an
 * author types in. The frame gets `sandbox="allow-scripts"` and nothing else (no same-origin, no
 * forms, popups or top navigation), so a demo cannot read our cookies or move the reader away.
 *
 * To allow another demo host, add its exact hostname to DEMO_HOSTS. The post page CSP
 * (POST_PAGE_CSP in media-urls.ts) picks it up automatically.
 */

/** Exact hostnames (no wildcards, no ports) that may serve demos. Each must be another site. */
export const DEMO_HOSTS = ["codepen.io", "jsfiddle.net"] as const;

/** The `frame-src` sources the post page needs for DEMO_HOSTS. */
export const DEMO_FRAME_ORIGINS: readonly string[] = DEMO_HOSTS.map((h) => `https://${h}`);

/** The sandbox tokens a demo frame gets; scripts only, never together with allow-same-origin. */
export const DEMO_SANDBOX = "allow-scripts";

export const DEMO_ASPECTS = ["16:9", "4:3", "1:1", "3:4"] as const;
export type DemoAspect = (typeof DEMO_ASPECTS)[number];

const UNSAFE_CHARS = /[\s<>"'`\\]/;

/** An https URL on an allowlisted demo host, normalised; null for anything else. */
export function parseDemoUrl(raw: string, hosts: readonly string[] = DEMO_HOSTS): URL | null {
  const value = raw.trim();
  if (!value || value.length > 500 || UNSAFE_CHARS.test(value)) return null;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
  return hosts.includes(url.hostname.toLowerCase()) ? url : null;
}

/** Message for schema errors, so every surface names the same hosts. */
export const DEMO_URL_RULE = `Use an https:// URL on an allowed demo host: ${DEMO_HOSTS.join(", ")}.`;
