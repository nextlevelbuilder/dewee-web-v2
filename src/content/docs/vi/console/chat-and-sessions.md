---
title: Chat và phiên hội thoại
description: Trò chuyện với agent trong console, đính kèm file, theo dõi tool call khi agent chạy và xem lại hội thoại cũ ở chế độ chỉ đọc, đã che dữ liệu nhạy cảm.
section: console
order: 2
screens: [chat, sessions]
updated: 2026-09-25
---

**Chat** là cách nhanh nhất để làm việc với một agent: bạn gõ tin nhắn, agent trả lời, và bạn thấy được những tool mà agent dùng trong lúc xử lý. **Phiên hội thoại** là nơi lưu mọi cuộc trò chuyện của các agent, cả từ console lẫn từ các kênh chat đã kết nối, để bạn kiểm tra ai đã nói gì và trace nào thuộc về cuộc trò chuyện đó.

## Ai được dùng

| Khu vực | Khoá quyền | Cho phép |
|---|---|---|
| Chat | `chat.use` | Gửi tin nhắn cho agent từ console |
| Phiên hội thoại | `sessions.read` | Xem danh sách session và mở chi tiết session |

Chủ workspace và vai trò Admin có sẵn giữ cả hai khoá quyền. Với Member, bạn cấp quyền qua một vai trò tuỳ chỉnh; xem [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys). Nếu thiếu `sessions.read`, Chat vẫn hoạt động nhưng thanh bên không liệt kê được các session trước đó.

## Chat với agent

Trang Chat có ba phần: bên trái là bộ chọn agent và danh sách session của bạn, ở giữa là luồng tin nhắn, bên dưới là ô soạn tin. Trong lúc agent làm việc, luồng tin nhắn hiển thị từng tool call kèm tham số, kết quả và trạng thái (đang chờ, đang chạy, xong, lỗi hoặc đã dừng), cùng số token đầu vào và đầu ra của câu trả lời.

::shot{id="chat"}

Để bắt đầu một cuộc trò chuyện:

1. Mở **Chat** và chọn một agent. Workspace mới luôn có sẵn super-agent được tạo trong lúc thiết lập.
2. Gõ tin nhắn. Nhấn Enter để gửi, Shift+Enter để xuống dòng.
3. Muốn gửi kèm file, dùng **Attach files**. Nếu trình duyệt cho phép, bạn cũng có thể ghi âm tin nhắn thoại.
4. Theo dõi câu trả lời hiện dần ra. Mở rộng một tool call để xem tham số và kết quả của nó.

Để tiếp tục cuộc trò chuyện cũ, hãy chọn nó trong danh sách session. Dùng **New** để bắt đầu session mới với cùng agent.

### Đổi tên, xoá lịch sử hoặc xoá session

Mở menu thao tác cạnh một session ở thanh bên của Chat:

- **Rename**: đặt tên dễ nhận ra cho session. Để trống nếu muốn bỏ tên.
- **Reset history**: xoá các tin nhắn nhưng giữ lại session.
- **Delete**: xoá session cùng toàn bộ lịch sử.

> [!WARNING]
> Reset history và Delete xoá tin nhắn vĩnh viễn. Không có cách hoàn tác.

## Xem danh sách phiên hội thoại

**Phiên hội thoại** liệt kê mọi cuộc trò chuyện trong workspace, kèm kênh, số tin nhắn, model, token đầu vào và đầu ra, và thời điểm hoạt động gần nhất. Bạn có thể lọc theo kênh, sắp xếp theo lần cập nhật gần nhất hoặc theo số tin nhắn, và chọn số dòng hiển thị. Mỗi dòng có đường dẫn tới các trace được ghi lại cho session đó.

::shot{id="sessions"}

Nếu danh sách trống nghĩa là chưa có cuộc trò chuyện nào: hãy bắt đầu một cuộc chat, nó sẽ xuất hiện ở đây. Nếu runtime chưa kết nối, trang sẽ báo rõ thay vì hiện dữ liệu cũ.

## Chi tiết session

Chọn một session để mở trang chi tiết. Trang hiển thị session key, tổng số token, dòng thời gian gồm tin nhắn và sự kiện, các tool call và lỗi, cùng danh sách trace ID liên quan, kèm đường dẫn mở chúng trong **Trace**.

Trang chi tiết chỉ cho xem và đã được che dữ liệu nhạy cảm trước khi tới trình duyệt của bạn:

- API key của runtime, key của provider (ví dụ key dạng `sk-`) và bearer token đều bị che.
- Các trường bí mật thường gặp trong tham số tool, như `api_key`, `authorization` và `token`, đều bị che.
- Chỉ hiển thị 200 tin nhắn gần nhất.
- Session thuộc workspace khác, hoặc không tồn tại, sẽ trả về "Session not found" mà không kèm nội dung nào.

## Khi chưa chat được

- **Agent not ready**: super-agent chưa được tạo. Hãy hoàn tất thiết lập từ **Tổng quan**.
- **No active agents**: không có agent nào trong workspace đang hoạt động. Kiểm tra trạng thái của chúng ở **Agent**.
- **Runtime is not reachable**: chờ một lúc rồi tải lại trang, sau đó kiểm tra **Sức khoẻ runtime**.

> [!NOTE]
> Workspace On-Premises, hình thức được cung cấp tại Việt Nam, không có mục thanh toán hay hoàn tiền. Trên workspace SaaS, việc hoàn tiền sẽ tắt chat, API key và thiết lập provider; xem [Hỗ trợ và thanh toán](/docs/console/support-and-billing).

## Liên quan

- [Agent](/docs/console/agents)
- [Mức sử dụng, hoạt động, trace và sức khoẻ runtime](/docs/console/monitoring)
- [Vòng lặp agent](/docs/concepts/agent-loop)
- [Tracing](/docs/concepts/tracing)
- [Tổng quan API](/docs/api/overview)
