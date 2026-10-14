---
title: Tool tích hợp, MCP server và hook
description: Bật hoặc tắt tool tích hợp cho workspace, kết nối MCP server và cấp quyền dùng tool, chạy hook theo sự kiện của agent, thiết lập gói runtime và giọng nói.
section: console
order: 7
screens: [tools, mcp-servers, hooks]
updated: 2026-10-14
---

Tool là cách agent hành động: tìm kiếm trên web, đọc file, gọi một API. dewee mặc định từ chối mọi thứ, nên agent chỉ dùng được một tool sau khi bạn cho phép. Trang này nói về ba khu vực quyết định agent được gọi những gì và điều gì chạy quanh các lần gọi đó, cùng hai khu vực **Gói runtime** và **Giọng nói**.

## Ai được dùng

| Khu vực | Khoá quyền |
|---|---|
| Công cụ tích hợp | `settings.manage` |
| Giọng nói (TTS & STT) | `tts.manage` |
| Máy chủ MCP, Hook | `integrations.manage` |
| Gói runtime | `packages.install` |

Chủ workspace và vai trò Admin có sẵn giữ tất cả các khoá này. Cài đặt giọng nói thành văn bản chỉ dành cho quản trị viên workspace. Xem [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys).

## Tool tích hợp

Trang **Công cụ tích hợp** (trong menu là **Công cụ có sẵn**) liệt kê các tool đi kèm runtime, nhóm theo danh mục có thể thu gọn. Bạn tìm được theo tên hoặc danh mục. Mỗi dòng cho biết mức rủi ro (**Rủi ro cao**, **Rủi ro trung bình** hoặc **Rủi ro thấp**), thiết lập đang là **Mặc định** hay **Ghi đè** riêng của workspace, và một công tắc để bật tool. Agent chỉ gọi được các tool đang bật ở đây.

::shot{id="tools"}

Khi bật một tool có thể sửa tệp, chạy lệnh hoặc dùng secret đã lưu, hộp thoại **Bật {name}?** yêu cầu bạn xác nhận; chọn **Bật công cụ**.

Chọn một tool để mở bảng chi tiết:

- **Quyền truy cập**: công tắc **Đã bật**, và **Đưa về mặc định**, đưa tool về mặc định của runtime và xoá cài đặt của workspace sau khi bạn xác nhận **Hoàn tác ghi đè**.
- **Chi tiết**: danh mục, mức rủi ro, những gì tool yêu cầu và các bí mật cần có.
- **Bí mật**: các bí mật đã lưu. Giá trị bí mật không bao giờ hiển thị.
- **Cấu hình**: cài đặt của tool, nếu có. Một số tool có biểu mẫu riêng, như chuỗi nhà cung cấp của tìm kiếm web hay của tool media; các tool khác có **Nâng cao: sửa dạng JSON** với ô **Cài đặt JSON**. Chọn **Lưu cài đặt** để lưu cho workspace này, hoặc **Xoá cài đặt của workspace** để quay về cài đặt mặc định của runtime mà không đổi trạng thái bật hay tắt của tool.
- **Chi tiết kỹ thuật**: ID công cụ và trạng thái cấu hình.

## MCP server

MCP server bổ sung tool từ bên ngoài dewee, như GitHub hay một hệ thống ticket. Trang **Máy chủ MCP** có hai tab: **Đã cài đặt**, gồm các server của workspace, và **Chợ ứng dụng**, hiện chưa kết nối danh mục nào nên gợi ý bạn thêm server tuỳ chỉnh. Server đã kết nối vẫn chưa dùng được cho tới khi bạn cấp quyền cho agent.

::shot{id="mcp-servers"}

Server gắn nhãn **Tích hợp sẵn** hoặc **Toàn hệ thống** được quản lý bên ngoài workspace: bạn mở và kiểm tra được, nhưng chỉ người vận hành mới thay đổi được.

### Thêm server

1. Chọn **Thêm máy chủ tùy chỉnh**.
2. Nhập **Tên** (chữ thường, chữ số và dấu gạch ngang) và, nếu muốn, **Tên hiển thị**.
3. Chọn **Giao thức**. **stdio** chạy một **Lệnh** kèm **Đối số**, **Biến môi trường** và **Biến môi trường bí mật**. **Streamable HTTP** và **SSE** cần **URL** và **Header**.
4. Nếu muốn, đặt **Tiền tố công cụ** và **Thời gian chờ (giây)** từ 1 đến 600, và giữ công tắc **Đã bật**.
5. Với Streamable HTTP và SSE, chọn cách **Xác thực**: **API key và header** gửi một key và header cố định với mọi yêu cầu; **OAuth** đăng nhập qua nhà cung cấp ủy quyền của server. Với OAuth, giữ **Chế độ đăng ký** ở **Tự động (Khuyến nghị)** trừ khi server yêu cầu khác, và thêm **Client ID**, **Client secret** hoặc **Phạm vi yêu cầu** nếu server cần.
6. Khi hộp thoại có nút **Kiểm tra kết nối**, bạn có thể kiểm tra server trước khi lưu, rồi chọn **Thêm máy chủ**.

