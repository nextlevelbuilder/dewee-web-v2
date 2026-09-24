/**
 * Offline answers for the support chat, used when no agent or human is attached to the room.
 * Facts mirror the pricing / security / integrations pages; keep them in sync.
 */
type Locale = "en" | "vi";
type Entry = { match: RegExp; en: string; vi: string };

const ENTRIES: Entry[] = [
  {
    match: /pric|cost|how much|\$|plan|giá|bao nhiêu|chi phí|gói/i,
    en: "Three ways to run dewee:\n• SaaS: $500/year on our shared cloud, 14-day refund.\n• Dedicated on TOSE.sh: $500/year licence + $99 TOSE credit deposit.\n• On-premises: from ~$5K, including setup, 5 custom workflows and a year of care.\nDetails: https://dewee.sh/pricing",
    vi: "Tại Việt Nam, dewee được triển khai On-Premises: cài trên máy chủ / Mac mini của bạn, báo giá theo nhu cầu, từ khoảng $5K gồm cài đặt, 5 quy trình tuỳ chỉnh và 1 năm bảo trì, cập nhật.\nChi tiết: https://dewee.sh/vi/pricing",
  },
  {
    match: /on.?prem|self.?host|own server|mac mini|vps|air.?gap|tự cài|máy chủ riêng|nội bộ/i,
    en: "Yes. On-premises runs the dewee runtime on your own VPS or Mac mini, activated by a licence key; your data never leaves your network. We install it, build 5 custom workflows with you and look after it for a year. https://dewee.sh/pricing#on-premises",
    vi: "Được ạ. Bản On-Premises chạy runtime dewee ngay trên VPS hoặc Mac mini của bạn, kích hoạt bằng license key, dữ liệu không rời khỏi hạ tầng của bạn. Đội ngũ sẽ cài đặt, dựng cùng bạn 5 quy trình tuỳ chỉnh và chăm sóc trong 1 năm. https://dewee.sh/vi/pricing",
  },
  {
    match: /secur|safe|privacy|data|encrypt|gdpr|bảo mật|an toàn|dữ liệu|mã hoá/i,
    en: "dewee is closed by default: five defence layers (transport, input, tool policy, output scrubbing, isolation), AES-256-GCM for every stored secret, per-tenant isolation and credential redaction before anything reaches a model. https://dewee.sh/security",
    vi: "dewee đóng mặc định: 5 lớp phòng thủ (transport, input, chính sách tool, lọc output, cô lập), mã hoá AES-256-GCM cho mọi bí mật lưu trữ, cô lập từng tenant và che thông tin nhạy cảm trước khi gửi tới model. https://dewee.sh/vi/security",
  },
  {
    match: /channel|telegram|zalo|slack|discord|whatsapp|lark|feishu|kênh/i,
    en: "Agents live where your team already talks: Telegram, Discord, Slack, Lark/Feishu, Zalo OA, Zalo Personal and WhatsApp, plus WebSocket and HTTP. https://dewee.sh/integrations",
    vi: "Agent có mặt ngay nơi đội ngũ bạn đang trò chuyện: Telegram, Discord, Slack, Lark/Feishu, Zalo OA, Zalo cá nhân và WhatsApp, cùng WebSocket và HTTP. https://dewee.sh/vi/integrations",
  },
  {
    match: /model|llm|provider|openai|claude|anthropic|gemini|gpt|deepseek|qwen|ollama|mô hình/i,
    en: "Bring any model: Anthropic, OpenAI, Gemini, DeepSeek, Qwen, Mistral, xAI, OpenRouter, Groq, Ollama and more (20+). Each agent can fall back to another provider automatically. https://dewee.sh/integrations",
    vi: "Dùng model nào cũng được: Anthropic, OpenAI, Gemini, DeepSeek, Qwen, Mistral, xAI, OpenRouter, Groq, Ollama… (20+). Mỗi agent có thể tự chuyển sang nhà cung cấp dự phòng. https://dewee.sh/vi/integrations",
  },
  {
    match: /goclaw|open.?source|openclaw|mã nguồn/i,
    en: "dewee grew out of GoClaw. GoClaw stays open and free for the community (non-commercial); dewee is the closed-source, enterprise edition with the hardening and support businesses need. The whole story: https://dewee.sh/story",
    vi: "dewee lớn lên từ GoClaw. GoClaw vẫn mở và miễn phí cho cộng đồng (phi thương mại); dewee là phiên bản doanh nghiệp, mã nguồn đóng, được gia cố và có đội ngũ hỗ trợ. Toàn bộ câu chuyện: https://dewee.sh/vi/story",
  },
  {
    match: /partner|reseller|agency|đối tác|đại lý/i,
    en: "We work with solution and BD partners who deploy, sell and support dewee. https://dewee.sh/partners",
    vi: "Chúng tôi hợp tác với đối tác triển khai và đối tác kinh doanh để cùng mang dewee tới doanh nghiệp. https://dewee.sh/vi/partners",
  },
];

const HUMAN = /human|person|someone|sales|contact|call|demo|người thật|nhân viên|tư vấn|liên hệ|gọi/i;

export function answerFromFaq(text: string, locale: Locale): { text: string; askEmail: boolean } {
  const hit = ENTRIES.find((e) => e.match.test(text));
  if (hit && !HUMAN.test(text)) return { text: hit[locale], askEmail: false };
  if (HUMAN.test(text)) {
    return {
      text: locale === "vi"
        ? "Chắc chắn rồi! Để lại email bên dưới, một người trong đội sẽ liên hệ bạn (thường trong vài giờ làm việc). Hoặc viết thẳng tới hi@nextlevelbuilder.io."
        : "Of course! Leave your email below and someone from the team will get back to you, usually within a few working hours. Or write to hi@nextlevelbuilder.io.",
      askEmail: true,
    };
  }
  return {
    text: locale === "vi"
      ? "Câu này mình cần hỏi lại đội ngũ. Bạn để lại email nhé, người thật sẽ trả lời bạn sớm."
      : "That one needs a human. Leave your email and a real person will answer you soon.",
    askEmail: true,
  };
}
