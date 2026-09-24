---
title: Hỗ trợ và thanh toán
description: Mở ticket hỗ trợ, yêu cầu cài runtime package và liên hệ người vận hành; hiểu trang Thanh toán trên SaaS và cách gắn license khi chạy On-Premises tại Việt Nam.
section: console
order: 14
screens: [support, billing]
updated: 2026-09-25
---

**Hỗ trợ** là nơi bạn nhờ trợ giúp cho workspace của mình: mở ticket, yêu cầu cài một runtime package, hoặc tìm cách liên hệ người vận hành. **Thanh toán** là nơi workspace SaaS quản lý gói đăng ký, hoá đơn và hoàn tiền. Tại Việt Nam, dewee chỉ được triển khai On-Premises: quyền sử dụng đến từ license thường niên mà bạn gắn vào workspace, nên bạn không mua gói nào trên trang này.

## Ai được dùng

| Khu vực | Ai được dùng |
|---|---|
| Hỗ trợ, ticket và yêu cầu package | `packages.request` |
| Thanh toán: đăng ký gói, hoá đơn, cổng thanh toán | `billing.manage`, chỉ trên SaaS |
| Hoàn tiền | Chỉ chủ workspace, kể cả khi một vai trò tuỳ chỉnh đã cấp `billing.manage` |

Xem [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys).

## Hỗ trợ

Mọi yêu cầu hỗ trợ đều gắn với workspace của bạn. Trang có năm phần: **How support works**, **Support tickets**, **New package request**, **Contact your operator** và **When to open a request**.

::shot{id="support"}

### Mở ticket

Hãy mở ticket khi gặp vấn đề về tài khoản, runtime, quyền riêng tư, thanh toán hoặc quá trình khởi tạo workspace.

1. Ở trang **Hỗ trợ**, chọn **New ticket**.
2. Nhập **Subject** (từ 2 đến 160 ký tự) và **Description** (từ 10 đến 4.000 ký tự).
3. Chọn **Create ticket**. Ticket mở ra ở trang riêng, kèm số ticket.

**Open ticket center** liệt kê mọi ticket của workspace, 20 ticket mỗi trang. Bạn có thể tìm kiếm, lọc theo trạng thái (**Opened**, **Pending** hoặc **Closed**) và sắp xếp từ mới tới cũ hoặc ngược lại. Mở một ticket để đọc **Conversation** và gửi **Reply**. Ở đây chỉ hiện các phản hồi dành cho khách hàng; ghi chú nội bộ của người vận hành không hiện ra.

Nếu hình thức triển khai của bạn chưa thiết lập ticket center, phần này sẽ báo như vậy. Khi đó hãy gửi yêu cầu package hoặc liên hệ trực tiếp người vận hành.

**When to open a request** liệt kê những lý do thường gặp: thiếu một package, một thành viên không vào được tính năng lẽ ra họ dùng được, onboarding đứng ở trạng thái "Pending" quá 10 phút, một khoản phí không khớp với gói hoặc mức sử dụng, hay một câu hỏi về dữ liệu và quyền riêng tư.

### Yêu cầu cài runtime package

1. Chọn **Open package request**.
2. Chọn **Ecosystem**: Python, npm, GitHub binary hoặc System package.
3. Nhập **Package name** và, nếu cần, một **Version constraint** như `1.x` hoặc `latest`.
4. Giải thích **Reason** trong ít nhất 10 ký tự, và thêm **Security notes** nếu người duyệt cần biết điều gì.
5. Chọn **Submit request**. Người vận hành sẽ xem xét yêu cầu.

Trang cũng cho biết workspace của bạn đã được phép tự cài runtime package hay chưa, và liệt kê **Current curated profile**. Trên SaaS, package lấy từ một bộ do người vận hành tuyển chọn, nên gửi yêu cầu là cách để có package mới. Xem [Tool tích hợp, MCP server và hook](/docs/console/tools-mcp-and-hooks).

### Liên hệ người vận hành

Với sự cố khẩn cấp, câu hỏi về thanh toán hay những việc nằm ngoài phần tự phục vụ, hãy liên hệ người vận hành qua kênh họ đã cung cấp khi onboarding. Phần này hiển thị mã **Runtime tenant** của bạn; hãy ghi mã đó vào tin nhắn. Nếu runtime chưa kết nối, hãy ghi workspace ID mà phần này hiển thị. Không bao giờ dán API key, license key hay token runtime vào ticket hoặc tin nhắn.

