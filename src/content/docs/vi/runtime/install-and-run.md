---
title: Cài đặt và chạy gateway
description: Chạy runtime dewee bằng Docker hoặc từ mã nguồn, đặt các biến môi trường cần thiết, chọn edition, và giữ hệ thống ổn định với nâng cấp, sao lưu và khôi phục.
section: runtime
order: 1
updated: 2026-09-25
---

Runtime là phần làm việc thật sự của dewee: agent, tool, channel, lịch chạy và workflow đều chạy bên trong một tiến trình gateway duy nhất. Với On-Premises, hình thức được cung cấp tại Việt Nam, bạn vận hành gateway này trên hạ tầng của mình. Trang này dành cho người vận hành: cài đặt, trỏ tới cơ sở dữ liệu và giữ cho nó chạy ổn định.

## Bạn sẽ chạy những gì

- **Gateway**, một file Go binary duy nhất tên `dewee`. Chạy `dewee` không kèm subcommand sẽ khởi động gateway. Mặc định nó lắng nghe ở cổng `18790`, phục vụ HTTP API, WebSocket tại `/ws` và, với bản build có kèm giao diện, web dashboard tại `/`.
- **PostgreSQL 18 có pgvector.** Bản build chuẩn sẽ không khởi động nếu thiếu `GOCLAW_POSTGRES_DSN`. Migration đầu tiên bật hai extension `pgcrypto` và `vector`.
- **Hai secret tạo một lần**: gateway token, mà client gửi kèm dưới dạng bearer token, và khoá mã hoá cho các secret được lưu trữ.

Các biến môi trường vẫn giữ tiền tố gốc `GOCLAW_` của runtime. Điều này là bình thường; hãy dùng đúng tên như trong trang này.

## Chạy bằng Docker

Đây là cách chúng tôi khuyến nghị để chạy gateway.

```bash
./prepare-env.sh
make up
curl http://localhost:18790/health
```

`prepare-env.sh` tạo file `.env` từ `.env.example` với quyền chỉ chủ sở hữu được đọc, và sinh `GOCLAW_GATEWAY_TOKEN` cùng `GOCLAW_ENCRYPTION_KEY` nếu còn thiếu. Script không bao giờ ghi đè giá trị bạn đã đặt. `make up` tải image đã phát hành, chạy nó cạnh một container PostgreSQL có pgvector, rồi nâng cấp schema.

| Lệnh | Tác dụng |
|---|---|
| `make up` | Tải image mới nhất đã phát hành và khởi động, rồi nâng cấp schema |
| `make up-build` | Build image từ mã nguồn trên máy thay vì tải về |
| `make down` | Dừng container, giữ nguyên volume dữ liệu |
| `make logs` | Theo dõi log của gateway |
| `make migrate` | Chạy các database migration còn chờ |
| `make reset` | Dừng mọi thứ và **xoá luôn volume dữ liệu** |

Image được phát hành tại `ghcr.io/nextlevelbuilder/dewee`. Tag `latest` có sẵn web dashboard và Python, `latest-base` chỉ có API, `latest-full` cài sẵn mọi runtime và phụ thuộc của skill, còn `latest-otel` có thêm xuất dữ liệu OpenTelemetry. Các phần bổ sung được bật bằng biến, ví dụ `make up WITH_OTEL=1`: `WITH_BROWSER`, `WITH_OTEL`, `WITH_SANDBOX`, `WITH_TAILSCALE`, `WITH_REDIS` và `WITH_CLAUDE_CLI`. `WITH_WEB_NGINX=1` phục vụ dashboard qua một nginx riêng ở cổng 3000 khi bạn cần TLS hoặc reverse proxy của riêng mình.

## Chạy từ mã nguồn

Bạn cần Go 1.26 trở lên và một PostgreSQL 18 có pgvector truy cập được.

```bash
make build
./dewee onboard
source .env.local && ./dewee
```

`dewee onboard` hỏi chuỗi kết nối và kiểm tra nó, sinh gateway token và khoá mã hoá, chạy migration rồi ghi các giá trị đó vào `.env.local`. File `config.json` mà lệnh lưu lại không chứa secret nào. `make build` tạo binary chỉ có API; `make build-full` build web dashboard trước rồi nhúng vào, đây là bản bạn nên dùng cho production.

Sau khi gateway chạy, `./dewee setup` dẫn bạn qua các bước chọn provider, model, agent và channel, hoặc bạn dùng dashboard tại `http://localhost:18790`.

## Cấu hình

Thiết lập đến từ một file cấu hình JSON và từ biến môi trường; biến môi trường được ưu tiên. File được chọn theo thứ tự `--config`, rồi `GOCLAW_CONFIG`, rồi `config.json` trong thư mục đang chạy. Hãy để secret trong biến môi trường, không để trong file.

