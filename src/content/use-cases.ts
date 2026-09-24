/**
 * The use-case catalogue. The index fields below feed the homepage table of contents and
 * /use-cases; each entry's `detail` powers /use-cases/<slug>.
 */
import type { Bi } from "~/i18n/config";

export type UseCaseDetail = {
  /** The pain, in the customer's words */
  problem: Bi;
  /** What the agents actually do, step by step */
  flow: Bi<string[]>;
  /** Agents involved (role names) */
  agents: Bi<string[]>;
  /** dewee capabilities used (features/tools) */
  capabilities: Bi<string[]>;
  /** Guardrails / human-in-the-loop */
  guardrails: Bi<string[]>;
  /** A short sample exchange shown as a chat transcript */
  transcript: Bi<{ who: string; text: string; me?: boolean }[]>;
  /** Qualitative outcome (no invented metrics) */
  outcome: Bi;
};

export type UseCase = {
  slug: string;
  icon: string;
  team: Bi;
  title: Bi;
  summary: Bi;
  channels: string[];
  detail?: UseCaseDetail;
};

export const USE_CASES: UseCase[] = [
  {
    slug: "software-delivery",
    icon: "code",
    team: { en: "Engineering", vi: "Kỹ thuật" },
    title: { en: "Ship software while the team sleeps", vi: "Tự động hoá quy trình phát triển phần mềm" },
    summary: { en: "Agents triage issues, write and review code, run tests and open pull requests, then report in the team chat.", vi: "Agent phân loại issue, viết và review code, chạy test, mở pull request rồi báo cáo ngay trong nhóm chat." },
    channels: ["slack", "discord", "telegram"],
  },
  {
    slug: "social-media-care",
    icon: "megaphone",
    team: { en: "Marketing", vi: "Marketing" },
    title: { en: "Look after every social account", vi: "Chăm sóc tài khoản mạng xã hội" },
    summary: { en: "Plan the calendar, draft posts in your voice, answer comments and DMs, and flag anything that needs a human.", vi: "Lên lịch nội dung, viết bài đúng giọng thương hiệu, trả lời bình luận và tin nhắn, báo lại khi cần người xử lý." },
    channels: ["facebook", "pancake", "zalo"],
  },
  {
    slug: "ai-coworker-in-group-chats",
    icon: "messages-square",
    team: { en: "Every team", vi: "Mọi phòng ban" },
    title: { en: "A co-worker in your group chats", vi: "Đồng nghiệp AI trong nhóm chat" },
    summary: { en: "An agent that listens, remembers the thread, chips in when @mentioned and keeps decisions from getting lost.", vi: "Agent lắng nghe, nhớ mạch trao đổi, góp ý khi được @nhắc tên và giữ cho các quyết định không bị trôi." },
    channels: ["telegram", "zalo", "lark", "slack"],
  },
  {
    slug: "real-estate-market-signals",
    icon: "building-2",
    team: { en: "Real estate", vi: "Bất động sản" },
    title: { en: "Read the real-estate market every morning", vi: "Thu thập tín hiệu thị trường bất động sản" },
    summary: { en: "Scan listings, news and zoning updates, spot price moves by district and deliver a morning brief to the sales floor.", vi: "Quét tin rao, tin tức, quy hoạch; phát hiện biến động giá theo khu vực và gửi bản tin sáng cho đội kinh doanh." },
    channels: ["zalo", "telegram"],
  },
  {
    slug: "hr-recruiting",
    icon: "briefcase",
    team: { en: "People & HR", vi: "Nhân sự" },
    title: { en: "Screen candidates without the backlog", vi: "Hỗ trợ tuyển dụng & review hồ sơ" },
    summary: { en: "Read CVs against the job brief, shortlist with reasons, schedule interviews and keep candidates in the loop.", vi: "Đọc CV theo mô tả công việc, lọc danh sách kèm lý do, xếp lịch phỏng vấn và cập nhật cho ứng viên." },
    channels: ["lark", "slack", "zalo"],
  },
  {
    slug: "creative-ad-production",
    icon: "clapperboard",
    team: { en: "Creative", vi: "Sáng tạo" },
    title: { en: "From brief to storyboard to ad cut", vi: "Thiết kế & dựng phim quảng cáo" },
    summary: { en: "Turn a brief into concepts, scripts, storyboards, images and draft videos, with review rounds right in the chat.", vi: "Biến brief thành ý tưởng, kịch bản, storyboard, hình ảnh và video nháp, duyệt vòng góp ý ngay trong nhóm chat." },
    channels: ["slack", "discord", "telegram"],
  },
  {
    slug: "customer-care-with-handoff",
    icon: "headset",
    team: { en: "Customer care", vi: "Chăm sóc khách hàng" },
    title: { en: "Customer care that knows when to hand off", vi: "Chăm sóc khách hàng, chuyển người thật khi cần" },
    summary: { en: "Answer customers around the clock from your knowledge base and pass the conversation to a human, with context, when it matters.", vi: "Trả lời khách 24/7 từ kho tri thức và chuyển cuộc trò chuyện cho nhân viên, kèm đủ ngữ cảnh, khi cần thiết." },
    channels: ["zalo", "facebook", "whatsapp", "pancake"],
  },
  {
    slug: "stock-market-sentiment",
    icon: "chart-line",
    team: { en: "Investment research", vi: "Phân tích đầu tư" },
    title: { en: "Measure market sentiment, not just price", vi: "Đo lường sentiment thị trường chứng khoán" },
    summary: { en: "Track news, forums and filings for the tickers you follow, score the mood and alert the desk on sharp shifts.", vi: "Theo dõi tin tức, diễn đàn và báo cáo của mã bạn quan tâm, chấm điểm tâm lý thị trường và cảnh báo khi đổi chiều." },
    channels: ["telegram", "discord"],
  },
  {
    slug: "sales-knowledge-assistant",
    icon: "book-open",
    team: { en: "Sales", vi: "Kinh doanh" },
    title: { en: "Every salesperson, fully briefed", vi: "Trợ lý sales với tri thức nội bộ" },
    summary: { en: "Instant answers on pricing, specs and policies from your internal knowledge, plus quotes and follow-ups drafted for approval.", vi: "Trả lời tức thì về giá, thông số, chính sách từ tri thức nội bộ; soạn sẵn báo giá và lịch chăm sóc để duyệt." },
    channels: ["zalo", "lark", "telegram"],
  },
  {
    slug: "retail-pod-design",
    icon: "shopping-bag",
    team: { en: "Retail & e-commerce", vi: "Bán lẻ & TMĐT" },
    title: { en: "Research, design and ship print-on-demand", vi: "Nghiên cứu, thiết kế & sản xuất POD" },
    summary: { en: "Find trending niches, generate on-brand designs, prepare mockups and listings, and hand them to production.", vi: "Tìm ngách đang lên, tạo thiết kế đúng thương hiệu, dựng mockup và mô tả sản phẩm, rồi chuyển cho sản xuất." },
    channels: ["slack", "telegram"],
  },
  {
    slug: "seo-around-the-clock",
    icon: "search",
    team: { en: "Growth", vi: "Tăng trưởng" },
    title: { en: "SEO that never clocks out", vi: "Phân tích & cải thiện SEO 24/7" },
    summary: { en: "Audit pages, watch rankings, find content gaps and draft fixes, with a weekly report your team can act on.", vi: "Rà soát trang, theo dõi thứ hạng, tìm khoảng trống nội dung và đề xuất bản sửa, kèm báo cáo tuần dễ hành động." },
    channels: ["slack", "lark"],
  },
  {
    slug: "task-chasing",
    icon: "list-checks",
    team: { en: "Operations", vi: "Vận hành" },
    title: { en: "The polite colleague who chases every task", vi: "Quản lý & nhắc việc nội bộ mỗi ngày" },
    summary: { en: "Collect daily updates, nudge owners before deadlines, spot blockers early and give managers a clean status board.", vi: "Thu thập cập nhật mỗi ngày, nhắc người phụ trách trước hạn, phát hiện điểm nghẽn sớm và gửi quản lý bảng tiến độ gọn gàng." },
    channels: ["lark", "zalo", "telegram", "bitrix24"],
  },
  {
    slug: "meeting-notes-and-decisions",
    icon: "notebook-pen",
    team: { en: "Leadership", vi: "Ban điều hành" },
    title: { en: "Meetings that end with decisions", vi: "Tóm tắt cuộc họp & đề xuất quyết định" },
    summary: { en: "Summarise the meeting, pull out decisions and owners, and propose next steps for each team to confirm.", vi: "Tóm tắt cuộc họp, rút ra quyết định và người phụ trách, đề xuất bước tiếp theo cho từng phòng ban xác nhận." },
    channels: ["lark", "slack", "telegram"],
  },
  {
    slug: "ads-performance-watch",
    icon: "trending-up",
    team: { en: "Performance marketing", vi: "Quảng cáo" },
    title: { en: "Watch Google & Facebook ads like a hawk", vi: "Theo dõi & tối ưu quảng cáo Google, Facebook" },
    summary: { en: "Monitor spend, CPA and ROAS, catch anomalies within the hour and suggest budget or creative changes for approval.", vi: "Theo dõi chi tiêu, CPA, ROAS; bắt bất thường trong vòng một giờ và đề xuất điều chỉnh ngân sách hay creative để duyệt." },
    channels: ["telegram", "slack", "zalo"],
  },
];

export const useCaseBySlug = (slug: string) => USE_CASES.find((u) => u.slug === slug);