## Thanh toán

Trang **Thanh toán** chỉ xuất hiện trên bản dewee SaaS. Bản SaaS không được cung cấp tại Việt Nam, nên với workspace On-Premises bạn sẽ không thấy trang này trên menu. Trên SaaS, một workspace dùng gói miễn phí hoặc gói **Annual** duy nhất, không có dùng thử miễn phí và có thời hạn hoàn tiền 14 ngày.

::shot{id="billing"}

> [!NOTE]
> Tên gói, giá, thanh mức sử dụng và thẻ thanh toán trong ảnh chụp là dữ liệu mẫu. Bản SaaS chỉ có một gói Annual; xem [Bảng giá](/pricing) để biết các lựa chọn hiện có.

Phần gói hiện tại hiển thị **Plan**, **Status**, **Renewal** và **Billing owner**.

### Đăng ký gói

1. Chọn **Subscribe** trên thẻ **Annual plan**.
2. Hoàn tất thanh toán trên trang thanh toán.
3. Khi quay lại console, trang hiển thị **Confirming your subscription**. Quyền truy cập được kích hoạt sau khi thanh toán được xác nhận.

Nếu bạn bỏ dở thanh toán, **Resume checkout** đưa bạn quay lại cho tới khi phiên thanh toán hết hạn. Kênh cần gói Annual: mở **Kênh** khi đang ở gói miễn phí sẽ đưa bạn tới đây, và khi gói đã hoạt động, một liên kết đưa bạn quay về.

### Quản lý gói đăng ký

- **Open billing portal** dùng để quản lý gói đang hoạt động.
- **Payment failed** nghĩa là bạn nên chọn **Update billing details** trước khi gói bị tạm ngưng.
- **Cancelling** nghĩa là quyền truy cập vẫn còn tới hết kỳ thanh toán hiện tại. Chọn **Resubscribe** để tiếp tục.
- **Invoices & receipts**: chọn **Open invoices & receipts** để tải hoá đơn và biên nhận thanh toán.

Khi gói ở trạng thái **Suspended** hoặc **Refunded**, quyền truy cập workspace bị tắt. Trang cho biết dữ liệu của bạn được giữ tới ngày nào trước khi bị xoá theo lịch; chọn **Re-subscribe** trước ngày đó để giữ lại dữ liệu.

### Yêu cầu hoàn tiền

Chỉ chủ workspace mới thấy phần **Refund**. Trong vòng 14 ngày kể từ khi đăng ký, chủ workspace có thể yêu cầu hoàn toàn bộ số tiền:

1. Xem số ngày còn lại trong phần **Refund**.
2. Chọn **Request refund** rồi xác nhận.

Mỗi người chỉ được hoàn tiền tự phục vụ một lần. Khi đã quá thời hạn, phần này sẽ báo như vậy.

> [!WARNING]
> Hoàn tiền có hiệu lực ngay lập tức. Chat, API key và phần thiết lập provider của workspace bị tắt ngay khi bạn xác nhận.

### Dedicated và On-Premises

Workspace chạy trên hạ tầng do bạn quản lý dùng license thay cho gói đăng ký. Nếu trang Thanh toán hiện ra, gói sẽ là **Self-hosted**, kèm lời nhắc rằng việc thanh toán đi qua license của bạn chứ không qua trang này. Tại Việt Nam, mọi workspace đều theo cách này. Chủ workspace gắn license key thường niên ở trang **License binding**; trên SaaS, nút **Open activation** trong phần **Dedicated runtime** cũng dẫn tới trang đó. Xem [Cài đặt và sao lưu](/docs/console/settings-and-backup).

## Liên quan

- [Cài đặt và sao lưu](/docs/console/settings-and-backup)
- [Tool tích hợp, MCP server và hook](/docs/console/tools-mcp-and-hooks)
- [Kênh, ghép cặp và danh bạ](/docs/console/channels-and-contacts)
- [Kích hoạt license](/docs/runtime/licence)
- [Chọn cách triển khai](/docs/get-started/deployment-options)
