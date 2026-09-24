/**
 * Server helpers shared by every /admin page: the sign-in gate, private response headers, the
 * session-bound CSRF token and form parsing that rejects cross-site or stale submissions.
 */
import type { AstroGlobal } from "astro";
import { adminSession } from "~/lib/server/auth/request-auth";
import { csrfTokenFor, csrfValid, type AdminSession } from "~/lib/server/auth/session-store";

export type AdminContext = { session: AdminSession; csrf: string };

/** Admin responses are private, never cached and never indexed. */
export function privateHeaders(Astro: AstroGlobal): void {
  Astro.response.headers.set("cache-control", "no-store");
  Astro.response.headers.set("x-robots-tag", "noindex, nofollow");
  Astro.response.headers.set("referrer-policy", "same-origin");
}

/** Client IP as seen by Cloudflare; a constant when unavailable so rate limits still apply. */
export function clientIp(Astro: Pick<AstroGlobal, "request" | "clientAddress">): string {
  const header = Astro.request.headers.get("cf-connecting-ip");
  if (header) return header;
  try {
    return Astro.clientAddress || "unknown";
  } catch {
    return "unknown";
  }
}

/** Only same-site, path-only `next` targets inside /admin are honoured after sign-in. */
export function safeNext(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith("/admin") || raw.startsWith("//") || raw.includes("\\")) return "/admin";
  return raw;
}

/** The signed-in super admin, or a redirect to the sign-in page (returned for the page to send). */
export async function requireAdmin(Astro: AstroGlobal): Promise<AdminContext | Response> {
  privateHeaders(Astro);
  const session = await adminSession({ request: Astro.request, cookies: Astro.cookies, locals: Astro.locals, clientAddress: clientIp(Astro) });
  if (!session) {
    const next = safeNext(Astro.url.pathname + Astro.url.search);
    return Astro.redirect(`/admin/login?next=${encodeURIComponent(next)}`, 303);
  }
  return { session, csrf: await csrfTokenFor(session.token) };
}

/**
 * Parses a POSTed admin form and verifies Origin + the hidden `csrf` field. Returns null for
 * anything that is not a valid same-origin form submission from this session.
 */
export async function adminForm(Astro: AstroGlobal, session: AdminSession): Promise<FormData | null> {
  if (Astro.request.method !== "POST") return null;
  let form: FormData;
  try {
    form = await Astro.request.formData();
  } catch {
    return null;
  }
  return (await csrfValid(Astro.request, session.token, form.get("csrf"))) ? form : null;
}

/** A trimmed string field, or "" when missing or not a string. */
export function field(form: FormData, name: string): string {
  const v = form.get(name);
  return typeof v === "string" ? v.trim() : "";
}
