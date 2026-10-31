/**
 * The blockquote summary and reading note at the top of /llms.txt and /vi/llms.txt. Kept apart from
 * the worker-only response code so a plain unit test can check it. Numbers come from FACTS, so a
 * release refresh updates this text with the rest of the site.
 */
import type { Bi } from "~/i18n/config";
import { FACTS } from "~/content/facts";

const { channels, providers, stableRelease } = FACTS;

export const LLMS_INTRO: { summary: Bi; note: Bi } = {
  summary: {
    en: `dewee is the multiplayer agent platform: humans and AI agents work as one team in the chats your team already uses. ${channels} chat channels, ${providers} model providers, agent teams that delegate to each other, human approval for risky actions, traces for every run, and self-install, hosted or on-premises deployment. Latest stable release: v${stableRelease.version}.`,
    vi: `dewee là nền tảng cộng tác giữa con người và AI agent: hai bên làm việc như một đội ngay trong các kênh chat đội bạn đang dùng. ${channels} kênh chat, ${providers} nhà cung cấp model, đội agent biết giao việc cho nhau, con người phê duyệt hành động rủi ro, trace cho mọi lần chạy, triển khai tự cài đặt hoặc On-Premises. Bản stable mới nhất: v${stableRelease.version}.`,
  },
  note: {
    en: "Every page on {site} has a Markdown twin: add `.md` to its URL ({site}/index.md for the home page). The English pages in one file: {site}/llms-full.txt. Vietnamese pages: {site}/vi/llms.txt. Questions: {email}.",
    vi: "Mọi trang trên {site} đều có bản Markdown: thêm `.md` vào cuối URL (trang chủ tiếng Việt là {site}/vi.md). Danh sách trang tiếng Anh: {site}/llms.txt, toàn văn tiếng Anh: {site}/llms-full.txt. Liên hệ: {email}.",
  },
};
