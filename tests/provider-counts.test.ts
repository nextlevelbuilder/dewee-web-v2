/**
 * Two different provider counts are quoted on the site, and each must name its unit: the providers
 * the site features (FACTS.providers) and the provider types the runtime accepts
 * (FACTS.providerTypes). These tests catch the two drifting apart, or copy typing a number instead
 * of reading FACTS.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { LOCALES } from "~/i18n/config";
import { FACTS } from "~/content/facts";
import { PROVIDERS, PROVIDER_GROUPS } from "~/content/integrations";
import { PROVIDER_TYPES } from "~/content/provider-types";
import { LLMS_INTRO } from "~/lib/server/seo/llms-intro";
import { CAPABILITY_GROUPS } from "~/content/features";
import { INTEGRATIONS_PAGE } from "~/content/pages/integrations";
import { HOME_EN } from "~/content/pages/home-en";
import { HOME_VI } from "~/content/pages/home-vi";

const doc = (locale: string, path: string) => readFileSync(new URL(`../src/content/docs/${locale}/${path}.md`, import.meta.url), "utf8");
const DOCS = ["get-started/what-is-dewee", "concepts/providers-and-routing", "integrations/llm-providers"] as const;
const text = (value: unknown) => JSON.stringify(value);

describe("provider counts", () => {
  it("keeps featured providers and provider types as two separate numbers", () => {
    expect(FACTS.providers).toBe(PROVIDERS.length);
    expect(FACTS.providerTypes).toBe(PROVIDER_TYPES.length);
    expect(FACTS.providerTypes).toBeGreaterThan(FACTS.providers);
    expect(new Set(PROVIDER_TYPES).size).toBe(PROVIDER_TYPES.length);
  });

  it("gives every featured provider a known runtime type and an auth mechanism", () => {
    for (const p of PROVIDERS) {
      expect(PROVIDER_TYPES, p.id).toContain(p.providerType);
      expect(["api-key", "service-account", "oauth", "cli", "local"], p.id).toContain(p.auth);
    }
    expect(new Set(PROVIDERS.map((p) => p.providerType)).size).toBe(PROVIDERS.length);
  });

  it("matches the connection groups: subscriptions sign in by OAuth or CLI, local ones need no key", () => {
    const group = (id: string) => PROVIDER_GROUPS.find((g) => g.id === id)!.ids.map((i) => PROVIDERS.find((p) => p.id === i)!.auth);
    expect(group("local")).toEqual(["local"]);
    for (const auth of group("subscription")) expect(["oauth", "cli", "api-key"]).toContain(auth);
    for (const auth of group("api")) expect(["api-key", "service-account"]).toContain(auth);
  });
});

describe("docs", () => {
  for (const locale of LOCALES) {
    it(`${locale}: states the verified provider type count and lists every type`, () => {
      const routing = doc(locale, "concepts/providers-and-routing");
      expect(routing).toContain(`${FACTS.providerTypes} `);
      expect(routing).not.toMatch(/\b31\b/);
      for (const type of PROVIDER_TYPES) expect(routing, type).toContain(`\`${type}\``);
      expect(doc(locale, "get-started/what-is-dewee")).toContain(`${FACTS.providerTypes} `);
    });

    it(`${locale}: gives both counts with their units on the provider list page`, () => {
      const page = doc(locale, "integrations/llm-providers");
      expect(page).toContain(String(FACTS.providers));
      expect(page).toContain(String(FACTS.providerTypes));
    });

    it(`${locale}: never quotes a provider count that FACTS does not hold`, () => {
      for (const path of DOCS) {
        const counts = [...doc(locale, path).matchAll(/\b(\d+) (?:loại provider|provider types|featured|LLM provider types)/g)].map((m) => Number(m[1]));
        for (const n of counts) expect([FACTS.providerTypes, FACTS.providers], `${locale}/${path}`).toContain(n);
      }
    });
  }
});

describe("copy", () => {
  it("builds the counts from FACTS on the integrations page, with units", () => {
    for (const locale of LOCALES) {
      const page = INTEGRATIONS_PAGE[locale];
      expect(page.meta.title).toContain(String(FACTS.providers));
      expect(page.models.lede).toContain(String(FACTS.providerTypes));
      expect(page.models.title).toContain(String(FACTS.providers));
    }
    expect(INTEGRATIONS_PAGE.en.meta.title).toMatch(/featured providers/);
    expect(INTEGRATIONS_PAGE.vi.meta.title).toMatch(/nhà cung cấp nổi bật/);
  });

  it("names the unit next to the number on the homepage, features and llms.txt", () => {
    expect(text(HOME_EN)).toContain(`${FACTS.providers} featured`);
    expect(text(HOME_VI)).toContain(`${FACTS.providers} nhà cung cấp`);
    expect(text(HOME_EN)).toContain(`${FACTS.providerTypes} provider types`);
    expect(text(HOME_VI)).toContain(`${FACTS.providerTypes} loại provider`);
    const models = CAPABILITY_GROUPS.find((g) => g.id === "models")!;
    expect(models.lede.en).toContain(`${FACTS.providers} featured providers`);
    expect(text(models.items[0].body)).toContain(String(FACTS.providerTypes));
    expect(LLMS_INTRO.summary.en).toContain(`${FACTS.providers} featured model providers`);
    expect(LLMS_INTRO.summary.en).toContain(`${FACTS.providerTypes} provider types`);
    expect(LLMS_INTRO.summary.vi).toContain(`${FACTS.providerTypes} loại provider`);
  });

  it("does not type either count as a literal in page copy", () => {
    const files = ["pages/home-en.ts", "pages/home-vi.ts", "pages/integrations.ts", "features.ts", "../lib/server/seo/llms-intro.ts"];
    for (const file of files) {
      const source = readFileSync(new URL(`../src/content/${file}`, import.meta.url), "utf8");
      expect(source, file).not.toMatch(new RegExp(`\\b(${FACTS.providers}|${FACTS.providerTypes}) (featured|model providers|providers|provider types|nhà cung cấp|loại provider)`));
    }
  });
});
