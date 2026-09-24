/**
 * Small browser helpers for /admin: copy-to-clipboard buttons, confirm-before-submit forms and a
 * JSON fetch wrapper for the REST API that sends the session's CSRF token.
 */

/** `<button data-copy-target="input-id">` copies that input's value and says so. */
export function bindCopyButtons(root: ParentNode = document): void {
  root.querySelectorAll<HTMLButtonElement>("button[data-copy-target]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const input = document.getElementById(btn.dataset.copyTarget ?? "") as HTMLInputElement | null;
      if (!input) return;
      const label = btn.lastChild;
      const original = label?.textContent ?? "";
      try {
        await navigator.clipboard.writeText(input.value);
        if (label) label.textContent = "Copied";
      } catch {
        input.select();
        if (label) label.textContent = "Press Ctrl/⌘ + C";
      }
      window.setTimeout(() => {
        if (label) label.textContent = original;
      }, 2000);
    });
  });
}

/** `<form data-confirm="Are you sure?">` asks before submitting. */
export function bindConfirmForms(root: ParentNode = document): void {
  root.querySelectorAll<HTMLFormElement>("form[data-confirm]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      if (!window.confirm(form.dataset.confirm ?? "")) event.preventDefault();
    });
  });
}

export function csrfToken(): string {
  return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? "";
}

export type ApiResult<T> = { ok: true; status: number; data: T; etag: string | null } | { ok: false; status: number; code: string; message: string; details?: unknown };

/**
 * Calls /api/v1 with the admin session cookie. Every request is JSON with the CSRF header, which
 * the API requires for session-authenticated writes (and Astro's origin check requires for POSTs).
 */
export async function api<T>(method: string, path: string, body?: unknown, headers: Record<string, string> = {}): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(`/api/v1${path}`, {
      method,
      credentials: "same-origin",
      headers: { "content-type": "application/json", accept: "application/json", "x-csrf-token": csrfToken(), ...headers },
      body: body === undefined ? (method === "GET" ? undefined : "{}") : JSON.stringify(body),
    });
  } catch (err) {
    return { ok: false, status: 0, code: "network", message: err instanceof Error ? err.message : "Network error" };
  }
  const payload: unknown = await res.json().catch(() => null);
  if (res.ok) return { ok: true, status: res.status, data: payload as T, etag: res.headers.get("etag") };
  const error = (payload as { error?: { code?: string; message?: string; details?: unknown } } | null)?.error;
  return { ok: false, status: res.status, code: error?.code ?? "error", message: error?.message ?? `HTTP ${res.status}`, details: error?.details };
}
