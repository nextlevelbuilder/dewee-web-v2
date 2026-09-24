/**
 * Page-specific schema.org nodes. SeoHead adds Organization, WebSite and BreadcrumbList;
 * pages pass these extra nodes through BaseLayout's `jsonLd` prop.
 */
import { SITE } from "~/content/site";

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a } })),
  };
}

export function productJsonLd(opts: { description: string; url: string; offers?: { name: string; price: string; currency?: string }[] }) {
  return {
    "@type": "SoftwareApplication",
    name: "dewee",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Linux, macOS, Docker",
    description: opts.description,
    url: opts.url,
    publisher: { "@id": `${SITE.ownerUrl}#org` },
    ...(opts.offers?.length
      ? { offers: opts.offers.map((o) => ({ "@type": "Offer", name: o.name, price: o.price, priceCurrency: o.currency ?? "USD" })) }
      : {}),
  };
}

export function articleJsonLd(opts: { title: string; description: string; url: string; image?: string; published?: string; modified?: string; author?: string }) {
  return {
    "@type": "BlogPosting",
    headline: opts.title,
    description: opts.description,
    url: opts.url,
    mainEntityOfPage: opts.url,
    ...(opts.image ? { image: opts.image } : {}),
    ...(opts.published ? { datePublished: opts.published } : {}),
    ...(opts.modified ? { dateModified: opts.modified } : {}),
    author: opts.author ? { "@type": "Person", name: opts.author } : { "@id": `${SITE.ownerUrl}#org` },
    publisher: { "@id": `${SITE.ownerUrl}#org` },
  };
}
