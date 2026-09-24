---
title: Thuật ngữ
description: Định nghĩa ngắn các thuật ngữ dùng trong tài liệu và console của dewee, từ agent, tenant tới ghép cặp, skill, trace và edition, kèm liên kết tới trang chi tiết.
section: get-started
order: 5
updated: 2026-09-25
---

Các thuật ngữ dưới đây xuất hiện khắp console và tài liệu này. Thuật ngữ nào có trang riêng thì mục đó liên kết tới trang ấy. Chúng tôi giữ nguyên các thuật ngữ kỹ thuật bằng tiếng Anh, giống như trong console.

## Con người, không gian và ranh giới

| Thuật ngữ | Ý nghĩa |
|---|---|
| Console | Ứng dụng web nơi đội của bạn quản lý agent và xem agent đã làm gì. Xem [Làm quen với console](/docs/console/overview) |
| Runtime, gateway | Dịch vụ chạy agent, gọi model và tool, và phục vụ API. Xem [Cài đặt và chạy gateway](/docs/runtime/install-and-run) |
| Workspace | Không gian của đội bạn trong console. Mỗi workspace gắn với một tenant trên một runtime |
| Tenant | Ranh giới tách biệt trên một runtime. Mọi thứ agent sở hữu đều thuộc về đúng một tenant. Xem [Tách biệt đa tenant](/docs/concepts/multi-tenancy) |
| Thành viên, vai trò | Một người trong workspace và những gì họ được phép làm. Xem [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys) |
| Edition | Standard chạy trên PostgreSQL với đầy đủ tính năng; Lite chạy trên SQLite với giới hạn thấp hơn. Xem [Cài đặt và chạy gateway](/docs/runtime/install-and-run) |
| License | Thứ kích hoạt runtime On-Premises và giữ liên lạc định kỳ với chúng tôi. Xem [Kích hoạt license](/docs/runtime/licence) |

## Agent và hội thoại

| Thuật ngữ | Ý nghĩa |
|---|---|
| Agent | Một model cùng hướng dẫn, tool, bộ nhớ và quy tắc truy cập. Xem [Agent](/docs/console/agents) |
| Vòng lặp agent | Chu trình gọi model, chạy các tool model yêu cầu và đưa kết quả trở lại. Xem [Vòng lặp agent](/docs/concepts/agent-loop) |
| Session | Một cuộc trò chuyện cùng lịch sử của nó, ví dụ cuộc chat với một người trên một channel. Xem [Chat và phiên hội thoại](/docs/console/chat-and-sessions) |
| Context file | Các file như `AGENTS.md` và `SOUL.md` mô tả quy tắc và tính cách của agent, được đưa vào prompt |
| Delegation | Agent giao một việc cho agent khác phù hợp hơn |
| Nhóm agent | Các agent dùng chung bảng task và làm việc dưới một lead. Xem [Nhóm agent và phê duyệt](/docs/console/agent-teams) |

## Model

| Thuật ngữ | Ý nghĩa |
|---|---|
| Provider | Một dịch vụ model đã kết nối, như Anthropic, OpenAI hay Ollama chạy nội bộ. Xem [Provider LLM và giọng nói](/docs/integrations/llm-providers) |
| Fallback | Provider và model khác mà agent thử khi lựa chọn đầu tiên thất bại. Xem [Provider, fallback và suy luận](/docs/concepts/providers-and-routing) |
| Reasoning, thinking | Mức suy nghĩ thêm của model trước khi trả lời, đặt cho từng agent từ tắt tới cao |
| Embedding | Dạng số của văn bản, dùng cho tìm kiếm vector trong bộ nhớ và kho tri thức |

## Những gì agent dùng được

| Thuật ngữ | Ý nghĩa |
|---|---|
| Tool | Một hành động agent thực hiện được, như đọc file, chạy lệnh hay tải một trang web. Xem [Tool và quyền hạn](/docs/concepts/tools-and-permissions) |
| Tool profile, policy | Các quy tắc quyết định agent được gọi tool nào |
| Exec approval | Giữ lệnh shell lại cho tới khi có người phê duyệt |
| Skill | Một bộ hướng dẫn đóng gói, dạng `SKILL.md`, mà agent nạp khi công việc cần. Xem [Skill](/docs/concepts/skills) |
| MCP server | Một server tool bên ngoài mà dewee kết nối qua Model Context Protocol. Xem [Tool tích hợp, MCP server và hook](/docs/console/tools-mcp-and-hooks) |
| Hook | Một quy tắc hoặc script chạy ở một thời điểm định sẵn, ví dụ trước lời gọi tool, và có thể chặn nó |
| Bộ nhớ | Những gì agent giữ lại từ các cuộc trò chuyện trước. Xem [Bộ nhớ và kho tri thức](/docs/concepts/memory-and-knowledge) |
| Kho tri thức, vault | Tài liệu và ghi chú mà agent tìm kiếm và trích dẫn được |
| Knowledge graph | Con người, sự vật và liên kết giữa chúng, rút ra từ các cuộc trò chuyện |

## Channel và quyền truy cập

| Thuật ngữ | Ý nghĩa |
|---|---|
| Channel | Kết nối giữa một agent và một ứng dụng chat như Telegram hay Zalo. Xem [Kênh chat](/docs/integrations/channels) |
| DM policy, group policy | Ai được trò chuyện với agent trong tin nhắn trực tiếp và trong nhóm: pairing, allowlist, open hoặc disabled |
| Ghép cặp (pairing) | Duyệt một người gửi mới bằng mã ngắn trước khi agent trả lời họ |
| Mention gating | Trong nhóm, agent chỉ trả lời khi được mention |
| Danh bạ | Những người agent đã trò chuyện, trên mọi channel. Xem [Kênh, ghép cặp và danh bạ](/docs/console/channels-and-contacts) |

## Tự động hoá và giám sát

| Thuật ngữ | Ý nghĩa |
|---|---|
| Lịch chạy, cron job | Việc agent làm vào thời điểm định sẵn. Xem [Lịch chạy và workflow](/docs/console/schedules-and-workflows) |
| Heartbeat | Lần kiểm tra định kỳ, agent đi qua checklist `HEARTBEAT.md` và chỉ báo cáo khi có việc cần chú ý |
| Workflow | Chuỗi bước có phiên bản, gồm agent, tool và bước phê duyệt của con người. Xem [Workflow](/docs/concepts/workflows) |
| Trace, span | Bản ghi của một lượt chạy, và từng lời gọi model hay lời gọi tool trong đó |
| Mức sử dụng | Token và chi phí ước tính theo thời gian |
| Nhật ký hoạt động | Nhật ký ai đã thay đổi gì trong workspace |
| API key | Credential cho script và tích hợp, giới hạn bởi scope. Xem [Xác thực](/docs/api/authentication) |
| Webhook | Endpoint cho hệ thống khác khởi động agent hoặc gửi tin nhắn. Xem [Webhook và MCP](/docs/api/webhooks-and-mcp) |
