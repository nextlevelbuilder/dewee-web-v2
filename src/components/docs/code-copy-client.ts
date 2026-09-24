/**
 * Enables the copy buttons that render-doc-html.ts puts on code blocks. The buttons ship
 * `hidden`, so readers without JavaScript never see a button that does nothing.
 */
export function initCodeCopy(labels: { copy: string; copied: string; failed: string }) {
  document.querySelectorAll<HTMLButtonElement>("[data-copy-code]").forEach((button) => {
    const block = button.closest(".code-block");
    const code = block?.querySelector("pre code") ?? block?.querySelector("pre");
    const label = button.querySelector("span");
    if (!code || !label) return;
    button.hidden = false;
    label.setAttribute("aria-live", "polite");
    let timer = 0;
    button.addEventListener("click", async () => {
      window.clearTimeout(timer);
      try {
        await navigator.clipboard.writeText(code.textContent ?? "");
        label.textContent = labels.copied;
        button.dataset.state = "copied";
      } catch {
        label.textContent = labels.failed;
        button.dataset.state = "failed";
      }
      timer = window.setTimeout(() => {
        label.textContent = labels.copy;
        delete button.dataset.state;
      }, 1800);
    });
  });
}
