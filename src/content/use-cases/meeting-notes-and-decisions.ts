/**
 * Leadership: meeting summaries, decisions with owners, and follow-ups before the next meeting.
 * Verified against dewee: read_audio (transcription via enabled providers), read_document,
 * team task board, delegation between agents, Lark topics and Slack threads, memory, reminders.
 */
import type { UseCase } from "./types";

export const meetingNotesAndDecisions: UseCase = {
  slug: "meeting-notes-and-decisions",
  icon: "notebook-pen",
  area: "operations",
  team: { en: "Leadership", vi: "Ban điều hành" },
  title: { en: "Meetings that end with decisions", vi: "Tóm tắt cuộc họp & đề xuất quyết định" },
  summary: {
    en: "Summarise the meeting, pull out decisions and owners, and propose next steps for each team to confirm.",
    vi: "Tóm tắt cuộc họp, rút ra quyết định và người phụ trách, đề xuất bước tiếp theo cho từng phòng ban xác nhận.",
  },
  channels: ["lark", "slack", "telegram"],
  detail: {
    problem: {
      en: "We meet for two hours, agree on five things, and a week later nobody remembers who owns which one. The minutes arrive late, if they arrive at all.",
      vi: "Họp hai tiếng, thống nhất năm việc, một tuần sau chẳng ai nhớ việc nào của ai. Biên bản gửi muộn, mà nhiều khi còn không có.",
    },
    flow: {
      en: [
        "Someone drops the recording or the notes into the leadership chat.",
        "The minutes agent transcribes the audio and reads any slides or documents that were shared.",
        "It writes a one-page summary: what was discussed, what was decided and what is still open.",
        "Each decision goes to its owner as a proposal, with the next step and a date to confirm.",
        "Confirmed items become tasks, and the follow-up agent checks on them before the next meeting.",
      ],
      vi: [
        "Ai đó gửi file ghi âm hoặc ghi chú vào nhóm chat của ban điều hành.",
        "Agent biên bản chuyển ghi âm thành văn bản và đọc các slide, tài liệu được chia sẻ trong buổi họp.",
        "Agent viết bản tóm tắt một trang: đã bàn gì, đã quyết gì và việc gì còn bỏ ngỏ.",
        "Mỗi quyết định được gửi tới người phụ trách dưới dạng đề xuất, kèm bước tiếp theo và ngày cần xác nhận.",
        "Mục đã xác nhận trở thành đầu việc, agent theo dõi sẽ kiểm tra tiến độ trước buổi họp kế tiếp.",
      ],
    },
    agents: {
      en: ["Minutes agent", "Follow-up agent"],
      vi: ["Agent biên bản", "Agent theo dõi"],
    },
    capabilities: {
      en: ["Audio transcription", "Document reading", "Team task board", "Delegation between agents", "Lark topics & Slack threads", "Memory"],
      vi: ["Chuyển ghi âm thành văn bản", "Đọc tài liệu", "Bảng việc của đội", "Giao việc giữa các agent", "Topic trên Lark & thread trên Slack", "Bộ nhớ"],
    },
    guardrails: {
      en: [
        "Decisions stay proposals until the owner confirms them.",
        "Minutes go only to the people who attended and the teams named in them.",
        "Audio is transcribed only by the providers you enable.",
        "Every summary links back to the source recording or notes.",
        "Follow-ups respect working hours and reminder limits.",
      ],
      vi: [
        "Quyết định chỉ là đề xuất cho tới khi người phụ trách xác nhận.",
        "Biên bản chỉ gửi cho người dự họp và các phòng ban được nêu tên.",
        "Ghi âm chỉ được chuyển thành văn bản bởi nhà cung cấp mà bạn bật.",
        "Bản tóm tắt nào cũng có đường dẫn về file ghi âm hoặc ghi chú gốc.",
        "Việc theo dõi tuân theo giờ làm việc và giới hạn số lần nhắc.",
      ],
    },
    chat: { channel: "lark", room: { en: "Leadership team", vi: "Ban điều hành" } },
    transcript: {
      en: [
        { who: "Quang", role: "CEO", text: "Recording from today's planning meeting. @dewee summary and owners, please." },
        { who: "dewee", me: true, text: "Three decisions: 1. Open the Da Nang showroom in Q1 (Hai). 2. Pause new hiring until the October review (Mai). 3. Move ERP go-live to 15 November (Son). Each owner has a proposal to confirm." },
        { who: "dewee", me: true, text: "Hai and Mai have confirmed ✓ Son is checking the new date with the vendor." },
        { who: "Son", role: "IT lead", text: "Vendor is fine with the 15th. Confirmed." },
        { who: "dewee", me: true, text: "All three are on the board. I'll check progress with each owner before next Monday's meeting." },
      ],
      vi: [
        { who: "Anh Quang", role: "CEO", text: "Ghi âm buổi họp kế hoạch hôm nay. @dewee tóm tắt và phân người phụ trách giúp anh." },
        { who: "dewee", me: true, text: "Có ba quyết định ạ: 1. Mở showroom Đà Nẵng trong quý 1 (anh Hải). 2. Tạm dừng tuyển mới tới kỳ đánh giá tháng 10 (chị Mai). 3. Lùi ngày chạy ERP sang 15/11 (anh Sơn). Em đã gửi đề xuất để từng người xác nhận." },
        { who: "dewee", me: true, text: "Anh Hải và chị Mai đã xác nhận ✓ Anh Sơn đang kiểm tra ngày mới với nhà cung cấp." },
        { who: "Anh Sơn", role: "Trưởng phòng IT", text: "Bên cung cấp đồng ý ngày 15. Anh xác nhận." },
        { who: "dewee", me: true, text: "Cả ba việc đã lên bảng ạ. Em sẽ hỏi tiến độ từng người trước buổi họp thứ Hai tuần sau." },
      ],
    },
    outcome: {
      en: "Every meeting ends with a written list of decisions, each with a name and a date that its owner has confirmed. The next meeting starts from progress instead of from memory.",
      vi: "Buổi họp nào cũng kết thúc bằng danh sách quyết định rõ ràng, mỗi quyết định có người phụ trách và thời hạn đã được chính họ xác nhận. Buổi họp sau bắt đầu từ tiến độ, không phải từ trí nhớ.",
    },
    description: {
      en: "dewee agents turn meeting recordings and notes into a one-page summary, send each decision to its owner to confirm, and follow up before your next meeting.",
      vi: "Agent dewee biến ghi âm, ghi chú cuộc họp thành bản tóm tắt một trang, gửi từng quyết định cho người phụ trách xác nhận và theo dõi tiến độ trước buổi họp sau.",
    },
    related: ["task-chasing", "ai-coworker-in-group-chats", "sales-knowledge-assistant"],
  },
};
