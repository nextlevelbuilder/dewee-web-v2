---
title: Cài đặt và sao lưu
description: Điều chỉnh cài đặt runtime và múi giờ mặc định của workspace, xuất hoặc khôi phục dữ liệu, và dùng các trang dành riêng cho owner trên Dedicated và On-Premises.
section: console
order: 13
screens: [settings, backup]
updated: 2026-09-25
---

**Cài đặt** chứa các tuỳ chọn áp dụng cho toàn workspace, từ tin nhắn ghép cặp tới múi giờ mặc định. **Sao lưu & xuất dữ liệu** cho biết dữ liệu của bạn được bảo vệ thế nào theo hình thức triển khai, và nơi yêu cầu xuất hay khôi phục dữ liệu. Trên Dedicated và On-Premises, chủ workspace còn có thêm vài trang để quản lý runtime do chính họ vận hành. Tại Việt Nam, dewee chỉ được triển khai On-Premises, nên bạn sẽ dùng các trang này.

## Ai được dùng

| Khu vực | Ai được dùng |
|---|---|
| Cài đặt | `settings.manage` |
| Sao lưu và xuất dữ liệu | `backup.export` |
| Yêu cầu khôi phục | `backup.restore.request` |
| License binding, System Configuration, Import / Export, Workstations | Chủ workspace, trên Dedicated và On-Premises |

Xem [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys).

## Cài đặt

Trang có bốn phần: **Runtime settings**, **General**, **Access** và **Related**.

::shot{id="settings"}

**Runtime settings** liệt kê những cài đặt mà runtime cho phép một workspace thay đổi, chia theo nhóm:

| Nhóm | Điều chỉnh gì |
|---|---|
| Task status updates | Mặc định gửi tiến độ tác vụ tới kênh: tắt (mặc định), tiến độ, hoàn thành hoặc cả hai. Agent và kênh có thể thu hẹp hoặc ghi đè mặc định này. |
| Pairing messages | Tin nhắn gửi kèm mã ghép cặp cho người gửi mới, và tin nhắn gửi sau khi được duyệt. |
| Text-to-speech | Provider giọng nói, khi nào câu trả lời được đọc thành tiếng, và giọng cùng model cho từng provider. |
| Speech-to-text | Provider chuyển tin nhắn thoại thành văn bản. |
| Skills | Dung lượng tối đa khi tải lên skill và cách lệnh slash tìm skill. |

Mỗi cài đặt cho biết nó đang dùng **Runtime default** hay đã được **Overridden** cho workspace này. Để thay đổi:

1. Sửa giá trị trong nhóm tương ứng.
2. Chọn **Save changes** của nhóm đó.
3. Muốn quay về mặc định, chọn **Reset section**.

Tin nhắn ghép cặp có thể chứa biến thay thế. Tin nhắn yêu cầu hỗ trợ `{{senderId}}`, `{{pairingCode}}` và `{{channel}}`; tin nhắn sau khi duyệt hỗ trợ `{{botName}}`, `{{senderId}}` và `{{channel}}`.

**General** hiển thị workspace ID, phiên bản (SaaS hay tự triển khai), runtime tenant kèm nút **Copy reference**, và trạng thái onboarding. Bạn đặt **Default time zone** ở đây rồi chọn **Save time zone**. Lịch chạy mới, và những thành viên chưa tự chọn múi giờ, sẽ dùng múi giờ này; để trống nếu muốn mỗi người xem theo múi giờ của trình duyệt.

**Access** cho biết vai trò của bạn và số thành viên của workspace, còn **Related** liên kết tới Members, Roles, API keys và Billing.

## Sao lưu

Trang **Sao lưu & xuất dữ liệu** mở đầu bằng phần tóm tắt: hình thức triển khai, chính sách sao lưu, runtime tenant, và endpoint xuất dữ liệu tự phục vụ đã được thiết lập hay chưa. Cách sao lưu hoạt động tuỳ theo hình thức triển khai:

- **Shared SaaS** (không cung cấp tại Việt Nam): việc sao lưu do người vận hành quản lý. Yêu cầu xuất dữ liệu đi qua bộ phận hỗ trợ để người vận hành xác nhận yêu cầu thuộc về workspace của bạn.
- **Dedicated** và **On-Premises**: bạn tự sao lưu. **Export backup** dùng được khi người vận hành đã cấu hình endpoint xuất dữ liệu; trước đó, hãy yêu cầu xuất dữ liệu qua bộ phận hỗ trợ.

::shot{id="backup"}

Phần **Backup preflight** kiểm tra runtime tenant đã kết nối chưa, endpoint xuất dữ liệu đã được cấu hình chưa, và kênh hỗ trợ có sẵn không. Hãy sao chép mã tham chiếu tenant vào yêu cầu của bạn để yêu cầu được xác minh.

Để lấy lại dữ liệu:

1. Chọn **Open restore request**.
2. Điền và gửi yêu cầu.
3. Chờ xem xét. Yêu cầu khôi phục bắt đầu bằng một lần chạy thử (dry run) và cần người vận hành hoặc admin tại chỗ của bạn duyệt trước khi bất kỳ dữ liệu nào bị ghi đè.

> [!WARNING]
> Khôi phục có thể ghi đè dữ liệu của workspace. Hãy chắc chắn đã có một bản sao lưu mới trước khi gửi yêu cầu.

**Export and restore history** liệt kê các lần xuất dữ liệu đã yêu cầu từ trang này.

## Trang của owner trên Dedicated và On-Premises

Trên các hình thức triển khai này, workspace sở hữu runtime của riêng mình, nên owner có thêm bốn trang. Trên Shared SaaS, các trang này hiển thị **Not available in this deployment** vì người vận hành nền tảng chạy runtime; khi đó hãy nhờ bộ phận hỗ trợ nếu cần thay đổi. Mỗi trang cũng chỉ dùng được sau khi onboarding hoàn tất.

- **License binding**: nhập license key thường niên từ đơn hàng của bạn rồi chọn **Bind license to this workspace**. Key chỉ được dùng một lần và không bao giờ hiển thị lại. Việc gắn license xác nhận quyền sử dụng của bạn nhưng không tiêu tốn lượt kích hoạt; mỗi máy chạy runtime vẫn kích hoạt riêng. Với bản tự triển khai, hãy gắn key trong cổng khách hàng được host thay vì ở đây.
- **System Configuration**: cài đặt runtime cho toàn bộ hệ thống triển khai, với các giá trị chứa thông tin xác thực được che.
- **Import / Export**: đưa gói agent, nhóm, skill và MCP vào hoặc ra, có chạy thử trước khi áp dụng bất cứ thay đổi nào.
- **Workstations Admin**: các máy chạy runtime thuộc về workspace.

> [!NOTE]
> Không bao giờ dán license key hay token runtime vào ticket hỗ trợ. License key do người vận hành cung cấp sau khi thanh toán.

## Liên quan

- [Chọn cách triển khai](/docs/get-started/deployment-options)
- [Kích hoạt license](/docs/runtime/licence)
- [Cài đặt và chạy gateway](/docs/runtime/install-and-run)
- [Kênh, ghép cặp và danh bạ](/docs/console/channels-and-contacts)
- [Hỗ trợ và thanh toán](/docs/console/support-and-billing)
