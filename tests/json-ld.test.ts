import { describe, expect, it } from "vitest";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  crumbsForPath,
  faqJsonLd,
  organizationJsonLd,
  productJsonLd,
  techArticleJsonLd,
  websiteJsonLd,
} from "../src/lib/json-ld";
import { PLANS, plansFor } from "../src/content/plans";

const site = "https://dewee.sh";
type Offer = Record<string, unknown> & { priceSpecification?: Record<string, unknown> };
const offersOf = (node: Record<string, unknown>) => node.offers as Offer[];

describe("site-wide nodes", () => {
  it("describes the organization with a logo on this site", () => {
    const org = organizationJsonLd(`${site}/`);
    expect(org).toMatchObject({ "@type": "Organization", "@id": "https://nextlevelbuilder.io#org", logo: `${site}/img/ecosystem/nlb.svg`, email: "hi@nextlevelbuilder.io" });
    expect(org.sameAs).toContain("https://x.com/nlb_io");
    expect((org.sameAs as string[]).every((u) => u.startsWith("https://") && !u.startsWith(site))).toBe(true);
  });

  it("describes the website without a SearchAction (the site has no search URL)", () => {
    const web = websiteJsonLd(site, "vi");
    expect(web).toMatchObject({ "@type": "WebSite", url: site, inLanguage: "vi" });
    expect(web).not.toHaveProperty("potentialAction");
  });

  it("builds localised breadcrumbs that start at home", () => {
    const list = breadcrumbJsonLd(site, "vi", [{ name: "Bảng giá", path: "/pricing" }]);
    expect(list.itemListElement).toEqual([
      { "@type": "ListItem", position: 1, name: "dewee", item: `${site}/vi` },
      { "@type": "ListItem", position: 2, name: "Bảng giá", item: `${site}/vi/pricing` },
    ]);
  });

  it("names crumbs from the navigation, falling back to the page title", () => {
    expect(crumbsForPath("/pricing", "en", "Pricing and deployment models")).toEqual([{ name: "Pricing", path: "/pricing" }]);
    expect(crumbsForPath("/use-cases/sales", "vi", "Bán hàng")).toEqual([
      { name: "Ứng dụng", path: "/use-cases" },
      { name: "Bán hàng", path: "/use-cases/sales" },
    ]);
    expect(crumbsForPath("/", "en", "Home")).toEqual([]);
  });

  it("builds an FAQPage from question and answer pairs", () => {
    expect(faqJsonLd([{ q: "Q?", a: "A." }])).toEqual({
      "@type": "FAQPage",
      mainEntity: [{ "@type": "Question", name: "Q?", acceptedAnswer: { "@type": "Answer", text: "A." } }],
    });
  });
});

describe("productJsonLd", () => {
  it("prices every English offer from plans.ts, yearly for subscriptions and a minimum for quotes", () => {
    const node = productJsonLd({ description: "d", url: `${site}/pricing`, offers: plansFor("en").map((p) => ({ name: p.name.en, price: String(p.priceUsd) })) });
    expect(node["@type"]).toEqual(["Product", "SoftwareApplication"]);
    const offers = offersOf(node);
    expect(offers).toHaveLength(PLANS.length);
    for (const [i, plan] of PLANS.entries()) {
      expect(offers[i]).toMatchObject({ price: String(plan.priceUsd), priceCurrency: "USD", url: `${site}/pricing#${plan.id}` });
    }
    expect(offers[0].priceSpecification).toMatchObject({ "@type": "UnitPriceSpecification", price: 500, referenceQuantity: { unitCode: "ANN" } });
    const onPrem = offers.find((o) => o.url === `${site}/pricing#on-premises`);
    expect(onPrem?.priceSpecification).toMatchObject({ "@type": "PriceSpecification", minPrice: 5000 });
  });

  it("says where each plan is not sold: only On-Premises is offered in Vietnam", () => {
    const offers = offersOf(productJsonLd({ description: "d", url: `${site}/`, offers: PLANS.map((p) => ({ name: p.name.en, price: String(p.priceUsd) })) }));
    const byId = (id: string) => offers.find((o) => o.url === `${site}/pricing#${id}`);
    expect(byId("saas")?.ineligibleRegion).toBe("VN");
    expect(byId("dedicated")?.ineligibleRegion).toBe("VN");
    expect(byId("on-premises")).not.toHaveProperty("ineligibleRegion");
  });

  it("links Vietnamese offers to the Vietnamese pricing page with Vietnamese terms", () => {
    const offers = offersOf(productJsonLd({ description: "d", url: `${site}/vi/pricing`, offers: plansFor("vi").map((p) => ({ name: p.name.vi, price: String(p.priceUsd) })) }));
    expect(offers).toHaveLength(1);
    expect(offers[0]).toMatchObject({ url: `${site}/vi/pricing#on-premises`, price: "5000" });
    expect(String(offers[0].description)).toContain("báo giá");
  });

  it("keeps unknown offers as given and omits offers when there are none", () => {
    const node = productJsonLd({ description: "d", url: site, offers: [{ name: "Custom", price: "1", currency: "EUR" }] });
    expect(offersOf(node)[0]).toEqual({ "@type": "Offer", name: "Custom", price: "1", priceCurrency: "EUR", availability: "https://schema.org/InStock", seller: { "@id": "https://nextlevelbuilder.io#org" } });
    expect(productJsonLd({ description: "d", url: site })).not.toHaveProperty("offers");
  });
});

describe("articles", () => {
  it("builds a BlogPosting with a person author, or the organization when none is named", () => {
    const post = articleJsonLd({ title: "T", description: "D", url: `${site}/blog/t`, published: "2026-09-01", author: "Duy", authorUrl: "https://x.com/duy", inLanguage: "vi" });
    expect(post).toMatchObject({ "@type": "BlogPosting", headline: "T", datePublished: "2026-09-01", inLanguage: "vi", author: { "@type": "Person", name: "Duy", url: "https://x.com/duy" } });
    expect(post).not.toHaveProperty("dateModified");
    expect(articleJsonLd({ title: "T", description: "D", url: site }).author).toEqual({ "@id": "https://nextlevelbuilder.io#org" });
  });

  it("builds a TechArticle for docs with its section", () => {
    expect(techArticleJsonLd({ title: "Install", description: "D", url: `${site}/docs/install`, section: "Getting started" })).toMatchObject({ "@type": "TechArticle", articleSection: "Getting started" });
  });
});
