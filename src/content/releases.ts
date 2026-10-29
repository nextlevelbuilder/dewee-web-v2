/**
 * The latest stable dewee releases, EN + VI, newest first. The /features calendar and its caption
 * follow RELEASES[0], and secondary-pages-copy.test.ts checks that it matches FACTS.stableRelease.
 *
 * Source (verified 2026-10-29): GitHub release notes v3.28.0 → v3.41.0 and v3.43.0, and the
 * non-merge commits between v3.41.0 and v3.42.0 (that release's notes are only a promotion PR),
 * stable only.
 * v3.38.1 is a single fix whose notes are only a compare link, so it has no entry. Beta releases
 * (v3.43.0-beta.x and later) are left out on purpose. scripts/check-stable-release.ts fails when GitHub
 * has a newer stable release than FACTS.stableRelease.
 */
import type { Bi } from "~/i18n/config";

export type Release = {
  /** Git tag without the leading "v", e.g. "3.43.0" */
  version: string;
  /** ISO date the release was published */
  date: string;
  title: Bi;
  items: Bi<string[]>;
};

/** Stable releases since v3.28 (September and October 2026), newest first. */
export const RELEASES: Release[] = [
  {
    version: "3.43.0",
    date: "2026-10-29",
    title: { en: "Every run stays inside its limits", vi: "Mỗi lượt chạy luôn trong giới hạn của nó" },
    items: {
      en: [
        "A run keeps its tool limits and tool policy when it resumes, continues after a credential request or goes through the CLI bridge, and memory flush and the advisor use only the tools the run allows",
        "Runs with a tool ceiling cannot write shared memory facts, and tenant and credential boundaries are tightened further",
        "Public webchat checks which agents a visitor may reach, keeps operator runs without limits out of visitor conversations, and warns when an allowed tool exposes shared memory, the knowledge graph or the vault",
        "Self-hosted installs trust a forwarded caller address only from proxies you list, and print the setup link after a failed first install and on the published port",
        "MCP sign-in with OAuth works from the hosted control plane, and the MCP server's Tools tab lists the tools found when testing with OAuth",
        "A grouped model picker with default models from the catalogue, and during setup owners can switch provider or reopen the plan at the key step",
      ],
      vi: [
        "Lượt chạy giữ nguyên giới hạn tool và chính sách tool khi được tiếp tục, khi chạy tiếp sau một yêu cầu credential hoặc khi đi qua cầu nối CLI; memory flush và advisor chỉ dùng các tool mà lượt chạy cho phép",
        "Lượt chạy có trần tool không thể ghi memory fact dùng chung, và ranh giới giữa các tenant và credential được siết chặt thêm",
        "Webchat công khai kiểm tra khách được nói chuyện với agent nào, không để lượt chạy của operator thiếu giới hạn lọt vào hội thoại của khách, và cảnh báo khi một tool được cho phép làm lộ memory dùng chung, knowledge graph hoặc vault",
        "Bản tự cài chỉ tin địa chỉ người gọi được chuyển tiếp từ các proxy bạn liệt kê, và in link thiết lập sau khi lần cài đầu thất bại và trên đúng cổng đã publish",
        "Đăng nhập MCP bằng OAuth chạy được từ control plane lưu trữ sẵn, và tab Tools của MCP server liệt kê các tool tìm thấy khi kiểm tra bằng OAuth",
        "Bộ chọn model theo nhóm với model mặc định lấy từ danh mục, và trong lúc thiết lập owner có thể đổi nhà cung cấp hoặc mở lại gói ở bước nhập key",
      ],
    },
  },
  {
    version: "3.42.0",
    date: "2026-10-27",
    title: { en: "Credentials stay private, connections stay on course", vi: "Credential luôn riêng tư, kết nối luôn đúng hướng" },
    items: {
      en: [
        "Credential links reach only the person who asked, in their direct chat, and every refusal is traced and audited",
        "Agent operations on workspace resources pass an on-behalf authorisation gate",
        "Outbound connections are checked at dial time: web fetch, saved MCP servers, audio endpoints and Zalo media refuse private addresses",
        "Public webchat is managed from the control plane, and channels get an Advanced settings tab",
        "The Chrome extension asks for an explicit browser OAuth scope",
        "Slack keeps URLs intact when it converts Markdown, and testing a workspace MCP server now sends its API key",
      ],
      vi: [
        "Link credential chỉ gửi tới đúng người yêu cầu, trong chat riêng của họ, và mọi lần từ chối đều được ghi trace và audit",
        "Thao tác của agent trên tài nguyên workspace phải qua cổng uỷ quyền thay mặt người dùng",
        "Kết nối ra ngoài được kiểm tra ngay lúc dial: web fetch, MCP server đã lưu, endpoint âm thanh và media Zalo đều từ chối địa chỉ nội bộ",
        "Webchat công khai được quản lý từ control plane, và kênh chat có thêm tab Cài đặt nâng cao",
        "Tiện ích Chrome yêu cầu phạm vi OAuth trình duyệt rõ ràng",
        "Slack giữ nguyên URL khi chuyển Markdown, và kiểm tra MCP server của workspace giờ gửi kèm API key",
      ],
    },
  },
  {
    version: "3.41.0",
    date: "2026-10-21",
    title: { en: "Sign-in for your product, rules for your agents", vi: "Đăng nhập cho sản phẩm của bạn, luật cho agent của bạn" },
    items: {
      en: [
        "Identity for your own product: a hosted Dewee Connect flow, trusted user context, a session exchange API and CLI, a TypeScript server SDK, and MCP tools scoped to the signed-in person",
        "Decision policies can be managed from the runtime, the control plane and the CLI",
        "The OpenRouter model catalogue is synced for you",
        "Runtime packages in the control plane are managed by the Master Super Agent",
        "Connect a provider safely from the Super Agent chat",
        "Scoped admin API keys and role-based access for the owner admin console",
        "Sensitive data is redacted more thoroughly in traces and provider error bodies, and Telegram and other channels run more steadily",
      ],
      vi: [
        "Danh tính cho chính sản phẩm của bạn: luồng Dewee Connect lưu trữ sẵn, ngữ cảnh người dùng tin cậy, API và CLI đổi session, TypeScript server SDK, và tool MCP giới hạn theo người đang đăng nhập",
        "Quản lý decision policy từ runtime, control plane và CLI",
        "Danh mục model OpenRouter được đồng bộ tự động",
        "Runtime package trong control plane do Master Super Agent quản lý",
        "Kết nối nhà cung cấp một cách an toàn ngay từ chat với Super Agent",
        "API key admin theo phạm vi và phân quyền theo vai trò cho admin console của owner",
        "Dữ liệu nhạy cảm được che kỹ hơn trong trace và nội dung lỗi của nhà cung cấp, còn Telegram và các kênh khác chạy ổn định hơn",
      ],
    },
  },
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
