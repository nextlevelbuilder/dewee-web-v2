---
title: Chat và phiên hội thoại
description: Trò chuyện với agent, đính kèm tệp, theo dõi lệnh gọi công cụ, quyết định yêu cầu của agent ngay trong cuộc trò chuyện và xem lại các phiên cũ.
section: console
order: 2
screens: [chat, sessions]
updated: 2026-10-14
---

**Trò chuyện** là cách nhanh nhất để làm việc với một agent: bạn gõ tin nhắn, agent trả lời, và bạn thấy được những công cụ mà agent dùng trong lúc xử lý. **Phiên** là nơi lưu mọi cuộc trò chuyện của các agent, cả từ console lẫn từ các kênh đã kết nối, để bạn kiểm tra ai đã nói gì và trace nào thuộc về cuộc trò chuyện đó.

## Ai được dùng

| Khu vực | Khoá quyền | Cho phép |
|---|---|---|
| Trò chuyện | `chat.use` | Gửi tin nhắn cho agent từ console |
| Phiên | `sessions.read` | Xem danh sách phiên và mở chi tiết phiên |

Chủ workspace và vai trò Admin có sẵn giữ cả hai khoá quyền. Với Member, bạn cấp quyền qua một vai trò tuỳ chỉnh; xem [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys). Nếu thiếu `sessions.read`, Trò chuyện vẫn hoạt động nhưng thanh bên không liệt kê được các cuộc trò chuyện trước đó.

## Trò chuyện với agent

Trang Trò chuyện có bộ chọn agent và danh sách cuộc trò chuyện của bạn ở bên trái, luồng tin nhắn ở giữa và ô soạn tin ở bên dưới. Bộ chọn liệt kê các agent đang hoạt động mà bạn được trò chuyện, với super agent đứng đầu. Trong lúc agent làm việc, luồng tin nhắn hiển thị từng lệnh gọi công cụ kèm **Tham số**, **Kết quả** và trạng thái (**Đang chờ**, **Đang chạy…**, **Xong**, **Thất bại** hoặc **Đã dừng**), cùng số token đầu vào và đầu ra của mỗi câu trả lời. **Hoạt động của lượt chạy** mở một bảng bên cạnh với các lệnh gọi công cụ và hoạt động của lượt chạy.

::shot{id="chat"}

Để bắt đầu một cuộc trò chuyện:

1. Mở **Trò chuyện** và chọn một agent. Workspace mới luôn có sẵn super agent được tạo trong lúc thiết lập. Bạn cũng có thể mở Trò chuyện từ nút **Trò chuyện** của một agent trên trang [Agent](/docs/console/agents).
2. Gõ tin nhắn. Nhấn Enter để gửi, Shift+Enter để xuống dòng.
3. Muốn gửi kèm tệp, dùng **Đính kèm tệp**. Nếu trình duyệt cho phép, bạn cũng có thể **Ghi âm tin nhắn thoại**.
4. Theo dõi câu trả lời hiện dần ra. Mở rộng một lệnh gọi công cụ để xem tham số và kết quả. Dùng **Dừng tạo câu trả lời** để dừng câu trả lời.

Để tiếp tục cuộc trò chuyện cũ, hãy chọn nó trong danh sách. Dùng **Tải tin nhắn cũ hơn** để xem lại xa hơn. Chọn **Cuộc trò chuyện mới** để bắt đầu cuộc mới với cùng agent.

### Đổi tên, đặt lại hoặc xoá cuộc trò chuyện

Mở menu thao tác cạnh một cuộc trò chuyện ở thanh bên của Trò chuyện:

- **Đổi tên**: đặt tên dễ nhận ra cho cuộc trò chuyện. Để trống nếu muốn bỏ tên.
- **Đặt lại cuộc trò chuyện**: xoá mọi tin nhắn nhưng giữ lại cuộc trò chuyện.
- **Xoá**: xoá cuộc trò chuyện cùng toàn bộ lịch sử của nó với mọi người.

> [!WARNING]
> Đặt lại cuộc trò chuyện và Xoá sẽ xoá tin nhắn vĩnh viễn. Không có cách hoàn tác.

### Phê duyệt yêu cầu ngay trong cuộc trò chuyện

