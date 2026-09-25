---
title: Kích hoạt license
description: Cách runtime Tự cài đặt hoặc On-Premises được gắn vào workspace bằng license key hằng năm, và điều gì xảy ra khi license bị tạm ngưng, hết hạn hoặc thu hồi.
section: runtime
order: 3
updated: 2026-09-25
---

Tại Việt Nam, dewee được cung cấp theo hình thức Tự cài đặt và On-Premises, và mỗi runtime On-Premises đi kèm một license key hằng năm. Key gắn runtime mà bạn vận hành với đúng workspace và đơn hàng của nó. Key là bản ghi quyền sử dụng, không phải lớp bảo mật: dữ liệu của bạn vẫn được bảo vệ bởi gateway token, API key và vai trò, như mô tả trong [Tổng quan bảo mật](/docs/security/overview).

> [!NOTE]
> Runtime Tự cài đặt dùng cùng license key hằng năm, giá $500/năm, để kết nối kênh. Agent, provider và skill dùng được mà không cần key. Chủ workspace dán key vào dashboard để kích hoạt; xem [Tự cài đặt dewee](/docs/get-started/self-install).

Việc kiểm tra license trên runtime là tuỳ chọn và mặc định tắt. Các triển khai có license bật nó bằng `DEWEE_LICENSE_REQUIRED=1`.

## Các bước tóm tắt

1. **Bạn nhận key.** Sau khi đơn hàng On-Premises được thanh toán, chúng tôi cấp license hằng năm và gửi key cho bạn. Key chỉ hiện một lần, hãy cất nó trong trình quản lý secret của bạn.
2. **Chủ workspace gắn key vào workspace.** Trong console, mở **Billing**, rồi **License binding**, và nhập key. Việc gắn chỉ ghép đơn hàng với workspace; nó không dùng tới một lượt kích hoạt.
3. **Runtime kích hoạt.** Runtime gửi key một lần tới dịch vụ license tại `app.dewee.sh`, cùng với workspace và ID instance của nó. Từ đó trở đi, runtime dùng một credential riêng và không bao giờ gửi lại key gốc.
4. **Runtime báo danh định kỳ.** Cứ năm phút runtime gửi một heartbeat. Runtime chỉ nhận việc khi license còn hiệu lực.

Chỉ chủ workspace mới gắn được license. Workspace đã có license hiệu lực sẽ hiện trạng thái thay cho biểu mẫu.

## Cấu hình runtime

Thiết lập license chỉ được đọc từ biến môi trường. Key gốc không bao giờ được đọc từ file cấu hình hay dòng lệnh.

| Biến | Mục đích |
|---|---|
| `DEWEE_LICENSE_REQUIRED` | `1` để yêu cầu license còn hiệu lực trước khi runtime nhận việc. Mặc định: tắt |
| `DEWEE_LICENSE_SERVER` | Dịch vụ license, `https://app.dewee.sh` trên production. Bắt buộc là `https://` |
| `DEWEE_LICENSE_RUNTIME_INSTANCE_ID` | Tên cố định bạn chọn cho triển khai này: 1 đến 128 ký tự gồm chữ, số, dấu chấm, gạch ngang hoặc gạch dưới |
| `DEWEE_LICENSE_STATE_FILE` | Đường dẫn tuyệt đối nơi runtime giữ trạng thái kích hoạt |
| `DEWEE_LICENSE_BOOTSTRAP_ADDR` | Địa chỉ của trang kích hoạt. Mặc định: `127.0.0.1:18791` |
| `DEWEE_LICENSE_KEY_FILE` hoặc `DEWEE_LICENSE_KEY_FD` | Cho kích hoạt tự động: một file hoặc file descriptor chứa key. Chỉ dùng một trong hai |
| `DEWEE_LICENSE_WORKSPACE_ID` | Workspace cần kích hoạt. Bắt buộc khi dùng `KEY_FILE` hoặc `KEY_FD` |

Hãy để file trạng thái trên bộ nhớ lưu trữ bền vững. Với Docker, nó nằm trong volume dữ liệu mà runtime vốn đang dùng.

## Kích hoạt thủ công

Khi license là bắt buộc và chưa có kích hoạt nào, runtime mở một trang kích hoạt nhỏ tại `127.0.0.1:18791` và tạm giữ mọi công việc: không channel, lịch chạy, webhook hay khôi phục task nào chạy, và `/readyz` báo chưa sẵn sàng. Trang này chỉ lắng nghe trên loopback, nên bạn mở nó ngay trên máy chủ hoặc qua SSH tunnel hay `kubectl port-forward`.

```bash
docker compose -f docker-compose.yml -f docker-compose.selfhosted.yml -f docker-compose.licensed.yml up -d
```

Mở `http://127.0.0.1:18791` rồi nhập license key và workspace ID; trang **License binding** trong console hiển thị ID này. Khi dịch vụ license xác nhận kích hoạt, trang sẽ đóng, `/readyz` chuyển sang sẵn sàng và runtime khởi động các worker.

## Kích hoạt tự động

Với cài đặt tự động, hãy trao key cho runtime một lần qua `DEWEE_LICENSE_KEY_FILE` hoặc `DEWEE_LICENSE_KEY_FD`, kèm `DEWEE_LICENSE_WORKSPACE_ID`. File chứa key phải là file thường chỉ chủ sở hữu đọc được; runtime đọc nó một lần rồi xoá, và từ chối khởi động nếu không xoá được. Hãy lấy key từ trình quản lý secret thay vì để nó nằm trên đĩa.

## Heartbeat và thời gian ân hạn

Runtime báo danh mỗi năm phút bằng ID kích hoạt và credential của nó. Nếu không liên lạc được dịch vụ license, runtime vẫn chạy tối đa 24 giờ kể từ lần báo danh thành công gần nhất, nhưng không bao giờ vượt quá cuối năm license. Khởi động lại không làm đồng hồ này chạy lại từ đầu.

## Tạm ngưng, hết hạn và thu hồi

| Trạng thái | Runtime làm gì | Cách khôi phục |
|---|---|---|
| Tạm ngưng | Ngừng nhận việc | Sau khi chúng tôi gỡ tạm ngưng, chủ workspace kích hoạt lại bằng chính key đó qua trang kích hoạt |
| Credential kích hoạt không hợp lệ | Ngừng nhận việc | Giống như khi bị tạm ngưng |
| Hết hạn | Ngừng nhận việc và hoàn tất các job đang chạy | Không kích hoạt lại được key cũ; liên hệ chúng tôi để gia hạn |
| Bị thu hồi | Ngừng nhận việc và hoàn tất các job đang chạy | Vĩnh viễn; key bị thu hồi không bao giờ dùng lại được |

> [!IMPORTANT]
> Đặt `DEWEE_LICENSE_REQUIRED=0` sẽ tắt việc kiểm tra cho triển khai đó, như một bước rollback. Nó không thay đổi trạng thái license phía chúng tôi, và không thể khôi phục một key đã bị thu hồi hoặc hết hạn.

## License hiển thị ở đâu trong console

**License binding**, nằm dưới **Billing**, cho biết workspace đã gắn license hay chưa, trạng thái onboarding và runtime tenant đã kết nối chưa. Kết nối và công suất của runtime hiện ở [Sức khoẻ runtime](/docs/console/monitoring). Để gia hạn, thêm runtime hoặc đổi ID instance, hãy dùng [Hỗ trợ và thanh toán](/docs/console/support-and-billing) hoặc [liên hệ chúng tôi](/contact).
