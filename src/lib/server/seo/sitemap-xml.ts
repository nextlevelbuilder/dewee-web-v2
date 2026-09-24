/**
 * sitemaps.org XML builders (pure). Alternates use the xhtml:link extension Google reads for
 * hreflang; a URL gets them only when both language versions are listed.
 */

export type Alternate = { hreflang: string; path: string };
export type SitemapUrl = { path: string; lastmod?: string; alternates?: Alternate[] };

const XML_HEAD = '<?xml version="1.0" encoding="UTF-8"?>';

export function xmlEscape(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

/** W3C datetime without milliseconds, or undefined for anything unparseable. */
export function w3cDate(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  const ms = Date.parse(value);
  return Number.isNaN(ms) ? undefined : new Date(ms).toISOString().replace(/\.\d{3}Z$/, "Z");
}

/** Machine, private and error routes never belong in a sitemap. */
export function isExcludedPath(path: string): boolean {
  if (path.includes("?") || path.includes("#")) return true;
  return /^\/(vi\/)?(admin|api|mcp|_seo|404|500)(\/|$)/.test(path);
}

export function absolute(siteUrl: string, path: string): string {
  return `${siteUrl.replace(/\/$/, "")}${path}`;
}

/**
 * Keeps en/vi/x-default alternates only when both language versions are in `listed`
 * (the set of paths this sitemap family publishes), so no alternate points at a missing page.
 */
export function pairedAlternates(alternates: Alternate[], listed: ReadonlySet<string>): Alternate[] {
  const en = alternates.find((a) => a.hreflang === "en");
  const vi = alternates.find((a) => a.hreflang === "vi");
  if (!en || !vi || !listed.has(en.path) || !listed.has(vi.path)) return [];
  const xDefault = alternates.find((a) => a.hreflang === "x-default" && listed.has(a.path)) ?? { hreflang: "x-default", path: en.path };
  return [en, vi, { hreflang: "x-default", path: xDefault.path }];
}

/** Pages of one sitemap → its URLs, alternates kept only where both languages are in that sitemap. */
export function toSitemapUrls(pages: Array<{ path: string; lastmod?: string; alternates: Alternate[] }>): SitemapUrl[] {
  const listed = new Set(pages.map((p) => p.path));
  return pages.map((p) => ({ path: p.path, lastmod: p.lastmod, alternates: pairedAlternates(p.alternates, listed) }));
}

export function urlsetXml(siteUrl: string, urls: SitemapUrl[]): string {
  const body = urls.map((u) => {
    const lines = [`  <url>`, `    <loc>${xmlEscape(absolute(siteUrl, u.path))}</loc>`];
    const lastmod = w3cDate(u.lastmod);
    if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`);
    for (const a of u.alternates ?? []) {
      lines.push(`    <xhtml:link rel="alternate" hreflang="${xmlEscape(a.hreflang)}" href="${xmlEscape(absolute(siteUrl, a.path))}"/>`);
    }
    lines.push(`  </url>`);
    return lines.join("\n");
  });
  return [
    XML_HEAD,
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...body,
    "</urlset>",
    "",
  ].join("\n");
}

export function sitemapIndexXml(siteUrl: string, sitemaps: { path: string; lastmod?: string }[]): string {
  const body = sitemaps.map((s) => {
    const lastmod = w3cDate(s.lastmod);
    return `  <sitemap>\n    <loc>${xmlEscape(absolute(siteUrl, s.path))}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ""}\n  </sitemap>`;
  });
  return [XML_HEAD, '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...body, "</sitemapindex>", ""].join("\n");
}

/** Newest lastmod of a list, for the sitemap index. */
export function newest(dates: Array<string | undefined>): string | undefined {
  let best: number | undefined;
  for (const d of dates) {
    const ms = d ? Date.parse(d) : Number.NaN;
    if (!Number.isNaN(ms) && (best === undefined || ms > best)) best = ms;
  }
  return best === undefined ? undefined : new Date(best).toISOString();
}
