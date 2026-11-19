import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  H1_FLAG_KEY,
  H1_PENDING_CLASS,
  H1_PENDING_SINCE_DATASET_KEY,
  H1_RESOLVE_TIMEOUT_MS,
  H1_TEST_ENABLED,
  H1_VARIANT_DATASET_KEY,
  chooseH1Variant,
  h1Deadline,
  parseH1Variant,
  runHeroH1Experiment,
  type H1ExperimentDeps,
} from "../src/lib/hero-h1-experiment";
import { HOME, HOME_H1_CATEGORY } from "../src/content/pages/home";

const CATEGORY_HTML = '<span class="hero__line">category</span>';
const CONTROL_HTML = "control";

const HIDDEN_AT = 1000;

/** A root whose headline the inline script hid at `HIDDEN_AT` (unless `hiddenAt` is null). */
function makeRoot(hiddenAt: number | null = HIDDEN_AT) {
  const classes = new Set(hiddenAt === null ? [] : [H1_PENDING_CLASS]);
  const dataset: Record<string, string | undefined> = hiddenAt === null ? {} : { [H1_PENDING_SINCE_DATASET_KEY]: String(hiddenAt) };
  return {
    dataset,
    classList: { removed: [] as string[], contains: (n: string) => classes.has(n), remove(n: string) { classes.delete(n); this.removed.push(n); } },
  };
}

/**
 * A PostHog stand-in: `answer` is what the flag returns; `fire()` plays the "flags loaded" callback.
 * `clock` is the shared `performance.now()`; `startAt` is when the module runs (default: right away).
 */
function setup(over: Partial<H1ExperimentDeps> & { answer?: unknown; noPosthog?: boolean; startAt?: number } = {}) {
  const root = makeRoot();
  const h1 = { innerHTML: CONTROL_HTML };
  const calls: string[] = [];
  const clock = { t: over.startAt ?? HIDDEN_AT };
  let loaded: (() => void) | undefined;
  let timer: (() => void) | undefined;
  let timerMs: number | undefined;
  const posthog = over.noPosthog ? undefined : {
    onFeatureFlags: (cb: () => void) => { loaded = cb; },
    getFeatureFlag: (key: string) => { calls.push(key); return over.answer; },
  };
  runHeroH1Experiment({
    root, h1, categoryHtml: CATEGORY_HTML, consented: true, posthog,
    setTimer: (cb, ms) => { timer = cb; timerMs = ms; },
    now: () => clock.t,
    ...over,
  });
  return {
    root, h1, calls, clock, timerMs: () => timerMs,
    fire: (at?: number) => { if (at !== undefined) clock.t = at; loaded?.(); },
    timeout: () => { clock.t = HIDDEN_AT + H1_RESOLVE_TIMEOUT_MS; timer?.(); },
  };
}

describe("experiment switch", () => {
  it("ships off, so nobody is hidden or waits for PostHog", () => {
    expect(H1_TEST_ENABLED).toBe(false);
  });

  it("reads the deadline the inline script recorded", () => {
    expect(h1Deadline(String(HIDDEN_AT))).toBe(HIDDEN_AT + H1_RESOLVE_TIMEOUT_MS);
    for (const v of [undefined, "", "soon"]) expect(h1Deadline(v)).toBeNull();
  });
});

describe("variant selection", () => {
  it("accepts only the known variants", () => {
    expect(parseH1Variant("control")).toBe("control");
    expect(parseH1Variant("category")).toBe("category");
    for (const v of [undefined, null, false, true, "", "Category", "other"]) expect(parseH1Variant(v)).toBeNull();
  });

  it("never enrolls without consent", () => {
    expect(chooseH1Variant(false, "category")).toBeNull();
    expect(chooseH1Variant(true, "category")).toBe("category");
  });
});

