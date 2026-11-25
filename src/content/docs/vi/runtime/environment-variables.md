---
title: Biến môi trường
description: Toàn bộ biến môi trường mà trình cài đặt, gateway và bảng điều khiển dewee đọc, kèm giá trị mặc định, tác dụng, điều kiện đi kèm và biến nào cần giữ bí mật.
section: runtime
order: 4
updated: 2026-11-25
---

Trang này liệt kê các biến môi trường dewee đọc, chia theo thành phần đọc chúng. Nếu bạn cần các bước cài đặt, hãy bắt đầu từ [Cài đặt và chạy gateway](/docs/runtime/install-and-run) hoặc [Tự cài đặt](/docs/get-started/self-install).

## Cách đọc trang này

- **Hai tiền tố.** Phần lớn thiết lập của gateway vẫn giữ tiền tố gốc `GOCLAW_`. Các thiết lập mới hơn, trình cài đặt và bảng điều khiển dùng `DEWEE_`. Hãy dùng đúng tên như trong bảng.
- **Biến môi trường thắng file cấu hình.** Gateway đọc `config.json` trước rồi để biến môi trường ghi đè. Ngoại lệ là `GOCLAW_PROVIDER` và `GOCLAW_MODEL`: chúng chỉ có tác dụng khi file cấu hình để trống.
- **Đổi xong phải khởi động lại.** Mọi biến đều được đọc lúc tiến trình khởi động. Sửa `dewee.env` (cài bằng binary) hoặc `.env` / file Compose (cài bằng Docker), rồi khởi động lại dewee.
- **Giá trị mặc định.** "Chưa đặt" nghĩa là không có giá trị và tính năng cần nó sẽ không chạy. "Tắt" nghĩa là một công tắc bị tắt cho tới khi bạn bật.
- **Bí mật.** Những dòng ghi **bí mật** chứa thông tin đăng nhập. Đừng đưa chúng vào Git, tin nhắn hay log, và hãy sao lưu khoá mã hoá cùng với bản sao lưu cơ sở dữ liệu. Trang này không bao giờ đưa giá trị mẫu cho chúng.

## Tuỳ chọn của trình cài đặt

`install.sh` đọc các biến này khi cài hoặc nâng cấp dewee. Chúng không được lưu lại cho dịch vụ đang chạy, trừ khi có ghi chú.

| Biến | Mặc định | Tác dụng |
|---|---|---|
| `DEWEE_VERSION` | bản mới nhất của kênh | Phiên bản cần cài, ví dụ `3.60.0` (có `v` ở đầu cũng được). `latest` là bản mới nhất. |
| `DEWEE_CHANNEL` | `stable` | `stable` hoặc `beta`. |
| `DEWEE_HOME` | `~/.dewee` | Thư mục cài đặt. Phải là thư mục riêng, không phải `/` hay thư mục home. Tương đương `--dir`. CLI `dewee` cũng dùng nó để tìm `dewee.env`. |
| `DEWEE_APP_PORT` | `4321` | Cổng của bảng điều khiển. Dùng cổng nào cũng được trừ `18790`, cổng của runtime. Tương đương `--port`. |
| `DEWEE_BIND_ADDR` | `127.0.0.1` | Địa chỉ bảng điều khiển lắng nghe. Nếu không phải loopback, trình cài đặt sẽ cảnh báo; khi đó hãy đặt một proxy TLS phía trước. |
| `DEWEE_INSTALL_MODE` | `binary` | `binary` hoặc `docker`. Tương đương `--docker`. |
| `DEWEE_INSTALL_POSTGRES` | `0` | `1` cho phép trình cài đặt cài PostgreSQL 17 kèm pgvector qua Homebrew hoặc apt. |
| `GOCLAW_POSTGRES_DSN`, `DEWEE_APP_POSTGRES_DSN` | tự tạo | Dùng cơ sở dữ liệu của bạn cho runtime và bảng điều khiển. Phải đặt cả hai. Tương đương `--postgres-dsn-runtime` và `--postgres-dsn-app`. **Bí mật** (có chứa mật khẩu). |
| `DEWEE_NO_START` | `0` | `1` chỉ cài, không khởi động dịch vụ. |
| `DEWEE_NO_OPEN` | `0` | `1` không mở trình duyệt khi cài xong. |
| `DEWEE_YES` | `0` | `1` nhận mọi lựa chọn mặc định mà không hỏi. Nó không bao giờ tự cài PostgreSQL nếu thiếu `DEWEE_INSTALL_POSTGRES=1`, và bắt buộc phải có khi hạ phiên bản. |
| `DEWEE_CDN_BASE` | `https://cdn.dewee.sh` | Nơi tải gói phát hành và checksum. Phải là HTTPS. |
| `DEWEE_READY_TIMEOUT` | `120` (binary), `180` (Docker) | Số giây chờ dewee phản hồi trước khi trình cài đặt bỏ cuộc. |

Ở chế độ Docker, trình cài đặt còn ghi `DEWEE_VERSION`, `DEWEE_APP_PORT` và `DEWEE_BIND_ADDR` vào file `.env` cạnh `docker-compose.yml`.

### Trình cài đặt ghi gì vào `dewee.env`

Bản cài binary giữ thiết lập trong file `dewee.env` ở thư mục cài đặt. Các bí mật được `dewee selfhost init-secrets` tạo một lần và không bao giờ bị ghi đè ở lần cài hay nâng cấp sau. Cổng, địa chỉ lắng nghe và thông tin cơ sở dữ liệu chỉ bị thay khi bạn truyền lại đúng tuỳ chọn đó.

