---
title: Hỗ trợ và thanh toán
description: Tìm hướng dẫn, mở và theo dõi phiếu hỗ trợ, yêu cầu cài gói runtime, rồi quản lý gói hàng năm, phương thức thanh toán, hoá đơn và hoàn tiền cho workspace.
section: console
order: 14
screens: [support, billing]
updated: 2026-10-14
---

**Hỗ trợ** là nơi bạn nhờ trợ giúp cho workspace của mình: tìm hướng dẫn, mở phiếu hỗ trợ, hoặc yêu cầu cài một gói runtime. **Thanh toán** là nơi workspace dewee AaaS quản lý gói đăng ký, phương thức thanh toán, hoá đơn và hoàn tiền. Trên Dedicated và On-Premises, quyền sử dụng đến từ license thường niên, nên bạn không mua gói nào ở đây.

## Ai được dùng

| Khu vực | Ai được dùng |
|---|---|
| Hỗ trợ, phiếu hỗ trợ và yêu cầu gói | `packages.request` |
| Thanh toán: đăng ký gói, phương thức thanh toán, hoá đơn, cổng thanh toán | `billing.manage` |
| Hoàn tiền | Chỉ chủ workspace, kể cả khi một vai trò tuỳ chỉnh đã cấp `billing.manage` |

Nếu không có `billing.manage`, trang **Thanh toán** hiện **Bạn không có quyền quản lý thanh toán**. Xem [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys).

## Hỗ trợ

Mọi yêu cầu hỗ trợ đều gắn với workspace của bạn. Trang **Hỗ trợ** có các thẻ sau:

- **Chủ đề hướng dẫn**: câu trả lời ngắn cho **Vấn đề truy cập**, **Vấn đề dữ liệu hoặc quyền riêng tư**, **Yêu cầu gói**, **Cấp phát bị kẹt** và **Khoản phí thanh toán bất thường**. Dùng ô **Tìm hướng dẫn…** để lọc.
- **Liên hệ**: cách liên hệ người vận hành, kèm nút **Ticket mới**.
- **Mã tenant**: mã cần ghi khi bạn liên hệ hỗ trợ. Nếu runtime chưa kết nối, hãy gửi workspace ID thay thế.
- **Phiếu gần đây**: các phiếu mới nhất của bạn, kèm **Xem tất cả phiếu**.
- **Gói runtime**: liên kết tới **Mở yêu cầu gói**.

Nếu bản triển khai của bạn chưa thiết lập phiếu hỗ trợ, trang hiện **Chưa dùng được phiếu hỗ trợ**. Khi đó hãy gửi yêu cầu gói hoặc liên hệ trực tiếp người vận hành.

::shot{id="support"}

Không bao giờ dán API key, license key hay token runtime vào phiếu hỗ trợ hoặc tin nhắn.

### Mở phiếu hỗ trợ

1. Ở trang **Hỗ trợ**, chọn **Ticket mới**.
2. Nhập **Chủ đề** (từ 2 đến 160 ký tự) và **Mô tả** (từ 10 đến 4.000 ký tự).
3. Chọn **Gửi phiếu**. Phiếu mở ra ở trang riêng, kèm số phiếu.

**Phiếu hỗ trợ** liệt kê mọi phiếu của workspace, 20 phiếu mỗi trang. Dùng ô **Tìm phiếu…**, lọc theo **Trạng thái** (**Đang mở**, **Đang chờ** hoặc **Đã đóng**) và sắp xếp theo **Mới nhất** hoặc **Cũ nhất**.

Mở một phiếu để đọc **Hội thoại**. Ở đây chỉ hiện các phản hồi dành cho bạn; ghi chú nội bộ của người vận hành không hiện ra. Để trả lời, nhập vào ô **Tin nhắn** trong phần **Trả lời** (tối đa 4.000 ký tự) rồi chọn **Gửi trả lời**. Phiếu đã đóng không nhận trả lời, nên hãy mở phiếu mới nếu bạn cần thêm trợ giúp.

### Yêu cầu cài gói runtime

1. Chọn **Mở yêu cầu gói**.
2. Chọn **Hệ sinh thái**: Python, npm, GitHub binary hoặc Gói hệ thống.
3. Nhập **Tên gói** và, nếu cần, một **Ràng buộc phiên bản**. Để trống ràng buộc nếu muốn dùng bản ổn định mới nhất.
4. Giải thích **Lý do** trong ít nhất 10 ký tự, và thêm **Ghi chú bảo mật** nếu người duyệt cần biết điều gì.
5. Chọn **Gửi yêu cầu**. Người vận hành sẽ xem xét yêu cầu.

