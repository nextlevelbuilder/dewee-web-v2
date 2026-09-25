---
title: dewee hoạt động thế nào
description: "Theo chân một tin nhắn qua dewee: nó tới agent bằng cách nào, phải qua những bước kiểm tra nào, vòng lặp agent trả lời ra sao và runtime ghi lại những gì."
section: get-started
order: 2
updated: 2026-09-25
---

dewee gồm hai phần. **Runtime gateway** làm phần việc chính: nhận tin nhắn, chạy agent, gọi model và tool, và lưu trữ mọi thứ. **Console** là nơi đội của bạn cấu hình và theo dõi công việc đó; mỗi workspace trong console gắn với một tenant trên một runtime. Trang này theo chân một tin nhắn từ lúc tới cho đến lúc được trả lời.

## Tin nhắn đến từ đâu

Mỗi lượt chạy của agent luôn bắt đầu bằng một tin nhắn. Tin nhắn có thể đến từ:

| Nguồn | Ví dụ |
|---|---|
| Một channel chat | Khách hàng nhắn cho bot Telegram hoặc Zalo Official Account của bạn. Xem [Kênh chat](/docs/integrations/channels) |
| Console | Một đồng nghiệp dùng **Chat** để trò chuyện trực tiếp với agent |
| API | Phần mềm của bạn gọi `POST /v1/chat/completions` hoặc WebSocket. Xem [Tổng quan API](/docs/api/overview) |
| Webhook | CRM hay công cụ biểu mẫu gọi `POST /v1/webhooks/llm`. Xem [Webhook và MCP](/docs/api/webhooks-and-mcp) |
| Lịch của chính agent | Một cron job, một lần heartbeat hoặc một bước trong workflow được kích hoạt |

## 1. Channel kiểm tra ai đang hỏi

Trước khi gọi tới model, channel áp dụng các quy tắc truy cập của nó. Người gửi mới trong tin nhắn trực tiếp có thể cần một mã ghép cặp được admin duyệt; trong nhóm, agent chỉ trả lời khi được mention. Runtime có thể gộp các tin nhắn một người gửi liên tiếp thành một request, và luôn gộp khi họ gửi nhiều file đính kèm cùng lúc. Các lệnh như `/stop` không phải chờ bước này.

## 2. Runtime xác định ngữ cảnh

Runtime xác định bốn thứ:

- **Tenant**: lấy từ channel hoặc credential, không bao giờ từ những gì tin nhắn tự khai. Xem [Tách biệt đa tenant](/docs/concepts/multi-tenancy).
- **Agent**: mỗi kết nối channel trỏ tới một agent; lời gọi API thì chỉ rõ agent.
- **Người dùng**: người ở đầu bên kia, để bộ nhớ và quyền hạn đi theo họ.
- **Session**: cuộc trò chuyện chứa tin nhắn này, cùng lịch sử của nó.

## 3. Vòng lặp agent trả lời

Vòng lặp agent dựng prompt từ hướng dẫn của agent, các context file, skill và bộ nhớ liên quan, rồi gọi model qua provider của agent. Nếu model yêu cầu dùng tool, dewee kiểm tra từng lời gọi theo tool policy, chạy nó và đưa kết quả trở lại. Vòng lặp tiếp tục cho tới khi model đưa ra câu trả lời cuối cùng hoặc chạm giới hạn, mặc định 30 vòng. Xem [Vòng lặp agent](/docs/concepts/agent-loop).

Trong quá trình đó:

- Lời gọi model thất bại được thử lại, và có thể chuyển sang provider khác. Xem [Provider, fallback và suy luận](/docs/concepts/providers-and-routing).
- Lệnh shell rủi ro có thể phải chờ một người phê duyệt. Xem [Tool và quyền hạn](/docs/concepts/tools-and-permissions).
- Agent có thể giao một phần việc cho agent khác hoặc cho nhóm của nó.

## 4. Câu trả lời được gửi lại

Câu trả lời đi ngược qua đúng channel đó, được định dạng cho ứng dụng và chia nhỏ cho vừa giới hạn độ dài. Channel nào hỗ trợ sẽ hiển thị tiến độ khi agent đang làm, bằng dấu hiệu đang gõ, một reaction báo trạng thái hoặc một tin nhắn được sửa tại chỗ.

## 5. Runtime lưu lại dấu vết

Khi lượt chạy kết thúc, dewee lưu các tin nhắn mới vào session và đóng trace của lượt chạy: mọi lời gọi model và lời gọi tool, kèm số token và chi phí ước tính. Tổng mức sử dụng được cập nhật, và các tiến trình nền biến cuộc trò chuyện thành bộ nhớ dài hạn. Đội của bạn xem kết quả trong console ở **Trace** và **Mức sử dụng**; những thay đổi cấu hình do con người thực hiện nằm ở **Nhật ký hoạt động**. Xem [Bộ nhớ và kho tri thức](/docs/concepts/memory-and-knowledge).

## Mọi thứ nằm ở đâu

| Thành phần | Vị trí |
|---|---|
| Agent, session, bộ nhớ, trace, cài đặt | Cơ sở dữ liệu của runtime: PostgreSQL với edition Standard, SQLite với Lite |
| File mà agent đọc và ghi | Thư mục workspace của từng agent trên runtime |
| Key của provider và các secret khác | Mã hoá trong cơ sở dữ liệu bằng encryption key của runtime |
| Đội ngũ, vai trò và workspace | Console |

Tại Việt Nam, dewee được cung cấp dưới hình thức Tự cài đặt và On-Premises: runtime chạy trên hạ tầng của bạn. Xem [Chọn cách triển khai](/docs/get-started/deployment-options).
