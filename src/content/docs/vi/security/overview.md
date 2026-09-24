---
title: Tổng quan bảo mật
description: Những gì dewee khoá sẵn theo mặc định, những năng lực của agent còn mở cho tới khi bạn siết lại, và năm lớp kiểm tra giữa một tin nhắn với hệ thống của bạn.
section: security
order: 1
updated: 2026-09-25
---

Trang này viết cho người phải ký duyệt việc dùng dewee: cái gì được bảo vệ ngay từ đầu, cái gì bạn cần tự cấu hình, và mỗi lớp kiểm tra nằm ở đâu. Nội dung mô tả đúng những gì runtime đang làm, kể cả các mặc định còn thoáng. Bản tóm tắt ở mức sản phẩm có tại trang [Bảo mật](/security).

## Tóm tắt nhanh

- **Vòng ngoài đóng theo mặc định.** Không ai gọi được gateway nếu không có token, người lạ không nhắn được cho agent khi chưa được duyệt, và endpoint MCP công khai đang tắt.
- **Năng lực của agent bắt đầu ở mức thoáng.** Gateway mới cho agent dùng toàn bộ tool, chạy lệnh mà không hỏi, và sandbox Docker đang tắt. Bạn thu hẹp lại bằng chính sách, cho cả gateway và từng agent.
- **Secret được mã hoá khi đã đặt khoá mã hoá.** Onboarding và bộ cài Docker tự sinh khoá này. API key chỉ được lưu dưới dạng hash.
- **Các tenant được tách biệt trong mọi truy vấn.** Request không có ngữ cảnh tenant sẽ thất bại.

## Đóng theo mặc định

| Phạm vi | Mặc định |
|---|---|
| Truy cập gateway | Bắt buộc có token trên mọi địa chỉ không phải loopback; thiếu token thì gateway không khởi động |
| WebSocket | Frame đầu tiên phải là `connect` đã xác thực; mọi thứ khác bị từ chối |
| Phương thức RPC | Phương thức chưa được phân loại quyền sẽ bị từ chối |
| Tin nhắn riêng trên ứng dụng chat | Người gửi lạ nhận mã ghép cặp và chờ được duyệt |
| Endpoint MCP công khai | Tắt cho tới khi người vận hành bật |
| Ngữ cảnh tenant | Bắt buộc; thiếu tenant là lỗi, không có giá trị dự phòng |
| Cấp quyền cho CLI có credential | Nếu bước kiểm tra quyền không trả lời trong 2 giây, lệnh bị từ chối |

## Còn mở cho tới khi bạn siết lại

Các mặc định này ưu tiên việc bắt đầu nhanh. Hãy rà lại trước khi agent xử lý dữ liệu thật.

| Thiết lập | Mặc định | Lựa chọn chặt hơn |
|---|---|---|
| Tool profile (`tools.profile`) | `full` | `minimal`, `coding`, `messaging`, cùng danh sách allow và deny |
| Duyệt lệnh (`tools.execApproval`) | Chạy không cần hỏi | `ask`: `on-miss` hoặc `always`; `security`: `allowlist` hoặc `deny` |
| Sandbox Docker (`agents.defaults.sandbox.mode`) | `off` | `non-main` hoặc `all` |
| Xử lý prompt injection (`gateway.injection_action`) | `warn` | `block` |
| Web fetch (`tools.web_fetch.policy`) | `allow_all` | `allowlist` |
| Origin của WebSocket (`gateway.allowed_origins`) | Mọi origin khi để trống | Danh sách origin của bạn |
| Nhóm chat (`group_policy`) | `open` với phần lớn loại channel | `allowlist` hoặc `disabled` |
| Danh sách IP cho webhook | Để trống, tức mọi IP | Địa chỉ của bên gửi |

Cách các lớp chính sách tool chồng lên nhau được giải thích trong [Tool và quyền](/docs/concepts/tools-and-permissions).

## Năm lớp kiểm tra

### Transport

