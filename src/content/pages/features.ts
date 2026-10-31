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
    weekdays: string[];
    /** Accessible name of the calendar; `month` is the newest release's month, already formatted. */
    calendarLabel: (month: string) => string;
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
      title: "Features: how people and agents work as one team",
      description:
        "Agents that work in your chats, hand work to each other, connect your tools and wait for a person where it matters. Then the full catalogue and releases.",
      crumb: "Features",
    },
    hero: {
      eyebrow: "Features",
      title: "People and agents, *working as one team*.",
      lede: "Agents join the chats your team already uses, hand work to each other, plug into your tools and stop for a person's approval when it matters. Start with what is new, then browse the whole catalogue.",
      note: "benefits first, the full list after",
      primary: "What's new",
      secondary: "Browse the catalogue",
    },
    releases: {
      eyebrow: "Recently shipped",
      title: "Recent releases, *stable* only.",
      lede: "Every one of them stable, none of them beta. The days circled in red are the days we shipped.",
      weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      calendarLabel: (month) => `${month} calendar with the release days circled`,
      releasedOn: "Released",
      changelog: "Read the full changelog",
      note: "beta features wait until they earn a place here",
    },
    catalogue: {
      eyebrow: "The catalogue",
      title: "Everything, *area* by area.",
      lede: "What dewee does today, area by area: where people and agents meet, how agents coordinate, which tools connect and how you stay in control. A version tag shows the release an item arrived in.",
      indexLabel: "Jump to an area",
      since: "since",
      count: (n) => `${n} items`,
    },
    console: {
      eyebrow: "In the console",
      title: "See it on *screen*.",
      lede: "Real screens from the dewee control plane, running the demo workspace. Agents on the left, and on the right the traces that show a person what they did.",
    },
    more: {
      eyebrow: "Keep reading",
      title: "Go *deeper*.",
      items: [
        { title: "Changelog", meta: "Every release, every fix", path: "/changelog", icon: "history" },
        { title: "Documentation", meta: "Set-up, configuration and API", path: "/docs", icon: "book-open" },
        { title: "Use cases", meta: "How people and agents split the work", path: "/use-cases", icon: "briefcase" },
      ],
    },
    cta: {
      title: "Which of these would your team use *first*?",
      body: "Tell us what your people do all day and where an agent could take part. We will show you which features earn their keep in the first week.",
      primary: "Talk to us",
      secondary: "Ask dewee",
      note: "bring your hardest workflow",
    },
  },
  vi: {
    meta: {
      title: "Tính năng: con người và agent làm việc như một đội",
      description:
        "Agent làm việc ngay trong các cuộc chat, giao việc cho nhau, kết nối công cụ của bạn và chờ người duyệt khi cần. Rồi đến danh mục và các bản phát hành.",
      crumb: "Tính năng",
    },
    hero: {
      eyebrow: "Tính năng",
      title: "Con người và agent, *làm việc như một đội*.",
      lede: "Agent vào ngay các cuộc chat đội bạn đang dùng, giao việc cho nhau, kết nối công cụ của bạn và dừng lại chờ người duyệt khi việc quan trọng. Xem điều mới trước, rồi lật qua cả danh mục.",
      note: "lợi ích trước, danh sách đầy đủ sau",
      primary: "Có gì mới",
      secondary: "Xem danh mục",
    },
    releases: {
      eyebrow: "Vừa phát hành",
      title: "Các bản *ổn định* gần đây.",
      lede: "Bản nào cũng ổn định, không bản nào là beta. Những ngày khoanh bút đỏ là ngày chúng tôi phát hành.",
      weekdays: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
      calendarLabel: (month) => `Lịch ${month}, khoanh tròn các ngày phát hành`,
      releasedOn: "Phát hành",
      changelog: "Xem toàn bộ changelog",
      note: "tính năng beta phải đợi tới lượt",
    },
    catalogue: {
      eyebrow: "Danh mục",
      title: "Tất cả, theo *từng* mảng.",
      lede: "Những gì dewee làm được hôm nay, theo từng mảng: nơi con người và agent gặp nhau, cách các agent phối hợp, công cụ nào kết nối được và bạn giữ quyền kiểm soát ra sao. Nhãn phiên bản cho biết mục đó có từ bản nào.",
      indexLabel: "Đi tới mảng",
      since: "từ",
      count: (n) => `${n} mục`,
    },
    console: {
      eyebrow: "Trong console",
      title: "Xem tận *mắt*.",
      lede: "Màn hình thật từ control plane của dewee, chạy trên workspace demo. Bên trái là các agent, bên phải là trace cho người xem agent đã làm gì.",
    },
    more: {
      eyebrow: "Đọc tiếp",
      title: "Đi *sâu* hơn.",
      items: [
        { title: "Changelog", meta: "Mọi bản phát hành, mọi bản sửa", path: "/changelog", icon: "history" },
        { title: "Tài liệu", meta: "Cài đặt, cấu hình và API", path: "/docs", icon: "book-open" },
        { title: "Tình huống sử dụng", meta: "Con người và agent chia việc ra sao", path: "/use-cases", icon: "briefcase" },
      ],
    },
    cta: {
      title: "Đội của bạn sẽ dùng tính năng nào *trước*?",
      body: "Kể cho chúng tôi nghe mọi người trong đội làm gì mỗi ngày và chỗ nào agent có thể tham gia. Chúng tôi sẽ chỉ ra tính năng nào đáng tiền ngay trong tuần đầu.",
      primary: "Trò chuyện với chúng tôi",
      secondary: "Hỏi dewee",
      note: "mang bài khó nhất tới đây",
    },
  },
};