Trang của server sẽ mở ra. Nếu server dùng OAuth, trang mở ở tab **Thông tin xác thực**: chọn **Xác thực** và hoàn tất đăng nhập với nhà cung cấp. Giá trị header và biến bí mật được che sau khi lưu.

### Các tab của server

- **Tổng quan**: trạng thái, thông tin kết nối và cách xác thực. Chọn **Kiểm tra kết nối** để kiểm tra cấu hình đã lưu và tìm các tool của server. Một banner báo khi server đang tắt, lần kiểm tra gần nhất thất bại hoặc ủy quyền OAuth đã hết hạn; trường hợp cuối có nút **Uỷ quyền lại**.
- **Công cụ**: mọi tool tìm thấy và ai được gọi chúng. Khi chưa được cấp quyền, tool ở trạng thái **Bị chặn**. Với mỗi tool, chọn **Cho phép** hoặc **Chặn** cho từng đối tượng được cấp quyền, hoặc **Cho phép agent** để cấp riêng tool đó cho một agent. **Ngữ cảnh an toàn** duyệt một tool chỉ đọc mà agent được chạy trước khi lập kế hoạch công việc, ví dụ để nạp quy tắc hoặc playbook; đổi endpoint, lệnh, biến môi trường hoặc header của server sẽ xoá các phê duyệt này. Nếu chưa có tool nào, hãy chạy kiểm tra kết nối trước.
- **Quyền truy cập**: cấp **Dùng** cho agent, **Dùng** hoặc **Quản lý** cho người. Mỗi quyền cấp hiện các tool mà nó cho phép. **Cấp quyền cho một nhóm** cấp quyền cho mọi agent hiện có trong nhóm; agent được thêm sau cần được cấp quyền riêng. Quyền cấp theo kênh hoặc nhóm chat ở nơi khác được liệt kê trong **Quyền theo kênh và nhóm chat** để bạn thu hồi. Xem [Cấp quyền theo tài nguyên](/docs/security/access-grants).
- **Thông tin xác thực**: API key, header và biến môi trường của workspace, hoặc với server OAuth là trạng thái ủy quyền cùng các nút **Xác thực**, **Xác thực lại** và **Ngắt kết nối**. Mọi agent đều dùng thông tin xác thực này của workspace; chưa có thông tin xác thực riêng cho từng agent. Server stdio dùng thông tin xác thực từ biến môi trường, không dùng OAuth.
- **Cấu hình**: sửa **Hồ sơ** và **Kết nối**, tắt server, hoặc **Xoá máy chủ** trong **Vùng nguy hiểm**. Xoá sẽ gỡ server cùng mọi quyền đã cấp.
- **Hoạt động**: các thay đổi về cấu hình, quyền truy cập và thông tin xác thực của server.

Bạn thu hồi quyền trong tab **Quyền truy cập**. Tắt một server sẽ giữ nguyên cấu hình nhưng agent không dùng được nữa.

## Hook

Hook chạy handler của riêng bạn khi một sự kiện của agent xảy ra, để cho phép, chặn hoặc bổ sung ngữ cảnh cho bước tiếp theo.

Với `integrations.manage`, bạn xem được mọi hook và các lần chạy của chúng, và chạy thử được; tab **Hoạt động** còn cần quyền đọc sự kiện của workspace. Chỉ chủ workspace hoặc vai trò Admin mới tạo, sửa, bật, tắt và xoá được hook. [Cấp quyền theo tài nguyên](/docs/security/access-grants) trên một hook quyết định hook chạy cho agent nào và ai được sửa hook hoặc trao quyền tiếp cho người khác bằng API key của chính mình, nhưng không bao giờ cho phép sửa hook từ console.

::shot{id="hooks"}

| Sự kiện | Có chặn thao tác không? |
|---|---|
| `user_prompt_submit`, `pre_tool_use`, `subagent_start` | Có: lỗi hoặc quyết định chặn sẽ dừng thao tác |
| `session_start`, `post_tool_use`, `stop`, `subagent_stop` | Không: hook chạy bất đồng bộ |

Danh sách hiển thị trình xử lý, phạm vi, hook có chặn hay không, thời điểm cập nhật và hook đang bật hay tắt. Bạn lọc được theo **Sự kiện**, **Phạm vi** và **Trạng thái**.

Để thêm hook:

1. Chọn **Tạo hook**, đặt tên và chọn **Sự kiện**.
2. Chọn **Trình xử lý**: **Prompt** (một mẫu prompt chạy trên model, cần **Bộ lọc công cụ** hoặc **Điều kiện**), **HTTP** (một URL endpoint http hoặc https kèm header) hoặc **Script** (JavaScript chạy trong sandbox, tối đa 32 KiB).
3. Đặt **Phạm vi** là cả workspace hoặc các agent được chọn, và đặt **Độ ưu tiên**; số nhỏ hơn chạy trước.
4. Đặt **Thời gian chờ** từ 0 đến 10.000 ms, và **Khi quá thời gian** là **Chặn** hoặc **Cho phép**.
5. Chọn **Tạo hook**.

