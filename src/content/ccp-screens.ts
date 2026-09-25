/**
 * Screenshots of the dewee control plane (CCP), captured from the redesigned console at
 * 1440×900 (2x) in both themes and served from R2 at cdn.dewee.sh/ccp/v1/.
 * The data on screen is the console's demo workspace ("Acme Support"), not a customer.
 * Re-capture into a new version folder (v2, …) instead of overwriting: the files are immutable-cached.
 */
import type { Bi } from "~/i18n/config";
import { SITE } from "~/content/site";

export type CcpGroup = "auth" | "workspace" | "capabilities" | "connect" | "data" | "monitor" | "admin";
export type CcpScreenId = (typeof CCP_SCREENS)[number]["id"];
export interface CcpScreen { id: string; group: CcpGroup; route: string; title: Bi; caption: Bi }

export const CCP_SHOT = { version: "v1", width: 1440, height: 900 } as const;

export const CCP_GROUPS: Record<CcpGroup, Bi> = {
  auth: { en: "Sign in", vi: "Đăng nhập" },
  workspace: { en: "Workspace", vi: "Workspace" },
  capabilities: { en: "Capabilities", vi: "Năng lực" },
  connect: { en: "Connect", vi: "Kết nối" },
  data: { en: "Data", vi: "Dữ liệu" },
  monitor: { en: "Monitor", vi: "Giám sát" },
  admin: { en: "Admin", vi: "Quản trị" },
};

