/**
 * /developers: how agents and developers work with dewee.sh itself (REST API, CLI, MCP, WebMCP,
 * Markdown twins). Every fact here is read from the code that implements it:
 * src/lib/server/api/* (routes, errors, If-Match, Idempotency-Key, pagination, media limits),
 * src/lib/server/auth/api-key-format.ts (key format and scopes), src/pages/mcp.ts and
 * src/lib/server/mcp/mcp-tools.ts (16 tools), src/components/webmcp/* (browser tools),
 * cli/ (the dewee-web CLI) and SeoHead.astro (the `.md` twin and llms.txt links).
 * Code samples are shared by both languages; only the words around them are translated.
 */
import type { Bi } from "~/i18n/config";

/** A copyable code sample; `code` is shown verbatim. */
export type DevSnippet = { label: string; code: string };
/** A definition row: a term, the literal it is about, and a short explanation (inline markup). */
export type DevFact = { term: string; code: string; body: string };
/** A named tool (MCP or WebMCP) with what it does. */
export type DevTool = { name: string; body: string };

type DevelopersPage = {
  meta: { title: string; description: string; crumb: string };
  hero: { eyebrow: string; title: string; lede: string; note: string; openapi: string; jump: string };
  index: {
    eyebrow: string;
    title: string;
    lede: string;
    items: { title: string; meta: string; href: string; icon: string }[];
    access: { title: string; body: string };
  };
  api: {
    eyebrow: string;
    title: string;
    lede: string;
    factsLabel: string;
    facts: DevFact[];
    scopes: { caption: string; head: string[]; rows: string[][]; note: string };
    examplesTitle: string;
    snippets: DevSnippet[];
    openapi: string;
  };
  cli: {
    eyebrow: string;
    title: string;
    lede: string;
    stepLabel: string;
    steps: { title: string; body: string }[];
    snippets: DevSnippet[];
    envNote: { title: string; body: string };
  };
  mcp: {
    eyebrow: string;
    title: string;
    lede: string;
    remote: { title: string; body: string; snippets: DevSnippet[] };
    stdio: { title: string; body: string; snippets: DevSnippet[] };
    toolsTitle: string;
    toolsNote: string;
    tools: DevTool[];
  };
  webmcp: {
    eyebrow: string;
    title: string;
    lede: string;
    publicTitle: string;
    publicBody: string;
    publicTools: DevTool[];
    adminTitle: string;
    adminBody: string;
    adminTools: DevTool[];
  };
  markdown: { eyebrow: string; title: string; lede: string; factsLabel: string; items: DevFact[] };
  copy: { copy: string; copied: string; failed: string };
  cta: { title: string; body: string; primary: string; secondary: string; note: string };
};

const KEY = "dwk_…";

/** Shared code samples (identical in both languages). */
const CODE = {
  me: `curl -s https://dewee.sh/api/v1/me \\
  -H "Authorization: Bearer $DEWEE_WEB_API_KEY"`,
  list: `curl -s "https://dewee.sh/api/v1/pages?status=published&limit=20" \\
  -H "Authorization: Bearer $DEWEE_WEB_API_KEY"`,
  create: `curl -s -X POST https://dewee.sh/api/v1/pages \\
  -H "Authorization: Bearer $DEWEE_WEB_API_KEY" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: launch-week-en" \\
  -d '{
    "title": "Launch week",
    "slug": "launch-week",
    "locale": "en",
    "blocks": [
      {
        "type": "RichText",
        "props": { "markdown": "## Hello from an agent" }
      }
    ]
  }'`,
  update: `curl -s -X PATCH https://dewee.sh/api/v1/pages/launch-week \\
  -H "Authorization: Bearer $DEWEE_WEB_API_KEY" \\
  -H "Content-Type: application/json" \\
  -H 'If-Match: "1"' \\
  -d '{ "title": "Launch week 2026", "note": "Sharper title" }'`,
  publish: `curl -s -X POST https://dewee.sh/api/v1/pages/launch-week/publish \\
  -H "Authorization: Bearer $DEWEE_WEB_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{}'`,
  media: `curl -s -X POST "https://dewee.sh/api/v1/media?filename=hero.png" \\
  -H "Authorization: Bearer $DEWEE_WEB_API_KEY" \\
  -H "Content-Type: image/png" \\
  --data-binary @hero.png`,
  cliSession: `npm install -g dewee-web          # or: npx -y dewee-web <command>
dewee-web auth login --key ${KEY}
dewee-web auth status
dewee-web pages list --status published
dewee-web pages publish launch-week --locale en
dewee-web posts create ./launch-week.md --publish
dewee-web media upload ./hero.png
dewee-web blocks schema FeatureGrid --json`,
  post: `---
title: Launch week
slug: launch-week
locale: en
tags: [release, agents]
author: duy
description: What shipped this week, in five minutes.
---

## What shipped

Markdown body. Raw HTML is shown as text, never rendered.`,
  claudeCode: `claude mcp add --transport http dewee-web https://dewee.sh/mcp \\
  --header "Authorization: Bearer ${KEY}"`,
  cursor: `{
  "mcpServers": {
    "dewee-web": {
      "url": "https://dewee.sh/mcp",
      "headers": { "Authorization": "Bearer ${KEY}" }
    }
  }
}`,
  stdio: `{
  "mcpServers": {
    "dewee-web": {
      "command": "npx",
      "args": ["-y", "dewee-web", "mcp"],
      "env": { "DEWEE_WEB_API_KEY": "${KEY}" }
    }
  }
}`,
};

