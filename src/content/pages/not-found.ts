import type { Bi } from "~/i18n/config";

/** Copy for the 404 page (src/pages/404.astro). The title and body come from src/i18n/ui.ts. */
export const NOT_FOUND = {
  eyebrow: { en: "Error 404", vi: "Lỗi 404" } satisfies Bi,
  /** Handwritten margin line, in the notebook voice. */
  note: {
    en: "Crossed out, rewritten, still missing. Even notebooks lose a page.",
    vi: "Gạch đi, viết lại, vẫn chưa thấy. Vở nào mà chẳng có trang bị xé.",
  } satisfies Bi,
  searchLabel: { en: "Search the docs", vi: "Tìm trong tài liệu" } satisfies Bi,
  searchPlaceholder: { en: "e.g. channels, RBAC, deploy", vi: "ví dụ: kênh chat, RBAC, triển khai" } satisfies Bi,
  searchButton: { en: "Search", vi: "Tìm" } satisfies Bi,
  linksTitle: { en: "Or try one of these pages", vi: "Hoặc thử một trong các trang này" } satisfies Bi,
  links: [
    { href: "/features", label: { en: "Features", vi: "Tính năng" }, meta: { en: "What dewee does", vi: "dewee làm được gì" }, icon: "sparkles" },
    { href: "/use-cases", label: { en: "Use cases", vi: "Ứng dụng" }, meta: { en: "By team", vi: "Theo phòng ban" }, icon: "users" },
    { href: "/pricing", label: { en: "Pricing", vi: "Bảng giá" }, meta: { en: "Plans and deployment", vi: "Gói và cách triển khai" }, icon: "tag" },
    { href: "/docs", label: { en: "Documentation", vi: "Tài liệu" }, meta: { en: "Guides and reference", vi: "Hướng dẫn và tra cứu" }, icon: "book-open" },
    { href: "/blog", label: { en: "Blog", vi: "Blog" }, meta: { en: "Notes and launches", vi: "Ghi chép và ra mắt" }, icon: "file-text" },
    { href: "/contact", label: { en: "Contact", vi: "Liên hệ" }, meta: { en: "Talk to a human", vi: "Nói chuyện với người thật" }, icon: "mail" },
  ] as const,
  chat: { en: "Or ask in the chat", vi: "Hoặc hỏi trong khung chat" } satisfies Bi,
} as const;
