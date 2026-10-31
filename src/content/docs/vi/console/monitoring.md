---
title: Mức sử dụng, hoạt động, trace và tình trạng runtime
description: Xem mức sử dụng và chi phí, ai đã thay đổi điều gì, soi từng lần chạy của agent qua trace, và kiểm tra tình trạng runtime của workspace có ổn định không.
section: console
order: 11
screens: [usage, activity, traces, monitoring]
updated: 2026-10-14
---

Khi agent đã chạy, bốn khu vực cho bạn thấy chúng làm gì. **Mức sử dụng** đếm số yêu cầu, số token và chi phí ước tính. **Hoạt động** là lịch sử các thay đổi trong workspace. **Trace** ghi lại chi tiết mọi lần chạy của agent. **Tình trạng runtime** cho biết runtime của bạn có kết nối được và đang hoạt động tốt hay không. Cả bốn khu vực chỉ hiển thị dữ liệu của chính workspace bạn.

## Ai được dùng

Cả bốn khu vực đều cần khoá quyền `observability.read`. Chủ workspace và vai trò Admin có sẵn giữ khoá này; với Member, bạn cấp qua một vai trò tuỳ chỉnh. Xem [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys).

## Mức sử dụng

**Mức sử dụng** mở đầu bằng các số tổng của khoảng thời gian đã chọn: **Yêu cầu**, **Token**, **Chi phí ước tính** và **Tỷ lệ lỗi**. Tiếp theo là biểu đồ **Yêu cầu theo thời gian** và một bảng chia nhỏ các số tổng.

::shot{id="usage"}

1. Chọn khoảng ngày. Trang mở với 30 ngày gần nhất, và một khoảng có thể dài tới 366 ngày. Các mốc thời gian tính theo UTC.
2. Chọn **Nhóm theo**: **Agent**, **Nhà cung cấp**, **Mô hình** hoặc **Kênh**.
3. Nếu cần, thu hẹp về một agent bằng ô **Tất cả agent**, hoặc mở **Bộ lọc** để khớp chính xác ID agent, provider, model hoặc kênh.
4. Đọc bảng: **Yêu cầu**, **Lượt gọi LLM**, **Lượt gọi công cụ**, **Lỗi**, **Token**, **Bộ nhớ đệm**, **Thời lượng TB** và **Chi phí ước tính** cho từng dòng.
5. Chọn **Xuất CSV** để tải xuống cùng dữ liệu đó.

Mức sử dụng lấy từ dữ liệu tổng hợp theo giờ, nên số liệu mới nhất có thể trễ một đến hai giờ. Trang cho biết dữ liệu được cập nhật lúc nào, và hiện banner **Mức sử dụng bị trễ** khi bản tổng hợp mới nhất chưa về. Mức sử dụng chỉ chứa số liệu tổng hợp, không bao giờ chứa prompt hay phản hồi.

> [!NOTE]
> **Chi phí ước tính** là con số ước tính, không phải hoá đơn. Hoá đơn của chính nhà cung cấp mới là căn cứ cho số tiền bạn phải trả.

## Hoạt động

**Hoạt động** liệt kê những gì người dùng và agent đã thay đổi trong workspace, mới nhất ở trên cùng. Mỗi mục cho biết thời điểm, tác nhân, tài nguyên và một trạng thái: **Thành công**, **Đã thay đổi**, **Cần chú ý** hoặc **Đã ghi nhận**.

::shot{id="activity"}

1. Tìm bằng ô **Tìm hành động, tác nhân, tài nguyên hoặc mã trace…**.
2. Lọc theo **Thời gian** (**Hôm nay**, **7 ngày qua**, **30 ngày qua** hoặc **Khoảng tuỳ chọn**), **Tác nhân**, **Tài nguyên**, **Hành động**, **Trạng thái** hoặc **Mức độ** (**Thành công**, **Thông tin**, **Cảnh báo** hoặc **Lỗi**).
3. Đổi **Chế độ xem** từ **Danh sách** sang **Phân tách** để đếm các mục thay vì liệt kê.
4. Chọn **Xem hoạt động cũ hơn** để tải thêm về trước.

Chọn một mục để mở chi tiết **Sự kiện hoạt động**, gồm **Mã định danh**, **Siêu dữ liệu** và các liên kết **Liên quan** tới trace, lượt chạy hoặc phiên đứng sau nó.

## Trace

Trace là bản ghi đầy đủ của một lần chạy agent: mọi lần gọi model, gọi tool, hook và sự kiện, kèm thời gian và token. Trang **Trace** liệt kê các trace kèm số trace khớp bộ lọc và, với trang hiện tại, số lỗi, token và chi phí. Các cột gồm **Trace**, **Tên**, **Agent**, **Kênh**, **Bắt đầu**, **Thời lượng**, **Trạng thái**, **Span**, **Token** và **Chi phí**.

