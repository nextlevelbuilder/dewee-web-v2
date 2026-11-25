# Experiment: benefit-led vs category-led homepage H1

Pre-registration. Everything below is fixed before the test starts; change it only by adding a
dated amendment at the bottom, never by editing the plan after data exists.

**Status: not running.** The code is in place and inert: `H1_TEST_ENABLED` in
`src/lib/hero-h1-experiment.ts` is `false` and the flag does not exist in PostHog, so every
visitor sees the control headline and nobody's headline is held back while PostHog loads. Nothing here claims a result, and no uplift may be
claimed until the test has run to its stopping rule (see "No claim without data").

## Hypothesis

A headline that names the category ("where humans and AI agents work as one team") tells a new
visitor what dewee is faster than the benefit headline, so a larger share of homepage visitors
click a hero call to action.

| Variant | EN | VI |
|---|---|---|
| `control` (today) | Your team just got new *teammates*. | Đội ngũ của bạn vừa có thêm *đồng đội*. |
| `category` | Where humans and AI agents work as *one team*. | Nơi con người và AI agent làm việc như *một đội*. |

The eyebrow, lede, buttons and chat card do not change. Copy lives in
`src/content/pages/home-en.ts`, `home-vi.ts` (control) and `home-h1-test.ts` (category).

## Who is in the test

Only visitors who accepted analytics cookies ("Accept" on the cookie notice) and whose PostHog
flag answer arrives within 300 ms of the headline being hidden (the clock starts while the page
is still parsing, not when the script loads). Everyone else, including JS off, PostHog blocked, "essential
only" and slow responses, sees control and is not counted. Results therefore describe
consenting visitors who load PostHog quickly; they are not a claim about all traffic. The
exclusions happen before the flag answer is known, so they hit both arms equally.

Locales: **both EN (`/`) and VI (`/vi`)** are in the test, with the same flag and split. The
VI primary button opens `/install`, not app.dewee.sh (VI is Self-install and On-Premises only),
so `app_cta_clicked` from the hero can only happen in EN; in VI it measures other links to the
app and is reported but not interpreted.

## Metrics

Unit of analysis: a distinct visitor (PostHog `distinct_id`), not a pageview.

- **Exposure (denominator):** distinct visitors with a `$feature_flag_called` event for
  `homepage-h1-test` whose response is `control` or `category`, on the homepage. This event is
  sent only after the headline is settled, so it counts visitors who saw that variant.
- **Primary:** share of exposed visitors with at least one `hero_cta_clicked`, by variant.
- **Secondary:** share of exposed visitors with at least one `app_cta_clicked`, by variant.
- Both click events carry `h1_variant` (`control` or `category`), also on the GTM `dataLayer`
  events of the same names. The property is absent for visitors who are not enrolled. It holds
  no personal data. Cross-check the event property against `$feature/homepage-h1-test`.

Analysis: two-sided two-proportion z-test, alpha 0.05, run once at the stopping point. The
decision uses the **pooled** (EN + VI) primary metric. EN and VI are also reported separately.
A per-locale result counts only if that locale alone reached the sample size below; otherwise
it is described as underpowered and used for hypotheses, not decisions.

## Sample size

Per arm, two proportions (alpha 0.05 two-sided, power 0.8):

```
n = ( z_a/2 * sqrt(2 * p̄ * (1 - p̄)) + z_b * sqrt(p1(1 - p1) + p2(1 - p2)) )^2 / (p2 - p1)^2

p1 = baseline rate, p2 = p1 * (1 + MDE), p̄ = (p1 + p2) / 2
z_a/2 = 1.96 (alpha 0.05 two-sided), z_b = 0.84 (power 0.8), MDE = 20% relative
```

Worked examples (visitors per arm; total is twice that):

| Baseline p1 | p2 at +20% | n per arm |
|---|---|---|
| 3% | 3.6% | 13,914 |
| **5% (placeholder)** | 6.0% | **8,158** |
| 8% | 9.6% | 4,921 |
| 10% | 12.0% | 3,841 |

