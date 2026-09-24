---
title: Nhóm agent và phê duyệt
description: Gom agent thành nhóm có lead và bảng tác vụ chung, tạo liên kết để agent giao việc cho nhau, và xem xét các tác vụ cùng yêu cầu phê duyệt do agent gửi lên.
section: console
order: 4
screens: [teams]
updated: 2026-09-25
---

Một agent đã làm được nhiều việc, nhưng có những việc sẽ trôi chảy hơn khi nhiều agent cùng chia nhau làm. Nhóm agent gồm một agent lead, các agent thành viên và một bảng tác vụ chung. **Tác vụ & phê duyệt** là nơi bạn theo dõi công việc agent đang chạy và quyết định những hành động mà agent không được tự làm một mình.

## Ai được dùng

| Khu vực | Khoá quyền | Cho phép |
|---|---|---|
| Nhóm agent | `teams.manage` | Tạo và sửa nhóm, thành viên, tác vụ và liên kết giao việc |
| Tác vụ & phê duyệt | `tasks.manage` | Xem tác vụ của agent, chấp thuận hoặc từ chối yêu cầu phê duyệt |

Để thay đổi một nhóm, bạn còn cần là chủ workspace hoặc có vai trò Admin. Những người khác chỉ xem được nhóm. Xem [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys).

## Nhóm hoạt động thế nào

Mỗi nhóm có đúng một agent **lead** và số agent thành viên tuỳ ý. Lead điều phối: chia việc thành các tác vụ trên bảng của nhóm, giao cho thành viên và theo sát tới khi xong. Thành viên xử lý tác vụ được giao và trao đổi qua bình luận trên tác vụ. Mỗi thành viên tham gia nhóm với vai trò **Member** hoặc **Reviewer**.

Các cột trên bảng tác vụ tương ứng với trạng thái tác vụ: **Pending**, **In progress**, **In review**, **Completed**, **Blocked** và **Failed**. Khi một tác vụ cần người duyệt, nó sẽ nằm ở **In review** cho tới khi có người chuyển nó sang bước tiếp theo.

::shot{id="teams"}

Trang liệt kê từng nhóm kèm lead, số thành viên và trạng thái, cùng hoạt động gần đây của các nhóm. Bạn có thể tìm theo tên, lọc theo trạng thái (Active hoặc Archived) và sắp xếp theo tên, mới nhất hoặc số thành viên.

## Tạo nhóm

1. Chọn **Create team**.
2. Nhập tên và mô tả, hoặc bắt đầu từ một mẫu có sẵn như **Support pod**, **Engineering swarm** hay **Operations desk**.
3. Chọn **Lead agent**. Nhóm không lưu được nếu thiếu lead.
4. Giữ trạng thái **Active** rồi chọn **Save**.
5. Mở nhóm, ở phần **Members** chọn một agent, chọn vai trò **Member** hoặc **Reviewer**, rồi chọn **Add**.

Không thể gỡ lead ra khỏi chính nhóm của nó. Muốn ngừng dùng một nhóm mà không xoá, hãy đặt trạng thái của nhóm thành **Archived**.

## Làm việc trên bảng tác vụ

1. Mở một nhóm và chọn **Create task**.
2. Nhập tiêu đề, mô tả và mức ưu tiên, rồi chọn người phụ trách hoặc để trống.
3. Chuyển qua lại giữa chế độ xem **Kanban** và **List** tuỳ ý.
4. Để đổi trạng thái của một tác vụ, chọn trạng thái mới trong ô chọn trên thẻ tác vụ.

## Liên kết giao việc

Liên kết giao việc cho phép một agent chuyển việc sang agent khác, trong phạm vi một nhóm hoặc dưới dạng liên kết thủ công độc lập.

1. Ở phần **Delegation links**, chọn **Create link**.
2. Chọn **Source agent** và **Target agent**.
3. Chọn một nhóm, hoặc để **Manual link**.
4. Đặt **Direction**: **Outbound** (mặc định), **Inbound** hoặc **Bidirectional**. Với Bidirectional, bạn cần chọn **Create** thêm một lần nữa để xác nhận.

Sau này bạn có thể bật, tắt hoặc xoá liên kết. Khi xoá một nhóm, các liên kết riêng của nhóm đó có thể trở thành liên kết thủ công.

## Tác vụ & phê duyệt

**Tác vụ & phê duyệt** có hai tab là **Tasks** và **Approvals**. Tab **Approvals** hiển thị huy hiệu khi có yêu cầu đang chờ.

**Tasks** đang ở giai đoạn beta. Tab này hiển thị 30 tác vụ gần nhất của agent trong workspace, kèm agent, model, số token và trạng thái (running, completed, failed hoặc cancelled). Bạn có thể tìm theo tiêu đề, agent hoặc model, lọc theo trạng thái, và mở **Details** để xem tóm tắt, hoạt động và session liên quan của tác vụ. Nội dung thô của tác vụ, prompt và dữ liệu gửi cho tool đều được lược bỏ.

**Approvals** liệt kê các yêu cầu từ agent cần một người quyết định trước khi agent làm tiếp, ví dụ chạy một lệnh shell hay cài một gói. Mỗi yêu cầu hiển thị tóm tắt lệnh, mức rủi ro, thư mục làm việc, quy tắc chính sách đã khớp, lý do và tác động dự kiến mà agent nêu, cùng thời điểm hết hạn.

1. Mở tab **Approvals**. Mặc định tab hiển thị các yêu cầu **Actionable**; chuyển sang **All**, **Pending**, **Approved**, **Denied** hoặc **Expired** khi cần.
2. Chọn **Details** để đọc toàn bộ yêu cầu.
3. Chọn **Approve**, hoặc **Deny** và nhập lý do từ chối.

Mọi quyết định đều được ghi vào nhật ký audit của workspace.

> [!NOTE]
> Yêu cầu phê duyệt chỉ được quyết định trên trang này hoặc bằng lệnh `dewee packages approvals`. Các nút trong cuộc trò chuyện chat không thể phê duyệt yêu cầu.

## Liên quan

- [Nhóm agent và giao việc](/docs/concepts/agent-teams)
- [Tool và quyền hạn](/docs/concepts/tools-and-permissions)
- [Agent](/docs/console/agents)
- [Lịch chạy và workflow](/docs/console/schedules-and-workflows)
- [Tham chiếu CLI](/docs/runtime/cli)
