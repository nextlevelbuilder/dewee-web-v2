---
title: Tách biệt đa tenant
description: Cách dewee tách riêng agent, session, bộ nhớ và thông tin xác thực của từng tenant, cách request xác định tenant, và cách sao lưu hay chuyển dữ liệu tenant.
section: concepts
order: 2
updated: 2026-09-25
---

Tenant là ranh giới tách biệt dữ liệu trong dewee. Agent, cuộc hội thoại, bộ nhớ, provider và tool đều thuộc về đúng một tenant, và runtime từ chối mọi truy vấn không chỉ rõ tenant. Trong console, ranh giới này được gọi là workspace: mỗi workspace gắn với một tenant trên runtime của nó.

## Một tenant và nhiều tenant

| Chế độ | Cách hoạt động | Trường hợp dùng |
|---|---|---|
| Một tenant | Toàn bộ dữ liệu nằm trong một tenant mặc định. Không cần thiết lập gì thêm. | Một đội ngũ hoặc một công ty tự vận hành runtime của mình. |
| Nhiều tenant | Quản trị viên tạo thêm tenant trên cùng runtime. Mỗi tenant tách biệt với các tenant khác. | Nhiều phòng ban, khách hàng hoặc sản phẩm dùng chung một runtime. |

Bạn có thể bắt đầu với một tenant rồi thêm tenant sau. Các tính năng đa tenant tự bật ngay khi có tenant thứ hai; không cần migration.

## Request xác định tenant như thế nào

Tenant luôn được lấy từ thông tin xác thực, không bao giờ từ những gì client tự khai.

| Điểm vào | Tenant được lấy từ đâu |
|---|---|
| HTTP API với API key gắn tenant | Tenant của key. Không cần header bổ sung. |
| WebSocket `connect` với API key gắn tenant | Tenant của key, cố định trong suốt kết nối. |
| API key cấp hệ thống | Header `X-GoClaw-Tenant-Id` (UUID hoặc slug). Key vẫn giữ vai trò của chính nó. |
| Kênh chat (Telegram, Slack, Zalo và các kênh khác) | Channel instance, được gắn với một tenant ngay khi tạo. |
| Console | Tư cách thành viên của bạn trong workspace. |
| Gateway token | Các owner ID trong `GOCLAW_OWNER_IDS` (mặc định `system`) có quyền quản trị xuyên tenant; mọi người khác bị giới hạn trong tenant mà họ là thành viên. |

Một gợi ý tenant không khớp với tenant thật sẽ bị từ chối, chứ không âm thầm chuyển sang tenant mặc định. Client WebSocket nhận `TENANT_NOT_FOUND`; client HTTP nhận một lỗi 401 chung chung, để phản hồi không để lộ những tenant nào đang tồn tại.

## Những gì được tách theo tenant

Mỗi tenant có riêng:

- agent, liên kết giữa các agent, nhóm agent và công việc của nhóm;
- session và lịch sử tin nhắn;
- bộ nhớ, bản tóm tắt các phiên, knowledge graph và kho tri thức;
- LLM provider cùng key của chúng, MCP server và skill;
- channel instance, cron job, hook và workflow;
- số liệu và đề xuất tự cải tiến của agent.

Hơn 40 bảng có cột tenant bắt buộc, và mọi truy vấn đều lọc theo cột này. Nếu ngữ cảnh request thiếu tenant, truy vấn trả về lỗi. Nó không bao giờ quay về dữ liệu chưa lọc.

## Các lớp bảo vệ quanh ranh giới

- **Lọc sự kiện ở phía server.** Sự kiện trực tiếp trên WebSocket được lọc ngay tại server, nên client chỉ nhận sự kiện của tenant mình.
- **Không mạo danh tenant.** API key gắn tenant không thể đổi tenant bằng header, và vai trò được suy ra từ scope của key chứ không từ lời khai của client.
- **Ghi cấu hình toàn cục cần master scope.** Việc thay đổi thiết lập dùng chung cho cả runtime, như mặc định của tool tích hợp hay cài package, đòi hỏi master scope. Quản trị viên của một tenant không thể thay đổi chúng.
- **Link file có chữ ký.** Link tới file dùng token `?ft=` ký bằng HMAC thay vì đưa gateway token vào URL.

