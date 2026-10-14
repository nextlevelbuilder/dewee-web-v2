---
title: Provider và model
description: Kết nối nhà cung cấp LLM cho agent, kiểm tra thông tin xác thực trước khi lưu, chọn mô hình mặc định và quyết định agent nào được dùng nhà cung cấp nào.
section: console
order: 5
screens: [providers]
updated: 2026-10-14
---

Nhà cung cấp (provider) là dịch vụ LLM mà agent của bạn gọi tới, ví dụ Anthropic, OpenAI, Google Vertex AI hoặc một gateway tương thích OpenAI. Trang **Nhà cung cấp & mô hình** là nơi bạn kết nối nhà cung cấp với workspace, kiểm tra thông tin xác thực và chọn mô hình mặc định cho từng nhà cung cấp. Bạn cần có ít nhất một nhà cung cấp đã kết nối trước khi tạo agent hay bắt đầu chat.

## Ai được dùng

Để quản lý nhà cung cấp, bạn cần khoá quyền `provider.manage`. Chủ workspace và vai trò Admin có sẵn giữ khoá này; với Member, bạn cấp qua một vai trò tuỳ chỉnh. Xem [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys).

## Bạn thấy gì trên trang

Dải thống kê ở đầu trang đếm **Nhà cung cấp**, **Đã kết nối** và **Cần xử lý** (nhà cung cấp còn thiếu thông tin xác thực). Bảng liệt kê từng nhà cung cấp đã kết nối kèm **Trạng thái**, **Mô hình mặc định**, **URL gốc**, **Được dùng bởi** (số agent đang dùng) và **Cập nhật lần cuối**. Bạn có thể tìm theo tên, loại hoặc mô hình, và lọc theo trạng thái: **Đã kết nối**, **Thiếu thông tin xác thực** hoặc **Đã tắt**.

::shot{id="providers"}

Thông tin xác thực chỉ được gửi một lần tới runtime và được lưu ở đó dưới dạng mã hoá. Console không bao giờ hiển thị lại key đã lưu, chỉ báo **Đã lưu an toàn** hoặc **Thiếu**.

## Kết nối nhà cung cấp

1. Chọn **Kết nối nhà cung cấp**.
2. Trong hộp thoại **Kết nối nhà cung cấp**, tìm trong danh mục rồi chọn một nhà cung cấp. Mỗi thẻ cho biết cách kết nối, như **API key**, **OAuth** hay **JSON service-account**, kèm vài mô hình của nhà cung cấp đó.
3. Biểu mẫu **Kết nối {name}** mở ra. Nhập **Tên hiển thị** (từ 2 đến 80 ký tự) và dán thông tin xác thực: một **API key**, hoặc với Vertex AI là **JSON service-account** cùng **GCP project ID** và **Region**. Thông tin xác thực dán vào phải dài từ 8 đến 4.096 ký tự.
4. Nếu muốn, chọn **Mô hình mặc định**, là mô hình agent dùng khi không tự chọn, và đổi **URL gốc** nếu bạn dùng proxy hoặc endpoint tự lưu trữ.
5. Chọn **Kết nối nhà cung cấp**. Thông tin xác thực được kiểm tra trước khi lưu.

Nếu kiểm tra thất bại, biểu mẫu hiện **Không thể kết nối nhà cung cấp** kèm lý do, và không có gì được lưu. **Quay lại** đưa bạn về danh mục.

### Nhà cung cấp dùng OAuth

Một số nhà cung cấp, như ChatGPT, kết nối bằng OAuth thay vì key:

1. Trong biểu mẫu, chọn **Tiếp tục với {name}**, rồi **Mở trang xác thực nhà cung cấp**.
2. Đăng nhập vào nhà cung cấp ở tab mới và cho phép truy cập.
3. Sao chép URL callback mà nhà cung cấp trả về, dán vào ô **URL callback** rồi chọn **Kết nối nhà cung cấp**.

Giá trị callback bị xoá ngay sau khi dùng, và không bao giờ xuất hiện trong dòng thời gian, bảng hay metadata của nhật ký audit. Muốn làm lại từ đầu, chọn **Ủy quyền lại với {name}**. Một nhà cung cấp ChatGPT OAuth có thể định tuyến qua nhiều tài khoản: tab **Kết nối** của nó hiện **Nhóm tài khoản**, và agent dùng nó có thêm tab **Định tuyến** trên trang Agent.

### Nhà cung cấp cần thiết lập trên máy chủ

Claude CLI, Ollama và ACP không kết nối được bằng cách dán key, vì cần có sẵn một thành phần trên máy chủ runtime: Claude CLI, một Ollama truy cập được hoặc một endpoint ACP proxy. Trên Dedicated và On-Premises, thẻ của chúng trong danh mục được đánh dấu **Cần cài trên máy chủ**, và biểu mẫu liệt kê **Điều kiện tiên quyết** cùng các bước **Thực hiện trên host runtime** mà người vận hành cần làm. Trên Shared AaaS, chúng được đánh dấu **Không khả dụng** vì các workspace dùng chung máy chủ runtime.

## Quản lý một nhà cung cấp

