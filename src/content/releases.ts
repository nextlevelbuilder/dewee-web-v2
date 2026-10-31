/**
 * The latest stable dewee releases, EN + VI, newest first. The /features calendar and its caption
 * follow RELEASES[0], and secondary-pages-copy.test.ts checks that it matches FACTS.stableRelease.
 *
 * Source (verified 2026-10-19): GitHub release notes v3.28.0 → v3.40.0, stable only. v3.38.1 is a
 * single fix whose notes are only a compare link, so it has no entry. Beta releases
 * (v3.41.0-beta.x) are left out on purpose.
 */
import type { Bi } from "~/i18n/config";

export type Release = {
  /** Git tag without the leading "v", e.g. "3.40.0" */
  version: string;
  /** ISO date the release was published */
  date: string;
  title: Bi;
  items: Bi<string[]>;
};

/** Stable releases since v3.28 (September and October 2026), newest first. */
export const RELEASES: Release[] = [
  {
    version: "3.40.0",
    date: "2026-10-15",
    title: { en: "A browser your agents can borrow", vi: "Trình duyệt của bạn, agent mượn được" },
    items: {
      en: [
        "A connected browser: with your grant, an agent works in tabs of your own Chrome through the dewee extension",
        "The admin console is rebuilt, and GitHub sign-in is fixed",
        "Leased workers stop before their lease runs out",
        "Every stable release is built from one preflighted commit that runs the full test suite first",
      ],
      vi: [
        "Trình duyệt kết nối: khi bạn cấp quyền, agent làm việc trên các tab Chrome của chính bạn qua tiện ích dewee",
        "Giao diện admin console được dựng lại, và đăng nhập GitHub đã được sửa",
        "Worker thuê theo lease dừng trước khi lease hết hạn",
        "Mỗi bản stable được build từ một commit đã preflight, chạy trọn bộ test trước khi phát hành",
      ],
    },
  },
  {
    version: "3.39.0",
    date: "2026-10-14",
    title: { en: "Say who may use what", vi: "Ai được dùng gì, nói rõ từng người" },
    items: {
      en: [
        "Share levels for agents, and access grants for skills, MCP servers, providers and packages, with an access panel in the console and the CLI",
        "Agents improve from evidence: candidate changes are replayed on saved examples, tried on live traffic once approved, and rolled back if they regress",
        "Signed external events, starting with GitHub, can wake an agent",
        "Memory facts keep their provenance and follow a clear lifecycle",
        "The public MCP endpoint is served at /mcp/server, with status checks, connection diagnostics and a setup screen in the console",
        "Atlas Cloud joins as a native chat provider",
      ],
      vi: [
        "Cấp độ chia sẻ cho agent, và quyền truy cập cho skill, MCP server, nhà cung cấp và package, kèm bảng quyền trong console và CLI",
        "Agent cải thiện dựa trên bằng chứng: thay đổi đề xuất được chạy lại trên ví dụ đã lưu, thử trên lưu lượng thật sau khi được duyệt, và quay lui nếu kết quả tệ đi",
        "Sự kiện bên ngoài có chữ ký, bắt đầu từ GitHub, có thể đánh thức một agent",
        "Dữ kiện trong bộ nhớ giữ nguồn gốc và theo một vòng đời rõ ràng",
        "Endpoint MCP công khai chuyển sang /mcp/server, kèm kiểm tra trạng thái, chẩn đoán kết nối và màn hình thiết lập trong console",
        "Atlas Cloud gia nhập như một nhà cung cấp chat gốc",
      ],
    },
  },
  {
    version: "3.38.0",
    date: "2026-10-07",
    title: { en: "A CLI for agents, onboarding by conversation", vi: "CLI cho agent, làm quen bằng hội thoại" },
    items: {
      en: [
        "An agent-first CLI: structured errors, non-interactive create-and-update commands, idempotency, a handshake and a command manifest",
        "Set up a workspace by talking to a Super Agent, with the plan and each step kept as durable state",
        "Fewer round trips per request in the control plane",
      ],
      vi: [
        "CLI ưu tiên agent: lỗi có cấu trúc, lệnh tạo và cập nhật không cần tương tác, idempotency, handshake và manifest lệnh",
        "Thiết lập workspace bằng cách trò chuyện với Super Agent, kế hoạch và từng bước được lưu bền vững",
        "Control plane xử lý mỗi yêu cầu với ít vòng gọi hơn",
      ],
    },
  },
  {
    version: "3.37.0",
    date: "2026-10-05",
    title: { en: "Channels that know who is talking", vi: "Kênh chat biết ai đang nói" },
    items: {
      en: [
        "Trusted channel identity, plus an inbound gate that screens messages through an MCP tool before the agent sees them (Zalo Personal first)",
        "Discord observe mode records every in-scope server message in a tenant-scoped inbox, and support threads let the author keep talking without mentioning the bot",
        "A guard that checks Discord's remaining connection budget, so a busy support agent does not get its bot token reset",
      ],
      vi: [
        "Danh tính kênh đáng tin cậy, cùng một cổng kiểm tra lọc tin nhắn qua một tool MCP trước khi agent nhìn thấy (bắt đầu với Zalo cá nhân)",
        "Chế độ observe của Discord ghi mọi tin nhắn trong phạm vi vào hộp thư theo tenant, và thread hỗ trợ cho phép người hỏi tiếp tục trò chuyện mà không cần nhắc tên bot",
        "Cơ chế bảo vệ kiểm tra hạn mức kết nối còn lại của Discord, để agent hỗ trợ bận rộn không bị reset token bot",
      ],
    },
  },
  {
    version: "3.36.0",
    date: "2026-10-01",
    title: { en: "Model catalogs that follow your scope", vi: "Danh mục model theo đúng phạm vi của bạn" },
    items: {
      en: [
        "Scoped model catalogs, and GPT-6.1 Sol",
        "Reflex decisions show up in trace details",
        "Stricter validation of import archives",
      ],
      vi: [
        "Danh mục model theo phạm vi, và GPT-6.1 Sol",
        "Quyết định của Reflex hiện trong chi tiết trace",
        "Kiểm tra chặt hơn đối với gói import",
      ],
    },
  },
  {
    version: "3.35.0",
    date: "2026-09-29",
    title: { en: "The control plane catches up with the runtime", vi: "Control plane bắt kịp runtime" },
    items: {
      en: [
        "Agent teams in the console: task detail, task actions and team settings",
        "Chat keys confined to a single agent",
        "A complete workflow editor, with published versions and run feedback",
        "Deep span inspection in traces, with stricter secret redaction",
        "A workspace activity audit with readable labels and actor names",
        "Providers, models, memory, knowledge vault and schedules reach parity with the runtime dashboard",
        "HTTP MCP servers can use static or OAuth authentication",
      ],
      vi: [
        "Đội agent trong console: chi tiết task, thao tác task và cài đặt đội",
        "Chat key bị giới hạn trong một agent duy nhất",
        "Trình soạn workflow hoàn chỉnh, có phiên bản đã publish và phản hồi khi chạy",
        "Soi sâu từng span trong trace, kèm che secret chặt hơn",
        "Nhật ký hoạt động của workspace với nhãn dễ đọc và tên người thực hiện",
        "Nhà cung cấp, model, bộ nhớ, kho tri thức và lịch chạy ngang bằng dashboard của runtime",
        "MCP server qua HTTP có thể dùng xác thực tĩnh hoặc OAuth",
      ],
    },
  },
  {
    version: "3.34.0",
    date: "2026-09-25",
    title: { en: "A calmer control plane", vi: "Control plane gọn gàng hơn" },
    items: {
      en: [
        "The Calm Precision redesign across every page of the customer control plane",
        "Export archives download from the Import/Export tab and the CLI",
        "Self-install: first-run owner setup, password sign-in, the dewee selfhost CLI and a per-workspace channels licence",
      ],
      vi: [
        "Giao diện Calm Precision được áp dụng cho mọi trang của customer control plane",
        "Tải gói export ngay từ tab Import/Export và CLI",
        "Self-install: thiết lập chủ sở hữu ở lần chạy đầu, đăng nhập bằng mật khẩu, CLI dewee selfhost và license kênh theo từng workspace",
      ],
    },
  },
  {
    version: "3.33.0",
    date: "2026-09-24",
    title: { en: "The control plane speaks Vietnamese", vi: "Control plane nói tiếng Việt" },
    items: {
      en: [
        "Customer Control Plane in English and Vietnamese, with your time zone",
        "Credential retargeting through the operator CLI is blocked, and gateway secrets are stripped from host exec",
        "Reasoning-effort ladders per vendor, plus Opus 5.5, Fable 5.1 and GPT-6 Sol-Luna",
        "Gemini 3.8 Flash and Flash-Lite text-to-speech",
      ],
      vi: [
        "Customer Control Plane có tiếng Anh, tiếng Việt và theo múi giờ của bạn",
        "Chặn việc đổi đích credential qua CLI vận hành, và loại secret của gateway khỏi lệnh exec trên host",
        "Thang reasoning effort theo từng hãng, thêm Opus 5.5, Fable 5.1 và GPT-6 Sol-Luna",
        "Text-to-speech Gemini 3.8 Flash và Flash-Lite",
      ],
    },
  },
  {
    version: "3.32.0",
    date: "2026-09-22",
    title: { en: "dewee becomes an MCP server", vi: "dewee thành MCP server" },
    items: {
      en: [
        "A tenant-aware public MCP endpoint, off until you turn it on (served at /mcp/server since v3.39)",
        "Works with Claude Code, Cursor, VS Code/Copilot, Gemini CLI and OpenAI remote MCP",
        "Write tools need their own scope, mcp.tools.write",
        "Deploy readiness checks retry instead of failing early",
      ],
      vi: [
        "Endpoint MCP công khai theo tenant, chỉ mở khi bạn bật (từ v3.39 phục vụ tại /mcp/server)",
        "Dùng được với Claude Code, Cursor, VS Code/Copilot, Gemini CLI và OpenAI remote MCP",
        "Tool ghi dữ liệu cần scope riêng là mcp.tools.write",
        "Bước kiểm tra sẵn sàng khi deploy sẽ thử lại thay vì dừng sớm",
      ],
    },
  },
  {
    version: "3.31.0",
    date: "2026-09-21",
    title: { en: "More models on the menu", vi: "Thêm model vào thực đơn" },
    items: {
      en: [
        "GPT-6 Astra through your ChatGPT subscription",
        "ClinePass (13 models) and OpenCode Go (20 models)",
        "Vercel AI Gateway, and all 27 Workers AI text models",
        "The Customer Control Plane can now do everything the runtime dashboard does",
      ],
      vi: [
        "GPT-6 Astra qua gói ChatGPT bạn đang dùng",
        "ClinePass (13 model) và OpenCode Go (20 model)",
        "Vercel AI Gateway, và đủ 27 model text của Workers AI",
        "Customer Control Plane làm được mọi thao tác như dashboard runtime",
      ],
    },
  },
  {
    version: "3.30.0",
    date: "2026-09-19",
    title: { en: "Workflows you can draw", vi: "Workflow vẽ được, chạy đúng từng bước" },
    items: {
      en: [
        "Deterministic visual workflows: canvas editor, CLI and run inspector",
        "Cron jobs can start a workflow",
        "A message sent to a busy agent is read as a status check, cancel, steer or new task (opt-in)",
        "Intent decisions and a semantic evaluator (shadow mode) show up in traces",
      ],
      vi: [
        "Workflow trực quan chạy tất định: canvas, CLI và trình xem từng lần chạy",
        "Cron có thể khởi động workflow",
        "Tin nhắn gửi lúc agent đang bận được hiểu là hỏi tiến độ, huỷ, đổi hướng hay việc mới (bật khi cần)",
        "Quyết định ý định và bộ đánh giá ngữ nghĩa (chế độ shadow) hiện trong trace",
      ],
    },
  },
  {
    version: "3.29.0",
    date: "2026-09-04",
    title: { en: "Clearer traces, stricter tenants", vi: "Trace rõ hơn, tenant chặt hơn" },
    items: {
      en: [
        "Traces show how reasoning was delivered",
        "Fleet admin operations write trace spans",
        "An unknown --tenant is rejected instead of quietly falling back to the master tenant",
        "Backup skills for operators running dewee on a VPS",
      ],
      vi: [
        "Trace cho thấy phần reasoning được trả về ra sao",
        "Thao tác quản trị fleet cũng ghi span vào trace",
        "--tenant không xác định bị từ chối, thay vì âm thầm rơi về tenant master",
        "Skill sao lưu cho người vận hành dewee trên VPS",
      ],
    },
  },
  {
    version: "3.28.0",
    date: "2026-09-03",
    title: { en: "Voice and reasoning, tuned per agent", vi: "Giọng nói và suy luận, chỉnh theo từng agent" },
    items: {
      en: [
        "Per-provider TTS parameters and multi-speaker Gemini voices from the CLI",
        "Speech-to-text settings from the CLI with dewee stt config",
        "Per-agent reasoning settings, validated before they reach the model",
      ],
      vi: [
        "Tham số TTS riêng cho từng hãng và giọng Gemini nhiều người đọc, chỉnh ngay từ CLI",
        "Cấu hình speech-to-text từ CLI bằng lệnh dewee stt config",
        "Cấu hình reasoning cho từng agent, được kiểm tra trước khi gửi tới model",
      ],
    },
  },
];
