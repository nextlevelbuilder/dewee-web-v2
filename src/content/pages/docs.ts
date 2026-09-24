/**
 * Copy for the docs chrome (home, sidebar, search, table of contents, pager, callouts).
 * Page bodies live in src/content/docs/{en,vi}/**.md; this file only holds interface strings
 * and the section list that orders the sidebar.
 */
import type { Bi } from "~/i18n/config";

export const DOC_SECTION_IDS = ["get-started", "console", "concepts", "security", "runtime", "integrations", "api", "resources"] as const;
export type DocSectionId = (typeof DOC_SECTION_IDS)[number];

export type DocSection = { id: DocSectionId; icon: string; title: Bi; blurb: Bi };

/** Sidebar and docs-home order follows this array. */
export const DOC_SECTIONS: DocSection[] = [
  {
    id: "get-started",
    icon: "rocket",
    title: { en: "Get started", vi: "Bắt đầu" },
    blurb: { en: "What dewee is, how it fits together and your first agent in a chat.", vi: "dewee là gì, các phần ghép với nhau ra sao và agent đầu tiên của bạn." },
  },
  {
    id: "console",
    icon: "app-window",
    title: { en: "Console guide", vi: "Hướng dẫn console" },
    blurb: { en: "Every screen of app.dewee.sh, with real screenshots and what each button does.", vi: "Từng màn hình của app.dewee.sh, kèm ảnh chụp thật và công dụng của từng nút." },
  },
  {
    id: "concepts",
    icon: "lightbulb",
    title: { en: "Concepts", vi: "Khái niệm" },
    blurb: { en: "How agents think, remember, use tools and work together.", vi: "Agent suy nghĩ, ghi nhớ, dùng tool và phối hợp với nhau như thế nào." },
  },
  {
    id: "security",
    icon: "shield-check",
    title: { en: "Security", vi: "Bảo mật" },
    blurb: { en: "Five defence layers, a shut front door, secrets, roles and audit.", vi: "Năm lớp phòng thủ, cửa đóng từ đầu, secret, phân quyền và kiểm toán." },
  },
  {
    id: "runtime",
    icon: "square-terminal",
    title: { en: "Runtime & CLI", vi: "Runtime & CLI" },
    blurb: { en: "Run the gateway, activate a licence and drive it from the command line.", vi: "Chạy gateway, kích hoạt license và điều khiển bằng dòng lệnh." },
  },
  {
    id: "integrations",
    icon: "plug",
    title: { en: "Integrations", vi: "Tích hợp" },
    blurb: { en: "The chat channels and model providers dewee connects to.", vi: "Các kênh chat và nhà cung cấp model mà dewee kết nối." },
  },
  {
    id: "api",
    icon: "braces",
    title: { en: "API", vi: "API" },
    blurb: { en: "HTTP, WebSocket and MCP interfaces, and how API keys work.", vi: "Giao diện HTTP, WebSocket, MCP và cách API key hoạt động." },
  },
  {
    id: "resources",
    icon: "library",
    title: { en: "Resources", vi: "Tài nguyên" },
    blurb: { en: "Answers to common questions and the website's own API.", vi: "Giải đáp thắc mắc thường gặp và API của chính website." },
  },
];

