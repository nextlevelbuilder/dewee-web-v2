import { describe, expect, it } from "vitest";
import { langPaths, localeFromParam, localePath, pick, splitLocale } from "../src/i18n/config";

describe("locale routing", () => {
  it("keeps English unprefixed and Vietnamese under /vi", () => {
    expect(localePath("en", "/features")).toBe("/features");
    expect(localePath("vi", "/features")).toBe("/vi/features");
    expect(localePath("vi", "/")).toBe("/vi");
    expect(localePath("en", "pricing")).toBe("/pricing");
  });

  it("splits a pathname back into locale and path", () => {
    expect(splitLocale("/vi/pricing")).toEqual({ locale: "vi", path: "/pricing" });
    expect(splitLocale("/vi")).toEqual({ locale: "vi", path: "/" });
    expect(splitLocale("/video")).toEqual({ locale: "en", path: "/video" });
    expect(splitLocale("/")).toEqual({ locale: "en", path: "/" });
  });

  it("maps route params and builds static paths for both locales", () => {
    expect(localeFromParam(undefined)).toBe("en");
    expect(localeFromParam("vi")).toBe("vi");
    expect(localeFromParam("fr")).toBe("en");
    expect(langPaths()).toEqual([{ params: { lang: undefined }, props: { locale: "en" } }, { params: { lang: "vi" }, props: { locale: "vi" } }]);
  });

  it("picks the localised value with an English fallback", () => {
    expect(pick({ en: "Hello", vi: "Xin chào" }, "vi")).toBe("Xin chào");
    expect(pick({ en: "Hello" } as { en: string; vi: string }, "vi")).toBe("Hello");
  });
});
