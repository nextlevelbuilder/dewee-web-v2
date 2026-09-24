import { describe, expect, it } from "vitest";
import { PLAN_COMPARISON, PLANS, plansFor } from "../src/content/plans";
import { PRICING } from "../src/content/pages/pricing";
import { COOKIES } from "../src/content/legal/cookies";
import { GDPR } from "../src/content/legal/gdpr";
import { POLICY } from "../src/content/legal/policy";
import { PRIVACY } from "../src/content/legal/privacy";
import { TERMS } from "../src/content/legal/terms";

const PAGES = { pricing: PRICING, terms: TERMS, policy: POLICY, privacy: PRIVACY, cookies: COOKIES, gdpr: GDPR };

describe("pricing and legal content", () => {
  it("offers only On-Premises to the Vietnamese market", () => {
    expect(plansFor("vi").map((p) => p.id)).toEqual(["on-premises"]);
    expect(plansFor("en").map((p) => p.id)).toEqual(PLANS.map((p) => p.id));
  });

  it.each(Object.entries(PAGES))("%s: VI copy never sells SaaS or TOSE", (_name, page) => {
    expect(JSON.stringify(page.vi)).not.toMatch(/\bSaaS\b|\bTOSE\b/);
  });

  it.each(Object.entries(PAGES).flatMap(([name, page]) => (["en", "vi"] as const).map((l) => [`${name} (${l})`, page[l].meta] as const)))(
    "%s: title ≤ 60 and description 140–160 characters",
    (_name, meta) => {
      expect(meta.title.length).toBeLessThanOrEqual(60);
      expect(meta.description.length).toBeGreaterThanOrEqual(140);
      expect(meta.description.length).toBeLessThanOrEqual(160);
    },
  );

  it("fills every comparison cell for every plan in both languages", () => {
    for (const row of PLAN_COMPARISON) {
      for (const plan of PLANS) {
        expect(row.values[plan.id]?.en, `${row.key}/${plan.id}`).toBeTruthy();
        expect(row.values[plan.id]?.vi, `${row.key}/${plan.id}`).toBeTruthy();
      }
    }
  });

  it("keeps a numeric price for structured data", () => {
    for (const plan of PLANS) expect(plan.priceUsd).toBeGreaterThan(0);
  });
});
