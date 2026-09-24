# dewee.sh — Design system

> **"Vở ô ly · mực tím"**: a Vietnamese school notebook written in purple ink.
> The dark theme is **"bảng đen"**, a blackboard with chalk marginalia.

This file is the contract for anyone, human or agent, who adds a page or block.
Tokens live in `src/styles/tokens.css`, utilities in `src/styles/global.css`, and blocks in
`src/components/blocks/`. If a value you need is not a token, change the design, not the scale.

## 1. Why a notebook

dewee's mascot is a drop of ink, or dew. Its story is a builder's notebook: GoClaw was the
rough draft and dewee is the fair copy. The promise to customers is the one every
Vietnamese student knows: *we did the homework, so you don't have to.*

The notebook lets the site show the care behind the product without saying "we care":

- **Ô-ly grid paper** behind heroes. It is structure you can see.
- **The pink margin rule** down the left of wide screens. It is the teacher's margin, where corrections go.
- **Purple ink** for emphasis. Italic serif words and hand-drawn underlines that write themselves.
- **Red pen** only for grades and ticks: the "10" circle, the signature, the stamp. It is praise, never errors.
- **Handwritten notes** (Playwrite VN) in the margins. Short, warm asides, at most one per section.

## 2. Brief (fixed)

```text
Register:  Brand
Scene:     Founders, CTOs and ops leads in SEA companies evaluating an AI-agent platform;
           laptop in an office by day, phone in a Grab at night; skeptical and busy,
           they want proof and warmth, not hype.
Direction: Vở ô ly · mực tím (light) / bảng đen (dark)
Color:     Committed: iris owns the brand. Paper, ink, iris accent, rose margin, red pen.
Type:      Newsreader (display serif) + Be Vietnam Pro (body) + Playwrite VN (hand) + JetBrains Mono
Signature: The ink-drop mascot living in the margin, plus the margin rule and ô-ly grid
Dials:     variance 7 · motion 6 · density 3
```

## 3. Voice

| | English (default) | Tiếng Việt |
|---|---|---|
| We / you | we / you | **chúng tôi / bạn** in body copy; **tụi mình** only in handwritten notes |
| Sentences | Short. Concrete. One idea each. | Natural Vietnamese, not a translation; keep technical terms in English (agent, prompt, tenant) |
| Humour | Dry, warm, one wink per section | Playful but respectful, with school and office references |
| Numbers | Only verified facts (see `src/content/site.ts` comments) | Vietnamese number format (637.225) |

**Never:** invent metrics, testimonials, customer logos or features; say "revolutionary",
"seamless" or "unlock"; use exclamation marks in headings; use emoji in UI copy.

**Always:** say what the agent *does* ("drafts the quote, you approve it"); name the human
in the loop; end sections with a next step.

**Pricing rule:** the VI locale shows **On-Premises only** (`plansFor("vi")`). EN shows SaaS, Dedicated
(TOSE) and On-Premises. Prices live only in `src/content/plans.ts`.

## 4. Tokens

| Group | Tokens | Notes |
|---|---|---|
| Paper | `--paper` `--paper-2` `--paper-3` `--surface` `--surface-hover` | page, band, deep band, cards |
| Ink | `--ink` `--ink-2` `--ink-3` `--ink-inverse` | text 100 / 80 / 60 %; `--ink-3` is the minimum for text |
| Rules | `--rule` `--rule-strong` `--grid-fine` `--grid-bold` `--margin-rule` | hairlines and grid |
| Accent | `--accent` `--accent-ink` `--accent-soft` `--accent-contrast` | iris. Use `--accent-ink` for text on paper |
| Marks | `--highlight` `--redpen` | highlighter and teacher's red pen |
| State | `--success(-soft)` `--warning(-soft)` `--danger(-soft)` `--focus` | |
| Brand | `--brand-*` `--mascot-gradient` | mascot and logo only |
| Type | `--step--2 … --step-6` `--leading-*` `--tracking-*` `--font-*-stack` | fluid 1.25 scale |
| Space | `--space-1 … --space-11` `--section-y` `--gutter` | 4px base, fluid section rhythm |
| Shape | `--radius-1 … --radius-4` `--radius-round` | 6 / 10 / 14 / 22 px |
| Depth | `--shadow-1 … --shadow-3` | tinted, layered |
| Motion | `--dur-1 … --dur-5` `--ease-out` `--ease-in-out` `--ease-spring` | |
| Layout | `--page-max` `--page-wide` `--measure` `--measure-narrow` `--z-*` | |

Dark theme (`:root[data-theme="dark"]`) re-points the same tokens. `.board` re-points them
locally for a blackboard band inside a light page. Never hard-code a colour in a component.

## 5. Type

- **Display** (`h1–h3`, `.display`): Newsreader 400–500, tight leading. `*em*` inside a heading
  renders as italic purple ink. Use it for the one word that carries the promise.
- **Body**: Be Vietnam Pro 400; lede uses `.lede` (step-1, `--ink-2`, narrow measure).
- **Eyebrow**: `.eyebrow`, JetBrains Mono uppercase with a short rule before it.
- **Hand**: `.note` (purple) or `.note--red`. At most one per section, never for information
  that is only there.
- **Mono**: code, numbers in labels, metadata.

Headings are written as sentences, and the last word pair stays together (see `HomeHero`).

## 6. Inline markup

All block titles and ledes go through `inlineMarkup()` (`src/lib/inline-markup.ts`). It is
HTML-escaped, so it is safe for page-builder input.

| Syntax | Renders |
|---|---|
| `*word*` | italic accent `<em>` |
| `==phrase==` | highlighter `.mark` |
| `~~word~~` | hand-drawn underline that writes itself on reveal |
| `[text](/path)` | link (http(s), mailto or site-relative only) |

