---
title: Mức sử dụng, hoạt động, trace và sức khoẻ runtime
description: Xem agent chạy bao nhiêu và tốn bao nhiêu, ai đã thay đổi điều gì, soi từng lần chạy của agent theo từng span, và kiểm tra runtime của workspace có khoẻ không.
section: console
order: 11
screens: [usage, activity, traces, monitoring]
updated: 2026-09-25
---

Khi agent đã chạy, bốn khu vực cho bạn thấy chúng làm gì. **Mức sử dụng** đếm số request, số token và chi phí ước tính. **Nhật ký hoạt động** là lịch sử các thay đổi trong workspace. **Trace** ghi lại chi tiết mọi lần chạy của agent. **Sức khoẻ runtime** cho biết runtime của bạn có truy cập được và đang hoạt động tốt hay không. Cả bốn khu vực chỉ hiển thị dữ liệu của chính workspace bạn.

## Ai được dùng

Cả bốn khu vực đều cần khoá quyền `observability.read`. Chủ workspace và vai trò Admin có sẵn giữ khoá này; với Member, bạn cấp qua một vai trò tuỳ chỉnh. Xem [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys).

## Mức sử dụng

**Mức sử dụng** mở đầu bằng bốn con số tổng cho khoảng thời gian đã chọn: số request, token đầu vào và đầu ra, chi phí ước tính và tỉ lệ lỗi. Biểu đồ hiển thị số request theo ngày, và bảng bên dưới chia nhỏ các con số tổng.

::shot{id="usage"}

1. Đặt **From UTC** và **To UTC**. Trang mở sẵn 30 ngày gần nhất, và mỗi truy vấn có thể trải dài tối đa 366 ngày.
2. Chọn **Breakdown**: theo agent (mặc định), provider, model hoặc kênh.
3. Nếu muốn, thu hẹp về một agent.
4. Đọc bảng: số request, lượt gọi LLM, lượt gọi tool, số lỗi, token, cache, thời gian trung bình và **Est. cost** của từng dòng.
5. Chọn **Export CSV** để tải cùng dữ liệu đó về.

Mức sử dụng được tổng hợp mỗi giờ từ giờ trọn vẹn gần nhất, nên số liệu mới nhất chậm khoảng một đến hai giờ. Trang cho biết dữ liệu đã cập nhật tới giờ nào, và hiện banner **Usage is delayed** khi dữ liệu chậm hơn thế. Mức sử dụng chỉ chứa các con số tổng, không bao giờ chứa prompt, câu trả lời hay secret.

> [!NOTE]
> **Est. cost** là con số ước tính để bạn lập kế hoạch. Đây không phải hoá đơn; hoá đơn của provider mới là căn cứ cho số tiền bạn thực trả.

## Nhật ký hoạt động

**Nhật ký hoạt động** liệt kê những gì con người và agent đã thay đổi trong workspace, mới nhất ở trên, kèm liên kết tới tài nguyên liên quan. Mỗi mục cho biết thời điểm, người thực hiện, tài nguyên và trạng thái: **Ok**, **Changed**, **Attention** hoặc **Recorded**. Khi một mục đến từ một lần chạy của agent, nó liên kết tới trace, lần chạy hoặc phiên tương ứng.

::shot{id="activity"}

1. Tìm theo hành động, người thực hiện, tài nguyên hoặc trace ID.
2. Lọc theo người thực hiện, tài nguyên, hành động, trạng thái hoặc mức độ (**Success**, **Info**, **Warning** hoặc **Error**).
3. Chọn khoảng thời gian: **Today**, **7 days**, **30 days** hoặc **Custom** với ngày tự chọn.
4. Chọn **Apply filters**.
5. Chuyển **View** từ **List** sang **Breakdown** để đếm số mục theo từng hành động thay vì liệt kê.

## Trace

Trace là bản ghi đầy đủ của một lần agent chạy: mọi lượt gọi model, gọi tool, hook và sự kiện, kèm thời gian và token. Trang **Trace** liệt kê các trace, kèm số trace khớp bộ lọc và, cho trang hiện tại, số lỗi, token và chi phí.

::shot{id="traces"}

Để tìm một lần chạy:

1. Tìm kiếm, hoặc lọc theo trạng thái (**Running**, **Completed**, **Error** hoặc **Cancelled**), agent, phiên, kênh, tool và khoảng thời gian.
2. Đánh dấu **Errors only** hoặc **Tool calls** để thu hẹp thêm.
3. Sắp xếp theo thời điểm bắt đầu, thời gian chạy, token hoặc chi phí, và đặt số dòng mỗi trang (mặc định 25).
4. Bật **Auto refresh** để danh sách luôn mới trong lúc bạn theo dõi.

Chọn một trace để mở chi tiết, hoặc **Open full page** để xem rộng hơn. Phần chi tiết cho biết trạng thái, thời gian chạy, token và chi phí ước tính của lần chạy, kèm liên kết tới lần chạy và phiên. Bên dưới là:

- **Span tree** và **Timeline**: từng bước theo thứ tự, phân loại LLM, Tool, Agent, Hook hoặc Event, kèm provider, model, token và finish reason.
- **Hook executions**: các hook đã chạy trong trace.
- **Tool summaries**: tóm tắt ngắn của từng lượt gọi tool.
- **Permitted previews**: bản xem trước ngắn của đầu vào và đầu ra, ở những chỗ được phép.

Mọi dữ liệu trong trace đều được che thông tin nhạy cảm trước khi tới trình duyệt của bạn. Khi cần hỗ trợ về một lần chạy, hãy sao chép **Redacted support bundle** và gửi cho bộ phận hỗ trợ: prompt gốc, tham số tool, header và secret đều được loại bỏ.

## Sức khoẻ runtime

**Sức khoẻ runtime** kiểm tra runtime của workspace mà không để lộ các máy chủ phía sau. Phần tóm tắt cho biết runtime có truy cập được không, tenant binding, tỉ lệ lỗi trace gần đây và heartbeat gần nhất.

::shot{id="monitoring"}

Trạng thái chung là **Healthy**, **Needs attention** hoặc **Offline**. Trạng thái này được tính từ việc console có kết nối được tới runtime không, workspace đã được nhận (claim) chưa và kết quả của các trace gần đây. Bên dưới là:

- **Claim / pairing** cho biết workspace đã được nhận chưa, kèm liên kết tới **Pairing Inbox**.
- **Capacity signal** là thời gian chạy trung bình của các trace gần đây. Đây là con số đại diện cho mức tải, không phải số liệu CPU hay bộ nhớ.
- **Activity signal** và bản xem trước các hoạt động gần đây.

Trang này không bao giờ hiển thị hostname, địa chỉ IP hay log thô.

> [!WARNING]
> Nếu trạng thái là **Awaiting claim**, các trang của runtime chưa hiển thị được dữ liệu trực tiếp. Hãy hoàn tất onboarding, hoặc duyệt yêu cầu ghép cặp đang chờ, trước đã.

## Liên quan

- [Tracing](/docs/concepts/tracing)
- [Chat và phiên hội thoại](/docs/console/chat-and-sessions)
- [Provider và model](/docs/console/providers-and-models)
- [Hỗ trợ và thanh toán](/docs/console/support-and-billing)
- [Secret, vai trò và nhật ký kiểm toán](/docs/security/secrets-roles-and-audit)
