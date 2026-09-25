import type { Bi } from "~/i18n/config";

/** Facts that appear across the site. Numbers carry their source in comments. */
export const SITE = {
  name: "dewee",
  domain: "dewee.sh",
  url: "https://dewee.sh",
  email: "hi@nextlevelbuilder.io",
  owner: "NextLevelBuilder.io",
  ownerUrl: "https://nextlevelbuilder.io",
  appUrl: "https://app.dewee.sh",
  cdn: "https://cdn.dewee.sh",
  /** Google Tag Manager container; loaded on production only, behind Consent Mode (see GoogleTagManager.astro). */
  gtmId: "GTM-TQX8KNXV",
  tagline: {
    en: "The hard part is ours. The future is yours.",
    vi: "Phần khó để chúng tôi lo. Tương lai là của bạn.",
  } satisfies Bi,
  description: {
    en: "dewee is the enterprise AI-agent platform from the team behind GoClaw: closed-by-default security, multi-tenant isolation, 20+ LLM providers and the chat channels your team already uses.",
    vi: "dewee là nền tảng AI agent cho doanh nghiệp từ đội ngũ làm ra GoClaw: bảo mật đóng-mặc-định, cô lập đa người thuê, 20+ nhà cung cấp LLM và có mặt ngay trong các kênh chat đội ngũ bạn đang dùng.",
  } satisfies Bi,
} as const;

export const SOCIAL = {
  discord: { label: "Discord", href: "https://dewee.sh/discord", target: "https://discord.gg/eFtJerUrfw" },
  facebook: { label: "Facebook", href: "https://dewee.sh/facebook", target: "https://www.facebook.com/GoClawVietNam" },
  x: { label: "X", href: "https://x.com/nlb_io" },
  github: { label: "GitHub", href: "https://github.com/nextlevelbuilder" },
  email: { label: "Email", href: "mailto:hi@nextlevelbuilder.io" },
} as const;

/** Brand-link redirects served by the worker (see src/lib/server/edge-routes.ts). */
export const BRAND_REDIRECTS: Record<string, string> = {
  "/discord": SOCIAL.discord.target,
  "/facebook": SOCIAL.facebook.target,
  "/x": SOCIAL.x.href,
  "/github": SOCIAL.github.href,
};

export type NavLink = { href: string; label: Bi; description?: Bi; badge?: Bi };
export type NavGroup = { label: Bi; items: NavLink[] };

export const NAV_PRODUCT: NavGroup = {
  label: { en: "Product", vi: "Sản phẩm" },
  items: [
    { href: "/features", label: { en: "Features", vi: "Tính năng" }, description: { en: "Everything dewee can do, newest first", vi: "Mọi thứ dewee làm được, mới nhất trước" } },
    { href: "/architecture", label: { en: "Architecture", vi: "Kiến trúc" }, description: { en: "Pipeline, memory, teams, tenancy", vi: "Pipeline, bộ nhớ, đội agent, đa người thuê" } },
    { href: "/security", label: { en: "Security", vi: "Bảo mật" }, description: { en: "Shut at the door, five layers deep", vi: "Đóng từ cửa, phòng thủ 5 lớp" } },
    { href: "/integrations", label: { en: "Integrations", vi: "Tích hợp" }, description: { en: "Channels, LLM providers, MCP", vi: "Kênh chat, nhà cung cấp LLM, MCP" } },
    { href: "/changelog", label: { en: "Changelog", vi: "Nhật ký thay đổi" }, description: { en: "Every stable and beta release, written down", vi: "Mọi bản stable và beta, ghi lại đầy đủ" } },
    { href: "/roadmap", label: { en: "Roadmap", vi: "Lộ trình" }, description: { en: "What we are building next", vi: "Những gì sắp ra lò" } },
  ],
};

export const NAV_COMPANY: NavGroup = {
  label: { en: "Company", vi: "Công ty" },
  items: [
    { href: "/story", label: { en: "From GoClaw to dewee", vi: "Từ GoClaw đến dewee" }, description: { en: "Why we closed the source", vi: "Vì sao chúng tôi đóng mã nguồn" } },
    { href: "/about", label: { en: "About & founders", vi: "Về chúng tôi" }, description: { en: "NextLevelBuilder and the ecosystem", vi: "NextLevelBuilder và hệ sinh thái" } },
    { href: "/partners", label: { en: "Partners", vi: "Đối tác" }, description: { en: "Build, sell, earn with dewee", vi: "Triển khai, bán, cùng hưởng" } },
    { href: "/blog", label: { en: "Blog", vi: "Blog" }, description: { en: "Notes, launches, lessons", vi: "Ghi chép, ra mắt, bài học" } },
    { href: "/contact", label: { en: "Contact", vi: "Liên hệ" }, description: { en: "Talk to a human", vi: "Nói chuyện với người thật" } },
  ],
};

export const NAV_TOP: NavLink[] = [
  { href: "/use-cases", label: { en: "Use cases", vi: "Ứng dụng" } },
  { href: "/pricing", label: { en: "Pricing", vi: "Bảng giá" } },
  { href: "/docs", label: { en: "Docs", vi: "Tài liệu" } },
];

export const FOOTER_COLUMNS: NavGroup[] = [
  {
    label: { en: "Product", vi: "Sản phẩm" },
    items: [
      { href: "/features", label: { en: "Features", vi: "Tính năng" } },
      { href: "/use-cases", label: { en: "Use cases", vi: "Ứng dụng" } },
      { href: "/architecture", label: { en: "Architecture", vi: "Kiến trúc" } },
      { href: "/security", label: { en: "Security", vi: "Bảo mật" } },
      { href: "/integrations", label: { en: "Integrations", vi: "Tích hợp" } },
      { href: "/pricing", label: { en: "Pricing & deployment", vi: "Bảng giá & triển khai" } },
    ],
  },
  {
    label: { en: "Resources", vi: "Tài nguyên" },
    items: [
      { href: "/docs", label: { en: "Documentation", vi: "Tài liệu" } },
      { href: "/changelog", label: { en: "Changelog", vi: "Nhật ký thay đổi" } },
      { href: "/roadmap", label: { en: "Roadmap", vi: "Lộ trình" } },
      { href: "/blog", label: { en: "Blog", vi: "Blog" } },
      { href: "/developers", label: { en: "API, CLI & MCP", vi: "API, CLI & MCP" } },
      { href: "/llms.txt", label: { en: "llms.txt", vi: "llms.txt" } },
    ],
  },
  {
    label: { en: "Company", vi: "Công ty" },
    items: [
      { href: "/story", label: { en: "Our story", vi: "Câu chuyện" } },
      { href: "/about", label: { en: "About & founders", vi: "Về chúng tôi" } },
      { href: "/partners", label: { en: "Partners", vi: "Đối tác" } },
      { href: "/contact", label: { en: "Contact", vi: "Liên hệ" } },
    ],
  },
  {
    label: { en: "Legal", vi: "Pháp lý" },
    items: [
      { href: "/terms", label: { en: "Terms of Service", vi: "Điều khoản dịch vụ" } },
      { href: "/policy", label: { en: "Policies & refunds", vi: "Chính sách & hoàn tiền" } },
      { href: "/privacy", label: { en: "Privacy", vi: "Quyền riêng tư" } },
      { href: "/cookies", label: { en: "Cookies", vi: "Cookie" } },
      { href: "/gdpr", label: { en: "GDPR", vi: "GDPR" } },
    ],
  },
];
