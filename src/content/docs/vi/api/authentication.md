---
title: Xác thực
description: "Cách xác thực với API của dewee: tạo API key, chọn scope phù hợp, gửi key qua HTTP và WebSocket, và xử lý khi key hết hạn, bị thu hồi hoặc tenant thay đổi."
section: api
order: 2
updated: 2026-09-25
---

Mọi lời gọi tới runtime, trừ các endpoint kiểm tra sức khoẻ, đều mang theo credential. Với script, tích hợp và CLI, credential đó là **API key**: gắn với một tenant, bị giới hạn bởi scope, và thu hồi được bất cứ lúc nào. Trang này giải thích cách tạo và cách gửi key.

## Các loại credential

| Credential | Ai dùng | Ghi chú |
|---|---|---|
| API key | Script, tích hợp, CI, CLI, client MCP | Có scope, gắn với tenant, có thể hết hạn. Đây là loại nên dùng |
| Gateway token | Người vận hành runtime On-Premises | Toàn quyền admin trên gateway. Giữ trên máy chủ, đừng giao cho tích hợp |
| Secret của webhook | Hệ thống gọi vào webhook | Chỉ có hiệu lực với webhook đó. Xem [Webhook và MCP](/docs/api/webhooks-and-mcp) |

## Tạo API key

**Trong console**, mở **API key**, chọn một preset và thời hạn, rồi tạo key. Các preset là **Read**, **Read and write**, **MCP read** và **MCP read and write**; thời hạn có thể là 1 giờ, 1 ngày, 30 ngày, 90 ngày hoặc không hết hạn. Key chỉ hiện một lần, hãy chép ngay vào trình quản lý secret. Việc tạo hoặc xoay vòng key giới hạn 20 lần mỗi giờ, còn thu hồi là 30 lần mỗi giờ.

**Bằng CLI**, admin có thể tạo key với scope cụ thể:

```bash
dewee api-keys create --name "ci-deploy" --scopes operator.read,operator.write
```

**Qua HTTP**, gửi `POST /v1/api-keys` kèm `name`, danh sách `scopes` và, tuỳ chọn, `expires_in` tính bằng giây. Quản lý key cần quyền admin.

Key có dạng `goclaw_` theo sau là 32 ký tự hexa. Runtime chỉ lưu hash SHA-256, nên key bị mất không khôi phục được, chỉ thay thế được.

## Scope

| Scope | Cho phép | Vai trò tương ứng |
|---|---|---|
| `operator.read` | Quyền đọc | Viewer |
| `operator.write` | Đọc và ghi cho công việc hằng ngày | Operator |
| `operator.approvals` | Phê duyệt các lệnh đang bị giữ | Operator |
| `operator.pairing` | Quản lý thiết bị trình duyệt đã ghép cặp | Operator |
| `operator.admin` | Mọi thứ, kể cả API key và cấu hình hệ thống | Admin |
| `mcp.tools.read`, `mcp.tools.write` | Chỉ endpoint MCP công khai | Không có vai trò nào ngoài `/mcp` |

Key nhận vai trò cao nhất mà các scope của nó cho phép. Key chỉ có scope MCP bị từ chối ở mọi nơi trừ `POST /mcp`, và phải gắn với một owner, là người có quyền truy cập agent mà key sẽ dùng.

## Gửi key

Qua HTTP, gửi key dưới dạng bearer token:

```http
GET /v1/agents HTTP/1.1
Host: dewee.example.com
Authorization: Bearer <api-key>
```

Trên WebSocket, đặt key vào trường `token` của request `connect` đầu tiên. Đường dẫn tới file và media cũng có thể mang token qua tham số `?token=`, cho những chỗ không đặt được header.

Các header tuỳ chọn giúp request rõ ràng hơn:

| Header | Mục đích |
|---|---|
| `X-GoClaw-User-Id` | Người dùng cuối mà request thay mặt, tối đa 255 ký tự |
| `X-GoClaw-Tenant-Id` | Tenant cần thao tác, khi credential truy cập được nhiều tenant |
| `Accept-Language` | Ngôn ngữ cho thông báo và lỗi |

Chữ `GoClaw` trong tên header là tên gốc của runtime; hãy dùng đúng như trên.

## Kiểm tra key

`GET /v1/auth/token/status` cho biết key hoặc token có hợp lệ không, là cách nhanh để thử một tích hợp mới. Từ terminal, bất kỳ lệnh đọc nào cũng làm được việc tương tự:

```bash
DEWEE_SERVER=https://dewee.example.com DEWEE_API_KEY=<api-key> dewee agent list --json
```

## Hết hạn, thu hồi và thay đổi tenant

- Key hết hạn hoặc đã thu hồi bị từ chối ngay từ request tiếp theo.
- Các session WebSocket đang mở được kiểm tra lại trước mỗi thao tác. Nếu key bị thu hồi hoặc hết hạn, hay tenant bị tạm ngưng, session nhận `TENANT_ACCESS_REVOKED`. Thay đổi scope sẽ cập nhật vai trò của session.
- Thu hồi key trong console, bằng `dewee api-keys revoke`, hoặc bằng `POST /v1/api-keys/{id}/revoke`. Thu hồi không thể hoàn tác.

> [!TIP]
> Cấp cho mỗi tích hợp một key riêng, với scope hẹp nhất đủ dùng và có thời hạn. Khi có sự cố, bạn thu hồi một key mà không làm hỏng các key khác.

## Lỗi thường gặp

| Mã | Ý nghĩa |
|---|---|
| `401` | Thiếu credential, credential không tồn tại, đã hết hạn hoặc bị thu hồi |
| `403` | Key hợp lệ nhưng scope không cho phép thao tác, ví dụ ghi bằng key Read |
| `409` | Trong console, workspace chưa khởi tạo xong nên chưa tạo được key |
| `429` | Quá nhiều request; chờ theo thời gian trong `Retry-After` |
