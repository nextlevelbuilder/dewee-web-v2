/**
 * /integrations copy, EN + VI. The lists themselves (channels, providers, voice engines and
 * per-channel details) live in src/content/integrations.ts; this file holds page chrome and the
 * short notes for subscription and local providers. Facts verified against the dewee repo
 * (internal/channels, internal/providers, internal/audio, internal/tools, docs/05) and the
 * v3.28–v3.33 release notes.
 */
import type { Bi } from "~/i18n/config";
import type { ProviderGroupId } from "~/content/integrations";

export const INTEGRATIONS_PAGE: Bi<{
  meta: { title: string; description: string; crumb: string };
  hero: { eyebrow: string; title: string; lede: string; note: string; primary: string; secondary: string };
  channels: {
    eyebrow: string;
    title: string;
    lede: string;
    label: string;
    columns: { channel: string; connect: string; chats: string; streaming: string; voice: string; media: string; note: string };
    marks: { yes: string; no: string; optIn: string };
  };
  models: { eyebrow: string; title: string; lede: string; groups: Record<ProviderGroupId, string>; notes: Record<string, string> };
  voice: { eyebrow: string; title: string; lede: string; points: string[]; tts: string; stt: string };
  mcp: { eyebrow: string; title: string; lede: string; items: { icon: string; title: string; body: string }[] };
  cta: { title: string; body: string; primary: string; secondary: string; note: string };
}> = {
  en: {
    meta: {
      title: "Integrations: 10 channels, 21 model providers",
      description:
        "Connect dewee to Telegram, Zalo, Slack, Lark, WhatsApp and five more channels, 21 model providers, five voice engines and any MCP server. Missing one? Ask us.",
      crumb: "Integrations",
    },
    hero: {
      eyebrow: "Integrations",
      title: "Works where your team *already* talks.",
      lede: "Ten chat channels, 21 model providers, five voice engines and any MCP server. Switching models is one setting, and a fallback steps in when a provider fails.",
      note: "no new app to roll out",
      primary: "See every channel",
      secondary: "Missing one? Ask us",
    },
    channels: {
      eyebrow: "Channels",
      title: "Ten channels, *graded* honestly.",
      lede: "What each channel does today, from how it connects to whether replies stream. On every one of them, a stranger can be asked for a pairing code before the agent answers.",
      label: "What each chat channel supports: connection, conversations, streaming, voice notes, files and notes",
      columns: {
        channel: "Channel",
        connect: "Connects via",
        chats: "Conversations",
        streaming: "Streams",
        voice: "Voice notes",
        media: "Sends files",
        note: "Good to know",
      },
      marks: { yes: "Yes", no: "No", optIn: "opt-in" },
    },
    models: {
      eyebrow: "Models",
      title: "21 providers, *one* setting to switch.",
      lede: "Bring API keys, use the AI subscriptions your team already pays for, or keep prompts on your own hardware. If a provider rate-limits, times out or goes down, the agent moves to the next model on its list.",
      groups: { api: "API providers", subscription: "Subscriptions, via OAuth or CLI", local: "Local" },
      notes: {
        codex: "Your ChatGPT plan, GPT-6 Astra included",
        "claude-cli": "Runs through the Claude Code CLI",
        opencode: "20 models in one subscription",
        cline: "13 models in one subscription",
        ollama: "Models on your own hardware",
      },
    },
    voice: {
      eyebrow: "Voice",
      title: "Listens to voice notes. Answers *out loud*.",
      lede: "Speech in, speech out, with the engines you pick.",
      points: [
        "Voice notes are transcribed on Telegram, Lark and Discord, and on WhatsApp when you opt in.",
        "Speech-to-text tries Soniox first, then ElevenLabs Scribe. A self-hosted STT proxy can join the chain.",
        "Five text-to-speech engines. Edge TTS is free and needs no API key.",
        "Tune each engine per agent, and give Gemini several speakers.",
        "Agents can also compose music with ElevenLabs or MiniMax, and sound effects with ElevenLabs.",
      ],
      tts: "Text-to-speech",
      stt: "Speech-to-text",
    },
    mcp: {
      eyebrow: "MCP & tools",
      title: "Plug in MCP servers. Or *be* one.",
      lede: "dewee speaks MCP in both directions, and anything with a command line can become a tool.",
      items: [
        { icon: "plug", title: "Connect MCP servers", body: "Over stdio, SSE or streamable HTTP. Their keys are stored encrypted." },
        {
          icon: "server",
          title: "dewee as an MCP server",
          body: "A tenant-aware endpoint at /v1/mcp for Claude Code, Cursor, VS Code/Copilot, Gemini CLI and OpenAI remote MCP. Off until you turn it on.",
        },
        { icon: "wrench", title: "30+ built-in tools", body: "Files, web, browser, memory, messaging and media tools, ready on day one." },
        { icon: "square-terminal", title: "Custom tools, no redeploy", body: "Define a command-line tool over the API, with encrypted env vars and a timeout." },
        { icon: "key-round", title: "Credentialed CLIs", body: "Agents run CLIs like gh with stored credentials, without a shell and without seeing the secret." },
        { icon: "webhook", title: "Hooks on agent events", body: "Webhooks fire on agent events, and the console shows each one's last delivery." },
      ],
    },
    cta: {
      title: "Missing one? *Ask us*.",
      body: "Tell us the channel, model or tool your team relies on. We will say honestly whether it is coming, or how to connect it today through MCP or a custom tool.",
      primary: "Ask for an integration",
      secondary: "Ask dewee",
      note: "tell us what you use",
    },
  },
  vi: {
    meta: {
      title: "Tích hợp: 10 kênh chat, 21 nhà cung cấp model",
      description:
        "Kết nối dewee với Telegram, Zalo, Slack, Lark, WhatsApp và năm kênh khác, 21 nhà cung cấp model, năm engine giọng nói, mọi MCP server. Còn thiếu? Hỏi chúng tôi.",
      crumb: "Tích hợp",
    },
    hero: {
      eyebrow: "Tích hợp",
      title: "Làm việc ngay nơi đội ngũ *đang* trò chuyện.",
      lede: "Mười kênh chat, 21 nhà cung cấp model, năm engine giọng nói và mọi MCP server. Đổi model chỉ là một dòng cài đặt, và có model dự phòng thế chỗ khi một nhà cung cấp gặp sự cố.",
      note: "không cần cài thêm app mới",
      primary: "Xem mọi kênh",
      secondary: "Còn thiếu? Hỏi chúng tôi",
    },
    channels: {
      eyebrow: "Kênh chat",
      title: "Mười kênh, *chấm điểm* thật lòng.",
      lede: "Mỗi kênh làm được gì hôm nay, từ cách kết nối tới việc câu trả lời có stream hay không. Ở kênh nào, người lạ cũng có thể bị hỏi mã ghép cặp trước khi agent trả lời.",
      label: "Khả năng của từng kênh chat: kết nối, hội thoại, stream, tin thoại, gửi file và ghi chú",
      columns: {
        channel: "Kênh",
        connect: "Kết nối qua",
        chats: "Hội thoại",
        streaming: "Stream",
        voice: "Tin thoại",
        media: "Gửi file",
        note: "Nên biết",
      },
      marks: { yes: "Có", no: "Không", optIn: "cần bật" },
    },
    models: {
      eyebrow: "Model",
      title: "21 nhà cung cấp, đổi chỉ bằng *một* cài đặt.",
      lede: "Dùng API key, dùng luôn gói AI mà đội bạn đang trả tiền, hoặc giữ prompt trên phần cứng của riêng bạn. Nếu một nhà cung cấp bị giới hạn tốc độ, quá thời gian hoặc ngừng hoạt động, agent chuyển sang model kế tiếp trong danh sách.",
      groups: { api: "Nhà cung cấp qua API", subscription: "Gói thuê bao, qua OAuth hoặc CLI", local: "Chạy local" },
      notes: {
        codex: "Gói ChatGPT của bạn, có cả GPT-6 Astra",
        "claude-cli": "Chạy qua Claude Code CLI",
        opencode: "20 model trong một gói",
        cline: "13 model trong một gói",
        ollama: "Model chạy trên phần cứng của bạn",
      },
    },
    voice: {
      eyebrow: "Giọng nói",
      title: "Nghe được tin thoại. Trả lời *thành tiếng*.",
      lede: "Giọng nói vào, giọng nói ra, bằng engine bạn chọn.",
      points: [
        "Tin nhắn thoại được chuyển thành chữ trên Telegram, Lark và Discord, và trên WhatsApp khi bạn bật.",
        "Speech-to-text thử Soniox trước, rồi tới ElevenLabs Scribe. Có thể thêm STT proxy tự host vào chuỗi.",
        "Năm engine text-to-speech. Edge TTS miễn phí và không cần API key.",
        "Tinh chỉnh từng engine theo từng agent, và dùng nhiều giọng đọc với Gemini.",
        "Agent còn soạn được nhạc với ElevenLabs hoặc MiniMax, và hiệu ứng âm thanh với ElevenLabs.",
      ],
      tts: "Text-to-speech",
      stt: "Speech-to-text",
    },
    mcp: {
      eyebrow: "MCP & tool",
      title: "Cắm MCP server vào. Hoặc *trở thành* một.",
      lede: "dewee nói MCP theo cả hai chiều, và thứ gì chạy được bằng dòng lệnh đều có thể thành tool.",
      items: [
        { icon: "plug", title: "Kết nối MCP server", body: "Qua stdio, SSE hoặc streamable HTTP. Key được lưu ở dạng mã hoá." },
        {
          icon: "server",
          title: "dewee làm MCP server",
          body: "Endpoint /v1/mcp phân tách theo tenant cho Claude Code, Cursor, VS Code/Copilot, Gemini CLI và OpenAI remote MCP. Tắt cho tới khi bạn bật.",
        },
        { icon: "wrench", title: "Hơn 30 tool có sẵn", body: "Tool cho file, web, trình duyệt, bộ nhớ, nhắn tin và media, dùng được ngay từ ngày đầu." },
        { icon: "square-terminal", title: "Tool tuỳ chỉnh, không cần deploy lại", body: "Tạo tool chạy lệnh qua API, có biến môi trường mã hoá và giới hạn thời gian." },
        { icon: "key-round", title: "CLI có credential", body: "Agent chạy các CLI như gh bằng credential lưu sẵn, không qua shell và không thấy secret." },
        { icon: "webhook", title: "Hook theo sự kiện agent", body: "Webhook được gọi theo sự kiện của agent, và console hiện trạng thái gửi gần nhất của từng hook." },
      ],
    },
    cta: {
      title: "Còn thiếu? *Hỏi chúng tôi*.",
      body: "Cho chúng tôi biết kênh, model hay tool mà đội bạn đang dựa vào. Chúng tôi sẽ nói thật là nó sắp có, hay cách kết nối ngay hôm nay qua MCP hoặc tool tuỳ chỉnh.",
      primary: "Đề xuất tích hợp",
      secondary: "Hỏi dewee",
      note: "kể chúng tôi nghe bạn đang dùng gì",
    },
  },
};
