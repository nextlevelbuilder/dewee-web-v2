---
title: Bộ nhớ, kho tri thức và lưu trữ
description: Xem lại và chọn lọc những gì agent ghi nhớ, xây kho tri thức gồm các tài liệu agent tìm kiếm được, chỉnh sửa đồ thị tri thức và quản lý file của workspace.
section: console
order: 10
screens: [memory, knowledge-base, storage]
updated: 2026-10-14
---

Agent trả lời tốt hơn khi nhớ được những gì đã học và tra cứu được thông tin. Nhóm **Dữ liệu** trên menu có các khu vực phục vụ việc này: **Bộ nhớ**, những gì agent giữ lại qua các phiên, **Kho tri thức** và **Đồ thị tri thức**, gồm tài liệu và thực thể mà agent tìm kiếm được, và **Lưu trữ**, nơi chứa file dùng chung cho cả workspace. Mọi dữ liệu ở đây chỉ nằm trong workspace của bạn.

## Ai được dùng

| Khu vực | Khoá quyền |
|---|---|
| Bộ nhớ, chỉ xem | `memory.read` |
| Bộ nhớ, tạo và chỉnh sửa | `memory.manage` |
| Kho tri thức và đồ thị tri thức | `vault.manage` |
| Lưu trữ | `storage.manage` |

Tất cả các khu vực này đều cần runtime đang kết nối. Xem [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys).

## Bộ nhớ

**Bộ nhớ** có ba tab: **Tài liệu**, **Dữ kiện** và **Tóm tắt cuộc trò chuyện**. Mỗi agent có bộ nhớ riêng, nên trước tiên hãy chọn agent trong ô **Agent**; mặc định là **Trợ lý không gian làm việc**. **Tìm trong bộ nhớ** tìm nội dung theo ý nghĩa, không chỉ theo đúng từ ngữ.

::shot{id="memory"}

### Tài liệu

Tab **Tài liệu** liệt kê các tài liệu bộ nhớ kèm đường dẫn, phạm vi, trạng thái, dung lượng và lần thay đổi gần nhất. Các chỉ số phía trên cho biết **Tài liệu**, **Đang hiển thị**, **Đã lưu trữ** và **Mức truy cập** của bạn, là **Quản lý** hoặc **Chỉ xem**. Bạn tìm bằng ô **Tìm theo đường dẫn…**, lọc theo phạm vi và bật **Bao gồm đã lưu trữ** để xem cả tài liệu đã lưu trữ. Có hai phạm vi:

- **Chung**: bộ nhớ cho cả workspace.
- **Cá nhân**: bộ nhớ gắn với một thành viên.

Để thêm một tài liệu bộ nhớ:

1. Chọn **Tài liệu mới**.
2. Nhập **Đường dẫn**, ví dụ `support/refund-policy.md`.
3. Chọn **Phạm vi**. Với **Cá nhân**, chọn **Chủ sở hữu** trong danh sách thành viên, hoặc nhập user ID của họ.
4. Viết **Nội dung** rồi chọn **Tạo tài liệu**.

Đường dẫn và phạm vi không đổi được sau khi tạo tài liệu. Mở một tài liệu để sửa nội dung rồi chọn **Lưu thay đổi**; hộp thoại cũng cho biết tài liệu có bao nhiêu đoạn và trạng thái **Đã nhúng** của các đoạn đó. **Xem các đoạn dùng để tìm kiếm** liệt kê các đoạn đó, còn **Làm mới trong tìm kiếm** đọc lại một tài liệu. **Làm mới tìm kiếm** đọc lại mọi tài liệu để tìm kiếm luôn thấy nội dung mới nhất.

Trong menu của một dòng, dùng **Lưu trữ** để ngừng dùng một tài liệu đã cũ và **Khôi phục** để dùng lại. **Xoá tài liệu** xoá tài liệu đó, và agent sẽ không thể nhớ lại nó nữa. Nếu chỉ có `memory.read`, bạn mở và đọc được tài liệu nhưng không thay đổi được.

> [!NOTE]
> Agent tìm trong các tài liệu này khi cần nhớ lại điều gì đó, nên một tài liệu lỗi thời có thể dẫn tới câu trả lời lỗi thời. Hãy sửa hoặc lưu trữ bộ nhớ đã cũ thay vì để nguyên.

### Dữ kiện và tóm tắt cuộc trò chuyện

Tab **Dữ kiện** liệt kê các dữ kiện có cấu trúc mà agent học được về người và sự vật, với **Chủ thể**, **Thuộc tính**, **Giá trị**, **Người dùng**, **Trạng thái** và **Hiệu lực từ**. Mở một dữ kiện để xem nó được học từ đâu và lịch sử của nó. Một dữ kiện ở trạng thái **Đang dùng**, **Đang tranh chấp**, **Đã thay thế** hoặc **Đã xoá**. Chọn **Chấp nhận** hoặc **Từ chối** cho dữ kiện đang tranh chấp, hoặc **Xoá dữ kiện** để xoá một dữ kiện sai; agent ngừng dùng dữ kiện đó ngay.

Tab **Tóm tắt cuộc trò chuyện** hiển thị những bản tóm tắt ngắn mà agent viết sau mỗi cuộc trò chuyện. Bạn tìm được các bản tóm tắt theo chủ đề. Bạn chỉ xem được bản tóm tắt các cuộc trò chuyện của chính mình. Một số phiên bản runtime không lưu dữ kiện hay bản tóm tắt; khi đó tab sẽ báo như vậy.