::shot{id="traces"}

Để tìm một lần chạy:

1. Tìm theo tên, mã trace hoặc phiên, hoặc lọc theo trạng thái (**Hoàn tất**, **Lỗi**, **Đang chạy** hoặc **Đã huỷ**), **Agent**, **Phiên**, **Kênh**, **Công cụ** và **Khoảng thời gian**.
2. Dùng **Chỉ lỗi** hoặc **Có gọi công cụ** để thu hẹp thêm.
3. Sắp xếp theo các cột và đặt **Số dòng mỗi trang** (mặc định 25, tối đa 200).
4. Bật **Theo dõi trực tiếp** để kiểm tra trace mới mỗi 30 giây.

Trace nền, như việc của bộ nhớ kênh và đồ thị tri thức, mặc định bị ẩn; bật **Hiện trace nền** để xem cả chúng. Dùng **Chế độ xem** để lưu bộ lọc hiện tại trên thiết bị này và dùng lại sau.

Chọn một trace để xem nhanh, hoặc **Mở trang đầy đủ** để xem toàn bộ chi tiết. Phần đầu trang cho biết trạng thái, thời lượng, token và chi phí của lần chạy, cùng **Sao chép mã trace**, **Chia sẻ liên kết**, **Xuất JSON** và **Mở phiên**. Nếu lần chạy thất bại, nguyên nhân gốc được hiển thị trước tiên. Bên dưới là ba tab:

- **Tổng quan**: hội thoại, **Dòng thời gian** của các span được phân loại thành LLM, Tool, Agent, Hook hoặc Sự kiện, và **Tóm tắt tool** với số lượt gọi, số lỗi và thời lượng trung bình của từng tool.
- **Sự kiện và nhật ký**: các sự kiện quyết định và gửi tin, cùng **Lượt thực thi hook**, tức các hook đã chạy trong trace.
- **JSON thô**: dữ liệu của trace, kèm **Gói hỗ trợ đã ẩn danh**.

Các giá trị trong trace có thể được ẩn trước khi tới trình duyệt của bạn; span có giá trị bị ẩn sẽ được đánh dấu. Khi cần hỗ trợ về một lần chạy, hãy sao chép **Gói hỗ trợ đã ẩn danh** và gửi cho bộ phận hỗ trợ: prompt gốc, tham số tool, header và secret đều bị loại bỏ hoặc ẩn đi.

## Tình trạng runtime

**Tình trạng runtime** kiểm tra runtime của workspace mà không để lộ các máy chủ phía sau. Các chỉ số cho biết **Kết nối được runtime**, **Tỷ lệ lỗi gần đây** trên các trace gần nhất và **Tín hiệu gần nhất**, tức trace hoặc hoạt động mới nhất.

::shot{id="monitoring"}

Thẻ **Trạng thái runtime** hiển thị **Tình trạng**, là **Ổn định**, **Cần chú ý** hoặc **Ngoại tuyến**, cùng khu vực, phiên bản, thời gian hoạt động, trạng thái thiết lập và **Mã tham chiếu hỗ trợ**. Tình trạng được tổng hợp từ việc console có kết nối được runtime không, workspace đã được kết nối chưa và kết quả của các trace gần đây. Bên dưới là:

- **Kết nối và ghép nối**: **Kết nối workspace**, **Danh tính đã ghép nối** và **Đang chờ ghép nối**, kèm liên kết tới **Hộp thư ghép nối**.
- **Năng lực xử lý**: thời lượng chạy trung bình trong 24 giờ qua. Dữ liệu tổng hợp theo giờ có thể trễ một đến hai giờ.
- **Tín hiệu hoạt động**: số yêu cầu mỗi giờ trong 24 giờ qua.
- **Dữ liệu nào rời khỏi runtime**: những tín hiệu đã được ẩn thông tin, chỉ thuộc workspace, mà trang này sử dụng.
- **Hoạt động gần đây**, với **Xem tất cả** để mở trang Hoạt động.

Banner **Runtime cần chú ý** xuất hiện khi ít nhất 10% trace gần đây bị lỗi, và **Runtime đang ngoại tuyến** khi runtime không phản hồi.

> [!WARNING]
> Nếu workspace chưa được kết nối với runtime, các trang runtime chưa hiển thị được dữ liệu trực tiếp. Hãy hoàn tất thiết lập, hoặc phê duyệt yêu cầu ghép nối đang chờ, trước đã.

## Liên quan

- [Tracing](/docs/concepts/tracing)
- [Chat và phiên hội thoại](/docs/console/chat-and-sessions)
- [Provider và model](/docs/console/providers-and-models)
- [Hỗ trợ và thanh toán](/docs/console/support-and-billing)
- [Secret, vai trò và nhật ký kiểm toán](/docs/security/secrets-roles-and-audit)
