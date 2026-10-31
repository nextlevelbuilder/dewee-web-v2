---
title: Skill
description: Cách skill trong dewee được đóng gói, tìm và nạp vào prompt, ai được dùng, cách agent tự xuất bản skill, và cách skill được cải thiện dần qua bước xem xét.
section: concepts
order: 5
updated: 2026-10-14
---

Skill là một bộ hướng dẫn dùng lại được, kèm script và file tham khảo tuỳ chọn, mà agent nạp vào khi công việc cần tới. Skill giúp system prompt gọn nhẹ: agent chỉ thấy một dòng tóm tắt của mỗi skill và chỉ đọc hướng dẫn đầy đủ khi thật sự cần.

## Skill là gì

Skill là một thư mục có file `SKILL.md` ở gốc, cùng các file đi kèm như `scripts/` hoặc `references/`. File bắt đầu bằng phần front matter:

```yaml
---
name: invoice-review
slug: invoice-review
description: Check supplier invoices against purchase orders and flag mismatches.
deps:
  - pip:openpyxl
  - system:pandoc
---
```

`name` và `description` là những gì agent nhìn thấy khi chọn skill. `deps` liệt kê những gì skill cần, với các tiền tố `pip:`, `npm:`, `github:` và `system:`; `exclude_deps` loại bỏ các kết quả sai khi dewee tự quét script. Kiểm tra và cài đặt chúng bằng `dewee skills deps check` và `dewee skills deps install`.

## Skill đến từ đâu

Skill được nạp từ năm tầng. Khi hai tầng có skill trùng tên, tầng cao hơn thắng.

| Tầng | Nguồn |
|---|---|
| 1 (cao nhất) | Workspace của agent |
| 2 | Skill của dự án trong thư mục `.agents` của workspace |
| 3 | Skill cá nhân trong `~/.agents` |
| 4 | Skill toàn cục và skill được quản lý do runtime lưu, gồm cả skill tải lên |
| 5 (thấp nhất) | Skill tích hợp đi kèm dewee |

Các core skill tích hợp gồm `pdf`, `docx`, `xlsx`, `pptx`, `skill-creator`, `workspace-organizing` (beta) và `dewee`. Chúng công khai cho mọi agent, không chỉnh sửa được, và bị lưu trữ (archive) nếu thiếu dependency. Thay đổi trên file `SKILL.md` được nhận ở lượt kế tiếp, sau khoảng chờ 500 ms.

## Agent tìm đúng skill như thế nào

Nếu agent được dùng từ 60 skill trở xuống và phần tóm tắt của chúng vừa khoảng 3.000 token, toàn bộ tóm tắt được đưa vào prompt. Vượt quá mức đó, prompt hướng dẫn agent gọi `skill_search`, tool này xếp hạng skill bằng tìm kiếm từ khoá (BM25, lấy 5 kết quả đầu) kết hợp độ tương đồng vector theo tỉ trọng 0,3 và 0,7. Tối đa 10 skill được ghim (`other_config.pinned_skills`) luôn có mặt trong prompt.

Khi đã chọn xong, agent gọi `use_skill` để ghi nhận skill đang được dùng, rồi đọc `SKILL.md` của nó. Người dùng cũng có thể chọn skill ngay ở đầu tin nhắn:

| Lệnh | Tác dụng |
|---|---|
| `/<slug> <prompt>` | Chạy prompt với skill đó |
| `/use <slug-or-name> <prompt>` | Tương tự, theo slug hoặc tên hiển thị |
| `/list-skills` | Liệt kê các skill dùng được ở đây |
| `/help <slug-or-name>` | Cho biết skill làm gì và dùng thế nào |

Lệnh slash được bật sẵn và có thể tắt theo tenant bằng `skills.slash_commands.enabled`.

## Quyền truy cập và cấp quyền

Mỗi skill có một chế độ truy cập, hiển thị trong console ở mục **Phạm vi hiển thị**:

| Chế độ | Ai được dùng |
|---|---|
| `private` | Chỉ người dùng sở hữu skill |
| `internal` | Agent và người dùng được cấp quyền rõ ràng |
| `public` | Mọi agent và người dùng trong tenant |

"Public" nghĩa là toàn bộ tenant, không phải công khai trên internet. Ngoài ra, danh sách skill được phép của agent có thể thu hẹp thêm: để trống (không đặt) nghĩa là mọi skill truy cập được, còn danh sách rỗng nghĩa là không có skill nào. Kênh có thể thu hẹp tiếp theo từng request, ví dụ theo từng forum topic trên Telegram.

Quyền được áp dụng ngay khi agent chạy, không chỉ ở danh sách skill agent nhìn thấy. Agent không được dùng một skill thì không kích hoạt được skill đó, và các công cụ đọc file cũng như lệnh shell của agent bị từ chối khi trỏ vào file của skill đó, kể cả các phiên bản đã lưu trước; kết quả liệt kê thư mục và tìm kiếm file sẽ bỏ qua skill này. Mỗi lần từ chối đều được ghi vào trace của lượt chạy, và nhật ký hoạt động cũng ghi nhận (các lần lặp lại được gộp chung).

```bash
dewee skills access set <skill-id> --mode internal
dewee skills grant agent <skill-id> <agent-id>
dewee skills access effective <skill-id> --agent <agent-id>
```

