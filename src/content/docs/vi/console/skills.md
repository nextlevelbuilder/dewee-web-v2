---
title: Skill và mẫu skill
description: Tải lên gói skill, xem tệp, phiên bản và phụ thuộc, tinh chỉnh tối ưu hóa, quyết định agent và người nào được dùng skill, và tạo agent mới từ các mẫu skill.
section: console
order: 6
screens: [skills, skill-templates]
updated: 2026-10-14
---

Skill (trong giao diện gọi là kỹ năng) là một bộ chỉ dẫn được đóng gói, đôi khi kèm script, mà agent có thể nạp khi công việc cần tới. Mỗi skill là một gói có tệp `SKILL.md` với YAML front matter. Trang **Kỹ năng** có ba tab: **Đã cài**, nơi bạn tải lên và quản lý các skill của workspace, **Marketplace**, và **Mẫu**, nơi bạn tạo agent mới từ skill.

## Ai được dùng

Để quản lý skill, bạn cần khoá quyền `skills.manage`. Chủ workspace và vai trò Admin có sẵn giữ khoá này; với Member, bạn cấp qua một vai trò tuỳ chỉnh. Xem [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys).

## Bạn thấy gì trên trang

Tab **Đã cài** liệt kê mọi skill kèm thẻ, nguồn, phiên bản, tình trạng phụ thuộc và công tắc **Bật**. Nguồn của skill là một trong các loại sau:

- **Tuỳ chỉnh**: skill do bạn hoặc agent của bạn tải lên hay xuất bản. Bạn có thể sửa, cấp quyền, tải về và xoá chúng.
- **Tích hợp sẵn**: skill đi kèm runtime, như các skill xử lý tệp PDF, Word, Excel và PowerPoint. Dewee duy trì các skill này nên ở đây bạn chỉ xem được; bạn vẫn có thể xem và tải tệp của chúng.
- **Marketplace**: skill được cài từ marketplace.

Bạn có thể tìm theo tên, slug, mô tả hoặc thẻ, và lọc theo **Nguồn**, **Chủ sở hữu** (**Workspace này** hoặc **Tích hợp sẵn**) và **Trạng thái** (**Đang bật** hoặc **Đã tắt**). Bạn sắp xếp được theo tên, nguồn, phiên bản, phụ thuộc hoặc công tắc. Menu của mỗi dòng có **Mở**, **Tải về .zip** và **Xoá**.

Tab **Marketplace** hiện chưa liệt kê skill nào: workspace chưa được duyệt và cài skill từ marketplace, nên tab này hướng bạn sang tải lên một gói thay thế.

::shot{id="skills"}

## Tải lên skill

1. Chọn **Tải lên kỹ năng**.
2. **Tải lên**: thả một hoặc nhiều gói `.zip`, hoặc chọn tệp từ máy. Mỗi skill trong gói cần có `SKILL.md` với YAML front matter chứa trường `name`. Một gói có thể chứa nhiều skill, tối đa 50, và mỗi skill được tải lên riêng.
3. **Kiểm tra**: xem lại từng skill. Skill có slug trùng với một skill sẵn có sẽ được phát hành thành phiên bản mới của skill đó; các skill còn lại được tạo thành skill mới.
4. **Cấp quyền**: nếu muốn, chọn các agent được quản lý những skill mới. Bạn có thể đổi quyền sau.
5. Chọn **Tạo kỹ năng** khi tải một skill mới, **Phát hành phiên bản mới** khi tải phiên bản mới của một skill sẵn có, hoặc **Tải lên *n* kỹ năng** khi tải nhiều skill. Xem kết quả của từng skill: đã cài, bỏ qua vì không có thay đổi, có cảnh báo, hoặc thất bại, rồi chọn **Xong**.

Mỗi gói tối đa 20 MB. Slug chỉ gồm chữ thường, chữ số và dấu gạch ngang.

## Quản lý một skill

Chọn một skill, hoặc chọn **Mở** trong menu của dòng, để mở trang của skill. Phần đầu trang có công tắc **Đang bật**, nút **Tải về** và một menu gồm **Sửa cài đặt** và **Xoá kỹ năng**. Bên dưới là dải số liệu gồm lượt gọi, tỷ lệ kích hoạt, số agent đang dùng và phiên bản hiện tại. Trang có các tab sau:

