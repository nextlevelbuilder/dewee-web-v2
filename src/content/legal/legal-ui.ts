/**
 * Words shared by every legal page: the revision date, the "short version" label, the closing
 * "still have a question?" band and the index of all five documents (used for the next step).
 * "On this page" and "Last updated" come from src/i18n/ui.ts.
 */
import type { Bi } from "~/i18n/config";
import type { LegalSlug } from "./types";

/** ISO date of the current revision of all five documents */
export const LEGAL_UPDATED = "2026-09-25";
export const LEGAL_EMAIL = "hi@nextlevelbuilder.io";
export const LEGAL_ORDER: LegalSlug[] = ["terms", "policy", "privacy", "cookies", "gdpr"];

export type LegalUi = {
  /** The revision date, written out */
  updatedDate: string;
  /** The date as you would write it at the top of a notebook page (decorative) */
  notebookDate: string;
  shortLabel: string;
  next: { eyebrow: string; title: string; lede: string; primary: string; secondary: string };
  docs: Record<LegalSlug, { title: string; meta: string; icon: string }>;
};

export const LEGAL_UI: Bi<LegalUi> = {
  en: {
    updatedDate: "25 September 2026",
    notebookDate: "Friday, 25 September 2026",
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
    updatedDate: "25 tháng 9 năm 2026",
    notebookDate: "Thứ Sáu, ngày 25 tháng 9 năm 2026",
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
