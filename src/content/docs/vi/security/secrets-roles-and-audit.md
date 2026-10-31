---
title: Secret, vai trò và nhật ký kiểm toán
description: Cách dewee lưu credential, ai làm được gì trong console và runtime, API key và người gửi qua ứng dụng chat được cấp quyền ra sao, và xem nhật ký ở đâu.
section: security
order: 2
updated: 2026-10-14
---

[Tổng quan bảo mật](/docs/security/overview) nói về các lớp kiểm tra quanh agent. Trang này nói về con người và credential: cái gì được lưu và lưu thế nào, có những vai trò nào, và việc gì để lại dấu vết để bạn xem lại sau.

## Secret được lưu thế nào

| Loại | Cách lưu |
|---|---|
| API key của model provider, key và OAuth token của MCP server, biến môi trường của custom tool, credential cho CLI | AES-256-GCM, khi đã đặt `GOCLAW_ENCRYPTION_KEY` |
| Credential của channel, credential MCP theo người dùng, cookie trình duyệt, SSH key của workstation | AES-256-GCM, khi đã đặt `GOCLAW_ENCRYPTION_KEY` |
| API key | Chỉ lưu hash SHA-256; so sánh trong thời gian không đổi |
| Secret của webhook | Hash SHA-256 để xác minh bên gọi, cùng một bản mã hoá để ký callback gửi đi. Webhook bắt buộc có khoá mã hoá |

Nếu thiếu khoá mã hoá, gateway ghi cảnh báo lúc khởi động và lưu hai dòng đầu ở dạng văn bản thường. `dewee onboard`, `prepare-env.sh` và bộ cài Docker self-hosted đều tự sinh khoá; file `docker-compose.yml` gốc để trống, nên hãy tự đặt nếu bạn dùng trực tiếp file đó.

HTTP API không bao giờ trả về API key của provider đã lưu; nó hiện `***` thay thế. API key và secret của webhook chỉ hiện một lần, lúc bạn tạo. Nếu làm mất, hãy tạo cái mới và thu hồi cái cũ.

## Vai trò trong workspace trên console

Console có ba vai trò dựng sẵn và bao nhiêu vai trò tuỳ chỉnh cũng được.

| Vai trò | Được làm gì |
|---|---|
| Chủ sở hữu | Mọi thứ, kể cả thanh toán, gắn license và thay đổi các owner và admin khác |
| Quản trị viên | Mọi quyền, nhưng không thay đổi được owner hay admin khác |
| Thành viên | Chỉ những gì vai trò tuỳ chỉnh của họ cho phép |

Vai trò tuỳ chỉnh là một tập các khoá quyền, như `provider.manage`, `agents.manage`, `chat.use`, `observability.read`, `api_keys.manage` hay `billing.manage`. Mỗi vai trò cần ít nhất một quyền, và ngoài owner ra, không ai cấp được quyền mà chính họ không có. Lời mời là đường link dùng một lần, hết hạn sau 7 ngày. Cách quản lý thành viên và vai trò từng bước có trong [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys).

## Vai trò trong runtime

Runtime có bốn vai trò riêng, quyết định bên gọi được dùng những phương thức API và WebSocket nào:

- **Owner**: mọi thứ admin làm được, cộng thêm quản lý tenant.
- **Admin**: mọi phương thức, kể cả API key và cấu hình hệ thống.
- **Operator**: quyền đọc và ghi cho công việc hằng ngày, không có thao tác quản trị.
- **Viewer**: chỉ đọc.

Thành viên của tenant được ánh xạ vào các vai trò này: owner và admin thành admin, operator và member thành operator, viewer giữ nguyên viewer. Quyền truy cập từng agent được kiểm tra riêng: agent phải là agent mặc định, do chính bên gọi sở hữu, hoặc đã được chia sẻ cho họ. Với agent dựng sẵn (predefined), bên gọi cũng được dùng nếu một kênh đang bật có tên họ trong danh sách người gửi được phép. Việc kiểm tra áp dụng khi chat qua WebSocket hay HTTP chat API, khi đặt lịch chạy agent, và khi xem hoặc sửa agent. Quyền chia sẻ có bốn mức: use, edit, manage và admin. Muốn sửa file ngữ cảnh của agent thì phải là chủ sở hữu hoặc được chia sẻ ở mức edit, manage hay admin, vì mức use chỉ cho phép chat. Lịch chạy đã tạo không được kiểm tra lại khi đến giờ chạy, nên hãy tắt lịch khi thu hồi quyền chia sẻ mà nó dựa vào. Admin của tenant không bị kiểm tra khi chat và khi gọi các method WebSocket của agent, API key không gắn chủ sở hữu cũng vậy, vì key đó đại diện cho cả tenant. Chat trong ứng dụng tuân theo cùng quy tắc này, với một ngoại lệ: mọi thành viên workspace đều chat được với Super Agent của workspace, vì đó là agent mặc định nhận tin khi chưa chọn agent nào. Mỗi mức chia sẻ mở ra điều gì, cùng các quyền tương ứng trên skill, MCP server, package, provider và hook, được trình bày ở [Cấp quyền theo tài nguyên](/docs/security/access-grants).