/** The 16 MCP tool names, in the order tools/list returns them. */
const MCP_NAMES = [
  "list_blocks",
  "get_block_schema",
  "list_pages",
  "get_page",
  "create_page",
  "update_page",
  "publish_page",
  "unpublish_page",
  "list_posts",
  "create_post",
  "update_post",
  "publish_post",
  "upload_media",
  "list_leads",
  "list_revisions",
  "restore_revision",
] as const;

type McpName = (typeof MCP_NAMES)[number];
const mcpTools = (body: Record<McpName, string>): DevTool[] => MCP_NAMES.map((name) => ({ name, body: body[name] }));

const SCOPES = ["pages:read", "pages:write", "posts:read", "posts:write", "media:write", "leads:read"] as const;
type Scope = (typeof SCOPES)[number];
const scopeRows = (body: Record<Scope, string>): string[][] => SCOPES.map((s) => [s, body[s]]);

export const DEVELOPERS: Bi<DevelopersPage> = {
  en: {
    meta: {
      crumb: "Developers",
      title: "dewee.sh for developers: REST API, CLI, MCP and WebMCP",
      description:
        "Work with dewee.sh from code or an AI agent: a REST API with OpenAPI 3.1, the dewee-web CLI, a remote MCP server, WebMCP tools and Markdown for every page.",
    },
    hero: {
      eyebrow: "Developers",
      title: "This site is *agent-friendly*, by design.",
      lede: "dewee.sh is built to be read and edited by agents as well as people. There are five ways in: a REST API, a CLI, an MCP server, WebMCP tools in the page and a Markdown twin of every page.",
      note: "Reading is open. Writing needs a key.",
      openapi: "OpenAPI 3.1 spec",
      jump: "Connect over MCP",
    },
    index: {
      eyebrow: "Five ways in",
      title: "Pick the door *your tool knows*.",
      lede: "They all reach the same pages and posts, with the same rules: validated blocks, versions, revisions and an audit log of every write.",
      items: [
        { title: "REST API", meta: "/api/v1 · OpenAPI 3.1", href: "#api", icon: "braces" },
        { title: "CLI", meta: "dewee-web · Node 22+", href: "#cli", icon: "square-terminal" },
        { title: "MCP server", meta: "dewee.sh/mcp · 16 tools", href: "#mcp", icon: "plug" },
        { title: "WebMCP", meta: "tools in the browser tab", href: "#webmcp", icon: "mouse-pointer-click" },
        { title: "Markdown and llms.txt", meta: "any page as .md", href: "#markdown", icon: "file-text" },
      ],
      access: {
        title: "Who gets a key",
        body: "The dewee team issues API keys from our admin console, for our own people and agents. Everything read-only here is open to anyone: the OpenAPI spec, block schemas, Markdown twins, llms.txt and the public WebMCP tools.",
      },
    },
    api: {
      eyebrow: "REST API",
      title: "JSON over HTTPS, *no surprises*.",
      lede: "The base URL is https://dewee.sh/api/v1. Pages are served at /p/<slug> and posts at /blog/<slug>, in English and under /vi in Vietnamese.",
      factsLabel: "How the API behaves",
      facts: [
        {
          term: "Authentication",
          code: `Authorization: Bearer ${KEY}`,
          body: "A key is dwk_, a short prefix and a long secret. We keep only its SHA-256 hash, show it to you once, and it can expire or be revoked at any time.",
        },
        {
          term: "Writes",
          code: "Content-Type: application/json",
          body: "Send it on every write, even with an empty body. Image uploads send the image type instead. Form-encoded requests are refused.",
        },
        {
          term: "Versions",
          code: 'If-Match: "3"',
          body: "Every record has a version, returned as the ETag. Send it back when you write: if someone saved first you get 409 instead of overwriting their work. Each save keeps a revision you can restore.",
        },
        {
          term: "Safe retries",
          code: "Idempotency-Key: launch-week-en",
          body: "Creates, status changes and uploads accept a key. A retry with the same key replays the first response for 24 hours.",
        },
        {
          term: "Lists",
          code: "?limit=20&offset=40",
          body: "Lists return data and pagination with limit, offset and total. The limit goes up to 100; filter with q, status, locale and tag.",
        },
        {
          term: "Addressing",
          code: "/pages/launch-week?locale=vi",
          body: "Use the record id, or its slug plus the locale. Nested slugs encode / as %2F.",
        },
        {
          term: "Errors",
          code: '{ "error": { "code", "message", "details" } }',
          body: "Every error has this shape. For validation errors, details lists each field that failed and why.",
        },
      ],
      scopes: {
        caption: "Scopes a key can hold",
        head: ["Scope", "Allows"],
        rows: scopeRows({
          "pages:read": "Read custom pages, drafts included, and their revisions",
          "pages:write": "Create, edit, publish, unpublish, archive, delete and restore pages",
          "posts:read": "Read blog posts, drafts included, and their revisions",
          "posts:write": "Create, edit, publish, unpublish, archive, delete and restore posts",
          "media:write": "Upload PNG, JPEG, WebP, GIF or AVIF images up to 10 MB",
          "leads:read": "Read messages from the contact and partner forms",
        }),
        note: "No key needed for GET /api/v1/blocks, GET /api/v1/blocks/{type} and /api/v1/openapi.json.",
      },
      examplesTitle: "Try it with curl",
      snippets: [
        { label: "Who am I? The key's owner and scopes", code: CODE.me },
        { label: "List published pages", code: CODE.list },
        { label: "Create a draft page (safe to retry)", code: CODE.create },
        { label: "Edit it, but only if nobody else did", code: CODE.update },
        { label: "Publish it", code: CODE.publish },
        { label: "Upload an image", code: CODE.media },
      ],
      openapi: "Download openapi.json",
    },
    cli: {
      eyebrow: "CLI",
      title: "The whole API, *from your terminal*.",
      lede: "dewee-web is a small Node.js CLI with no dependencies. It needs Node 22 or later.",
      stepLabel: "Step",
      steps: [
        { title: "Install", body: "Install it globally with npm, or run any command once with npx." },
        { title: "Sign in with a key", body: "auth login checks the key and saves it to ~/.config/dewee-web/config.json, readable only by you." },
        { title: "Work", body: "List, create, update and publish pages and posts, upload images and read block schemas. Every command can print the raw API response as JSON." },
      ],
      snippets: [
        { label: "A short session", code: CODE.cliSession },
        { label: "launch-week.md: a post is Markdown with front matter", code: CODE.post },
      ],
      envNote: {
        title: "In CI",
        body: "Set DEWEE_WEB_API_KEY, and DEWEE_WEB_URL if you target another site. They take priority over the config file.",
      },
    },
    mcp: {
      eyebrow: "MCP",
      title: "Plug your agent *straight in*.",
      lede: "A remote MCP server at https://dewee.sh/mcp speaks JSON-RPC 2.0 over streamable HTTP. It uses the same API keys, and tools/list shows only the tools your key's scopes allow.",
      remote: {
        title: "Remote, with a header",
        body: "For clients that support remote servers, such as Claude Code and Cursor.",
        snippets: [
          { label: "Claude Code", code: CODE.claudeCode },
          { label: "Cursor: ~/.cursor/mcp.json", code: CODE.cursor },
        ],
      },
      stdio: {
        title: "Local, over stdio",
        body: "For clients that only launch local servers. The CLI bridges stdio to the remote server, so nothing else runs on your machine.",
        snippets: [{ label: "Any client that reads mcpServers", code: CODE.stdio }],
      },
      toolsTitle: "The 16 tools",
      toolsNote: "get_page, list_revisions and restore_revision work on blog posts too: pass kind: post.",
      tools: mcpTools({
        list_pages: "List or search custom pages",
        get_page: "Read one page or post in full",
        create_page: "Create a page from blocks",
        update_page: "Change a page, with version checks",
        publish_page: "Make a page public",
        unpublish_page: "Move a page back to draft",
        list_posts: "List or search blog posts",
        create_post: "Write a post in Markdown",
        update_post: "Change a post, with version checks",
        publish_post: "Make a post public",
        list_blocks: "Every block type with an example",
        get_block_schema: "The JSON Schema of one block",
        upload_media: "Upload an image, get its URL",
        list_leads: "Read contact and partner messages",
        list_revisions: "The saved history of a page or post",
        restore_revision: "Bring back an earlier version",
      }),
    },
    webmcp: {
      eyebrow: "WebMCP",
      title: "Tools *inside the page*.",
      lede: "WebMCP is a proposed web standard that lets a page hand tools to an AI agent working in your browser. Browsers without it ignore our tools, and the page works as usual.",
      publicTitle: "On every public page",
      publicBody: "No sign-in, and nothing an agent could not do by clicking.",
      publicTools: [
        { name: "get_page_markdown", body: "The current page as Markdown" },
        { name: "switch_language", body: "Open this page in English or Vietnamese" },
        { name: "set_theme", body: "Light, dark or the system setting" },
        { name: "open_chat", body: "Open the chat, with a first message filled in" },
      ],
      adminTitle: "In the admin console",
      adminBody: "Only for the signed-in dewee team, using the same session and checks as the console itself.",
      adminTools: [
        { name: "list_pages · list_posts", body: "Find content by status, language or text" },
        { name: "get_page · get_post", body: "Read a record with its version" },
        { name: "create_* · update_*", body: "Save drafts and edits" },
        { name: "set_page_status · set_post_status", body: "Publish, unpublish or archive" },
        { name: "list_blocks · get_block_schema · validate_blocks", body: "Build blocks that pass validation" },
        { name: "get_editor_draft · fill_editor_draft", body: "Read or fill the open editor, then let a person review and save" },
      ],
    },
    markdown: {
      eyebrow: "Markdown",
      title: "Every page, *as plain text*.",
      lede: "Language models read Markdown more reliably than HTML, so every public page has a Markdown twin.",
      factsLabel: "Plain-text addresses",
      items: [
        { term: "Any page", code: "/pricing.md", body: "Add .md to a public URL. It works in both languages, for example /vi/pricing.md." },
        { term: "The homepage", code: "/index.md", body: "The one exception to the rule: the root is /index.md." },
        { term: "Site index", code: "/llms.txt", body: "A short, curated map of the site for language models." },
        { term: "Everything", code: "/llms-full.txt", body: "The whole site's text in one file." },
        { term: "Blog feed", code: "/blog/rss.xml", body: "RSS with full posts. The Vietnamese feed is /vi/blog/rss.xml." },
      ],
    },
    copy: { copy: "Copy", copied: "Copied", failed: "Copy failed" },
    cta: {
      title: "Put an agent *on the job*.",
      body: "dewee agents connect to MCP servers over stdio, SSE and streamable HTTP, so they can use tools like the ones on this page. Show us the tools your team works with.",
      primary: "Talk to us",
      secondary: "Chat with dewee",
      note: "agents welcome here too",
    },
  },
  vi: {
    meta: {
      crumb: "Nhà phát triển",
      title: "dewee.sh cho nhà phát triển: REST API, CLI, MCP, WebMCP",
      description:
        "Làm việc với dewee.sh bằng code hoặc AI agent: REST API kèm OpenAPI 3.1, CLI dewee-web, MCP server từ xa, công cụ WebMCP và bản Markdown cho mọi trang.",
    },
    hero: {
      eyebrow: "Nhà phát triển",
      title: "Trang web này *thân thiện với agent* từ gốc.",
      lede: "dewee.sh được xây để cả người lẫn agent đều đọc và chỉnh sửa được. Có năm lối vào: REST API, CLI, MCP server, công cụ WebMCP ngay trong trang và bản Markdown của từng trang.",
      note: "Đọc thì ai cũng được. Ghi thì cần key.",
      openapi: "Đặc tả OpenAPI 3.1",
      jump: "Kết nối qua MCP",
    },
    index: {
      eyebrow: "Năm lối vào",
      title: "Chọn lối *công cụ của bạn quen*.",
      lede: "Lối nào cũng tới cùng các trang và bài viết, với cùng một bộ quy tắc: block được kiểm tra, có version, có lịch sử bản sửa và mọi thao tác ghi đều vào nhật ký.",
      items: [
        { title: "REST API", meta: "/api/v1 · OpenAPI 3.1", href: "#api", icon: "braces" },
        { title: "CLI", meta: "dewee-web · Node 22+", href: "#cli", icon: "square-terminal" },
        { title: "MCP server", meta: "dewee.sh/mcp · 16 công cụ", href: "#mcp", icon: "plug" },
        { title: "WebMCP", meta: "công cụ ngay trong tab", href: "#webmcp", icon: "mouse-pointer-click" },
        { title: "Markdown và llms.txt", meta: "trang nào cũng có .md", href: "#markdown", icon: "file-text" },
      ],
      access: {
        title: "Ai được cấp key",
        body: "Đội dewee cấp API key từ trang quản trị, cho chính người của chúng tôi và các agent chúng tôi vận hành. Những gì chỉ để đọc ở đây thì mở cho mọi người: đặc tả OpenAPI, schema của block, bản Markdown, llms.txt và các công cụ WebMCP công khai.",
      },
    },
    api: {
      eyebrow: "REST API",
      title: "JSON qua HTTPS, *không bất ngờ*.",
      lede: "Base URL là https://dewee.sh/api/v1. Trang được phục vụ tại /p/<slug>, bài viết tại /blog/<slug>; bản tiếng Việt nằm dưới /vi.",
      factsLabel: "API hoạt động thế nào",
      facts: [
        {
          term: "Xác thực",
          code: `Authorization: Bearer ${KEY}`,
          body: "Key gồm dwk_, một prefix ngắn và một phần bí mật dài. Chúng tôi chỉ lưu mã băm SHA-256, key chỉ hiện cho bạn một lần, có thể đặt hạn dùng hoặc thu hồi bất cứ lúc nào.",
        },
        {
          term: "Thao tác ghi",
          code: "Content-Type: application/json",
          body: "Luôn gửi header này khi ghi, kể cả khi body rỗng. Riêng upload ảnh thì gửi đúng loại ảnh. Request dạng form sẽ bị từ chối.",
        },
        {
          term: "Version",
          code: 'If-Match: "3"',
          body: "Mỗi bản ghi có một version, trả về trong ETag. Hãy gửi lại khi ghi: nếu ai đó đã lưu trước, bạn nhận 409 thay vì ghi đè lên công sức của họ. Mỗi lần lưu đều giữ một bản sửa để khôi phục khi cần.",
        },
        {
          term: "Thử lại an toàn",
          code: "Idempotency-Key: launch-week-en",
          body: "Thao tác tạo mới, đổi trạng thái và upload đều nhận key này. Gửi lại với cùng key trong 24 giờ sẽ nhận đúng phản hồi của lần đầu.",
        },
        {
          term: "Danh sách",
          code: "?limit=20&offset=40",
          body: "Danh sách trả về data và pagination gồm limit, offset, total. limit tối đa 100; lọc bằng q, status, locale và tag.",
        },
        {
          term: "Cách gọi bản ghi",
          code: "/pages/launch-week?locale=vi",
          body: "Dùng id của bản ghi, hoặc slug kèm locale. Slug nhiều cấp thì mã hoá / thành %2F.",
        },
        {
          term: "Lỗi",
          code: '{ "error": { "code", "message", "details" } }',
          body: "Lỗi nào cũng có dạng này. Với lỗi kiểm tra dữ liệu, details liệt kê từng trường sai và lý do.",
        },
      ],
      scopes: {
        caption: "Các scope một key có thể có",
        head: ["Scope", "Cho phép"],
        rows: scopeRows({
          "pages:read": "Đọc trang tuỳ chỉnh, kể cả bản nháp, và lịch sử bản sửa",
          "pages:write": "Tạo, sửa, xuất bản, gỡ xuất bản, lưu trữ, xoá và khôi phục trang",
          "posts:read": "Đọc bài blog, kể cả bản nháp, và lịch sử bản sửa",
          "posts:write": "Tạo, sửa, xuất bản, gỡ xuất bản, lưu trữ, xoá và khôi phục bài viết",
          "media:write": "Upload ảnh PNG, JPEG, WebP, GIF hoặc AVIF, tối đa 10 MB",
          "leads:read": "Đọc tin nhắn từ form liên hệ và form đối tác",
        }),
        note: "Không cần key với GET /api/v1/blocks, GET /api/v1/blocks/{type} và /api/v1/openapi.json.",
      },
      examplesTitle: "Thử ngay với curl",
      snippets: [
        { label: "Tôi là ai? Chủ key và các scope", code: CODE.me },
        { label: "Liệt kê các trang đã xuất bản", code: CODE.list },
        { label: "Tạo trang nháp (gửi lại vẫn an toàn)", code: CODE.create },
        { label: "Sửa trang, chỉ khi chưa ai sửa trước", code: CODE.update },
        { label: "Xuất bản", code: CODE.publish },
        { label: "Upload ảnh", code: CODE.media },
      ],
      openapi: "Tải openapi.json",
    },
    cli: {
      eyebrow: "CLI",
      title: "Toàn bộ API, *ngay trong terminal*.",
      lede: "dewee-web là một CLI Node.js nhỏ gọn, không có dependency nào. Cần Node 22 trở lên.",
      stepLabel: "Bước",
      steps: [
        { title: "Cài đặt", body: "Cài toàn cục bằng npm, hoặc chạy một lệnh bất kỳ qua npx." },
        { title: "Đăng nhập bằng key", body: "auth login kiểm tra key rồi lưu vào ~/.config/dewee-web/config.json, chỉ mình bạn đọc được." },
        { title: "Làm việc", body: "Liệt kê, tạo, sửa và xuất bản trang, bài viết; upload ảnh và xem schema của block. Lệnh nào cũng có thể in nguyên phản hồi từ API dưới dạng JSON." },
      ],
      snippets: [
        { label: "Một phiên làm việc ngắn", code: CODE.cliSession },
        { label: "launch-week.md: bài viết là Markdown kèm front matter", code: CODE.post },
      ],
      envNote: {
        title: "Trong CI",
        body: "Đặt DEWEE_WEB_API_KEY, và DEWEE_WEB_URL nếu bạn trỏ tới site khác. Hai biến này được ưu tiên hơn file cấu hình.",
      },
    },
    mcp: {
      eyebrow: "MCP",
      title: "Cắm agent của bạn *vào thẳng*.",
      lede: "MCP server từ xa tại https://dewee.sh/mcp dùng JSON-RPC 2.0 qua streamable HTTP. Server dùng chung API key, và tools/list chỉ hiện những công cụ mà scope của key cho phép.",
      remote: {
        title: "Từ xa, kèm header",
        body: "Cho các client hỗ trợ server từ xa, như Claude Code và Cursor.",
        snippets: [
          { label: "Claude Code", code: CODE.claudeCode },
          { label: "Cursor: ~/.cursor/mcp.json", code: CODE.cursor },
        ],
      },
      stdio: {
        title: "Chạy cục bộ qua stdio",
        body: "Cho các client chỉ khởi chạy server cục bộ. CLI làm cầu nối stdio tới server từ xa, nên máy bạn không phải chạy thêm gì.",
        snippets: [{ label: "Mọi client đọc cấu hình mcpServers", code: CODE.stdio }],
      },
      toolsTitle: "16 công cụ",
      toolsNote: "get_page, list_revisions và restore_revision dùng được cho cả bài blog: chỉ cần truyền kind: post.",
      tools: mcpTools({
        list_pages: "Liệt kê hoặc tìm trang tuỳ chỉnh",
        get_page: "Đọc đầy đủ một trang hoặc bài viết",
        create_page: "Tạo trang từ các block",
        update_page: "Sửa trang, có kiểm tra version",
        publish_page: "Xuất bản trang",
        unpublish_page: "Đưa trang về bản nháp",
        list_posts: "Liệt kê hoặc tìm bài blog",
        create_post: "Viết bài bằng Markdown",
        update_post: "Sửa bài, có kiểm tra version",
        publish_post: "Xuất bản bài viết",
        list_blocks: "Mọi loại block, kèm ví dụ",
        get_block_schema: "JSON Schema của một block",
        upload_media: "Upload ảnh, nhận lại URL",
        list_leads: "Đọc tin nhắn liên hệ và đối tác",
        list_revisions: "Lịch sử các bản đã lưu",
        restore_revision: "Khôi phục một version cũ",
      }),
    },
    webmcp: {
      eyebrow: "WebMCP",
      title: "Công cụ *ngay trong trang*.",
      lede: "WebMCP là một đề xuất chuẩn web cho phép trang web trao công cụ cho AI agent đang làm việc trong trình duyệt của bạn. Trình duyệt chưa hỗ trợ sẽ bỏ qua các công cụ này, trang vẫn chạy bình thường.",
      publicTitle: "Trên mọi trang công khai",
      publicBody: "Không cần đăng nhập, và không có gì mà agent không tự bấm được.",
      publicTools: [
        { name: "get_page_markdown", body: "Trang hiện tại ở dạng Markdown" },
        { name: "switch_language", body: "Mở trang này bằng tiếng Anh hoặc tiếng Việt" },
        { name: "set_theme", body: "Giao diện sáng, tối hoặc theo hệ thống" },
        { name: "open_chat", body: "Mở khung chat, điền sẵn tin nhắn đầu tiên" },
      ],
      adminTitle: "Trong trang quản trị",
      adminBody: "Chỉ dành cho đội dewee đã đăng nhập, dùng chung phiên và các bước kiểm tra như chính trang quản trị.",
      adminTools: [
        { name: "list_pages · list_posts", body: "Tìm nội dung theo trạng thái, ngôn ngữ hoặc từ khoá" },
        { name: "get_page · get_post", body: "Đọc bản ghi kèm version" },
        { name: "create_* · update_*", body: "Lưu bản nháp và chỉnh sửa" },
        { name: "set_page_status · set_post_status", body: "Xuất bản, gỡ xuất bản hoặc lưu trữ" },
        { name: "list_blocks · get_block_schema · validate_blocks", body: "Dựng block hợp lệ ngay từ đầu" },
        { name: "get_editor_draft · fill_editor_draft", body: "Đọc hoặc điền vào trình soạn thảo đang mở, rồi để người duyệt và lưu" },
      ],
    },
    markdown: {
      eyebrow: "Markdown",
      title: "Trang nào cũng có *bản chữ trơn*.",
      lede: "Mô hình ngôn ngữ đọc Markdown chính xác hơn HTML, nên mọi trang công khai đều có một bản Markdown đi kèm.",
      factsLabel: "Các địa chỉ dạng chữ",
      items: [
        { term: "Trang bất kỳ", code: "/pricing.md", body: "Thêm .md vào URL công khai. Dùng được cho cả hai ngôn ngữ, ví dụ /vi/pricing.md." },
        { term: "Trang chủ", code: "/index.md", body: "Ngoại lệ duy nhất: trang gốc là /index.md." },
        { term: "Mục lục site", code: "/llms.txt", body: "Bản đồ ngắn gọn, chọn lọc của site dành cho mô hình ngôn ngữ." },
        { term: "Toàn bộ", code: "/llms-full.txt", body: "Toàn bộ nội dung chữ của site trong một file." },
        { term: "Feed blog", code: "/blog/rss.xml", body: "RSS kèm nội dung đầy đủ. Feed tiếng Việt là /vi/blog/rss.xml." },
      ],
    },
    copy: { copy: "Sao chép", copied: "Đã chép", failed: "Không chép được" },
    cta: {
      title: "Giao việc *cho agent*.",
      body: "Agent của dewee kết nối với MCP server qua stdio, SSE và streamable HTTP, nên dùng được những công cụ như trên trang này. Hãy cho chúng tôi xem các công cụ đội bạn đang dùng.",
      primary: "Liên hệ",
      secondary: "Chat với dewee",
      note: "agent cũng được chào đón ở đây",
    },
  },
};
