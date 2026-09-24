/**
 * Channels, model providers and voice engines dewee supports, verified against internal/channels,
 * internal/providers and internal/audio in the dewee repo (2026-09-25), plus
 * docs/05-channels-messaging.md for per-channel behaviour. `brand` keys map to BrandMark marks;
 * brands without a vendored mark render as a monogram.
 */
import type { Bi } from "~/i18n/config";

export type Integration = { id: string; brand: string; name: string; note?: Bi };

export const CHANNELS: Integration[] = [
  { id: "telegram", brand: "telegram", name: "Telegram", note: { en: "Groups, forum topics, voice notes", vi: "Nhóm, forum topic, tin nhắn thoại" } },
  { id: "zalo-oa", brand: "zalo", name: "Zalo OA", note: { en: "Official accounts for customer care", vi: "Tài khoản OA chăm sóc khách hàng" } },
  { id: "zalo-personal", brand: "zalo", name: "Zalo Personal", note: { en: "Personal accounts, direct chats", vi: "Tài khoản cá nhân, chat trực tiếp" } },
  { id: "slack", brand: "slack", name: "Slack", note: { en: "Socket Mode, streaming replies", vi: "Socket Mode, trả lời dạng stream" } },
  { id: "lark", brand: "lark", name: "Lark / Feishu", note: { en: "Streaming cards, topic isolation", vi: "Card stream, tách ngữ cảnh theo topic" } },
  { id: "discord", brand: "discord", name: "Discord", note: { en: "Servers, threads, embeds", vi: "Server, thread, embed" } },
  { id: "whatsapp", brand: "whatsapp", name: "WhatsApp", note: { en: "Native, end-to-end encrypted", vi: "Kết nối gốc, mã hoá đầu cuối" } },
  { id: "facebook", brand: "messenger", name: "Facebook Messenger", note: { en: "Messenger and page comments", vi: "Messenger và bình luận fanpage" } },
  { id: "pancake", brand: "pancake", name: "Pancake", note: { en: "Omnichannel inbox, comment → DM", vi: "Hộp thư đa kênh, bình luận → tin nhắn" } },
  { id: "bitrix24", brand: "bitrix24", name: "Bitrix24", note: { en: "CRM and team chat", vi: "CRM và chat nội bộ" } },
];

export const PROVIDERS: Integration[] = [
  { id: "anthropic", brand: "anthropic", name: "Anthropic" },
  { id: "openai", brand: "openai", name: "OpenAI" },
  { id: "gemini", brand: "gemini", name: "Google Gemini" },
  { id: "vertex", brand: "vertexai", name: "Vertex AI" },
  { id: "deepseek", brand: "deepseek", name: "DeepSeek" },
  { id: "qwen", brand: "qwen", name: "Qwen (DashScope)" },
  { id: "mistral", brand: "mistral", name: "Mistral" },
  { id: "xai", brand: "xai", name: "xAI" },
  { id: "openrouter", brand: "openrouter", name: "OpenRouter" },
  { id: "groq", brand: "groq", name: "Groq" },
  { id: "minimax", brand: "minimax", name: "MiniMax" },
  { id: "cohere", brand: "cohere", name: "Cohere" },
  { id: "perplexity", brand: "perplexity", name: "Perplexity" },
  { id: "ollama", brand: "ollama", name: "Ollama" },
  { id: "byteplus", brand: "doubao", name: "BytePlus ModelArk" },
  { id: "workersai", brand: "workersai", name: "Workers AI" },
  { id: "vercel", brand: "vercel", name: "Vercel AI Gateway" },
  { id: "codex", brand: "codex", name: "ChatGPT (Codex OAuth)" },
  { id: "claude-cli", brand: "claude", name: "Claude Code CLI" },
  { id: "cline", brand: "cline", name: "ClinePass" },
  { id: "opencode", brand: "opencode", name: "OpenCode Go" },
];

/** Model providers grouped by how you connect them. Every PROVIDERS id appears in exactly one group. */
export type ProviderGroupId = "api" | "subscription" | "local";
export const PROVIDER_GROUPS: { id: ProviderGroupId; ids: string[] }[] = [
  {
    id: "api",
    ids: ["anthropic", "openai", "gemini", "vertex", "deepseek", "qwen", "mistral", "xai", "openrouter", "groq", "minimax", "cohere", "perplexity", "byteplus", "workersai", "vercel"],
  },
  { id: "subscription", ids: ["codex", "claude-cli", "opencode", "cline"] },
  { id: "local", ids: ["ollama"] },
];

/** Resolve a provider group to its entries, in the group's order. */
export function providersIn(group: ProviderGroupId): Integration[] {
  const ids = PROVIDER_GROUPS.find((g) => g.id === group)?.ids ?? [];
  return ids.map((id) => PROVIDERS.find((p) => p.id === id)).filter((p): p is Integration => p !== undefined);
}

/** Text-to-speech engines (internal/audio). Edge TTS is free and needs no API key. */
export const VOICE: Integration[] = [
  { id: "elevenlabs", brand: "elevenlabs", name: "ElevenLabs" },
  { id: "openai-tts", brand: "openai", name: "OpenAI TTS" },
  { id: "gemini-tts", brand: "gemini", name: "Gemini TTS" },
  { id: "minimax-tts", brand: "minimax", name: "MiniMax" },
  { id: "edge-tts", brand: "microsoft", name: "Edge TTS" },
];

