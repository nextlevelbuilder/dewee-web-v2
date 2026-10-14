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
  { id: "sign-in", group: "auth", route: "/", title: { en: "Sign in", vi: "Đăng nhập" }, caption: { en: "Sign in with GitHub, Google or a single-use magic link. A self-installed console also offers email and password.", vi: "Đăng nhập bằng GitHub, Google hoặc magic link dùng một lần. Console tự cài còn có email và mật khẩu." } },
  { id: "overview", group: "workspace", route: "/workspaces/:ws", title: { en: "Overview", vi: "Tổng quan" }, caption: { en: "Setup first, then a dashboard of requests, tokens, cost, latency and errors with top agents and channels.", vi: "Thiết lập trước, sau đó là bảng điều khiển về request, token, chi phí, độ trễ và lỗi, kèm agent và kênh nổi bật." } },
  { id: "chat", group: "workspace", route: "/workspaces/:ws/chat", title: { en: "Chat", vi: "Trò chuyện" }, caption: { en: "Talk to an active agent, watch the tools it calls, and approve or deny its requests inline.", vi: "Trò chuyện với agent đang hoạt động, xem các tool nó gọi và duyệt hoặc từ chối yêu cầu ngay trong hội thoại." } },
  { id: "sessions", group: "workspace", route: "/workspaces/:ws/sessions", title: { en: "Sessions", vi: "Phiên" }, caption: { en: "Every conversation from the console and connected channels, with its agent, messages and traces.", vi: "Mọi cuộc hội thoại từ console và các kênh đã kết nối, kèm agent, tin nhắn và trace." } },
  { id: "agents", group: "workspace", route: "/workspaces/:ws/agents", title: { en: "Agents", vi: "Agent" }, caption: { en: "Each agent has its own model, instructions, skills and tools. Pause, peek or open one in full.", vi: "Mỗi agent có model, chỉ dẫn, skill và tool riêng. Tạm dừng, xem nhanh hoặc mở trang đầy đủ." } },
  { id: "teams", group: "workspace", route: "/workspaces/:ws/teams", title: { en: "Agent teams", vi: "Nhóm agent" }, caption: { en: "A lead agent, member agents and a shared task board, with delegation links between them.", vi: "Một agent trưởng nhóm, các agent thành viên và bảng công việc chung, kèm liên kết uỷ quyền giữa chúng." } },
  { id: "providers", group: "capabilities", route: "/workspaces/:ws/providers", title: { en: "Providers & models", vi: "Nhà cung cấp & mô hình" }, caption: { en: "Connect LLM providers, verify their credentials and pick each one's default model.", vi: "Kết nối nhà cung cấp LLM, kiểm tra thông tin xác thực và chọn mô hình mặc định cho từng nhà cung cấp." } },
  { id: "skills", group: "capabilities", route: "/workspaces/:ws/skills", title: { en: "Skills", vi: "Kỹ năng" }, caption: { en: "Installed skills with source, version, dependency status and an Enabled switch.", vi: "Các skill đã cài, kèm nguồn, phiên bản, trạng thái phụ thuộc và công tắc bật." } },
  { id: "skill-templates", group: "capabilities", route: "/workspaces/:ws/skills?tab=templates", title: { en: "Skill templates", vi: "Mẫu kỹ năng" }, caption: { en: "The workspace's skills as starting points for new agents, filtered by category.", vi: "Các skill của workspace làm điểm khởi đầu cho agent mới, lọc theo danh mục." } },
  { id: "mcp-servers", group: "capabilities", route: "/workspaces/:ws/mcp", title: { en: "MCP servers", vi: "Máy chủ MCP" }, caption: { en: "Add MCP servers over stdio, Streamable HTTP or SSE. Agents can use one only after it is granted.", vi: "Thêm MCP server qua stdio, Streamable HTTP hoặc SSE. Agent chỉ dùng được sau khi được cấp quyền." } },
  { id: "schedules", group: "capabilities", route: "/workspaces/:ws/crons", title: { en: "Schedules", vi: "Lịch" }, caption: { en: "Send a message to an agent on a timetable, with status, owner, next run and last run.", vi: "Gửi tin nhắn cho agent theo lịch, kèm trạng thái, người tạo, lần chạy kế tiếp và lần chạy gần nhất." } },
  { id: "workflows", group: "capabilities", route: "/workspaces/:ws/workflows", title: { en: "Workflows", vi: "Workflow" }, caption: { en: "Versioned graphs of agent, knowledge and delivery steps that you test before you publish.", vi: "Workflow có phiên bản gồm các bước agent, tri thức và gửi tin, chạy thử được trước khi xuất bản." } },
  { id: "workflow-runs", group: "capabilities", route: "/workspaces/:ws/workflows/runs", title: { en: "Workflow runs", vi: "Lượt chạy workflow" }, caption: { en: "Every run with its trigger, duration and outcome.", vi: "Từng lượt chạy với nguồn kích hoạt, thời lượng và kết quả." } },
  { id: "tools", group: "capabilities", route: "/workspaces/:ws/tools", title: { en: "Built-in tools", vi: "Công cụ có sẵn" }, caption: { en: "Runtime tools by category with their risk level. Agents can only call the ones enabled here.", vi: "Công cụ của runtime theo danh mục, kèm mức rủi ro. Agent chỉ gọi được công cụ đã bật ở đây." } },
  { id: "hooks", group: "capabilities", route: "/workspaces/:ws/hooks", title: { en: "Hooks", vi: "Hook" }, caption: { en: "Run your own handler on agent events to allow, block or add context to what comes next.", vi: "Chạy handler của bạn khi agent có sự kiện, để cho phép, chặn hoặc thêm ngữ cảnh cho bước tiếp theo." } },
  { id: "channels", group: "connect", route: "/workspaces/:ws/channels", title: { en: "Channels", vi: "Kênh" }, caption: { en: "Telegram, Zalo, Slack, Discord, WhatsApp and more, each owned by an agent.", vi: "Telegram, Zalo, Slack, Discord, WhatsApp và nhiều nền tảng khác, mỗi kênh do một agent phụ trách." } },
  { id: "connectivity", group: "connect", route: "/workspaces/:ws/connectivity", title: { en: "Pairing inbox", vi: "Hộp ghép nối" }, caption: { en: "Approve, deny or revoke new senders before an agent answers them.", vi: "Duyệt, từ chối hoặc thu hồi người gửi mới trước khi agent trả lời họ." } },
  { id: "contacts", group: "connect", route: "/workspaces/:ws/contacts", title: { en: "Contacts", vi: "Danh bạ" }, caption: { en: "Everyone who has written to your agents, with identities you can merge across platforms.", vi: "Tất cả những người đã nhắn cho agent, có thể gộp danh tính trên nhiều nền tảng." } },
  { id: "pending-messages", group: "connect", route: "/workspaces/:ws/pending-messages", title: { en: "Pending messages", vi: "Tin nhắn đang chờ" }, caption: { en: "Messages waiting in the queue, grouped by channel and session, ready to compact or delete.", vi: "Tin nhắn đang chờ trong hàng đợi, gom theo kênh và phiên, có thể thu gọn hoặc xoá." } },
  { id: "memory", group: "data", route: "/workspaces/:ws/memory", title: { en: "Memory", vi: "Bộ nhớ" }, caption: { en: "What each agent keeps across sessions: documents, facts and conversation summaries.", vi: "Những gì từng agent ghi nhớ qua các phiên: tài liệu, dữ kiện và tóm tắt hội thoại." } },
  { id: "knowledge-base", group: "data", route: "/workspaces/:ws/vault", title: { en: "Knowledge base", vi: "Kho tri thức" }, caption: { en: "Documents your agents can search, and a graph of the entities and relations found in them.", vi: "Tài liệu agent có thể tìm kiếm, và đồ thị các thực thể cùng quan hệ rút ra từ chúng." } },
  { id: "storage", group: "data", route: "/workspaces/:ws/storage", title: { en: "Storage", vi: "Lưu trữ" }, caption: { en: "A file browser for the files shared across the workspace.", vi: "Trình duyệt file cho các file dùng chung trong workspace." } },
  { id: "usage", group: "monitor", route: "/workspaces/:ws/usage", title: { en: "Usage", vi: "Mức sử dụng" }, caption: { en: "Requests, tokens, estimated cost and error rate over a date range, with CSV export.", vi: "Request, token, chi phí ước tính và tỉ lệ lỗi theo khoảng thời gian, xuất được CSV." } },
  { id: "activity", group: "monitor", route: "/workspaces/:ws/activity", title: { en: "Activity", vi: "Hoạt động" }, caption: { en: "What people and agents changed in the workspace, newest first.", vi: "Những gì người và agent đã thay đổi trong workspace, mới nhất trước." } },
  { id: "traces", group: "monitor", route: "/workspaces/:ws/traces", title: { en: "Traces", vi: "Trace" }, caption: { en: "Every agent run with its tool calls, tokens, cost and hook executions.", vi: "Mọi lượt chạy của agent với tool call, token, chi phí và các lần hook chạy." } },
  { id: "monitoring", group: "monitor", route: "/workspaces/:ws/monitoring", title: { en: "Runtime health", vi: "Tình trạng runtime" }, caption: { en: "Whether the runtime is reachable, its recent error rate and last heartbeat.", vi: "Runtime có kết nối được không, tỉ lệ lỗi gần đây và nhịp tim gần nhất." } },
  { id: "members", group: "admin", route: "/workspaces/:ws/members", title: { en: "Members", vi: "Thành viên" }, caption: { en: "Who is in the workspace, their roles and pending invites.", vi: "Ai đang ở trong workspace, vai trò của họ và lời mời đang chờ." } },
  { id: "roles", group: "admin", route: "/workspaces/:ws/roles", title: { en: "Roles", vi: "Vai trò" }, caption: { en: "Built-in and custom roles, built from a matrix of permissions.", vi: "Vai trò có sẵn và tuỳ chỉnh, tạo từ ma trận quyền." } },
  { id: "api-keys", group: "admin", route: "/workspaces/:ws/api-keys", title: { en: "API keys & docs", vi: "API key & tài liệu" }, caption: { en: "Keys with an access level, shown once and revocable any time, plus API docs, an audit log and MCP client setup.", vi: "Key theo mức truy cập, chỉ hiện một lần và thu hồi bất cứ lúc nào, kèm tài liệu API, nhật ký và kết nối MCP client." } },
  { id: "settings", group: "admin", route: "/workspaces/:ws/settings", title: { en: "Settings", vi: "Cài đặt" }, caption: { en: "Workspace name, default time zone and the runtime settings you may change, saved together.", vi: "Tên workspace, múi giờ mặc định và các cài đặt runtime được phép đổi, lưu cùng một lần." } },
  { id: "backup", group: "admin", route: "/workspaces/:ws/backup", title: { en: "Backup", vi: "Sao lưu" }, caption: { en: "How your data is protected, and how to ask for an export or a restore.", vi: "Dữ liệu được bảo vệ thế nào, và cách yêu cầu xuất dữ liệu hoặc khôi phục." } },
  { id: "support", group: "admin", route: "/workspaces/:ws/support", title: { en: "Support", vi: "Hỗ trợ" }, caption: { en: "Find guidance, open a ticket or request a runtime package.", vi: "Tìm hướng dẫn, mở phiếu hỗ trợ hoặc yêu cầu gói runtime." } },
  { id: "billing", group: "admin", route: "/workspaces/:ws/billing", title: { en: "Billing", vi: "Thanh toán" }, caption: { en: "Plan, payment method, invoices and refunds for AaaS workspaces.", vi: "Gói, phương thức thanh toán, hoá đơn và hoàn tiền cho workspace AaaS." } },
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
