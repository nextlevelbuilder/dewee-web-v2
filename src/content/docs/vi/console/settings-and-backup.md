---
title: Cài đặt và sao lưu
description: Thay đổi cài đặt workspace với một thanh lưu chung, xem cách sao lưu theo hình thức triển khai, yêu cầu xuất hoặc khôi phục, và dùng các trang của owner.
section: console
order: 13
screens: [settings, backup]
updated: 2026-10-16
---

**Cài đặt** chứa các tuỳ chọn áp dụng cho toàn workspace, từ tên và múi giờ mặc định tới những cài đặt mà runtime cho phép bạn thay đổi. **Sao lưu** cho biết dữ liệu của bạn được bảo vệ thế nào theo hình thức triển khai, và cách yêu cầu xuất hay khôi phục dữ liệu. Trên Dedicated và On-Premises, chủ workspace còn có thêm vài trang để quản lý runtime do chính họ vận hành.

## Ai được dùng

| Khu vực | Ai được dùng |
|---|---|
| Cài đặt | `settings.manage` |
| Đổi tên workspace | Chủ workspace hoặc admin |
| Sao lưu và xuất dữ liệu | `backup.export` |
| Yêu cầu khôi phục | `backup.restore.request` |
| Gắn giấy phép, Cấu hình hệ thống, Nhập / xuất, Workstations | Chủ workspace, trên Dedicated và On-Premises |

Xem [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys).

## Cài đặt

Trang **Cài đặt** có danh sách mục ở bên trái và nội dung của mục đang chọn ở bên phải:

