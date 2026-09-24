/**
 * Progressive enhancement for LeadForm (the form already works without JavaScript):
 *  - pre-selects `<select data-query="plan">` from `?plan=…` when the value is a real option;
 *  - posts JSON to /api/leads and shows the success or error panel in place;
 *  - explains a no-JS redirect error (`?error=<code>`) with its specific message.
 */
type LeadResponse = { ok?: boolean; error?: string };

export function initLeadForms() {
  document.querySelectorAll<HTMLElement>("[data-lead-form]").forEach(wire);
}

function wire(root: HTMLElement) {
  const form = root.querySelector<HTMLFormElement>("form");
  if (!form || root.dataset.wired) return;
  root.dataset.wired = "1";

  const messages = parseMessages(root.dataset.messages);
  const status = root.querySelector<HTMLElement>("[data-status]");
  const errorPanel = root.querySelector<HTMLElement>("[data-error-panel]");
  const errorText = root.querySelector<HTMLElement>("[data-error-text]");
  const donePanel = root.querySelector<HTMLElement>("[data-done-panel]");
  const submitLabel = form.querySelector<HTMLElement>("[data-submit-label]");
  const idleLabel = submitLabel?.textContent ?? "";
  const params = new URLSearchParams(location.search);

  form.querySelectorAll("select[data-query]").forEach((select) => {
    if (!(select instanceof HTMLSelectElement)) return;
    const wanted = params.get(select.dataset.query ?? "");
    if (wanted && Array.from(select.options).some((o) => o.value === wanted)) select.value = wanted;
  });

  const redirectError = params.get("error");
  if (redirectError && location.hash === `#${form.id}-error` && errorText) {
    errorText.textContent = messages[redirectError] ?? messages.server_error ?? errorText.textContent;
  }

  const setBusy = (busy: boolean) => {
    if (busy) root.dataset.busy = "";
    else delete root.dataset.busy;
    form.setAttribute("aria-busy", String(busy));
    if (submitLabel) submitLabel.textContent = busy ? (root.dataset.busyLabel ?? idleLabel) : idleLabel;
  };

  const showError = (code: string) => {
    const text = messages[code] ?? messages.server_error ?? "";
    if (errorText) errorText.textContent = text;
    root.dataset.state = "error";
    if (status) {
      status.dataset.kind = "error";
      status.textContent = text;
    }
    errorPanel?.scrollIntoView({ block: "nearest", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (root.dataset.busy !== undefined) return;
    if (!form.reportValidity()) return;

    const body: Record<string, string> = {};
    new FormData(form).forEach((value, key) => {
      if (typeof value === "string") body[key] = value;
    });

    delete root.dataset.state;
    if (status) status.textContent = "";
    setBusy(true);
    try {
      const res = await fetch(form.action, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify(body),
        credentials: "same-origin",
      });
      const data = (await res.json().catch(() => ({}))) as LeadResponse;
      if (res.ok && data.ok) {
        form.reset();
        root.dataset.state = "done";
        donePanel?.focus();
        return;
      }
      showError(typeof data.error === "string" ? data.error : "server_error");
    } catch {
      showError("network");
    } finally {
      setBusy(false);
    }
  });

  // "Send another": return to a fresh form without a reload when the page did not navigate.
  root.querySelector<HTMLAnchorElement>("[data-again]")?.addEventListener("click", (event) => {
    if (root.dataset.state !== "done" || location.hash === `#${form.id}-done`) return;
    event.preventDefault();
    delete root.dataset.state;
    form.querySelector<HTMLElement>("input:not([type=hidden]):not([tabindex='-1']), select, textarea")?.focus();
  });
}

function parseMessages(raw: string | undefined): Record<string, string> {
  try {
    const value: unknown = JSON.parse(raw ?? "{}");
    return value && typeof value === "object" ? (value as Record<string, string>) : {};
  } catch {
    return {};
  }
}
