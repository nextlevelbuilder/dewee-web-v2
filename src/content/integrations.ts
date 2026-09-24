/**
 * Channels and model providers dewee supports, verified against internal/channels and
 * internal/providers in the dewee repo (2026-09-24). `brand` keys map to BrandMark marks;
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
  { id: "discord", brand: "discord", name: "Discord", note: { en: "Streaming edits, embeds", vi: "Chỉnh sửa dạng stream, embed" } },
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

export const VOICE: Integration[] = [
  { id: "elevenlabs", brand: "elevenlabs", name: "ElevenLabs" },
  { id: "openai-tts", brand: "openai", name: "OpenAI TTS" },
  { id: "gemini-tts", brand: "gemini", name: "Gemini TTS" },
  { id: "minimax-tts", brand: "minimax", name: "MiniMax" },
];
