/**
 * Sign-out: POST only, same-origin with the session's CSRF token, so a third-party page cannot
 * log an admin out. The session row is deleted and the cookie cleared.
 */
import type { APIRoute } from "astro";
import { platformEnv } from "~/lib/server/api/platform-env";
import { audit } from "~/lib/server/auth/audit-log";
import { clearSessionCookie, csrfValid, destroySession, getSession, SESSION_COOKIE } from "~/lib/server/auth/session-store";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const env = platformEnv();
  const token = cookies.get(SESSION_COOKIE)?.value;
  const session = await getSession(env.DB, token);
  if (session) {
    let submitted: FormDataEntryValue | null = null;
    try {
      submitted = (await request.formData()).get("csrf");
    } catch {
      submitted = null;
    }
    if (!(await csrfValid(request, session.token, submitted))) {
      return new Response("Invalid sign-out request. Reload the admin and try again.", { status: 403, headers: { "cache-control": "no-store" } });
    }
    await destroySession(env.DB, session.token);
    await audit(env.DB, session.email, "auth.sign_out", null);
  }
  clearSessionCookie(cookies);
  return redirect("/admin/login", 303);
};

export const GET: APIRoute = ({ redirect }) => redirect("/admin", 303);
