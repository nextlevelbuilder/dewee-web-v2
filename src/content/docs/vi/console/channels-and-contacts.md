---
title: Kênh, ghép cặp và danh bạ
description: Kết nối các nền tảng nhắn tin với agent, quyết định ai được trò chuyện với agent, duyệt người gửi mới trong hộp ghép cặp, quản lý danh bạ và tin nhắn chờ.
section: console
order: 9
screens: [channels, connectivity, contacts, pending-messages]
updated: 2026-09-25
---

Kênh đưa agent tới đúng nơi khách hàng và đồng nghiệp của bạn đang trò chuyện: Telegram, Zalo, Slack và các ứng dụng nhắn tin khác. Trang này nói về bốn khu vực trong nhóm **Connect** của menu: **Kênh**, nơi bạn kết nối nền tảng, **Hộp ghép cặp**, nơi bạn duyệt người gửi mới, **Danh bạ**, nơi bạn xem ai đã nhắn tới, và **Tin nhắn chờ**, nơi các tin nhắn nhóm đang xếp hàng.

## Ai được dùng

| Khu vực | Khoá quyền |
|---|---|
| Kênh, Hộp ghép cặp, Tin nhắn chờ | `integrations.manage` |
| Danh bạ | `contacts.manage` |

Để thay đổi chính sách hết hạn ghép cặp, bạn còn cần là chủ workspace hoặc admin. Xem [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys).

> [!NOTE]
> Trên bản AaaS, kênh cần gói Annual; nếu chưa có, trang hiển thị banner khoá và chủ workspace đăng ký trong [Hỗ trợ và thanh toán](/docs/console/support-and-billing). Bản AaaS không được cung cấp tại Việt Nam; tại Việt Nam, dewee chạy theo hình thức Tự cài đặt hoặc On-Premises và dùng license key. Với Tự cài đặt, chủ workspace kích hoạt license key trong console để kết nối kênh; xem [Tự cài đặt dewee](/docs/get-started/self-install).

## Kênh

Danh sách hiển thị từng kênh kèm nền tảng, trạng thái bật hay tắt, trạng thái truy cập và agent sở hữu. Trạng thái truy cập là **connected**, **awaiting consent**, **credentials stored** hoặc **no credentials**. Bạn có thể tìm theo tên, nền tảng hoặc agent, lọc theo nền tảng hoặc trạng thái, và dùng **Connect** hoặc **Reconnect** trên dòng cần xử lý.

::shot{id="channels"}

Các nền tảng được hỗ trợ gồm Telegram, Discord, Slack, WhatsApp, Zalo OA, Zalo Bot, Zalo Personal, Feishu/Lark và Bitrix24.

Để kết nối một kênh:

1. Chọn **New channel**.
2. Ở tab **General**, nhập tên (slug viết thường), tên hiển thị, nền tảng và **Owner agent**, tức agent sẽ trả lời tin nhắn.
3. Ở tab **Credentials**, dán token của nền tảng, ví dụ bot token lấy từ BotFather với Telegram. Secret đã lưu luôn được che; để trống một trường nếu muốn giữ giá trị hiện tại.
4. Ở tab **Identity & Policies**, đặt **DM policy** và **Group policy**, và chọn agent có cần được nhắc tên trong nhóm hay không.
5. Chọn **Create & continue setup**, rồi hoàn tất bước đăng nhập của nền tảng nếu có. Với Zalo OA, đăng ký Callback URL và Webhook URL được tạo sẵn trong Zalo, dán webhook secret, rồi cấp quyền cho Official Account.

DM policy và Group policy đều có bốn lựa chọn: **Pairing required**, **Open**, **Allowed list only** và **Disabled**. Cả hai mặc định là ghép cặp, và **Require mention in groups** mặc định được bật. Bạn cũng chọn được cách cập nhật trạng thái tác vụ gửi tới kênh: kế thừa, tắt, tiến độ, hoàn thành hoặc cả hai.

