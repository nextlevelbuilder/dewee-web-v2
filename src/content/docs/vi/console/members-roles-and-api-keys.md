---
title: Thành viên, vai trò và API key
description: Mời người khác vào workspace, quyết định mỗi người được làm gì bằng vai trò có sẵn và vai trò tuỳ chỉnh, và tạo API key có phạm vi cho CLI, script và AI client.
section: console
order: 12
screens: [members, roles, api-keys]
updated: 2026-10-14
---

Một workspace được nhiều người dùng chung và được các chương trình gọi tới. **Thành viên** quyết định ai thuộc workspace, **Vai trò** quyết định mỗi người được làm gì, còn **API key & tài liệu** cho phép CLI, mã của bạn và các AI client bên ngoài gọi vào workspace mà không cần ai đăng nhập.

## Ai được dùng

| Việc | Ai được làm |
|---|---|
| Mời thành viên | `members.invite` |
| Tạo và sửa vai trò tuỳ chỉnh, mời kèm vai trò tuỳ chỉnh, đổi vai trò tuỳ chỉnh của thành viên, gỡ thành viên | `roles.manage` |
| Tạo, xoay vòng và thu hồi API key | `api_keys.manage` |
| Mời admin, thay đổi hoặc gỡ owner và admin | Chỉ chủ workspace |

## Thành viên

Trang **Thành viên** đếm số **Thành viên**, **Chủ sở hữu**, **Quản trị viên** và **Lời mời đang chờ** của workspace, rồi chia thành hai tab: **Thành viên** và **Lời mời**. Tab **Thành viên** liệt kê từng người kèm **Vai trò** (vai trò có sẵn cùng các vai trò tuỳ chỉnh), thời điểm **Tham gia** và lần **Đăng nhập gần nhất**.

::shot{id="members"}

Để mời người khác:

1. Chọn **Mời thành viên**.
2. Ở ô **Địa chỉ email**, nhập một hoặc nhiều địa chỉ. Bạn có thể dán một danh sách ngăn cách bằng dấu phẩy, dấu cách hoặc dấu chấm phẩy.
3. Chọn **Vai trò**: **Thành viên** hoặc **Quản trị viên**. Chỉ owner mới mời được admin.
4. Nếu muốn, chọn thêm **Vai trò tuỳ chỉnh**. Việc này cần khoá quyền `roles.manage`.
5. Chọn **Gửi lời mời**. Mỗi người nhận một email kèm liên kết để tham gia.

Nếu bản triển khai không gửi được email mời, hộp thoại hiện **Hãy tự gửi các liên kết này** kèm nút sao chép cho từng địa chỉ. Hãy gửi từng liên kết cho đúng người nhận.

Mỗi lời mời có hiệu lực trong 7 ngày. Tab **Lời mời** liệt kê **Email**, **Vai trò**, **Trạng thái** (**Đang chờ**, **Đã chấp nhận**, **Đã hết hạn** hoặc **Đã thu hồi**), **Gửi đi** và **Hết hạn** của từng lời mời. Với lời mời đang chờ, bạn có thể **Gửi lại**, **Sao chép liên kết mời** hoặc **Thu hồi**. Khi thu hồi, bạn xác nhận bằng **Thu hồi lời mời**, và liên kết ngừng hoạt động ngay. Liên kết đã hết hạn thì phải mời lại.

Để thay đổi quyền của một thành viên, chọn **Đổi vai trò tùy chỉnh** trong menu của dòng đó. Trong hộp thoại **Vai trò tùy chỉnh của {email}**, đánh dấu các vai trò rồi chọn **Lưu vai trò**. Thay đổi có hiệu lực ngay.

**Xóa khỏi không gian làm việc** đưa một thành viên ra khỏi workspace. Xác nhận bằng **Gỡ thành viên**: quyền truy cập app bị gỡ trước, sau đó quyền truy cập runtime bị thu hồi. Cho tới khi phía runtime xử lý xong, dòng đó hiện nhãn **Đang gỡ quyền**.

Workspace luôn phải còn ít nhất một owner. Chỉ owner mới đổi được vai trò của owner hoặc admin, gỡ owner hoặc admin, hay đổi vai trò tuỳ chỉnh của chính mình.

## Vai trò

Có ba vai trò có sẵn. Chúng hiện dưới dạng thẻ có ghi **Có sẵn, chỉ đọc**, kèm số thành viên đang giữ từng vai trò:

