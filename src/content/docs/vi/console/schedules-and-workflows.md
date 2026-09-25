---
title: Lịch chạy và workflow
description: Cho agent chạy theo lịch, xây workflow có phiên bản nối các bước gọi agent, tra cứu tri thức và gửi tin nhắn, xuất bản an toàn và theo dõi từng lần chạy.
section: console
order: 8
screens: [schedules, workflows, workflow-runs]
updated: 2026-09-25
---

Không phải việc nào của agent cũng bắt đầu từ một tin nhắn chat. **Lịch chạy** đánh thức agent vào một thời điểm hoặc theo chu kỳ và giao cho nó một prompt, ví dụ bản tin tổng hợp buổi sáng hay một lần kiểm tra mỗi giờ. **Workflow** đi xa hơn: nối các bước như gọi agent, tra cứu tri thức và gửi tin nhắn thành một chuỗi cố định, có phiên bản, mà bạn chạy thử được trước khi đưa vào sử dụng.

## Ai được dùng

Cả hai khu vực đều cần khoá quyền `tasks.manage`. Với workflow, các thao tác **Publish**, rollback, **Delete**, **Dry run** và chạy lại một lần chạy còn đòi hỏi bạn là chủ workspace hoặc có vai trò Admin; runtime kiểm tra điều này bên cạnh khoá quyền. Xem [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys).

## Lịch chạy

Danh sách hiển thị từng lịch chạy kèm lần chạy kế tiếp, lần chạy gần nhất, người sở hữu và trạng thái (enabled, paused hoặc errored). Bạn có thể tìm theo tên, lọc theo trạng thái và sắp xếp theo lịch, lần chạy kế tiếp, lần chạy gần nhất hoặc người sở hữu. Phần **Recent changes** liệt kê các chỉnh sửa gần đây trên lịch chạy.

::shot{id="schedules"}

Để tạo lịch chạy:

1. Chọn **New schedule** và đặt tên.
2. Nếu muốn, nhập **Agent ID** của agent sẽ chạy lịch này, và đặt **Timezone**, ví dụ `UTC` hoặc `Asia/Ho_Chi_Minh`.
3. Chọn loại lịch:
   - **One-time**: chạy một lần vào ngày giờ ghi ở **Run at**.
   - **Interval**: chạy lặp lại sau mỗi khoảng giây, phút, giờ hoặc ngày.
   - **Advanced expression**: biểu thức cron năm trường, ví dụ `0 9 * * *` để chạy lúc 09:00 mỗi ngày.
4. Viết **Prompt**: việc agent cần làm mỗi khi lịch chạy kích hoạt.
5. Đánh dấu **Stateless runs** nếu muốn mỗi lần chạy bắt đầu mà không mang theo lịch sử của các lần trước. Với lịch chạy một lần, đánh dấu **Delete after one-time run** để tự xoá lịch sau khi đã chạy.
6. Xem phần xem trước **Next runs**, rồi lưu.

Dùng **Toggle** để tạm dừng hoặc chạy lại một lịch. Khi xoá, bạn cần chọn **Delete** thêm một lần nữa. Lần chạy bị lỗi sẽ được tự động thử lại, tối đa ba lần.

## Workflow

Workflow là một tập các bước, gọi là node, chạy từ đầu đến cuối theo thứ tự cố định, có rẽ nhánh ở những chỗ bạn đặt điều kiện. Node có thể gọi agent, tạo tác vụ, tìm trong kho tri thức hoặc đồ thị tri thức, đọc và ghi lưu trữ, xin một người phê duyệt và gửi tin nhắn. Workflow không chạy được mã tuỳ ý, không lặp và không chạy song song. Workflow đang ở giai đoạn beta.

::shot{id="workflows"}

Để xây dựng và xuất bản một workflow:

1. Ở tab **Workflows**, nhập tên, slug và mô tả nếu có, rồi chọn **Create draft**.
2. Mở workflow và sửa **Draft definition (JSON)**. Trang liệt kê các loại node mà runtime của bạn chấp nhận.
3. Chọn **Save draft**, rồi **Validate** để kiểm tra định nghĩa.
4. Chọn **Dry run** để chạy thử. Những bước có thể làm thay đổi dữ liệu đều được giả lập, nên chạy thử là an toàn.
5. Chọn **Publish**. Mỗi lần xuất bản tạo ra một phiên bản mới, cố định; bản nháp vẫn tiếp tục sửa được.
6. Bật workflow bằng **Enable / disable**, hoặc chạy ngay bằng **Run now**.

Việc xuất bản luôn cần một người. Agent có thể soạn nháp, kiểm tra workflow và gửi yêu cầu xuất bản, nhưng chỉ chủ workspace hoặc admin mới duyệt được yêu cầu đó. Người duyệt phải khác người gửi yêu cầu, và bản nháp không được thay đổi kể từ lúc gửi yêu cầu.

Workflow có thể bắt đầu thủ công, theo lịch, từ một agent hoặc từ một tin nhắn trên kênh, với tối đa ba trigger cho mỗi workflow. Chạy thủ công vẫn được khi workflow đang tắt; các trigger khác cần workflow được bật. Muốn huỷ một bản phát hành lỗi, hãy rollback về phiên bản trước. **Delete** xoá workflow vĩnh viễn.

## Lịch sử chạy workflow

Tab **Runs** liệt kê các lần chạy gần đây của các workflow, kèm trạng thái, chế độ, trigger, thời điểm bắt đầu và lỗi nếu có. Một lần chạy có thể ở trạng thái đang chờ, đang chạy, chờ phê duyệt, thành công, thất bại hoặc đã huỷ.

::shot{id="workflow-runs"}

Chọn một lần chạy để xem dòng thời gian các node, phiên bản và dữ liệu đầu vào. Dữ liệu đầu vào và dữ liệu của node được rút gọn và che thông tin nhạy cảm; chọn **Open trace** để xem toàn bộ quá trình chạy trong **Trace**. Khi lần chạy đang diễn ra, bạn có thể chọn **Cancel run**, còn lần chạy thất bại có thể chạy lại bằng **Retry run**.

> [!NOTE]
> Khi có nhiều workflow, tab **Runs** chỉ hiển thị lần chạy của một số workflow đầu tiên. Mở từng workflow để xem đầy đủ các lần chạy của nó.

## Liên quan

- [Workflow](/docs/concepts/workflows)
- [Lịch chạy và heartbeat](/docs/concepts/schedules-and-heartbeat)
- [Nhóm agent và phê duyệt](/docs/console/agent-teams)
- [Mức sử dụng, hoạt động, trace và sức khoẻ runtime](/docs/console/monitoring)
- [Tham chiếu CLI](/docs/runtime/cli)
