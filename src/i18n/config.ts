/**
 * Locale routing: English lives at the root, Vietnamese under /vi.
 * Every public page exists in both; `localePath` is the only way to build internal links.
 */
export const LOCALES = ["en", "vi"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

/** A value authored in both languages. */
export type Bi<T = string> = { en: T; vi: T };

export const LOCALE_META: Record<Locale, { label: string; short: string; htmlLang: string; ogLocale: string }> = {
  en: { label: "English", short: "EN", htmlLang: "en", ogLocale: "en_US" },
  vi: { label: "Tiếng Việt", short: "VI", htmlLang: "vi", ogLocale: "vi_VN" },
};

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
}

/** Resolve the locale from a `[...lang]` route param (undefined → default locale). */
export function localeFromParam(param: string | undefined): Locale {
  return param === "vi" ? "vi" : "en";
}

/** getStaticPaths helper for `[...lang]` routes. */
export function langPaths<P extends Record<string, unknown> = Record<string, never>>(extra?: (locale: Locale) => Array<{ params?: Record<string, string>; props?: P }>) {
  return LOCALES.flatMap((locale) => {
    const lang = locale === DEFAULT_LOCALE ? undefined : locale;
    if (!extra) return [{ params: { lang }, props: { locale } }];
    return extra(locale).map((p) => ({ params: { lang, ...(p.params ?? {}) }, props: { locale, ...(p.props ?? {}) } }));
  });
}

/** Build an internal href for a locale. `path` is always the English (unprefixed) path. */
export function localePath(locale: Locale, path = "/"): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/** Split a pathname into its locale and the unprefixed path. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const m = pathname.match(/^\/(vi)(\/.*)?$/);
  if (m) return { locale: "vi", path: m[2] || "/" };
  return { locale: DEFAULT_LOCALE, path: pathname || "/" };
}

export function pick<T>(value: Bi<T>, locale: Locale): T {
  return value[locale] ?? value.en;
}

export function formatDate(date: string | Date, locale: Locale, opts: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", { timeZone: "Asia/Ho_Chi_Minh", ...opts }).format(d);
}

export function formatNumber(n: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US").format(n);
}