export const CCP_SCREENS = [
  { id: "sign-in", group: "auth", route: "/", title: { en: "Sign in", vi: "Đăng nhập" }, caption: { en: "Sign in with GitHub, Google or a magic link sent to your work email.", vi: "Đăng nhập bằng GitHub, Google hoặc magic link gửi về email công việc." } },
  { id: "overview", group: "workspace", route: "/workspaces/:ws", title: { en: "Overview", vi: "Tổng quan" }, caption: { en: "The workspace at a glance: setup checklist, requests, spend, latency and errors.", vi: "Toàn cảnh workspace: checklist thiết lập, lượng request, chi phí, độ trễ và lỗi." } },
  { id: "chat", group: "workspace", route: "/workspaces/:ws/chat", title: { en: "Chat", vi: "Chat" }, caption: { en: "Talk to any agent. Hand-offs between agents show up inline.", vi: "Trò chuyện với bất kỳ agent nào. Việc chuyển giao giữa các agent hiện ngay trong hội thoại." } },
  { id: "sessions", group: "workspace", route: "/workspaces/:ws/sessions", title: { en: "Sessions", vi: "Phiên hội thoại" }, caption: { en: "Every conversation with its channel, message count, model and trace.", vi: "Mọi cuộc hội thoại kèm kênh, số tin nhắn, model và trace." } },
  { id: "agents", group: "workspace", route: "/workspaces/:ws/agents", title: { en: "Agents", vi: "Agent" }, caption: { en: "Each agent has its own model, instructions, skills and tool grants.", vi: "Mỗi agent có model, hướng dẫn, skill và quyền dùng tool riêng." } },
  { id: "teams", group: "workspace", route: "/workspaces/:ws/teams", title: { en: "Agent teams", vi: "Nhóm agent" }, caption: { en: "Group agents into teams with a shared task board.", vi: "Gom agent thành nhóm, dùng chung một bảng công việc." } },
  { id: "providers", group: "capabilities", route: "/workspaces/:ws/providers", title: { en: "Providers & models", vi: "Provider & model" }, caption: { en: "Connect LLM providers and pick a default model for each.", vi: "Kết nối các LLM provider và chọn model mặc định cho từng provider." } },
  { id: "skills", group: "capabilities", route: "/workspaces/:ws/skills", title: { en: "Skills", vi: "Skill" }, caption: { en: "A catalogue of skills with version, source and an on/off switch.", vi: "Danh mục skill kèm phiên bản, nguồn và công tắc bật/tắt." } },
  { id: "skill-templates", group: "capabilities", route: "/workspaces/:ws/skills?tab=templates", title: { en: "Skill templates", vi: "Mẫu skill" }, caption: { en: "Start from a template that lists what it needs before you enable it.", vi: "Bắt đầu từ mẫu có sẵn, ghi rõ cần gì trước khi bật." } },
  { id: "mcp-servers", group: "capabilities", route: "/workspaces/:ws/mcp", title: { en: "MCP servers", vi: "MCP server" }, caption: { en: "Attach MCP servers over stdio, HTTP or SSE and see their tools.", vi: "Gắn MCP server qua stdio, HTTP hoặc SSE và xem danh sách tool của chúng." } },
  { id: "schedules", group: "capabilities", route: "/workspaces/:ws/crons", title: { en: "Schedules", vi: "Lịch chạy" }, caption: { en: "Recurring jobs with cron expressions, next run and who can edit them.", vi: "Tác vụ định kỳ với biểu thức cron, lần chạy kế tiếp và quyền chỉnh sửa." } },
  { id: "workflows", group: "capabilities", route: "/workspaces/:ws/workflows", title: { en: "Workflows", vi: "Workflow" }, caption: { en: "Versioned workflow definitions with their latest run status.", vi: "Định nghĩa workflow có phiên bản, kèm trạng thái lần chạy gần nhất." } },
  { id: "workflow-runs", group: "capabilities", route: "/workspaces/:ws/workflows/runs", title: { en: "Workflow runs", vi: "Lịch sử chạy workflow" }, caption: { en: "Every run with its trigger, duration and outcome.", vi: "Từng lần chạy với nguồn kích hoạt, thời lượng và kết quả." } },
  { id: "tools", group: "capabilities", route: "/workspaces/:ws/tools", title: { en: "Built-in tools", vi: "Tool tích hợp" }, caption: { en: "Built-in tools by category, with the secrets each one needs.", vi: "Tool tích hợp theo nhóm, ghi rõ secret mà từng tool cần." } },
  { id: "hooks", group: "capabilities", route: "/workspaces/:ws/hooks", title: { en: "Hooks", vi: "Hook" }, caption: { en: "Webhooks on agent events, with the last delivery status.", vi: "Webhook theo sự kiện của agent, kèm trạng thái gửi gần nhất." } },
  { id: "channels", group: "connect", route: "/workspaces/:ws/channels", title: { en: "Channels", vi: "Kênh" }, caption: { en: "Telegram, Zalo OA, Slack, Discord and WhatsApp, each owned by an agent.", vi: "Telegram, Zalo OA, Slack, Discord và WhatsApp, mỗi kênh do một agent phụ trách." } },
  { id: "connectivity", group: "connect", route: "/workspaces/:ws/connectivity", title: { en: "Pairing inbox", vi: "Hộp ghép cặp" }, caption: { en: "Approve new senders before an agent answers them.", vi: "Duyệt người gửi mới trước khi agent trả lời họ." } },
  { id: "contacts", group: "connect", route: "/workspaces/:ws/contacts", title: { en: "Contacts", vi: "Danh bạ" }, caption: { en: "Everyone your agents have talked to, across platforms.", vi: "Tất cả những người agent đã trò chuyện, trên mọi nền tảng." } },
  { id: "pending-messages", group: "connect", route: "/workspaces/:ws/pending-messages", title: { en: "Pending messages", vi: "Tin nhắn chờ" }, caption: { en: "Messages waiting in the queue, grouped by channel and session.", vi: "Tin nhắn đang chờ xử lý, gom theo kênh và phiên." } },
  { id: "memory", group: "data", route: "/workspaces/:ws/memory", title: { en: "Memory", vi: "Bộ nhớ" }, caption: { en: "What agents remember, shared or personal, with embedding status.", vi: "Những gì agent ghi nhớ, dùng chung hoặc cá nhân, kèm trạng thái embedding." } },
  { id: "knowledge-base", group: "data", route: "/workspaces/:ws/vault", title: { en: "Knowledge base", vi: "Kho tri thức" }, caption: { en: "Documents, notes and context your agents can cite.", vi: "Tài liệu, ghi chú và ngữ cảnh mà agent có thể trích dẫn." } },
  { id: "storage", group: "data", route: "/workspaces/:ws/storage", title: { en: "Storage", vi: "Lưu trữ" }, caption: { en: "A file browser for everything agents read and write.", vi: "Trình duyệt file cho mọi thứ agent đọc và ghi." } },
  { id: "usage", group: "monitor", route: "/workspaces/:ws/usage", title: { en: "Usage", vi: "Mức sử dụng" }, caption: { en: "Requests, tokens and estimated cost over time.", vi: "Request, token và chi phí ước tính theo thời gian." } },
  { id: "activity", group: "monitor", route: "/workspaces/:ws/activity", title: { en: "Activity", vi: "Nhật ký hoạt động" }, caption: { en: "An audit log written as sentences, linked to the traces behind them.", vi: "Nhật ký kiểm toán viết thành câu, liên kết tới trace tương ứng." } },
  { id: "traces", group: "monitor", route: "/workspaces/:ws/traces", title: { en: "Traces", vi: "Trace" }, caption: { en: "Every agent run with its spans, tool calls, tokens and cost.", vi: "Mọi lượt chạy của agent với span, tool call, token và chi phí." } },
  { id: "monitoring", group: "monitor", route: "/workspaces/:ws/monitoring", title: { en: "Runtime health", vi: "Sức khoẻ runtime" }, caption: { en: "Connection status, tenant binding and capacity of the runtime.", vi: "Trạng thái kết nối, liên kết tenant và công suất của runtime." } },
  { id: "members", group: "admin", route: "/workspaces/:ws/members", title: { en: "Members", vi: "Thành viên" }, caption: { en: "Who is in the workspace and what role they hold.", vi: "Ai đang ở trong workspace và giữ vai trò gì." } },
  { id: "roles", group: "admin", route: "/workspaces/:ws/roles", title: { en: "Roles", vi: "Vai trò" }, caption: { en: "Built-in and custom roles with a permission matrix.", vi: "Vai trò có sẵn và tuỳ chỉnh, kèm ma trận phân quyền." } },
  { id: "api-keys", group: "admin", route: "/workspaces/:ws/api-keys", title: { en: "API keys", vi: "API key" }, caption: { en: "Scoped API keys, shown once, revocable any time.", vi: "API key theo phạm vi, chỉ hiện một lần, thu hồi bất cứ lúc nào." } },
  { id: "settings", group: "admin", route: "/workspaces/:ws/settings", title: { en: "Settings", vi: "Cài đặt" }, caption: { en: "Workspace name, time zone and runtime configuration.", vi: "Tên workspace, múi giờ và cấu hình runtime." } },
  { id: "backup", group: "admin", route: "/workspaces/:ws/backup", title: { en: "Backup & export", vi: "Sao lưu & xuất dữ liệu" }, caption: { en: "Export your data or request a restore.", vi: "Xuất dữ liệu hoặc yêu cầu khôi phục." } },
  { id: "support", group: "admin", route: "/workspaces/:ws/support", title: { en: "Support", vi: "Hỗ trợ" }, caption: { en: "Reach the team, open a ticket or request a package.", vi: "Liên hệ đội ngũ, mở ticket hoặc yêu cầu thêm gói." } },
  { id: "billing", group: "admin", route: "/workspaces/:ws/billing", title: { en: "Billing", vi: "Thanh toán" }, caption: { en: "Current plan, renewal date and invoices (AaaS workspaces).", vi: "Gói hiện tại, ngày gia hạn và hoá đơn (workspace AaaS)." } },
] as const satisfies readonly CcpScreen[];

export function ccpScreen(id: CcpScreenId): CcpScreen {
  return CCP_SCREENS.find((s) => s.id === id)!;
}

/** CDN URL of one capture. `width` 1440 is 1x, 2880 is 2x. */
export function ccpShotSrc(id: CcpScreenId, theme: "light" | "dark", width: 1440 | 2880 = 1440): string {
  return `${SITE.cdn}/ccp/${CCP_SHOT.version}/${id}-${theme}-${width}.webp`;
}

/** Plain-string props for `CcpShot`, already localised. */
export function ccpShotProps(id: CcpScreenId, locale: "en" | "vi") {
  const s = ccpScreen(id);
  return { id, title: s.title[locale], caption: s.caption[locale], path: s.route.replace(":ws", "acme") };
}
