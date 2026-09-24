/**
 * Performance marketing: hourly checks on ad spend and results, alerts with numbers, fixes as
 * suggestions. dewee has no built-in ads-platform integration: ad accounts are connected
 * read-only through an MCP server set up with the customer. Verified: MCP bridge, heartbeat
 * (silent on HEARTBEAT_OK), cron, memory, Telegram / Slack / Zalo delivery, traces.
 */
import type { UseCase } from "./types";

export const adsPerformanceWatch: UseCase = {
  slug: "ads-performance-watch",
  icon: "trending-up",
  area: "marketing",
  team: { en: "Performance marketing", vi: "Quảng cáo" },
  title: { en: "Watch Google & Facebook ads like a hawk", vi: "Theo dõi & tối ưu quảng cáo Google, Facebook" },
  summary: {
    en: "Monitor spend, CPA and ROAS, catch anomalies within the hour and suggest budget or creative changes for approval.",
    vi: "Theo dõi chi tiêu, CPA, ROAS; bắt bất thường trong vòng một giờ và đề xuất điều chỉnh ngân sách hay creative để duyệt.",
  },
  channels: ["telegram", "slack", "zalo"],
  detail: {
    problem: {
      en: "Our ads spend money all night. We find out about a broken campaign the next morning, after the budget is gone and the report looks like a crime scene.",
      vi: "Quảng cáo tiêu tiền suốt đêm. Sáng hôm sau mới biết một chiến dịch bị lỗi, lúc ngân sách đã cháy sạch và báo cáo nhìn như hiện trường vụ án.",
    },
    flow: {
      en: [
        "Your Google and Facebook ad accounts are connected read-only through an MCP server we set up with you.",
        "Every hour a heartbeat compares spend, CPA and ROAS with your targets, and stays quiet when all is well.",
        "When something breaks pattern, such as spend with no conversions, a sudden cost jump or a dead creative, the team gets an alert within the hour.",
        "The analyst agent looks for a likely cause and suggests a fix: pause, shift budget or refresh the creative.",
        "Every Monday it sends a summary of what changed and what it learned, drawing on past campaigns in memory.",
      ],
      vi: [
        "Tài khoản quảng cáo Google và Facebook được kết nối ở chế độ chỉ đọc qua một MCP server chúng tôi cùng bạn thiết lập.",
        "Mỗi giờ, heartbeat so sánh chi tiêu, CPA và ROAS với mục tiêu, và im lặng khi mọi thứ ổn.",
        "Khi có bất thường, như tiêu tiền mà không có chuyển đổi, chi phí tăng vọt hay creative hết hiệu quả, cả đội nhận cảnh báo trong vòng một giờ.",
        "Agent phân tích tìm nguyên nhân khả dĩ và đề xuất cách xử lý: tạm dừng, dời ngân sách hay làm mới creative.",
        "Mỗi thứ Hai, agent gửi bản tổng kết những gì đã thay đổi và rút ra được, dựa trên các chiến dịch cũ trong bộ nhớ.",
      ],
    },
    agents: {
      en: ["Ads monitor agent", "Performance analyst agent"],
      vi: ["Agent giám sát quảng cáo", "Agent phân tích hiệu quả"],
    },
    capabilities: {
      en: ["MCP servers", "Heartbeat checks", "Cron schedules", "Memory of past campaigns", "Telegram, Slack & Zalo alerts", "Traces"],
      vi: ["MCP server", "Kiểm tra định kỳ bằng heartbeat", "Lịch cron", "Ghi nhớ các chiến dịch cũ", "Cảnh báo qua Telegram, Slack & Zalo", "Trace"],
    },
    guardrails: {
      en: [
        "Ad accounts are connected read-only by default.",
        "Changes are suggestions. A person applies them in the ads manager.",
        "If you ever want it to make changes itself, that is a separate credential with its own approval step.",
        "Every alert carries the numbers behind it, so you can judge it at a glance.",
        "It stays quiet when things are going well.",
      ],
      vi: [
        "Mặc định, tài khoản quảng cáo chỉ được kết nối ở chế độ chỉ đọc.",
        "Thay đổi chỉ là đề xuất. Người thật thực hiện trong trình quản lý quảng cáo.",
        "Nếu muốn agent tự thay đổi, đó là một credential riêng với bước duyệt riêng.",
        "Cảnh báo nào cũng kèm số liệu, bạn đánh giá được ngay trong nháy mắt.",
        "Agent im lặng khi mọi thứ đang ổn.",
      ],
    },
    chat: { channel: "telegram", room: { en: "Ads team · Q4", vi: "Team Ads · Q4" } },
    transcript: {
      en: [
        { who: "dewee", me: true, text: "Alert: the “Mid-Autumn gift box” campaign on Facebook spent 4.2M VND in two hours with zero purchases. The likely cause is the checkout pixel, which stopped firing after the site update." },
        { who: "dewee", me: true, text: "Suggest pausing it until the pixel is fixed. Google campaigns look normal." },
        { who: "Vinh", role: "Ads lead", text: "Paused. @Long can you check the pixel?" },
        { who: "Long", role: "Web developer", text: "Found it. The tag was removed in the new checkout template. Fixing now." },
      ],
      vi: [
        { who: "dewee", me: true, text: "Cảnh báo: chiến dịch “Hộp quà Trung thu” trên Facebook tiêu 4,2 triệu đồng trong hai giờ mà không có đơn nào. Nguyên nhân khả dĩ: pixel ở trang thanh toán ngừng ghi nhận sau lần cập nhật website." },
        { who: "dewee", me: true, text: "Em đề xuất tạm dừng tới khi sửa xong pixel ạ. Các chiến dịch Google vẫn bình thường." },
        { who: "Anh Vinh", role: "Trưởng nhóm Ads", text: "Dừng rồi. @Long kiểm tra pixel giúp anh?" },
        { who: "Long", role: "Web developer", text: "Thấy rồi anh, template thanh toán mới bị mất tag. Em sửa ngay." },
      ],
    },
    outcome: {
      en: "Problems get caught in the hour they start, not the morning after. Your team decides with the numbers in front of them, and quiet nights stay quiet.",
      vi: "Sự cố được phát hiện ngay trong giờ nó bắt đầu, không phải sáng hôm sau. Đội của bạn quyết định với số liệu trước mặt, còn những đêm yên ả thì vẫn yên ả.",
    },
    description: {
      en: "dewee agents check your Google and Facebook ads every hour, alert the team when spend or results break pattern, and suggest fixes for a person to apply.",
      vi: "Agent dewee theo dõi quảng cáo Google và Facebook mỗi giờ, cảnh báo khi chi tiêu hay kết quả bất thường, và đề xuất cách xử lý để người thật thực hiện.",
    },
    related: ["seo-around-the-clock", "social-media-care", "stock-market-sentiment"],
  },
};
