---
title: Agent
description: "Tạo và quản lý các agent trong workspace: model, chỉ dẫn và file ngữ cảnh, skill và tool, ai được dùng agent, cùng heartbeat và cơ chế tự cải thiện."
section: console
order: 3
screens: [agents]
updated: 2026-09-25
---

Agent là một trợ lý đã được cấu hình và chạy trên runtime của workspace. Mỗi agent có model riêng, chỉ dẫn và file ngữ cảnh riêng, cùng một bộ skill và tool mà nó được phép dùng. Mọi người làm việc với agent qua Chat, các kênh chat đã kết nối, lịch chạy, workflow hoặc API. Trang **Agent** là nơi bạn tạo agent và giữ cho chúng hoạt động đúng ý.

## Ai được dùng

Để mở **Agent**, bạn cần khoá quyền `agents.manage`. Việc tạo, sửa, tắt hoặc xoá agent, và thay đổi ai được dùng agent, còn đòi hỏi bạn là chủ workspace hoặc có vai trò Admin. Với những người khác, trang chỉ cho xem. Xem [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys).

## Một agent gồm những gì

| Thành phần | Là gì | Thiết lập ở đâu |
|---|---|---|
| Provider và model | Provider đã kết nối và model mà agent gọi tới | Trình tạo agent, **Profile** |
| Chỉ dẫn và file ngữ cảnh | Các file nằm trong danh sách cho phép, như `AGENTS.md` và `SOUL.md`, định hình system prompt | Tab **Files** |
| Skill | Các bộ chỉ dẫn dùng lại được mà agent có thể nạp | [Skill](/docs/console/skills) |
| Tool | Tool tích hợp và tool từ MCP server mà agent được gọi | [Tool tích hợp, MCP server và hook](/docs/console/tools-mcp-and-hooks) |
| Kênh | Các ứng dụng chat có tin nhắn được chuyển tới agent này | [Kênh](/docs/console/channels-and-contacts) |
| Quyền truy cập | Thành viên hoặc vai trò được **View**, **Use** hoặc **Manage** agent | Tab **Grants** |

Console không bao giờ hiển thị prompt riêng của runtime, đường dẫn file ngữ cảnh hay ID nội bộ.

## Agent predefined và agent open

Mỗi agent có một loại, được chọn khi tạo:

- **Predefined**: file ngữ cảnh thuộc về agent và giống nhau với mọi người, kèm một file `USER.md` riêng cho từng người dùng. Phù hợp với agent hỗ trợ khách hàng hay agent vận hành có vai trò cố định.
- **Open**: mọi file ngữ cảnh được lưu riêng theo từng người dùng, nên mỗi người tự định hình agent theo cách của mình.

Agent đầu tiên của bạn, super-agent, được tạo trong lúc thiết lập. Ở **Tổng quan**, bạn chọn một model từ provider đã kết nối, chọn **Verify health**, rồi **Create Super Agent**. Đây là agent riêng của workspace, dùng cho chat và các tool an toàn trong workspace.

## Tìm một agent

Danh sách hiển thị từng agent kèm loại, chủ sở hữu, provider, model, quyền truy cập và trạng thái. Bạn có thể tìm theo tên, lọc theo **Status** (Active, Inactive, Summoning hoặc Summon Failed) và **Type** (Predefined hoặc Open).

::shot{id="agents"}

## Tạo agent

1. Chọn **New agent**.
2. **Template**: bắt đầu từ một mẫu, hoặc tạo agent trống.
3. **Profile**: nhập tên (từ 2 đến 80 ký tự), emoji nếu muốn và phần mô tả tối đa 600 ký tự.
4. **Provider & model**: chọn một provider đã kết nối và một model của provider đó. Nếu chưa có provider nào, hãy thêm trước ở [Provider và model](/docs/console/providers-and-models).
5. **Capabilities**: ghi lại những skill, MCP server và tool tích hợp mà agent sẽ cần. Bạn cấp chúng trên trang riêng của từng mục sau khi agent đã được tạo.
6. **Context**: chọn loại agent và, nếu cần, context window (0 đến 2.000.000 token), số vòng gọi tool (0 đến 100), prompt mode, mức độ suy luận, số token tối đa và cập nhật trạng thái tác vụ. Để trống một trường để giữ mặc định của runtime.
7. Xem lại ở **Review** rồi chọn **Create agent**.

## Quản lý agent

Chọn **Manage** trên một dòng để mở các tab chi tiết:

- **Profile**, **Status** và **Context**: tên, mô tả, provider, model và các giới hạn.
- **Grants**: cấp quyền **View**, **Use** hoặc **Manage** cho một thành viên hay một vai trò trong workspace. Mỗi lần cấp hoặc thu hồi quyền đều được ghi vào nhật ký audit.
- **Files**: đọc và sửa các file ngữ cảnh trong danh sách cho phép, kèm bản xem trước prompt ở chế độ chỉ đọc.
- **Heartbeat**: đánh thức agent theo chu kỳ (tối thiểu 300 giây) trong khung giờ hoạt động và múi giờ bạn chọn, và chạy thử.
- **Evolution**: xem các đề xuất được rút ra từ chính số liệu của agent, rồi chấp nhận, từ chối hoặc hoàn tác.
- **Routing**: chỉ xuất hiện với agent định tuyến qua một nhóm tài khoản OAuth ChatGPT/Codex.
- **Activity**: đường dẫn tới trace và sự kiện của agent.

Các thiết lập nâng cao như model dự phòng, compaction, cắt tỉa ngữ cảnh, bộ nhớ, sandbox và sub-agent được chỉnh dưới dạng JSON cho từng agent. Thiết lập áp dụng cho toàn runtime không chỉnh được ở đây.

## Tắt hoặc xoá

**Disable** dừng agent nhưng giữ lại profile và quyền truy cập để bạn xem xét sau. **Delete** xoá profile của agent trên runtime. Agent mặc định của workspace không xoá được.

> [!WARNING]
> Xoá agent là không thể hoàn tác. Nếu có thể còn cần tới agent, hãy tắt nó trước.

## Liên quan

- [Vòng lặp agent](/docs/concepts/agent-loop)
- [Tool và quyền hạn](/docs/concepts/tools-and-permissions)
- [Skill](/docs/concepts/skills)
- [Lịch chạy và heartbeat](/docs/concepts/schedules-and-heartbeat)
- [Nhóm agent và phê duyệt](/docs/console/agent-teams)
