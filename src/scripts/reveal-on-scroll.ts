/**
 * Adds `.is-in` to `[data-reveal]` elements (and `.scribble` underlines) as they enter the viewport.
 * Content is visible without JS; the hidden start state only applies under `html.js`.
 * Children of `[data-reveal-group]` get a stagger index via `--reveal-i`.
 */
export function initReveal() {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.querySelectorAll<HTMLElement>("[data-reveal-group]").forEach((group) => {
    group.querySelectorAll<HTMLElement>(":scope > [data-reveal]").forEach((el, i) => el.style.setProperty("--reveal-i", String(i)));
  });
  const targets = document.querySelectorAll<HTMLElement>("[data-reveal], .scribble");
  if (reduce || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-in"));
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("is-in");
        io.unobserve(e.target);
      }
    },
    // A ratio threshold never fires for blocks taller than the viewport (a long changelog), so any
    // overlap past the bottom margin counts.
    { rootMargin: "0px 0px -8% 0px", threshold: 0 },
  );
  targets.forEach((el) => io.observe(el));
  // Safety net: never leave content hidden if the observer misses something (e.g. print, zoom).
  window.addEventListener("beforeprint", () => targets.forEach((el) => el.classList.add("is-in")));
}
