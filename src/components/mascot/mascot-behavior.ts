/**
 * Brings every [data-mascot] on the page to life:
 * - drop: falls onto the page once it scrolls into view, then idles
 * - interactive: eyes follow the pointer, a click squishes it and flashes a happy mood,
 *   and it dozes off after a quiet spell (wakes on any pointer/key activity)
 * Everything is skipped under prefers-reduced-motion; the static SVG stays as-is.
 */
const SLEEP_AFTER_MS = 28_000;
const REACTIONS = ["love", "wink", "surprised"] as const;

let pointerBound = false;
let sleepTimer: number | undefined;

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function setMood(el: HTMLElement, mood: string) {
  el.dataset.mood = mood;
}

function restoreMood(el: HTMLElement) {
  el.dataset.mood = el.dataset.baseMood || "happy";
}

function interactives(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>("[data-mascot][data-interactive]"));
}

function scheduleSleep() {
  window.clearTimeout(sleepTimer);
  sleepTimer = window.setTimeout(() => {
    for (const el of interactives()) {
      if (el.dataset.mood === el.dataset.baseMood) setMood(el, "sleepy");
    }
  }, SLEEP_AFTER_MS);
}

function wakeAll() {
  for (const el of interactives()) {
    if (el.dataset.mood === "sleepy") {
      restoreMood(el);
      el.classList.remove("is-hop");
      void el.offsetWidth;
      el.classList.add("is-hop");
    }
  }
  scheduleSleep();
}

function followPointer(e: PointerEvent) {
  for (const el of interactives()) {
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) continue;
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth / 2)));
    const dy = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight / 2)));
    el.style.setProperty("--look-x", `${(dx * 9).toFixed(2)}px`);
    el.style.setProperty("--look-y", `${(dy * 6).toFixed(2)}px`);
  }
}

function react(el: HTMLElement) {
  el.classList.remove("is-squish");
  void el.offsetWidth; // restart the animation
  el.classList.add("is-squish");
  const mood = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
  setMood(el, mood);
  window.setTimeout(() => restoreMood(el), 1400);
  scheduleSleep();
}

function drop(el: HTMLElement) {
  const run = () => {
    el.classList.add("is-dropping");
    window.setTimeout(() => {
      el.classList.remove("is-dropping");
      el.classList.add("is-landed");
    }, 1150);
  };
  if (!("IntersectionObserver" in window)) return run();
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((en) => en.isIntersecting)) {
        io.disconnect();
        window.setTimeout(run, 180);
      }
    },
    { threshold: 0.4 },
  );
  io.observe(el);
}

export function initMascots() {
  const all = Array.from(document.querySelectorAll<HTMLElement>("[data-mascot]"));
  if (!all.length) return;
  const still = reducedMotion();

  for (const el of all) {
    if (el.dataset.wired) continue;
    el.dataset.wired = "1";
    if (el.classList.contains("mascot--drop")) {
      if (still) el.classList.add("is-landed");
      else drop(el);
    }
    if (el.dataset.interactive && !still) {
      el.addEventListener("click", () => react(el));
    }
  }

  if (!still && !pointerBound && interactives().length) {
    pointerBound = true;
    let frame = 0;
    window.addEventListener(
      "pointermove",
      (e) => {
        if (frame) return;
        frame = requestAnimationFrame(() => {
          frame = 0;
          followPointer(e);
        });
        if (interactives().some((m) => m.dataset.mood === "sleepy")) wakeAll();
        else scheduleSleep();
      },
      { passive: true },
    );
    window.addEventListener("keydown", wakeAll, { passive: true });
    window.addEventListener("scroll", () => scheduleSleep(), { passive: true });
    scheduleSleep();
  }
}
