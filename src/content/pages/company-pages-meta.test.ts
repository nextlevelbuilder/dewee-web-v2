/**
 * SEO limits for the company pages (REVIEW.md §3): titles ≤ 60 characters and descriptions of
 * 140–160 characters, in both languages. Also guards the Vietnamese rule that plan choices offer
 * Self-install and On-Premises only.
 */
import { describe, expect, it } from "vitest";
import { LOCALES } from "~/i18n/config";
import { ABOUT } from "./about";
import { CONTACT } from "./contact";
import { PARTNERS } from "./partners";
import { ROADMAP } from "./roadmap";
import { STORY } from "./story";

const PAGES = { about: ABOUT, contact: CONTACT, partners: PARTNERS, roadmap: ROADMAP, story: STORY };

describe("company page meta", () => {
  for (const [name, page] of Object.entries(PAGES)) {
    for (const locale of LOCALES) {
      it(`${name} (${locale}) has a title ≤ 60 and a description of 140–160 characters`, () => {
        const { title, description, crumb } = page[locale].meta;
        expect(title.length).toBeLessThanOrEqual(60);
        expect(description.length).toBeGreaterThanOrEqual(140);
        expect(description.length).toBeLessThanOrEqual(160);
        expect(crumb.length).toBeGreaterThan(0);
      });
    }
  }
});

describe("contact form plan choices", () => {
  const planValues = (locale: "en" | "vi") => {
    const field = CONTACT[locale].form.fields.find((f) => f.name === "plan");
    return field?.type === "select" ? field.options.map((o) => o.value).filter(Boolean) : [];
  };

  it("offers every deployment in English", () => {
    expect(planValues("en")).toEqual(["self-hosted", "saas", "dedicated", "on-premises"]);
  });

  it("offers Self-install and On-Premises only in Vietnamese", () => {
    expect(planValues("vi")).toEqual(["self-hosted", "on-premises"]);
  });
});
