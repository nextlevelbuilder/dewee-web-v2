---
title: Bộ nhớ, kho tri thức và lưu trữ
description: Xem lại và chọn lọc những gì agent ghi nhớ, xây kho tri thức gồm các tài liệu agent tìm kiếm được, khám phá đồ thị tri thức và quản lý file của workspace.
section: console
order: 10
screens: [memory, knowledge-base, storage]
updated: 2026-09-25
---

Agent trả lời tốt hơn khi nhớ được những gì đã học và tra cứu được thông tin. Nhóm **Data** trên menu có ba khu vực phục vụ việc này: **Bộ nhớ**, nơi lưu những ghi chú agent giữ qua các phiên, **Kho tri thức**, gồm tài liệu và đồ thị dữ kiện mà agent tìm kiếm được, và **Lưu trữ**, nơi chứa file dùng chung cho cả workspace. Mọi dữ liệu ở đây chỉ nằm trong workspace của bạn.

## Ai được dùng

| Khu vực | Khoá quyền |
|---|---|
| Bộ nhớ, chỉ xem | `memory.read` |
| Bộ nhớ, tạo và chỉnh sửa | `memory.manage` |
| Kho tri thức và đồ thị tri thức | `vault.manage` |
| Lưu trữ | `storage.manage` |

Cả ba khu vực đều cần runtime đang kết nối. Xem [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys).

## Bộ nhớ

**Bộ nhớ** liệt kê các tài liệu tạo nên bộ nhớ của agent, kèm đường dẫn, phạm vi, trạng thái và lần thay đổi gần nhất. Phần tóm tắt phía trên đếm số tài liệu trên runtime, số tài liệu hiển thị sau khi lọc và số tài liệu đã lưu trữ, đồng thời cho biết quyền của bạn là **Manage** hay **Read**.

::shot{id="memory"}

Bạn có thể tìm theo đường dẫn, lọc theo phạm vi và bật **Include archived** để xem cả tài liệu đã lưu trữ. Có hai phạm vi:

- **Shared**: bộ nhớ dùng chung cho cả workspace.
- **Personal**: bộ nhớ gắn với một người dùng.

Để thêm hoặc sửa một tài liệu bộ nhớ:

1. Chọn **New memory**, hoặc mở một tài liệu có sẵn.
2. Nhập **Path**, ví dụ `support/refund-policy.md`.
3. Để trống **User ID** nếu là bộ nhớ dùng chung cho workspace, hoặc nhập user ID để biến nó thành bộ nhớ cá nhân.
4. Viết **Content** rồi chọn **Save**.

Khi mở một tài liệu, bạn còn thấy tài liệu được chia thành bao nhiêu chunk và các chunk đã được embed để tìm kiếm hay chưa. Dùng **Archive** để ngừng dùng một tài liệu đã cũ và **Restore** để khôi phục nó. **Delete** xoá vĩnh viễn tài liệu khỏi runtime. Nếu chỉ có `memory.read`, bạn mở và đọc được tài liệu nhưng không sửa được.

> [!NOTE]
> Agent tìm trong các tài liệu này mỗi khi cần nhớ lại điều gì đó, nên một tài liệu lỗi thời có thể dẫn tới câu trả lời lỗi thời. Hãy sửa hoặc lưu trữ bộ nhớ đã cũ thay vì để nguyên.

## Kho tri thức

**Kho tri thức** có hai tab: **Documents** chứa văn bản mà agent tìm kiếm được, và **Graph** hiển thị con người, tổ chức, sản phẩm và các thực thể khác được trích xuất từ bộ nhớ, cùng các liên kết giữa chúng. Menu cũng có mục **Knowledge graph** mở thẳng vào đồ thị.

::shot{id="knowledge-base"}

Ở tab **Documents**, bạn lọc theo phạm vi (**Shared**, **Team** hoặc **Personal**) và loại (**Document**, **Note** hoặc **Context**). Để thêm tài liệu:

1. Chọn **Create or import**.
2. Nhập **Title**, chọn **Type** và **Scope**.
3. Gõ nội dung, hoặc dùng **Import text file** để nạp một file `.md`, `.txt`, `.json` hoặc `.csv`.
4. Kiểm tra **Content preview**, rồi chọn **Create document**.

Bản xem trước được che dữ liệu nhạy cảm trước khi tới trình duyệt của bạn. Khi xoá một tài liệu, bạn cần xác nhận và thao tác được ghi vào nhật ký audit.

Ở tab **Graph**, bạn tìm thực thể, lọc theo loại thực thể và chọn một thực thể để xem mô tả, độ tin cậy và các quan hệ của nó. **Traverse** đi theo các quan hệ để cho thấy những gì liên kết với thực thể đó. Các nút phóng to, thu nhỏ, vừa khung hình và giới hạn số node giúp đồ thị lớn vẫn dễ đọc. Đồ thị chỉ để xem: runtime tự dựng đồ thị từ bộ nhớ và tự gộp các thực thể trùng lặp, nên một đồ thị đang trống sẽ dần đầy lên khi agent làm việc.

## Lưu trữ

**Lưu trữ** là trình duyệt file của workspace. Trang cho biết thư mục hiện tại có bao nhiêu mục, thư mục và file, kèm thanh đường dẫn để quay về **Root**.

::shot{id="storage"}

1. Mở một thư mục để đi vào trong, hoặc dùng thanh đường dẫn để quay lại.
2. Chọn **Upload** để thêm file vào thư mục hiện tại.
3. Dùng **Preview** để xem file ngay trên trình duyệt. File lớn và một số loại file chỉ tải về được.
4. Dùng **Download** để tải file về, **Move** để di chuyển hoặc đổi tên bằng cách nhập đường dẫn mới, và **Delete** để xoá sau khi xác nhận.

Đường dẫn luôn nằm trong workspace, nên thao tác di chuyển tới đường dẫn tuyệt đối hoặc ra ngoài workspace sẽ bị từ chối.

> [!WARNING]
> Xoá tài liệu bộ nhớ, tài liệu trong kho tri thức hay file đã lưu đều không hoàn tác được từ console. Với bộ nhớ có thể còn cần tới, hãy lưu trữ thay vì xoá.

## Liên quan

- [Bộ nhớ và kho tri thức](/docs/concepts/memory-and-knowledge)
- [Agent](/docs/console/agents)
- [Kênh, ghép cặp và danh bạ](/docs/console/channels-and-contacts)
- [Cài đặt và sao lưu](/docs/console/settings-and-backup)
- [Tool và quyền hạn](/docs/concepts/tools-and-permissions)
