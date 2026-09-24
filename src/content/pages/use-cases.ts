/**
 * Copy for /use-cases and /use-cases/[slug], EN + VI. The case stories themselves live in
 * src/content/use-cases/ (one file per case). No metrics here: outcomes stay qualitative.
 * Inline markup: *em*, ==mark==, ~~scribble~~ (see src/lib/inline-markup.ts).
 */
import type { Bi } from "~/i18n/config";

type Cta = { title: string; body: string; primary: string; secondary: string; note: string };

export const USE_CASES_PAGE: Bi<{
  meta: { title: string; description: string };
  hero: { eyebrow: string; title: string; lede: string; note: string };
  grid: {
    eyebrow: string;
    title: string;
    filterLabel: string;
    all: string;
    /** Live-region text after filtering; `{shown}` and `{total}` are filled in by the island. */
    status: string;
    /** The dashed fifteenth card that closes the grid */
    invite: { title: string; body: string; label: string };
  };
  timetable: {
    eyebrow: string;
    title: string;
    lede: string;
    sheetTitle: string;
    caption: string;
    classLabel: string;
    classValue: string;
    yearLabel: string;
    yearValue: string;
    colTime: string;
    colPeriod: string;
    colJobs: string;
    free: { time: string; name: string; label: string };
    disclaimer: string;
  };
  cta: Cta;
}> = {
  en: {
    meta: {
      title: "AI agent use cases for business teams",
      description:
        "Fourteen ways teams use dewee AI agents: customer care, sales, marketing, HR, research and engineering, each with its workflow, tools and human approvals.",
    },
    hero: {
      eyebrow: "Use cases",
      title: "Fourteen jobs your team can *hand over*.",
      lede: "Each one is a pattern we build with teams: who the agents are, what they use, and where a person stays in charge. Pick the one that sounds most like your week.",
      note: "the fifteenth one might be yours",
    },
    grid: {
      eyebrow: "Browse all fourteen",
      title: "Find *your* kind of work.",
      filterLabel: "Filter by kind of work",
      all: "All",
      status: "Showing {shown} of {total} use cases",
      invite: {
        title: "Number fifteen is yours",
        body: "Every team has one job that only it does. Describe yours and we will sketch the agents, tools and approvals with you.",
        label: "Describe your job",
      },
    },
    timetable: {
      eyebrow: "A day with dewee",
      title: "Fourteen jobs, one *very* full timetable.",
      lede: "Most of these run on a schedule, not on someone remembering. Here is one way they could fill a working day.",
      sheetTitle: "Timetable",
      caption: "An example daily timetable for the fourteen use cases",
      classLabel: "Class",
      classValue: "dewee",
      yearLabel: "School year",
      yearValue: "2026–2027",
      colTime: "Time",
      colPeriod: "Period",
      colJobs: "Jobs",
      free: { time: "Any time", name: "Free period", label: "Your job here?" },
      disclaimer: "An example day. Your schedule is yours to set.",
    },
    cta: {
      title: "Don't see yours? We'll *build it* with you.",
      body: "Tell us about the work that eats your team's week. We will sketch the agents, the tools and the guardrails with you, usually in a single call.",
      primary: "Tell us your use case",
      secondary: "Chat with dewee now",
      note: "On-Premises includes five custom workflows",
    },
  },
  vi: {
    meta: {
      title: "Ứng dụng AI agent cho doanh nghiệp",
      description:
        "Mười bốn cách doanh nghiệp giao việc cho AI agent dewee: chăm sóc khách hàng, bán hàng, marketing, nhân sự, nghiên cứu và kỹ thuật, kèm quy trình và bước duyệt.",
    },
    hero: {
      eyebrow: "Ứng dụng",
      title: "Mười bốn việc đội bạn có thể *giao lại*.",
      lede: "Mỗi mục là một mô hình chúng tôi cùng các đội triển khai: có những agent nào, dùng công cụ gì, và chỗ nào con người vẫn cầm lái. Chọn mục nghe giống tuần làm việc của bạn nhất.",
      note: "mục thứ mười lăm có khi là của bạn",
    },
    grid: {
      eyebrow: "Xem cả mười bốn",
      title: "Tìm việc *giống của bạn*.",
      filterLabel: "Lọc theo loại công việc",
      all: "Tất cả",
      status: "Đang hiện {shown} trên {total} ứng dụng",
      invite: {
        title: "Mục thứ mười lăm dành cho bạn",
        body: "Đội nào cũng có một việc rất riêng. Kể chúng tôi nghe việc của bạn, chúng tôi cùng bạn phác ra agent, công cụ và bước duyệt.",
        label: "Kể về việc của bạn",
      },
    },
    timetable: {
      eyebrow: "Một ngày cùng dewee",
      title: "Mười bốn việc, một thời khoá biểu *kín lịch*.",
      lede: "Phần lớn các việc này chạy theo lịch, không phụ thuộc vào trí nhớ của ai. Chúng có thể lấp kín một ngày làm việc như thế này.",
      sheetTitle: "Thời khoá biểu",
      caption: "Thời khoá biểu ví dụ cho mười bốn ứng dụng trong một ngày",
      classLabel: "Lớp",
      classValue: "dewee",
      yearLabel: "Năm học",
      yearValue: "2026 – 2027",
      colTime: "Giờ",
      colPeriod: "Tiết",
      colJobs: "Việc",
      free: { time: "Bất kỳ lúc nào", name: "Tiết trống", label: "Việc của bạn?" },
      disclaimer: "Một ngày ví dụ. Lịch thật do bạn đặt.",
    },
    cta: {
      title: "Chưa thấy việc của bạn? Chúng tôi *cùng bạn dựng*.",
      body: "Kể chúng tôi nghe việc gì đang ngốn cả tuần của đội bạn. Chúng tôi sẽ cùng bạn phác ra agent, công cụ và các lằn ranh an toàn, thường chỉ trong một cuộc gọi.",
      primary: "Kể chúng tôi nghe",
      secondary: "Chat với dewee ngay",
      note: "gói On-Premises đã gồm năm quy trình tuỳ chỉnh",
    },
  },
};

