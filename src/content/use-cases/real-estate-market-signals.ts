/**
 * Real estate: a sourced morning brief for the sales floor.
 * Verified against dewee: cron, web_search / web_fetch (domain allow-list), headless browser,
 * memory, knowledge vault, delivery to Zalo and Telegram groups, traces.
 */
import type { UseCase } from "./types";

export const realEstateMarketSignals: UseCase = {
  slug: "real-estate-market-signals",
  icon: "building-2",
  area: "research",
  team: { en: "Real estate", vi: "Bất động sản" },
  title: { en: "Read the real-estate market every morning", vi: "Thu thập tín hiệu thị trường bất động sản" },
  summary: {
    en: "Scan listings, news and zoning updates, spot price moves by district and deliver a morning brief to the sales floor.",
    vi: "Quét tin rao, tin tức, quy hoạch; phát hiện biến động giá theo khu vực và gửi bản tin sáng cho đội kinh doanh.",
  },
  channels: ["zalo", "telegram"],
  detail: {
    problem: {
      en: "Our salespeople read the same ten listing sites every morning, each in their own way. By the time someone notices prices moving in a district, the client has already heard it from a competitor.",
      vi: "Sáng nào sales cũng tự lướt cùng chục trang tin rao, mỗi người một kiểu. Tới lúc có người để ý giá một khu đang nhích lên thì khách đã nghe tin từ bên đối thủ rồi.",
    },
    flow: {
      en: [
        "Before sunrise, a scheduled job wakes the research agent.",
        "It reads the listing sites, news outlets and planning announcements you chose, with web search and a headless browser.",
        "It compares today's asking prices with the history it keeps in memory, district by district.",
        "It flags notable moves, new projects and zoning news, each with a link to the source.",
        "At 7:00 a short brief lands in the sales group on Zalo, and anyone can ask a follow-up question right there.",
      ],
      vi: [
        "Trước khi trời sáng, một lịch cron đánh thức agent nghiên cứu.",
        "Agent đọc các trang tin rao, báo và thông báo quy hoạch bạn đã chọn, bằng web search và trình duyệt headless.",
        "Agent so giá chào bán hôm nay với lịch sử được lưu trong bộ nhớ, theo từng quận, từng khu.",
        "Agent đánh dấu biến động đáng chú ý, dự án mới và tin quy hoạch, kèm đường dẫn tới nguồn.",
        "7 giờ sáng, bản tin ngắn gửi vào nhóm Zalo của đội sales, ai cũng có thể hỏi thêm ngay trong nhóm.",
      ],
    },
    agents: {
      en: ["Market research agent"],
      vi: ["Agent nghiên cứu thị trường"],
    },
    capabilities: {
      en: ["Cron schedules", "Web search & fetch", "Headless browser", "Memory", "Knowledge vault", "Zalo & Telegram delivery"],
      vi: ["Lịch cron", "Web search & fetch", "Trình duyệt headless", "Bộ nhớ", "Kho tri thức", "Gửi bản tin qua Zalo & Telegram"],
    },
    guardrails: {
      en: [
        "Web fetches follow a domain allow-list you control.",
        "Every figure in the brief links back to where it came from. No source, no claim.",
        "The brief goes to your sales team only. Nothing is sent to clients automatically.",
        "It reports signals, not advice. Pricing and client conversations stay with your people.",
        "Runs are traced, so you can check what it read on any given morning.",
      ],
      vi: [
        "Việc đọc web tuân theo danh sách tên miền được phép do bạn kiểm soát.",
        "Con số nào trong bản tin cũng dẫn về nguồn gốc. Không có nguồn thì không đưa vào.",
        "Bản tin chỉ gửi cho đội sales. Không có gì tự động gửi tới khách hàng.",
        "Agent báo tín hiệu, không đưa lời khuyên. Định giá và trao đổi với khách vẫn là việc của con người.",
        "Mỗi lần chạy đều có trace, bạn kiểm tra được agent đã đọc gì vào bất kỳ buổi sáng nào.",
      ],
    },
    chat: { channel: "zalo", room: { en: "Thu Duc sales floor", vi: "Sàn kinh doanh Thủ Đức" } },
    transcript: {
      en: [
        { who: "dewee", me: true, text: "Morning brief ✓ Asking prices for 2-bedroom flats in An Phu edged up for a third week. One new project was filed in Thu Thiem, and the ward published a revised road plan. Sources below." },
        { who: "Nam", role: "Sales", text: "@dewee which listings moved the most?" },
        { who: "dewee", me: true, text: "Five listings in two buildings, all posted by the same agency. It may be one seller repricing rather than the whole area. I'll keep an eye on it tomorrow." },
        { who: "Chi", role: "Sales manager", text: "Good catch. Nam, mention that caveat when you call the Nguyen family." },
      ],
      vi: [
        { who: "dewee", me: true, text: "Bản tin sáng ✓ Giá chào căn 2 phòng ngủ ở An Phú nhích lên tuần thứ ba liên tiếp. Thủ Thiêm có một dự án mới nộp hồ sơ, phường vừa công bố điều chỉnh quy hoạch đường. Nguồn ở bên dưới ạ." },
        { who: "Anh Nam", role: "Sales", text: "@dewee tin nào tăng giá mạnh nhất em?" },
        { who: "dewee", me: true, text: "Năm tin ở hai toà nhà, cùng một đơn vị môi giới đăng ạ. Có thể chỉ là một chủ nhà điều chỉnh giá, chưa hẳn cả khu. Mai em theo dõi tiếp." },
        { who: "Chị Chi", role: "Trưởng phòng kinh doanh", text: "Tinh ý đấy. Nam gọi cho gia đình chú Nguyên thì nhớ nói rõ chỗ này nhé." },
      ],
    },
    outcome: {
      en: "The sales floor starts the day with the same picture of the market, sourced and dated. Salespeople spend the morning calling clients instead of refreshing listing sites, and they bring the caveats along with the headlines.",
      vi: "Cả sàn bắt đầu ngày mới với cùng một bức tranh thị trường, có nguồn, có ngày. Sales dành buổi sáng gọi khách thay vì ngồi làm mới trang tin rao, và nói với khách cả những điểm cần lưu ý chứ không chỉ mỗi tiêu đề.",
    },
    description: {
      en: "Every morning a dewee agent reads listing sites, news and zoning updates, spots price moves by district and sends a sourced brief to your sales team on Zalo.",
      vi: "Mỗi sáng, agent dewee đọc tin rao, báo chí và thông tin quy hoạch, phát hiện biến động giá theo khu vực và gửi bản tin có dẫn nguồn cho đội sales qua Zalo.",
    },
    related: ["stock-market-sentiment", "sales-knowledge-assistant", "seo-around-the-clock"],
  },
};
