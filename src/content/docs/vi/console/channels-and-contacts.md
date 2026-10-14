---
title: Kênh, ghép nối và danh bạ
description: Kết nối các nền tảng nhắn tin với agent, quyết định ai được trò chuyện với agent, duyệt người gửi mới trong hộp ghép nối, quản lý danh bạ và tin nhắn đang chờ.
section: console
order: 9
screens: [channels, connectivity, contacts, pending-messages]
updated: 2026-10-14
---

Kênh đưa agent tới đúng nơi khách hàng và đồng nghiệp của bạn đang trò chuyện: Telegram, Zalo, Slack và các ứng dụng nhắn tin khác. Trang này nói về bốn khu vực trong nhóm **Kết nối** của menu: **Kênh**, nơi bạn kết nối nền tảng, **Hộp ghép nối**, nơi bạn duyệt người gửi mới, **Danh bạ**, nơi bạn xem ai đã nhắn tới, và **Tin nhắn đang chờ**, nơi các tin nhắn đang xếp hàng.

## Ai được dùng

| Khu vực | Khoá quyền |
|---|---|
| Kênh, Hộp ghép nối, Tin nhắn đang chờ | `integrations.manage` |
| Danh bạ | `contacts.manage` |

Để thay đổi chính sách ghép nối, bạn còn cần là chủ workspace hoặc admin. Xem [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys).

> [!NOTE]
> Trên bản AaaS, kênh cần gói Annual. Nếu chưa có, trang hiển thị **Kênh nhắn tin đang bị khoá**; hãy nhờ chủ workspace đăng ký trong [Hỗ trợ và thanh toán](/docs/console/support-and-billing). Với Tự cài đặt, để kết nối kênh bạn cần license key do chủ workspace kích hoạt trong console; xem [Tự cài đặt dewee](/docs/get-started/self-install).

## Kênh

Danh sách hiển thị từng kênh kèm nền tảng, trạng thái, trạng thái truy cập và **Agent phụ trách**. Trạng thái truy cập là **Đã kết nối**, **Chờ cấp quyền**, **Đã lưu thông tin xác thực** hoặc **Chưa có thông tin xác thực**. Bạn tìm bằng ô **Tìm kênh**, lọc theo **Nền tảng** hoặc **Trạng thái**, và chọn **Cấu hình** trên một dòng để mở kênh. Dòng của Zalo OA có nút **Kết nối** hoặc **Kết nối lại** thay vào đó.

::shot{id="channels"}

Các nền tảng được hỗ trợ gồm Telegram, Discord, Slack, WhatsApp, Zalo OA, Zalo Bot, Zalo Personal, Feishu/Lark và Bitrix24.

Để kết nối một kênh:

1. Chọn **Kênh mới**.
2. Ở tab **Chung**, nhập **Tên nội bộ** (slug viết thường), **Tên hiển thị**, **Nền tảng** và **Agent sở hữu**, tức agent sẽ trả lời tin nhắn. Công tắc **Bật** quyết định kênh có xử lý tin nhắn hay không.
3. Ở tab **Thông tin xác thực**, dán token của nền tảng, ví dụ bot token lấy từ BotFather với Telegram. Giá trị được lưu ở dạng mã hoá và không hiển thị lại; để trống một trường đã lưu nếu muốn giữ nguyên.
4. Ở tab **Định danh & chính sách**, đặt **Chính sách DM**, **Chính sách nhóm** và **Yêu cầu nhắc tên trong nhóm**. Các tuỳ chọn khác nằm trong **Cài đặt nâng cao theo nền tảng**.
5. Chọn **Kết nối kênh**. Với Zalo OA, nút này là **Tạo & tiếp tục thiết lập**: đăng ký Callback URL và Webhook URL được tạo sẵn trong Zalo, dán webhook secret, rồi cấp quyền cho Official Account.

**Chính sách DM** có các lựa chọn **Yêu cầu ghép nối**, **Mở**, **Chỉ danh sách cho phép** và **Tắt**. **Chính sách nhóm** có **Cần duyệt ghép nối**, **Mở**, **Chỉ danh sách cho phép** và **Tắt**. Ở hầu hết nền tảng, cả hai mặc định là ghép nối; Zalo Personal mặc định là **Chỉ danh sách cho phép**. **Yêu cầu nhắc tên trong nhóm** mặc định được bật. **Cập nhật trạng thái tác vụ** quyết định cách tiến độ tác vụ được gửi tới kênh: **Kế thừa từ agent hoặc workspace**, **Tắt**, **Tiến độ**, **Hoàn tất** hoặc **Cả hai**.

### Các tab của kênh

Mở một kênh để xem mọi tab của nó. **Người quản lý**, **Ngữ cảnh** và **Bộ nhớ thụ động** yêu cầu bạn lưu kênh trước, còn **Hoạt động** chỉ xuất hiện với kênh đã lưu.