export const DOCS_UI: Bi<{
  meta: { title: string; description: string; crumb: string };
  hero: { eyebrow: string; title: string; lede: string; note: string };
  start: { eyebrow: string; title: string; items: { label: string; slug: string }[] };
  sectionsTitle: string;
  pagesCount: string;
  next: { title: string; body: string; primary: string; secondary: string };
  search: {
    label: string; placeholder: string; hint: string; loading: string; error: string;
    empty: string; emptyHint: string; results: string; open: string;
  };
  nav: { label: string; menu: string; onThisPage: string; edit: string; updated: string; previous: string; next: string; anchor: string };
  code: { copy: string; copied: string; failed: string; plain: string };
  callouts: Record<"note" | "tip" | "important" | "warning" | "caution", string>;
}> = {
  en: {
    meta: {
      title: "dewee documentation",
      description:
        "The official dewee docs: deploy the runtime, tour every console screen, learn how agents, memory, tools and teams work, and wire up channels, models and the API.",
      crumb: "Docs",
    },
    hero: {
      eyebrow: "Documentation",
      title: "Everything dewee does, *written down*.",
      lede: "Start with the basics, tour the console screen by screen, or go straight to the runtime and API. Every page is checked against the product source.",
      note: "notes in the margin are free",
    },
    start: {
      eyebrow: "Start here",
      title: "Three pages to your first agent",
      items: [
        { label: "What is dewee", slug: "get-started/what-is-dewee" },
        { label: "Choose a deployment", slug: "get-started/deployment-options" },
        { label: "Quickstart", slug: "get-started/quickstart" },
      ],
    },
    sectionsTitle: "Contents",
    pagesCount: "pages",
    next: {
      title: "Can't find what you need?",
      body: "Ask us. A human from the team reads every message, and good questions become new pages here.",
      primary: "Talk to us",
      secondary: "Ask in the chat",
    },
    search: {
      label: "Search the docs",
      placeholder: "Search the docs…",
      hint: "Press / to search",
      loading: "Loading the index…",
      error: "Search is unavailable right now. Use the contents instead.",
      empty: "Nothing matches “{q}”.",
      emptyHint: "Try a shorter word, such as “agent”, “licence” or “channel”.",
      results: "{n} results",
      open: "Open",
    },
    nav: {
      label: "Documentation",
      menu: "Docs menu",
      onThisPage: "On this page",
      edit: "Edit this page on GitHub",
      updated: "Last updated",
      previous: "Previous",
      next: "Next",
      anchor: "Link to this section",
    },
    code: { copy: "Copy", copied: "Copied", failed: "Copy failed", plain: "text" },
    callouts: { note: "Note", tip: "Tip", important: "Important", warning: "Warning", caution: "Caution" },
  },
  vi: {
    meta: {
      title: "Tài liệu dewee",
      description:
        "Tài liệu chính thức của dewee: triển khai runtime, đi qua từng màn hình console, hiểu cách agent, bộ nhớ, tool và nhóm agent vận hành, kết nối kênh, model và API.",
      crumb: "Tài liệu",
    },
    hero: {
      eyebrow: "Tài liệu",
      title: "Mọi thứ dewee làm được, *ghi chép đầy đủ*.",
      lede: "Bắt đầu từ những điều cơ bản, đi qua console từng màn hình một, hoặc vào thẳng phần runtime và API. Mỗi trang đều được đối chiếu với mã nguồn sản phẩm.",
      note: "ghi chú bên lề, miễn phí",
    },
    start: {
      eyebrow: "Bắt đầu từ đây",
      title: "Ba trang tới agent đầu tiên",
      items: [
        { label: "dewee là gì", slug: "get-started/what-is-dewee" },
        { label: "Chọn cách triển khai", slug: "get-started/deployment-options" },
        { label: "Bắt đầu nhanh", slug: "get-started/quickstart" },
      ],
    },
    sectionsTitle: "Mục lục",
    pagesCount: "trang",
    next: {
      title: "Chưa tìm thấy điều bạn cần?",
      body: "Hỏi chúng tôi nhé. Mọi tin nhắn đều có người thật đọc, và câu hỏi hay sẽ thành trang mới ở đây.",
      primary: "Liên hệ",
      secondary: "Hỏi qua chat",
    },
    search: {
      label: "Tìm trong tài liệu",
      placeholder: "Tìm trong tài liệu…",
      hint: "Nhấn / để tìm",
      loading: "Đang tải chỉ mục…",
      error: "Tạm thời chưa tìm kiếm được. Bạn xem mục lục giúp nhé.",
      empty: "Không có trang nào khớp với “{q}”.",
      emptyHint: "Thử một từ ngắn hơn, ví dụ “agent”, “license” hoặc “kênh”.",
      results: "{n} kết quả",
      open: "Mở",
    },
    nav: {
      label: "Tài liệu",
      menu: "Mục lục tài liệu",
      onThisPage: "Trong trang này",
      edit: "Sửa trang này trên GitHub",
      updated: "Cập nhật lần cuối",
      previous: "Trước",
      next: "Tiếp",
      anchor: "Liên kết tới mục này",
    },
    code: { copy: "Sao chép", copied: "Đã chép", failed: "Không chép được", plain: "text" },
    callouts: { note: "Ghi chú", tip: "Mẹo", important: "Quan trọng", warning: "Cảnh báo", caution: "Thận trọng" },
  },
};
