/**
 * Deployment models and prices, from the deployment diagram supplied by the founders and
 * dewee docs/commercial-runtime-control-plane.md. Vietnam: On-Premises only.
 */
import type { Bi } from "~/i18n/config";

export type Plan = {
  id: "saas" | "dedicated" | "on-premises";
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
};

export const PLANS: Plan[] = [
  {
    id: "saas",
    icon: "cloud",
    name: { en: "SaaS", vi: "SaaS" },
    price: { en: "$500", vi: "$500" },
    period: { en: "per year · about $42 a month", vi: "mỗi năm" },
    tagline: { en: "Start today on our shared cloud.", vi: "Bắt đầu ngay trên cloud dùng chung." },
    includes: {
      en: ["Hosted runtime gateway", "Customer control plane at app.dewee.sh", "Agent, channel and skill templates", "Role-based access for your team", "14-day refund, no questions asked"],
      vi: ["Runtime gateway được vận hành sẵn", "Bảng điều khiển tại app.dewee.sh", "Mẫu agent, kênh và skill", "Phân quyền theo vai trò", "Hoàn tiền trong 14 ngày"],
    },
    tradeoffs: {
      en: ["Shared infrastructure", "No custom runtime packages"],
      vi: ["Hạ tầng dùng chung", "Không cài thêm package cho runtime"],
    },
    cta: { en: "Start with SaaS", vi: "Bắt đầu với SaaS" },
    vietnam: false,
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
      en: ["Higher running cost than SaaS", "A little more to learn"],
      vi: ["Chi phí vận hành cao hơn SaaS", "Cần làm quen thêm một chút"],
    },
    cta: { en: "Set up a dedicated runtime", vi: "Tạo runtime riêng" },
    highlight: true,
    vietnam: false,
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
  },
];

/** Plans shown for a locale: Vietnamese visitors see On-Premises only. */
export const plansFor = (locale: "en" | "vi") => (locale === "vi" ? PLANS.filter((p) => p.vietnam) : PLANS);
