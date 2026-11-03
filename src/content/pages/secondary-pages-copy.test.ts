/**
 * Guards for the secondary pages and the release list: figures come from FACTS, no stale
 * claims or unsupported promises, EN and VI stay in step, SEO lengths hold (REVIEW.md §3), and
 * the Vietnamese deployment rule survives.
 */
import { describe, expect, it } from "vitest";
import { LOCALES } from "~/i18n/config";
import { FACTS } from "~/content/facts";
import { plansFor } from "~/content/plans";
import { CAPABILITY_GROUPS, RELEASES } from "~/content/features";
import { USE_CASES } from "~/content/use-cases";
import { LLMS_INTRO } from "~/lib/server/seo/llms-intro";
import { FEATURES_PAGE } from "./features";
import { ABOUT } from "./about";
import { ROADMAP } from "./roadmap";
import { INTEGRATIONS_PAGE } from "./integrations";
import { ARCHITECTURE_PAGE } from "./architecture";
import { SECURITY_PAGE } from "./security";
import { PRICING } from "./pricing";
import { INSTALL } from "./install";

const PAGES = {
  features: FEATURES_PAGE,
  about: ABOUT,
  roadmap: ROADMAP,
  integrations: INTEGRATIONS_PAGE,
  architecture: ARCHITECTURE_PAGE,
  security: SECURITY_PAGE,
  pricing: PRICING,
  install: INSTALL,
};

/** Text that must never reach a visitor: stale figures and promises the product does not make. */
const FORBIDDEN: RegExp[] = [
  /8[,.]900/,
  /on every (change|pull request|commit)/i,
  /cho mỗi thay đổi/i,
  /\b10 (chat )?channels\b/i,
  /\b10 kênh/i,
  /v3\.33\b/,
  /world.?s first/i,
  /\bthe first (multiplayer|ai|agent)/i,
  /live co-?edit/i,
  /shared cursors?/i,
  /real-?time (sync|co-?edit|collaboration)/i,
];

const corpus = (value: unknown): string => JSON.stringify(value);

describe("release list", () => {
  it("starts at the latest stable release in FACTS", () => {
    expect(RELEASES[0].version).toBe(FACTS.stableRelease.version);
    expect(RELEASES[0].date).toBe(FACTS.stableRelease.date);
  });

  it("is newest first with unique versions and stable-only tags", () => {
    const dates = RELEASES.map((r) => r.date);
    expect(dates).toEqual([...dates].sort().reverse());
    expect(new Set(RELEASES.map((r) => r.version)).size).toBe(RELEASES.length);
    for (const r of RELEASES) expect(r.version, r.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it("covers every stable release from 3.28 to 3.43 that has notes", () => {
    const minors = new Set(RELEASES.map((r) => Number(r.version.split(".")[1])));
    for (let minor = 28; minor <= 43; minor++) expect(minors.has(minor), `3.${minor}`).toBe(true);
  });

  it("has the same number of items in English and Vietnamese", () => {
    for (const r of RELEASES) {
      expect(r.items.en.length, r.version).toBeGreaterThan(0);
      expect(r.items.vi.length, r.version).toBe(r.items.en.length);
      expect(r.title.en.trim() && r.title.vi.trim(), r.version).toBeTruthy();
    }
  });

  it("only tags a capability `since` a minor version that has a release entry", () => {
    const minors = new Set(RELEASES.map((r) => r.version.split(".").slice(0, 2).join(".")));
    for (const group of CAPABILITY_GROUPS) {
      for (const item of group.items) if (item.since) expect(minors.has(item.since), `${group.id}: ${item.title.en}`).toBe(true);
    }
  });
});

describe("figures", () => {
  it("builds the channel and provider counts from FACTS", () => {
    for (const locale of LOCALES) {
      const { title, description } = INTEGRATIONS_PAGE[locale].meta;
      expect(title).toContain(String(FACTS.channels));
      expect(title).toContain(String(FACTS.providers));
      expect(description).toContain(String(FACTS.channels));
    }
    const channelsItem = CAPABILITY_GROUPS.find((g) => g.id === "channels")?.items[0];
    expect(channelsItem?.title.en).toContain(String(FACTS.channels));
  });

  it("states the test cadence as before every release", () => {
    const row = ABOUT.en.work.card.rows[0].evidence;
    expect(row).toContain(FACTS.goTests.rounded);
    expect(row).toMatch(/before every release/);
    expect(ABOUT.vi.work.card.rows[0].evidence).toContain(FACTS.goTests.roundedVi);
  });
});

describe("page copy", () => {
  for (const [name, page] of Object.entries(PAGES)) {
    it(`${name} has no stale figures or unsupported promises`, () => {
      for (const locale of LOCALES) {
        const text = corpus(page[locale]);
        for (const pattern of FORBIDDEN) expect(text, `${name} (${locale}) ${pattern}`).not.toMatch(pattern);
      }
    });
  }

  it("keeps the use cases free of stale figures and unsupported promises", () => {
    const text = corpus(USE_CASES);
    for (const pattern of FORBIDDEN) expect(text, String(pattern)).not.toMatch(pattern);
  });

  for (const name of ["features", "integrations", "architecture", "security"] as const) {
    for (const locale of LOCALES) {
      it(`${name} (${locale}) has a title ≤ 60 and a description of 140–160 characters`, () => {
        const { title, description } = PAGES[name][locale].meta;
        expect(title.length).toBeLessThanOrEqual(60);
        expect(description.length, description).toBeGreaterThanOrEqual(140);
        expect(description.length, description).toBeLessThanOrEqual(160);
      });
    }
  }

  it("lists the same roadmap columns and shipped releases in both languages", () => {
    expect(ROADMAP.vi.board.columns.map((c) => [c.id, c.items.length])).toEqual(ROADMAP.en.board.columns.map((c) => [c.id, c.items.length]));
    expect(ROADMAP.vi.shipped.items.length).toBe(ROADMAP.en.shipped.items.length);
  });

  it("does not list the redesigned control plane as in progress any more", () => {
    const now = ROADMAP.en.board.columns.find((c) => c.id === "now");
    expect(now?.items.some((i) => /Beta since v3\.34/.test(i.meta ?? ""))).toBe(false);
  });

  it("offers Self-install and On-Premises only in Vietnamese", () => {
    expect(plansFor("vi").map((p) => p.id)).toEqual(["self-hosted", "on-premises"]);
    expect(plansFor("en").map((p) => p.id)).toEqual(["self-hosted", "saas", "dedicated", "on-premises"]);
    const vi = corpus(PRICING.vi);
    expect(vi).not.toMatch(/AaaS|TOSE/);
  });
});

describe("llms.txt intro", () => {
  it("carries the category, the current facts and stays within the summary limit", () => {
    expect(LLMS_INTRO.summary.en).toContain("multiplayer agent platform");
    expect(LLMS_INTRO.summary.en).toContain(`${FACTS.channels} chat channels`);
    expect(LLMS_INTRO.summary.en).toContain(`v${FACTS.stableRelease.version}`);
    expect(LLMS_INTRO.summary.vi).toContain("con người và AI agent");
    expect(LLMS_INTRO.summary.vi).toContain(`${FACTS.channels} kênh chat`);
    for (const locale of LOCALES) expect(LLMS_INTRO.summary[locale].length).toBeLessThanOrEqual(400);
  });

  it("does not mention AaaS or TOSE in the Vietnamese summary", () => {
    expect(LLMS_INTRO.summary.vi).not.toMatch(/AaaS|TOSE/);
  });
});