## Kho tri thức

**Kho tri thức** có hai tab: **Tài liệu** cho các văn bản mà agent tìm kiếm được, và **Đồ thị** cho các thực thể được trích xuất từ tài liệu và cuộc trò chuyện, cùng quan hệ giữa chúng. Mục **Đồ thị tri thức** trên menu mở thẳng tab **Đồ thị**.

::shot{id="knowledge-base"}

### Tài liệu

Đổi chế độ xem giữa **Danh sách**, **Thư mục** và **Đồ thị liên kết**. Bạn tìm bằng ô **Tìm tài liệu…**, lọc theo **Loại** (**Tài liệu**, **Ghi chú**, **Ngữ cảnh**, **Bộ nhớ**, **Kỹ năng**, **Sự kiện** hoặc **Đa phương tiện**) và **Phạm vi** (**Chung**, **Nhóm** hoặc **Cá nhân**). **Tìm theo ngữ nghĩa** tìm tài liệu theo ý nghĩa.

Để thêm một tài liệu:

1. Chọn **Tài liệu mới**.
2. Nhập **Tiêu đề**. **Đường dẫn** tự điền theo tiêu đề.
3. Chọn **Loại** (**Tài liệu**, **Ghi chú** hoặc **Ngữ cảnh**) và **Phạm vi**.
4. Viết nội dung bằng Markdown, kiểm tra trong **Xem trước nội dung**, rồi chọn **Tạo tài liệu**.

Đường dẫn và phạm vi không đổi được sau khi tạo tài liệu. Muốn nạp file, chọn **Nhập** và thêm file Markdown, văn bản, JSON hoặc CSV, tối đa 2 MB mỗi file. Mỗi file trở thành một tài liệu dùng chung tìm kiếm được.

Chọn một tài liệu để xem trước, xem tóm tắt và quản lý **Liên kết** tới tài liệu khác bằng **Thêm liên kết**. Tài liệu mới phải chờ làm giàu, tức bước viết tóm tắt, tạo embedding cho tìm kiếm ngữ nghĩa và gợi ý liên kết; trước đó, tìm kiếm ngữ nghĩa có thể bỏ sót chúng. Khi có tài liệu đang chờ, **Quét lại** đưa chúng vào hàng đợi. **Xoá tài liệu** xoá một tài liệu khỏi kho tri thức sau một bước xác nhận.

### Đồ thị

Tab **Đồ thị** hiển thị **Thực thể**, **Quan hệ** và **Loại thực thể**. Đổi **Chế độ xem** giữa **Đồ thị** và **Bảng**, tìm bằng ô **Tìm thực thể…**, lọc theo loại thực thể và đặt **Giới hạn số nút**. **Phóng to**, **Thu nhỏ**, **Vừa khung hình** và **Đặt lại góc nhìn** giúp đồ thị lớn vẫn dễ đọc. Runtime chỉ trả về tối đa 500 thực thể và 200 quan hệ, nên có thể còn nhiều hơn.

Bạn chỉnh sửa được đồ thị:

- **Thêm thực thể**: thêm người, công ty, sản phẩm hoặc chủ đề với **Tên**, **Loại** và **Mô tả**.
- **Trích xuất từ văn bản**: dán tối đa 50 KB ghi chú hoặc tài liệu, và mô hình của trợ lý không gian làm việc sẽ tìm các thực thể và quan hệ trong đó.
- **Tìm trùng lặp**: chọn **Quét tìm trùng lặp**, rồi với mỗi cặp, giữ lại một thực thể để gộp thực thể kia vào, hoặc chọn **Không phải một**.

Chọn một thực thể để xem mô tả, độ tin cậy và quan hệ của nó. Đặt **Độ sâu duyệt** rồi chọn **Chạy duyệt đồ thị** để xem những gì liên kết với nó. **Xoá thực thể** cũng xoá các quan hệ của thực thể đó.

## Lưu trữ

**Lưu trữ** là trình duyệt file của workspace. Cây thư mục nằm bên trái cùng **Dung lượng đã dùng**, và đường dẫn breadcrumb dẫn ngược về thư mục gốc **Lưu trữ**.

::shot{id="storage"}

1. Mở một thư mục để đi vào bên trong, hoặc dùng cây thư mục hay breadcrumb để quay lại. **Tìm trong thư mục này…** lọc thư mục hiện tại.
2. Chọn **Tải lên** để thêm file vào thư mục hiện tại. Mọi loại file đều được, tải lên lần lượt từng file.
3. Chọn một file để xem trước. Một số loại hoặc kích thước file không xem trước được; hãy tải xuống để xem.
4. Trong menu của một dòng, dùng **Tải xuống**, **Đổi tên**, **Di chuyển** để chọn **Thư mục đích**, hoặc **Xoá**. Xoá một thư mục sẽ xoá luôn mọi thứ bên trong.

> [!WARNING]
> Xoá một tài liệu bộ nhớ, một tài liệu tri thức, một thực thể trong đồ thị hay một file đã lưu thì không hoàn tác được từ console. Với bộ nhớ có thể cần lại sau này, hãy lưu trữ thay vì xoá.

## Liên quan

- [Bộ nhớ và kho tri thức](/docs/concepts/memory-and-knowledge)
- [Agent](/docs/console/agents)
- [Kênh, ghép nối và danh bạ](/docs/console/channels-and-contacts)
- [Cài đặt và sao lưu](/docs/console/settings-and-backup)
- [Tool và quyền hạn](/docs/concepts/tools-and-permissions)
