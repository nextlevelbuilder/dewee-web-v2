/** Behaviour for PageActions: clipboard, Markdown fetch, Gemini hand-off and Web Share. */
async function copy(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;opacity:0";
    document.body.append(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export function initPageActions() {
  document.querySelectorAll<HTMLElement>("[data-page-actions]").forEach((root) => {
    if (root.dataset.wired) return;
    root.dataset.wired = "1";
    const s = JSON.parse(root.dataset.strings || "{}") as { copied: string; failed: string; gemini: string };
    const toggle = root.querySelector<HTMLButtonElement>("[data-pa-toggle]")!;
    const menu = root.querySelector<HTMLElement>("[data-pa-menu]")!;
    const status = root.querySelector<HTMLElement>("[data-pa-status]")!;
    const label = root.querySelector<HTMLElement>("[data-pa-label]")!;
    const original = label.textContent || "";
    let timer = 0;

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

    toggle.addEventListener("click", () => setOpen(menu.hidden));
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
      if (action === "copy-md") {
        try {
          const res = await fetch(root.dataset.md!, { headers: { accept: "text/markdown" } });
          flash(res.ok && (await copy(await res.text())));
        } catch { flash(false); }
      } else if (action === "copy-url") {
        flash(await copy(root.dataset.url!));
        setOpen(false);
      } else if (action === "gemini") {
        // Gemini has no prefill parameter: copy the prompt, then let the link open the app.
        const ok = await copy(root.dataset.prompt!);
        flash(ok, ok ? s.gemini : undefined);
        setOpen(false);
      } else if (action === "share") {
        setOpen(false);
        if (navigator.share) {
          try { await navigator.share({ title: root.dataset.title, url: root.dataset.url }); } catch { /* dismissed */ }
        } else {
          flash(await copy(root.dataset.url!));
        }
      }
    });
  });
}
