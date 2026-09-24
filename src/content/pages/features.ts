/**
 * /features copy, EN + VI. The release list and the capability catalogue themselves live in
 * src/content/features.ts; this file holds only the page chrome around them.
 * Inline markup: *em*, ==mark==, ~~scribble~~ (see src/lib/inline-markup.ts).
 */
import type { Bi } from "~/i18n/config";

export const FEATURES_PAGE: Bi<{
  meta: { title: string; description: string; crumb: string };
  hero: { eyebrow: string; title: string; lede: string; note: string; primary: string; secondary: string };
  releases: {
    eyebrow: string;
    title: string;
    lede: string;
    monthLabel: string;
    weekdays: string[];
    calendarLabel: string;
    releasedOn: string;
    changelog: string;
    note: string;
  };
  catalogue: { eyebrow: string; title: string; lede: string; indexLabel: string; since: string; count: (n: number) => string };
  console: { eyebrow: string; title: string; lede: string };
  more: { eyebrow: string; title: string; items: { title: string; meta: string; path: string; icon: string }[] };
  cta: { title: string; body: string; primary: string; secondary: string; note: string };
}> = {
  en: {
    meta: {
      title: "Features: everything dewee can do, newest first",
      description:
        "Six stable releases in September 2026, then the full catalogue: channels, agent teams, memory, MCP, workflows, traces, security, tenancy, voice and deployment.",
      crumb: "Features",
    },
    hero: {
      eyebrow: "Features",
      title: "Everything dewee can do, *newest* first.",
      lede: "Six stable releases shipped in September alone. Start with what is new this month, then browse the whole catalogue, one area at a time.",
      note: "six releases in one month. we were busy.",
      primary: "What's new this month",
      secondary: "Browse the catalogue",
    },
    releases: {
      eyebrow: "New this month",
      title: "September: *six* stable releases.",
      lede: "Every one of them stable, none of them beta. The days circled in red are the days we shipped.",
      monthLabel: "September 2026",
      weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      calendarLabel: "September 2026 calendar with the six release days circled",
      releasedOn: "Released",
      changelog: "Read the full changelog",
      note: "beta features wait until they earn a place here",
    },
    catalogue: {
      eyebrow: "The catalogue",
      title: "Everything, *area* by area.",
      lede: "What dewee does today, grouped the way you would evaluate it. A version tag marks what arrived this month.",
      indexLabel: "Jump to an area",
      since: "since",
      count: (n) => `${n} items`,
    },
    console: {
      eyebrow: "In the console",
      title: "See it on *screen*.",
      lede: "Real screens from the dewee control plane, running the demo workspace. Agents on the left, the traces they leave on the right.",
    },
    more: {
      eyebrow: "Keep reading",
      title: "Go *deeper*.",
      items: [
        { title: "Changelog", meta: "Every release, every fix", path: "/changelog", icon: "history" },
        { title: "Documentation", meta: "Set-up, configuration and API", path: "/docs", icon: "book-open" },
        { title: "Use cases", meta: "How teams put agents to work", path: "/use-cases", icon: "briefcase" },
      ],
    },
    cta: {
      title: "Which of these would your team use *first*?",
      body: "Tell us what your team does all day. We will show you which features earn their keep in the first week.",
      primary: "Talk to us",
      secondary: "Ask dewee",
      note: "bring your hardest workflow",
    },
  },
  vi: {
    meta: {
      title: "Tính năng: mọi thứ dewee làm được, mới nhất trước",
      description:
        "Sáu bản phát hành ổn định trong tháng 9/2026, rồi cả danh mục: kênh chat, đội agent, bộ nhớ, MCP, workflow, trace, bảo mật, đa tenant, giọng nói, triển khai.",
      crumb: "Tính năng",
    },
    hero: {
      eyebrow: "Tính năng",
      title: "Mọi thứ dewee làm được, *mới nhất* trước.",
      lede: "Riêng tháng 9 đã có sáu bản phát hành ổn định. Hãy xem những gì mới trong tháng, rồi lật qua cả danh mục, từng mảng một.",
      note: "một tháng, sáu bản. chúng tôi bận lắm.",
      primary: "Có gì mới tháng này",
      secondary: "Xem danh mục",
    },
    releases: {
      eyebrow: "Mới trong tháng",
      title: "Tháng 9: *sáu* bản ổn định.",
      lede: "Bản nào cũng ổn định, không bản nào là beta. Những ngày khoanh bút đỏ là ngày chúng tôi phát hành.",
      monthLabel: "Tháng 9 năm 2026",
      weekdays: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
      calendarLabel: "Lịch tháng 9 năm 2026, khoanh tròn sáu ngày phát hành",
      releasedOn: "Phát hành",
      changelog: "Xem toàn bộ changelog",
      note: "tính năng beta phải đợi tới lượt",
    },
    catalogue: {
      eyebrow: "Danh mục",
      title: "Tất cả, theo *từng* mảng.",
      lede: "Những gì dewee làm được hôm nay, xếp theo cách bạn sẽ đánh giá nó. Nhãn phiên bản đánh dấu những gì vừa có trong tháng.",
      indexLabel: "Đi tới mảng",
      since: "từ",
      count: (n) => `${n} mục`,
    },
    console: {
      eyebrow: "Trong console",
      title: "Xem tận *mắt*.",
      lede: "Màn hình thật từ control plane của dewee, chạy trên workspace demo. Bên trái là các agent, bên phải là trace mà chúng để lại.",
    },
    more: {
      eyebrow: "Đọc tiếp",
      title: "Đi *sâu* hơn.",
      items: [
        { title: "Changelog", meta: "Mọi bản phát hành, mọi bản sửa", path: "/changelog", icon: "history" },
        { title: "Tài liệu", meta: "Cài đặt, cấu hình và API", path: "/docs", icon: "book-open" },
        { title: "Tình huống sử dụng", meta: "Cách các đội đưa agent vào việc", path: "/use-cases", icon: "briefcase" },
      ],
    },
    cta: {
      title: "Đội của bạn sẽ dùng tính năng nào *trước*?",
      body: "Kể cho chúng tôi nghe đội bạn làm gì mỗi ngày. Chúng tôi sẽ chỉ ra tính năng nào đáng tiền ngay trong tuần đầu.",
      primary: "Trò chuyện với chúng tôi",
      secondary: "Hỏi dewee",
      note: "mang bài khó nhất tới đây",
    },
  },
};