## 7. Motion

- `data-reveal` on an element fades and lifts it in once, when it scrolls into view.
- `data-reveal-group` on a parent staggers its `data-reveal` children through `--reveal-i`.
- Hidden states apply only under `html.js` and `prefers-reduced-motion: no-preference`, so content
  is always visible without JS or with reduced motion.
- One orchestrated moment per section at most, such as chat lines arriving, ticks drawing or a stamp popping.
- States take 150–250 ms. Entrances take 400–700 ms with `--ease-out`. Only the mascot and stamps use `--ease-spring`.

## 8. Mascot

`<DeweeMascot size mood accessory motion interactive label />` (`src/components/mascot/`)

- **mood**: `happy` · `awake` · `wink` · `sleepy` · `love` · `surprised` · `focused`
- **accessory**: `none` · `glasses` · `headset` · `cap`
- **motion**: `idle` (breathe and blink) · `drop` (falls in once) · `still`
- **interactive**: eyes follow the pointer and it squishes on click

Use one mascot per viewport. Match the mood to the page: `focused`+`glasses` on docs and
architecture, `headset` on contact and support, `love` on CTAs, `sleepy` on 404.

## 9. Layout

- `.container` (page max), `.container--wide`, `.container--narrow` (prose).
- `.section` (fluid 96–160 px rhythm), `.section--tight`, `.band` (paper-2), `.band--deep`.
- Alternate plain and `.band` sections. Use at most one `.board` (blackboard) section per page.
- Heroes are asymmetric (7/5 or 7/4). Content grids collapse at 960 px and 560 px.
- Touch targets are ≥ 44 px on touch and narrow screens. Test at 375, 768 and 1440.

## 10. Blocks

Every block takes **plain strings** that are already localised (`pick(bi, locale)`), so the page
builder can render the same component from stored JSON.

| Block | Purpose | Key props |
|---|---|---|
| `PageHero` | inner-page intro | eyebrow, title, lede, note, actions[{label, href, variant?, chat?}], back, mascot{mood, accessory} \| false, `aside` slot |
| `HomeHero` | homepage promise + live chat card | eyebrow, title, lede, primary, secondary, note, chat{channel, label, lines} |
| `SectionHead` | section heading | eyebrow, title, lede, note, align, level, size (xl/l/m) |
| `ProofStrip` | ruler of verified numbers | items[{value, label}], label |
| `HomeworkChecklist` | notebook page with ticks and a red "10" | eyebrow, title, lede, items[{text, detail?}], grade, gradeLabel, signature |
| `FeatureGrid` | numbered feature cells | items[{icon, title, body, href?}], columns 2 \| 3 |
| `TocIndex` | table-of-contents list with dot leaders | items[{title, meta, href, icon}] |
| `Steps` | "exercises" in sequence | items[{title, body}], label, highlight, highlightNote |
| `ArchitectureSketch` | channels → gateway → providers diagram | labels, channels, providers, more(n), label |
| `SecurityLayers` | blackboard rings of defence | eyebrow, title, lede, layers[{name, body}], core, stamp, stampNote, cta |
| `LogoWall` | integration tiles and chips | groups[{label, size l/s, items[{brand, name, note?}]}] |
| `DeployPlans` | plan cards (single plan becomes a wide sheet) | plans[], includesLabel, tradeoffsLabel, badge |
| `Timeline` | ruler timeline | items[{date, text}], vertical, label |
| `StorySplit` | long story + sticky timeline | eyebrow, title, body[], quote, cta, timeline, timelineLabel |
| `FounderCards` | ID-photo cards | founders[] |
| `EcosystemGrid` | sibling products | products[{id, name, url, icon, tagline, role}] |
| `Faq` | details/summary list | items[{q, a}] |
| `Quote` | pull quote on the margin | text, cite?, role? |
| `CtaBand` | closing call to action with mascot | title, body, primary, secondary{label, href? \| chat}, note |

New blocks go in `src/components/blocks/<PascalName>.astro` with a header comment that says
what the block is for, take plain-string props, use tokens only and include responsive rules.

## 11. Page recipe

```astro
---
import BaseLayout from "~/layouts/BaseLayout.astro";
import { langPaths, localePath, pick, type Locale } from "~/i18n/config";
import { FEATURES_PAGE } from "~/content/pages/features";   // Bi<...> copy lives in content
export const prerender = true;
export const getStaticPaths = () => langPaths();
const { locale } = Astro.props as { locale: Locale };
const t = pick(FEATURES_PAGE, locale);
const href = (p: string) => localePath(locale, p);
---
<BaseLayout title={t.meta.title} description={t.meta.description} locale={locale} path="/features"
  breadcrumbs={[{ name: t.meta.crumb, path: "/features" }]}>
  <PageHero … />
  <section class="section">…</section>
  <CtaBand … />
</BaseLayout>
```

- Copy lives in `src/content/pages/<page>.ts` as `Bi<…>` (`{ en, vi }`). Never put copy in `.astro`.
- Titles are ≤ 60 characters (the brand suffix is added by `SeoHead`), and descriptions are 140–160 characters.
- Every page ends with a next step (a `CtaBand` or a clear link).
- Dynamic routes use `langPaths((locale) => items.map(i => ({ params: { slug }, props: { … } })))`.

## 12. Quality floor (per page, both themes, both languages)

- `render-check` reports no errors at 375, 768 and 1440 (`ak-frontend-design/scripts/render-check.mjs`).
- No horizontal scroll, clipped text or overlapping elements. No orphaned single word in a hero title.
- Text contrast is ≥ 4.5:1, focus is visible, and everything is reachable by keyboard.
- Real content only. An honest labelled placeholder beats invented data.
- Works without JavaScript except for the chat, theme toggle and forms, which degrade gracefully.
