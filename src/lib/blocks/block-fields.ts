/**
 * Field builders shared by every block schema. Page-builder input is untrusted data from admins,
 * API keys and agents, so links and image sources are restricted here, once, for all blocks.
 * Isomorphic: no server-only imports.
 */
import { z } from "zod";
import { ICONS } from "../../components/ui/icon-paths";

export const ICON_NAMES = Object.keys(ICONS) as [keyof typeof ICONS, ...(keyof typeof ICONS)[]];

export const text = (max: number) => z.string().trim().min(1).max(max);
export const optText = (max: number) => z.string().trim().max(max).optional();

/** Internal paths ("/pricing", "#faq"), http(s) and mailto only; never javascript:, data: or "//host". */
export function isSafeHref(href: string): boolean {
  if (/^\/(?!\/)/.test(href) || href.startsWith("#")) return !/[\s<>"']/.test(href);
  try {
    const url = new URL(href);
    return url.protocol === "https:" || url.protocol === "http:" || url.protocol === "mailto:";
  } catch {
    return false;
  }
}

/** Images come from our media library (/media/…) or any https URL (e.g. cdn.dewee.sh). */
export function isSafeImageSrc(src: string): boolean {
  if (/^\/media\/[A-Za-z0-9/_.-]+$/.test(src) && !src.includes("..")) return true;
  try {
    return new URL(src).protocol === "https:" && !/[\s<>"']/.test(src);
  } catch {
    return false;
  }
}

/** Site assets (/img/…, /brand/…) in addition to safe image sources; used for small icons. */
export function isSafeIconSrc(src: string): boolean {
  return isSafeImageSrc(src) || (/^\/(img|brand)\/[A-Za-z0-9/_.-]+$/.test(src) && !src.includes(".."));
}

export const href = z.string().trim().min(1).max(500).refine(isSafeHref, "Use a site path (/pricing), #anchor, https:// or mailto: link.");
export const imageSrc = z.string().trim().min(1).max(500).refine(isSafeImageSrc, "Images must be https:// URLs or /media/ paths.");
export const iconSrc = z.string().trim().min(1).max(500).refine(isSafeIconSrc, "Icons must be https://, /media/, /img/ or /brand/ paths.");
export const icon = z.enum(ICON_NAMES);

export const buttonVariant = z.enum(["primary", "ink", "ghost", "default"]);
export const button = z.object({ label: text(60), href, variant: buttonVariant.optional() }).strict();

/** Optional heading rendered with SectionHead above a block, inside the same section. */
export const heading = z
  .object({
    eyebrow: optText(80),
    title: text(160),
    lede: optText(400),
    note: optText(80),
    align: z.enum(["start", "center"]).optional(),
  })
  .strict();

/** Envelope options: which paper the section sits on and how much air it gets. */
export const sectionOptions = z
  .object({
    background: z.enum(["plain", "band", "board"]).optional(),
    spacing: z.enum(["normal", "tight", "flush"]).optional(),
    id: z
      .string()
      .regex(/^[a-z][a-z0-9-]{0,40}$/, "Use lowercase letters, digits and dashes.")
      .optional(),
  })
  .strict();

export type SectionOptions = z.infer<typeof sectionOptions>;
export type Heading = z.infer<typeof heading>;
