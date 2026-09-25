/**
 * schema.org nodes (pure builders, unit-tested in tests/json-ld.test.ts). SeoHead adds
 * Organization, WebSite and BreadcrumbList to every page; pages pass page-specific nodes through
 * BaseLayout's `jsonLd` prop. Every property states something the site itself says: prices come
 * from src/content/plans.ts, and there is no SearchAction because the site has no search URL.
 */
import { SITE, SOCIAL, NAV_TOP, FOOTER_COLUMNS, NAV_PRODUCT, NAV_COMPANY } from "~/content/site";
import { PLANS, type Plan } from "~/content/plans";
import { LOCALE_META, localePath, pick, type Locale } from "~/i18n/config";

type Node = Record<string, unknown>;

const ORG_ID = `${SITE.ownerUrl}#org`;
const trimSlash = (s: string) => s.replace(/\/$/, "");

export function organizationJsonLd(site: string): Node {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: "NextLevelBuilder",
    alternateName: SITE.owner,
    url: SITE.ownerUrl,
    email: SITE.email,
    logo: `${trimSlash(site)}/img/ecosystem/nlb.svg`,
    sameAs: [SOCIAL.github.href, SOCIAL.x.href, SOCIAL.facebook.target, SOCIAL.discord.target],
  };
}

export function websiteJsonLd(site: string, locale: Locale): Node {
  return {
    "@type": "WebSite",
    "@id": `${trimSlash(site)}/#website`,
    name: SITE.name,
    url: trimSlash(site),
    inLanguage: LOCALE_META[locale].htmlLang,
    publisher: { "@id": ORG_ID },
  };
}

export type Crumb = { name: string; path: string };

/** Home → … → page; `path`s are unprefixed and localised here. */
export function breadcrumbJsonLd(site: string, locale: Locale, crumbs: Crumb[]): Node {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: SITE.name, path: "/" }, ...crumbs].map((b, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: b.name,
      item: `${trimSlash(site)}${localePath(locale, b.path)}`,
    })),
  };
}

/** Short page names from the site navigation, first match wins (top nav, footer, menus). */
const NAV_LABELS = new Map<string, { en: string; vi: string }>();
for (const link of [...NAV_TOP, ...FOOTER_COLUMNS.flatMap((c) => c.items), ...NAV_PRODUCT.items, ...NAV_COMPANY.items]) {
  if (!NAV_LABELS.has(link.href)) NAV_LABELS.set(link.href, link.label);
}

/**
 * Breadcrumbs for an inner page that does not declare its own: every ancestor the navigation
 * names, then the page itself (its nav label, else its title). Empty for the home page.
 */
export function crumbsForPath(path: string, locale: Locale, title: string): Crumb[] {
  const segments = path.split("/").filter(Boolean);
  const crumbs: Crumb[] = [];
  segments.forEach((_, i) => {
    const prefix = `/${segments.slice(0, i + 1).join("/")}`;
    const label = NAV_LABELS.get(prefix);
    const last = i === segments.length - 1;
    if (label) crumbs.push({ name: pick(label, locale), path: prefix });
    else if (last) crumbs.push({ name: title, path: prefix });
  });
  return crumbs;
}

export function faqJsonLd(items: { q: string; a: string }[]): Node {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a } })),
  };
}

type OfferInput = { name: string; price: string; currency?: string };

function planFor(name: string): Plan | undefined {
  return PLANS.find((p) => p.name.en === name || p.name.vi === name);
}

/** An Offer, enriched with what plans.ts says about the matching plan (yearly licence, quote-led minimum, Vietnam rules). */
function offerJsonLd(o: OfferInput, pricingUrl: string, locale: Locale): Node {
  const plan = planFor(o.name);
  const currency = o.currency ?? "USD";
  const base: Node = { "@type": "Offer", name: o.name, price: o.price, priceCurrency: currency, availability: "https://schema.org/InStock", seller: { "@id": ORG_ID } };
  if (!plan) return base;
  const quoteLed = plan.id === "on-premises";
  return {
    ...base,
    url: `${pricingUrl}#${plan.id}`,
    description: `${pick(plan.price, locale)}, ${pick(plan.period, locale)}`,
    priceSpecification: quoteLed
      ? { "@type": "PriceSpecification", minPrice: plan.priceUsd, priceCurrency: currency }
      : { "@type": "UnitPriceSpecification", price: plan.priceUsd, priceCurrency: currency, referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "ANN" } },
    ...(plan.vietnam ? {} : { ineligibleRegion: "VN" }),
  };
}

/**
 * dewee as a product with its deployment plans as offers. Typed Product + SoftwareApplication:
 * Product carries the offers, SoftwareApplication says what kind of product it is.
 */
export function productJsonLd(opts: { description: string; url: string; offers?: OfferInput[] }): Node {
  const origin = new URL(opts.url).origin;
  const locale: Locale = /^\/vi(\/|$)/.test(new URL(opts.url).pathname) ? "vi" : "en";
  const pricingUrl = `${origin}${localePath(locale, "/pricing")}`;
  return {
    "@type": ["Product", "SoftwareApplication"],
    "@id": `${origin}/#product`,
    name: SITE.name,
    brand: { "@type": "Brand", name: SITE.name },
    image: `${origin}/brand/dewee-icon-512.png`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Linux, macOS, Docker",
    description: opts.description,
    url: opts.url,
    publisher: { "@id": ORG_ID },
    ...(opts.offers?.length ? { offers: opts.offers.map((o) => offerJsonLd(o, pricingUrl, locale)) } : {}),
  };
}

type ArticleInput = {
  title: string;
  description: string;
  url: string;
  image?: string;
  published?: string;
  modified?: string;
  author?: string;
  authorUrl?: string;
  inLanguage?: string;
};

function articleBase(type: string, opts: ArticleInput): Node {
  return {
    "@type": type,
    headline: opts.title,
    description: opts.description,
    url: opts.url,
    mainEntityOfPage: opts.url,
    ...(opts.inLanguage ? { inLanguage: opts.inLanguage } : {}),
    ...(opts.image ? { image: opts.image } : {}),
    ...(opts.published ? { datePublished: opts.published } : {}),
    ...(opts.modified ? { dateModified: opts.modified } : {}),
    author: opts.author ? { "@type": "Person", name: opts.author, ...(opts.authorUrl ? { url: opts.authorUrl } : {}) } : { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
  };
}

/** A blog post (BlogPosting). */
export function articleJsonLd(opts: ArticleInput): Node {
  return articleBase("BlogPosting", opts);
}

/** A documentation page (TechArticle). */
export function techArticleJsonLd(opts: ArticleInput & { section?: string }): Node {
  return { ...articleBase("TechArticle", opts), ...(opts.section ? { articleSection: opts.section } : {}) };
}