Token được so sánh trong thời gian không đổi. Frame WebSocket giới hạn 512 KB và body HTTP giới hạn 1 MB. Request chat bị giới hạn tần suất theo người dùng hoặc IP bằng token bucket, mặc định 20 request mỗi phút, và HTTP API trả về `429` kèm `Retry-After` khi vượt ngưỡng. Lời gọi tool có giới hạn riêng, mặc định 150 lần mỗi giờ cho mỗi session.

### Input

Mọi tin nhắn đến được kiểm tra với sáu mẫu prompt injection, như cố ghi đè chỉ dẫn hay chèn thẻ hệ thống. Hành động xử lý là `log`, `warn`, `block` hoặc `off`; với mặc định `warn`, tin nhắn vẫn tới model và một sự kiện bảo mật được ghi lại. Tin nhắn dài hơn 32.000 ký tự bị cắt bớt, và model được báo điều đó.

### Tool

- **Nhóm lệnh shell bị chặn** gồm bảy loại: thao tác phá huỷ file và ổ đĩa, lệnh hệ thống, fork bomb, thực thi mã từ xa như `curl | sh`, reverse shell và eval injection.
- **Bảo vệ đường dẫn** không cho tool ra khỏi workspace của agent.
- **Chống SSRF** chặn địa chỉ nội bộ, loopback, link-local và metadata, cố định kết quả DNS và kiểm tra lại mọi lần chuyển hướng.
- **Duyệt lệnh** có thể giữ lệnh lại cho tới khi một người phê duyệt.

### Output

Đầu ra của tool được làm sạch trước khi model hay người dùng nhìn thấy. API key của provider, token GitHub và AWS, giá trị bearer, chuỗi kết nối cơ sở dữ liệu, chuỗi hex dài và giá trị thật của các secret của chính gateway được thay bằng `[REDACTED]`, còn IP máy chủ thành `[SERVER_IP]`. Nội dung lấy từ web được bọc trong dấu đánh dấu là không đáng tin cậy.

### Cách ly

Mỗi agent làm việc trong workspace riêng, với thư mục con cho từng người dùng. Khi bật sandbox, lệnh chạy trong container Docker có root filesystem chỉ đọc, bỏ mọi capability, không có mạng, và giới hạn 512 MB bộ nhớ, một CPU, 256 tiến trình và 300 giây. Bản thân container gateway chạy dưới người dùng không phải root.

## Credential mà agent sử dụng

Khi agent cần một CLI có credential như `gh`, `aws`, `gcloud`, `kubectl` hay `terraform`, dewee chạy binary đó thay cho agent mà không qua shell và chèn credential lúc chạy. Agent không bao giờ thấy giá trị gốc. Trước mỗi lệnh, các biến môi trường trông giống secret (tên kết thúc bằng `_TOKEN`, `_SECRET`, `_KEY`, `_PASSWORD`, `_DSN` hoặc `_CREDENTIAL`, và các biến của chính gateway) bị gỡ bỏ, và đầu ra được làm sạch.

## Cách ly nhiều tenant

Mọi bảng thuộc về tenant đều có tenant ID, và mọi truy vấn đều lọc theo nó. Sự kiện được lọc theo tenant ngay trên máy chủ, đường dẫn file được ký, và mỗi kết nối channel thuộc về đúng một tenant. Tạm ngưng một tenant sẽ dừng công việc runtime của tenant đó, và quyền bị thu hồi được đẩy ngay tới các client đang kết nối. Chi tiết trong [Multi-tenancy](/docs/concepts/multi-tenancy).

## Trước khi chạy thật

1. Luôn đặt `GOCLAW_ENCRYPTION_KEY`, và cất khoá cùng bản sao lưu.
2. Đặt gateway token đủ mạnh và đặt TLS phía trước gateway.
3. Thu hẹp tool profile và bật duyệt lệnh cho agent có thể chạy lệnh.
4. Bật sandbox cho agent thực thi mã.
5. Đặt `gateway.injection_action` thành `block` nếu agent của bạn trò chuyện với người ngoài.
6. Liệt kê origin của bạn trong `gateway.allowed_origins`, và đặt danh sách IP cùng chữ ký HMAC cho webhook.
7. Cấp cho mỗi người vai trò nhỏ nhất đủ dùng; xem [Secret, vai trò và nhật ký kiểm toán](/docs/security/secrets-roles-and-audit).
