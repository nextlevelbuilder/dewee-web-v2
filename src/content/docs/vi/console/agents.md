---
title: Agent
description: "Tạo và quản lý các agent trong workspace: mô hình, chỉ dẫn và tệp ngữ cảnh, kỹ năng và công cụ, ai được dùng agent, cùng heartbeat và tối ưu hóa."
section: console
order: 3
screens: [agents]
updated: 2026-10-14
---

Agent là một trợ lý đã được cấu hình và chạy trên runtime của workspace. Mỗi agent có mô hình riêng, chỉ dẫn và tệp ngữ cảnh riêng, cùng một bộ skill và công cụ mà nó được phép dùng. Mọi người làm việc với agent qua Trò chuyện, các kênh đã kết nối, lịch chạy, workflow hoặc API. Trang **Agent** là nơi bạn tạo agent và giữ cho chúng hoạt động đúng ý.

## Ai được dùng

Để mở **Agent**, bạn cần khoá quyền `agents.manage`. Nếu thiếu, trang sẽ báo vai trò của bạn không có quyền quản lý agent. Việc tạo, sửa, tạm dừng hoặc xoá agent còn đòi hỏi bạn là chủ workspace hoặc có vai trò Admin; người khác có `agents.manage` chỉ xem được trang. Các agent dựng sẵn mang nhãn **Hệ thống** chỉ xem được với mọi người.

Quản trị viên workspace và người có quyền **Quản lý** trên một agent được thay đổi ai dùng agent đó. Người khác vẫn xem được danh sách, kèm thông báo chỉ được xem. Xem [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys).

## Một agent gồm những gì

| Thành phần | Là gì | Thiết lập ở đâu |
|---|---|---|
| Nhà cung cấp và mô hình | Nhà cung cấp đã kết nối và mô hình mà agent gọi tới | Hộp thoại **Agent mới**, tab **Hồ sơ** |
| Chỉ dẫn và tệp ngữ cảnh | Các tệp nằm trong danh sách cho phép, như `SOUL.md` và `IDENTITY.md`, định hình system prompt | Tab **Chỉ dẫn** |
| Kỹ năng | Các bộ chỉ dẫn dùng lại được mà agent có thể nạp | Tab **Kỹ năng**, hoặc [Skill](/docs/console/skills) |
| Công cụ | Công cụ tích hợp sẵn và công cụ từ máy chủ MCP mà agent được gọi | Tab **MCP**, hoặc [Tool tích hợp, MCP server và hook](/docs/console/tools-mcp-and-hooks) |
| Kênh | Các ứng dụng chat có tin nhắn được chuyển tới agent này | Tab **Kênh**, hoặc [Kênh](/docs/console/channels-and-contacts) |
| Quyền truy cập | Những người được **Dùng** hoặc **Quản lý** agent | Tab **Phân quyền**, hoặc **Quyền cấp** trong bảng xem nhanh |

Console không bao giờ hiển thị prompt riêng của runtime, đường dẫn tệp ngữ cảnh hay ID nội bộ.

## Agent định sẵn và agent mở

Mỗi agent có một loại, được chọn khi tạo:

- **Định sẵn**: agent làm theo chỉ dẫn của chính nó, giống nhau với mọi người. Phù hợp với agent hỗ trợ khách hàng hay agent vận hành có vai trò cố định.
- **Mở**: agent có thể tự định hình chỉ dẫn của mình, nên thích nghi với từng người dùng.

Agent đầu tiên của bạn, super agent, được tạo trong lúc thiết lập. Ở **Tổng quan**, bạn chọn một mô hình từ nhà cung cấp đã kết nối, chọn **Kiểm tra tình trạng**, rồi **Tạo Super Agent**. Đây là agent riêng của workspace, dùng cho trò chuyện và các công cụ an toàn trong workspace.

## Tìm một agent

Danh sách hiển thị từng agent kèm loại, mô hình, trạng thái, số yêu cầu và số lỗi trong 7 ngày qua. Bạn có thể tìm theo tên, khoá, mô tả, nhà cung cấp, mô hình hoặc chủ sở hữu, và lọc theo:

- **Trạng thái**: **Đang hoạt động**, **Đã tạm dừng**, **Đang thiết lập** hoặc **Thiết lập thất bại**.
- **Loại**: **Định sẵn** hoặc **Mở**.
- **Nhà cung cấp** và **Chủ sở hữu**.

Mỗi trang hiển thị 10 agent. Chọn nhiều dòng để **Tạm dừng** hoặc **Xoá** nhiều agent cùng lúc. **Mẫu** mở các mẫu skill trên trang [Skill](/docs/console/skills).

::shot{id="agents"}

Chọn một dòng để mở trang đầy đủ của agent. Menu của mỗi dòng còn có:

- **Xem nhanh**: một bảng bên cạnh với các tab **Hồ sơ**, **Trạng thái**, **Quyền cấp**, **Ngữ cảnh** và **Hoạt động**, cùng **Mở trang đầy đủ**, **Trò chuyện** và một menu gồm **Sửa hồ sơ**, **Tạm dừng** hoặc **Tiếp tục**, và **Xoá**.
- **Trò chuyện**: mở [Trò chuyện](/docs/console/chat-and-sessions) với agent này được chọn sẵn.
- **Tạm dừng** hoặc **Tiếp tục**, và **Xoá**.

## Tạo agent