- **Chủ sở hữu** (owner): toàn quyền, gồm thanh toán, sao lưu, quản lý thành viên và các trang chỉ dành cho owner.
- **Quản trị viên** (admin): giữ mọi khoá quyền. Chỉ owner mới mời được admin hoặc thay đổi admin khác.
- **Thành viên** (member): chỉ giữ những khoá quyền được cấp qua vai trò tuỳ chỉnh của mình.

::shot{id="roles"}

Để tạo vai trò tuỳ chỉnh:

1. Ở trang **Vai trò**, chọn **Vai trò mới**. Bảng **Tạo vai trò tuỳ chỉnh** mở ra.
2. Nhập **Tên** (tối đa 80 ký tự), **Khoá vai trò** và **Mô tả** nếu muốn (tối đa 280 ký tự). Khoá gồm chữ thường, chữ số, dấu chấm, dấu gạch dưới và dấu gạch ngang, dài từ 2 đến 64 ký tự, và không được là `owner`, `admin` hay `member`. Bạn không đổi được khoá sau khi tạo.
3. Đánh dấu ít nhất một quyền trong ma trận quyền.
4. Chọn **Tạo vai trò**.

Gán vai trò mới cho từng người ở trang **Thành viên**.

Bảng **Vai trò tùy chỉnh** liệt kê từng vai trò kèm khoá, quyền và thành viên. Menu của mỗi dòng có **Sửa** và **Nhân bản**. **Xoá** không dùng được với vai trò tuỳ chỉnh. Khi bạn sửa một vai trò đã có thành viên giữ, nút **Lưu thay đổi** sẽ hỏi xác nhận **Cập nhật vai trò tuỳ chỉnh** trước, vì những thành viên đó nhận bộ quyền mới ngay lập tức.

Nếu bạn quản lý vai trò mà không phải owner, trình chỉnh sửa hiện **Người quản lý vai trò giới hạn**: bạn chỉ cấp được những quyền mà chính bạn đang giữ. Máy chủ kiểm tra quy tắc này khi bạn lưu.

Mỗi quyền là một khoá riêng, hoặc được cấp hoặc không. Ma trận chia chúng theo nhóm:

| Nhóm | Khoá quyền |
|---|---|
| Thương mại | `billing.manage`, `backup.export`, `backup.restore.request` |
| Vận hành runtime | `provider.manage`, `chat.use`, `sessions.read`, `agents.manage`, `observability.read`, `settings.manage` |
| Cộng tác | `members.invite`, `roles.manage`, `teams.manage`, `tasks.manage` |
| Mở rộng | `api_keys.manage`, `packages.request`, `packages.install`, `skills.manage`, `integrations.manage`, `contacts.manage` |
| Tri thức | `memory.read`, `memory.manage`, `vault.manage`, `storage.manage` |
| Khác | `system_config.manage`, `import_export.manage`, `workstations.manage` |

Các khoá trong nhóm **Khác** dành cho những trang của owner trên Dedicated và On-Premises. Xem [Cài đặt và sao lưu](/docs/console/settings-and-backup).

## API key

Trang **API key & tài liệu** có bốn tab:

