/**
 * Early Access offer logic, shared by the server render and the browser island of the
 * EarlyAccess block. Pure functions only: no DOM and no fetch, so both sides and the tests agree
 * on when the offer is open and what the live endpoint may say.
 */

/** Live state from `GET https://app.dewee.sh/api/public/early-access`, after validation. */
export type EarlyAccessLive = {
  active: boolean;
  discountPercent: number;
  totalSlots: number;
  remainingSlots: number;
  /** ISO 8601 instant */
  endsAt: string;
  priceCents: number;
  discountedPriceCents: number;
  /** https URL of the checkout, when the endpoint provides one */
  checkoutUrl?: string;
};

const isInt = (v: unknown, min = 0): v is number => typeof v === "number" && Number.isInteger(v) && v >= min;

function httpsUrl(v: unknown): string | undefined {
  if (typeof v !== "string" || !v) return undefined;
  try {
    const u = new URL(v);
    return u.protocol === "https:" ? u.href : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Validates the endpoint's JSON. Anything malformed returns null, and the block keeps its
 * static, honest defaults instead of showing numbers it cannot trust.
 */
export function parseEarlyAccess(raw: unknown): EarlyAccessLive | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.active !== "boolean") return null;
  if (!isInt(r.totalSlots, 1) || !isInt(r.remainingSlots) || r.remainingSlots > r.totalSlots) return null;
  if (!isInt(r.discountPercent) || r.discountPercent > 100) return null;
  if (!isInt(r.priceCents) || !isInt(r.discountedPriceCents) || r.discountedPriceCents > r.priceCents) return null;
  if (typeof r.endsAt !== "string" || Number.isNaN(Date.parse(r.endsAt))) return null;
  const checkoutUrl = httpsUrl(r.checkoutUrl);
  return {
    active: r.active,
    discountPercent: r.discountPercent,
    totalSlots: r.totalSlots,
    remainingSlots: r.remainingSlots,
    endsAt: new Date(r.endsAt).toISOString(),
    priceCents: r.priceCents,
    discountedPriceCents: r.discountedPriceCents,
    ...(checkoutUrl ? { checkoutUrl } : {}),
  };
}

/** The offer is open until its deadline and, when live data exists, while it is active and has slots. */
export function isEarlyAccessOpen(now: number, endsAt: string, live?: EarlyAccessLive | null): boolean {
  const end = Date.parse(live?.endsAt ?? endsAt);
  if (Number.isNaN(end) || now > end) return false;
  if (live && (!live.active || live.remainingSlots <= 0)) return false;
  return true;
}

/** Whole days and remaining whole hours until the deadline (never negative). */
export function timeLeft(now: number, endsAt: string): { days: number; hours: number } {
  const ms = Math.max(0, Date.parse(endsAt) - now);
  const hoursTotal = Math.floor(ms / 3_600_000);
  return { days: Math.floor(hoursTotal / 24), hours: hoursTotal % 24 };
}

/** "$250" from 25000 cents; cents are shown only when the amount is not whole. */
export function formatUsd(cents: number): string {
  const whole = cents % 100 === 0;
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 })}`;
}

/** Fills `{name}` placeholders in a localised template. */
export function fillTemplate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, key: string) => (key in values ? String(values[key]) : m));
}
