/**
 * Homepage H1 experiment (docs/experiments/homepage-h1.md), client side.
 *
 * The server always renders the control headline. A visitor is enrolled only when they have
 * accepted analytics cookies AND PostHog answers the `homepage-h1-test` flag with a known
 * variant within the timeout. Everything else (no consent, no flag, PostHog blocked, slow
 * network, JS off) keeps the control headline, so the flag doubling as a kill switch needs
 * no code change: delete or disable it in PostHog.
 *
 * Enrolled visitors get `data-h1-variant` on <html>; the PostHog and GTM click handlers read it
 * and add `h1_variant` to `hero_cta_clicked` / `app_cta_clicked`.
 */
export const H1_FLAG_KEY = "homepage-h1-test";
export const H1_VARIANTS = ["control", "category"] as const;
export type H1Variant = (typeof H1_VARIANTS)[number];

/** `dataset` key on <html> (attribute `data-h1-variant`) that carries the enrolled variant. */
export const H1_VARIANT_DATASET_KEY = "h1Variant";
/**
 * Starts the test. While false (the shipped state) the page carries no category headline, the
 * inline script never hides the headline and nobody waits for PostHog. Flip it and deploy only
 * after the run record in the experiment doc is complete; the PostHog flag stays the kill switch.
 */
export const H1_TEST_ENABLED = false;
/** Class on <html> that hides the headline (opacity, no layout change) while the flag loads. */
export const H1_PENDING_CLASS = "h1-test-pending";
/** `dataset` key on <html> with the `performance.now()` at which the inline script hid the headline. */
export const H1_PENDING_SINCE_DATASET_KEY = "h1PendingSince";
/**
 * Longest the headline stays hidden, counted from the moment the inline script hid it (not from
 * when this module runs). The stylesheet reveals control at the same deadline, so the script and
 * the CSS safety net never disagree about whether the visitor has already seen control.
 */
export const H1_RESOLVE_TIMEOUT_MS = 300;

/** The deadline (on the `performance.now()` clock) recorded by the inline script, or null if it never ran. */
export function h1Deadline(pendingSince: string | undefined): number | null {
  if (!pendingSince) return null;
  const start = Number(pendingSince);
  return Number.isFinite(start) ? start + H1_RESOLVE_TIMEOUT_MS : null;
}

/** A flag answer becomes a variant only when it is one we know; anything else is "not enrolled". */
export function parseH1Variant(value: unknown): H1Variant | null {
  return typeof value === "string" && (H1_VARIANTS as readonly string[]).includes(value) ? (value as H1Variant) : null;
}

/** Without consent nobody is enrolled, whatever the flag says. */
export function chooseH1Variant(consented: boolean, flagValue: unknown): H1Variant | null {
  return consented ? parseH1Variant(flagValue) : null;
}

type PosthogLike = {
  onFeatureFlags: (callback: () => void) => unknown;
  getFeatureFlag: (key: string) => unknown;
};
type ElementLike = { innerHTML: string };
type RootLike = {
  dataset: Record<string, string | undefined>;
  classList: { contains: (name: string) => boolean; remove: (name: string) => void };
};

export interface H1ExperimentDeps {
  root: RootLike;
  /** The page's single <h1>; null on pages without the experiment. */
  h1: ElementLike | null;
  /** Pre-rendered markup of the category headline (same pipeline as the control). */
  categoryHtml: string | null | undefined;
  consented: boolean;
  posthog: PosthogLike | undefined;
  setTimer?: (callback: () => void, ms: number) => unknown;
  /** Same clock as the inline script's timestamp. */
  now?: () => number;
}

/**
 * Settles the headline exactly once: either on the flag answer or at the deadline, whichever
 * comes first. The deadline runs from when the inline script hid the headline, so a module that
 * starts late gets only what is left of the budget. Once the deadline has passed, or the headline
 * is no longer hidden, the visitor has already seen control: they are neither swapped late nor
 * counted as exposed (`getFeatureFlag` is what records the exposure event, and it is only called
 * for visitors who can still see the variant).
 */
export function runHeroH1Experiment(deps: H1ExperimentDeps): void {
  const { root, h1, categoryHtml, consented, posthog } = deps;
  const now = deps.now ?? (() => performance.now());
  const reveal = () => root.classList.remove(H1_PENDING_CLASS);
  const deadline = h1Deadline(root.dataset[H1_PENDING_SINCE_DATASET_KEY]);
  const stillHidden = () => deadline !== null && root.classList.contains(H1_PENDING_CLASS) && now() < deadline;
  if (!h1 || !consented || !posthog || deadline === null || !stillHidden()) return reveal();

  let settled = false;
  const settle = (read: () => unknown) => {
    if (settled) return;
    settled = true;
    try {
      if (!stillHidden()) return;
      const variant = chooseH1Variant(consented, read());
      // Never tag a visitor "category" when there is no category text to show them.
      if (variant && (variant === "control" || categoryHtml)) {
        root.dataset[H1_VARIANT_DATASET_KEY] = variant;
        if (variant === "category" && categoryHtml) h1.innerHTML = categoryHtml;
      }
    } finally {
      reveal();
    }
  };

  (deps.setTimer ?? setTimeout)(() => settle(() => null), deadline - now());
  try {
    posthog.onFeatureFlags(() => settle(() => posthog.getFeatureFlag(H1_FLAG_KEY)));
  } catch {
    settle(() => null);
  }
}