Khi agent xin chạy một lệnh hoặc cài một gói, yêu cầu hiện trong cuộc trò chuyện dưới dạng thẻ có **Phê duyệt** và **Từ chối**. Thẻ này chính là yêu cầu bạn thấy ở tab **Phê duyệt** của [Tác vụ & phê duyệt](/docs/console/agent-teams), nên áp dụng cùng quyền hạn.

- Với thao tác có tính phá huỷ, hãy nhập tên tài nguyên để xác nhận trước khi phê duyệt.
- **Từ chối** yêu cầu nhập lý do; chọn **Từ chối yêu cầu** để gửi.

Khi yêu cầu đã được quyết định, hoặc không còn chờ nữa, thẻ hiển thị kết quả và không còn nút.

## Xem danh sách phiên

**Phiên** liệt kê mọi cuộc trò chuyện trong workspace, từ Trò chuyện và từ các kênh đã kết nối. Các thẻ ở đầu trang cho biết số phiên, tin nhắn, token và số phiên **Đang hoạt động**. Mỗi dòng hiển thị **Phiên**, **Agent**, **Kênh**, **Model**, **Tin nhắn**, **Token vào/ra**, **Trace** và thời điểm **Cập nhật**.

::shot{id="sessions"}

- Lọc theo **Kênh** và chọn 10, 25 hoặc 50 dòng mỗi trang.
- Sắp xếp theo **Cập nhật gần nhất**, **Tạo mới nhất** hoặc **Nhiều tin nhắn nhất**.
- Tìm theo khoá phiên, agent hoặc model.

Tìm kiếm và sắp xếp chỉ áp dụng cho trang đang tải, không phải toàn bộ lịch sử.

Nếu danh sách trống nghĩa là chưa ai nhắn tin cho agent; chọn **Mở trò chuyện** để bắt đầu. Nếu không kết nối được runtime, trang sẽ báo rõ thay vì hiện dữ liệu cũ.

## Chi tiết phiên

Chọn một phiên để mở trang chi tiết. Trang hiển thị agent, kênh, model, nhà cung cấp, trạng thái, khoá phiên, số tin nhắn, token vào và ra, cùng thời điểm tạo và cập nhật. Tiếp theo là **Thông tin phiên** và **Trace liên quan**, kèm **Mở trace** để xem chúng trong [Trace](/docs/console/monitoring).

Dòng thời gian tin nhắn gắn nhãn mỗi mục là **Người dùng**, **Trợ lý**, **Gọi công cụ** hoặc **Hệ thống**. Chuyển **Chế độ xem tin nhắn** giữa **Văn bản thô** và **Đã định dạng**.

Trang chi tiết chỉ cho xem:

- Dữ liệu của lệnh gọi công cụ được giới hạn kích thước và che dữ liệu nhạy cảm trước khi tới trình duyệt của bạn.
- Phiên dài sẽ báo "Đang hiển thị 200 tin nhắn gần nhất."
- Phiên thuộc workspace khác, hoặc không tồn tại, sẽ hiện "Không tìm thấy phiên" mà không kèm nội dung nào.

## Khi chưa trò chuyện được

- **Chưa thể trò chuyện**: hãy hoàn tất thiết lập workspace. Kết nối một nhà cung cấp và tạo agent đầu tiên ở **Tổng quan**.
- **Chưa có agent để trò chuyện**: mọi agent trong workspace đã bị xoá hoặc tạm dừng. Chọn **Tạo agent**, hoặc cho một agent tiếp tục ở trang [Agent](/docs/console/agents).
- **Runtime đang ngoại tuyến**: các agent không thể phản hồi khi không kết nối được runtime. Chọn **Kiểm tra lại**, hoặc mở **Tình trạng runtime**.

> [!NOTE]
> Trên dewee AaaS, quyền truy cập workspace, kể cả trò chuyện, còn phụ thuộc vào gói đăng ký. Xem [Hỗ trợ và thanh toán](/docs/console/support-and-billing).

## Liên quan

- [Agent](/docs/console/agents)
- [Mức sử dụng, hoạt động, trace và sức khoẻ runtime](/docs/console/monitoring)
- [Vòng lặp agent](/docs/concepts/agent-loop)
- [Tracing](/docs/concepts/tracing)
- [Tổng quan API](/docs/api/overview)
