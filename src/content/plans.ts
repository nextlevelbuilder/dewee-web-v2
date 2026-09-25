/**
 * Deployment models and prices, from the deployment diagram supplied by the founders and
 * dewee docs/commercial-runtime-control-plane.md. Vietnam: On-Premises only.
 */
import type { Bi } from "~/i18n/config";

export type PlanId = "saas" | "dedicated" | "on-premises";

export type Plan = {
  id: PlanId;
  icon: string;
  name: Bi;
  price: Bi;
  period: Bi;
  tagline: Bi;
  includes: Bi<string[]>;
  tradeoffs: Bi<string[]>;
  cta: Bi;
  highlight?: boolean;
  /** Markets where this plan is offered; undefined = everywhere except where overridden */
  vietnam: boolean;
  /** Numeric USD price for structured data (the starting price for quote-led plans) */
  priceUsd: number;
};

export const PLANS: Plan[] = [
  {
    id: "saas",
    icon: "cloud",
    name: { en: "AaaS", vi: "AaaS" },
    price: { en: "$500", vi: "$500" },
    period: { en: "per year · about $42 a month", vi: "mỗi năm" },
    tagline: { en: "AI as a Service: start today on our shared cloud.", vi: "Bắt đầu ngay trên cloud dùng chung." },
    includes: {
      en: ["Hosted runtime gateway", "Customer control plane at app.dewee.sh", "Agent, channel and skill templates", "Role-based access for your team", "14-day refund, no questions asked"],
      vi: ["Runtime gateway được vận hành sẵn", "Bảng điều khiển tại app.dewee.sh", "Mẫu agent, kênh và skill", "Phân quyền theo vai trò", "Hoàn tiền trong 14 ngày"],
    },
    tradeoffs: {
      en: ["Shared infrastructure, so a small chance of data exposure", "No custom runtime packages"],
      vi: ["Hạ tầng dùng chung, vẫn có một rủi ro nhỏ lộ dữ liệu", "Không cài thêm package cho runtime"],
    },
    cta: { en: "Start with AaaS", vi: "Bắt đầu với AaaS" },
    vietnam: false,
    priceUsd: 500,
  },
  {
    id: "dedicated",
    icon: "server",
    name: { en: "Dedicated on TOSE", vi: "Dedicated trên TOSE" },
    price: { en: "$500", vi: "$500" },
    period: { en: "per year licence + $99 TOSE credit deposit", vi: "mỗi năm + $99 ký quỹ TOSE" },
    tagline: { en: "Your own isolated runtime, one click away.", vi: "Runtime riêng, tách biệt, chỉ một cú click." },
    includes: {
      en: ["Isolated runtime on TOSE.sh (from 1 vCPU / 2 GB)", "Install the runtime packages and CLIs you need", "Same control plane and templates", "Licence-key activation", "Top up TOSE credits as you grow"],
      vi: ["Runtime tách biệt trên TOSE.sh (từ 1 vCPU / 2 GB)", "Tự cài package và CLI cần thiết", "Cùng bảng điều khiển và mẫu", "Kích hoạt bằng license key", "Nạp thêm credit TOSE khi mở rộng"],
    },
    tradeoffs: {
      en: ["Higher running cost than AaaS", "You look after your packages and credits", "Longer setup and a little more to learn"],
      vi: ["Chi phí vận hành cao hơn AaaS", "Bạn tự quản lý package và credit", "Triển khai lâu hơn, cần làm quen thêm"],
    },
    cta: { en: "Set up a dedicated runtime", vi: "Tạo runtime riêng" },
    highlight: true,
    vietnam: false,
    priceUsd: 500,
  },
  {
    id: "on-premises",
    icon: "hard-drive",
    name: { en: "On-Premises", vi: "On-Premises" },
    price: { en: "From $5K", vi: "Từ $5K" },
    period: { en: "custom quote · includes the $500/year licence", vi: "báo giá theo nhu cầu · đã gồm license $500/năm" },
    tagline: { en: "Everything on your hardware. We do the setup.", vi: "Mọi thứ trên hạ tầng của bạn. Chúng tôi lo cài đặt." },
    includes: {
      en: ["Runtime on your VPS or Mac mini", "5 custom workflows built with your team", "1 year of maintenance and updates", "Licence-key guard, billing switched off", "Data never leaves your network"],
      vi: ["Runtime trên VPS hoặc Mac mini của bạn", "5 quy trình tuỳ chỉnh dựng cùng đội ngũ bạn", "1 năm bảo trì và cập nhật", "Bảo vệ bằng license key, không tính phí theo lượt", "Dữ liệu không rời khỏi hạ tầng của bạn"],
    },
    tradeoffs: {
      en: ["Longer setup (1–3 weeks)", "You own the hardware"],
      vi: ["Thời gian triển khai 1–3 tuần", "Bạn sở hữu và quản lý phần cứng"],
    },
    cta: { en: "Get an on-prem quote", vi: "Nhận báo giá On-Premises" },
    vietnam: true,
    priceUsd: 5000,
  },
];