| Biến | Mục đích |
|---|---|
| `GOCLAW_POSTGRES_DSN` | Chuỗi kết nối PostgreSQL. Bắt buộc. |
| `GOCLAW_GATEWAY_TOKEN` | Bearer token mà client dùng để gọi gateway. |
| `GOCLAW_ENCRYPTION_KEY` | Khoá 32 byte (hex hoặc base64) để mã hoá secret được lưu bằng AES-256-GCM. |
| `GOCLAW_HOST`, `GOCLAW_PORT` | Địa chỉ và cổng lắng nghe. Mặc định: `0.0.0.0` và `18790`. |
| `GOCLAW_DATA_DIR`, `GOCLAW_WORKSPACE` | Nơi gateway giữ dữ liệu và file làm việc của agent. |
| `GOCLAW_LOG_LEVEL`, `GOCLAW_LOG_FILE` | `debug`, `info`, `warn` hoặc `error`, và file log tuỳ chọn. |
| `GOCLAW_EDITION` | `standard` hoặc `lite`. Xem bên dưới. |

API key của model provider thường được thêm trong dashboard hoặc console, nơi chúng được lưu ở dạng mã hoá. Gateway cũng đọc `GOCLAW_ANTHROPIC_API_KEY`, `GOCLAW_OPENAI_API_KEY` và `GOCLAW_OPENROUTER_API_KEY` khi khởi động.

> [!WARNING]
> Nếu thiếu `GOCLAW_ENCRYPTION_KEY`, gateway chỉ ghi một cảnh báo vào log và lưu API key của provider cùng các secret khác ở dạng không mã hoá. Hãy đặt khoá trước lần chạy đầu tiên và cất nó cùng bản sao lưu: thiếu khoá này, các secret đã mã hoá trong bản sao lưu sẽ không khôi phục được.

## Mạng và xác thực

Gateway từ chối khởi động trên một địa chỉ không phải loopback nếu không có gateway token. Chỉ khi phát triển trên máy cá nhân bạn mới nên bỏ qua kiểm tra này bằng `GOCLAW_ALLOW_INSECURE_NO_AUTH=1`. Khi gateway có thể được truy cập từ máy khác, hãy đặt nó sau TLS terminator hoặc reverse proxy của bạn.

Truy cập MCP công khai vào gateway (`GOCLAW_MCP_PUBLIC_ENABLED`) mặc định tắt. Đọc [Webhook và MCP](/docs/api/webhooks-and-mcp) trước khi bật.

## Edition

Bản build mặc định chạy edition **Standard** với mọi tính năng. Edition **Lite** dành cho các cài đặt nhỏ trên một máy. Gateway tự chọn Lite khi chạy trên SQLite, một tuỳ chọn build riêng, và bạn có thể ép một trong hai bằng `GOCLAW_EDITION`.

| | Standard | Lite |
|---|---|---|
| Agent | Không giới hạn theo edition | 5 |
| Nhóm agent | Không giới hạn theo edition | 1 nhóm, 5 thành viên |
| Channel Telegram và Discord | Không giới hạn theo edition | Mỗi loại 1 |
| Subagent | Không giới hạn theo edition | 2 cùng lúc, sâu một cấp |
| Workflow, RBAC, knowledge graph | Có | Không |
| Tìm kiếm | Full-text và vector | Chỉ full-text |
| Cài package pip, npm hoặc apk | Có | Không |

## Kiểm tra sức khoẻ

- `/health` trả về `{"status":"ok","protocol":3}` khi tiến trình đang chạy.
- `/livez` là liveness probe và `/readyz` là readiness probe. `/readyz` báo chưa sẵn sàng trong lúc gateway chờ [kích hoạt license](/docs/runtime/licence).

Chạy `./dewee doctor` trên máy chủ để in ra phiên bản, đường dẫn file cấu hình và việc cơ sở dữ liệu có kết nối được hay không.

## Nâng cấp

`dewee upgrade` đưa schema cơ sở dữ liệu lên bản mới nhất và chạy các migration dữ liệu. Lệnh an toàn khi chạy nhiều lần, và image Docker tự chạy nó mỗi lần khởi động. Kiểm tra trước bằng `dewee upgrade --status` hoặc `dewee upgrade --dry-run`. Lệnh cấp thấp hơn `dewee migrate` (`up`, `down`, `version`, `force`, `goto`) dành cho việc khắc phục sự cố.

## Sao lưu và khôi phục

```bash
./dewee backup -o dewee-backup.tar.gz
./dewee restore dewee-backup.tar.gz --dry-run
./dewee restore smoke dewee-backup.tar.gz --target-dsn "<scratch-database-dsn>" --verify-secrets
```

`dewee backup` lưu cơ sở dữ liệu và file dữ liệu vào một archive, và `--upload-s3` đẩy nó lên S3. `dewee restore` không thay đổi gì cho tới khi bạn thêm `--force`. `restore smoke` khôi phục vào một cơ sở dữ liệu thử, từ chối chạy trên cơ sở dữ liệu đang hoạt động, và với `--verify-secrets` sẽ kiểm tra khoá mã hoá của bạn còn giải mã được các secret đã lưu. Để làm việc với từng tenant, dùng `dewee tenant-backup` và `dewee tenant-restore`. Mọi lệnh bảo trì có trong [Tham chiếu CLI](/docs/runtime/cli).
