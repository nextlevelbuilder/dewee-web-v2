/**
 * Words shared by every legal page: the revision date, the "short version" label, the closing
 * "still have a question?" band and the index of all five documents (used for the next step).
 * "On this page" and "Last updated" come from src/i18n/ui.ts.
 */
import type { Bi } from "~/i18n/config";
import type { LegalSlug } from "./types";

/** Revision dates are per document, so editing one policy does not redate the others. */
type LegalRevision = { iso: string; en: { date: string; notebook: string }; vi: { date: string; notebook: string } };
const ORIGINAL_REVISION: LegalRevision = {
  iso: "2026-11-01",
  en: { date: "1 November 2026", notebook: "Sunday, 1 November 2026" },
  vi: { date: "1 tháng 11 năm 2026", notebook: "Chủ Nhật, ngày 1 tháng 11 năm 2026" },
};
const ANALYTICS_REVISION: LegalRevision = {
  iso: "2026-11-08",
  en: { date: "8 November 2026", notebook: "Sunday, 8 November 2026" },
  vi: { date: "8 tháng 11 năm 2026", notebook: "Chủ Nhật, ngày 8 tháng 11 năm 2026" },
};
export const LEGAL_REVISIONS: Record<LegalSlug, LegalRevision> = {
  terms: ORIGINAL_REVISION,
  policy: ORIGINAL_REVISION,
  privacy: ANALYTICS_REVISION,
  cookies: ANALYTICS_REVISION,
  gdpr: ORIGINAL_REVISION,
};
export const LEGAL_EMAIL = "hi@nextlevelbuilder.io";
export const LEGAL_ORDER: LegalSlug[] = ["terms", "policy", "privacy", "cookies", "gdpr"];

export type LegalUi = {
  shortLabel: string;
  next: { eyebrow: string; title: string; lede: string; primary: string; secondary: string };
  docs: Record<LegalSlug, { title: string; meta: string; icon: string }>;
};

export const LEGAL_UI: Bi<LegalUi> = {
  en: {
    shortLabel: "The short version",
    next: {
      eyebrow: "Next step",
      title: "Still have a *question*?",
      lede: `Write to [${LEGAL_EMAIL}](mailto:${LEGAL_EMAIL}) and a person on our team will answer. The other documents are below.`,
      primary: "Email us",
      secondary: "Contact form",
    },
    docs: {
      terms: { title: "Terms of Service", meta: "The agreement between us", icon: "gavel" },
      policy: { title: "Policies & refunds", meta: "Refunds, licences, packages", icon: "receipt" },
      privacy: { title: "Privacy Policy", meta: "What we collect and why", icon: "fingerprint" },
      cookies: { title: "Cookie Policy", meta: "Essential storage only", icon: "cookie" },
      gdpr: { title: "GDPR", meta: "Your rights and how to use them", icon: "shield-check" },
    },
  },
  vi: {
    shortLabel: "Nói ngắn gọn",
    next: {
      eyebrow: "Bước tiếp theo",
      title: "Bạn vẫn còn *thắc mắc*?",
      lede: `Viết cho chúng tôi qua [${LEGAL_EMAIL}](mailto:${LEGAL_EMAIL}), một người thật trong đội sẽ trả lời bạn. Các văn bản còn lại ở ngay bên dưới.`,
      primary: "Gửi email",
      secondary: "Mẫu liên hệ",
    },
    docs: {
      terms: { title: "Điều khoản dịch vụ", meta: "Thoả thuận giữa hai bên", icon: "gavel" },
      policy: { title: "Chính sách & hoàn tiền", meta: "Hoàn tiền, license, package", icon: "receipt" },
      privacy: { title: "Quyền riêng tư", meta: "Chúng tôi thu thập gì, vì sao", icon: "fingerprint" },
      cookies: { title: "Chính sách cookie", meta: "Chỉ lưu trữ thiết yếu", icon: "cookie" },
      gdpr: { title: "GDPR", meta: "Quyền của bạn và cách thực hiện", icon: "shield-check" },
    },
  },
};