/**
 * The signature visual on /use-cases: one example school day. Every use case appears exactly
 * once (checked by the content test). Times are illustrative, not product defaults.
 */
export const USE_CASE_TIMETABLE: Array<{ time: Bi; name: Bi; slugs: string[] }> = [
  { time: { en: "06:30", vi: "06:30" }, name: { en: "Before the office opens", vi: "Trước giờ làm" }, slugs: ["real-estate-market-signals", "stock-market-sentiment"] },
  { time: { en: "08:30", vi: "08:30" }, name: { en: "Morning check-in", vi: "Đầu giờ sáng" }, slugs: ["task-chasing", "ai-coworker-in-group-chats"] },
  { time: { en: "10:00", vi: "10:00" }, name: { en: "Office hours", vi: "Giờ hành chính" }, slugs: ["sales-knowledge-assistant", "hr-recruiting", "meeting-notes-and-decisions"] },
  { time: { en: "14:00", vi: "14:00" }, name: { en: "Afternoon studio", vi: "Buổi chiều" }, slugs: ["creative-ad-production", "retail-pod-design", "social-media-care"] },
  { time: { en: "22:00", vi: "22:00" }, name: { en: "Night shift", vi: "Ca đêm" }, slugs: ["software-delivery", "seo-around-the-clock", "customer-care-with-handoff"] },
  { time: { en: "Every hour", vi: "Mỗi giờ" }, name: { en: "On watch", vi: "Trực" }, slugs: ["ads-performance-watch"] },
];

