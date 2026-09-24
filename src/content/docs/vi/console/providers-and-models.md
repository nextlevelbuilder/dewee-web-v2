---
title: Provider và model
description: Kết nối các LLM provider mà agent sử dụng, kiểm tra credential trước khi lưu, chọn model mặc định, thay hoặc xoá key mà không bao giờ để lộ key ra ngoài.
section: console
order: 5
screens: [providers]
updated: 2026-09-25
---

Provider là dịch vụ LLM mà agent của bạn gọi tới, ví dụ Anthropic, OpenAI, Google Vertex AI hoặc một gateway tương thích OpenAI. Trang **Provider & model** là nơi bạn kết nối provider với workspace, kiểm tra credential và chọn model mặc định cho từng provider. Bạn cần có ít nhất một provider đã kết nối trước khi tạo agent hay bắt đầu chat.

## Ai được dùng

Để quản lý provider, bạn cần khoá quyền `provider.manage`. Chủ workspace và vai trò Admin có sẵn giữ khoá này; với Member, bạn cấp qua một vai trò tuỳ chỉnh. Xem [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys).

## Bạn thấy gì trên trang

Trang liệt kê mọi provider đã kết nối, kèm model mặc định, trạng thái bật hay tắt, credential đã được lưu hay chưa, và số agent đang dùng provider đó. Bạn có thể tìm theo provider, model hoặc loại. Bên dưới danh sách là catalog các provider mà runtime hỗ trợ, cho biết bạn có thể thêm những provider nào và cách thiết lập từng provider.

::shot{id="providers"}

Credential chỉ được gửi một lần tới runtime và được lưu ở đó dưới dạng mã hoá. Console không bao giờ hiển thị lại key đã lưu, chỉ báo **Stored securely** hoặc **Missing**.

## Kết nối provider

1. Chọn **Connect provider**.
2. **Provider**: chọn một provider trong catalog.
3. **Credentials**: nhập tên hiển thị (từ 2 đến 80 ký tự) và dán credential. Phần lớn provider chỉ cần API key. Một số provider cần thêm thông tin, ví dụ Vertex AI cần file JSON của service account, GCP project ID và region. Bạn cũng có thể đặt API base riêng, hoặc để runtime dùng giá trị mặc định.
4. **Models**: chọn model mặc định của provider, hoặc giữ mặc định của runtime. Nếu runtime trả về catalog model, bạn sẽ thấy context window và giá của từng model.
5. **Verify**: xem lại phần tóm tắt rồi chọn **Verify and save**. Runtime kiểm tra credential trước khi lưu, và ô nhập secret được xoá khỏi trình duyệt của bạn.

Nếu kiểm tra thất bại, không có gì được lưu và provider bạn đang dùng vẫn hoạt động bình thường.

### Provider dùng OAuth

Một số provider, như ChatGPT, kết nối bằng OAuth thay vì key:

1. Ở bước **Credentials**, chọn **Start OAuth**, rồi **Open provider authorization**.
2. Đăng nhập vào provider ở tab mới và cho phép truy cập.
3. Sao chép callback URL mà provider trả về, dán vào ô **Callback URL** rồi chọn **Complete OAuth**.

Giá trị callback không bao giờ xuất hiện trong dòng thời gian, bảng hay metadata của nhật ký audit. Một agent có thể định tuyến qua nhiều tài khoản OAuth ChatGPT; tab **Routing** của agent trên trang Agent hiển thị nhóm tài khoản đó.

### Provider cần thiết lập trên máy chủ

Claude CLI, Ollama và ACP không kết nối được bằng cách dán key, vì cần có sẵn một thành phần trên máy chủ runtime: Claude CLI, một Ollama đang chạy hoặc một endpoint ACP proxy. Trên Dedicated và On-Premises, catalog liệt kê các bước mà người vận hành cần làm trên máy chủ trước. Trên SaaS, các provider này không khả dụng vì các workspace dùng chung máy chủ runtime.

## Thay đổi provider

Chọn **Open** trên một dòng để chỉnh sửa:

- **Profile**: đổi tên hiển thị hoặc tắt provider.
- **Credential**: dán key mới để thay key cũ (từ 8 đến 4.096 ký tự). Để trống nếu muốn giữ secret đã lưu.
- **Models**: đổi model mặc định.

Mỗi agent tự chọn provider và model khi bạn tạo hoặc sửa agent ở trang [Agent](/docs/console/agents). Dùng **Error traces** trên một dòng để mở **Trace** đã lọc sẵn các lần gọi lỗi của provider đó.

## Xoá provider

Chọn **Delete** trong trang chi tiết của provider. Hộp xác nhận cho biết còn bao nhiêu agent đang dùng provider này.

> [!WARNING]
> Trước khi xoá một provider, hãy chuyển các agent đang dùng nó sang provider khác. Nếu không, các agent đó sẽ mất model mà chúng được thiết lập để dùng.

Trên SaaS, việc hoàn tiền gói đăng ký cũng tắt phần thiết lập provider của workspace; xem [Hỗ trợ và thanh toán](/docs/console/support-and-billing).

## Liên quan

- [Provider, fallback và suy luận](/docs/concepts/providers-and-routing)
- [Provider LLM và giọng nói](/docs/integrations/llm-providers)
- [Agent](/docs/console/agents)
- [Mức sử dụng, hoạt động, trace và sức khoẻ runtime](/docs/console/monitoring)
- [Secret, vai trò và nhật ký kiểm toán](/docs/security/secrets-roles-and-audit)
