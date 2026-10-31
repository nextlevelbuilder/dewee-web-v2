---
title: Nhóm agent và phê duyệt
description: Gom agent thành nhóm có trưởng nhóm và bảng task chung, tạo liên kết để agent giao việc cho nhau, rồi xét duyệt task cùng các yêu cầu phê duyệt.
section: console
order: 4
screens: [teams]
updated: 2026-10-14
---

Một agent đã làm được nhiều việc, nhưng có những việc sẽ trôi chảy hơn khi nhiều agent cùng chia nhau làm. Nhóm agent (trên trang nhóm, giao diện gọi agent là agent) gồm một agent trưởng nhóm, các agent thành viên và một bảng task chung. **Task & phê duyệt** là nơi bạn theo dõi công việc agent đang chạy và quyết định những hành động mà agent không được tự làm một mình.

## Ai được dùng

| Khu vực | Khoá quyền | Cho phép |
|---|---|---|
| Nhóm agent | `teams.manage` | Mở các nhóm, bảng task, thành viên và liên kết uỷ quyền |
| Task & phê duyệt | `tasks.manage` | Xem task của agent, phê duyệt hoặc từ chối các yêu cầu |

Nếu thiếu `teams.manage`, trang **Nhóm agent** sẽ báo vai trò của bạn chưa có quyền quản lý nhóm agent. Để thay đổi nhóm, thành viên, task hoặc liên kết, bạn còn cần là chủ workspace hoặc có vai trò Admin; người khác có khoá quyền này chỉ xem được nhóm. Xem [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys).

## Nhóm hoạt động thế nào

Mỗi nhóm có đúng một agent **Trưởng nhóm** và số agent thành viên tuỳ ý. Trưởng nhóm điều phối: chia việc thành các task trên bảng của nhóm, giao cho thành viên và theo sát tới khi xong. Thành viên xử lý task được giao và trao đổi qua bình luận trên task. Mỗi thành viên tham gia nhóm với vai trò **Thành viên** hoặc **Người xét duyệt**. Nhóm chỉ gồm agent; không thêm được người trong workspace.

Các cột trên bảng tương ứng với trạng thái task: **Chờ xử lý**, **Đang làm**, **Đang xét duyệt**, **Hoàn thành**, **Bị chặn** và **Thất bại**. Task ở trạng thái khác, như **Đã huỷ**, có cột riêng nằm sau các cột này. Khi một task cần người xét duyệt, nó nằm ở **Đang xét duyệt** cho tới khi có người phê duyệt hoặc từ chối.

::shot{id="teams"}

Trang **Nhóm agent** hiển thị mỗi nhóm thành một thẻ, kèm trưởng nhóm, thành viên và tiến độ task. Bạn có thể tìm theo tên, lọc theo **Trạng thái** (**Đang hoạt động** hoặc **Đã lưu trữ**) và sắp xếp theo **Tên**, **Mới nhất**, **Nhiều thành viên nhất**, **Nhiều công việc nhất** hoặc **Cập nhật gần đây**. Bên dưới các thẻ là **Link uỷ quyền** của workspace và **Hoạt động gần đây của nhóm**.

## Tạo nhóm

1. Chọn **Nhóm mới**.
2. Ở **Bắt đầu từ**, chọn một mẫu (**Support pod**, **Engineering swarm** hoặc **Operations desk**) để điền sẵn tên và mô tả, hoặc **Nhóm trống**.
3. Nhập **Tên nhóm** và **Mô tả** nếu muốn, giữ **Trạng thái** là **Đang hoạt động**.
4. Chọn **Agent trưởng nhóm**. Không tạo được nhóm nếu thiếu trưởng nhóm.
5. Nếu muốn, thêm **Agent thành viên**. Các agent này tham gia với vai trò **Thành viên**.
6. Chọn **Tạo nhóm**.

Để thay đổi nhóm sau này, dùng **Sửa nhóm** rồi **Lưu thay đổi**. Muốn ngừng dùng một nhóm mà không xoá, hãy đặt trạng thái thành **Đã lưu trữ**. **Xoá nhóm** gỡ bảng task và danh sách thành viên của nhóm; bản thân các agent vẫn hoạt động.

## Bên trong một nhóm

Mở một nhóm để xem các tab:

- **Bảng**: các task của nhóm. Chuyển qua lại giữa **Kanban** và **Danh sách**.
- **Thành viên**: thêm một agent với vai trò **Thành viên** hoặc **Người xét duyệt**, hoặc gỡ agent. Không gỡ được trưởng nhóm ở đây; hãy đổi trưởng nhóm từ **Sửa nhóm**.
- **Liên kết**: các liên kết uỷ quyền thuộc nhóm này.
- **Hoạt động**: các thay đổi về task, thành viên và liên kết của nhóm.
- **Cài đặt**: **Kiểm soát truy cập** theo kênh và người dùng, **Điều phối** (cách xử lý yêu cầu từ thành viên, vướng mắc và lời nhắc, và các cuộc trò chuyện có dùng chung thư mục làm việc hay không) và **Thông báo** (**Trực tiếp**, hoặc **Qua trưởng nhóm**, cách này viết lại cập nhật và tốn token).
- **Thông tin**: tên, mô tả, trạng thái, agent trưởng nhóm của nhóm, cùng thời điểm tạo và cập nhật.

## Làm việc trên bảng task