## Thêm và xuất bản skill

- **Tải lên.** `dewee skills upload <dir-or-zip>` đóng gói một thư mục hoặc gửi file ZIP có sẵn, và skill xuất hiện trong mục skill tuỳ chỉnh của console. Giới hạn kích thước mặc định là 20 MB, có thể chỉnh từ 1 đến 500 MB. `dewee skills promote <slug>` tải lên một skill cá nhân từ `~/.agents`. `dewee skills update <skill-id>` đổi tên, mô tả, thẻ hoặc chế độ hiển thị của skill, còn `dewee skills delete <skill-id> --yes` xoá skill; người có quyền `edit` hoặc `manage` trên skill có thể chạy các lệnh này bằng API key của chính họ (xem [Cấp quyền theo tài nguyên](/docs/security/access-grants)).
- **Bộ lọc nội dung.** Trước khi ghi bất cứ thứ gì, `SKILL.md` được quét theo 25 quy tắc về lệnh phá huỷ, chèn mã, truy cập thông tin xác thực, duyệt thư mục trái phép, lệnh xoá bảng SQL và leo thang đặc quyền. Chỉ cần khớp một quy tắc là skill bị từ chối. `SKILL.md` tối đa 100 KB, mỗi file văn bản đi kèm tối đa 2 MB.
- **Agent tự xuất bản.** Agent có thể xuất bản một thư mục trong workspace bằng `publish_skill`. Skill mới thuộc riêng người dùng và được cấp cho agent đó, nên chuyển thành `internal`. Xuất bản lại cùng slug sẽ tạo phiên bản mới. Slug của skill tích hợp được giữ riêng.
- **Agent tự chỉnh sửa.** Với `skill_manage`, chỉ có khi tính năng học skill đang bật, agent có thể tạo, sửa hoặc xoá các skill mà nó sở hữu. Skill bị xoá được chuyển vào thư mục thùng rác và bị xoá hẳn sau 7 ngày.
- **Giữ phiên bản.** Mỗi phiên bản là một thư mục riêng trên đĩa. Gateway giữ phiên bản hiện tại, 5 phiên bản ngay trước nó (`skills.versions.retain_previous`, giá trị âm thì giữ mọi phiên bản), mọi phiên bản đang được grant của agent ghim, và mọi phiên bản vừa bị thay trong 24 giờ qua để tác vụ đang chạy hoàn tất. File của skill đã xoá bị dọn sau 7 ngày kể từ lúc xoá. Lịch sử phiên bản vẫn được liệt kê, nhưng file của phiên bản đã dọn không còn đọc được. Phiên bản được ghim không chiếm 5 suất giữ lại. Nếu gateway dừng giữa lúc upload, phiên bản ghi dở được chuyển vào thư mục thùng rác sau 24 giờ, nên lần upload tiếp theo của skill đó không còn bị từ chối vì xung đột. Skill đã xoá không thể bật lại; hãy upload lại. Sửa skill qua API chỉ đổi được tên, mô tả, tag, phạm vi hiển thị và trạng thái (active hoặc archived); muốn xoá skill thì dùng thao tác xoá.

## Cải thiện skill theo thời gian

Hai tính năng riêng biệt giúp skill tốt dần lên, và không tính năng nào thay đổi skill mà không qua xem xét.

**Học skill** (`skill_evolve` trong `other_config` của agent, mặc định tắt, chỉ dành cho agent predefined) dạy agent nhận ra khi nào một việc đáng lưu lại. Tính năng này thêm hướng dẫn vào prompt, nhắc nhở khi dùng tới 70% và 90% số vòng lặp cho phép, và sau một việc có ít nhất 15 lệnh gọi tool (`skill_nudge_interval`) sẽ hỏi người dùng "save as skill" hay "skip". Không có gì được lưu nếu người dùng chưa trả lời.

**Tự cải tiến skill** theo dõi hiệu quả của từng skill. Các lần chạy `use_skill` và lệnh slash được ghi lại, agent có thể đọc các trace gần đây của chính mình làm bằng chứng, và các đề xuất cải tiến được xếp vào hàng chờ. Chế độ là `suggest_only` (mặc định) hoặc `auto_analyze`, và ở cả hai chế độ, skill đều không bị tự động sửa. Quản trị viên phê duyệt và áp dụng đề xuất, việc này tạo ra phiên bản mới; skill tích hợp không bao giờ bị thay đổi.

```bash
dewee skills evolve status <skill>
dewee skills metrics <skill>
dewee skills suggestions list <skill>
dewee skills suggestions apply <skill> <suggestion-id> --approve
```

## Liên quan

- [Skill trong console](/docs/console/skills): duyệt, tải lên và cấp quyền skill.
- [Tool và quyền hạn](/docs/concepts/tools-and-permissions): các tool mà script của skill chạy qua.
- [Vòng lặp agent](/docs/concepts/agent-loop): prompt được dựng thế nào ở mỗi lượt.
- [Tham chiếu CLI](/docs/runtime/cli): toàn bộ lệnh `dewee skills`.
- [Cấp quyền theo tài nguyên](/docs/security/access-grants): quyền use, edit và manage trên một skill, và những gì bị từ chối khi chạy.
- [Mô hình bảo mật](/docs/security/overview): các lớp kiểm soát khác đối với nội dung do agent viết.
