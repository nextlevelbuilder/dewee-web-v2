/**
 * Growth: nightly SEO audits, ranking watch, content gaps and drafted fixes.
 * Verified against dewee: headless browser, web_search / web_fetch with domain policy,
 * MCP bridge (search data is connected through an MCP server set up with the customer),
 * cron, knowledge vault, traces. dewee has no built-in Search Console integration.
 */
import type { UseCase } from "./types";

export const seoAroundTheClock: UseCase = {
  slug: "seo-around-the-clock",
  icon: "search",
  area: "marketing",
  team: { en: "Growth", vi: "Tăng trưởng" },
  title: { en: "SEO that never clocks out", vi: "Phân tích & cải thiện SEO 24/7" },
  summary: {
    en: "Audit pages, watch rankings, find content gaps and draft fixes, with a weekly report your team can act on.",
    vi: "Rà soát trang, theo dõi thứ hạng, tìm khoảng trống nội dung và đề xuất bản sửa, kèm báo cáo tuần dễ hành động.",
  },
  channels: ["slack", "lark"],
  detail: {
    problem: {
      en: "SEO is everyone's second job. We run an audit once a quarter, fix the loudest issues, and quietly lose rankings in between without anyone noticing.",
      vi: "SEO là việc tay trái của tất cả mọi người. Mỗi quý chạy audit một lần, sửa vài lỗi to nhất, rồi thứ hạng lặng lẽ tụt dần ở giữa mà không ai để ý.",
    },
    flow: {
      en: [
        "Every night the audit agent opens your key pages in a headless browser and checks titles, links, speed signals and structured data.",
        "It watches your target keywords through the search data you connect, such as a ranking tool or Search Console via an MCP server.",
        "The content strategist agent compares your pages with what ranks and lists the gaps.",
        "For each issue it drafts a concrete fix: a new title, a meta description or an outline for a missing page.",
        "Every Monday the team gets a short report in Slack, sorted by effort and likely impact.",
      ],
      vi: [
        "Mỗi đêm, agent audit mở các trang quan trọng bằng trình duyệt headless và kiểm tra tiêu đề, liên kết, tín hiệu tốc độ và dữ liệu có cấu trúc.",
        "Agent theo dõi các từ khoá mục tiêu qua nguồn dữ liệu tìm kiếm bạn kết nối, ví dụ công cụ đo thứ hạng hay Search Console thông qua một MCP server.",
        "Agent chiến lược nội dung so sánh trang của bạn với các trang đang xếp hạng cao và liệt kê khoảng trống.",
        "Với mỗi vấn đề, agent soạn sẵn bản sửa cụ thể: tiêu đề mới, meta description hay dàn ý cho trang còn thiếu.",
        "Mỗi thứ Hai, cả đội nhận một báo cáo ngắn trong Slack, sắp xếp theo công sức và mức độ ảnh hưởng.",
      ],
    },
    agents: {
      en: ["SEO audit agent", "Content strategist agent"],
      vi: ["Agent audit SEO", "Agent chiến lược nội dung"],
    },
    capabilities: {
      en: ["Headless browser", "Web search & fetch", "MCP servers", "Cron schedules", "Knowledge vault", "Traces"],
      vi: ["Trình duyệt headless", "Web search & fetch", "MCP server", "Lịch cron", "Kho tri thức", "Trace"],
    },
    guardrails: {
      en: [
        "It never publishes. Every fix is a draft for your team to review and ship.",
        "It crawls only the domains you allow.",
        "Search data is connected read-only.",
        "Drafts follow the style guide in your knowledge vault.",
        "Every finding links to the page and the evidence behind it.",
      ],
      vi: [
        "Agent không bao giờ tự đăng. Mọi bản sửa là bản nháp để đội bạn xem lại và đưa lên.",
        "Agent chỉ thu thập dữ liệu trên các tên miền bạn cho phép.",
        "Dữ liệu tìm kiếm được kết nối ở chế độ chỉ đọc.",
        "Bản nháp tuân theo hướng dẫn văn phong trong kho tri thức của bạn.",
        "Phát hiện nào cũng dẫn tới trang liên quan và bằng chứng cụ thể.",
      ],
    },
    chat: { channel: "slack", room: { en: "#growth", vi: "#growth" } },
    transcript: {
      en: [
        { who: "dewee", me: true, text: "Weekly SEO ✓ 1. Fourteen product pages share the same meta description. 2. The pricing page slipped two positions for your main keyword. 3. Nobody has a page on connecting Zalo OA to an AI assistant yet." },
        { who: "Bich", role: "Growth lead", text: "@dewee draft an outline for 3 and the fixes for 1." },
        { who: "dewee", me: true, text: "Fourteen meta descriptions are drafted, each under 160 characters. The outline is in the doc. Should I open a task for Son to review?" },
        { who: "Bich", role: "Growth lead", text: "Yes, due Wednesday." },
      ],
      vi: [
        { who: "dewee", me: true, text: "Báo cáo SEO tuần ✓ 1. 14 trang sản phẩm dùng chung một meta description. 2. Trang bảng giá tụt hai bậc với từ khoá chính. 3. Chưa có trang nào hướng dẫn kết nối Zalo OA với trợ lý AI." },
        { who: "Chị Bích", role: "Trưởng nhóm Growth", text: "@dewee soạn dàn ý cho mục 3 và bản sửa cho mục 1 nhé." },
        { who: "dewee", me: true, text: "Em soạn xong 14 meta description, mỗi cái dưới 160 ký tự ạ. Dàn ý em để trong file. Em tạo việc cho anh Sơn review nhé chị?" },
        { who: "Chị Bích", role: "Trưởng nhóm Growth", text: "Ừ, hạn thứ Tư." },
      ],
    },
    outcome: {
      en: "Small SEO problems get caught the week they appear, not the quarter after. Your team spends its time deciding and shipping fixes rather than hunting for them.",
      vi: "Lỗi SEO nhỏ được phát hiện ngay trong tuần nó xuất hiện, không phải một quý sau. Đội của bạn dành thời gian để quyết định và đưa bản sửa lên, thay vì đi tìm lỗi.",
    },
    description: {
      en: "dewee agents audit your pages every night, watch rankings, find content gaps and draft the fixes, then send a weekly SEO report your team can act on in Slack.",
      vi: "Agent dewee rà soát website mỗi đêm, theo dõi thứ hạng, tìm khoảng trống nội dung và soạn sẵn bản sửa, rồi gửi báo cáo SEO hằng tuần vào Slack để đội bạn xử lý.",
    },
    related: ["ads-performance-watch", "social-media-care", "software-delivery"],
  },
};