describe("runHeroH1Experiment", () => {
  it("swaps the headline and tags the visitor when the flag says category", () => {
    const t = setup({ answer: "category" });
    t.fire();
    expect(t.calls).toEqual([H1_FLAG_KEY]);
    expect(t.h1.innerHTML).toBe(CATEGORY_HTML);
    expect(t.root.dataset[H1_VARIANT_DATASET_KEY]).toBe("category");
    expect(t.root.classList.removed).toContain(H1_PENDING_CLASS);
  });

  it("tags control visitors without touching the headline", () => {
    const t = setup({ answer: "control" });
    t.fire();
    expect(t.h1.innerHTML).toBe(CONTROL_HTML);
    expect(t.root.dataset[H1_VARIANT_DATASET_KEY]).toBe("control");
  });

  it.each([undefined, false, "unknown"])("falls back to untagged control when the flag answers %s (kill switch)", (answer) => {
    const t = setup({ answer });
    t.fire();
    expect(t.h1.innerHTML).toBe(CONTROL_HTML);
    expect(t.root.dataset[H1_VARIANT_DATASET_KEY]).toBeUndefined();
    expect(t.root.classList.removed).toContain(H1_PENDING_CLASS);
  });

  it("does nothing, and does not read the flag, without consent", () => {
    const t = setup({ answer: "category", consented: false });
    t.fire();
    expect(t.calls).toEqual([]);
    expect(t.h1.innerHTML).toBe(CONTROL_HTML);
    expect(t.root.dataset[H1_VARIANT_DATASET_KEY]).toBeUndefined();
    expect(t.root.classList.removed).toContain(H1_PENDING_CLASS);
  });

  it("reveals control straight away when PostHog is missing or blocked", () => {
    const t = setup({ noPosthog: true });
    expect(t.h1.innerHTML).toBe(CONTROL_HTML);
    expect(t.root.classList.removed).toContain(H1_PENDING_CLASS);
  });

  it("waits for the full budget when the module starts as soon as the headline is hidden", () => {
    const t = setup({ answer: "category" });
    expect(t.timerMs()).toBe(H1_RESOLVE_TIMEOUT_MS);
  });

  it("gives a late module only the rest of the budget, and still swaps inside it", () => {
    const t = setup({ answer: "category", startAt: HIDDEN_AT + 200 });
    expect(t.timerMs()).toBe(H1_RESOLVE_TIMEOUT_MS - 200);
    t.fire(HIDDEN_AT + 250);
    expect(t.calls).toEqual([H1_FLAG_KEY]);
    expect(t.h1.innerHTML).toBe(CATEGORY_HTML);
  });

  it("settles to control without reading the flag when the module starts after the deadline", () => {
    const t = setup({ answer: "category", startAt: HIDDEN_AT + H1_RESOLVE_TIMEOUT_MS + 200 });
    t.fire();
    expect(t.timerMs()).toBeUndefined();
    expect(t.calls).toEqual([]);
    expect(t.h1.innerHTML).toBe(CONTROL_HTML);
    expect(t.root.dataset[H1_VARIANT_DATASET_KEY]).toBeUndefined();
    expect(t.root.classList.removed).toContain(H1_PENDING_CLASS);
  });

  it("does not swap or count an answer that lands after the deadline, even before the timer fires", () => {
    const t = setup({ answer: "category", startAt: HIDDEN_AT + 200 });
    t.fire(HIDDEN_AT + H1_RESOLVE_TIMEOUT_MS + 50);
    expect(t.calls).toEqual([]);
    expect(t.h1.innerHTML).toBe(CONTROL_HTML);
    expect(t.root.dataset[H1_VARIANT_DATASET_KEY]).toBeUndefined();
  });

  it("does not enroll a visitor whose headline was never hidden", () => {
    const root = makeRoot(null);
    const h1 = { innerHTML: CONTROL_HTML };
    const calls: string[] = [];
    runHeroH1Experiment({
      root, h1, categoryHtml: CATEGORY_HTML, consented: true,
      posthog: { onFeatureFlags: (cb) => { cb(); }, getFeatureFlag: (k) => { calls.push(k); return "category"; } },
      setTimer: () => {}, now: () => HIDDEN_AT,
    });
    expect(calls).toEqual([]);
    expect(h1.innerHTML).toBe(CONTROL_HTML);
  });

  it("reveals control on timeout and ignores a late answer (no late swap, no exposure)", () => {
    const t = setup({ answer: "category" });
    t.timeout();
    t.fire();
    expect(t.calls).toEqual([]);
    expect(t.h1.innerHTML).toBe(CONTROL_HTML);
    expect(t.root.dataset[H1_VARIANT_DATASET_KEY]).toBeUndefined();
    expect(t.root.classList.removed).toContain(H1_PENDING_CLASS);
  });

  it("settles only once", () => {
    const t = setup({ answer: "category" });
    t.fire();
    t.fire();
    t.timeout();
    expect(t.calls).toEqual([H1_FLAG_KEY]);
  });

  it("does not tag category when there is no category text", () => {
    const t = setup({ answer: "category", categoryHtml: undefined });
    t.fire();
    expect(t.h1.innerHTML).toBe(CONTROL_HTML);
    expect(t.root.dataset[H1_VARIANT_DATASET_KEY]).toBeUndefined();
  });

  it("falls back to control when PostHog throws", () => {
    const root = makeRoot();
    const h1 = { innerHTML: CONTROL_HTML };
    runHeroH1Experiment({
      root, h1, categoryHtml: CATEGORY_HTML, consented: true,
      posthog: { onFeatureFlags: () => { throw new Error("boom"); }, getFeatureFlag: () => "category" },
      setTimer: () => {}, now: () => HIDDEN_AT,
    });
    expect(h1.innerHTML).toBe(CONTROL_HTML);
    expect(root.dataset[H1_VARIANT_DATASET_KEY]).toBeUndefined();
  });
});

describe("category copy", () => {
  it("exists in both locales as one sentence and differs from control", () => {
    for (const locale of ["en", "vi"] as const) {
      const text = HOME_H1_CATEGORY[locale];
      expect(text.trim().length).toBeGreaterThan(0);
      expect(text.match(/[.!?]/g)).toHaveLength(1);
      expect(text).not.toBe(HOME[locale].hero.title);
    }
  });
});

// The click handlers are inline scripts, so they cannot be imported; pin the contract instead:
// both read the shared dataset key and attach `h1_variant` to exactly the hero and app events.
describe("analytics event contract", () => {
  const read = (p: string) => readFileSync(new URL(`../src/components/layout/${p}`, import.meta.url), "utf8");

  it("PostHog adds h1_variant to hero_cta_clicked and app_cta_clicked only", () => {
    const src = read("PosthogAnalytics.astro");
    expect(src).toContain("H1_VARIANT_DATASET_KEY");
    expect(src).toMatch(/hero_cta_clicked", Object\.assign\(\{ cta: heroCta \}, ctaProps\)/);
    expect(src).toMatch(/app_cta_clicked", ctaProps/);
    expect(src).toMatch(/h1_variant: h1Variant/);
    expect(src).toMatch(/pricing_plan_cta_clicked", Object\.assign\(\{ plan: link\.dataset\.trackPlan \}, props\)/);
  });

  it("GTM adds h1_variant to both dataLayer events", () => {
    const src = read("GoogleTagManager.astro");
    expect(src).toContain("H1_VARIANT_DATASET_KEY");
    expect(src).toMatch(/heroEvent\.h1_variant = h1Variant/);
    expect(src).toMatch(/appEvent\.h1_variant = h1Variant/);
  });
});
