/**
 * Content integrity for the use-case section: shape, bilingual parity, SEO lengths and links.
 * Runs in plain vitest, so the modules under test may only use type imports from `~/…`.
 */
import { describe, expect, it } from "vitest";
import { CHANNEL_MARKS, USE_CASE_AREAS, USE_CASES, useCaseBySlug } from "./index";
import { USE_CASES_PAGE, USE_CASE_TIMETABLE } from "../pages/use-cases";

const LOCALES = ["en", "vi"] as const;
/** SeoHead appends this to every page title. */
const TITLE_SUFFIX = " · dewee";
const slugs = USE_CASES.map((u) => u.slug);

describe("use cases", () => {
  it("keeps fourteen cases with unique, URL-safe slugs", () => {
    expect(USE_CASES).toHaveLength(14);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it("finds cases by slug and returns undefined for unknown slugs", () => {
    expect(useCaseBySlug("task-chasing")?.slug).toBe("task-chasing");
    expect(useCaseBySlug("does-not-exist")).toBeUndefined();
  });

  it("uses a known area and known channels for every case", () => {
    const areas = new Set(USE_CASE_AREAS.map((a) => a.id));
    for (const u of USE_CASES) {
      expect(areas.has(u.area), u.slug).toBe(true);
      expect(u.channels.length, u.slug).toBeGreaterThan(0);
      for (const c of u.channels) expect(CHANNEL_MARKS[c], `${u.slug}: ${c}`).toBeDefined();
      expect(u.channels, u.slug).toContain(u.detail.chat.channel);
    }
  });

  it("gives every area at least one case", () => {
    for (const a of USE_CASE_AREAS) expect(USE_CASES.some((u) => u.area === a.id), a.id).toBe(true);
  });

  for (const u of USE_CASES) {
    describe(u.slug, () => {
      const d = u.detail;

      it("has non-empty copy in both locales", () => {
        for (const l of LOCALES) {
          for (const text of [u.team[l], u.title[l], u.summary[l], d.problem[l], d.outcome[l], d.description[l], d.chat.room[l]]) {
            expect(text.trim().length).toBeGreaterThan(0);
          }
        }
      });

      it("keeps titles plain text and within 60 characters with the site suffix", () => {
        for (const l of LOCALES) {
          expect(u.title[l]).not.toMatch(/[*=~[\]]/);
          expect((u.title[l] + TITLE_SUFFIX).length, `${l}: ${u.title[l]}`).toBeLessThanOrEqual(60);
        }
      });

      it("has a meta description of 140–160 characters", () => {
        for (const l of LOCALES) {
          const len = d.description[l].length;
          expect(len, `${l} (${len}): ${d.description[l]}`).toBeGreaterThanOrEqual(140);
          expect(len, `${l} (${len}): ${d.description[l]}`).toBeLessThanOrEqual(160);
        }
      });

      it("describes a 4–6 step flow, mirrored in both locales", () => {
        expect(d.flow.en.length).toBeGreaterThanOrEqual(4);
        expect(d.flow.en.length).toBeLessThanOrEqual(6);
        expect(d.flow.vi.length).toBe(d.flow.en.length);
      });

      it("lists agents, capabilities and guardrails in both locales", () => {
        for (const key of ["agents", "capabilities", "guardrails"] as const) {
          expect(d[key].en.length, key).toBeGreaterThan(0);
          expect(d[key].vi.length, key).toBe(d[key].en.length);
        }
        expect(d.guardrails.en.length).toBeGreaterThanOrEqual(3);
      });

      it("has a 4–6 line transcript where dewee speaks and a person replies", () => {
        for (const l of LOCALES) {
          const lines = d.transcript[l];
          expect(lines.length, l).toBeGreaterThanOrEqual(4);
          expect(lines.length, l).toBeLessThanOrEqual(6);
          expect(lines.some((x) => x.me), l).toBe(true);
          expect(lines.some((x) => !x.me), l).toBe(true);
          for (const x of lines) {
            expect(x.who.trim().length).toBeGreaterThan(0);
            expect(x.text.trim().length).toBeGreaterThan(0);
            if (x.me) expect(x.who).toBe("dewee");
          }
        }
        expect(d.transcript.vi.map((x) => !!x.me)).toEqual(d.transcript.en.map((x) => !!x.me));
      });

      it("links three distinct, existing related cases other than itself", () => {
        expect(new Set(d.related).size).toBe(3);
        for (const r of d.related) {
          expect(r).not.toBe(u.slug);
          expect(slugs, r).toContain(r);
        }
      });
    });
  }
});

describe("use-cases page copy", () => {
  it("has a 140–160 character meta description and a short title in both locales", () => {
    for (const l of LOCALES) {
      const { title, description } = USE_CASES_PAGE[l].meta;
      expect((title + TITLE_SUFFIX).length).toBeLessThanOrEqual(60);
      expect(description.length, `${l} (${description.length})`).toBeGreaterThanOrEqual(140);
      expect(description.length, `${l} (${description.length})`).toBeLessThanOrEqual(160);
      expect(USE_CASES_PAGE[l].grid.status).toContain("{shown}");
      expect(USE_CASES_PAGE[l].grid.status).toContain("{total}");
    }
  });

  it("places every use case on the timetable exactly once", () => {
    const placed = USE_CASE_TIMETABLE.flatMap((p) => p.slugs);
    expect(placed.slice().sort()).toEqual(slugs.slice().sort());
  });
});