- **Chung**, **Thông tin xác thực**, **Định danh & chính sách**: các trường thiết lập ở trên. **Định danh & chính sách** còn có liên kết tới **Hộp ghép nối**, nơi xét duyệt yêu cầu ghép nối, và tới **Danh bạ**.
- **Người quản lý**: chọn một nhóm hoặc chủ đề và một thành viên workspace, rồi chọn **Cấp quyền quản lý**. Người quản lý có thể sửa cài đặt kênh và xem hộp thư ghép nối của nhóm họ quản lý.
- **Ngữ cảnh**: các nhóm và chủ đề mà kênh đã ghi nhận. Một nhóm xuất hiện ở đây khi agent được thêm vào nhóm đó.
- **Bộ nhớ thụ động**: cho phép agent học từ hội thoại trên kênh. Bật **Bật bộ nhớ thụ động**, vốn mặc định tắt. Hãy để **Chế độ duyệt** ở **Duyệt thủ công** để bạn tự duyệt từng mục được trích xuất, hoặc chọn **Tự động lưu**. Bạn cũng đặt được chu kỳ quét, các giới hạn, **Loại thông tin cần ghi nhớ** và **Loại trừ**, rồi chọn **Lưu cài đặt bộ nhớ**. **Chạy trích xuất** bắt đầu một lượt quét ngay. Xem [Bộ nhớ, kho tri thức và lưu trữ](/docs/console/memory-and-knowledge).
- **Gửi phản hồi**: ghi đè cách kênh này gửi phản hồi. Đặt **Xác nhận nhanh** (**Do mô hình tạo**, **Do sidecar tạo**, **Mẫu cố định** hoặc **Tắt**), **Phản hồi trung gian** trong lúc agent dùng công cụ, và **Tách phản hồi cuối** cho câu trả lời dài. Mục nào để **Mặc định của workspace** sẽ theo cài đặt của agent và workspace.
- **Hoạt động**: runtime chưa báo cáo hoạt động theo từng kênh. Dùng [Trace](/docs/console/monitoring) để theo dõi hội thoại.

Chọn **Lưu thay đổi** để lưu kênh. Tắt **Bật** sẽ giữ nguyên cấu hình nhưng kênh ngừng xử lý tin nhắn. **Xoá kênh** thì không hoàn tác được.

> [!WARNING]
> Zalo Personal dùng giao thức không chính thức, nên tài khoản Zalo đăng nhập vào đó có thể bị khoá hoặc cấm. Hãy ưu tiên Zalo OA hoặc Zalo Bot khi có thể.

## Hộp ghép nối

Khi bật ghép nối, một người gửi lạ nhắn trực tiếp cho agent sẽ nhận một mã ngắn thay vì câu trả lời. Yêu cầu nằm trong hộp cho tới khi bạn quyết định hoặc khi nó hết hạn.

::shot{id="connectivity"}

1. Trong **Yêu cầu đang chờ**, kiểm tra các cột **Mã**, **Kênh**, **Người gửi**, **Agent** và **Hết hạn**.
2. Chọn **Duyệt** để cho người gửi trò chuyện với agent, hoặc **Từ chối** để từ chối.
3. Muốn ngắt kết nối một người sau này, tìm họ trong **Người gửi đã kết nối**, chọn **Thu hồi**, rồi **Thu hồi quyền truy cập**. Họ phải yêu cầu ghép nối lại trước khi agent trả lời trực tiếp.

**Chính sách ghép nối** quyết định một lượt duyệt mới có hiệu lực bao lâu. Trong **Phạm vi**, chọn **Workspace** cho cả workspace hoặc **Theo kênh** cho một kênh. Thẻ chính sách cho biết chính sách đang áp dụng và nguồn của nó.

- Đặt **Thời hạn** theo số ngày, hoặc bật **Không hết hạn**, rồi chọn **Lưu chính sách**.
- Với một kênh, chọn **Dùng chính sách của workspace** hoặc **Ghi đè cho kênh này**.
- Ở phạm vi workspace, **Đặt lại về mặc định của nền tảng** gỡ bỏ chính sách của workspace.

Chính sách mới chỉ áp dụng cho các lượt duyệt sau này; người gửi đã ghép nối vẫn giữ thời hạn cũ.

## Danh bạ

**Danh bạ** liệt kê mọi người mà các kênh của bạn đã nhận tin nhắn, với **Tên**, **Nền tảng**, **ID người gửi**, **Kênh**, **Trạng thái** (**Đã liên kết** hoặc **Chưa xác minh**), **Lần cuối hoạt động** và **Loại**. Bạn tìm bằng ô **Tìm theo tên hoặc ID người gửi…**, lọc theo **Nền tảng** hoặc **Loại liên hệ**, và dùng **Làm mới** để tải lại.

::shot{id="contacts"}

Một người thường nhắn tới từ nhiều ứng dụng. Để gộp các danh tính của họ:

1. Đánh dấu các liên hệ thuộc về cùng một người, rồi chọn **Gộp mục đã chọn**.
2. Trong **Gộp danh tính**, ở mục **Gộp vào**, chọn **Một người đã có** rồi chọn người đó, hoặc nhập **ID người**. Hoặc chọn **Một tên mới** và nhập **Tên mới**.
3. Chọn **Gộp**. Lịch sử tin nhắn được giữ nguyên.

Muốn tách ra lại, đánh dấu các liên hệ đó và chọn **Bỏ gộp mục đã chọn**, hoặc chọn **Tách** trên một dòng đã liên kết.

## Tin nhắn đang chờ

**Tin nhắn đang chờ** hiển thị các tin nhắn đang chờ agent xử lý, được nhóm theo cuộc hội thoại. Trong nhóm, đây thường là các tin nhắn gửi trong lúc agent chờ được nhắc tên.

::shot{id="pending-messages"}

Chọn một hàng đợi ở bên trái, hoặc tìm bằng ô **Tìm hàng đợi…**, để đọc tin nhắn. Chọn **Gộp bớt** để thu gọn hàng đợi ngay, hoặc **Xoá**, rồi **Xoá tin nhắn**, để xoá chúng. Tin nhắn đã xoá sẽ không bao giờ tới được agent. Trang này cần runtime đang kết nối.

## Liên quan

- [Kênh chat](/docs/integrations/channels)
- [Agent](/docs/console/agents)
- [Bộ nhớ, kho tri thức và lưu trữ](/docs/console/memory-and-knowledge)
- [Chat và phiên hội thoại](/docs/console/chat-and-sessions)
- [Tham chiếu CLI](/docs/runtime/cli)
