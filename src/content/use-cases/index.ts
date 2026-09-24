/**
 * Use cases shown on the homepage, /use-cases and /use-cases/[slug].
 *
 * One file per use case keeps every case story reviewable on its own. This index fixes the
 * display order, which the homepage list, the index grid and "related" links all share.
 * Only type imports from `~/…` are allowed here, so the content test can run in plain vitest.
 */
import type { Bi } from "~/i18n/config";
import type { ChannelId, UseCase, UseCaseArea } from "./types";
import { softwareDelivery } from "./software-delivery";
import { socialMediaCare } from "./social-media-care";
import { aiCoworkerInGroupChats } from "./ai-coworker-in-group-chats";
import { realEstateMarketSignals } from "./real-estate-market-signals";
import { hrRecruiting } from "./hr-recruiting";
import { creativeAdProduction } from "./creative-ad-production";
import { customerCareWithHandoff } from "./customer-care-with-handoff";
import { stockMarketSentiment } from "./stock-market-sentiment";
import { salesKnowledgeAssistant } from "./sales-knowledge-assistant";
import { retailPodDesign } from "./retail-pod-design";
import { seoAroundTheClock } from "./seo-around-the-clock";
import { taskChasing } from "./task-chasing";
import { meetingNotesAndDecisions } from "./meeting-notes-and-decisions";
import { adsPerformanceWatch } from "./ads-performance-watch";

export type { ChannelId, TranscriptLine, UseCase, UseCaseArea, UseCaseDetail } from "./types";

/** Date the use-case copy was last reviewed against the dewee docs (Article JSON-LD dates). */
export const USE_CASES_REVIEWED = "2026-09-25";

export const USE_CASES: UseCase[] = [
  softwareDelivery,
  socialMediaCare,
  aiCoworkerInGroupChats,
  realEstateMarketSignals,
  hrRecruiting,
  creativeAdProduction,
  customerCareWithHandoff,
  stockMarketSentiment,
  salesKnowledgeAssistant,
  retailPodDesign,
  seoAroundTheClock,
  taskChasing,
  meetingNotesAndDecisions,
  adsPerformanceWatch,
];

export const useCaseBySlug = (slug: string): UseCase | undefined => USE_CASES.find((u) => u.slug === slug);

/** Filter groups for /use-cases. Every team label is unique, so cases are grouped by kind of work. */
export const USE_CASE_AREAS: Array<{ id: UseCaseArea; label: Bi }> = [
  { id: "operations", label: { en: "Team & operations", vi: "Vận hành & đội ngũ" } },
  { id: "customers", label: { en: "Customers & sales", vi: "Khách hàng & bán hàng" } },
  { id: "marketing", label: { en: "Marketing & growth", vi: "Marketing & tăng trưởng" } },
  { id: "research", label: { en: "Research & markets", vi: "Nghiên cứu thị trường" } },
  { id: "make", label: { en: "Build & create", vi: "Xây dựng & sáng tạo" } },
];

export const areaLabel = (id: UseCaseArea): Bi => USE_CASE_AREAS.find((a) => a.id === id)?.label ?? { en: id, vi: id };

/** How each channel renders with <BrandMark>. Brands without a vendored mark fall back to a monogram. */
export const CHANNEL_MARKS: Record<ChannelId, { brand: string; name: string }> = {
  telegram: { brand: "telegram", name: "Telegram" },
  zalo: { brand: "zalo", name: "Zalo" },
  slack: { brand: "slack", name: "Slack" },
  lark: { brand: "lark", name: "Lark" },
  discord: { brand: "discord", name: "Discord" },
  whatsapp: { brand: "whatsapp", name: "WhatsApp" },
  facebook: { brand: "facebook", name: "Facebook" },
  pancake: { brand: "pancake", name: "Pancake" },
  bitrix24: { brand: "bitrix24", name: "Bitrix24" },
};
