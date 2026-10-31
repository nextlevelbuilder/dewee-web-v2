---
title: Lịch chạy và quy trình
description: Cho agent chạy theo lịch, xây quy trình có phiên bản nối các bước gọi agent, tra cứu tri thức và gửi tin nhắn, xuất bản quy trình và theo dõi từng lượt chạy.
section: console
order: 8
screens: [schedules, workflows, workflow-runs]
updated: 2026-10-14
---

Không phải việc nào của agent cũng bắt đầu từ một tin nhắn chat. **Lịch** gửi một tin nhắn tới agent vào một thời điểm hoặc theo chu kỳ, ví dụ bản tóm tắt buổi sáng hay một lần kiểm tra mỗi giờ. **Workflow** đi xa hơn: nối các bước như gọi agent, tra cứu tri thức và gửi tin nhắn thành một chuỗi có phiên bản, mà bạn chạy thử được trước khi đưa vào sử dụng. Cả hai nằm trong nhóm **Năng lực** của menu.

## Ai được dùng

Cả hai khu vực đều cần khoá quyền `tasks.manage`. Với quy trình, việc tạo, xuất bản, khôi phục phiên bản, bật tắt và xoá còn cần bạn là chủ workspace hoặc admin; runtime kiểm tra điều này bên cạnh khoá quyền. Nếu người khác xuất bản, thao tác đó trở thành một yêu cầu phê duyệt, như mô tả ở phần [Quy trình](#quy-trình). Xem [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys).

## Lịch chạy

Danh sách hiển thị từng lịch chạy kèm **Trạng thái**, **Người tạo**, **Lần chạy tới** và **Lần chạy gần nhất**. Trạng thái là **Đang bật**, **Tạm dừng** hoặc **Bị lỗi**. Các chỉ số phía trên đếm **Lịch chạy**, **Đang bật** và **Lỗi**. Bạn tìm bằng ô **Tìm lịch chạy…** và lọc theo **Trạng thái**.

::shot{id="schedules"}

Để tạo một lịch chạy:

1. Chọn **Tạo lịch chạy**.
2. Nhập **Tên** bằng chữ thường, chữ số và dấu gạch ngang.
3. Chọn **Agent** sẽ chạy lịch này. Nếu bạn không xem được danh sách agent, hãy nhập **ID agent**, hoặc để trống để dùng agent mặc định.
4. Đặt **Múi giờ**. Lịch chạy theo múi giờ này, không phụ thuộc múi giờ của người xem.
5. Trong **Lặp lại**, chọn:
   - **Một lần**: chạy một lần vào ngày giờ ở **Chạy lúc**.
   - **Theo chu kỳ cố định**: chạy **Mỗi** một số **Giây**, **Phút**, **Giờ** hoặc **Ngày**.
   - **Theo lịch**: trong **Chạy vào**, chọn **Hằng giờ**, **Hằng ngày**, **Hằng tuần** hoặc **Tuỳ chỉnh**. **Tuỳ chỉnh** nhận một **Biểu thức cron** năm trường, ví dụ `0 9 * * 1-5` để chạy lúc 09:00 các ngày trong tuần. Các lựa chọn còn lại hiển thị **Lần chạy tiếp theo**.
6. Viết **Tin nhắn**: nội dung agent nhận được mỗi lần lịch chạy.
7. Bật **Chạy không lưu trạng thái** nếu muốn mỗi lần chạy bắt đầu một phiên mới thay vì tiếp tục phiên trước. Bật **Xoá sau khi chạy** để tự xoá lịch sau khi đã chạy. Tắt **Bật** để giữ lịch mà không cho nó chạy.
8. Nếu muốn, trong **Gửi kết quả**, bật **Gửi kết quả đến kênh**, rồi chọn **Kênh** và nhập **Người nhận**: ID cuộc trò chuyện, nhóm hoặc người dùng trên kênh đó. Nếu không gửi, kết quả chỉ lưu trong phiên của lịch chạy.
9. Bật **Kích hoạt heartbeat khi chạy** để kích hoạt heartbeat của agent ngay sau mỗi lần chạy.
10. Kiểm tra phần xem trước các lần chạy sắp tới do runtime xác nhận, rồi chọn **Tạo lịch chạy**.

Trong menu của một dòng, dùng **Tạm dừng** hoặc **Tiếp tục**, **Chạy ngay** để chạy luôn một lần, **Sửa** để thay đổi rồi chọn **Lưu thay đổi**, hoặc **Xoá**. Khi xoá, bạn xác nhận bằng **Xoá lịch chạy**; lịch ngừng chạy ngay lập tức và không thể hoàn tác.

Theo mặc định, một lần chạy theo lịch bị lỗi sẽ được thử lại tối đa ba lần, với thời gian chờ giữa các lần bắt đầu từ 2 giây và tăng gấp đôi, tối đa 30 giây. Cấu hình runtime của bên vận hành có thể thay đổi điều này.

Chọn một lịch chạy để mở chi tiết, gồm bốn tab:

- **Tổng quan**: agent, múi giờ, tin nhắn, tuỳ chọn, cách gửi kết quả và **Lỗi gần nhất** nếu có.
- **Lịch sử chạy**: từng lần chạy với **Bắt đầu**, **Thời lượng**, **Trạng thái**, **Token** và **Kết quả**.
- **Hoạt động**: các thay đổi cấu hình của lịch chạy.
- **Quyền truy cập**: các vai trò được quản lý lịch chạy, kèm **Quản lý vai trò**. Quyền với lịch chạy áp dụng cho toàn workspace.

## Quy trình

Quy trình là một đồ thị gồm các bước, gọi là nút, chạy từ **Bắt đầu** tới **Kết thúc**. Trang **Quy trình** có hai tab: **Quy trình** và **Lượt chạy**.

::shot{id="workflows"}

Tab **Quy trình** liệt kê từng quy trình với **Tên**, **Bật**, **Phiên bản**, **Lần chạy gần nhất** và **Lần chạy tiếp theo**; **Lần chạy tiếp theo** chưa được báo cáo. Bạn tìm bằng ô **Tìm quy trình…**. Công tắc trên mỗi dòng bật hoặc tắt quy trình, còn menu của dòng có **Mở trình chỉnh sửa**, **Chạy ngay**, **Nhân bản**, **Bật** hoặc **Tắt**, và **Xoá**.

Để xây dựng và xuất bản một quy trình:

1. Chọn **Quy trình mới**. Nhập **Tên**, kiểm tra **Slug**, tức mã định danh cố định mà runtime sử dụng, và thêm **Mô tả** nếu muốn.
2. Trong **Bắt đầu từ**, chọn **Khung trống** hoặc **Mẫu cơ bản**, rồi chọn **Tạo và mở trình chỉnh sửa**.
3. Trong trình chỉnh sửa, chọn **Thêm nút** để đặt các bước lên khung vẽ: **Agent**, **Phê duyệt**, **So sánh**, **Điều kiện**, **Gửi tin**, **Gửi nhiều nơi**, **Đồ thị tri thức**, **Công cụ MCP**, **Đọc tệp**, **Ghi tệp**, **Tạo công việc**, **Biến đổi** và **Tìm trong kho**. Chọn một nút để sửa nó trong **Thuộc tính**.
4. Bản nháp tự lưu; thanh công cụ hiển thị **Đang lưu…** và **Đã lưu bản nháp**. Bảng **Kiểm tra** kiểm tra bản nháp đã lưu và liệt kê các lỗi, hoặc báo **Không phát hiện lỗi**. Dùng **Kiểm tra lại** để kiểm tra một lần nữa.
5. Chọn **Xuất bản**. Trong **Xuất bản bản nháp hiện tại**, xác nhận bằng **Xuất bản thành phiên bản** kèm số phiên bản mới. Runtime kiểm tra bản nháp rồi xuất bản thành phiên bản mới; lượt chạy luôn dùng phiên bản đã xuất bản, còn bản nháp vẫn sửa được.
6. Chọn **Chạy thử** để thử phiên bản đã xuất bản. Nhập **Đầu vào** dưới dạng một đối tượng JSON, chọn **Chạy khô** hoặc **Chạy thật**, rồi chọn **Bắt đầu chạy khô** hoặc **Bắt đầu chạy thật**.

Chủ workspace và admin xuất bản trực tiếp. Khi một agent, hoặc một thành viên không phải chủ workspace hay admin, xuất bản quy trình, runtime sẽ tạo một yêu cầu phê duyệt xuất bản thay vì xuất bản ngay. Một người khác với người yêu cầu phải phê duyệt yêu cầu đó, và lượt phê duyệt gắn với bản nháp tại thời điểm yêu cầu: nếu bản nháp thay đổi, lượt phê duyệt bị từ chối. Các yêu cầu này nằm ở tab **Phê duyệt** của trang **Task & phê duyệt**; xem [Nhóm agent và phê duyệt](/docs/console/agent-teams).

> [!WARNING]
> Chạy thật sẽ thực hiện hành động thật: tin nhắn được gửi, tệp và công việc được ghi. Hãy dùng **Chạy khô** trước.

Muốn sửa thiết lập, lược đồ hay trình kích hoạt mà khung vẽ không sửa được, mở **Sửa JSON định nghĩa** trong menu của thanh công cụ. Ngăn **JSON định nghĩa** chứa toàn bộ bản nháp, và **Lưu bản nháp** sẽ thay bản nháp đúng như nội dung đã viết.

**Phiên bản** liệt kê các phiên bản đã xuất bản. Chọn **Quay lại** trên một phiên bản cũ để từ giờ lượt chạy dùng phiên bản đó; bản nháp không thay đổi. Phiên bản đã xuất bản chỉ xem được; chọn **Tạo bản nháp mới** để thay đổi. **Xoá quy trình** xoá quy trình, bản nháp và các phiên bản đã xuất bản, và các trình kích hoạt trỏ tới nó ngừng chạy. Thao tác này không thể hoàn tác.

## Lượt chạy quy trình

Tab **Lượt chạy** liệt kê lượt chạy của mọi quy trình trong workspace, mới nhất trước, với **Quy trình**, **Kích hoạt**, **Trạng thái**, **Bắt đầu** và **Thời lượng**. Bạn tìm bằng ô **Tìm theo quy trình hoặc mã lượt chạy…** và lọc theo **Trạng thái**.

::shot{id="workflow-runs"}

- **Kích hoạt** là **Thủ công**, **Theo lịch**, **Agent** hoặc **Sự kiện kênh**. Lượt chạy bắt đầu từ **Chạy thử** được đánh dấu **Thử**.
- **Trạng thái** là **Đang chờ**, **Đang chạy**, **Chờ phê duyệt**, **Thành công**, **Thất bại** hoặc **Đã huỷ**.

Chọn một lượt chạy để mở nó. Trang hiển thị trạng thái, cách kích hoạt, chế độ, phiên bản và số nút của lượt chạy, rồi tới **Đầu vào và đầu ra**, **Dòng thời gian của nút** và **Các lần thực thi nút**, kèm đầu vào và đầu ra của từng nút. Chọn **Mở trace** để xem toàn bộ quá trình chạy trong [Trace](/docs/console/monitoring), hoặc **Mở quy trình** để về trình chỉnh sửa. Khi lượt chạy đang diễn ra, bạn có thể chọn **Huỷ lượt chạy**. Lượt chạy thất bại có nút **Chạy lại**, bắt đầu một lần thử mới từ đầu với cùng dữ liệu đầu vào.

> [!NOTE]
> Runtime chỉ trả về 50 lượt chạy gần nhất của mỗi quy trình, và khi có nhiều quy trình, tab **Lượt chạy** chỉ gồm các quy trình đầu tiên. Một thông báo sẽ cho biết khi danh sách chưa đầy đủ. Mở một quy trình và xem **Lượt chạy gần đây** để thấy các lượt chạy của riêng nó.

## Liên quan

- [Workflow](/docs/concepts/workflows)
- [Lịch chạy và heartbeat](/docs/concepts/schedules-and-heartbeat)
- [Nhóm agent và phê duyệt](/docs/console/agent-teams)
- [Mức sử dụng, hoạt động, trace và tình trạng runtime](/docs/console/monitoring)
- [Tham chiếu CLI](/docs/runtime/cli)
