---
title: Làm quen với console
description: Cách đăng nhập console dewee, chuyển giữa các workspace, nắm các nhóm menu, đọc trạng thái runtime và biết mỗi khu vực của console được hướng dẫn ở trang nào.
section: console
order: 1
screens: [sign-in, overview]
updated: 2026-09-25
---

Console là nơi bạn vận hành một workspace dewee hằng ngày. Agent, kênh chat, tri thức, giám sát và quản trị nằm chung một chỗ, và khu vực nào cũng kiểm tra vai trò của bạn trước khi hiển thị hay thay đổi dữ liệu. Trang này nói về cách đăng nhập, bố cục console, những gì thay đổi theo hình thức triển khai và nơi giải thích từng khu vực.

## Đăng nhập

Chọn **Continue with GitHub**, **Continue with Google**, hoặc nhập email công việc để nhận đường link đăng nhập. Không có mật khẩu. Link gửi qua email có hiệu lực 15 phút và chỉ dùng được một lần; nếu link đã hết hạn, hãy yêu cầu link mới từ trang đăng nhập.

::shot{id="sign-in"}

Lời mời tham gia workspace cũng dùng cách đăng nhập này. Bạn đăng nhập bằng đúng email đã nhận lời mời rồi tham gia workspace. Xem [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys).

## Workspace và bộ chuyển workspace

Mọi thứ trong console đều thuộc về một workspace, và mỗi workspace gắn với một tenant riêng trên runtime. Nếu bạn thuộc nhiều workspace, hãy dùng bộ chuyển workspace ở đầu thanh menu để đổi qua lại. Vai trò được gán theo từng workspace, nên cùng một người có thể là chủ sở hữu ở workspace này và là thành viên ở workspace khác.

Ô tìm kiếm trên thanh trên cùng giúp bạn nhảy thẳng tới bất kỳ khu vực nào theo tên.

## Các nhóm menu

Thanh menu bên trái gom các khu vực theo mục đích:

| Nhóm | Khu vực |
|---|---|
| Workspace | Tổng quan, Chat, Phiên hội thoại, Agent, Nhóm agent, Tác vụ & phê duyệt |
| Năng lực | Provider & model, Skill, MCP server, Gói runtime, Tool tích hợp, Lịch chạy, Workflow, Hook, Giọng nói (TTS & STT) |
| Kết nối | Kênh, Hộp ghép cặp, Danh bạ, Tin nhắn chờ |
| Dữ liệu | Bộ nhớ, Kho tri thức, Đồ thị tri thức, Lưu trữ |
| Giám sát | Mức sử dụng, Nhật ký hoạt động, Trace, Sức khoẻ runtime |
| Quản trị | Thành viên, Vai trò, API key & tài liệu, Thanh toán, Cài đặt, Sao lưu, Hỗ trợ |

Mỗi khu vực được bảo vệ bằng một khoá quyền, ví dụ `agents.manage` hay `observability.read`. Chủ workspace có mọi quyền, vai trò Admin có sẵn giữ mọi khoá quyền, còn Member chỉ có những quyền mà vai trò tuỳ chỉnh của họ cấp. Trang hướng dẫn của từng khu vực đều ghi rõ khoá quyền cần có.

## Những gì phụ thuộc vào hình thức triển khai

dewee có ba hình thức triển khai: AaaS, Dedicated và On-Premises (xem [Các hình thức triển khai](/docs/get-started/deployment-options)). Tại Việt Nam, dewee chỉ được cung cấp dưới hình thức On-Premises. Console giống nhau ở cả ba hình thức, chỉ khác ở các điểm sau:

- **Thanh toán** chỉ xuất hiện ở workspace AaaS, nên bạn sẽ không thấy mục này trên workspace On-Premises.
- **Cấu hình hệ thống**, **Workstation** và **Nhập / Xuất** chỉ có trên Dedicated và On-Premises, và chỉ chủ workspace mới dùng được.
- **Gắn license** cũng chỉ có trên Dedicated và On-Premises, chỉ dành cho chủ workspace, và không nằm trên thanh menu; xem [Kích hoạt license](/docs/runtime/licence).
- **Sao lưu** do đội vận hành quản lý trên AaaS, còn trên Dedicated và On-Premises thì bạn tự thực hiện.

## Trạng thái runtime

Chỉ báo trạng thái ở đầu console cho biết runtime của workspace đã sẵn sàng, đang được thiết lập hay đã gặp lỗi. Những khu vực làm việc trực tiếp với runtime, như Chat, cần runtime sẵn sàng. Nếu chưa, hãy mở **Sức khoẻ runtime** để xem bước kiểm tra nào thất bại; xem [Mức sử dụng, hoạt động, trace và sức khoẻ runtime](/docs/console/monitoring).

## Trang Tổng quan

**Tổng quan** là trang đầu tiên của mỗi workspace. Khi việc thiết lập chưa xong, trang hiển thị checklist **Finish setting up your workspace**, bắt đầu từ runtime, model provider và super-agent, cùng nút **Continue setup** đưa bạn tới bước kế tiếp. Khi đã thiết lập xong, trang dẫn bạn tới các khu vực chính: xây dựng agent, vận hành, tri thức, giám sát, kết nối và quản trị.

::shot{id="overview"}

> [!NOTE]
> Ảnh chụp màn hình trong các trang này lấy từ một workspace demo tên "Acme Support" với dữ liệu mẫu. Tên, con số và nhãn gói dịch vụ trong ảnh chỉ là ví dụ, không phải giá trị mặc định hay bảng giá.

## Mỗi khu vực được hướng dẫn ở đâu

| Khu vực trong console | Trang tài liệu |
|---|---|
| Chat, Phiên hội thoại | [Chat và phiên hội thoại](/docs/console/chat-and-sessions) |
| Agent | [Agent](/docs/console/agents) |
| Nhóm agent, Tác vụ & phê duyệt | [Nhóm agent và phê duyệt](/docs/console/agent-teams) |
| Provider & model | [Provider và model](/docs/console/providers-and-models) |
| Skill, mẫu skill | [Skill và mẫu skill](/docs/console/skills) |
| Tool tích hợp, MCP server, Hook, Gói runtime, Giọng nói | [Tool tích hợp, MCP server và hook](/docs/console/tools-mcp-and-hooks) |
| Lịch chạy, Workflow | [Lịch chạy và workflow](/docs/console/schedules-and-workflows) |
| Kênh, Hộp ghép cặp, Danh bạ, Tin nhắn chờ | [Kênh, ghép cặp và danh bạ](/docs/console/channels-and-contacts) |
| Bộ nhớ, Kho tri thức, Lưu trữ | [Bộ nhớ, kho tri thức và lưu trữ](/docs/console/memory-and-knowledge) |
| Mức sử dụng, Nhật ký hoạt động, Trace, Sức khoẻ runtime | [Mức sử dụng, hoạt động, trace và sức khoẻ runtime](/docs/console/monitoring) |
| Thành viên, Vai trò, API key & tài liệu | [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys) |
| Cài đặt, Sao lưu và các khu vực quản trị chỉ dành cho chủ workspace | [Cài đặt và sao lưu](/docs/console/settings-and-backup) |
| Hỗ trợ, Thanh toán | [Hỗ trợ và thanh toán](/docs/console/support-and-billing) |

## Liên quan

- [Bắt đầu nhanh](/docs/get-started/quickstart)
- [dewee hoạt động thế nào](/docs/get-started/how-it-works)
- [Tách biệt đa tenant](/docs/concepts/multi-tenancy)
- [Secret, vai trò và nhật ký kiểm toán](/docs/security/secrets-roles-and-audit)