| Biến | Giá trị | Ghi chú |
|---|---|---|
| `GOCLAW_GATEWAY_TOKEN` | 32 byte ngẫu nhiên | **Bí mật.** |
| `GOCLAW_ENCRYPTION_KEY` | 32 byte ngẫu nhiên | **Bí mật.** Nhớ sao lưu. |
| `DEWEE_APP_ACCESS_SECRET` | 32 byte ngẫu nhiên | **Bí mật.** Ký các đường dẫn thiết lập và khôi phục. |
| `DEWEE_PROVISIONING_KEY_ID`, `DEWEE_PROVISIONING_SECRET` | `self-hosted`, 32 byte ngẫu nhiên | Khoá bảng điều khiển dùng để gọi runtime. Phần secret là **bí mật**. |
| `DEWEE_APP_POSTGRES_PASSWORD`, `POSTGRES_PASSWORD` | 32 byte ngẫu nhiên | **Bí mật.** Mật khẩu cơ sở dữ liệu. |
| `GOCLAW_POSTGRES_DSN`, `DEWEE_APP_POSTGRES_DSN` | tự tạo | **Bí mật.** |
| `GOCLAW_HOST`, `GOCLAW_PORT` | `127.0.0.1`, `18790` | Runtime chỉ nghe trên máy; bảng điều khiển chuyển tiếp yêu cầu tới nó. |
| `GOCLAW_TRUSTED_PROXIES` | `127.0.0.1,::1` | Bảng điều khiển chạy trên cùng máy. |
| `GOCLAW_DATA_DIR`, `GOCLAW_WORKSPACE`, `GOCLAW_CONFIG`, `GOCLAW_SKILLS_DIR`, `GOCLAW_BUNDLED_SKILLS_DIR`, `GOCLAW_MIGRATIONS_DIR` | các thư mục bên trong thư mục cài đặt | |
| `DEWEE_APP_EDITION` | `self_hosted` | |
| `DEWEE_DEPLOYMENT_MODE` | `on_prem` | |
| `DEWEE_LICENSE_MODE` | `channels_license` | |
| `DEWEE_LICENSE_GATE` | `channels` | |
| `DEWEE_RGD_MOUNT` | `hidden` | |
| `DEWEE_RUNTIME_URL`, `DEWEE_RUNTIME_HTTP_URL` | `http://127.0.0.1:18790`, `/_runtime` | Cách bảng điều khiển gọi tới runtime. |
| `DEWEE_CUSTOMER_BUNDLE_DIR` | thư mục bản phát hành | Tài nguyên tĩnh bảng điều khiển phục vụ. |
| `DEWEE_SETUP_TOKEN_MODE` | `required` | Xem [Bảng điều khiển](#bảng-điều-khiển). |
| `DEWEE_PUBLISHED_BIND_ADDR`, `HOST`, `PORT` | địa chỉ và cổng bạn chọn | |
| `DEWEE_INVITE_EMAIL_PROVIDER` | `disabled` | Xem [Bảng điều khiển](#bảng-điều-khiển). |

## Lõi runtime

Gateway đọc các biến này (lệnh `dewee` không kèm lệnh con).

### Lắng nghe và đường dẫn

| Biến | Mặc định | Tác dụng |
|---|---|---|
| `GOCLAW_CONFIG` | `config.json` trong thư mục đang chạy | File cấu hình. Cờ `--config` được ưu tiên hơn. |
| `GOCLAW_HOST` | `0.0.0.0` | Địa chỉ lắng nghe. Nếu không phải loopback thì gateway bắt buộc có gateway token. |
| `GOCLAW_PORT` | `18790` | Cổng của HTTP API và WebSocket tại `/ws`. |
| `GOCLAW_DATA_DIR` | `~/.goclaw/data` | Thư mục dữ liệu: file SQLite, kho skill và những thứ tương tự. |
| `GOCLAW_WORKSPACE` | `~/.goclaw/workspace` | Thư mục gốc chứa file làm việc của agent. |
| `GOCLAW_MIGRATIONS_DIR` | `migrations` cạnh file binary | Các migration SQL. |
| `GOCLAW_PUBLIC_URL` | chưa đặt | Địa chỉ công khai của gateway, ví dụ `https://dewee.example.com`. Dùng cho callback của kênh, URL webhook, đường dẫn tải về, OAuth và đường dẫn nhập thông tin đăng nhập. Phải là HTTPS, trừ địa chỉ loopback. Khi đã đặt, không yêu cầu nào thay đổi được nó. |
| `GOCLAW_SHUTDOWN_GRACE_PERIOD_SEC` | `30` | Số giây chờ các yêu cầu đang dở hoàn tất khi tắt. |

### Cơ sở dữ liệu, edition và mở rộng

| Biến | Mặc định | Tác dụng |
|---|---|---|
| `GOCLAW_POSTGRES_DSN` | chưa đặt | Chuỗi kết nối PostgreSQL. Bản build chuẩn bắt buộc phải có. **Bí mật.** |
| `GOCLAW_STORAGE_BACKEND` | `postgres` | `postgres` hoặc `sqlite`. SQLite cần bản build có hỗ trợ SQLite và chỉ chạy trên một máy. |
| `GOCLAW_SQLITE_PATH` | `<thư mục dữ liệu>/dewee.db` | File SQLite, khi dùng `sqlite`. |
| `GOCLAW_REDIS_DSN` | chưa đặt | Chuỗi kết nối Redis, chỉ cho bản build có hỗ trợ Redis. **Bí mật.** |
| `GOCLAW_EDITION` | `lite` khi dùng SQLite, còn lại `standard` | Ép dùng `standard` hoặc `lite`. Giá trị lạ chỉ bị cảnh báo và dùng `standard`. |
| `GOCLAW_REPLICA_MODE` | `single` | `single` hoặc `multi`. `multi` sẽ không khởi động nếu bốn thiết lập dưới đây chưa dùng PostgreSQL và chưa đặt `GOCLAW_TENANT_TRANSFER_REPLICA_ORIGINS`. |
| `GOCLAW_COORDINATION_BACKEND`, `GOCLAW_CACHE_BACKEND`, `GOCLAW_EVENT_FANOUT_BACKEND` | cục bộ | Đặt `postgres` khi dùng `multi`. |
| `GOCLAW_STORAGE_MODE` | `local` | Nơi lưu file. Hiện `multi` chỉ chạy với `local`. |
| `GOCLAW_WS_SCALE_MODE` | cục bộ | `sticky` hoặc `event-fanout` khi dùng `multi`. |
| `GOCLAW_TENANT_TRANSFER_REPLICA_ORIGINS` | chưa đặt | Danh sách origin của các replica khác, cách nhau bằng dấu phẩy. Bắt buộc với `multi`. |

`GOCLAW_MODE` đã bị bỏ. Nếu còn đặt, gateway chỉ ghi một cảnh báo.

### Xác thực, mã hoá và proxy

| Biến | Mặc định | Tác dụng |
|---|---|---|
| `GOCLAW_GATEWAY_TOKEN` | chưa đặt | Bearer token mà client gửi tới gateway. Bắt buộc khi lắng nghe ngoài loopback. **Bí mật.** |
| `GOCLAW_ENCRYPTION_KEY` | chưa đặt | Khoá mã hoá các bí mật đã lưu bằng AES-256-GCM: 64 ký tự hex hoặc base64 của 32 byte. Thiếu khoá này, gateway chỉ cảnh báo và lưu bí mật ở dạng không mã hoá. Đổi khoá về sau sẽ khiến các bí mật đã lưu không đọc được nữa. **Bí mật.** |
| `GOCLAW_REQUIRE_AUTH` | tắt | Bắt buộc token ở mọi nơi và token phải dài ít nhất 32 ký tự. Không dùng chung được với `GOCLAW_ALLOW_INSECURE_NO_AUTH`. |
| `GOCLAW_ALLOW_INSECURE_NO_AUTH` | tắt | Chỉ dành cho phát triển trên máy: cho phép chạy không token dù lắng nghe ngoài loopback. |
| `GOCLAW_TRUSTED_PROXIES` | trống | Danh sách IP, dải CIDR hoặc hostname được phép gửi `X-Forwarded-Host` và `X-Forwarded-Proto`, cách nhau bằng dấu phẩy. Một mục sai sẽ chặn khởi động. |
| `GOCLAW_ALLOWED_ORIGINS` | trống | Các origin trình duyệt được CORS cho phép, cách nhau bằng dấu phẩy. |
| `GOCLAW_OWNER_IDS` | trống | ID người dùng được coi là chủ hệ thống, cách nhau bằng dấu phẩy. |
| `GOCLAW_ALLOW_PRIVATE_PROVIDER_URLS` | tắt | Cho phép base URL của model provider trỏ vào địa chỉ nội bộ hoặc loopback, ví dụ Ollama chạy trên máy. Bật nó là tắt một lớp chống tấn công SSRF, nên chỉ bật khi thật sự cần. |
| `GOCLAW_TSNET_AUTH_KEY` | chưa đặt | Auth key của Tailscale khi gateway tham gia một tailnet. **Bí mật.** `GOCLAW_TSNET_HOSTNAME` và `GOCLAW_TSNET_DIR` đặt tên node và thư mục trạng thái. |

### Log

| Biến | Mặc định | Tác dụng |
|---|---|---|
| `GOCLAW_LOG_LEVEL` | `info` | `debug`, `info`, `warn` hoặc `error`. |
| `GOCLAW_LOG_FILE` | `/var/log/dewee/dewee.log` nếu thư mục đó tồn tại, nếu không thì chỉ in ra standard output | File log. Các dòng log vẫn được in ra standard output. |
| `GOCLAW_TRACE_VERBOSE` | tắt | Đặt giá trị bất kỳ để bật trace chi tiết. |
| `GOCLAW_DEBUG` | tắt | `1` ghi chi tiết hoạt động của provider Claude CLI. |

### Luồng chạy song song

Số lượt chạy mỗi loại được chạy cùng lúc. Chỉ nhận số nguyên dương; giá trị khác sẽ dùng mặc định.

| Biến | Mặc định |
|---|---|
| `GOCLAW_LANE_MAIN` | `30` |
| `GOCLAW_LANE_SUBAGENT` | `50` |
| `GOCLAW_LANE_TEAM` (tên cũ `GOCLAW_LANE_DELEGATE`) | `100` |
| `GOCLAW_LANE_CRON` | `30` |
| `GOCLAW_LANE_WORKFLOW` | `20` |
| `GOCLAW_LANE_EVENT` | `10` |

### Sandbox, skill và package

| Biến | Mặc định | Tác dụng |
|---|---|---|
| `GOCLAW_SANDBOX_MODE`, `GOCLAW_SANDBOX_IMAGE`, `GOCLAW_SANDBOX_SCOPE`, `GOCLAW_SANDBOX_WORKSPACE_ACCESS` | theo file cấu hình | Sandbox chạy lệnh của agent. |
| `GOCLAW_SANDBOX_MEMORY_MB` | `512` | Giới hạn bộ nhớ của mỗi container sandbox. |
| `GOCLAW_SANDBOX_CPUS`, `GOCLAW_SANDBOX_TIMEOUT_SEC` | theo file cấu hình | Giới hạn CPU và thời gian chạy. |
| `GOCLAW_SANDBOX_NETWORK` | tắt | `true` hoặc `1` cho sandbox truy cập mạng. |
| `GOCLAW_SKILLS_DIR` | `<thư mục dữ liệu>/skills` | Thư mục skill dùng chung. |
| `GOCLAW_BUNDLED_SKILLS_DIR` (hoặc `GOCLAW_BUILTIN_SKILLS_DIR`) | `/app/bundled-skills` nếu có | Các skill đi kèm dewee. |
| `GOCLAW_DISABLE_PERSONAL_SKILLS` | tắt | `1` ngừng nạp skill cá nhân từ thư mục home. |
| `GOCLAW_SKILLS_MAX_UPLOAD_SIZE_MB` | `20` | Dung lượng tối đa khi tải skill lên. |
| `GOCLAW_PACKAGES_MAX_ASSET_SIZE_MB` | `200` | Dung lượng tối đa của package tải từ GitHub. |
| `GOCLAW_PACKAGES_GITHUB_TOKEN` | chưa đặt | GitHub token để cài package. **Bí mật.** |
| `GOCLAW_PACKAGES_GITHUB_ALLOWED_ORGS` | chưa đặt | Các tổ chức GitHub được phép làm nguồn package, cách nhau bằng dấu phẩy. |
| `GOCLAW_PACKAGES_GITHUB_BIN_DIR`, `GOCLAW_PACKAGES_GITHUB_MANIFEST` | chưa đặt | Nơi đặt binary của package đã cài và manifest của chúng. |

### Nâng cấp, giá model và thiết lập khác

| Biến | Mặc định | Tác dụng |
|---|---|---|
| `GOCLAW_AUTO_UPGRADE` | tắt | Đúng giá trị `true` sẽ tự chạy migration khi schema cơ sở dữ liệu cũ hơn bản đang chạy. |
| `GOCLAW_UPGRADE_TRIGGER_TOKEN` | chưa đặt | Token bảo vệ điểm kích hoạt nâng cấp qua HTTP. **Bí mật.** `GOCLAW_UPGRADE_SCRIPT` và `GOCLAW_UPGRADE_STATUS_PATH` trỏ tới script và file trạng thái của nó. |
| `GOCLAW_PRICING_SYNC_INTERVAL` | `6h` | Chu kỳ cập nhật bảng giá model. Tối thiểu `15m`; `0` hoặc `off` để tắt. |
| `GOCLAW_BROWSER_REMOTE_URL` | chưa đặt | Địa chỉ một trình duyệt từ xa. Đặt biến này sẽ bật luôn công cụ trình duyệt. |
| `GOCLAW_EXEC_TENANT_HOST_POLICY` | theo file cấu hình | Agent của workspace có được chạy lệnh trên máy chủ hay không. Giá trị sai sẽ chặn khởi động. |
| `GOCLAW_CREDENTIAL_LINK_BASE_URL` | chưa đặt | Origin của form an toàn nơi người dùng nhập thông tin đăng nhập. HTTPS (hoặc HTTP loopback), không có đường dẫn. Thiếu nó thì không có đường dẫn nhập thông tin đăng nhập. |
| `GOCLAW_CREDENTIAL_LINK_FRAGMENT` | bật | Giữ token của đường dẫn trong phần fragment của URL. `0`, `false`, `no` hoặc `off` chuyển nó sang query string. |
| `DEWEE_UPDATE_CHANNEL_URL` | `https://cdn.dewee.sh` | Nơi gateway kiểm tra bản phát hành mới. |
| `DEWEE_INTERACTION_NOTICE_RATE_PER_MIN` | `60` | Số thông báo gửi người duyệt cho mỗi workspace mỗi phút. `0` để tắt. |
| `DEWEE_CCP_URL` | chưa đặt | Địa chỉ công khai của bảng điều khiển, dùng cho đường dẫn trong email về các yêu cầu cần xử lý. Thiếu nó thì email không có đường dẫn. |
| `DEWEE_INTERACTION_LINK_SECRET` | suy ra từ khoá mã hoá | Ký các đường dẫn đó. **Bí mật.** |
| `DEWEE_EMAIL_FROM`, `RESEND_API_KEY` | chưa đặt | Địa chỉ gửi và khoá Resend cho email của runtime. Cần cả hai. Khoá là **bí mật**. |

Các script triển khai và sao lưu trong repo dewee còn đọc thêm một số biến `GOCLAW_*` (ví dụ `GOCLAW_BACKUP_*` và `GOCLAW_RELEASE_*`). Chúng thuộc về script chứ không phải gateway, nên không liệt kê ở đây.

## Model provider, giọng nói và kênh

Khoá của model provider thường được thêm trong console, nơi chúng được lưu đã mã hoá. Gateway cũng đọc các biến sau khi khởi động. Mọi khoá đều là **bí mật**.

| Biến | Base URL mặc định |
|---|---|
| `GOCLAW_ANTHROPIC_API_KEY`, `GOCLAW_ANTHROPIC_BASE_URL` | `https://api.anthropic.com/v1` |
| `GOCLAW_OPENAI_API_KEY`, `GOCLAW_OPENAI_BASE_URL` | `https://api.openai.com/v1` |
| `GOCLAW_OPENROUTER_API_KEY` | `https://openrouter.ai/api/v1` |
| `GOCLAW_GEMINI_API_KEY` | `https://generativelanguage.googleapis.com` |
| `GOCLAW_GROQ_API_KEY` | `https://api.groq.com/openai/v1` |
| `GOCLAW_DEEPSEEK_API_KEY` | `https://api.deepseek.com/v1` |
| `GOCLAW_MISTRAL_API_KEY` | `https://api.mistral.ai/v1` |
| `GOCLAW_XAI_API_KEY` | `https://api.x.ai/v1` |
| `GOCLAW_MINIMAX_API_KEY` | `https://api.minimax.io/v1` |
| `GOCLAW_COHERE_API_KEY` | `https://api.cohere.ai/compatibility/v1` |
| `GOCLAW_PERPLEXITY_API_KEY` | `https://api.perplexity.ai` |
| `GOCLAW_DASHSCOPE_API_KEY`, `GOCLAW_BAILIAN_API_KEY` | `https://dashscope-intl.aliyuncs.com/compatible-mode/v1` |
| `GOCLAW_ZAI_API_KEY` | `https://api.z.ai/api/paas/v4` |
| `GOCLAW_ZAI_CODING_API_KEY` | `https://api.z.ai/api/coding/paas/v4` |
| `GOCLAW_OLLAMA_HOST` (không cần khoá) | `http://localhost:11434` |
| `GOCLAW_OLLAMA_CLOUD_API_KEY`, `GOCLAW_OLLAMA_CLOUD_API_BASE` | |
| `GOCLAW_VERCEL_AI_GATEWAY_API_KEY`, `GOCLAW_VERCEL_AI_GATEWAY_API_BASE` | |
| `GOCLAW_ATLASCLOUD_API_KEY`, `GOCLAW_ATLASCLOUD_API_BASE` | |
| `GOCLAW_VERTEX_API_KEY` hoặc `GOCLAW_VERTEX_CREDENTIALS_FILE`, kèm `GOCLAW_VERTEX_PROJECT_ID`, `GOCLAW_VERTEX_REGION`, `GOCLAW_VERTEX_MODEL` | Google Vertex AI. File credentials là đường dẫn tới file JSON của service account; hãy bảo vệ file đó. |

- `GOCLAW_PROVIDER` và `GOCLAW_MODEL` chọn provider và model mặc định, chỉ khi file cấu hình chưa có.
- `GOCLAW_CLAUDE_CLI_PATH`, `GOCLAW_CLAUDE_CLI_MODEL` và `GOCLAW_CLAUDE_CLI_WORK_DIR` cấu hình provider Claude CLI.
- Chuyển văn bản thành giọng nói: `GOCLAW_TTS_OPENAI_API_KEY`, `GOCLAW_TTS_ELEVENLABS_API_KEY`, `GOCLAW_TTS_GEMINI_API_KEY`, `GOCLAW_TTS_MINIMAX_API_KEY` kèm `GOCLAW_TTS_MINIMAX_GROUP_ID`. Tất cả là **bí mật**.
- Kênh: `GOCLAW_TELEGRAM_TOKEN`, `GOCLAW_DISCORD_TOKEN`, `GOCLAW_ZALO_TOKEN`, `GOCLAW_SLACK_BOT_TOKEN`, `GOCLAW_SLACK_APP_TOKEN`, `GOCLAW_SLACK_USER_TOKEN`, và với Lark/Feishu là `GOCLAW_LARK_APP_ID` kèm `GOCLAW_LARK_APP_SECRET`, `GOCLAW_LARK_ENCRYPT_KEY`, `GOCLAW_LARK_VERIFICATION_TOKEN`. Tất cả trừ app ID đều là **bí mật**. Thông thường bạn kết nối kênh trong console thay vì dùng các biến này.

## Feature flag

Feature flag bật những phần của dewee còn mới, đang thử nghiệm, hoặc chỉ một số bản cài cần đến. Tất cả đều **tắt** trừ khi có ghi chú, và đều cần khởi động lại.

> Không phải chỗ nào cũng đọc giá trị giống nhau. Trừ khi dòng đó ghi khác, hãy dùng `1` hoặc `true`; gõ sai sẽ bị coi là tắt mà không báo lỗi. Riêng các flag của MCP workspace thì chặt chẽ: gõ sai sẽ khiến gateway không khởi động.

### Định tuyến model

| Biến | Tác dụng | Cần có |
|---|---|---|
| `DEWEE_ROUTING_PRESETS_ENABLED` | Preset định tuyến, route và lệnh đi kèm. Đây là công tắc chung của cả mảng định tuyến. | |
| `DEWEE_ROUTING_ACTIVE_ENABLED` | Cho preset thực sự điều hướng lưu lượng: canary và model route có hiệu lực. | `DEWEE_ROUTING_PRESETS_ENABLED` |
| `DEWEE_ROUTING_PUBLIC_LIBRARY_ENABLED` | Thư viện preset công khai. | `DEWEE_ROUTING_PRESETS_ENABLED` |
| `DEWEE_ROUTING_PRESET_SHARING_ENABLED` | Chia sẻ preset. | `DEWEE_ROUTING_PRESETS_ENABLED` |
| `DEWEE_ROUTING_EXPERIMENTS_ENABLED` | Checkpoint và thử nghiệm fork. | Công tắc độc lập; fork cần PostgreSQL. |
| `DEWEE_ROUTING_CACHE_TTLS` | Không phải công tắc. Ghi đè thời gian sống giả định của prompt cache theo từng provider, dạng các cặp `type=duration` cách nhau bằng dấu phẩy. Mặc định: `anthropic_native=5m`, `chatgpt_oauth=10m`; `0` để bỏ một mục. Chỉ dùng khi định tuyến chủ động đang bật. | `DEWEE_ROUTING_ACTIVE_ENABLED` |

Xem [Provider, fallback và suy luận](/docs/concepts/providers-and-routing) để biết chúng hoạt động ra sao trong thực tế.

### Bộ nhớ

| Biến | Tác dụng | Ghi chú |
|---|---|---|
| `DEWEE_ASSOCIATIVE_RECALL_ENABLE` | Cho phép agent dùng associative recall ở chế độ chủ động. Chế độ shadow được đặt theo từng agent và không cần biến này. | Đúng `1`. |
| `DEWEE_ASSOCIATIVE_RECALL_KILL` | Tắt associative recall chủ động cho mọi agent. | Giá trị bất kỳ trừ `0` hoặc `false` đều kích hoạt. |
| `DEWEE_EPISODIC_SCREEN` | Kiểm tra từng episode bộ nhớ mới xem có lệnh bị chèn vào không, và loại những episode bị gắn cờ khỏi recall. Tốn một lệnh gọi model chạy nền cho mỗi episode. | Đúng `1`. |

### Proactive agent

Mỗi cấp cần cấp phía trên nó. Mọi giá trị phải đúng là `1`.

| Biến | Tác dụng |
|---|---|
| `DEWEE_PROACTIVE_AGENTS_ENABLED` | Hiện Proactive trong API, CLI, MCP và console. |
| `DEWEE_PROACTIVE_AGENTS_ENGINE_ENABLED` | Chạy worker rà soát chạy nền. |
| `DEWEE_PROACTIVE_AGENTS_PLANNER_ENABLED` | Cho phép các lượt rà soát gọi model, tức là tốn token. Cần engine. |
| `DEWEE_PROACTIVE_AGENTS_REFLEX_SHADOW` | Ghi lại điều bộ lập kế hoạch nhanh định làm nhưng không thực hiện. Cần engine. |
| `DEWEE_PROACTIVE_AGENTS_KILL` | Ép tắt mọi flag ở trên. Chỉ `1` mới có tác dụng; `true` thì không. |

### Endpoint MCP công khai

Endpoint MCP của agent tại `/mcp/server`. Đọc [Webhook và MCP](/docs/api/webhooks-and-mcp) trước khi bật.

| Biến | Mặc định | Tác dụng |
|---|---|---|
| `GOCLAW_MCP_PUBLIC_ENABLED` | tắt | Bật endpoint. |
| `GOCLAW_MCP_SERVER_TOKEN` | chưa đặt | Token của người vận hành cho endpoint, gắn với workspace trong `GOCLAW_MCP_SERVER_TENANT_ID`. Chỉ đặt qua biến môi trường. **Bí mật.** |
| `GOCLAW_MCP_PUBLIC_OAUTH_ENABLED` | tắt | Đăng nhập OAuth 2.1 cho endpoint. Cần `GOCLAW_MCP_PUBLIC_ENABLED`, `GOCLAW_MCP_PUBLIC_OAUTH_ISSUER` và `GOCLAW_MCP_PUBLIC_OAUTH_JWKS_URI` (HTTPS, cùng origin) cùng khoá provisioning; thiếu là gateway không khởi động. |
| `GOCLAW_MCP_OAUTH_PUBLIC_URL` | `GOCLAW_PUBLIC_URL` | Origin công khai dùng cho callback OAuth. |
| `GOCLAW_MCP_PUBLIC_MAX_BODY_BYTES` | `1048576` (1 MiB) | Kích thước tối đa của body yêu cầu. |
| `GOCLAW_MCP_PUBLIC_REQUESTS_PER_MINUTE` | `120` | Số yêu cầu mỗi phút cho mỗi credential. |
| `GOCLAW_MCP_PUBLIC_MAX_CONCURRENT_TOOL_CALLS` | `4` | Số lệnh gọi tool chạy cùng lúc cho mỗi credential. |
| `GOCLAW_MCP_PUBLIC_TOOL_CALL_TIMEOUT_SECONDS` | `60` | Thời gian tối đa của một lệnh gọi tool. |
| `GOCLAW_MCP_PUBLIC_FAILURES_PER_MINUTE` | `60` | Số lần đăng nhập thất bại mỗi phút cho mỗi credential. |
| `GOCLAW_MCP_PUBLIC_GLOBAL_FAILURES_PER_MINUTE` | `600` | Tổng số lần đăng nhập thất bại mỗi phút. |
| `GOCLAW_MCP_PUBLIC_TENANT_REQUESTS_PER_MINUTE` | `600` | Số yêu cầu mỗi phút cho mỗi workspace. |
| `GOCLAW_MCP_PUBLIC_TENANT_MAX_CONCURRENT_TOOL_CALLS` | `16` | Số lệnh gọi tool cùng lúc cho mỗi workspace. |
| `GOCLAW_MCP_EVENTS_CLIENT_ENABLED` | tắt | Workspace đăng ký nhận sự kiện từ các MCP server nó dùng. |
| `GOCLAW_MCP_EVENTS_SERVER_ENABLED` | tắt | MCP client đăng ký nhận sự kiện của workspace. Cần endpoint workspace bên dưới. |
| `DEWEE_MCP_INSTALL_MANAGE_GRANT_ENABLED` | tắt | Thành viên có quyền `integrations.manage` được duyệt yêu cầu cài MCP server từ xa. Đúng `true`. |

### Endpoint MCP workspace

Endpoint quản lý workspace tại `/mcp/workspace`. Các công tắc này chặt chẽ: gõ sai giá trị sẽ chặn khởi động.

| Biến | Tác dụng | Cần có |
|---|---|---|
| `GOCLAW_MCP_WORKSPACE_ENABLED` | Bật endpoint. | `GOCLAW_MCP_WORKSPACE_RESOURCE_ORIGIN` |
| `GOCLAW_MCP_WORKSPACE_RESOURCE_ORIGIN` | Origin công khai của endpoint. Không bao giờ lấy từ yêu cầu. | |
| `GOCLAW_MCP_WORKSPACE_RESOURCE_ALIAS_ORIGINS` | Các origin khác cũng trỏ tới endpoint, cách nhau bằng dấu phẩy. | |
| `GOCLAW_MCP_WORKSPACE_TENANTS` | ID các workspace được dùng, cách nhau bằng dấu phẩy. Chưa đặt nghĩa là mọi workspace đủ điều kiện; danh sách rỗng nghĩa là không workspace nào. Workspace master không bao giờ được phép. | |
| `GOCLAW_MCP_WORKSPACE_READ` | Quyền chỉ đọc. | |
| `GOCLAW_MCP_WORKSPACE_CONFIG_WRITE` | Thay đổi cấu hình ít rủi ro. | `_TENANTS` hoặc `_DEFAULT_WRITE` |
| `GOCLAW_MCP_WORKSPACE_PRIVILEGED_WRITE` | Chạy, xuất bản và thay đổi quyền truy cập. | `_TENANTS` hoặc `_DEFAULT_WRITE` |
| `GOCLAW_MCP_WORKSPACE_DEFAULT_WRITE` | Quyền ghi cho các workspace đủ điều kiện khi chưa đặt `_TENANTS`. | |
| `GOCLAW_MCP_WORKSPACE_OAUTH` | Đăng nhập OAuth cho endpoint. | `GOCLAW_MCP_PUBLIC_OAUTH_ISSUER`, `_JWKS_URI`, PostgreSQL |
| `GOCLAW_MCP_WORKSPACE_DIRECT_EXECUTION` | `off`, `shadow` hoặc `on`. | |
| `GOCLAW_MCP_WORKSPACE_PLATFORM_OPERATOR` | Thao tác chỉ dành cho người vận hành trên workspace master, cần một người vận hành khác duyệt. | |
| `GOCLAW_MCP_WORKSPACE_PLATFORM_WRITE` | Thay đổi phạm vi toàn hệ thống qua workspace master. | `_PLATFORM_OPERATOR` |
| `GOCLAW_MCP_WORKSPACE_PLATFORM_OWNER_CONFIRMATION` | Cho chủ sở hữu tự xác nhận yêu cầu vận hành của chính mình. | `_PLATFORM_OPERATOR` |

### Danh tính

| Biến | Tác dụng | Cần có |
|---|---|---|
| `GOCLAW_IDENTITY_ENABLED` | Xác định người dùng trên kênh thực sự là ai (trusted user context). | |
| `GOCLAW_IDENTITY_ENFORCE_ENABLED` | Áp danh tính đó lên các tool gắn với từng người. | `GOCLAW_IDENTITY_ENABLED` |
| `GOCLAW_IDENTITY_EXCHANGE_ENABLED` | Trao đổi phiên, liên kết tài khoản và các route vòng đời. Giá trị sai chỉ ghi lỗi và để chúng tắt. | `GOCLAW_IDENTITY_ENABLED` |
| `GOCLAW_IDENTITY_CONNECT_ENABLED` | Các trang Dewee Connect nơi người dùng chứng minh danh tính. | `GOCLAW_IDENTITY_ENABLED`, và `GOCLAW_IDENTITY_CONNECT_BASE_URL` hoặc `GOCLAW_PUBLIC_URL` qua HTTPS |
| `GOCLAW_IDENTITY_TEST_MODE_ENABLED` | Kênh thử nghiệm giả lập. Chỉ cho bản build phát triển; bản phát hành sẽ từ chối và ghi một sự kiện bảo mật. | `GOCLAW_IDENTITY_ENABLED` |
| `GOCLAW_IDENTITY_PROOF_BUDGET_PER_SENDER`, `_PER_TENANT`, `_WINDOW_SECONDS` | Giới hạn số lần thử mã xác minh. Là số, không phải công tắc; giá trị sai sẽ chặn khởi động. | |
| `GOCLAW_WEBCHAT_MEMBER_LINK_PROOF_ENABLED` | Cho khách trên chat website chứng minh họ là thành viên workspace. | `GOCLAW_IDENTITY_EXCHANGE_ENABLED` |

### Thông tin đăng nhập và uỷ quyền

Các flag này quyết định cách agent dùng thông tin đăng nhập đã lưu. Dùng `true` hoặc `1`.

| Biến | Tác dụng |
|---|---|
| `GOCLAW_CREDENTIAL_POLICY_READ_ENABLED`, `GOCLAW_CREDENTIAL_POLICY_WRITE_ENABLED` | Đọc và sửa chính sách chạy công cụ dòng lệnh kèm thông tin đăng nhập. |
| `GOCLAW_CREDENTIAL_FALLBACK_READ_ENABLED`, `GOCLAW_CREDENTIAL_FALLBACK_WRITE_ENABLED` | Đọc và sửa các quyền dùng thông tin đăng nhập dự phòng. |
| `GOCLAW_CREDENTIAL_FALLBACK_EFFECT_ENABLED` | Cho các quyền dự phòng có hiệu lực với lệnh và lệnh gọi MCP từ xa. |
| `GOCLAW_SERVICE_BINDING_WRITE_ENABLED` | Đổi tài khoản dịch vụ mà một thông tin đăng nhập được gắn vào. |
| `GOCLAW_SERVICE_CONSENT_ENABLED` | Hỏi đồng ý trước khi dùng thông tin đăng nhập của dịch vụ. |
| `GOCLAW_JOB_GRANT_READ_ENABLED`, `GOCLAW_JOB_GRANT_WRITE_ENABLED` | Đọc và sửa quyền uỷ quyền cho các job chạy nền. |

### Chat website, yêu cầu công việc và Vault

| Biến | Tác dụng |
|---|---|
| `GOCLAW_WEBCHAT_CREDENTIAL_REQUESTS_ENABLED` | Agent trên chat website được hỏi khách đã đăng nhập một thông tin đăng nhập. |
| `GOCLAW_WORK_REQUESTS_ENABLED` | API yêu cầu công việc cho nhân viên và tính năng tương ứng trên chat website. |
| `GOCLAW_VAULT_OPT_IN_INGESTION` | Cho agent chọn không tự động đưa file vào Knowledge Vault. |
| `GOCLAW_VAULT_OCR` | Đọc chữ trong PDF scan và ảnh. |
| `GOCLAW_VAULT_EVIDENCE_HANDLES` | Thêm trích dẫn đoạn văn vào kết quả tìm kiếm Vault. |

### Lệnh gạch chéo cho skill

Nhóm này **bật** sẵn, và giá trị lưu trong phần thiết lập hệ thống của console sẽ ghi đè biến môi trường.

| Biến | Mặc định | Tác dụng |
|---|---|---|
| `GOCLAW_SKILLS_SLASH_COMMANDS_ENABLED` | bật | Cho phép gọi skill bằng lệnh gạch chéo. |
| `GOCLAW_SKILLS_SLASH_COMMANDS_SUGGEST_NOT_FOUND` | bật | Gợi ý lệnh gần đúng khi gõ lệnh không tồn tại. |
| `GOCLAW_SKILLS_SLASH_COMMANDS_PARTIAL_MATCHING` | tắt | Chấp nhận phần đầu của tên lệnh. |
| `GOCLAW_SKILLS_SLASH_COMMANDS_PREFIX` | `/` | Ký tự mở đầu lệnh. |

### Telemetry, số liệu và nền tảng

| Biến | Mặc định | Tác dụng |
|---|---|---|
| `GOCLAW_TELEMETRY_ENABLED` | tắt | Xuất trace qua OpenTelemetry (OTLP). Đúng `true` hoặc `1`. |
| `GOCLAW_TELEMETRY_ENDPOINT`, `GOCLAW_TELEMETRY_PROTOCOL`, `GOCLAW_TELEMETRY_SERVICE_NAME` | chưa đặt | Gửi trace tới đâu và bằng cách nào. |
| `GOCLAW_TELEMETRY_INSECURE` | tắt | Gửi trace không qua TLS. |
| `DEWEE_METRICS_REPORTING` | tắt | Gửi báo cáo sử dụng. Cần thêm `DEWEE_METRICS_REPORT_URL` (HTTPS) và `DEWEE_METRICS_REPORT_TOKEN` (**bí mật**); thiếu hay sai thứ gì thì nó vẫn tắt. |
| `DEWEE_METRICS_SHARING_WRITE` | tắt | Cho chủ workspace đổi mức chia sẻ số liệu. Đúng `true`. |
| `DEWEE_METRICS_SHARING_CEILING` | không giới hạn | Mức chia sẻ cao nhất mà workspace được chọn. Giá trị sai sẽ quay về chỉ giữ cục bộ. |
| `DEWEE_DEPLOYMENT_KIND` | không rõ | Nhãn trong báo cáo: `shared_saas`, `cloud_dedicated`, `on_prem` hoặc `self_install`. |
| `DEWEE_PLATFORM_ACTIVITY_ROLLUP` | tắt | Bản tổng hợp hoạt động sản phẩm. Đúng `true`; cần PostgreSQL. |
| `DEWEE_PLATFORM_SUPPORT_ACCESS` | tắt | Cấp quyền truy cập cho bộ phận hỗ trợ. Đúng `true`. |
| `DEWEE_FLEET_CONTROLLER_ENABLED` | tắt | Bộ điều phối fleet cho các job package. |

### Sắp có: bật tắt feature flag trong Settings

Một thay đổi đang được review sẽ cho phép bật tắt các flag này trong Settings và bằng CLI `dewee`, không cần sửa biến môi trường. Trang này sẽ mô tả khi tính năng được phát hành.

## Giấy phép

| Biến | Mặc định | Tác dụng |
|---|---|---|
| `DEWEE_LICENSE_GATE` | `off` | `off`, `admission` hoặc `channels`. Gõ sai sẽ chặn khởi động. Bản tự cài đặt dùng `channels`. Khác với `DEWEE_LICENSE_MODE`. |
| `DEWEE_LICENSE_REQUIRED` | tắt | Bắt buộc có giấy phép trước khi nhận workspace. |
| `DEWEE_LICENSE_SERVER` | `https://app.dewee.sh` khi dùng `channels` | Máy chủ cấp giấy phép. |
| `DEWEE_LICENSE_STATE_FILE` | `<thư mục dữ liệu>/license/state.json` khi dùng `channels` | Nơi lưu trạng thái giấy phép. |
| `DEWEE_LICENSE_KEY_FILE`, `DEWEE_LICENSE_KEY_FD` | chưa đặt | Đọc khoá giấy phép từ file hoặc file descriptor, cho bản cài không có console. Khoá là **bí mật**. |
| `DEWEE_LICENSE_WORKSPACE_ID` | chưa đặt | Workspace của giấy phép một workspace. |

Xem [Giấy phép](/docs/runtime/licence).

## Bảng điều khiển

Bảng điều khiển tự lưu trữ (dashboard ở cổng `4321`) đọc các biến này.

| Biến | Mặc định | Tác dụng |
|---|---|---|
| `HOST`, `PORT` | `0.0.0.0`, `4321` | Nơi bảng điều khiển lắng nghe. Trình cài đặt đặt chúng từ `DEWEE_BIND_ADDR` và `DEWEE_APP_PORT`. |
| `DEWEE_APP_EDITION` | `self_hosted` | `self_hosted` hoặc `hosted`. |
| `DEWEE_DEPLOYMENT_MODE` | `on_prem` khi tự lưu trữ | `shared_saas`, `dedicated_tose` hoặc `on_prem`. |
| `DEWEE_LICENSE_MODE` | `annual_license_required` khi không phải SaaS | `subscription_entitlement`, `annual_license_required`, `operator_managed` hoặc `channels_license`. |
| `DEWEE_APP_PUBLIC_URL` | chưa đặt | Địa chỉ công khai của bảng điều khiển. Cần cho email mời. |
| `DEWEE_RUNTIME_URL`, `DEWEE_RUNTIME_HTTP_URL` | do trình cài đặt đặt | Cách bảng điều khiển gọi tới runtime. |
| `DEWEE_APP_POSTGRES_DSN` | tự tạo | Cơ sở dữ liệu của bảng điều khiển. **Bí mật.** |
| `DEWEE_APP_ACCESS_SECRET` | tự tạo | Ký các đường dẫn thiết lập và khôi phục; base64 của ít nhất 32 byte. **Bí mật.** |
| `DEWEE_PROVISIONING_KEY_ID`, `DEWEE_PROVISIONING_SECRET` | tự tạo | Khoá bảng điều khiển dùng để gọi runtime. `DEWEE_PROVISIONING_KEYS` (danh sách `id=secret` cách nhau bằng dấu phẩy) thay cho cặp này khi cần xoay vòng khoá. **Bí mật.** |
| `DEWEE_SETUP_TOKEN_MODE` | `required` | Trang thiết lập lần đầu đòi setup token. `loopback` chỉ bỏ qua token khi cả bảng điều khiển lẫn người truy cập đều ở trên cùng một máy. |
| `DEWEE_TRUSTED_PROXY_CIDRS` | trống | Địa chỉ và dải CIDR của reverse proxy đứng trước bảng điều khiển, cách nhau bằng dấu phẩy. Một mục sai hoặc dải `/0` sẽ chặn khởi động. Trình cài đặt không ghi biến này; bạn tự thêm. Khác với `GOCLAW_TRUSTED_PROXIES`. |
| `DEWEE_INVITE_EMAIL_PROVIDER` | `disabled` | `disabled` hoặc `resend`. `resend` cần thêm `RESEND_API_KEY` (**bí mật**), `DEWEE_INVITE_EMAIL_FROM` và `DEWEE_APP_PUBLIC_URL`. |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | chưa đặt | Đăng nhập bằng GitHub hoặc Google. Các secret là **bí mật**. |

Dịch vụ hosted tại app.dewee.sh còn đọc thêm một số biến (thanh toán, phân tích, đăng nhập hosted). Bản tự lưu trữ không cần đến chúng.

## CLI `dewee`

Lệnh `dewee` đọc các biến này khi làm việc với một gateway. Xem [CLI](/docs/runtime/cli).

| Biến | Mặc định | Tác dụng |
|---|---|---|
| `DEWEE_SERVER` (tên cũ `GOCLAW_SERVER`, `GOCLAW_GATEWAY_URL`) | theo cấu hình, sau đó là `http://127.0.0.1:18790` | Địa chỉ gateway. |
| `DEWEE_API_KEY` | chưa đặt | API key. Thứ tự ưu tiên: `--token`, rồi `DEWEE_API_KEY`, rồi `GOCLAW_GATEWAY_TOKEN`, cuối cùng là file cấu hình. **Bí mật.** |
| `DEWEE_TENANT_ID` (tên cũ `GOCLAW_TENANT_ID`) | workspace master | Workspace cần thao tác. |
| `GOCLAW_GATEWAY_USER_ID` | chưa đặt | Người dùng để đóng vai; cờ `--user-id` được ưu tiên hơn. |
| `DEWEE_HOME` | `~/.dewee` | Thư mục cài đặt, dùng để tìm `dewee.env`. |
| `DEWEE_SELFHOST_APP_URL`, `DEWEE_SELFHOST_PUBLIC_URL` | `http://localhost:4321` | Địa chỉ bảng điều khiển mà CLI gọi, và gốc của các đường dẫn thiết lập mà nó in ra. |
| `DEWEE_MCP_TOKEN` | chưa đặt | Token đặt vào cấu hình MCP client được tạo ra. **Bí mật.** |
| `DEWEE_NO_INTERACTIVE` | chưa đặt | Giá trị bất kỳ khiến các câu hỏi tương tác báo lỗi thay vì chờ, tiện cho script. |
