/**
 * Marketing: a steady posting rhythm plus comment and DM care on Facebook, Pancake and Zalo.
 * Verified against dewee: Facebook comment and Messenger auto-reply with an admin-reply cooldown,
 * Pancake comment → private DM, create_image, cron, knowledge vault, human_handoff.
 */
import type { UseCase } from "./types";

export const socialMediaCare: UseCase = {
  slug: "social-media-care",
  icon: "megaphone",
  area: "marketing",
  team: { en: "Marketing", vi: "Marketing" },
  title: { en: "Look after every social account", vi: "Chăm sóc tài khoản mạng xã hội" },
  summary: {
    en: "Plan the calendar, draft posts in your voice, answer comments and DMs, and flag anything that needs a human.",
    vi: "Lên lịch nội dung, viết bài đúng giọng thương hiệu, trả lời bình luận và tin nhắn, báo lại khi cần người xử lý.",
  },
  channels: ["facebook", "pancake", "zalo"],
  detail: {
    problem: {
      en: "We post when someone remembers. Comments sit unanswered all weekend, and the one angry customer we missed on Saturday is the one everybody saw.",
      vi: "Bài đăng lúc có lúc không, tuỳ hôm ai nhớ. Bình luận cuối tuần chẳng ai trả lời, và đúng vị khách bực mình hôm thứ Bảy mà cả fanpage đều thấy thì lại bị sót.",
    },
    flow: {
      en: [
        "Every Monday, the content agent drafts the week's calendar from your brand guide, past posts and the promotions in your knowledge vault.",
        "It writes captions in your voice and generates image options, then shares the plan in the team chat for review.",
        "Day and night, the community agent answers comments and Messenger questions on your Facebook page from approved answers.",
        "On Pancake, a public comment asking for the price gets a short reply and a private message with the details.",
        "Complaints, refund requests and anything sensitive go to a person through a human handoff, with the thread attached.",
      ],
      vi: [
        "Mỗi thứ Hai, agent nội dung soạn lịch đăng cả tuần dựa trên brand guide, các bài cũ và chương trình khuyến mãi trong kho tri thức.",
        "Agent viết caption đúng giọng thương hiệu, tạo vài phương án hình ảnh, rồi gửi kế hoạch vào nhóm chat để duyệt.",
        "Suốt ngày đêm, agent cộng đồng trả lời bình luận và tin nhắn Messenger trên fanpage dựa trên các câu trả lời đã được duyệt.",
        "Trên Pancake, bình luận hỏi giá công khai sẽ nhận một câu trả lời ngắn và một tin nhắn riêng kèm chi tiết.",
        "Khiếu nại, yêu cầu hoàn tiền và mọi chuyện nhạy cảm được chuyển cho người thật qua human handoff, kèm nguyên mạch hội thoại.",
      ],
    },
    agents: {
      en: ["Content agent", "Community agent"],
      vi: ["Agent nội dung", "Agent cộng đồng"],
    },
    capabilities: {
      en: ["Facebook comments & Messenger", "Pancake comment → private DM", "Knowledge vault", "Image generation", "Cron schedules", "Human handoff"],
      vi: ["Bình luận Facebook & Messenger", "Pancake: bình luận → tin nhắn riêng", "Kho tri thức", "Tạo hình ảnh", "Lịch cron", "Human handoff"],
    },
    guardrails: {
      en: [
        "Posts are drafts. A marketer approves and publishes them.",
        "When someone on your team replies in Messenger, the agent steps back, so the customer never hears two voices at once.",
        "Complaints and refund requests always go to a person, with a case summary.",
        "The agent answers from knowledge you approved. When it is not sure, it hands off instead of guessing.",
        "Every reply is traced, so you can see what was said and why.",
      ],
      vi: [
        "Bài đăng chỉ là bản nháp. Người làm marketing duyệt và tự đăng.",
        "Khi có người trong đội vào trả lời Messenger, agent tự lùi lại, để khách không nhận hai câu trả lời cùng lúc.",
        "Khiếu nại và yêu cầu hoàn tiền luôn được chuyển cho người thật, kèm tóm tắt vụ việc.",
        "Agent trả lời từ những kiến thức bạn đã duyệt. Không chắc thì chuyển người, không đoán mò.",
        "Mỗi câu trả lời đều có trace: đã nói gì, vì sao nói vậy.",
      ],
    },
    chat: { channel: "zalo", room: { en: "May Bakery · marketing", vi: "Tiệm bánh Mây · marketing" } },
    transcript: {
      en: [
        { who: "dewee", me: true, text: "Next week's plan is ready ✓ Five posts: two for the mooncake pre-order, one behind the scenes, two customer photos. Captions and three image options for each are in the doc." },
        { who: "Thao", role: "Marketing lead", text: "Swap Wednesday's post for the new pandan flavour. The rest looks good." },
        { who: "dewee", me: true, text: "Swapped. One more thing: a customer commented under Saturday's post that her order arrived late. I handed it to Hieu with the order code." },
        { who: "Hieu", role: "Customer care", text: "Called her, all sorted. Thanks for catching it." },
      ],
      vi: [
        { who: "dewee", me: true, text: "Kế hoạch tuần sau xong rồi ạ ✓ 5 bài: 2 bài đặt trước bánh trung thu, 1 bài hậu trường, 2 bài ảnh khách. Caption và 3 phương án hình cho mỗi bài em để trong file." },
        { who: "Chị Thảo", role: "Trưởng nhóm Marketing", text: "Bài thứ Tư đổi sang vị lá dứa mới nhé em. Còn lại ổn." },
        { who: "dewee", me: true, text: "Em đổi rồi ạ. Thêm một việc: có khách bình luận dưới bài thứ Bảy là giao hàng trễ. Em đã chuyển cho anh Hiếu kèm mã đơn." },
        { who: "Anh Hiếu", role: "CSKH", text: "Anh gọi khách rồi, xong xuôi. Cảm ơn em phát hiện kịp." },
      ],
    },
    outcome: {
      en: "Your pages keep a steady rhythm without anyone living in the inbox. Customers get quick answers at any hour, and the conversations that need a human reach one, with the context already written down.",
      vi: "Fanpage giữ nhịp đăng đều mà không ai phải ôm hộp thư cả ngày. Khách được trả lời nhanh bất kể giờ nào, còn cuộc trò chuyện nào cần người thật thì tới đúng người, với ngữ cảnh đã được ghi sẵn.",
    },
    description: {
      en: "dewee agents plan your posts, draft them in your voice, answer Facebook and Pancake comments day and night, and hand complaints to a person with the thread.",
      vi: "Agent dewee lên lịch và soạn bài đúng giọng thương hiệu, trả lời bình luận Facebook, Pancake suốt ngày đêm, chuyển khiếu nại cho người thật kèm mạch hội thoại.",
    },
    related: ["customer-care-with-handoff", "creative-ad-production", "ads-performance-watch"],
  },
};