export const USE_CASE_DETAIL_UI: Bi<{
  back: string;
  crumb: string;
  build: string;
  /** Decorative "read more" line on every use-case card */
  read: string;
  label: { kicker: string; no: string; subject: string; name: string; class: string; school: string; schoolValue: string; runsOn: string };
  problem: { cite: string };
  flow: { eyebrow: string; title: string; step: string };
  crew: { eyebrow: string; title: string; agents: string; capabilities: string; chatLabel: (room: string) => string; caption: string };
  guardrails: { eyebrow: string; title: string; lede: string; note: string };
  outcome: { eyebrow: string; remark: string; runsOn: string; integrations: string };
  related: { eyebrow: string; title: string };
  cta: Cta;
}> = {
  en: {
    back: "All use cases",
    crumb: "Use cases",
    build: "Build this with us",
    read: "Read the case",
    label: {
      kicker: "Use case",
      no: "No.",
      subject: "Subject",
      name: "Name",
      class: "Class",
      school: "School",
      schoolValue: "dewee",
      runsOn: "Runs on",
    },
    problem: { cite: "What we hear, again and again" },
    flow: { eyebrow: "How it works", title: "One ordinary day, *step by step*.", step: "Step" },
    crew: {
      eyebrow: "In the chat",
      title: "What it looks like *in practice*.",
      agents: "The agents",
      capabilities: "What they use",
      chatLabel: (room) => `Example conversation in ${room}`,
      caption: "Illustrative conversation. Names and details are made up.",
    },
    guardrails: {
      eyebrow: "Human in the loop",
      title: "Where *you* stay in charge.",
      lede: "The agents do the legwork. These are the lines they do not cross without a person.",
      note: "the last word is always yours",
    },
    outcome: { eyebrow: "What changes", remark: "Remarks", runsOn: "Runs on", integrations: "All channels and integrations" },
    related: { eyebrow: "Keep reading", title: "Next on the *timetable*." },
    cta: {
      title: "Want this on *your* team's timetable?",
      body: "Tell us how your team works today. We will shape the agents, tools and approvals around it and set it up with you.",
      primary: "Build this with us",
      secondary: "Ask dewee about it",
      note: "On-Premises includes five custom workflows",
    },
  },
  vi: {
    back: "Tất cả ứng dụng",
    crumb: "Ứng dụng",
    build: "Dựng việc này cùng chúng tôi",
    read: "Xem chi tiết",
    label: {
      kicker: "Ứng dụng",
      no: "Số",
      subject: "Vở",
      name: "Tên",
      class: "Lớp",
      school: "Trường",
      schoolValue: "dewee",
      runsOn: "Chạy trên",
    },
    problem: { cite: "Điều chúng tôi nghe đi nghe lại" },
    flow: { eyebrow: "Cách vận hành", title: "Một ngày bình thường, *từng bước một*.", step: "Bước" },
    crew: {
      eyebrow: "Trong nhóm chat",
      title: "Trông thế nào *khi chạy thật*.",
      agents: "Các agent",
      capabilities: "Công cụ sử dụng",
      chatLabel: (room) => `Hội thoại ví dụ trong ${room}`,
      caption: "Hội thoại minh hoạ. Tên và chi tiết là giả định.",
    },
    guardrails: {
      eyebrow: "Con người cầm lái",
      title: "Chỗ nào *bạn* vẫn nắm quyền.",
      lede: "Agent lo phần việc chân tay. Đây là những lằn ranh chúng không vượt qua nếu chưa có người đồng ý.",
      note: "quyết định cuối cùng luôn là của bạn",
    },
    outcome: { eyebrow: "Điều gì thay đổi", remark: "Lời phê", runsOn: "Chạy trên", integrations: "Tất cả kênh và tích hợp" },
    related: { eyebrow: "Đọc tiếp", title: "Tiết *tiếp theo*." },
    cta: {
      title: "Muốn việc này có trong *thời khoá biểu* của đội bạn?",
      body: "Kể chúng tôi nghe đội bạn đang làm việc thế nào. Chúng tôi sẽ thiết kế agent, công cụ và bước duyệt theo đúng cách đó, rồi cùng bạn triển khai.",
      primary: "Dựng việc này cùng chúng tôi",
      secondary: "Hỏi dewee ngay",
      note: "gói On-Premises đã gồm năm quy trình tuỳ chỉnh",
    },
  },
};
