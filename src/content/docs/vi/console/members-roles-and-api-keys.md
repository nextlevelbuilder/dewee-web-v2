---
title: Thành viên, vai trò và API key
description: Mời người khác vào workspace, quyết định mỗi người được làm gì bằng vai trò có sẵn và vai trò tuỳ chỉnh, và tạo API key có phạm vi cho CLI, script và AI client.
section: console
order: 12
screens: [members, roles, api-keys]
updated: 2026-09-25
---

Một workspace được nhiều người dùng chung và được các chương trình gọi tới. **Thành viên** quyết định ai thuộc workspace, **Vai trò** quyết định mỗi người được làm gì, còn **API key** cho phép CLI, mã của bạn và các AI client bên ngoài gọi vào workspace mà không cần ai đăng nhập.

## Ai được dùng

| Việc | Ai được làm |
|---|---|
| Mời thành viên | `members.invite` |
| Tạo và sửa vai trò tuỳ chỉnh, mời kèm vai trò tuỳ chỉnh | `roles.manage` |
| Tạo, xoay vòng và thu hồi API key | `api_keys.manage` |
| Mời admin, thay đổi hoặc gỡ owner và admin | Chỉ chủ workspace |

## Thành viên

Trang **Thành viên** cho biết workspace có bao nhiêu thành viên, owner, admin và lời mời đang chờ, rồi liệt kê từng thành viên kèm vai trò gốc, các vai trò tuỳ chỉnh và trạng thái.

::shot{id="members"}

Để mời một người:

1. Chọn **Invite member** và nhập một địa chỉ email.
2. Chọn **Built-in role**: **Member** hoặc **Admin**. Chỉ owner mới mời được admin.
3. Nếu muốn, chọn thêm **Custom role**. Việc này cần khoá quyền `roles.manage`.
4. Chọn **Send invite**. Lời mời được gửi qua email, và trang hiển thị một **Manual invite link** để bạn tự gửi nếu cần.

Mỗi lời mời có hiệu lực trong 7 ngày. Trong phần **Invites**, bạn có thể **Resend** hoặc **Revoke** một lời mời đang chờ; liên kết đã hết hạn thì phải mời lại.

Để thay đổi quyền của một thành viên, chọn các vai trò tuỳ chỉnh của họ ở cột **Assign roles** rồi chọn **Save**. Thay đổi có hiệu lực ngay. **Remove** đưa một thành viên ra khỏi workspace: quyền truy cập console bị gỡ trước, sau đó quyền truy cập runtime bị thu hồi.

Workspace luôn phải còn ít nhất một owner. Chỉ owner mới đổi được vai trò của owner hoặc admin, gỡ owner hoặc admin, hay đổi vai trò tuỳ chỉnh của chính mình.

## Vai trò

Có ba vai trò có sẵn, và bạn không sửa được chúng:

- **Owner**: làm được mọi việc, kể cả các trang chỉ dành cho owner.
- **Admin**: giữ mọi khoá quyền.
- **Member**: chỉ giữ những khoá quyền được cấp qua vai trò tuỳ chỉnh của mình.

::shot{id="roles"}

Để tạo vai trò tuỳ chỉnh:

1. Ở trang **Vai trò**, điền **Role key**, **Display name** và **Description** nếu muốn. Key gồm chữ thường, chữ số, dấu chấm, dấu gạch dưới và dấu gạch ngang, dài từ 2 đến 64 ký tự, và không được là `owner`, `admin` hay `member`.
2. Đánh dấu ít nhất một quyền trong bảng quyền.
3. Chọn **Create role** rồi xác nhận.

Để sửa một vai trò, chọn **Edit** trong **Current roles**. Những thành viên đang giữ vai trò đó sẽ nhận bộ quyền mới ngay lập tức.

Nếu bạn quản lý vai trò mà không phải owner, bạn chỉ cấp được những quyền mà chính bạn đang giữ. Máy chủ kiểm tra quy tắc này khi bạn lưu.