Trang cũng cho biết workspace của bạn đã được phép tự cài gói runtime hay chưa, và liệt kê **Hồ sơ chọn lọc hiện tại**. Trên Shared AaaS, gói lấy từ một hồ sơ do người vận hành chọn lọc, nên gửi yêu cầu là cách để có gói mới. Xem [Tool tích hợp, MCP server và hook](/docs/console/tools-mcp-and-hooks).

## Thanh toán

Trên dewee AaaS, một workspace dùng gói miễn phí hoặc **Gói hàng năm** duy nhất, giá $500 mỗi năm. Không có dùng thử miễn phí, và có thời hạn hoàn tiền 14 ngày.

::shot{id="billing"}

> [!NOTE]
> Tên gói, giá, thanh mức sử dụng và thẻ thanh toán trong ảnh chụp là dữ liệu mẫu. dewee AaaS chỉ có một gói hàng năm; xem [Bảng giá](/pricing) để biết giá hiện tại.

Trang có các thẻ sau:

- **Gói hiện tại**: gói và trạng thái, chủ tài khoản thanh toán, giá, ngày **Gia hạn**, các giới hạn và tính năng đi kèm.
- **Phương thức thanh toán**: chọn **Cập nhật trong cổng bảo mật** để thay đổi. Trước khi bạn đăng ký, thẻ này hiện **Chưa có phương thức thanh toán**.
- **Các gói**: so sánh gói miễn phí và **Gói hàng năm**. Gói bạn đang dùng được đánh dấu **Hiện tại**, còn gói hàng năm được đánh dấu **Mở khóa kênh**.
- **Hoá đơn & biên nhận**: chọn **Mở hoá đơn & biên nhận** để tải hoá đơn và biên nhận thanh toán.

### Đăng ký gói

1. Chọn **Đăng ký** trên **Gói hàng năm**.
2. Hoàn tất thanh toán trên trang thanh toán.
3. Khi quay lại console, trang hiển thị **Đang xác nhận gói đăng ký của bạn**. Quyền truy cập được kích hoạt sau khi thanh toán được xác nhận.

Nếu bạn bỏ dở thanh toán, **Tiếp tục checkout** đưa bạn quay lại cho tới khi phiên thanh toán hết hạn. Trang cho biết khi nào phiên thanh toán hết hạn. Kênh cần gói hàng năm: mở **Kênh** khi đang ở gói miễn phí sẽ đưa bạn tới đây, và khi gói đã hoạt động, một liên kết đưa bạn quay về.

### Quản lý gói đăng ký

- **Mở cổng thanh toán** dùng để quản lý gói đang hoạt động.
- **Thanh toán thất bại** nghĩa là bạn nên chọn **Cập nhật thông tin thanh toán** trước khi gói bị tạm ngưng.
- **Đang huỷ** nghĩa là quyền truy cập vẫn còn tới hết kỳ thanh toán hiện tại. Chọn **Đăng ký lại** để tiếp tục.

Khi gói ở trạng thái **Đã tạm ngưng** hoặc **Đã hoàn tiền**, quyền truy cập workspace bị tắt. Trang cho biết dữ liệu của bạn được giữ tới ngày nào trước khi bị xoá theo lịch; chọn **Đăng ký lại** trước ngày đó để giữ lại dữ liệu.

### Yêu cầu hoàn tiền

Chỉ chủ workspace mới thấy thẻ **Hoàn tiền**. Trong thời hạn hoàn tiền, chủ workspace có thể yêu cầu hoàn toàn bộ số tiền:

1. Xem số ngày còn lại trong thẻ **Hoàn tiền**.
2. Chọn **Yêu cầu hoàn tiền** rồi xác nhận.

Khi đã quá thời hạn, thẻ này sẽ báo như vậy.

> [!WARNING]
> Hoàn tiền có hiệu lực ngay lập tức. Chat, API key và phần thiết lập nhà cung cấp của workspace bị tắt ngay khi bạn xác nhận.

### Dedicated và On-Premises

Workspace chạy trên hạ tầng do bạn quản lý hiển thị gói là **Self-hosted**: việc thanh toán đi qua license của bạn chứ không qua trang này. Nút **Mở kích hoạt** trong thẻ **Runtime chuyên dụng** dẫn tới trang **Gắn giấy phép**, nơi chủ workspace gắn license key thường niên. Xem [Cài đặt và sao lưu](/docs/console/settings-and-backup).

## Liên quan

- [Cài đặt và sao lưu](/docs/console/settings-and-backup)
- [Tool tích hợp, MCP server và hook](/docs/console/tools-mcp-and-hooks)
- [Kênh, ghép cặp và danh bạ](/docs/console/channels-and-contacts)
- [Kích hoạt license](/docs/runtime/licence)
- [Chọn cách triển khai](/docs/get-started/deployment-options)