Sau khi kênh được tạo, ba tab nữa sẽ mở ra. **Managers** giao một thành viên workspace làm người quản lý cho một nhóm hoặc topic mà kênh đã ghi nhận, **Contexts** liệt kê các nhóm và topic đó, còn **Passive Memory** cho phép agent học từ hội thoại trên kênh. Passive memory mặc định tắt; hãy giữ **Require review before saving** bật để bạn tự duyệt từng mục được trích xuất. Xem [Bộ nhớ, kho tri thức và lưu trữ](/docs/console/memory-and-knowledge).

Tắt một kênh sẽ giữ nguyên cấu hình nhưng kênh ngừng xử lý tin nhắn. Xoá kênh thì không hoàn tác được.

> [!WARNING]
> Zalo Personal dùng giao thức không chính thức, nên tài khoản Zalo đăng nhập vào đó có thể bị khoá hoặc cấm. Hãy ưu tiên Zalo OA hoặc Zalo Bot khi có thể.

## Hộp ghép cặp

Khi bật ghép cặp, một người gửi lạ nhắn trực tiếp cho agent sẽ nhận một mã ngắn thay vì câu trả lời. Yêu cầu nằm ở đây cho tới khi bạn quyết định. Mỗi mã có hiệu lực trong 60 phút.

::shot{id="connectivity"}

1. Trong **Pending approvals**, kiểm tra mã, kênh, người gửi và agent.
2. Chọn **Approve** để cho người gửi trò chuyện với agent, hoặc **Deny** để từ chối.
3. Muốn ngắt kết nối một người sau này, tìm họ trong **Connected senders** và chọn **Revoke**.

Chính sách ghép cặp quyết định một lượt duyệt mới có hiệu lực bao lâu. Bạn đặt chính sách cho cả workspace, hoặc chọn **Channel override** cho riêng một kênh. Chọn số ngày (mặc định 30) hoặc **No expire**, rồi chọn **Save policy**. **Use inherited policy** gỡ bỏ chính sách riêng của kênh. Chính sách mới chỉ áp dụng cho các lượt duyệt sau này; người gửi đã ghép cặp vẫn giữ thời hạn cũ.

## Danh bạ

**Danh bạ** liệt kê mọi người mà các kênh của bạn đã nhận tin nhắn: người dùng, nhóm và topic, kèm nền tảng, sender ID, kênh, trạng thái và lần cuối xuất hiện. Bạn có thể tìm theo username, tên hiển thị hoặc sender ID, và lọc theo nền tảng hoặc loại liên hệ.

::shot{id="contacts"}

Một người thường nhắn tới từ nhiều ứng dụng. Để gộp các danh tính của họ:

1. Đánh dấu các liên hệ thuộc về cùng một người.
2. Nhập user ID của một người đã có, hoặc để trống và nhập tên hiển thị để tạo người mới.
3. Chọn **Merge selected**.

Muốn tách ra lại, đánh dấu các liên hệ đó và chọn **Unmerge selected**.

## Tin nhắn chờ

Trong nhóm, agent thường chờ tới khi được nhắc tên. Tin nhắn gửi trong lúc đó được xếp hàng ở đây, gom theo hội thoại, và agent đọc chúng làm ngữ cảnh ở lần được nhắc tên tiếp theo. Runtime tự tóm tắt các hàng đợi dài.

::shot{id="pending-messages"}

Chọn một hàng đợi ở bên trái để đọc tin nhắn. Chọn **Compact** để tóm tắt hàng đợi ngay, hoặc **Delete** để xoá sau một bước xác nhận. Trang này cần runtime đang kết nối.

## Liên quan

- [Kênh chat](/docs/integrations/channels)
- [Agent](/docs/console/agents)
- [Bộ nhớ, kho tri thức và lưu trữ](/docs/console/memory-and-knowledge)
- [Chat và phiên hội thoại](/docs/console/chat-and-sessions)
- [Tham chiếu CLI](/docs/runtime/cli)