## Vai trò và quyền truy cập

Thành viên của tenant giữ một trong năm vai trò. Runtime quy chúng về ba mức quyền của mình:

| Vai trò thành viên | Vai trò trên runtime |
|---|---|
| owner, admin | admin |
| operator, member | operator |
| viewer | viewer |

API key thì lấy vai trò từ scope: `operator.admin` là admin, `operator.write` là operator và `operator.read` là viewer. Xem [Secret, vai trò và nhật ký kiểm toán](/docs/security/secrets-roles-and-audit).

Tenant bị tạm ngưng, hoặc workspace có quyền sử dụng bị tạm ngưng, không thể chạy agent, chat, tạo API key hay thay đổi kênh. Owner của hệ thống vẫn có thể xem tenant và đổi trạng thái của nó.

Thay đổi quyền truy cập có hiệu lực ngay ở request tiếp theo. Khi một key bị thu hồi hoặc đổi scope, hay một thành viên bị gỡ khỏi tenant, các phiên WebSocket đang mở sẽ nhận `TENANT_ACCESS_REVOKED` ở lần gọi kế tiếp.

## Ghi đè theo từng tenant

Mỗi tenant có thể tự điều chỉnh môi trường của mình mà không ảnh hưởng tới tenant khác:

- **LLM provider**: mỗi tenant tự đăng ký tài khoản provider và model.
- **Tool tích hợp**: bật, tắt hoặc đổi thiết lập theo tenant, chồng lên mặc định của runtime.
- **Skill**: bật hoặc tắt theo tenant.
- **MCP server**: một thông tin xác thực dùng chung ở cấp server, và thông tin xác thực riêng của từng người dùng sẽ ghi đè nó. Khi server bật `require_user_credentials`, người dùng chưa có thông tin xác thực riêng sẽ không dùng được server đó.

## Di chuyển dữ liệu tenant

### Sao lưu và khôi phục

Bản sao lưu tenant là một file `.tar.gz` chứa các dòng dữ liệu của tenant trong database cùng các thư mục workspace và dữ liệu của nó. Quản trị viên tenant có thể tạo bản sao lưu qua HTTP (`POST /v1/tenant/backup`), còn người vận hành có thể chạy lệnh trên máy chủ runtime:

```bash
dewee tenant-backup --tenant acme -o ./acme-backup.tar.gz
dewee tenant-restore ./acme-backup.tar.gz --dry-run
dewee tenant-restore ./acme-backup.tar.gz --mode new --new-tenant-slug acme-copy
```

Khôi phục có ba chế độ: `upsert` (mặc định, chỉ thêm các dòng còn thiếu, không đổi gì khác), `replace` (xoá dữ liệu của tenant trước rồi mới nạp, cần `--force`), và `new` (tạo tenant mới từ bản sao lưu). Sao lưu và khôi phục tenant cần PostgreSQL; bản Lite chỉ có một tenant và dùng lệnh sao lưu toàn hệ thống `dewee backup`.

### Chuyển dữ liệu giữa các tenant

Các runtime đời mới có thể sao chép hoặc chuyển những tài nguyên được chọn giữa hai tenant trên cùng runtime: agent, nhóm agent, MCP server, skill tuỳ chỉnh, hook, kênh, cron job, provider, công việc và dữ liệu lưu trữ của tenant. Bản sao nhận định danh mới; khi chuyển thì định danh được giữ nguyên. Bộ nhớ và tri thức của agent chỉ được đưa theo khi bạn yêu cầu. Người thực hiện phải là quản trị viên của cả hai tenant, mọi lần chuyển đều bắt đầu từ một bản xem trước đã lưu, và tính năng này chỉ có trên PostgreSQL. Dùng `dewee tenant-transfer` hoặc các endpoint `/v1/tenant/resource-transfers`.

## Liên quan

- [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys): quản lý ai thuộc về workspace.
- [Cài đặt và sao lưu](/docs/console/settings-and-backup): xuất dữ liệu workspace và yêu cầu khôi phục.
- [Mô hình bảo mật](/docs/security/overview): các lớp phòng vệ khác.
- [Xác thực API](/docs/api/authentication): API key gắn tenant và các header.
- [Tham chiếu CLI](/docs/runtime/cli): đầy đủ các lệnh về tenant.