Chọn một hook để mở bảng chi tiết, gồm các tab sau:

- **Cấu hình**: sự kiện, trình xử lý, phạm vi, bộ lọc, điều kiện, thời gian chờ, lần chạy gần nhất và lỗi gần nhất. Giá trị bí mật được che.
- **Quyền truy cập**: với hook chạy cho các agent được chọn, tab liệt kê các agent mà hook chạy cho (**Chạy cho**) và những người có quyền **Chỉnh sửa** hoặc **Quản lý** trên hook. Hook áp dụng cho cả workspace hiện thông báo thay vào đó, vì chỉ quản trị viên workspace mới thay đổi được.
- **Lần chạy**: các lần chạy trước, kèm quyết định và độ trễ.
- **Chạy thử**: dán một sự kiện mẫu và chọn **Chạy thử** để xem kết quả mà không ảnh hưởng tới agent nào.
- **Hoạt động**: các thay đổi cấu hình của hook.

Hook tích hợp sẵn, hook toàn hệ thống và hook lệnh do người vận hành runtime thiết lập chỉ xem được và không có tab **Chạy thử**. Xoá một hook sẽ khiến nó ngừng chạy ngay lập tức.

> [!WARNING]
> Một hook chặn bị lỗi, hoặc hết thời gian chờ khi **Khi quá thời gian** đặt là **Chặn**, sẽ dừng thao tác của agent. Hãy chạy thử trước khi bật hook.

## Gói runtime

Trang **Gói runtime** có bốn tab:

- **Đã cài**: các gói trong hồ sơ runtime của workspace, kèm nút **Yêu cầu gói**. Trang hiện thông báo khi runtime đang lệch so với hồ sơ gói.
- **Kho gói**: workspace chưa có danh mục gói, nên tab này hướng bạn sang yêu cầu một gói theo tên.
- **Chính sách**: chính sách cài gói theo hình thức triển khai của bạn. Trên SaaS dùng chung, người vận hành chọn lọc gói chung cho mọi workspace. Trên Dành riêng và Tại chỗ, runtime của bạn biệt lập, nên người vận hành có thể cài gói trực tiếp vào đó khi giấy phép còn hiệu lực. Ở mọi chế độ, bạn xin gói mới bằng **Yêu cầu gói**: nhập loại, tên gói, phiên bản nếu cần và lý do, rồi chọn **Yêu cầu cài**. Người vận hành sẽ xem xét, và các yêu cầu của bạn cùng tiến độ duyệt được liệt kê trên trang.
- **CLI**: **Thông tin xác thực CLI** ghép nối terminal của lập trình viên với runtime của workspace. Chạy lệnh ghép nối hiển thị trên trang, rồi duyệt yêu cầu qua **Mở hộp thư ghép nối**.

Chọn một gói đã cài để mở trang của gói, với các tab **Tổng quan**, **Quyền truy cập**, **Lệnh được phép**, **Thông tin xác thực & biến môi trường**, **Phiên bản** và **Hoạt động**. Ở tab **Quyền truy cập**, quản trị viên workspace dùng công tắc **Giới hạn truy cập** để chuyển gói giữa **Mở**, khi mọi agent đều dùng được, và **Giới hạn**, khi chỉ agent được cấp quyền **Dùng** mới chạy được các lệnh của gói; mã nhập gói như một thư viện thì không bị chặn. Gói phát hành trên GitHub hiện thông báo thay vào đó, vì quyền truy cập của chúng được đặt trong runtime. Tab **Lệnh được phép** và **Thông tin xác thực & biến môi trường** cho biết runtime chưa báo các thông tin này cho ứng dụng.

## Giọng nói (TTS & STT)

Trang **Giọng nói (TTS & STT)** quyết định cách agent nói và nghe trên các kênh thoại, gồm hai tab. Ở tab **Văn bản thành giọng nói**, bạn chọn nhà cung cấp đang dùng (OpenAI, ElevenLabs, Edge, MiniMax hoặc Gemini), **Tự động đọc** (**Tắt**, **Khi người dùng gửi tin nhắn thoại** hoặc **Luôn luôn**), **Số ký tự tối đa** và **Thời gian chờ**, rồi đặt khoá, giọng và mô hình cho từng nhà cung cấp. Thẻ **Thử giọng** kiểm tra kết nối và tạo bản nghe thử với cài đặt đã lưu. Tab **Giọng nói thành văn bản** chỉ dành cho quản trị viên workspace: chọn nhà cung cấp chính và nhà cung cấp dự phòng (Soniox hoặc ElevenLabs), rồi đặt khoá, mô hình và gợi ý ngôn ngữ cho từng nhà cung cấp. Một thanh **Lưu** lưu thay đổi của cả hai tab. Khoá API được lưu mã hoá, không thể xem lại mà chỉ có thể thay thế.

## Liên quan

- [Tool và quyền hạn](/docs/concepts/tools-and-permissions)
- [Hook](/docs/concepts/hooks)
- [Webhook và MCP](/docs/api/webhooks-and-mcp)
- [Agent](/docs/console/agents)
- [Hỗ trợ và thanh toán](/docs/console/support-and-billing)