- **Tổng quan**: nguồn, tác giả, phạm vi hiển thị, trạng thái và thẻ; mục **Phụ thuộc** của skill, với nút **Quét lại** để kiểm tra lại những gì còn thiếu; và tệp `SKILL.md` của gói, hiển thị như README.
- **Tệp**: duyệt nội dung gói, như `SKILL.md`, `scripts/` và `references/`. Ở đây tệp chỉ xem được; muốn thay đổi, hãy tải lên phiên bản mới của gói. Tệp quá lớn hoặc tệp nhị phân được liệt kê nhưng không xem trước được.
- **Phiên bản**: các phiên bản đã phát hành, phiên bản hiện tại được đánh dấu. Chỉ tải về được phiên bản hiện tại. Muốn phát hành phiên bản mới, hãy tải lên một gói có cùng slug.
- **Tối ưu hóa**: bật **Bật tối ưu hóa** để runtime theo dõi hiệu quả của skill và đề xuất cải tiến, rồi chọn **Chế độ**: **Chỉ đề xuất** hoặc **Tự phân tích**. Mục **Mức sử dụng** cho thấy lượt gọi, lượt thành công, thất bại, bỏ dở và tỷ lệ kích hoạt trên mọi agent. Ở mục **Đề xuất**, chọn **Duyệt** hoặc **Từ chối** một đề xuất đang chờ, rồi **Áp dụng** đề xuất đã duyệt để phát hành nó thành phiên bản mới. Không có gì thay đổi cho đến khi có người áp dụng đề xuất.
- **Quyền truy cập**: cấp quyền dùng skill cho agent hoặc người, đổi mức và thu hồi quyền. Agent được cấp **Dùng** hoặc **Quản lý**; người cũng được cấp **Dùng** hoặc **Quản lý**. Quyền của agent được ghim vào một phiên bản: khi skill có nhiều phiên bản, hãy chọn **Phiên bản cho quyền agent mới** trước. Quản trị viên workspace và người có quyền **Quản lý** trên skill được thay đổi quyền truy cập; người khác thấy thông báo chỉ được xem. Skill tích hợp sẵn theo chính sách runtime và không cấp quyền được ở đây. Xem [Cấp quyền theo tài nguyên](/docs/security/access-grants).
- **Hoạt động**: các thay đổi về cài đặt tối ưu hóa và đề xuất của skill, tiếp theo là hoạt động truy cập: thay đổi quyền, lượt bị từ chối và lượt dùng.
- **Cài đặt**: sửa tên, mô tả, **Phạm vi hiển thị** và **Trạng thái**, và dùng công tắc **Đang bật**. Nút **Xoá kỹ năng này** trong **Vùng nguy hiểm** gỡ skill cùng mọi phiên bản của nó; agent mất quyền truy cập ngay lập tức.

### Ai được dùng một skill

**Phạm vi hiển thị** quyết định ai tìm thấy và nạp được skill:

| Phạm vi hiển thị | Ai được dùng |
|---|---|
| Riêng tư | Chỉ chủ sở hữu skill |
| Nội bộ | Chỉ những agent và thành viên được cấp quyền cụ thể |
| Công khai | Mọi agent và thành viên trong workspace |

> [!NOTE]
> Công khai nghĩa là công khai trong phạm vi workspace của bạn. Skill không được xuất bản sang workspace khác hay lên internet.

Skill còn quyền được cấp thì không thể chuyển sang **Riêng tư**; hãy thu hồi quyền trước. Trạng thái **Đã lưu trữ** tắt skill với agent, còn **Đã xoá** ẩn skill khỏi danh sách.

Skill còn thiếu phụ thuộc có thể chạy không đúng. Các gói được quản lý ở trang **Gói runtime**, và những gì bạn cài được phụ thuộc vào hình thức triển khai; xem [Tool tích hợp, MCP server và hook](/docs/console/tools-mcp-and-hooks).

## Bắt đầu từ một mẫu

Tab **Mẫu** hiển thị các skill của workspace làm điểm khởi đầu cho agent mới. Bạn có thể lọc theo danh mục hoặc chọn **Tất cả**.

::shot{id="skill-templates"}

Chọn **Xem trước yêu cầu** trên một mẫu để xem các điều kiện của nó. Một mẫu sẵn sàng khi cả ba điều kiện sau đều đạt:

1. Runtime của workspace đã kết nối.
2. Skill của mẫu đang ở trạng thái hoạt động.
3. Không có phụ thuộc nào bị báo thiếu.

Khi mẫu đã sẵn sàng, chọn **Dùng mẫu**. Trang **Agent** mở hộp thoại tạo agent với mẫu đó được chọn sẵn; bạn tiếp tục như mô tả ở trang [Agent](/docs/console/agents).

Nếu tab trống, nghĩa là chưa có skill nào trong workspace có thể khởi tạo agent, hoặc runtime chưa kết nối được.

## Liên quan

- [Skill](/docs/concepts/skills)
- [Agent](/docs/console/agents)
- [Tool tích hợp, MCP server và hook](/docs/console/tools-mcp-and-hooks)
- [Tool và quyền hạn](/docs/concepts/tools-and-permissions)
- [Tham chiếu CLI](/docs/runtime/cli)
