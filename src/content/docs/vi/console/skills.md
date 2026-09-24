---
title: Skill và mẫu skill
description: Tải lên skill tuỳ chỉnh dưới dạng file ZIP, kiểm tra các dependency, quyết định agent và người nào được dùng skill, và tạo agent mới từ các mẫu skill có sẵn.
section: console
order: 6
screens: [skills, skill-templates]
updated: 2026-09-25
---

Skill là một bộ chỉ dẫn được đóng gói, đôi khi kèm script, mà agent có thể nạp khi công việc cần tới. Mỗi skill nằm trong một file `SKILL.md` có YAML front matter. Trang **Skill** có hai tab: **Skills**, nơi bạn tải lên và quản lý các skill của workspace, và **Templates**, nơi bạn tạo agent mới từ các skill dựng sẵn.

## Ai được dùng

Để quản lý skill, bạn cần khoá quyền `skills.manage`. Chủ workspace và vai trò Admin có sẵn giữ khoá này; với Member, bạn cấp qua một vai trò tuỳ chỉnh. Xem [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys).

## Bạn thấy gì trên trang

Tab **Skills** liệt kê mọi skill kèm loại, trạng thái, phiên bản và tình trạng dependency. Có hai loại skill:

- **Custom**: skill do bạn hoặc agent của bạn tải lên hay xuất bản. Bạn có thể sửa, cấp quyền, tải về và xoá chúng.
- **Core**: skill đi kèm runtime, như các skill xử lý file PDF, Word, Excel và PowerPoint. Runtime quản lý các skill này nên ở đây bạn chỉ xem được.

Bạn có thể tìm theo tên, slug hoặc mô tả, lọc theo trạng thái (Active, Archived hoặc Deleted) và sắp xếp theo tên, trạng thái hoặc số dependency còn thiếu.

::shot{id="skills"}

## Tải lên skill

1. Chọn **Upload skills**.
2. Kéo thả một hoặc nhiều file ZIP, hoặc chọn file từ máy. Mỗi skill trong file nén cần có `SKILL.md` với YAML front matter chứa trường `name`. File nén có nhiều skill sẽ được tách thành từng lượt tải riêng cho mỗi skill, tối đa 50 skill trong một file.
3. Nếu muốn, ở phần **Manager agents**, chọn các agent sẽ được cấp quyền quản lý các skill mới.
4. Chọn **Upload** và xem kết quả của từng skill: đã cài, bỏ qua vì không có thay đổi, có cảnh báo, hoặc thất bại.

Mặc định mỗi file nén tối đa 20 MB. Người vận hành runtime có thể đặt giới hạn này trong khoảng từ 1 đến 500 MB. Slug chỉ gồm chữ thường, chữ số và dấu gạch ngang.

## Quản lý một skill

Chọn **Open** trên một dòng. Trang chi tiết có bốn tab:

- **Profile**: sửa tên và mô tả, đặt **Visibility** và đổi trạng thái.
- **Dependencies**: xem các gói mà skill cần và chọn **Scan dependencies** để kiểm tra gói nào còn thiếu.
- **Grants**: cấp quyền cho một agent theo tên, có thể ghim vào một phiên bản cụ thể, hoặc cấp quyền cho một thành viên theo email.
- **Evolution**: xem skill đã chạy bao nhiêu lần, tỉ lệ thành công và thời gian chạy trung bình.

Dùng **Download** để tải bản sao của một skill tuỳ chỉnh, và **Delete** để xoá nó.

### Ai được dùng một skill

**Visibility** quyết định ai tìm thấy và nạp được skill:

| Visibility | Ai được dùng |
|---|---|
| Private | Chỉ chủ sở hữu skill |
| Internal | Chỉ những agent và thành viên được cấp quyền cụ thể |
| Public | Mọi agent và thành viên trong workspace |

> [!NOTE]
> Public nghĩa là công khai trong phạm vi workspace của bạn. Skill không được xuất bản sang workspace khác hay lên internet.

Skill còn thiếu dependency có thể chạy không đúng. Các gói được quản lý ở trang **Gói runtime**, và những gì bạn cài được phụ thuộc vào hình thức triển khai; xem [Tool tích hợp, MCP server và hook](/docs/console/tools-mcp-and-hooks).

## Bắt đầu từ một mẫu

Tab **Templates** hiển thị các skill trong catalog chọn lọc của runtime mà bạn có thể dùng làm điểm khởi đầu cho agent mới. Bạn có thể duyệt theo danh mục hoặc xem toàn bộ mẫu.

::shot{id="skill-templates"}

Mỗi mẫu mang huy hiệu **ready** hoặc **needs action**. Chọn **Preview requirements** để xem lý do. Một mẫu sẵn sàng khi cả ba điều kiện sau đều đạt:

1. Runtime của workspace đã kết nối.
2. Skill của mẫu đang ở trạng thái hoạt động.
3. Không có dependency nào bị báo thiếu.

Khi mẫu đã sẵn sàng, chọn **Use template**. Trình tạo agent mở ra với mẫu đó được chọn sẵn; bạn tiếp tục từ bước **Profile** như mô tả ở trang [Agent](/docs/console/agents).

Nếu tab trống, nghĩa là chưa có skill nào được xuất bản lên catalog của runtime, hoặc runtime chưa kết nối được.

## Liên quan

- [Skill](/docs/concepts/skills)
- [Agent](/docs/console/agents)
- [Tool tích hợp, MCP server và hook](/docs/console/tools-mcp-and-hooks)
- [Tool và quyền hạn](/docs/concepts/tools-and-permissions)
- [Tham chiếu CLI](/docs/runtime/cli)
