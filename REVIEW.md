# REVIEW.md

The checklist a change must pass before it merges. Reviewers (human or agent) go through it
top to bottom and write down anything they could not verify.

## 1. Render it

Run the render check on every page the change touches, in both themes and both languages:

```bash
pnpm build && pnpm preview   # http://127.0.0.1:4389
THEME=light node <render-check.mjs> http://127.0.0.1:4389/<path> --out <dir>
THEME=dark  node <render-check.mjs> http://127.0.0.1:4389/vi/<path> --out <dir>
```

`render-check.mjs` ships with the `ak-frontend-design` skill. It captures 375, 768 and
1440 px screenshots and reports layout defects. Look at the screenshots; the report alone is
not enough.

- [ ] No errors in the report. Warnings are explained or fixed. Known noise: the mascot's
      "z" glyphs and `.sr-only` text.
- [ ] No horizontal scroll, clipped text, overlapping elements or empty grid cells.
- [ ] Hero titles do not end on a single orphaned word.
- [ ] Dark theme ("bảng đen") has no invisible text, white flashes or hard-coded colours.
- [ ] VI copy fits: Vietnamese runs about 15% longer. Buttons and chips do not wrap badly.

## 2. Design

- [ ] Uses tokens and existing blocks (`DESIGN.md` §10) before adding new ones.
- [ ] At most one handwritten note per section and one mascot per viewport.
- [ ] Every section has a reason to exist and the page ends with a next step.
- [ ] Motion respects `prefers-reduced-motion`, and content is visible without JavaScript.

## 3. Content

- [ ] Copy is in `src/content/`, never in `.astro` markup.
- [ ] EN and VI both exist and say the same thing; the VI reads as Vietnamese, not as a translation.
- [ ] No invented metrics, customers, testimonials or features. Every number traces to a source.
- [ ] VI pricing shows On-Premises only.
- [ ] Titles are ≤ 60 characters and descriptions are 140–160 characters.

## 4. Accessibility

- [ ] One `h1` per page, and heading levels do not skip.
- [ ] Interactive elements are real buttons or links, reachable by keyboard, with visible focus.
- [ ] Touch targets are ≥ 44 px on narrow screens.
- [ ] Text contrast is ≥ 4.5:1 (≥ 3:1 for large text and UI) in both themes.
- [ ] Images have meaningful `alt`, or `alt=""` when decorative.

## 5. SEO and GEO

- [ ] Page appears in `/sitemap.xml` with its `hreflang` pair.
- [ ] `<path>.md` returns clean Markdown for the page.
- [ ] Canonical, Open Graph and Twitter tags are correct, and the OG image renders.
- [ ] JSON-LD validates (Organization, BreadcrumbList, plus Article, FAQPage or Product where relevant).
- [ ] New public pages are listed in `llms.txt`.

## 6. Security and data

- [ ] No secrets in code, logs, commits or screenshots.
- [ ] Server input is validated with zod, output is escaped, and SQL is parameterised.
- [ ] Admin and API routes check the session or API key scope, and super-admin checks use the allowlist.
- [ ] Writes are idempotent where the API promises it, and they are audit-logged.

## 7. Performance

- [ ] Prerendered where the content is static.
- [ ] No new client framework. Islands stay small and load lazily.
- [ ] Images are sized, `loading="lazy"` below the fold, and WebP or AVIF from `cdn.dewee.sh`.

## 8. Ship

- [ ] `pnpm check`, `pnpm test` and `pnpm build` pass.
- [ ] PR into `dev`. After staging is verified in a browser, PR `dev` into `main`.
- [ ] After production deploys, re-check the changed pages on `https://dewee.sh`.