- **Chung**: tên workspace và các thông tin tham chiếu.
- **Thương hiệu**, **Bảo mật**, **Thông báo**, **Mặc định cho agent** và **Lưu giữ dữ liệu**: bản triển khai của bạn không báo các mục này, nên mỗi mục hiện **Chưa được báo cáo**.
- **Lớp quyết định**: Jev by TypeSafe. Hiện cài đặt của hệ thống, cho phép đặt chặt hơn cho workspace này và liệt kê các quyết định gần đây kèm liên kết tới trace. Xem [Lớp quyết định](/docs/concepts/decision-layer#ghi-đè-theo-workspace).
- **Ngôn ngữ và khu vực**: múi giờ mặc định.
- **Giọng nói**: cài đặt chuyển văn bản thành giọng nói và giọng nói thành văn bản do runtime cung cấp.
- **Kênh và ghép nối**: cài đặt ghép nối và cập nhật task do runtime cung cấp.
- **Chính sách kỹ năng**: cài đặt skill do runtime cung cấp.
- **Vùng nguy hiểm**: chuyển quyền sở hữu và xoá workspace.
- **Cài đặt runtime khác**: các cài đặt khác mà runtime báo về. Mục này chỉ xuất hiện khi có cài đặt như vậy.

::shot{id="settings"}

Runtime quyết định cài đặt nào xuất hiện trong **Giọng nói**, **Kênh và ghép nối**, **Chính sách kỹ năng** và **Cài đặt runtime khác**, và chúng được chia nhóm thế nào. Mỗi cài đặt cho biết nó **Đã ghi đè cho workspace này** hay **Kế thừa giá trị mặc định của runtime**. **Khôi phục mặc định** xoá một giá trị ghi đè, còn **Đặt lại mục này** xoá mọi giá trị ghi đè trong một nhóm.

Thay đổi ở mọi mục được gom vào một thanh lưu ở cuối trang. Thanh này hiện **Có thay đổi chưa lưu** cùng **Bỏ thay đổi** và **Lưu thay đổi**. Không có nút lưu riêng cho từng mục.

### Chung

Chủ workspace hoặc admin có thể đổi **Tên workspace** rồi chọn **Lưu** ngay cạnh đó. Bên dưới là **Slug**.

Thẻ **Workspace** hiển thị **Workspace ID**, **Phiên bản ứng dụng** (**Hosted (SaaS)** hoặc **Tự triển khai**), **Tenant runtime** kèm nút **Sao chép tham chiếu**, và **Trạng thái onboarding**. **Quyền truy cập** cho biết **Vai trò của bạn** và số thành viên của workspace, còn **Liên quan** liên kết tới Thành viên, Vai trò, API key và Thanh toán.

### Ngôn ngữ và khu vực

Chọn **Múi giờ mặc định** rồi lưu bằng thanh lưu. Lịch chạy mới, và những thành viên chưa tự chọn múi giờ, sẽ dùng múi giờ này. Để ở **Múi giờ trình duyệt** nếu muốn mỗi người xem theo múi giờ của trình duyệt. Mỗi người tự chọn ngôn ngữ ở trang tài khoản của mình.

### Vùng nguy hiểm

**Chuyển quyền sở hữu** và **Xoá workspace** không thực hiện trong app. Cả hai đều dẫn tới **Liên hệ hỗ trợ**.

## Sao lưu

Trang **Sao lưu** giải thích cách sao lưu hoạt động theo hình thức triển khai của bạn:

- **Shared SaaS**: việc sao lưu **Do đơn vị vận hành quản lý**. Xuất dữ liệu không tự phục vụ: chọn **Yêu cầu xuất dữ liệu qua hỗ trợ** để mở một phiếu hỗ trợ mới, có sẵn tiêu đề **Yêu cầu xuất dữ liệu** và dàn ý để bạn điền phạm vi, định dạng, thời hạn. Bộ phận hỗ trợ sẽ xác nhận yêu cầu thuộc về workspace của bạn. Nếu chưa dùng được phiếu hỗ trợ, nút này mở trang hỗ trợ.
- **Dedicated (TOSE)** và **On-premises**: việc sao lưu là **Tự phục vụ**. Nút **Sao lưu ngay** bị tắt, kèm lý do hiển thị trên trang, cho tới khi có endpoint xuất dữ liệu tự phục vụ. Hiện chưa bản triển khai nào cung cấp endpoint này trên bảng điều khiển, nên hãy nhờ nhà vận hành hoặc bộ phận hỗ trợ xuất dữ liệu cho bạn.

::shot{id="backup"}

Trang có các thẻ sau:

- **Lịch sao lưu**: cho biết bản triển khai không báo lịch sao lưu hay thời gian lưu giữ.
- **Lịch sử xuất và khôi phục**: hiển thị **Không có dữ liệu**, vì bản triển khai chưa báo lịch sử sao lưu về bảng điều khiển.
- **Cách sao lưu hoạt động ở đây**: **Chế độ triển khai**, **Chính sách sao lưu**, **Mã tham chiếu hỗ trợ**, và **Endpoint xuất dữ liệu** là **Đã cấu hình** hay **Chưa cấu hình**.
- **Kiểm tra trước khi sao lưu**: kiểm tra **Tenant runtime đã kết nối**, **Endpoint xuất dữ liệu tự phục vụ** và **Kênh yêu cầu hỗ trợ**, mỗi mục được đánh dấu **Sẵn sàng** hoặc **Cần xử lý**.

Hãy sao chép mã tham chiếu hỗ trợ vào mọi yêu cầu để bộ phận hỗ trợ xác minh.

### Khôi phục

Việc khôi phục luôn đi qua bộ phận hỗ trợ. Chọn **Yêu cầu khôi phục** ở phần đầu trang, hoặc **Mở yêu cầu khôi phục** trong thông báo **Khôi phục cần được phê duyệt**. Trang **Yêu cầu khôi phục** không có biểu mẫu:

1. **Bản sao lưu cần khôi phục** cho biết bản triển khai không báo danh sách bản sao lưu.
2. **Gửi yêu cầu qua bộ phận hỗ trợ** hiển thị **Mã tham chiếu hỗ trợ** và **Workspace** của bạn.
3. Chọn **Tạo phiếu hỗ trợ** và mô tả dữ liệu bạn muốn khôi phục. Nếu chưa dùng được phiếu hỗ trợ, nút này là **Đến trang hỗ trợ**.

Bộ phận hỗ trợ xác nhận kế hoạch với bạn trước khi thực hiện.

> [!WARNING]
> Khôi phục có thể ghi đè dữ liệu của workspace. Hãy chắc chắn đã có một bản sao lưu gần đây trước khi gửi yêu cầu.

## Trang của owner trên Dedicated và On-Premises

Trên các hình thức triển khai này, workspace sở hữu runtime của riêng mình, nên owner có thêm bốn trang. Trên Shared SaaS, các trang này hiển thị **Không khả dụng với kiểu triển khai này** vì người vận hành nền tảng chạy runtime; khi đó hãy nhờ bộ phận hỗ trợ nếu cần thay đổi. **Cấu hình hệ thống** cũng chỉ dùng được sau khi onboarding hoàn tất.

- **Gắn giấy phép**: nhập **Khoá giấy phép** từ đơn hàng của bạn rồi chọn **Gắn giấy phép vào workspace này**. Khoá chỉ được dùng một lần và không bao giờ hiển thị lại. Việc gắn giấy phép xác nhận quyền sử dụng của bạn nhưng không tiêu tốn lượt kích hoạt; mỗi máy chạy runtime vẫn kích hoạt riêng. Với bản tự triển khai, chọn **Mở cổng khách hàng lưu trữ** và gắn khoá ở đó. Bạn tới trang này từ trang Thanh toán bằng **Mở kích hoạt**.
- **Cấu hình hệ thống**: cài đặt runtime cho toàn bộ bản triển khai. Tìm bằng ô **Tìm khoá cấu hình…**; giá trị chứa thông tin xác thực hiện là **Đã ẩn**. Thay đổi được giữ ở trạng thái chờ cho tới khi bạn chọn **Xem lại và áp dụng**, rồi **Áp dụng thay đổi**. Thay đổi có hiệu lực ngay.
- **Nhập / xuất**: các tab **Xuất**, **Nhập** và **Lịch sử** đưa agent, nhóm, skill, MCP server và nhà cung cấp vào hoặc ra dưới dạng gói lưu trữ của runtime. Để xuất, nhập **Mã tài nguyên**, chọn **Tạo bản xem trước xuất**, rồi **Tải tệp lưu trữ**. Để nhập, chọn **Chạy thử** trước, rồi **Áp dụng nhập**. Gói lưu trữ **Không kèm thông tin xác thực**.
- **Workstations**: các node runtime đã đăng ký cho workspace này. **Đăng ký workstation** yêu cầu tên và endpoint. Bảng hiển thị endpoint, trạng thái và **Lần cuối hoạt động** của từng node.

> [!NOTE]
> Không bao giờ dán khoá giấy phép hay token runtime vào phiếu hỗ trợ. Khoá giấy phép do người vận hành cung cấp sau khi thanh toán.

## Liên quan

- [Chọn cách triển khai](/docs/get-started/deployment-options)
- [Kích hoạt license](/docs/runtime/licence)
- [Cài đặt và chạy gateway](/docs/runtime/install-and-run)
- [Kênh, ghép nối và danh bạ](/docs/console/channels-and-contacts)
- [Hỗ trợ và thanh toán](/docs/console/support-and-billing)