Mỗi quyền là một khoá riêng, hoặc được cấp hoặc không:

| Nhóm | Khoá quyền |
|---|---|
| Commercial | `billing.manage`, `backup.export`, `backup.restore.request` |
| Runtime operations | `provider.manage`, `chat.use`, `sessions.read`, `agents.manage`, `observability.read`, `settings.manage` |
| Collaboration | `members.invite`, `roles.manage`, `teams.manage`, `tasks.manage` |
| Extensions | `api_keys.manage`, `packages.request`, `packages.install`, `skills.manage`, `integrations.manage`, `contacts.manage` |
| Knowledge | `memory.read`, `memory.manage`, `vault.manage`, `storage.manage` |

Nhóm **Other** liệt kê các khoá dành cho những trang của owner trên Dedicated và On-Premises. Xem [Cài đặt và sao lưu](/docs/console/settings-and-backup).

## API key

Trang **API key** có bốn tab: **Keys**, **Docs** gồm tài liệu tham chiếu API và biểu mẫu chạy thử, **Examples** gồm các đoạn mã sẵn sàng sao chép cho cURL, JavaScript, Python, WebSocket và MCP client, và **Audit**, lịch sử thay đổi key.

::shot{id="api-keys"}

Để tạo một key:

1. Chọn **New API key** và nhập **Name**.
2. Chọn **Environment**: Production, Staging, Development hoặc Automation. Đây chỉ là nhãn để bạn dễ phân biệt các key.
3. Chọn mức truy cập:
   - **Read**: chỉ đọc qua API của workspace.
   - **Read and write**: đọc và ghi qua API của workspace.
   - **MCP read**: cho phép một AI client như Claude Code, Cursor, VS Code hay Gemini CLI dùng các MCP tool chỉ đọc của workspace.
   - **MCP read and write**: thêm các MCP tool có thể thay đổi dữ liệu.
4. Đặt **Expiry**: 1 giờ, 1 ngày, 30 ngày, 90 ngày hoặc không hết hạn.
5. Xem lại, chọn **Create key** và sao chép giá trị key.

Key chỉ hiển thị một lần. Hãy lưu nó vào trình quản lý secret trước khi đóng hộp thoại.

Danh sách hiển thị tiền tố, scope, lần dùng gần nhất, hạn dùng và trạng thái của từng key: **Active**, **Expiring**, **Expired** hoặc **Revoked**. **Rotate** tạo giá trị mới, chỉ hiển thị một lần, và thu hồi giá trị cũ. **Revoke** vô hiệu hoá key ngay, nên mọi client đang dùng key đó sẽ ngừng hoạt động. Cả hai thao tác đều được ghi lại trong **Audit**.

> [!NOTE]
> Key MCP cho phép AI client bên ngoài gọi vào dewee. Nếu bạn muốn agent của dewee gọi tới một MCP server bên ngoài, hãy thêm server đó ở trang [Tool tích hợp, MCP server và hook](/docs/console/tools-mcp-and-hooks).

Việc tạo và xoay vòng key bị giới hạn 20 lần mỗi giờ, còn thu hồi là 30 lần mỗi giờ. Bạn chỉ tạo được key sau khi workspace đã khởi tạo xong.

> [!WARNING]
> Bất kỳ ai giữ key đều thao tác được trên workspace trong phạm vi quyền của key. Hãy chọn mức truy cập hẹp nhất, đặt hạn dùng, và xoay vòng ngay key nào bạn nghi đã bị lộ.

## Liên quan

- [Xác thực](/docs/api/authentication)
- [Tổng quan API](/docs/api/overview)
- [Webhook và MCP](/docs/api/webhooks-and-mcp)
- [Secret, vai trò và nhật ký kiểm toán](/docs/security/secrets-roles-and-audit)
- [Tách biệt đa tenant](/docs/concepts/multi-tenancy)