1. Mở một nhóm và chọn **Công việc mới**.
2. Nhập **Tiêu đề**, **Mô tả** và **Độ ưu tiên** (mặc định là 0), rồi chọn **Người phụ trách** hoặc để trống. Công việc đã giao có thể chuyển cho agent khác, nhưng không bỏ giao được.
3. Chọn **Tạo task**.

Mỗi thẻ task có một menu:

- **Xem chi tiết** và **Sửa task**.
- **Chuyển sang…**: đổi trạng thái của task.
- **Phê duyệt** hoặc **Từ chối**, với task **Đang xét duyệt**. Phê duyệt sẽ đánh dấu task hoàn thành. Từ chối sẽ huỷ task và báo lý do cho trưởng nhóm; nếu để trống, lý do sẽ là "Rejected by human".
- **Giao việc**, với task **Chờ xử lý**. Agent sẽ bắt đầu làm ngay.
- **Xoá task**, với task đã kết thúc. Thao tác này xoá cả bình luận, dòng thời gian và tệp của task.

## Liên kết uỷ quyền

Liên kết uỷ quyền cho phép một agent chuyển việc sang agent khác, trong phạm vi một nhóm hoặc dưới dạng liên kết thủ công độc lập.

1. Ở phần **Link uỷ quyền** trên trang **Nhóm agent**, hoặc ở tab **Liên kết** của một nhóm, chọn **Liên kết mới**.
2. Chọn **Agent nguồn** và **Agent đích**.
3. Chọn một **Team**, hoặc để **Link thủ công**.
4. Đặt **Chiều**: **Chiều đi**, **Chiều đến** hoặc **Hai chiều**. Với **Hai chiều**, hãy đánh dấu "Tôi hiểu rằng cả hai agent đều có thể giao việc cho nhau."
5. Nếu muốn, thêm **Mô tả**, rồi chọn **Tạo liên kết**.

Liên kết ở trạng thái **Đang hoạt động** hoặc **Đã tắt**. Dùng menu của liên kết để **Bật**, **Tắt** hoặc **Xoá link**. Khi xoá một nhóm, các liên kết riêng của nhóm có thể trở thành liên kết thủ công.

## Task & phê duyệt

**Task & phê duyệt** có hai tab là **Task** và **Phê duyệt**. Tab **Task** hiển thị số task đang chạy, còn tab **Phê duyệt** hiển thị số yêu cầu đang chờ.

**Task** liệt kê các task của agent trong workspace, 50 task mỗi trang, kèm agent, trạng thái và lần cập nhật gần nhất. Bạn có thể xem dạng **Bảng** hoặc **Danh sách**, tìm theo task, trạng thái, agent, mô hình hoặc bước tiến độ, và lọc theo trạng thái (**Đang chạy**, **Hoàn thành**, **Thất bại** hoặc **Đã huỷ**). Chọn một task để mở chi tiết: trạng thái, agent, tiến độ, mô hình, nhà cung cấp, token, phiên liên kết và các mốc thời gian, **Các trường runtime đã ẩn**, và **Bình luận & tệp**. Nội dung thô của task, prompt và dữ liệu gửi cho công cụ đều được lược bỏ. Muốn tự tạo công việc, hãy mở một nhóm.

**Phê duyệt** liệt kê các yêu cầu từ agent cần một người quyết định trước khi agent làm tiếp, ví dụ chạy một lệnh hay cài một gói. Mỗi yêu cầu hiển thị agent, thời điểm yêu cầu và thời điểm hết hạn, mức rủi ro và tóm tắt lệnh, có thể đã bị ẩn.

1. Mở tab **Phê duyệt**. Mặc định tab hiển thị các yêu cầu **Cần xử lý**; chuyển sang **Tất cả**, **Đang chờ**, **Đã phê duyệt**, **Đã từ chối** hoặc **Hết hạn** khi cần.
2. Chọn **Chi tiết** để đọc toàn bộ yêu cầu, gồm thư mục làm việc, quy tắc chính sách đã khớp, lý do và ảnh hưởng dự kiến mà agent nêu, cùng bằng chứng.
3. Chọn **Phê duyệt**, hoặc **Từ chối** và nhập lý do. Không gửi được lời từ chối nếu thiếu lý do.

Mọi quyết định đều được lưu, kèm lý do, vào nhật ký kiểm tra của workspace.

> [!NOTE]
> Khi agent xin chạy một lệnh hoặc cài một gói trong lúc trò chuyện, yêu cầu đó cũng hiện trong cuộc trò chuyện dưới dạng thẻ có **Phê duyệt** và **Từ chối**. Thẻ dùng cùng cơ chế phê duyệt với tab này, nên áp dụng cùng quyền hạn. Với thao tác có tính phá huỷ, bạn phải nhập tên tài nguyên để xác nhận, và **Từ chối** cần có lý do. Xem [Chat và phiên hội thoại](/docs/console/chat-and-sessions). Bạn cũng có thể quyết định yêu cầu bằng lệnh `dewee packages approvals`; xem [Tham chiếu CLI](/docs/runtime/cli).

## Liên quan

- [Nhóm agent và giao việc](/docs/concepts/agent-teams)
- [Tool và quyền hạn](/docs/concepts/tools-and-permissions)
- [Agent](/docs/console/agents)
- [Lịch chạy và workflow](/docs/console/schedules-and-workflows)
- [Tham chiếu CLI](/docs/runtime/cli)