**The 5% baseline is an assumption, not a measurement.** Before starting, replace it with the
real rate: in PostHog, over the 4 full weeks before the start date, take distinct homepage
visitors with at least one `hero_cta_clicked` divided by distinct homepage `$pageview` visitors
(restrict to consenting visitors if the data allows; otherwise note the difference). Plug that
into the formula, record the result in the table below, and use it as the target. If the
required n cannot be reached in 8 weeks at the observed traffic, do not start: either accept a
larger MDE (write it down first) or wait for more traffic. The secondary metric is not powered
separately; it is reported with its interval.

## Stopping rule

- **Minimum duration:** 14 days, which covers two full weekly cycles. Start at 00:00 UTC on a
  Monday so the run ends on whole weeks.
- **No peeking:** nobody looks at the primary metric or its p-value before the stopping point.
  Health checks (guardrails below) are allowed and do not use outcome data.
- **Stop** at the first whole-week boundary where both conditions hold: at least 14 days have
  passed and each arm has reached n exposed visitors. Hard cap: **8 weeks** (56 days). If the cap
  arrives first, stop and report "not enough data"; that is not evidence of no effect.
- **Guardrails** (any one invalidates or stops the run):
  - Sample ratio mismatch: arms should be 50/50; a chi-square test with p < 0.001 means the
    assignment or the swap is broken. Stop, fix, restart (new run, counters reset).
  - The headline is empty, wrapped badly or shifts the layout in a real browser at 375, 768 and
    1440 px in EN and VI: switch the flag off at once.
  - `app_cta_clicked` per exposed visitor is significantly lower for `category` at the stopping
    point (one-sided, alpha 0.05): do not ship `category`, even if the primary metric is up.
- **Decision:** ship `category` only if the pooled primary metric is significantly higher and no
  guardrail failed. Otherwise keep control.

## Run record (fill in before starting)

| Field | Value |
|---|---|
| Baseline p1 (4 weeks before start, source query) | |
| Required n per arm (formula above) | |
| Start (Monday, 00:00 UTC) | |
| Earliest stop (start + 14 days) / hard stop (start + 56 days) | |
| Flag created by / PostHog link | |
| Result | not run |

## Running it

The code reads one PostHog multivariate feature flag, key `homepage-h1-test`, variants
`control` and `category`.

1. Complete the run record, then create the flag in PostHog: variants `control` 50% and
   `category` 50%, release condition 100% of users. (Creating the flag is deliberately not part
   of the code change.) Then set `H1_TEST_ENABLED = true` in `src/lib/hero-h1-experiment.ts`,
   update the "ships off" assertion in `tests/hero-h1-experiment.test.ts` in the same change, and
   deploy. Until that deploy the homepage carries no category text and never hides the headline.
2. **Kill switch:** disable or delete the flag. A missing, disabled or unknown answer renders
   control with no deploy. The same happens without consent, with JS off, or when PostHog is
   blocked or slow. Consented visitors still wait for PostHog's (empty) answer, at most 300 ms,
   until `H1_TEST_ENABLED` goes back to `false` in the next deploy.
3. How it behaves: the server always renders control (also what search engines, the `.md` twin
   and social cards see). For consented visitors an inline script hides the headline (same box)
   while the page parses and records the time. From then on there is one deadline of 300 ms,
   shared by the script and a stylesheet rule that starts revealing control at that deadline
   even if the script fails. The script, however late it loads, only swaps or calls
   `getFeatureFlag` (the exposure event) while the headline is still hidden and the deadline has
   not passed; otherwise the visitor stays on control and is not counted, so nobody sees a late
   swap. A `category` answer swaps only the text, in `src/lib/hero-h1-experiment.ts`.
   `category` runs one line longer than control, so the swap moves the content below the
   headline down by one line while the headline is still hidden. No space is reserved for it:
   reserving it would also add an empty line for the control arm.
4. After the run, remove the experiment code and keep the winning headline as the normal
   `hero.title`.

## No claim without data

Until the test has run to its stopping rule, nothing in code, copy, docs, decks or messages may
say that either headline performs better. Report the observed rates, the difference with a
confidence interval and the sample size; if the stopping rule ended without a significant
result, say so plainly.
