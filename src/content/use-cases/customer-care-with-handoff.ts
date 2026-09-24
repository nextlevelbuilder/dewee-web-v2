/**
 * Customer care: 24/7 answers from the knowledge base, with a clean handoff to a person.
 * Verified against dewee: human_handoff tool (structured case summary to a server-configured
 * route), Zalo OA / Facebook / WhatsApp / Pancake channels, per-user sessions, read_image,
 * Facebook admin-reply cooldown, prompt-injection detection, traces.
 */
import type { UseCase } from "./types";

export const customerCareWithHandoff: UseCase = {
  slug: "customer-care-with-handoff",
  icon: "headset",
  area: "customers",
  team: { en: "Customer care", vi: "Chăm sóc khách hàng" },
  title: { en: "Customer care that knows when to hand off", vi: "Chăm sóc khách hàng, chuyển người thật khi cần" },
  summary: {
    en: "Answer customers around the clock from your knowledge base and pass the conversation to a human, with context, when it matters.",
    vi: "Trả lời khách 24/7 từ kho tri thức và chuyển cuộc trò chuyện cho nhân viên, kèm đủ ngữ cảnh, khi cần thiết.",
  },
  channels: ["zalo", "facebook", "whatsapp", "pancake"],
  detail: {
    problem: {
      en: "Half our messages arrive after 9pm. By morning the customer has asked three times, and whoever picks it up has to scroll back and ask them to explain everything again.",
      vi: "Một nửa tin nhắn tới sau 9 giờ tối. Sáng ra khách đã hỏi tới lần thứ ba, và bạn nhân viên nhận ca lại phải cuộn ngược lên rồi nhờ khách kể lại từ đầu.",
    },
    flow: {
      en: [
        "Your FAQs, policies, price lists and product guides go into the knowledge vault.",
        "The care agent answers on Zalo OA, Facebook, WhatsApp and Pancake from that knowledge, in your tone.",
        "It keeps each customer's history, so a returning customer never starts from zero.",
        "When a case needs a person, such as a complaint, a refund or an unclear question, it hands off with a summary: who, what, which order and what was already said.",
        "The customer is told who will pick it up and when, and your teammate continues in the same conversation.",
      ],
      vi: [
        "FAQ, chính sách, bảng giá và hướng dẫn sản phẩm được đưa vào kho tri thức.",
        "Agent chăm sóc khách trả lời trên Zalo OA, Facebook, WhatsApp và Pancake dựa trên kho tri thức đó, đúng giọng của bạn.",
        "Agent giữ lịch sử của từng khách, nên khách quay lại không phải kể lại từ đầu.",
        "Khi cần người thật, như khiếu nại, hoàn tiền hay câu hỏi chưa rõ, agent chuyển giao kèm bản tóm tắt: ai, việc gì, đơn nào, đã trao đổi những gì.",
        "Khách được báo ai sẽ tiếp nhận và khi nào, nhân viên của bạn tiếp tục ngay trong cuộc trò chuyện đó.",
      ],
    },
    agents: {
      en: ["Care agent"],
      vi: ["Agent chăm sóc khách hàng"],
    },
    capabilities: {
      en: ["Knowledge vault", "Human handoff", "Zalo OA, Facebook, WhatsApp & Pancake", "Per-customer conversation history", "Image reading", "Traces"],
      vi: ["Kho tri thức", "Human handoff", "Zalo OA, Facebook, WhatsApp & Pancake", "Lịch sử trò chuyện theo từng khách", "Đọc hình ảnh", "Trace"],
    },
    guardrails: {
      en: [
        "You write the handoff rules: which topics, which words and which moods always go to a person.",
        "Handoffs go to a route you name, with a structured summary, so nobody has to ask the customer twice.",
        "When a teammate replies on Facebook, the agent steps back from that conversation.",
        "Messages are checked for prompt-injection attempts before the agent acts on them.",
        "Every answer is traced back to the knowledge it used.",
      ],
      vi: [
        "Bạn tự đặt quy tắc chuyển giao: chủ đề nào, từ khoá nào, sắc thái nào thì luôn chuyển người thật.",
        "Việc chuyển giao đi tới đúng nơi bạn chỉ định, kèm tóm tắt có cấu trúc, không ai phải hỏi khách lần thứ hai.",
        "Khi có nhân viên trả lời trên Facebook, agent tự lùi khỏi cuộc trò chuyện đó.",
        "Tin nhắn được kiểm tra dấu hiệu prompt injection trước khi agent xử lý.",
        "Câu trả lời nào cũng truy được về phần kiến thức agent đã dùng.",
      ],
    },
    chat: { channel: "zalo", room: { en: "Zalo OA · Go Moc Furniture", vi: "Zalo OA · Nội thất Gỗ Mộc" } },
    transcript: {
      en: [
        { who: "Thu", role: "Customer", text: "Hi, one leg of the table I got last week is cracked. Photo attached." },
        { who: "dewee", me: true, text: "I'm sorry about that. I can see order GM-2208 from the 12th, which is within the 30-day exchange window. I'm passing this to Ha on our care team with your photo and order details." },
        { who: "dewee", me: true, text: "Handed off ✓ Ha will message you here before 10:00 tomorrow." },
        { who: "Ha", role: "Customer care", text: "Hi Thu, I'm Ha. We can bring a replacement leg on Saturday morning. Does that work for you?" },
        { who: "Thu", role: "Customer", text: "Saturday works. Thank you!" },
      ],
      vi: [
        { who: "Chị Thu", role: "Khách hàng", text: "Shop ơi, bàn chị mua tuần trước bị nứt một chân. Chị gửi ảnh nhé." },
        { who: "dewee", me: true, text: "Dạ em xin lỗi chị ạ. Em thấy đơn GM-2208 ngày 12, vẫn trong thời hạn đổi trả 30 ngày. Em chuyển cho chị Hà bên CSKH kèm ảnh và thông tin đơn của chị nhé." },
        { who: "dewee", me: true, text: "Đã chuyển ✓ Chị Hà sẽ nhắn chị ngay tại đây trước 10 giờ sáng mai ạ." },
        { who: "Chị Hà", role: "CSKH", text: "Chào chị Thu, em là Hà. Sáng thứ Bảy bên em mang chân bàn mới qua thay được không chị?" },
        { who: "Chị Thu", role: "Khách hàng", text: "Thứ Bảy được em. Cảm ơn nhiều nha!" },
      ],
    },
    outcome: {
      en: "Customers get an answer at 11pm and a real person by morning when they need one. Your team starts each shift with cases already summarised, and nobody asks a customer to repeat their story.",
      vi: "Khách được trả lời lúc 11 giờ đêm, và có người thật tiếp nhận vào sáng hôm sau khi cần. Nhân viên bắt đầu ca làm với các vụ việc đã được tóm tắt sẵn, không ai phải nhờ khách kể lại câu chuyện của mình.",
    },
    description: {
      en: "dewee answers customers on Zalo, Facebook, WhatsApp and Pancake day and night and passes tricky cases to your team with a summary, so nobody repeats themselves.",
      vi: "dewee trả lời khách trên Zalo, Facebook, WhatsApp và Pancake suốt ngày đêm, và chuyển ca khó cho đội của bạn kèm tóm tắt, để khách không phải kể lại từ đầu.",
    },
    related: ["social-media-care", "sales-knowledge-assistant", "ai-coworker-in-group-chats"],
    console: "channels",
  },
};
