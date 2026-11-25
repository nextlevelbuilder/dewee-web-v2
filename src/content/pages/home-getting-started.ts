/**
 * Homepage "Getting started" copy: four ways in. Facts and their sources:
 * - SaaS: app.dewee.sh is the hosted control plane and AaaS runtimes run on shared servers we
 *   operate (src/content/legal/terms.ts, src/content/legal/privacy.ts "where-stored").
 * - Install: the command is SELF_INSTALL.commands.script (src/content/site.ts) and the agent
 *   prompt is installAgentPrompt() (src/content/install-agent-prompt.ts); this file never copies them.
 * - MCP: /mcp/docs is public, needs no sign-in and serves search_docs and fetch_doc over the
 *   deployed docs (src/pages/mcp/docs.ts, src/lib/server/docs/public-docs-mcp-tools.ts). The full
 *   /mcp (blog, pages, docs proposals) needs OAuth or an API key granted by a dewee.sh super admin.
 */
import type { Bi } from "~/i18n/config";

export const GETTING_STARTED_ANCHOR = "getting-started";
export const MCP_URL = "https://dewee.sh/mcp/docs";

/** Client snippets are code, identical in both locales. OAuth clients need no key in the config. */
export const MCP_SNIPPETS = {
  claudeCode: `claude mcp add --transport http dewee-docs ${MCP_URL}`,
  cursor: `{
  "mcpServers": {
    "dewee-docs": { "url": "${MCP_URL}" }
  }
}`,
} as const;

export type GettingStartedCopy = {
  eyebrow: string;
  title: string;
  lede: string;
  recommended: string;
  copy: { copy: string; copied: string; failed: string };
  saas: { title: string; body: string; steps: string[]; data: string; legal: string; terms: string; privacy: string; cta: string };
  install: { title: string; body: string; scriptLabel: string; agentTitle: string; agentBody: string; agentLabel: string; cta: string };
  mcp: { title: string; body: string; access: string; tools: string; snippets: { claudeDesktop: string; claudeCode: string; cursor: string }; desktopSteps: string; publicNote: string; cta: string };
  humans: { title: string; body: string; docs: string; blog: string };
};

export const GETTING_STARTED: Bi<GettingStartedCopy> = {
  en: {
    eyebrow: "Getting started",
    title: "Four ways to *start today*.",
    lede: "Try the hosted app in a minute, install dewee on your own machine, connect your AI tools to our docs, or just read.",
    recommended: "Recommended",
    copy: { copy: "Copy", copied: "Copied", failed: "Copy failed" },
    saas: {
      title: "Try the SaaS",
      body: "The quickest way to look around: no install, nothing to run.",
      steps: ["Open app.dewee.sh and create an account.", "Set up your workspace and your first agent."],
      data: "Your data: workspace content (prompts, files, agent settings and conversations) is stored in the dewee cloud, on shared servers we operate. AI provider keys are stored encrypted.",
      legal: "By signing up you accept the {terms} and the {privacy}.",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      cta: "Open app.dewee.sh",
    },
    install: {
      title: "Install on your own machine",
      body: "One command installs the dewee runtime on macOS or Linux. Your data stays on your machine.",
      scriptLabel: "Terminal",
      agentTitle: "Or let your coding agent do it",
      agentBody: "Paste this prompt into Claude Code, Codex or Cursor. It checks your machine, asks before it changes anything, and installs dewee.",
      agentLabel: "Prompt for your coding agent",
      cta: "Full install guide",
    },
    mcp: {
      title: "Connect the MCP endpoint",
      body: "Point Claude, Cursor or any MCP client at {url} so it can search and read the dewee docs while it works. It is public: no sign-in, no key.",
      access: "Need blog posts, pages or docs edits too? The full endpoint at /mcp signs in with OAuth 2.1 or an API key granted by the dewee team.",
      tools: "Tools: search_docs finds pages in English or Vietnamese, fetch_doc reads one as Markdown.",
      snippets: { claudeDesktop: "Claude desktop", claudeCode: "Claude Code", cursor: "Cursor: ~/.cursor/mcp.json" },
      desktopSteps: "Settings → Connectors → Add custom connector, then paste the URL.",
      publicNote: "Prefer plain files? Any AI tool can read the index at /llms.txt.",
      cta: "Developer guide",
    },
    humans: {
      title: "For humans",
      body: "Guides, concepts and release notes, written to be read.",
      docs: "Read the docs",
      blog: "Read the blog",
    },
  },
  vi: {
    eyebrow: "Bắt đầu",
    title: "Bốn cách để *bắt đầu ngay*.",
    lede: "Dùng thử bản cloud trong một phút, cài dewee trên máy của bạn, kết nối công cụ AI với tài liệu của chúng tôi, hoặc chỉ cần đọc.",
    recommended: "Khuyên dùng",
    copy: { copy: "Sao chép", copied: "Đã sao chép", failed: "Không sao chép được" },
    saas: {
      title: "Dùng thử bản SaaS",
      body: "Cách nhanh nhất để xem thử: không cần cài, không phải chạy gì.",
      steps: ["Mở app.dewee.sh và tạo tài khoản.", "Thiết lập workspace và agent đầu tiên."],
      data: "Dữ liệu của bạn: nội dung workspace (prompt, tệp, cấu hình agent và hội thoại) được lưu trên cloud của dewee, trên máy chủ dùng chung do chúng tôi vận hành. Key của nhà cung cấp AI được mã hoá.",
      legal: "Khi đăng ký, bạn đồng ý với {terms} và {privacy}.",
      terms: "Điều khoản dịch vụ",
      privacy: "Chính sách quyền riêng tư",
      cta: "Mở app.dewee.sh",
    },
    install: {
      title: "Cài trên máy của bạn",
      body: "Một lệnh cài runtime dewee trên macOS hoặc Linux. Dữ liệu nằm trên máy của bạn.",
      scriptLabel: "Terminal",
      agentTitle: "Hoặc nhờ coding agent cài giúp",
      agentBody: "Dán prompt này vào Claude Code, Codex hoặc Cursor. Agent kiểm tra máy, hỏi trước khi thay đổi gì, rồi cài dewee.",
      agentLabel: "Prompt cho coding agent",
      cta: "Hướng dẫn cài đặt đầy đủ",
    },
    mcp: {
      title: "Kết nối MCP endpoint",
      body: "Trỏ Claude, Cursor hay bất kỳ MCP client nào tới {url} để agent tìm và đọc tài liệu dewee khi làm việc. Endpoint công khai: không cần đăng nhập, không cần key.",
      access: "Cần cả bài blog, trang hay sửa tài liệu? Endpoint đầy đủ /mcp đăng nhập bằng OAuth 2.1 hoặc API key do đội dewee cấp.",
      tools: "Công cụ: search_docs tìm trang bằng tiếng Anh hoặc tiếng Việt, fetch_doc đọc một trang dạng Markdown.",
      snippets: { claudeDesktop: "Claude desktop", claudeCode: "Claude Code", cursor: "Cursor: ~/.cursor/mcp.json" },
      desktopSteps: "Settings → Connectors → Add custom connector, rồi dán URL.",
      publicNote: "Thích file thuần? Công cụ AI nào cũng đọc được mục lục tại /llms.txt.",
      cta: "Hướng dẫn cho developer",
    },
    humans: {
      title: "Cho người đọc",
      body: "Hướng dẫn, khái niệm và ghi chú phát hành, viết để đọc.",
      docs: "Đọc tài liệu",
      blog: "Đọc blog",
    },
  },
};