/** Speech-to-text engines, tried in order. A self-hosted STT proxy can also sit in the chain. */
export const STT: Integration[] = [
  { id: "soniox", brand: "soniox", name: "Soniox" },
  { id: "elevenlabs-scribe", brand: "elevenlabs", name: "ElevenLabs Scribe" },
];

/**
 * What each channel does, one row per channel (keys are CHANNELS ids). `voice: "opt-in"` means
 * transcription stays off until an admin enables it. Sources: docs/05-channels-messaging.md and
 * internal/channels/capabilities.go.
 */
export type ChannelDetail = { connect: Bi; chats: Bi; streaming: boolean; voice: boolean | "opt-in"; media: boolean; note: Bi };
export const CHANNEL_DETAILS: Record<string, ChannelDetail> = {
  telegram: {
    connect: { en: "Bot token, long polling", vi: "Bot token, long polling" },
    chats: { en: "DMs, groups, forum topics", vi: "Tin riêng, nhóm, forum topic" },
    streaming: true,
    voice: true,
    media: true,
    note: { en: "Each forum topic can carry its own prompt and tools.", vi: "Mỗi forum topic có thể có prompt và tool riêng." },
  },
  "zalo-oa": {
    connect: { en: "Zalo OA Bot API", vi: "Zalo OA Bot API" },
    chats: { en: "DMs only", vi: "Chỉ tin riêng" },
    streaming: false,
    voice: false,
    media: true,
    note: { en: "Pairing is on by default. Images up to 5 MB.", vi: "Mặc định bật ghép cặp. Ảnh tối đa 5 MB." },
  },
  "zalo-personal": {
    connect: { en: "QR scan, unofficial protocol", vi: "Quét QR, giao thức không chính thức" },
    chats: { en: "DMs and groups", vi: "Tin riêng và nhóm" },
    streaming: false,
    voice: false,
    media: true,
    note: {
      en: "Allow-list only by default. It is unofficial, so the account can be locked.",
      vi: "Mặc định chỉ nhận người trong danh sách cho phép. Vì không chính thức nên tài khoản có thể bị khoá.",
    },
  },
  slack: {
    connect: { en: "Socket Mode, no public URL", vi: "Socket Mode, không cần URL công khai" },
    chats: { en: "DMs, channels, threads", vi: "Tin riêng, channel, thread" },
    streaming: true,
    voice: false,
    media: true,
    note: { en: "Mention it once and it follows the thread for 24 hours.", vi: "Nhắc tên một lần, agent theo luôn thread đó trong 24 giờ." },
  },
  lark: {
    connect: { en: "WebSocket or webhook", vi: "WebSocket hoặc webhook" },
    chats: { en: "DMs, groups, topics", vi: "Tin riêng, nhóm, topic" },
    streaming: true,
    voice: true,
    media: true,
    note: { en: "Replies stream into cards. Files up to 30 MB.", vi: "Câu trả lời stream vào card. File tối đa 30 MB." },
  },
  discord: {
    connect: { en: "A bot on the Discord Gateway", vi: "Bot qua Discord Gateway" },
    chats: { en: "DMs, servers, threads", vi: "Tin riêng, server, thread" },
    streaming: false,
    voice: true,
    media: true,
    note: { en: "Mentioned in a thread, it reads the last 25 messages first.", vi: "Được nhắc trong thread, agent đọc 25 tin gần nhất trước." },
  },
  whatsapp: {
    connect: { en: "QR pairing, direct connection", vi: "Ghép cặp bằng QR, kết nối trực tiếp" },
    chats: { en: "DMs and groups", vi: "Tin riêng và nhóm" },
    streaming: false,
    voice: "opt-in",
    media: true,
    note: { en: "End-to-end encrypted, with no bridge in between.", vi: "Mã hoá đầu cuối, không qua cầu nối trung gian." },
  },
  facebook: {
    connect: { en: "Page token and webhook", vi: "Page token và webhook" },
    chats: { en: "Messenger and page comments", vi: "Messenger và bình luận fanpage" },
    streaming: false,
    voice: false,
    media: true,
    note: { en: "Answers comments, and can move one into a private message.", vi: "Trả lời bình luận, và có thể chuyển sang nhắn riêng." },
  },
  pancake: {
    connect: { en: "Pancake API and webhook", vi: "Pancake API và webhook" },
    chats: { en: "Inbox and comments", vi: "Inbox và bình luận" },
    streaming: false,
    voice: false,
    media: true,
    note: { en: "One page reaches Facebook, Zalo OA, Instagram, TikTok, WhatsApp and Line.", vi: "Một trang phủ Facebook, Zalo OA, Instagram, TikTok, WhatsApp và Line." },
  },
  bitrix24: {
    connect: { en: "A bot on your Bitrix24 portal", vi: "Bot trên portal Bitrix24 của bạn" },
    chats: { en: "Team chats and CRM chats", vi: "Chat nội bộ và chat CRM" },
    streaming: false,
    voice: false,
    media: false,
    note: { en: "Knows which CRM record a chat belongs to.", vi: "Biết mỗi cuộc chat thuộc bản ghi CRM nào." },
  },
};
