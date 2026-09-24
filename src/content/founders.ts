/**
 * NextLevelBuilder founders. Facts from nlb-web team section and the 2026 GoClaw deck
 * (plans/reports/scout-260924-2346-ecosystem-story.md §B.1). Photos: public/img/founders/*.webp.
 */
import type { Bi } from "~/i18n/config";

export type Founder = {
  id: string;
  name: string;
  photo: string;
  role: Bi;
  company: { name: string; url: string };
  bio: Bi;
  facts: Bi<string[]>;
  links: { label: string; href: string }[];
};

export const FOUNDERS: Founder[] = [
  {
    id: "duy",
    name: "Duy Nguyen",
    photo: "/img/founders/duy.webp",
    role: { en: "Co-founder · Product & engineering", vi: "Đồng sáng lập · Sản phẩm & kỹ thuật" },
    company: { name: "T.O.P Group", url: "https://wearetopgroup.com" },
    bio: {
      en: "CTO and co-founder of T.O.P Group, creator of GoClaw and UI UX Pro Max, and founder of the Build in Public Vietnam community.",
      vi: "CTO, đồng sáng lập T.O.P Group; cha đẻ GoClaw và UI UX Pro Max; người sáng lập cộng đồng Build in Public Việt Nam.",
    },
    facts: {
      en: ["Built 14+ SaaS products", "Creator of GoClaw & UI UX Pro Max", "Build in Public VN: 65K+ members"],
      vi: ["Xây hơn 14 sản phẩm SaaS", "Cha đẻ GoClaw & UI UX Pro Max", "Build in Public VN: 65K+ thành viên"],
    },
    links: [
      { label: "X", href: "https://x.com/goon_nguyen" },
      { label: "Facebook", href: "https://facebook.com/mrgoonie" },
    ],
  },
  {
    id: "cuong",
    name: "Cuong Vo",
    photo: "/img/founders/cuong.webp",
    role: { en: "Co-founder · Operations & growth", vi: "Đồng sáng lập · Vận hành & tăng trưởng" },
    company: { name: "EGANY", url: "https://egany.com" },
    bio: {
      en: "CEO of EGANY for 11 years, building commerce software used by more than 10,000 businesses. Knows sales automation from the shop floor up.",
      vi: "CEO EGANY suốt 11 năm, làm phần mềm thương mại cho hơn 10.000 doanh nghiệp. Hiểu tự động hoá bán hàng từ tận quầy hàng.",
    },
    facts: {
      en: ["11 years leading EGANY", "10,000+ businesses served", "Sales automation & conversion"],
      vi: ["11 năm dẫn dắt EGANY", "Phục vụ 10.000+ doanh nghiệp", "Tự động hoá bán hàng & chuyển đổi"],
    },
    links: [{ label: "Facebook", href: "https://www.facebook.com/voquoccuong007" }],
  },
  {
    id: "viet",
    name: "Viet Tran",
    photo: "/img/founders/viet.webp",
    role: { en: "Co-founder · Architecture", vi: "Đồng sáng lập · Kiến trúc hệ thống" },
    company: { name: "200lab", url: "https://200lab.io" },
    bio: {
      en: "Founder and solution architect of 200lab. 15+ years designing high-load systems, from flash sales to Black Friday peaks of ~400k concurrent users.",
      vi: "Nhà sáng lập, kiến trúc sư giải pháp của 200lab. Hơn 15 năm thiết kế hệ thống tải cao, từ flash sale tới đỉnh Black Friday ~400 nghìn người dùng đồng thời.",
    },
    facts: {
      en: ["15+ years in software", "Peak ~400k concurrent users", "Mentored 3,000+ engineers"],
      vi: ["Hơn 15 năm làm phần mềm", "Đỉnh ~400 nghìn người dùng đồng thời", "Đào tạo 3.000+ kỹ sư"],
    },
    links: [{ label: "Facebook", href: "https://www.facebook.com/viettranx" }],
  },
];
