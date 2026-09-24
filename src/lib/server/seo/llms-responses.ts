/**
 * /llms.txt, /vi/llms.txt and /llms-full.txt. The index lists every indexable page of one locale
 * (prerendered and server-rendered) by its Markdown twin; the full text is the build-time
 * concatenation of the English twins plus published English posts from D1, within the byte budget.
 * Worker-only.
 */
import type { Locale } from "~/i18n/config";
import { SITE } from "~/content/site";
import { DEVELOPERS } from "~/content/pages/developers";
import { loadDiscovery } from "./discovery-sources";
import { discoveryResponse, siteOrigin, TEXT } from "./discovery-response";
import { listPostMarkdown } from "./dynamic-pages";
import { fullTextSection, joinWithinBudget, LLMS_FULL_MAX_BYTES } from "./llms-full-text";
import { llmsTxt, type LlmsLink } from "./llms-txt";
import { LLMS_GROUPS } from "./page-sections";
import { LLMS_FULL_ASSET } from "./seo-manifest";
import { OPENAPI_PATH } from "./seo-paths";

const INTRO = {
  summary: SITE.description,
  note: {
    en: "Every page on {site} has a Markdown twin: add `.md` to its URL ({site}/index.md for the home page). The English pages in one file: {site}/llms-full.txt. Vietnamese pages: {site}/vi/llms.txt. Questions: {email}.",
    vi: "Mọi trang trên {site} đều có bản Markdown: thêm `.md` vào cuối URL (trang chủ tiếng Việt là {site}/vi.md). Danh sách trang tiếng Anh: {site}/llms.txt, toàn văn tiếng Anh: {site}/llms-full.txt. Liên hệ: {email}.",
  },
};

/** The API description is open to anyone (see /developers), so agents get it next to the pages. */
const resources = (locale: Locale): LlmsLink[] => [
  { title: DEVELOPERS[locale].hero.openapi, href: OPENAPI_PATH, description: DEVELOPERS[locale].hero.note, section: "developers" },
];

const MEMBER_ORDER = LLMS_GROUPS.flatMap((g) => g.members);
const rank = (l: LlmsLink) => MEMBER_ORDER.indexOf(l.section);

export async function llmsTxtResponse(env: Env, url: URL, locale: Locale): Promise<Response> {
  const { staticPages, dynamicPages } = await loadDiscovery(env);
  const links: LlmsLink[] = [...staticPages, ...dynamicPages]
    .filter((p) => p.locale === locale)
    .map((p): LlmsLink => ({ title: p.title, href: p.twin, description: p.description, section: p.section }))
    .concat(resources(locale))
    .sort((a, b) => rank(a) - rank(b) || a.href.split("/").length - b.href.split("/").length || a.href.localeCompare(b.href));
  const body = llmsTxt({ locale, siteUrl: siteOrigin(env, url), name: "dewee", intro: INTRO, email: SITE.email, links });
  return discoveryResponse(body, TEXT);
}

export async function llmsFullResponse(env: Env, url: URL): Promise<Response> {
  const site = siteOrigin(env, url);
  const asset = await env.ASSETS.fetch(new Request(`https://assets.local${LLMS_FULL_ASSET}`));
  if (!asset.ok) {
    console.error("llms-full asset missing", asset.status);
    return new Response("llms-full.txt is temporarily unavailable", { status: 503, headers: { "retry-after": "300", "content-type": TEXT } });
  }
  const built = (await asset.text()).trim();
  const posts = await listPostMarkdown(env.DB, "en");
  const remaining = LLMS_FULL_MAX_BYTES - new TextEncoder().encode(built).length - 2;
  const extra = joinWithinBudget(posts.map((p) => fullTextSection({ title: p.title, url: `${site}${p.path}`, markdown: p.markdown })), remaining);
  const text = extra.included ? `${built}\n\n${extra.text}` : `${built}\n`;
  return discoveryResponse(text, TEXT);
}
