---
title: Bắt đầu nhanh
description: Từ lúc đăng nhập tới câu trả lời đầu tiên của agent trong console, hoặc tự chạy runtime trên máy của bạn và trò chuyện qua terminal. Hai cách, từng bước một.
section: get-started
order: 5
screens: [sign-in, providers, chat]
updated: 2026-09-25
---

Có hai cách để bắt đầu. Phần lớn đội ngũ đi theo **con đường console**: đăng nhập, kết nối một model provider và trò chuyện với agent mà dewee tạo sẵn cho bạn. Người vận hành muốn thử runtime ngay trên máy mình có thể đi theo **con đường tự vận hành** ở phía dưới. Cả hai đều kết thúc bằng việc một agent trả lời tin nhắn của bạn.

## Trước khi bắt đầu

- Một email công việc, hoặc tài khoản GitHub hay Google, để đăng nhập.
- Tài khoản ở ít nhất một model provider, ví dụ API key của Anthropic, OpenAI, Google Gemini hoặc OpenRouter. dewee không kèm sẵn credit cho model; nó gọi tới provider mà bạn kết nối.
- Với con đường tự vận hành: Docker, hoặc Go cùng PostgreSQL 18 có pgvector.

## Con đường console

### 1. Đăng nhập

Mở `app.dewee.sh` và chọn **Continue with GitHub**, **Continue with Google**, hoặc nhập email để nhận đường link đăng nhập dùng một lần. Bạn không phải quản lý mật khẩu nào cả.

::shot{id="sign-in"}

### 2. Chờ runtime sẵn sàng

Workspace mới cần có runtime trước. Với On-Premises, runtime kết nối sau khi license key của nó được gắn vào workspace (xem [Kích hoạt license](/docs/runtime/licence)). Nếu bạn tự cài đặt, runtime chạy ngay trên máy của bạn; xem [Tự cài đặt dewee](/docs/get-started/self-install). Ô trạng thái ở đầu console cho biết khi nào runtime đã online.

### 3. Kết nối model provider

Vào **Providers & models**, chọn provider trong danh mục, dán API key rồi lưu. Console kiểm tra key với provider trước khi cho bạn đi tiếp. Key được lưu ở dạng mã hoá và console không bao giờ hiển thị lại.

::shot{id="providers"}

> [!NOTE]
> Chỉ chủ workspace, admin, hoặc thành viên có vai trò được cấp quyền `provider.manage` mới thêm được provider. Xem [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys).

### 4. Làm quen với super-agent

Ngay khi một provider được xác minh, dewee tạo agent đầu tiên của bạn là `super-agent` và cấp cho nó những gì cần thiết để thay bạn quản lý workspace. Bạn không phải cấu hình gì ở bước này.

### 5. Gửi tin nhắn đầu tiên

Mở **Chat**, chọn `super-agent` và hỏi thử, ví dụ "Bạn làm được gì trong workspace này?". Câu trả lời thành công đầu tiên đánh dấu workspace đã sẵn sàng.

::shot{id="chat"}

### Làm gì tiếp theo

- Tạo thêm agent với hướng dẫn và tool riêng: [Agent](/docs/console/agents).
- Đưa agent lên Telegram, Slack, Zalo hoặc ứng dụng chat khác: [Kênh, ghép cặp và danh bạ](/docs/console/channels-and-contacts).
- Mời đồng đội và gán vai trò: [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys).

## Con đường tự vận hành

Dùng cách này để chạy runtime gateway ngay trên máy của bạn. Đây chính là runtime dùng cho mọi hình thức triển khai.

### Với Docker

```bash
./prepare-env.sh
make up
curl http://localhost:18790/health
```

`prepare-env.sh` tạo file `.env` và sinh gateway token cùng encryption key nếu chúng chưa có. `make up` kéo image đã phát hành về, khởi động PostgreSQL có pgvector và nâng cấp schema cơ sở dữ liệu. Gateway khoẻ mạnh sẽ trả về `{"status":"ok","protocol":3}`.

### Từ mã nguồn

```bash
make build
./dewee onboard
source .env.local && ./dewee
```

`dewee onboard` hỏi chuỗi kết nối PostgreSQL, kiểm tra nó, sinh gateway token và encryption key, chạy migration rồi ghi các secret đó vào `.env.local`. Chạy `dewee` không kèm lệnh con sẽ khởi động gateway.

### Cấu hình và trò chuyện từ terminal

Khi gateway đang chạy, trình hướng dẫn thiết lập sẽ dẫn bạn qua provider, model, agent và, nếu muốn, một kênh chat:

```bash
./dewee setup
./dewee agent chat --name <agent-key> --message "Hello"
```

Bỏ `--message` để trò chuyện tương tác. Danh sách lệnh đầy đủ nằm ở [Tham khảo CLI](/docs/runtime/cli), còn cấu hình cho môi trường production nằm ở [Cài đặt và chạy gateway](/docs/runtime/install-and-run).

> [!WARNING]
> Mặc định gateway lắng nghe ở `0.0.0.0` và từ chối khởi động trên địa chỉ không phải loopback nếu thiếu gateway token. Secret chỉ được mã hoá khi có `GOCLAW_ENCRYPTION_KEY`. Cả hai script ở trên đều sinh sẵn hai giá trị này; hãy giữ chúng cẩn thận và luôn đi cùng nhau nếu bạn chuyển môi trường.

## Khi có trục trặc

- **Console báo runtime offline.** Mở [Sức khoẻ runtime](/docs/console/monitoring) để xem bước kiểm tra nào thất bại.
- **Xác minh provider thất bại.** Kiểm tra key còn hiệu lực và tài khoản provider còn credit, rồi thử lại.
- **`curl /health` không phản hồi.** Chạy `./dewee doctor` để in ra đường dẫn cấu hình, trạng thái cơ sở dữ liệu và phiên bản.
