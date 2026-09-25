---
title: Tự cài đặt dewee
description: Cài dewee trên máy của bạn bằng một script, dưới dạng binary độc lập hoặc Docker, rồi thiết lập trong dashboard cục bộ và thêm license để kết nối kênh.
section: get-started
order: 4
updated: 2026-09-25
---

Tự cài đặt (Self-install) đưa dewee lên máy tính hoặc máy chủ do bạn quản lý, và bạn tự thiết lập mọi thứ. Việc cài đặt và dùng agent, provider, skill đều miễn phí. Bạn chỉ cần license khi muốn kết nối kênh. [Trang cài đặt](/install) gom đủ các lệnh bên dưới vào một chỗ.

## Chọn cách cài

Có hai cách cài, cả hai đều dùng file cài đặt của chúng tôi. Hình thức Tự cài đặt không hỗ trợ cài từ mã nguồn.

| Cách cài | Chạy trên | Phù hợp khi |
|---|---|---|
| **Binary độc lập** | macOS hoặc Linux, trên amd64 hoặc arm64 | Bạn muốn dewee chạy trực tiếp trên một máy |
| **Docker** | Mọi hệ điều hành có Docker | Bạn muốn dewee chạy trong container, và mọi máy Windows |

> [!NOTE]
> Trên Windows, hãy cài bằng Docker với Docker Desktop. Không có bản binary độc lập cho Windows.

## Cài binary độc lập

Trên macOS hoặc Linux, chạy script cài đặt trong terminal:

```bash
curl -fsSL https://dewee.sh/install.sh | bash
```

Bản độc lập cần PostgreSQL. Nếu máy chưa có, script sẽ hỏi trước khi cài. Muốn cài không cần hỏi, thêm `--yes --install-postgres`; riêng `--yes` không bao giờ tự cài PostgreSQL.

## Cài bằng Docker

Trên macOS hoặc Linux, tải file Compose rồi khởi động dewee:

```bash
curl -fsSL https://dewee.sh/docker-compose.yml -o docker-compose.yml
docker compose up -d
```

Trên Windows, mở PowerShell khi Docker Desktop đang chạy:

```powershell
iwr https://dewee.sh/docker-compose.yml -OutFile docker-compose.yml
docker compose up -d
```

## Mở dashboard

Khi dewee đã chạy, mở `http://localhost:4321` trên trình duyệt. Đây là dashboard, nơi bạn quản lý bản cài của mình từ đây về sau.

## Thiết lập trong dashboard

Lần mở đầu tiên sẽ dẫn bạn qua các bước onboarding:

1. **Tạo tài khoản chủ sở hữu.** Đây là tài khoản quản lý workspace, thành viên và license.
2. **Cấu hình workspace.** Đặt tên và thiết lập những điều cơ bản cho đội ngũ của bạn.
3. **Thêm LLM provider.** Dán API key từ một provider như Anthropic, OpenAI, Google Gemini hoặc OpenRouter. dewee không kèm sẵn credit cho model; nó gọi tới provider mà bạn kết nối. Xem [LLM provider](/docs/integrations/llm-providers).
4. **Tạo agent đầu tiên.** Đặt tên, chọn model rồi gửi một tin nhắn để kiểm tra agent đã trả lời.

## Thêm license để kết nối kênh

Agent, provider và skill dùng được mà không cần license. Để kết nối các kênh như Zalo, Telegram, Discord hay Slack, bạn cần license key của dewee cho workspace đó, giá $500/năm; mỗi workspace cần một license riêng. Khi có key, bạn dán nó vào dashboard để kích hoạt, sau đó có thể kết nối kênh. [Kích hoạt license](/docs/runtime/licence) giải thích key dùng để làm gì.

> [!TIP]
> Early Access: 50 license đầu tiên được giảm 50% năm đầu, còn $250 thay vì $500, đến 23:59 ngày 15/10/2026 (giờ Việt Nam). Xem [bảng giá](/pricing).

## Cấu hình tối thiểu

Đây là mức tối thiểu, không phải khuyến nghị cho khối lượng công việc lớn:

- **Binary độc lập:** macOS 13 trở lên bản 64-bit, hoặc Linux 64-bit dùng glibc, và 2 GB RAM.
- **Docker:** Docker 24 trở lên, và 2 GB RAM.

## Cập nhật

Với Tự cài đặt, bạn là người cập nhật. Chúng tôi phát hành phiên bản mới; việc cài chúng, và sao lưu dữ liệu trước khi cài, là phần của bạn.

## Nhận trợ giúp ở đâu

Tự cài đặt không kèm hỗ trợ cài đặt. Nếu bạn muốn đội ngũ chúng tôi cài và chăm sóc dewee thay bạn, hãy chọn [On-Premises](/docs/get-started/deployment-options), khởi điểm từ $5K. Có câu hỏi về license hay hình thức nào phù hợp, hãy [liên hệ chúng tôi](/contact).

## Bước tiếp theo

- [Trang cài đặt](/install): các lệnh cài đặt trên một trang.
- [Kích hoạt license](/docs/runtime/licence): cách gắn license key và điều gì xảy ra khi key hết hạn.
- [Bắt đầu nhanh](/docs/get-started/quickstart): từ provider đã kết nối tới câu trả lời đầu tiên của agent.