1. Chọn **Agent mới**.
2. Chọn một thẻ mẫu, hoặc chọn **Bắt đầu từ đầu**. Mẫu được lấy từ các skill của workspace; nếu vai trò của bạn không xem được skill, chỉ có **Bắt đầu từ đầu**.
3. Điền biểu mẫu:
   - **Tên**: từ 2 đến 80 ký tự. Bắt buộc.
   - **Biểu tượng cảm xúc** và **Mô tả** (tối đa 600 ký tự): không bắt buộc.
   - **Nhà cung cấp** và **Mô hình**: chọn một nhà cung cấp đã kết nối và một mô hình của nhà cung cấp đó. Nếu chưa có nhà cung cấp nào, hãy thêm trước ở [Provider và model](/docs/console/providers-and-models).
   - **Kế hoạch năng lực**: chọn tối đa 4 mục trong **MCP servers**, **Skills**, **Công cụ tích hợp** và **Lịch chạy** để ghi lại những gì cần thiết lập tiếp theo. Ở đây chưa cấp gì cả; bạn cấp chúng trên các tab của agent sau khi agent đã được tạo.
4. Nếu cần, mở **Ngữ cảnh và giới hạn** để đặt **Loại agent**, **Context window** (0 đến 2.000.000 token), **Cập nhật trạng thái tác vụ**, **Số lần lặp công cụ** (0 đến 100), **Prompt mode**, **Mức độ suy luận** và **Max tokens**. Để trống một trường để giữ mặc định của runtime hoặc nhà cung cấp.
5. Nếu cần, mở **Cấu hình nâng cao** để dán thiết lập riêng của agent dưới dạng JSON.
6. Chọn **Tạo agent**. Agent mới mở trong bảng xem nhanh, ở tab **Hồ sơ**.

## Quản lý agent

Trang đầy đủ của agent có phần đầu với **Trò chuyện** và menu **Thêm** gồm **Tạm dừng** hoặc **Tiếp tục** và **Xóa agent**. Thay đổi trên một tab chỉ được lưu khi bạn lưu từ thanh hiện ra. Các tab gồm:

- **Tổng quan**: danh tính, số yêu cầu, tỷ lệ lỗi, kiểm tra tình trạng, các đề xuất tối ưu hóa đang chờ và các phiên gần đây.
- **Hồ sơ**: tên, emoji, mô tả, loại, trạng thái, nhà cung cấp và mô hình.
- **Chỉ dẫn**: đọc và sửa các tệp ngữ cảnh trong danh sách cho phép, trong giới hạn dung lượng của từng tệp.
- **Phân quyền**: những người được chia sẻ agent trong runtime. Quyền cấp mới gồm **Dùng**, để trò chuyện với agent, và **Quản lý**, để còn cấp hoặc thu hồi quyền truy cập. Quyền **Chỉnh sửa** hoặc **Quản trị** đã có vẫn hiện và đổi được, nhưng không được đề xuất khi cấp mới, vì sửa hoặc xoá agent ở đây vẫn cần quản trị viên workspace. Runtime ghi lại mọi thay đổi; xem [Cấp quyền theo tài nguyên](/docs/security/access-grants).
- **Kỹ năng**: cấp skill cho agent, mỗi skill cố định theo một phiên bản, hoặc thu hồi.
- **MCP**: cấp máy chủ MCP mà agent được gọi công cụ, hoặc thu hồi.
- **Hook**: thêm, bật hoặc xoá các hook chạy theo sự kiện của agent.
- **Kênh**: các kênh mà agent trả lời. Gắn kênh ở trang [Kênh](/docs/console/channels-and-contacts).
- **Phiên**: các cuộc trò chuyện mà agent đã tham gia.
- **Tối ưu hóa**: các đề xuất agent tự đưa ra cho chính nó, dựa trên số liệu của nó. **Duyệt** hoặc **Từ chối** một đề xuất đang chờ, hoặc **Hoàn tác** một đề xuất đã áp dụng.
- **Heartbeat**: đánh thức agent theo chu kỳ (tối thiểu 300 giây) trong khoảng **Hoạt động từ** đến **Hoạt động đến** theo một múi giờ, và **Chạy thử**.
- **Định tuyến**: chỉ xuất hiện với agent định tuyến qua một nhóm tài khoản OAuth ChatGPT/Codex.
- **Hoạt động**: các thay đổi gần đây của agent, kèm đường dẫn tới trace và sự kiện của nó.
- **Nâng cao**: thiết lập riêng của agent, chia theo nhóm: **Mô hình và suy luận**, **Ngữ cảnh và công cụ**, **Hành vi**, **Bộ nhớ và tri thức** và **Khả năng**. Thiết lập nào runtime chưa báo cáo thì vẫn hiện nhưng không đổi được. Cài đặt sandbox, advisor và thư mục làm việc do nhà vận hành nền tảng quản lý.

## Tạm dừng hoặc xoá

**Tạm dừng** khiến agent không trả lời trò chuyện và tin nhắn kênh mới. Hồ sơ, chỉ dẫn và quyền truy cập vẫn được giữ, và **Tiếp tục** bật agent trở lại. **Xoá** gỡ agent cùng cấu hình của nó. Các cuộc trò chuyện hiện có với agent sẽ ngừng hoạt động, và các kênh gắn với agent sẽ ngừng trả lời. Agent mặc định của workspace không xoá được.

> [!WARNING]
> Xoá agent là không thể hoàn tác. Nếu có thể còn cần tới agent, hãy tạm dừng thay vì xoá.

## Liên quan

- [Vòng lặp agent](/docs/concepts/agent-loop)
- [Tool và quyền hạn](/docs/concepts/tools-and-permissions)
- [Skill](/docs/concepts/skills)
- [Lịch chạy và heartbeat](/docs/concepts/schedules-and-heartbeat)
- [Nhóm agent và phê duyệt](/docs/console/agent-teams)
