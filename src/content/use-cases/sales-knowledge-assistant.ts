/**
 * Sales: instant, sourced answers from internal knowledge, plus quotes that go through approval.
 * Verified against dewee: knowledge vault with hybrid search, read_document, team tasks with
 * require_approval (approved in the dashboard), cron reminders, per-user memory, DM pairing.
 */
import type { UseCase } from "./types";

export const salesKnowledgeAssistant: UseCase = {
  slug: "sales-knowledge-assistant",
  icon: "book-open",
  area: "customers",
  team: { en: "Sales", vi: "Kinh doanh" },
  title: { en: "Every salesperson, fully briefed", vi: "Trợ lý sales với tri thức nội bộ" },
  summary: {
    en: "Instant answers on pricing, specs and policies from your internal knowledge, plus quotes and follow-ups drafted for approval.",
    vi: "Trả lời tức thì về giá, thông số, chính sách từ tri thức nội bộ; soạn sẵn báo giá và lịch chăm sóc để duyệt.",
  },
  channels: ["zalo", "lark", "telegram"],
  detail: {
    problem: {
      en: "New salespeople take months to learn our price list and policies. In the meantime they call a manager for every quote, and customers wait for an answer we already have somewhere.",
      vi: "Sales mới mất vài tháng mới thuộc bảng giá và chính sách. Trong lúc đó, báo giá nào cũng phải gọi hỏi quản lý, còn khách thì ngồi chờ một câu trả lời mà công ty vốn đã có sẵn ở đâu đó.",
    },
    flow: {
      en: [
        "Price lists, product specs, policies and past quotes go into the knowledge vault.",
        "A salesperson asks in plain words, and the assistant answers with the source document and the version it used.",
        "It drafts the quote from the current price list and flags any term that falls outside policy.",
        "Out-of-policy discounts become an approval request for the sales manager.",
        "After the quote goes out, it sets a follow-up reminder with a drafted message.",
      ],
      vi: [
        "Bảng giá, thông số sản phẩm, chính sách và các báo giá cũ được đưa vào kho tri thức.",
        "Sales hỏi bằng lời thường, trợ lý trả lời kèm tài liệu gốc và phiên bản đã dùng.",
        "Trợ lý soạn báo giá theo bảng giá hiện hành và đánh dấu điều khoản nào nằm ngoài chính sách.",
        "Mức chiết khấu vượt chính sách được chuyển thành yêu cầu duyệt gửi trưởng phòng kinh doanh.",
        "Sau khi gửi báo giá, trợ lý đặt lịch nhắc chăm sóc kèm tin nhắn soạn sẵn.",
      ],
    },
    agents: {
      en: ["Sales assistant agent"],
      vi: ["Agent trợ lý sales"],
    },
    capabilities: {
      en: ["Knowledge vault with hybrid search", "Document reading (PDF, DOCX)", "Team tasks with approval", "Cron reminders", "Per-user memory"],
      vi: ["Kho tri thức với tìm kiếm kết hợp", "Đọc tài liệu (PDF, DOCX)", "Đầu việc cần duyệt", "Nhắc việc theo lịch cron", "Bộ nhớ theo từng người dùng"],
    },
    guardrails: {
      en: [
        "Answers cite the document they came from. When there is no answer in your knowledge, it says so.",
        "Discounts outside policy go to a manager for approval before anything is promised.",
        "Quotes that need approval stay in review until someone approves them in the dashboard.",
        "Each salesperson's conversations and notes stay separate from everyone else's.",
        "Only paired or allowed people can talk to the assistant in direct messages.",
      ],
      vi: [
        "Câu trả lời luôn dẫn tài liệu gốc. Kho tri thức không có câu trả lời thì trợ lý nói rõ là không có.",
        "Chiết khấu ngoài chính sách phải được quản lý duyệt trước khi hứa với khách.",
        "Báo giá cần duyệt nằm ở trạng thái chờ cho tới khi có người duyệt trên dashboard.",
        "Cuộc trò chuyện và ghi chú của mỗi sales được tách riêng, không lẫn với người khác.",
        "Chỉ những người đã ghép nối hoặc được cho phép mới nhắn riêng được với trợ lý.",
      ],
    },
    chat: { channel: "lark", room: { en: "Direct message", vi: "Tin nhắn riêng" } },
    transcript: {
      en: [
        { who: "Khanh", role: "Sales", text: "Quote for 12 inverter units, 24,000 BTU, for a factory in Long An?" },
        { who: "dewee", me: true, text: "From the September price list, with the project rate for orders above 10 units. Draft quote attached ✓" },
        { who: "Khanh", role: "Sales", text: "They're asking for 12% off." },
        { who: "dewee", me: true, text: "Policy allows up to 8% at this volume. I've sent an approval request to Ms Hanh with the customer's history." },
        { who: "Hanh", role: "Sales manager", text: "Approved at 10%, if they sign this week." },
      ],
      vi: [
        { who: "Anh Khánh", role: "Sales", text: "Báo giá 12 máy inverter 24.000 BTU cho nhà xưởng ở Long An giúp anh?" },
        { who: "dewee", me: true, text: "Em lấy theo bảng giá tháng 9, áp giá dự án cho đơn trên 10 máy ạ. Báo giá nháp em gửi kèm ✓" },
        { who: "Anh Khánh", role: "Sales", text: "Khách xin chiết khấu 12%." },
        { who: "dewee", me: true, text: "Chính sách cho phép tối đa 8% với số lượng này anh ạ. Em đã gửi yêu cầu duyệt cho chị Hạnh kèm lịch sử mua hàng của khách." },
        { who: "Chị Hạnh", role: "Trưởng phòng kinh doanh", text: "Duyệt 10%, nếu khách ký trong tuần này." },
      ],
    },
    outcome: {
      en: "New salespeople answer like veterans from their first week, and every number they give traces back to a document. Managers see only the exceptions that need their judgement.",
      vi: "Sales mới trả lời chắc như người lâu năm ngay từ tuần đầu, và con số nào đưa ra cũng truy được về tài liệu. Quản lý chỉ cần xem những trường hợp ngoại lệ thật sự cần tới quyết định của mình.",
    },
    description: {
      en: "dewee gives each salesperson sourced answers on pricing, specs and policies, drafts quotes from your price list and sends out-of-policy discounts to a manager.",
      vi: "dewee giúp mỗi sales trả lời có nguồn về giá, thông số và chính sách, soạn báo giá theo bảng giá hiện hành và chuyển chiết khấu vượt mức cho quản lý duyệt.",
    },
    related: ["customer-care-with-handoff", "real-estate-market-signals", "meeting-notes-and-decisions"],
  },
};