Chọn một dòng để mở trang chi tiết của nhà cung cấp. Phần đầu có **Sửa nhà cung cấp** và **Xóa nhà cung cấp**. Trang chi tiết có năm tab:

- **Tổng quan**: trạng thái, mô hình mặc định, URL gốc, tình trạng thông tin xác thực, các agent đang dùng, và thời điểm tạo và cập nhật. **Sửa nhà cung cấp** mở một biểu mẫu ở đây để đổi **Tên hiển thị**, dán **API key mới** (để trống nếu muốn giữ secret đã lưu), chọn **Mô hình mặc định** và tắt công tắc **Đang bật**. Nhà cung cấp bị tắt vẫn giữ cấu hình, nhưng agent không thể dùng. Chọn **Lưu thay đổi** để áp dụng.
- **Mô hình**: các mô hình nhà cung cấp có. **Kiểm tra** chạy thử một yêu cầu thật với mô hình, còn **Đặt làm mặc định** đặt nó làm mặc định. **Dùng mô hình khác** kiểm tra một mã mô hình không có trong danh sách rồi đặt làm mặc định. Tab này còn có phần **Giá** để ghi đè giá, **Mặc định suy luận** mà agent dùng nhà cung cấp này kế thừa, và **Embedding cho bộ nhớ**, nơi bạn bật **Dùng để tạo embedding cho bộ nhớ** bằng thông tin xác thực của nhà cung cấp này.
- **Kết nối**: URL gốc và thông tin xác thực mà runtime dùng. **Thay thông tin xác thực** mở biểu mẫu sửa ở tab **Tổng quan**. Đổi URL gốc rồi chọn **Lưu URL gốc**; runtime kiểm tra URL trước khi lưu. Trong phần **Kiểm tra kết nối**, nút **Kiểm tra kết nối** báo **Đã kết nối** kèm thời gian phản hồi, hoặc **Thất bại** kèm lý do.
- **Quyền truy cập**: agent nào được chạy trên nhà cung cấp. Xem [Quyết định agent nào được dùng một nhà cung cấp](#quyết-định-agent-nào-được-dùng-một-nhà-cung-cấp).
- **Hoạt động**: số lượt gọi mô hình trong 30 ngày, số agent đang dùng và mô hình mặc định, rồi dòng sự kiện gồm **Lượt gọi mô hình**, **Lượt gọi thất bại** và thay đổi **Cấu hình**. **Trace lỗi** mở trang **Trace** đã lọc sẵn các lần gọi lỗi của nhà cung cấp này. Bên dưới, **Hoạt động truy cập** hiện các thay đổi quyền, lần bị từ chối và lần sử dụng.

Mỗi agent tự chọn nhà cung cấp và mô hình ở tab **Hồ sơ** của agent; xem [Agent](/docs/console/agents). Menu của mỗi dòng cũng có **Trace lỗi**.

## Quyết định agent nào được dùng một nhà cung cấp

Mặc định, nhà cung cấp mở cho mọi agent trong workspace. Chỉ quản trị viên workspace mới thay đổi được điều này:

1. Ở tab **Quyền truy cập**, bật **Giới hạn truy cập**.
2. Hộp xác nhận **Giới hạn {name}?** liệt kê các agent sẽ mất truy cập vì chưa có quyền **Dùng**. Chọn **Giới hạn**.
3. Nếu có agent bị mất truy cập, một hộp thoại liệt kê các agent đó. Chọn **Cấp quyền dùng cho họ** để chúng tiếp tục chạy, hoặc **Giữ giới hạn**.

Bạn cấp quyền **Dùng** cho từng agent ngay trên tab này. Quyền cấp khi truy cập đang mở chỉ có hiệu lực khi bạn đã giới hạn. Bên dưới danh sách quyền, phần **Được dùng bởi** liệt kê các agent đang dùng nhà cung cấp này, mỗi agent kèm **Mở agent**. Xem [Cấp quyền theo tài nguyên](/docs/security/access-grants).

## Xoá nhà cung cấp

Chọn **Xoá** trong menu của dòng, hoặc **Xóa nhà cung cấp** trong trang chi tiết. Hộp xác nhận **Xóa {name}?** liệt kê các agent còn dùng nhà cung cấp này, và bạn phải gõ tên hiển thị của nó trước khi chọn **Xóa nhà cung cấp**.

> [!WARNING]
> Agent dùng một nhà cung cấp đã bị xoá sẽ lỗi cho tới khi bạn gán cho chúng nhà cung cấp khác. Hãy chuyển chúng sang nhà cung cấp khác trước.

Trên AaaS, việc hoàn tiền gói đăng ký cũng tắt phần thiết lập nhà cung cấp của workspace; xem [Hỗ trợ và thanh toán](/docs/console/support-and-billing).

## Liên quan

- [Provider, fallback và suy luận](/docs/concepts/providers-and-routing)
- [Provider LLM và giọng nói](/docs/integrations/llm-providers)
- [Agent](/docs/console/agents)
- [Mức sử dụng, hoạt động, trace và sức khoẻ runtime](/docs/console/monitoring)
- [Secret, vai trò và nhật ký kiểm toán](/docs/security/secrets-roles-and-audit)
