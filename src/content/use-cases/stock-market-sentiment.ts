/**
 * Investment research: sentiment scores with evidence, alerts only on sharp shifts.
 * Verified against dewee: cron, heartbeat with active hours (silent on HEARTBEAT_OK),
 * web_search / web_fetch with domain policy, read_document for PDF filings, memory,
 * Telegram and Discord delivery. No brokerage integration exists; the agent cannot trade.
 */
import type { UseCase } from "./types";

export const stockMarketSentiment: UseCase = {
  slug: "stock-market-sentiment",
  icon: "chart-line",
  area: "research",
  team: { en: "Investment research", vi: "Phân tích đầu tư" },
  title: { en: "Measure market sentiment, not just price", vi: "Đo lường sentiment thị trường chứng khoán" },
  summary: {
    en: "Track news, forums and filings for the tickers you follow, score the mood and alert the desk on sharp shifts.",
    vi: "Theo dõi tin tức, diễn đàn và báo cáo của mã bạn quan tâm, chấm điểm tâm lý thị trường và cảnh báo khi đổi chiều.",
  },
  channels: ["telegram", "discord"],
  detail: {
    problem: {
      en: "Price tells us what happened. By the time it moves, the mood behind it has been building for days in forums and news that nobody on the desk had time to read.",
      vi: "Giá chỉ cho biết chuyện đã xảy ra. Tới lúc giá chạy, tâm lý phía sau đã âm ỉ mấy ngày trên diễn đàn và mặt báo mà chẳng ai trong nhóm kịp đọc.",
    },
    flow: {
      en: [
        "You set the watchlist and the sources the agent may read: news sites, forums and company filings.",
        "Before the market opens, it gathers what changed overnight, including PDF filings and reports.",
        "It scores the mood for each ticker and explains the score in two lines, with links.",
        "During trading hours a heartbeat checks every 30 minutes and stays silent when nothing has changed.",
        "When the mood shifts sharply, the desk gets an alert on Telegram with the evidence attached.",
      ],
      vi: [
        "Bạn đặt danh sách mã theo dõi và các nguồn agent được phép đọc: trang tin, diễn đàn và báo cáo doanh nghiệp.",
        "Trước giờ mở cửa, agent tổng hợp những gì thay đổi qua đêm, kể cả báo cáo và tài liệu PDF.",
        "Agent chấm điểm tâm lý cho từng mã và giải thích điểm số trong hai dòng, kèm đường dẫn.",
        "Trong giờ giao dịch, heartbeat kiểm tra mỗi 30 phút và im lặng khi không có gì thay đổi.",
        "Khi tâm lý đổi chiều mạnh, cả nhóm nhận cảnh báo trên Telegram kèm bằng chứng.",
      ],
    },
    agents: {
      en: ["Sentiment analyst agent"],
      vi: ["Agent phân tích tâm lý thị trường"],
    },
    capabilities: {
      en: ["Cron schedules", "Heartbeat with active hours", "Web search & fetch", "Document reading (PDF filings)", "Memory", "Telegram & Discord alerts"],
      vi: ["Lịch cron", "Heartbeat theo khung giờ", "Web search & fetch", "Đọc tài liệu (báo cáo PDF)", "Bộ nhớ", "Cảnh báo qua Telegram & Discord"],
    },
    guardrails: {
      en: [
        "It is never connected to a brokerage account and cannot place orders.",
        "Every score comes with the articles and posts behind it, so an analyst can check the reasoning.",
        "It reads only the sources on your allow-list.",
        "It works inside trading hours and stays quiet when there is nothing new.",
        "Scores are research input. Your analysts make the call.",
      ],
      vi: [
        "Agent không bao giờ được nối vào tài khoản chứng khoán và không thể đặt lệnh.",
        "Điểm số nào cũng đi kèm các bài viết, bài đăng làm căn cứ, để chuyên viên kiểm tra lập luận.",
        "Agent chỉ đọc các nguồn nằm trong danh sách cho phép.",
        "Agent làm việc trong giờ giao dịch và im lặng khi không có gì mới.",
        "Điểm số chỉ là đầu vào cho phân tích. Quyết định thuộc về chuyên viên của bạn.",
      ],
    },
    chat: { channel: "telegram", room: { en: "Research desk", vi: "Bàn phân tích" } },
    transcript: {
      en: [
        { who: "dewee", me: true, text: "Mood shift on the steel names in your watchlist: from +0.4 to −0.3 since 9:00. Main driver is a widely shared article on possible export duties. Links below." },
        { who: "Phong", role: "Analyst", text: "@dewee is that new, or a rehash?" },
        { who: "dewee", me: true, text: "Mostly a rehash of last month's draft rule. No new official notice yet. Forum volume is up, but price is flat so far." },
        { who: "Phong", role: "Analyst", text: "Noted. I'll brief the desk before the afternoon session." },
      ],
      vi: [
        { who: "dewee", me: true, text: "Tâm lý nhóm mã thép trong danh sách theo dõi đổi chiều: từ +0,4 xuống −0,3 kể từ 9 giờ. Nguyên nhân chính là một bài báo được chia sẻ nhiều về khả năng áp thuế xuất khẩu. Đường dẫn ở dưới ạ." },
        { who: "Anh Phong", role: "Chuyên viên phân tích", text: "@dewee tin mới hay tin cũ xào lại em?" },
        { who: "dewee", me: true, text: "Chủ yếu nhắc lại dự thảo tháng trước anh ạ. Chưa có thông báo chính thức mới. Lượng thảo luận trên diễn đàn tăng, nhưng giá tới giờ vẫn đi ngang." },
        { who: "Anh Phong", role: "Chuyên viên phân tích", text: "Ok. Anh sẽ báo cả nhóm trước phiên chiều." },
      ],
    },
    outcome: {
      en: "The desk hears about a change in mood when it starts, not after the price has moved, and every alert arrives with enough evidence to judge it in a minute. Quiet days stay quiet.",
      vi: "Cả nhóm biết tâm lý thị trường thay đổi ngay khi nó bắt đầu, chứ không phải sau khi giá đã chạy, và cảnh báo nào cũng đủ bằng chứng để đánh giá trong một phút. Ngày yên ả thì vẫn yên ả.",
    },
    description: {
      en: "A dewee agent reads news, forums and filings for your watchlist, scores sentiment with evidence and alerts your desk on Telegram only when the mood shifts.",
      vi: "Agent dewee đọc tin tức, diễn đàn và báo cáo của các mã bạn theo dõi, chấm điểm tâm lý có dẫn chứng, và chỉ báo lên Telegram khi thị trường thực sự đổi chiều.",
    },
    related: ["real-estate-market-signals", "meeting-notes-and-decisions", "ads-performance-watch"],
  },
};