## API key

API key dùng để xác thực script, tích hợp và CLI. Mỗi key gắn với một tenant và mang các scope, và vai trò được suy ra từ scope: `operator.admin` cho quyền admin, `operator.write`, `operator.approvals` hoặc `operator.pairing` cho quyền operator, còn `operator.read` cho quyền viewer. Key có `mcp.tools.read` hoặc `mcp.tools.write` chỉ dùng được với endpoint MCP công khai.

Key có thể hết hạn hoặc bị thu hồi bất cứ lúc nào. Key đã thu hồi bị từ chối ngay từ request tiếp theo, và các session WebSocket đang dùng nó bị ngắt. Định dạng, header và ví dụ có trong [Xác thực](/docs/api/authentication).

## Cấp quyền cho người gửi trên ứng dụng chat

Trên ứng dụng chat, tin nhắn riêng mặc định dùng cơ chế ghép cặp. Khi một người mới nhắn cho agent, họ nhận một mã 8 ký tự có hiệu lực 60 phút, và không gì tới được agent cho tới khi admin phê duyệt mã đó, trong **Hộp ghép nối** của console hoặc bằng `dewee pairing approve`. Admin của một workspace chỉ phê duyệt hoặc từ chối được mã thuộc workspace của mình; chủ sở hữu gateway quyết định được mã của mọi workspace. Mỗi tài khoản có tối đa ba mã đang chờ. Bạn có thể chuyển channel sang danh sách cho phép, mở hoàn toàn, hoặc tắt tin nhắn riêng, và trong nhóm chỉ những người được chỉ định mới thay đổi được file hay đặt lại cuộc trò chuyện. Xem [Channel, ghép cặp và danh bạ](/docs/console/channels-and-contacts).

## Nhật ký kiểm toán

- **Nhật ký hoạt động.** Các thay đổi được ghi lại cùng người thực hiện, đối tượng và hành động. Xem trên trang **Hoạt động** của console, bằng `dewee activity list`, hoặc qua `GET /v1/activity`.
- **Hoạt động truy cập.** Mỗi skill, MCP server, package, provider, hook và agent có một luồng ghi lại thay đổi quyền, các lần bị từ chối khi chạy và việc sử dụng. Xem [Cấp quyền theo tài nguyên](/docs/security/access-grants#hoạt-động).
- **Nhật ký API key.** Trang **API key & tài liệu** của console có tab **Nhật ký** cho các key của bạn.
- **Sự kiện bảo mật.** Prompt injection bị phát hiện hoặc bị chặn và tin nhắn bị cắt bớt được ghi thành `security.injection_detected`, `security.injection_blocked` và `security.message_truncated`.
- **Trace.** Mỗi lượt chạy của agent ghi lại các lời gọi model và tool, nên bạn thấy được agent đã làm gì và vì sao. Xem [Tracing](/docs/concepts/tracing).

> [!NOTE]
> Lời gọi tới endpoint MCP công khai được ghi vào log của gateway. Chúng chưa xuất hiện trong phần xem trace.

## Xoay vòng và thu hồi

| Credential | Cách thay thế |
|---|---|
| API key | Tạo key mới, chuyển client sang key mới, rồi thu hồi key cũ |
| Secret của webhook | Xoay vòng rồi cập nhật bên gửi ngay: không có thời gian ân hạn, secret cũ hết hiệu lực lập tức |
| API key của provider | Cập nhật trong **Nhà cung cấp & mô hình** rồi kiểm tra lại |
| Gateway token | Đổi `GOCLAW_GATEWAY_TOKEN` và khởi động lại gateway, rồi cập nhật các client đang dùng nó |
| Khoá mã hoá | Đừng đổi tuỳ tiện: secret đã mã hoá bằng khoá cũ không đọc được bằng khoá mới |
