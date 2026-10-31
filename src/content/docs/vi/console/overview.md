---
title: Làm quen với console
description: Cách đăng nhập console dewee, chuyển giữa các workspace, nắm các nhóm menu, đọc trạng thái runtime và biết mỗi khu vực của console được hướng dẫn ở trang nào.
section: console
order: 1
screens: [sign-in, overview]
updated: 2026-10-14
---

Console là nơi bạn vận hành một workspace dewee hằng ngày. Agent, kênh chat, tri thức, giám sát và quản trị nằm chung một chỗ, và khu vực nào cũng kiểm tra vai trò của bạn trước khi hiển thị hay thay đổi dữ liệu. Trang này nói về cách đăng nhập, bố cục console, những gì thay đổi theo hình thức triển khai và nơi giải thích từng khu vực.

## Đăng nhập

Trên console do dewee vận hành, chọn **Tiếp tục với GitHub** hoặc **Tiếp tục với Google**, hoặc nhập **Email công việc** rồi chọn **Gửi liên kết đăng nhập**. Không có mật khẩu. Liên kết đăng nhập chỉ dùng được một lần và hết hạn sau 15 phút; nếu liên kết đã hết hạn, hãy yêu cầu liên kết mới từ trang đăng nhập.

::shot{id="sign-in"}

Console bạn tự cài đặt cho đăng nhập bằng **Email** và **Mật khẩu**. GitHub, Google và liên kết qua email chỉ xuất hiện khi người vận hành đã cấu hình chúng. Nếu quên mật khẩu, trang đăng nhập hiển thị lệnh cần chạy trên máy đã cài dewee.

Lời mời tham gia workspace cũng dùng cách đăng nhập này. Bạn đăng nhập bằng đúng email đã nhận lời mời rồi tham gia workspace. Xem [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys).

## Workspace và bộ chuyển workspace

Mọi thứ trong console đều thuộc về một workspace, và mỗi workspace gắn với một tenant riêng trên runtime. Nếu bạn thuộc nhiều workspace, hãy dùng bộ chuyển workspace ở đầu thanh menu để đổi qua lại. Vai trò được gán theo từng workspace, nên cùng một người có thể là chủ sở hữu ở workspace này và là thành viên ở workspace khác.

Ô **Tìm kiếm hoặc chuyển tới…** trên thanh trên cùng, hoặc phím ⌘K / Ctrl+K, giúp bạn nhảy thẳng tới bất kỳ khu vực nào theo tên.

## Các nhóm menu

Thanh menu bên trái gom các khu vực theo mục đích:

| Nhóm | Khu vực |
|---|---|
| Workspace | Tổng quan, Trò chuyện, Phiên, Agent, Nhóm agent, Task & phê duyệt |
| Năng lực | Nhà cung cấp & mô hình, Kỹ năng, Máy chủ MCP, Gói runtime, Công cụ có sẵn, Lịch, Workflow, Hook, Giọng nói (TTS & STT) |
| Kết nối | Kênh, Kích hoạt theo sự kiện, Hộp ghép nối, Danh bạ, Tin nhắn đang chờ |
| Dữ liệu | Bộ nhớ, Kho tri thức, Đồ thị tri thức, Lưu trữ |
| Giám sát | Mức sử dụng, Hoạt động, Trace, Tình trạng runtime |
| Quản trị | Vai trò, Thành viên, API key & tài liệu, Thanh toán, Cài đặt, Sao lưu, Hỗ trợ, Cấu hình hệ thống, Nhập / xuất, Máy trạm |

Bạn chỉ thấy những khu vực mà vai trò và hình thức triển khai của bạn cho phép. Mỗi khu vực được bảo vệ bằng một khoá quyền, ví dụ `agents.manage` hay `observability.read`. Chủ workspace có mọi quyền, vai trò Admin có sẵn giữ mọi khoá quyền, còn Member chỉ có những quyền mà vai trò tuỳ chỉnh của họ cấp. Trang hướng dẫn của từng khu vực đều ghi rõ khoá quyền cần có.

## Những gì phụ thuộc vào hình thức triển khai

dewee có bốn hình thức triển khai: Tự cài đặt, AaaS, Dedicated và On-Premises (xem [Các hình thức triển khai](/docs/get-started/deployment-options)). Với Tự cài đặt, bạn mở console ngay trên máy của mình tại `http://localhost:4321`. Console giống nhau ở mọi hình thức, chỉ khác ở các điểm sau:

- **Thanh toán** chỉ xuất hiện trên console do dewee vận hành. Console bạn tự cài đặt không hiển thị mục này.
- **Cấu hình hệ thống**, **Nhập / xuất** và **Máy trạm** chỉ có trên Dedicated và On-Premises, và chỉ chủ workspace mới dùng được.
- **Gắn giấy phép** cũng chỉ có trên Dedicated và On-Premises, chỉ dành cho chủ workspace, và không nằm trên thanh menu; xem [Kích hoạt license](/docs/runtime/licence).
- **Sao lưu** do đội vận hành quản lý trên AaaS, còn trên Dedicated và On-Premises thì bạn tự thực hiện.
- **Kênh** trên Tự cài đặt cần license key, do chủ workspace kích hoạt trong console; xem [Tự cài đặt dewee](/docs/get-started/self-install).

