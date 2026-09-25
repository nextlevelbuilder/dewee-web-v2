/** Behaviour for PageActions: clipboard, Markdown fetch, Gemini hand-off and Web Share. */

/** execCommand fallback for browsers without the async Clipboard API (or when it is denied). */
function legacyCopy(text: string): boolean {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.cssText = "position:fixed;inset-block-start:0;opacity:0";
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch {
    ok = false;
  }
  ta.remove();
  return ok;
}

async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return legacyCopy(text);
  }
}

/**
 * Copies text that is still being fetched. Safari only allows clipboard writes during the click,
 * so the pending text goes into a ClipboardItem synchronously; other browsers fall back to
 * awaiting the text and writing it.
 */
async function copyPending(text: Promise<string>): Promise<boolean> {
  if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
    try {
      const blob = text.then((t) => new Blob([t], { type: "text/plain" }));
      await navigator.clipboard.write([new ClipboardItem({ "text/plain": blob })]);
      return true;
    } catch {
      /* fall through: some browsers reject promise-valued items */
    }
  }
  try {
    return await copy(await text);
  } catch {
    return false;
  }
}

async function fetchMarkdown(href: string): Promise<string> {
  const res = await fetch(href, { headers: { accept: "text/markdown" } });
  if (!res.ok) throw new Error(`Markdown twin ${res.status}`);
  return res.text();
}

export function initPageActions() {
  document.querySelectorAll<HTMLElement>("[data-page-actions]").forEach((root) => {
    if (root.dataset.wired) return;
    const toggle = root.querySelector<HTMLButtonElement>("[data-pa-toggle]");
    const menu = root.querySelector<HTMLElement>("[data-pa-menu]");
    const status = root.querySelector<HTMLElement>("[data-pa-status]");
    const label = root.querySelector<HTMLElement>("[data-pa-label]");
    if (!toggle || !menu || !status || !label) return;
    root.dataset.wired = "1";

    let s: { copied: string; failed: string; gemini: string } = { copied: "Copied", failed: "Copy failed", gemini: "Copied" };
    try {
      s = { ...s, ...(JSON.parse(root.dataset.strings || "{}") as Partial<typeof s>) };
    } catch {
      /* keep the defaults */
    }
    const original = label.textContent || "";
    let timer = 0;
    let markdown: Promise<string> | null = null;
    const loadMarkdown = () => {
      markdown ??= fetchMarkdown(root.dataset.md || "").catch((err: unknown) => {
        markdown = null;
        throw err;
      });
      return markdown;
    };

    const flash = (ok: boolean, msg?: string) => {
      const text = msg ?? (ok ? s.copied : s.failed);
      status.textContent = text;
      label.textContent = text;
      root.toggleAttribute("data-done", ok);
      clearTimeout(timer);
      timer = window.setTimeout(() => { label.textContent = original; root.removeAttribute("data-done"); }, 2200);
    };
    const setOpen = (open: boolean) => {
      menu.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      if (open) menu.querySelector<HTMLElement>("[role=menuitem]")?.focus();
    };

    // Warm the Markdown twin when the pointer or focus arrives, so the copy is instant.
    const main = root.querySelector<HTMLElement>('[data-pa="copy-md"]');
    main?.addEventListener("pointerenter", () => { loadMarkdown().catch(() => undefined); }, { once: true });
    main?.addEventListener("focus", () => { loadMarkdown().catch(() => undefined); }, { once: true });

    toggle.addEventListener("click", () => setOpen(menu.hidden !== false));
    document.addEventListener("click", (e) => { if (!root.contains(e.target as Node)) setOpen(false); });
    root.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !menu.hidden) { setOpen(false); toggle.focus(); }
      if ((e.key === "ArrowDown" || e.key === "ArrowUp") && !menu.hidden) {
        const items = [...menu.querySelectorAll<HTMLElement>("[role=menuitem]")];
        const i = items.indexOf(document.activeElement as HTMLElement);
        items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
        e.preventDefault();
      }
    });

    root.addEventListener("click", async (e) => {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-pa]");
      if (!el) return;
      const action = el.dataset.pa;
      const url = root.dataset.url || location.href;
      if (action === "copy-md") {
        flash(await copyPending(loadMarkdown()));
      } else if (action === "copy-url") {
        flash(await copy(url));
        setOpen(false);
      } else if (action === "gemini") {
        // Gemini has no prefill parameter: copy the prompt (during the click), then the link opens the app.
        const ok = await copy(root.dataset.prompt || url);
        flash(ok, ok ? s.gemini : undefined);
        setOpen(false);
      } else if (action === "share") {
        setOpen(false);
        const data = { title: root.dataset.title, url };
        if (navigator.share && (!navigator.canShare || navigator.canShare(data))) {
          try {
            await navigator.share(data);
            return;
          } catch (err) {
            if ((err as DOMException)?.name === "AbortError") return;
          }
        }
        flash(await copy(url));
      }
    });
  });
}