- **Key**: các key của workspace.
- **Tài liệu**: **Xác thực và giới hạn**, danh sách **Endpoint** kèm phạm vi mà mỗi endpoint cần, **Mã mẫu** cho cURL, JavaScript, Python, WebSocket và MCP client, và **Tải đặc tả OpenAPI**.
- **Nhật ký**: lịch sử thay đổi key, kèm thời gian, hành động, key, người thực hiện và mã yêu cầu.
- **Kết nối MCP client**: hướng dẫn từng bước để kết nối một AI client. Xem [Kết nối MCP client](#kết-nối-mcp-client).

::shot{id="api-keys"}

Để tạo một key:

1. Chọn **Tạo khóa** và nhập **Tên** (từ 2 đến 80 ký tự).
2. Chọn **Quyền truy cập**. Mỗi lựa chọn hiện các phạm vi của nó và nhãn mức rủi ro, **thông thường** hoặc **nhạy cảm**:
   - Trong nhóm **Vận hành**, **Đọc** cho quyền chỉ đọc qua API của workspace, còn **Đọc và ghi** thêm quyền ghi.
   - Trong nhóm **MCP (chỉ truy cập công cụ)**, **MCP đọc** cho phép một AI client như Claude Code, Cursor, VS Code hay Gemini CLI dùng các công cụ MCP chỉ đọc của workspace, còn **MCP đọc và ghi** thêm các công cụ MCP có thể thay đổi dữ liệu.
3. Chọn **Môi trường**: Production, Staging, Development hoặc Automation. Đây chỉ là nhãn để bạn dễ phân biệt các key.
4. Đặt **Hết hạn**: 1 giờ, 1 ngày, 30 ngày, 90 ngày hoặc **Không hết hạn**. Mặc định là 30 ngày.
5. Chọn **Tạo key**.

Hộp thoại **Sao chép khóa API mới** hiện toàn bộ key một lần duy nhất. Hãy lưu key vào trình quản lý secret, rồi đánh dấu **Tôi đã lưu khóa này ở nơi an toàn** trước khi đóng hộp thoại.

Tab **Key** hiển thị tiền tố, phạm vi, lần dùng gần nhất, hạn dùng và trạng thái của từng key: **Đang hoạt động**, **Sắp hết hạn**, **Đã hết hạn** hoặc **Đã thu hồi**. Menu của mỗi dòng có **Xem chi tiết**, **Xoay vòng** và **Thu hồi**:

- **Xoay vòng** thu hồi key hiện tại và hiện key mới một lần duy nhất. Xác nhận bằng **Xoay vòng khóa**, rồi cập nhật mọi client đang dùng key đó.
- **Thu hồi** vô hiệu hoá key ngay, nên mọi client đang dùng key đó sẽ ngừng hoạt động. Gõ tên key để xác nhận, rồi chọn **Thu hồi khóa**.

Cả hai thao tác đều được ghi lại trong **Nhật ký**. Phạm vi của key lấy từ quyền truy cập chọn lúc tạo; muốn đổi, hãy tạo key mới.

Việc tạo và xoay vòng key bị giới hạn 20 lần mỗi giờ, còn thu hồi là 30 lần mỗi giờ. Bạn chỉ tạo được key sau khi workspace đã khởi tạo xong.

> [!WARNING]
> Bất kỳ ai giữ key đều thao tác được trên workspace trong phạm vi quyền của key. Hãy chọn mức truy cập hẹp nhất, đặt hạn dùng, và xoay vòng ngay key nào bạn nghi đã bị lộ.

### Kết nối MCP client

Tab **Kết nối MCP client** cho phép một công cụ AI như Claude Code, Cursor, VS Code hoặc Gemini CLI dùng công cụ của agent trong workspace này. Tab hướng dẫn qua năm bước:

1. **Trạng thái endpoint**: địa chỉ endpoint, số công cụ đọc và ghi, và các giới hạn. Quản trị viên workspace có thể **Bật MCP** hoặc **Tắt MCP** ở đây. Tắt MCP làm mọi client đang kết nối ngừng hoạt động, nhưng các khóa vẫn được giữ.
2. **Chọn agent**: agent mà client làm việc cùng. Để trống để dùng agent mặc định của workspace.
3. **Tạo khóa**: một khóa chỉ dùng được cho MCP. **Công cụ đọc** luôn được cấp; chỉ bật **Cho phép thêm công cụ ghi** khi client thật sự cần. Chọn **Tạo khóa** rồi sao chép khóa, vì khóa chỉ hiện một lần.
4. **Sao chép cấu hình client**: chọn client của bạn trong **MCP client** rồi chọn **Sao chép cấu hình**.
5. **Kiểm tra kết nối**: dán một **Khóa MCP** rồi chọn **Kiểm tra kết nối**. Bài kiểm tra chạy đúng bước bắt tay mà client thực hiện, và khóa không được lưu lại.

> [!NOTE]
> Key MCP cho phép AI client bên ngoài gọi vào dewee. Nếu bạn muốn agent của dewee gọi tới một MCP server bên ngoài, hãy thêm server đó ở trang [Tool tích hợp, MCP server và hook](/docs/console/tools-mcp-and-hooks).

## Liên quan

- [Xác thực](/docs/api/authentication)
- [Tổng quan API](/docs/api/overview)
- [Webhook và MCP](/docs/api/webhooks-and-mcp)
- [Secret, vai trò và nhật ký kiểm toán](/docs/security/secrets-roles-and-audit)
- [Tách biệt đa tenant](/docs/concepts/multi-tenancy)