## Trạng thái runtime

Nhãn trạng thái ở đầu console hiển thị **Runtime đã sẵn sàng**, **Runtime đang thiết lập** hoặc **Runtime gặp lỗi**. Chọn nhãn này để xem trạng thái, chế độ, **Mã tham chiếu hỗ trợ** của workspace, chính sách package, cùng nút **Tình trạng runtime**. Những khu vực làm việc trực tiếp với runtime, như Trò chuyện, cần runtime sẵn sàng. Xem [Mức sử dụng, hoạt động, trace và tình trạng runtime](/docs/console/monitoring).

## Trang Tổng quan

**Tổng quan** là trang đầu tiên của mỗi workspace. Khi việc thiết lập chưa xong, trang hướng dẫn bạn thiết lập workspace và các mục còn lại trên menu vẫn bị đóng.

- Trong lúc runtime đang được cấp phát, thanh tiến trình hiển thị ba bước: **Runtime**, **Nhà cung cấp** và **Super Agent**. Dùng **Làm mới trạng thái** để kiểm tra lại. Nếu cấp phát thất bại, dùng **Thử thiết lập lại** hoặc **Mở hỗ trợ**.
- Khi runtime đã chạy, **Trợ lý thiết lập** hỏi bạn vài câu và lo phần còn lại. Chọn **Tự thiết lập thủ công** để dùng các biểu mẫu theo bước: **Kết nối provider**, sau đó **Tạo Super Agent**.
- Thành viên không được phép thay đổi thiết lập sẽ thấy **Chủ sở hữu workspace đang hoàn tất thiết lập** cho tới khi chủ sở hữu hoặc quản trị viên làm xong.

Sau khi thiết lập xong, Tổng quan trở thành bảng điều khiển cho biết workspace đang vận hành ra sao: yêu cầu, token, chi phí, độ trễ và lỗi trong khoảng thời gian bạn chọn, kèm **So sánh** với kỳ trước và **Xuất tóm tắt**. Bên dưới là **Bảng xếp hạng** agent và kênh hàng đầu, cùng các khung **Phê duyệt đang chờ**, **Trace thất bại gần đây** và **Tình trạng runtime**. Ngày được tính theo ngày lịch UTC, giống trang Mức sử dụng.

::shot{id="overview"}

> [!NOTE]
> Ảnh chụp màn hình trong các trang này lấy từ một workspace demo tên "Acme Support" với dữ liệu mẫu. Tên, con số và nhãn gói dịch vụ trong ảnh chỉ là ví dụ, không phải giá trị mặc định hay bảng giá.

## Mỗi khu vực được hướng dẫn ở đâu

| Khu vực trong console | Trang tài liệu |
|---|---|
| Trò chuyện, Phiên | [Chat và phiên hội thoại](/docs/console/chat-and-sessions) |
| Agent | [Agent](/docs/console/agents) |
| Nhóm agent, Task & phê duyệt | [Nhóm agent và phê duyệt](/docs/console/agent-teams) |
| Nhà cung cấp & mô hình | [Provider và model](/docs/console/providers-and-models) |
| Kỹ năng, mẫu | [Skill và mẫu skill](/docs/console/skills) |
| Công cụ có sẵn, Máy chủ MCP, Hook, Gói runtime, Giọng nói | [Tool tích hợp, MCP server và hook](/docs/console/tools-mcp-and-hooks) |
| Lịch, Workflow | [Lịch chạy và workflow](/docs/console/schedules-and-workflows) |
| Kênh, Hộp ghép nối, Danh bạ, Tin nhắn đang chờ | [Kênh, ghép nối và danh bạ](/docs/console/channels-and-contacts) |
| Bộ nhớ, Kho tri thức, Đồ thị tri thức, Lưu trữ | [Bộ nhớ, kho tri thức và lưu trữ](/docs/console/memory-and-knowledge) |
| Mức sử dụng, Hoạt động, Trace, Tình trạng runtime | [Mức sử dụng, hoạt động, trace và tình trạng runtime](/docs/console/monitoring) |
| Thành viên, Vai trò, API key & tài liệu | [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys) |
| Cài đặt, Sao lưu và các khu vực quản trị chỉ dành cho chủ workspace | [Cài đặt và sao lưu](/docs/console/settings-and-backup) |
| Hỗ trợ, Thanh toán | [Hỗ trợ và thanh toán](/docs/console/support-and-billing) |

## Liên quan

- [Bắt đầu nhanh](/docs/get-started/quickstart)
- [dewee hoạt động thế nào](/docs/get-started/how-it-works)
- [Tách biệt đa tenant](/docs/concepts/multi-tenancy)
- [Secret, vai trò và nhật ký kiểm toán](/docs/security/secrets-roles-and-audit)
