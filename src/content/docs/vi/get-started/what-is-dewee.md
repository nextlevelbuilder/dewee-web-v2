---
title: dewee là gì
description: dewee vận hành AI agent cho doanh nghiệp. Mỗi agent có model, tool, bộ nhớ và quyền hạn riêng, và đội ngũ của bạn quản lý tất cả từ một console duy nhất.
section: get-started
order: 1
screens: [overview]
updated: 2026-09-25
---

dewee là nền tảng để vận hành AI agent trong doanh nghiệp. Trong dewee, một agent là một language model cộng với hướng dẫn, các tool nó được phép dùng, bộ nhớ, và quy tắc về việc ai được trò chuyện với nó, nó được chạm vào những gì. dewee chạy các agent đó, kết nối chúng với những ứng dụng chat mà khách hàng và nhân viên của bạn vẫn đang dùng, và ghi lại từng bước chúng thực hiện.

## Hai phần: runtime và console

| Phần | Vai trò |
|---|---|
| **Runtime gateway** | Một service Go duy nhất chạy vòng lặp agent, gọi các model provider, thực thi tool, lưu bộ nhớ trong PostgreSQL và cung cấp API HTTP, WebSocket (mặc định ở cổng `18790`). |
| **Console** | Ứng dụng web tại `app.dewee.sh`, nơi đội ngũ của bạn quản lý agent, provider, kênh, thành viên và API key, đồng thời xem trace, mức sử dụng và nhật ký hoạt động. |

Tại Việt Nam, dewee được cung cấp theo hình thức On-Premises: runtime chạy trên hạ tầng của chính bạn. [Chọn cách triển khai](/docs/get-started/deployment-options) giải thích chi tiết.

::shot{id="overview"}

## Agent làm được gì

- **Trò chuyện** trong phần chat của console, qua API, hoặc trên các kênh như Telegram, Slack, Discord, WhatsApp, Zalo hay Lark. Xem [Kênh chat](/docs/integrations/channels).
- **Dùng tool**: đọc và ghi file trong workspace riêng, chạy lệnh shell sau danh sách chặn và quy tắc phê duyệt, tìm kiếm và tải trang web, điều khiển trình duyệt, gọi MCP server hoặc tool tuỳ chỉnh do bạn định nghĩa. Xem [Tool và quyền hạn](/docs/concepts/tools-and-permissions).
- **Làm theo skill**: các gói hướng dẫn (`SKILL.md`) mà agent nạp vào khi công việc cần đến. Xem [Skill](/docs/concepts/skills).
- **Ghi nhớ**: cuộc hội thoại hiện tại, bản tóm tắt các phiên trước, một knowledge graph về con người và sự vật, cùng kho tri thức gồm tài liệu mà agent có thể tìm kiếm. Xem [Bộ nhớ và tri thức](/docs/concepts/memory-and-knowledge).
- **Phối hợp với agent khác**: giao việc cho một agent chuyên trách, hoặc tham gia một nhóm dùng chung bảng công việc. Xem [Nhóm agent](/docs/concepts/agent-teams).
- **Tự hành động theo lịch**: cron job, heartbeat định kỳ, và workflow có phiên bản kèm bước phê duyệt của con người. Xem [Lịch chạy và heartbeat](/docs/concepts/schedules-and-heartbeat) và [Workflow](/docs/concepts/workflows).

## Đội ngũ của bạn nhận được gì

- **Tách biệt dữ liệu.** Agent, session, bộ nhớ, provider, skill và MCP server đều thuộc về một tenant, và mọi truy vấn đều giới hạn trong tenant đó. Xem [Multi-tenancy](/docs/concepts/multi-tenancy).
- **Kiểm soát.** Vai trò và phân quyền cho con người, API key theo phạm vi cho chương trình, duyệt ghép cặp trước khi agent trả lời người gửi mới, và phê duyệt các lệnh shell rủi ro. Xem [Mô hình bảo mật](/docs/security/overview).
- **Minh bạch.** Mỗi lượt chạy của agent để lại một trace gồm các lần gọi model, gọi tool, số token và chi phí ước tính; nhật ký hoạt động ghi lại ai đã thay đổi gì. Xem [Tracing](/docs/concepts/tracing).
- **Tự chọn model.** 31 loại provider, từ Anthropic, OpenAI, Gemini đến OpenRouter, Ollama chạy nội bộ và mọi endpoint tương thích OpenAI, có cơ chế fallback khi một provider gặp lỗi. Xem [LLM provider](/docs/integrations/llm-providers).

## dewee không phải là gì

- **Không phải nhà cung cấp model.** dewee không huấn luyện hay host model. Bạn kết nối tài khoản của các provider, và dewee thay bạn gọi tới chúng.
- **Không thay thế ứng dụng chat của bạn.** Agent trả lời ngay trong những ứng dụng mọi người đang dùng; console dành cho đội ngũ vận hành agent.
- **Không phải sân chơi không luật lệ.** Agent chỉ chạm tới được những gì tool, chính sách và quyền được cấp cho phép, và theo mặc định người gửi mới trên một kênh phải chờ được duyệt.

## Đọc tiếp

1. [dewee hoạt động thế nào](/docs/get-started/how-it-works): hành trình của một tin nhắn qua hệ thống.
2. [Chọn cách triển khai](/docs/get-started/deployment-options): hình thức On-Premises tại Việt Nam.
3. [Bắt đầu nhanh](/docs/get-started/quickstart): từ lúc đăng nhập tới câu trả lời đầu tiên của agent.

Muốn xem tổng quan sản phẩm trước? [Trang tính năng](/features) và [trang bảo mật](/security) tóm tắt cùng nội dung cho người đọc rộng hơn.
