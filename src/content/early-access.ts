/**
 * Early Access for the Self-install licence: 50% off the first year for the first 50 licences,
 * until the end of 15 October 2026 in Vietnam time. The owners set these terms; this constant is
 * the only place the site states them. The live endpoint (dewee-app) reports the remaining slots
 * and the checkout; without it the block shows these static facts and never a guessed count.
 */
import { formatDate, pick, type Bi, type Locale } from "~/i18n/config";
import { fillTemplate } from "~/lib/early-access";

export const EARLY_ACCESS = {
  /** The product's public state; only the site's worker calls it, so no browser CORS is needed. */
  upstream: "https://app.dewee.sh/api/public/early-access",
  /** Same-origin proxy the browser block reads (src/pages/api/early-access.ts). */
  endpoint: "/api/early-access",
  /** 23:59:59 on 15 October 2026, Asia/Saigon (UTC+7) */
  endsAt: "2026-10-15T16:59:59Z",
  totalSlots: 50,
  discountPercent: 50,
  priceUsd: 500,
  discountedPriceUsd: 250,
  /** The block gives up on the live endpoint after this long and keeps the static copy. */
  fetchTimeoutMs: 4000,
} as const;

/**
 * Words for the EarlyAccess block. Placeholders: `{price}`, `{discounted}`, `{total}` and
 * `{date}` are filled from EARLY_ACCESS by `earlyAccessBlock()`; `{n}`, `{days}` and `{hours}`
 * are filled in the browser from live data.
 */
type EarlyAccessCopy = {
  eyebrow: string;
  title: string;
  lede: string;
  sealLabel: string;
  period: string;
  deadline: string;
  slotsTotal: string;
  slotsLeft: string;
  countdown: string;
  cta: string;
  secondary: string;
  closedTitle: string;
  closedBody: string;
};

const COPY: Bi<EarlyAccessCopy> = {
  en: {
    eyebrow: "Early Access",
    title: "Half price for the *first {total}*.",
    lede: "The licence that connects a dewee workspace to your chat channels is {price} a year. For the first {total} licences, the first year costs {discounted}.",
    sealLabel: "{percent}% off",
    period: "for the first year, then {price} a year",
    deadline: "until {date}",
    slotsTotal: "{total} slots in total",
    slotsLeft: "{n} of {total} slots left",
    countdown: "Ends in {days}d {hours}h",
    cta: "Claim an Early Access licence",
    secondary: "Install dewee first",
    closedTitle: "Early Access has *closed*.",
    closedBody: "The licence that connects chat channels is {price} a year per workspace. Installing dewee and building agents stays free.",
  },
  vi: {
    eyebrow: "Early Access",
    title: "Giảm một nửa cho *{total} suất đầu tiên*.",
    lede: "License để kết nối một workspace dewee với các kênh chat có giá {price} mỗi năm. Với {total} license đầu tiên, năm đầu chỉ còn {discounted}.",
    sealLabel: "giảm {percent}%",
    period: "cho năm đầu, sau đó {price} mỗi năm",
    deadline: "đến hết ngày {date}",
    slotsTotal: "Tổng cộng {total} suất",
    slotsLeft: "Còn {n}/{total} suất",
    countdown: "Còn {days} ngày {hours} giờ",
    cta: "Nhận license Early Access",
    secondary: "Cài dewee trước",
    closedTitle: "Early Access đã *kết thúc*.",
    closedBody: "License để kết nối kênh chat có giá {price} mỗi năm cho mỗi workspace. Cài đặt dewee và dựng agent vẫn miễn phí.",
  },
};

/** The offer's facts as display strings, for `{price}`, `{discounted}`, `{total}`, `{percent}` and `{date}` placeholders in any copy. */
export function earlyAccessFacts(locale: Locale) {
  return {
    price: `$${EARLY_ACCESS.priceUsd}`,
    discounted: `$${EARLY_ACCESS.discountedPriceUsd}`,
    total: EARLY_ACCESS.totalSlots,
    percent: EARLY_ACCESS.discountPercent,
    date: formatDate(EARLY_ACCESS.endsAt, locale, locale === "vi" ? { day: "2-digit", month: "2-digit", year: "numeric" } : { day: "numeric", month: "long", year: "numeric" }),
  };
}

/** Props for `<EarlyAccess>` in one locale: every string is final except the live templates. */
export function earlyAccessBlock(locale: Locale, links: { cta: string; secondary?: string }) {
  const c = pick(COPY, locale);
  const facts = earlyAccessFacts(locale);
  const fill = (t: string) => fillTemplate(t, facts);
  return {
    eyebrow: c.eyebrow,
    title: fill(c.title),
    lede: fill(c.lede),
    seal: `\u2212${EARLY_ACCESS.discountPercent}%`,
    sealLabel: fill(c.sealLabel),
    price: { now: `$${EARLY_ACCESS.discountedPriceUsd}`, was: `$${EARLY_ACCESS.priceUsd}`, period: fill(c.period) },
    deadline: fill(c.deadline),
    slotsTotal: fill(c.slotsTotal),
    slotsLeft: c.slotsLeft,
    countdown: c.countdown,
    cta: { label: c.cta, href: links.cta },
    ...(links.secondary ? { secondary: { label: c.secondary, href: links.secondary } } : {}),
    closed: { title: c.closedTitle, body: fill(c.closedBody) },
    live: { endpoint: EARLY_ACCESS.endpoint, endsAt: EARLY_ACCESS.endsAt, totalSlots: EARLY_ACCESS.totalSlots, timeoutMs: EARLY_ACCESS.fetchTimeoutMs },
  };
}