/** Plans shown for a locale: Vietnamese visitors see On-Premises only. */
export const plansFor = (locale: "en" | "vi") => (locale === "vi" ? PLANS.filter((p) => p.vietnam) : PLANS);

/**
 * The honest side-by-side on /pricing. Each row answers one question a buyer asks, per plan.
 * Sources: the founders' deployment diagram (pros/cons), docs/commercial-runtime-control-plane.md
 * (isolation, packages, licence) and the homepage FAQ (setup time).
 */
export type PlanComparisonRow = { key: string; icon: string; label: Bi; values: Record<PlanId, Bi> };

export const PLAN_COMPARISON: PlanComparisonRow[] = [
  {
    key: "infrastructure",
    icon: "server",
    label: { en: "Infrastructure", vi: "Hạ tầng" },
    values: {
      saas: { en: "A shared VPS that we run", vi: "VPS dùng chung do chúng tôi vận hành" },
      dedicated: { en: "Your own runtime on TOSE.sh, from 1 vCPU / 2 GB", vi: "Runtime riêng trên TOSE.sh, từ 1 vCPU / 2 GB" },
      "on-premises": { en: "Your VPS or a Mac mini", vi: "VPS hoặc Mac mini của công ty bạn" },
    },
  },
  {
    key: "isolation",
    icon: "shield",
    label: { en: "Isolation", vi: "Mức tách biệt" },
    values: {
      saas: { en: "Per workspace, on shared servers: a small chance of exposure remains", vi: "Theo workspace trên máy chủ dùng chung, vẫn còn rủi ro nhỏ" },
      dedicated: { en: "One isolated runtime per workspace", vi: "Mỗi workspace một runtime riêng" },
      "on-premises": { en: "Physical: the machine is yours", vi: "Tách biệt vật lý: máy là của bạn" },
    },
  },
  {
    key: "packages",
    icon: "package",
    label: { en: "Custom runtime packages", vi: "Cài package riêng cho runtime" },
    values: {
      saas: { en: "No. Ask support for a curated package", vi: "Không. Gửi yêu cầu để đội ngũ xem xét" },
      dedicated: { en: "Yes, install your own packages and CLIs", vi: "Có, tự cài package và CLI" },
      "on-premises": { en: "Yes, agreed with you during setup", vi: "Có, thống nhất cùng bạn khi triển khai" },
    },
  },
  {
    key: "setup",
    icon: "timer",
    label: { en: "Setup time", vi: "Thời gian triển khai" },
    values: {
      saas: { en: "Same day", vi: "Trong ngày" },
      dedicated: { en: "Longer: provisioning, licence activation, a learning curve", vi: "Lâu hơn: khởi tạo, kích hoạt license, làm quen" },
      "on-premises": { en: "Usually 1–3 weeks, workflows included", vi: "Thường 1–3 tuần, gồm cả quy trình tuỳ chỉnh" },
    },
  },
  {
    key: "maintenance",
    icon: "wrench",
    label: { en: "Who maintains it", vi: "Ai bảo trì" },
    values: {
      saas: { en: "We do, all of it", vi: "Chúng tôi lo toàn bộ" },
      dedicated: { en: "You do, while TOSE runs the servers", vi: "Bạn tự lo, TOSE vận hành máy chủ" },
      "on-premises": { en: "We do for the first year; you own the hardware", vi: "Chúng tôi bảo trì năm đầu, bạn sở hữu phần cứng" },
    },
  },
  {
    key: "data",
    icon: "database",
    label: { en: "Where your data lives", vi: "Dữ liệu nằm ở đâu" },
    values: {
      saas: { en: "On our shared servers", vi: "Trên máy chủ dùng chung của chúng tôi" },
      dedicated: { en: "In your runtime on TOSE.sh", vi: "Trong runtime riêng trên TOSE.sh" },
      "on-premises": { en: "Inside your company. It never leaves.", vi: "Trong công ty bạn, không đi đâu cả" },
    },
  },
  {
    key: "price",
    icon: "receipt",
    label: { en: "Price", vi: "Giá" },
    values: {
      saas: { en: "$500 a year", vi: "$500 mỗi năm" },
      dedicated: { en: "$500 a year + $99 TOSE credit deposit", vi: "$500 mỗi năm + $99 ký quỹ TOSE" },
      "on-premises": { en: "From $5K, custom quote, first-year licence included", vi: "Từ $5K theo báo giá, đã gồm license năm đầu" },
    },
  },
];
