/**
 * Every team: an agent that sits in the group chat and keeps decisions from getting lost.
 * Verified against dewee: group mention gating with a pending-history buffer, reply-as-mention,
 * opt-in passive channel memory (redacted, review queue), Lark/Telegram topic isolation,
 * Telegram group writers (/addwriter), team task board.
 */
import type { UseCase } from "./types";

export const aiCoworkerInGroupChats: UseCase = {
  slug: "ai-coworker-in-group-chats",
  icon: "messages-square",
  area: "operations",
  team: { en: "Every team", vi: "Mọi phòng ban" },
  title: { en: "A co-worker in your group chats", vi: "Đồng nghiệp AI trong nhóm chat" },
  summary: {
    en: "An agent that listens, remembers the thread, chips in when @mentioned and keeps decisions from getting lost.",
    vi: "Agent lắng nghe, nhớ mạch trao đổi, góp ý khi được @nhắc tên và giữ cho các quyết định không bị trôi.",
  },
  channels: ["telegram", "zalo", "lark", "slack"],
  detail: {
    problem: {
      en: "Decisions get made in the group chat and lost in the group chat. New people scroll for an hour, and someone always asks a question we answered last Tuesday.",
      vi: "Quyết định được đưa ra trong nhóm chat rồi cũng trôi mất trong nhóm chat. Người mới vào phải cuộn cả tiếng đồng hồ, và lúc nào cũng có người hỏi lại câu đã được trả lời từ thứ Ba tuần trước.",
    },
    flow: {
      en: [
        "The agent joins your group like a colleague. It reads along quietly and only speaks when someone @mentions it or replies to it.",
        "When it is mentioned, it uses the recent messages as context, so nobody has to repeat the backstory.",
        "It answers from shared files and from past decisions it has been allowed to remember.",
        "Asked to, it summarises a long thread, lists open questions or turns a decision into a task with an owner.",
        "With passive memory switched on, it proposes lasting facts from the group, and a person reviews them before they are saved.",
      ],
      vi: [
        "Agent vào nhóm như một đồng nghiệp. Nó đọc lặng lẽ và chỉ lên tiếng khi có người @nhắc tên hoặc trả lời tin nhắn của nó.",
        "Khi được nhắc, nó dùng các tin nhắn gần đây làm ngữ cảnh, nên không ai phải kể lại từ đầu.",
        "Nó trả lời từ tài liệu chung và những quyết định trước đó nó được phép ghi nhớ.",
        "Khi được nhờ, nó tóm tắt một mạch dài, liệt kê câu hỏi còn bỏ ngỏ hoặc biến một quyết định thành đầu việc có người phụ trách.",
        "Nếu bật passive memory, nó đề xuất những thông tin đáng nhớ từ nhóm, và một người sẽ duyệt trước khi lưu lại.",
      ],
    },
    agents: {
      en: ["Team co-worker agent"],
      vi: ["Agent đồng nghiệp của nhóm"],
    },
    capabilities: {
      en: ["Group mention gating", "Thread context", "Memory & knowledge vault", "Passive channel memory (opt-in)", "Team task board", "Lark topics & Telegram forum topics"],
      vi: ["Chỉ trả lời khi được @nhắc", "Ngữ cảnh theo mạch chat", "Bộ nhớ & kho tri thức", "Passive memory (tuỳ chọn bật)", "Bảng việc của đội", "Topic trên Lark & forum topic trên Telegram"],
    },
    guardrails: {
      en: [
        "Quiet by default: in groups it speaks only when @mentioned or replied to.",
        "Group memory stays off until you switch it on. Tokens, phone numbers and emails are stripped first, and every proposed fact waits for review.",
        "Each group and topic keeps its own conversation history, so threads do not bleed into each other.",
        "In Telegram groups, only the people you name as writers can make it change files.",
        "Everything it does is traced, so you can see what it read and why it answered.",
      ],
      vi: [
        "Mặc định im lặng: trong nhóm, nó chỉ lên tiếng khi được @nhắc hoặc được trả lời.",
        "Bộ nhớ nhóm tắt cho tới khi bạn bật. Token, số điện thoại và email bị lọc trước, và mọi thông tin đề xuất đều chờ người duyệt.",
        "Mỗi nhóm, mỗi topic có lịch sử trò chuyện riêng, nên các mạch không lẫn vào nhau.",
        "Trong nhóm Telegram, chỉ những người bạn chỉ định là writer mới có thể nhờ nó sửa file.",
        "Mọi việc nó làm đều có trace, bạn thấy rõ nó đã đọc gì và vì sao trả lời như vậy.",
      ],
    },
    chat: { channel: "lark", room: { en: "Binh Duong warehouse project", vi: "Dự án kho Bình Dương" } },
    transcript: {
      en: [
        { who: "Khoa", role: "Project manager", text: "@dewee what did we decide about the racking supplier? I was out last week." },
        { who: "dewee", me: true, text: "Thursday's call: the local supplier, not the imported racks. Delivery is three weeks sooner and the quote fits the budget. Linh owns the install date, which is still open." },
        { who: "Linh", role: "Procurement", text: "Install is pencilled in for the 14th. Waiting on their confirmation." },
        { who: "Khoa", role: "Project manager", text: "Thanks. @dewee make that a task for Linh, due Friday." },
        { who: "dewee", me: true, text: "Done ✓ Task #27 “Confirm racking install date” is on the board for Linh, due Friday." },
      ],
      vi: [
        { who: "Anh Khoa", role: "Quản lý dự án", text: "@dewee tuần trước nhóm chốt nhà cung cấp kệ thế nào em? Anh nghỉ phép nên không theo kịp." },
        { who: "dewee", me: true, text: "Buổi họp thứ Năm nhóm chọn nhà cung cấp trong nước thay vì kệ nhập khẩu ạ: giao sớm hơn ba tuần, báo giá vẫn trong ngân sách. Chị Linh phụ trách chốt ngày lắp, hiện chưa xong." },
        { who: "Chị Linh", role: "Mua hàng", text: "Dự kiến lắp ngày 14, đang chờ bên đó xác nhận." },
        { who: "Anh Khoa", role: "Quản lý dự án", text: "Ok. @dewee tạo việc cho Linh, hạn thứ Sáu nhé." },
        { who: "dewee", me: true, text: "Xong rồi ạ ✓ Việc #27 “Chốt ngày lắp kệ” đã lên bảng cho chị Linh, hạn thứ Sáu." },
      ],
    },
    outcome: {
      en: "Decisions stop disappearing into the scroll. People catch up with one question instead of an hour of reading, and small follow-ups become tasks with a name on them before the conversation moves on.",
      vi: "Quyết định không còn chìm giữa hàng trăm tin nhắn. Người vắng mặt bắt kịp chỉ bằng một câu hỏi thay vì một giờ đọc lại, và những việc nhỏ trở thành đầu việc có người phụ trách trước khi câu chuyện trôi đi.",
    },
    description: {
      en: "A dewee agent joins your Telegram, Zalo, Lark or Slack group, speaks only when @mentioned, remembers decisions and turns them into tasks with owners and dates.",
      vi: "Agent dewee vào nhóm Telegram, Zalo, Lark hay Slack, chỉ lên tiếng khi được @nhắc, nhớ quyết định và biến chúng thành đầu việc có người phụ trách và thời hạn.",
    },
    related: ["meeting-notes-and-decisions", "task-chasing", "sales-knowledge-assistant"],
  },
};
