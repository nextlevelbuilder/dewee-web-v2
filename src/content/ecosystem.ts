import type { Bi } from "~/i18n/config";

/**
 * The NextLevelBuilder product family. Taglines and numbers come from each product's
 * live site / repo (see plans/reports/scout-260924-2346-ecosystem-story.md).
 */
export type EcosystemProduct = {
  id: string;
  name: string;
  url: string;
  icon: string;
  tagline: Bi;
  role: Bi;
};

export const ECOSYSTEM: EcosystemProduct[] = [
  {
    id: "goclaw",
    name: "GoClaw",
    url: "https://goclaw.sh",
    icon: "/img/ecosystem/goclaw.svg",
    tagline: { en: "The open-source ancestor. Free for the community.", vi: "Người anh mã nguồn mở. Miễn phí cho cộng đồng." },
    role: { en: "Source-available agent gateway (CC BY-NC 4.0)", vi: "Agent gateway mở mã nguồn (CC BY-NC 4.0)" },
  },
  {
    id: "agentbrain",
    name: "AgentBrain",
    url: "https://agentbrain.sh",
    icon: "/img/ecosystem/agentbrain.svg",
    tagline: { en: "Enterprise AI hub, agent runtime & business wiki.", vi: "Trung tâm AI doanh nghiệp, agent runtime & wiki nội bộ." },
    role: { en: "Knowledge layer that plugs into dewee", vi: "Lớp tri thức kết nối sâu với dewee" },
  },
  {
    id: "agentwiki",
    name: "AgentWiki",
    url: "https://agentwiki.cc",
    icon: "/img/ecosystem/agentwiki-icon.png",
    tagline: { en: "One knowledge base for humans and AI agents.", vi: "Một kho tri thức cho cả người và AI agent." },
    role: { en: "Docs, search and knowledge graph over MCP", vi: "Tài liệu, tìm kiếm và knowledge graph qua MCP" },
  },
  {
    id: "agentkit",
    name: "AgentKit",
    url: "https://agentkit.best",
    icon: "/img/ecosystem/agentkit.svg",
    tagline: { en: "Build your AI engineering system. Formerly ClaudeKit.", vi: "Xây hệ thống kỹ sư AI của riêng bạn. Tiền thân ClaudeKit." },
    role: { en: "Skills and agents for coding teams", vi: "Skill và agent cho đội lập trình" },
  },
  {
    id: "uupm",
    name: "UI UX Pro Max",
    url: "https://uupm.cc",
    icon: "/img/ecosystem/uupm.svg",
    tagline: { en: "Design intelligence for AI agents. 130K+ GitHub stars.", vi: "Trí tuệ thiết kế cho AI agent. 130K+ sao GitHub." },
    role: { en: "Styles, palettes and type pairings your agents can search", vi: "Phong cách, bảng màu, cặp font cho agent tra cứu" },
  },
  {
    id: "tose",
    name: "TOSE.sh",
    url: "https://tose.sh",
    icon: "/img/ecosystem/tose.png",
    tagline: { en: "Click. Deploy. Done. Platform as a Service.", vi: "Click. Deploy. Xong! Nền tảng PaaS." },
    role: { en: "One-click dedicated runtime for dewee", vi: "Runtime riêng cho dewee chỉ với một cú click" },
  },
];
