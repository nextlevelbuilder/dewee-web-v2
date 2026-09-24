/**
 * Retail & e-commerce: trend research, on-brand print-on-demand designs, mockups and listings.
 * Verified against dewee: web_search, headless browser, create_image, read_image, agent teams
 * and delegation, send_file to chat, cron, usage caps, traces.
 */
import type { UseCase } from "./types";

export const retailPodDesign: UseCase = {
  slug: "retail-pod-design",
  icon: "shopping-bag",
  area: "make",
  team: { en: "Retail & e-commerce", vi: "Bán lẻ & TMĐT" },
  title: { en: "Research, design and ship print-on-demand", vi: "Nghiên cứu, thiết kế & sản xuất POD" },
  summary: {
    en: "Find trending niches, generate on-brand designs, prepare mockups and listings, and hand them to production.",
    vi: "Tìm ngách đang lên, tạo thiết kế đúng thương hiệu, dựng mockup và mô tả sản phẩm, rồi chuyển cho sản xuất.",
  },
  channels: ["slack", "telegram"],
  detail: {
    problem: {
      en: "Trends last a week. By the time we have researched a niche, briefed a designer and written the listings, the moment has passed and someone else is selling the shirt.",
      vi: "Trend chỉ sống được một tuần. Tới lúc nghiên cứu xong ngách, gửi brief cho designer rồi viết mô tả sản phẩm thì thời điểm đã qua, và người khác đã bán chiếc áo đó rồi.",
    },
    flow: {
      en: [
        "Each morning the trend agent scans marketplaces, social feeds and search interest for rising niches.",
        "It proposes a handful of ideas, each with the evidence behind it.",
        "For the ideas you pick, the design agent generates artwork that follows your brand rules.",
        "The listing agent prepares mockups, titles, descriptions and tags for each product.",
        "Approved files are sent to your production group in the chat. A person publishes the listings.",
      ],
      vi: [
        "Mỗi sáng, agent nghiên cứu trend quét sàn TMĐT, mạng xã hội và lượng tìm kiếm để tìm ngách đang lên.",
        "Agent đề xuất vài ý tưởng, mỗi ý tưởng kèm bằng chứng.",
        "Với ý tưởng bạn chọn, agent thiết kế tạo artwork theo đúng quy tắc thương hiệu.",
        "Agent listing dựng mockup, viết tiêu đề, mô tả và tag cho từng sản phẩm.",
        "File đã duyệt được gửi vào nhóm sản xuất ngay trong chat. Người thật đăng sản phẩm lên gian hàng.",
      ],
    },
    agents: {
      en: ["Trend research agent", "Design agent", "Listing agent"],
      vi: ["Agent nghiên cứu trend", "Agent thiết kế", "Agent listing"],
    },
    capabilities: {
      en: ["Web search & headless browser", "Image generation", "Image reading", "Agent teams & delegation", "File delivery in chat", "Cron schedules"],
      vi: ["Web search & trình duyệt headless", "Tạo hình ảnh", "Đọc hình ảnh", "Đội agent & giao việc", "Gửi file trong chat", "Lịch cron"],
    },
    guardrails: {
      en: [
        "A person approves every idea and every listing before it goes live.",
        "Your brand rules and no-go topics live in the knowledge vault, and every design follows them.",
        "Ideas that come too close to a registered brand or a famous character are flagged and dropped.",
        "Usage caps keep image generation inside your budget.",
        "Every design is traced back to the idea and evidence it came from.",
      ],
      vi: [
        "Người thật duyệt từng ý tưởng và từng listing trước khi đăng.",
        "Quy tắc thương hiệu và các chủ đề cấm nằm trong kho tri thức, mọi thiết kế đều tuân theo.",
        "Ý tưởng quá gần một thương hiệu đã đăng ký hay nhân vật nổi tiếng bị đánh dấu và loại bỏ.",
        "Giới hạn sử dụng giữ việc tạo ảnh trong ngân sách của bạn.",
        "Thiết kế nào cũng truy được về ý tưởng và bằng chứng ban đầu.",
      ],
    },
    chat: { channel: "telegram", room: { en: "POD studio", vi: "Xưởng POD" } },
    transcript: {
      en: [
        { who: "dewee", me: true, text: "Three rising niches today: retro pickleball tees, “cà phê sữa đá” line art, and Lunar New Year cat mugs. Evidence for each is in the doc." },
        { who: "Tram", role: "Store owner", text: "Do 1 and 2. Skip the mugs this week." },
        { who: "dewee", me: true, text: "Twelve designs ready ✓ I dropped one pickleball slogan because it is too close to a registered brand name." },
        { who: "Tram", role: "Store owner", text: "Good call. Send the mockups to Long for printing." },
      ],
      vi: [
        { who: "dewee", me: true, text: "Hôm nay có ba ngách đang lên ạ: áo pickleball phong cách retro, tranh nét “cà phê sữa đá”, và cốc mèo Tết. Bằng chứng từng ngách em để trong file." },
        { who: "Chị Trâm", role: "Chủ shop", text: "Làm 1 và 2. Tuần này bỏ qua cốc nhé." },
        { who: "dewee", me: true, text: "Xong 12 mẫu ✓ Em bỏ một câu slogan pickleball vì quá giống tên một thương hiệu đã đăng ký." },
        { who: "Chị Trâm", role: "Chủ shop", text: "Chuẩn. Gửi mockup cho Long in nhé." },
      ],
    },
    outcome: {
      en: "Ideas go from a trend to a finished mockup while the trend is still alive. Your designers and listing writers review and refine instead of starting from scratch, and risky ideas get caught before they go on sale.",
      vi: "Ý tưởng đi từ trend tới mockup hoàn chỉnh khi trend vẫn còn nóng. Designer và người viết mô tả chỉ cần duyệt và tinh chỉnh thay vì làm từ đầu, còn ý tưởng rủi ro bị chặn lại trước khi lên kệ.",
    },
    description: {
      en: "dewee agents spot rising print-on-demand niches, generate on-brand designs, prepare mockups and listings and hand approved files to the production team in chat.",
      vi: "Agent dewee tìm ngách print-on-demand đang lên, tạo thiết kế đúng thương hiệu, dựng mockup và mô tả sản phẩm, rồi gửi file đã duyệt cho đội sản xuất qua chat.",
    },
    related: ["creative-ad-production", "social-media-care", "seo-around-the-clock"],
  },
};
