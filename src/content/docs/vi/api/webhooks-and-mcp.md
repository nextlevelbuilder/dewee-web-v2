---
title: Webhook và MCP
description: Cho hệ thống khác kích hoạt agent và gửi tin nhắn qua channel bằng webhook có chữ ký, và kết nối Claude Code, Cursor, VS Code hay Gemini CLI tới dewee qua MCP.
section: api
order: 3
updated: 2026-09-25
---

Có hai endpoint dành riêng cho phần mềm khác gọi vào dewee. **Webhook** cho một hệ thống bạn đang chạy, như CRM, biểu mẫu hay công cụ giám sát, khởi động agent hoặc đăng tin nhắn lên ứng dụng chat. **MCP server công khai** cho trợ lý lập trình AI tìm trong bộ nhớ và skill của workspace và làm việc với workflow của nó. Cả hai đều cố ý hẹp: mỗi endpoint chỉ nhận đúng loại credential của mình và chỉ mở một tập thao tác cố định.

## Webhook

Có hai loại webhook:

| Loại | Endpoint | Tác dụng | Edition |
|---|---|---|---|
| `llm` | `POST /v1/webhooks/llm` | Chạy agent với đầu vào bạn gửi và trả về câu trả lời | Standard và Lite |
| `message` | `POST /v1/webhooks/message` | Gửi tin nhắn, có thể kèm media, tới một cuộc chat trên channel đã kết nối | Standard |

Admin của tenant tạo webhook bằng `POST /v1/webhooks`, chỉ rõ loại và, với `llm`, agent cần chạy. Phản hồi chứa secret của webhook, bắt đầu bằng `wh_` và chỉ hiện một lần. Webhook cần `GOCLAW_ENCRYPTION_KEY` trên gateway, vì secret còn được giữ ở dạng mã hoá để ký callback.

### Gọi agent

```bash
curl https://dewee.example.com/v1/webhooks/llm \
  -H "Authorization: Bearer <webhook-secret>" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: <unique-request-id>" \
  -d '{"input": "Summarise the new ticket and suggest a reply", "session_key": "ticket-4812", "mode": "sync"}'
```

Ở chế độ `sync`, câu trả lời nằm ngay trong phản hồi, và lời gọi hết thời gian sau 30 giây với mã `504`. Ở chế độ `async`, gateway trả `202` ngay và gửi kết quả tới `callback_url` của bạn, bắt buộc là HTTPS. `session_key` giữ các lời gọi liên quan trong cùng một cuộc trò chuyện.

### Gửi tin nhắn

Webhook `message` nhận `channel_name`, `chat_id` và `content` tối đa 16 KB, cùng `media_url` tuỳ chọn. Với `fallback_to_text`, media được bỏ qua trên những channel không hiển thị được, thay vì làm lời gọi thất bại.

### Ký request

Bearer secret là cách đơn giản nhất. Để bảo vệ chặt hơn, hãy ký mỗi request bằng HMAC và bật `require_hmac` để từ chối dạng bearer:

```text
X-Webhook-Id: <webhook-id>
X-GoClaw-Signature: t=<unix-seconds>,v1=<hex HMAC-SHA256 of "<t>.<raw body>">
```

Dấu thời gian phải lệch không quá 5 phút so với đồng hồ của gateway, và một chữ ký không dùng lại được. Bạn cũng có thể giới hạn bên gọi bằng danh sách IP; danh sách này dùng địa chỉ kết nối thật và bỏ qua `X-Forwarded-For`.

### Thử lại và idempotency

- Gửi header `Idempotency-Key`. Lần thử lại với cùng key và cùng body trả về kết quả lần đầu mà không chạy agent lần nữa; cùng key nhưng body khác sẽ nhận `409`.
- Callback được gửi ít nhất một lần. Mỗi callback có `X-Webhook-Delivery-Id` cố định để loại trùng và `X-Webhook-Signature` ký theo cùng thuật toán, nên bạn xác minh được bằng secret của webhook.
- Callback thất bại được thử lại sau 30 giây, 2 phút, 10 phút, 1 giờ và 6 giờ, rồi bị đánh dấu dead. Phản hồi `4xx` khác `429` sẽ dừng việc thử lại.
- Mỗi webhook và mỗi tenant có giới hạn tần suất. Vượt ngưỡng, gateway trả `429` kèm `Retry-After`.

> [!WARNING]
> Xoay vòng secret bằng `POST /v1/webhooks/{id}/rotate` làm secret cũ mất hiệu lực ngay lập tức, không có thời gian chồng lấp. Hãy cập nhật bên gửi cùng lúc.

## MCP server công khai

Gateway có thể đóng vai MCP server tại `POST /mcp`, để một client MCP như Claude Code, Cursor, VS Code hay Gemini CLI dùng workspace ngay trong trình soạn thảo. Nó khác với các MCP server mà chính dewee kết nối tới, vốn được quản lý trong [Tool, MCP và hook](/docs/console/tools-mcp-and-hooks).

Trên gateway On-Premises, endpoint này **mặc định tắt**. Người vận hành bật nó bằng `GOCLAW_MCP_PUBLIC_ENABLED=1` hoặc `tools.mcp.public.enabled` trong file cấu hình.

### Client làm được gì

| Có | Không bao giờ có |
|---|---|
| `memory_search`, `memory_get` | Chạy lệnh, thay đổi file |
| `skill_search`, `web_search` | Trình duyệt, nhắn tin, lịch chạy, tạo agent con |
| `workflow`: liệt kê, xem, kiểm tra, xem loại node, lượt chạy và trạng thái | Thao tác quản trị, credential, provider và package |
| `workflow`: tạo và sửa bản nháp, với `mcp.tools.write` | Xuất bản hay chạy workflow; tool từ các MCP server khác |

Client hoạt động như một agent trong tenant của nó, được chọn bằng header `X-Dewee-Agent` hoặc tham số `?agent=`, nếu không thì là agent `default`. Owner của key phải có quyền truy cập agent đó, và agent không tồn tại hay không được phép đều trả về cùng một mã `404`.

### Kết nối client

1. Tạo key với preset **MCP read** hoặc **MCP read and write** trên trang **API key** của console. Trang này cũng có sẵn cấu hình client để sao chép. Với CLI, cách tương đương là `dewee api-keys create` với `mcp.tools.read` và một owner.
2. Export key thành `DEWEE_MCP_TOKEN` để nó không bao giờ nằm trong file cấu hình.
3. Sinh cấu hình cho client của bạn rồi gộp vào phần cài đặt của client:

```bash
export DEWEE_MCP_TOKEN=<mcp-api-key>
dewee mcp connect-config --client claude
```

`--client` nhận `claude`, `cursor`, `vscode`, `gemini` và `generic`. Cấu hình sinh ra chỉ tham chiếu tới biến môi trường và không bao giờ chứa key.

### Giới hạn

Mỗi credential được gửi 120 request mỗi phút (tối đa 20 request dồn một lúc) và chạy 4 lời gọi tool cùng lúc, mỗi lời gọi có hạn 60 giây. Body request tối đa 1 MiB. Server dùng transport Streamable HTTP không trạng thái của MCP `2026-07-28`, và client cũ hơn sẽ tự thương lượng xuống phiên bản thấp hơn. Client HTTP chung được kiểm thử tự động; Claude Code, Cursor, VS Code với Copilot và Gemini CLI đã được kiểm tra thủ công.
