---
title: Cài đặt và chạy gateway
description: Chạy runtime dewee bằng Docker hoặc từ mã nguồn, đặt các biến môi trường cần thiết, chọn edition, và giữ hệ thống ổn định với nâng cấp, sao lưu và khôi phục.
section: runtime
order: 1
updated: 2026-11-08
---

Runtime là phần làm việc thật sự của dewee: agent, tool, channel, lịch chạy và workflow đều chạy bên trong một tiến trình gateway duy nhất. Tại Việt Nam, dewee được cung cấp dưới hình thức Tự cài đặt và On-Premises; với On-Premises, bạn vận hành gateway này trên hạ tầng của mình. Nếu bạn tự cài đặt, hãy làm theo [Tự cài đặt dewee](/docs/get-started/self-install). Trang này dành cho người vận hành: cài đặt, trỏ tới cơ sở dữ liệu và giữ cho nó chạy ổn định.

## Bạn sẽ chạy những gì

- **Gateway**, một file Go binary duy nhất tên `dewee`. Chạy `dewee` không kèm subcommand sẽ khởi động gateway. Mặc định nó lắng nghe ở cổng `18790`, phục vụ HTTP API và WebSocket tại `/ws`.
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

Image được phát hành tại `ghcr.io/nextlevelbuilder/dewee`. Tag `latest` có sẵn Python, `latest-base` là image tối giản, `latest-full` cài sẵn mọi runtime và phụ thuộc của skill, còn `latest-otel` có thêm xuất dữ liệu OpenTelemetry. Các phần bổ sung được bật bằng biến, ví dụ `make up WITH_OTEL=1`: `WITH_BROWSER`, `WITH_OTEL`, `WITH_SANDBOX`, `WITH_TAILSCALE`, `WITH_REDIS` và `WITH_CLAUDE_CLI`.

## Chạy từ mã nguồn

Bạn cần Go 1.26 trở lên và một PostgreSQL 18 có pgvector truy cập được.

```bash
make build
./dewee onboard
source .env.local && ./dewee
```

`dewee onboard` hỏi chuỗi kết nối và kiểm tra nó, sinh gateway token và khoá mã hoá, chạy migration rồi ghi các giá trị đó vào `.env.local`. File `config.json` mà lệnh lưu lại không chứa secret nào.

Sau khi gateway chạy, `./dewee setup` dẫn bạn qua các bước chọn provider, model, agent và channel.

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
| `GOCLAW_REQUIRE_AUTH` | `1` buộc gateway yêu cầu xác thực kể cả trên địa chỉ loopback. Hãy đặt biến này khi gateway nằm sau reverse proxy trên cùng máy; xem [bên dưới](#sau-reverse-proxy-trên-cùng-máy). |

API key của model provider thường được thêm trong dashboard hoặc console, nơi chúng được lưu ở dạng mã hoá. Gateway cũng đọc `GOCLAW_ANTHROPIC_API_KEY`, `GOCLAW_OPENAI_API_KEY` và `GOCLAW_OPENROUTER_API_KEY` khi khởi động.

> [!WARNING]
> Nếu thiếu `GOCLAW_ENCRYPTION_KEY`, gateway chỉ ghi một cảnh báo vào log và lưu API key của provider cùng các secret khác ở dạng không mã hoá. Hãy đặt khoá trước lần chạy đầu tiên và cất nó cùng bản sao lưu: thiếu khoá này, các secret đã mã hoá trong bản sao lưu sẽ không khôi phục được.

## Mạng và xác thực

Gateway từ chối khởi động trên một địa chỉ không phải loopback nếu không có gateway token. Chỉ khi phát triển trên máy cá nhân bạn mới nên bỏ qua kiểm tra này bằng `GOCLAW_ALLOW_INSECURE_NO_AUTH=1`. Trên địa chỉ loopback như `127.0.0.1`, gateway không có token vẫn để mở, để phục vụ việc phát triển trên máy cá nhân. Khi gateway có thể được truy cập từ máy khác, hãy đặt nó sau TLS terminator hoặc reverse proxy của bạn.

### Sau reverse proxy trên cùng máy

Khi một reverse proxy trên cùng máy công bố gateway ra ngoài, chẳng hạn Nginx, Caddy hay bộ định tuyến của một nền tảng hosting, request tới gateway đều đi từ chính máy đó. Hãy đặt `GOCLAW_REQUIRE_AUTH=1` để gateway vẫn đòi credential ở mọi bên gọi:

- Gateway luôn yêu cầu xác thực, kể cả khi lắng nghe trên `127.0.0.1`.
- Gateway từ chối khởi động nếu `GOCLAW_GATEWAY_TOKEN` chưa được đặt hoặc ngắn hơn 32 ký tự. Token sinh bằng `openssl rand -hex 32`, `./prepare-env.sh` hay `dewee onboard` đều đạt yêu cầu. Token phải đến từ biến môi trường hoặc file cấu hình, không chỉ từ cơ sở dữ liệu.
- Đặt biến này cùng với `GOCLAW_ALLOW_INSECURE_NO_AUTH` sẽ bị từ chối khi khởi động.
- Các thay đổi cấu hình từ dashboard hoặc qua `config.apply` và `config.patch` không thể xoá hay làm ngắn gateway token.
- Webhook chỉ dành cho bên gọi cục bộ với `localhost_only` sẽ từ chối mọi bên gọi; xem [Webhook sau reverse proxy](/docs/api/webhooks-and-mcp#webhook-sau-reverse-proxy).
- Ghép nối trình duyệt vẫn hoạt động: một yêu cầu ghép nối chỉ có quyền truy cập sau khi người vận hành, đã xác thực bằng gateway token hoặc một API key admin, phê duyệt nó.

Mọi giá trị khác rỗng, `0`, `false`, `no` hoặc `off` đều bật chế độ này. Không đặt biến này thì việc phát triển trên máy cá nhân vẫn như trước. `docker-compose.selfhosted.yml` chuyển `GOCLAW_REQUIRE_AUTH` vào gateway; hãy đặt nó là `1` khi có proxy công bố runtime ra ngoài.

Đặt `GOCLAW_PUBLIC_URL` là địa chỉ công khai của gateway (ví dụ `https://dewee.example.com`). Gateway đưa địa chỉ này cho các dịch vụ bên ngoài, chẳng hạn URL callback và webhook của kênh hay link tải file. Khi đã đặt, không request nào thay đổi được nó. Nếu không đặt, gateway chỉ học địa chỉ từ request của system owner hoặc admin của master tenant. Các workspace khác không bao giờ thay đổi được nó.

Gateway chỉ đọc `X-Forwarded-Host` và `X-Forwarded-Proto` từ các proxy có trong `GOCLAW_TRUSTED_PROXIES`, một danh sách địa chỉ IP, dải CIDR hoặc tên máy cách nhau bằng dấu phẩy (ví dụ `127.0.0.1,::1` khi nginx chạy cùng máy, hoặc tên service Docker Compose của container proxy). Với mọi client khác, các header này bị bỏ qua. Trình cài đặt self-hosted và các file Compose đã tự đặt giá trị này cho proxy đi kèm; ở nơi khác danh sách mặc định rỗng. Một mục không hợp lệ sẽ khiến gateway không khởi động.

Truy cập MCP công khai vào gateway (`GOCLAW_MCP_PUBLIC_ENABLED`) mặc định tắt. Đọc [Webhook và MCP](/docs/api/webhooks-and-mcp) trước khi bật; giới hạn theo workspace của nó, `GOCLAW_MCP_PUBLIC_TENANT_REQUESTS_PER_MINUTE` và `GOCLAW_MCP_PUBLIC_TENANT_MAX_CONCURRENT_TOOL_CALLS`, được giải thích ở mục [Giới hạn, hạn mức và thu hồi key](/docs/api/webhooks-and-mcp#giới-hạn-hạn-mức-và-thu-hồi-key).

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

`dewee upgrade` đưa schema cơ sở dữ liệu lên bản mới nhất và chạy các migration dữ liệu. Lệnh an toàn khi chạy nhiều lần, và image Docker tự chạy nó mỗi lần khởi động. Kiểm tra trước bằng `dewee upgrade --status` hoặc `dewee upgrade --dry-run`. Lệnh cấp thấp hơn `dewee migrate` (`up`, `down`, `version`, `force`, `goto`) dành cho việc khắc phục sự cố. Một binary sẽ từ chối khởi động khi schema cơ sở dữ liệu mới hơn phiên bản nó hỗ trợ, trên PostgreSQL cũng như bản Lite (SQLite), và thông báo lỗi nêu rõ cả hai phiên bản. Để quay về bản cũ trên PostgreSQL, chạy `dewee migrate down` bằng binary mới trước; bản Lite không có migration down, nên hãy khôi phục bản sao lưu tạo trước khi nâng cấp.

Với customer control plane tự vận hành, hãy nâng cấp gateway trước khi bật đồng bộ thành viên workspace có phiên bản trong ứng dụng khách hàng. Khi rollback, giữ lại phiên bản đồng bộ và lịch sử gỡ quyền; không dùng thành phần ghi cũ bỏ qua các thông tin này. Việc gỡ quyền vẫn đang chờ cho đến khi runtime xác nhận.

### Metadata phát hành có chữ ký

Danh mục phát hành được lưu trữ xác minh metadata có chữ ký theo các khóa công khai đang được tin cậy. Bản không ký hoặc không đáng tin cậy không được đề xuất để cập nhật; gỡ một khóa ký sẽ rút các mục danh mục không còn xác minh được. Khi xoay vòng khóa, triển khai sự tin cậy cho khóa công khai mới trước khi ngừng dùng khóa cũ; giữ khóa ký riêng trong kho secret phát hành và làm theo quy trình ký của người vận hành bản triển khai. Thông báo bản mới cho Self-install không cấp quyền điều khiển từ xa bản cài đặt. Các chức năng lập kế hoạch, áp dụng và khôi phục có cổng triển khai riêng; đừng coi chúng đã khả dụng khi người vận hành chưa xác nhận.

## Sao lưu và khôi phục

Hãy sao lưu database trước khi nâng cấp. Nâng cấp SQLite giữ đúng thời điểm hết hạn API key và thời gian gia hạn secret cũ trên máy không dùng UTC, sửa việc dọn tin nhắn chờ cũ và chuẩn hóa timestamp workflow trong lịch sử để lọc và sắp xếp đáng tin cậy. So sánh cursor của session task dùng mili giây UTC đã lưu. Điều này không bật workflow engine của Lite hay thay đổi cấu trúc phản hồi. Để quay lại SQLite sau chuẩn hóa, hãy khôi phục bản sao lưu database trước nâng cấp bằng binary tương thích; không đảo ngược bước chuẩn hóa.

```bash
./dewee backup -o dewee-backup.tar.gz
./dewee restore dewee-backup.tar.gz --dry-run
./dewee restore smoke dewee-backup.tar.gz --target-dsn "<scratch-database-dsn>" --verify-secrets
```

`dewee backup` lưu cơ sở dữ liệu và file dữ liệu vào một archive, và `--upload-s3` đẩy nó lên S3. `dewee restore` không thay đổi gì cho tới khi bạn thêm `--force`. `restore smoke` khôi phục vào một cơ sở dữ liệu thử, từ chối chạy trên cơ sở dữ liệu đang hoạt động, và với `--verify-secrets` sẽ kiểm tra khoá mã hoá của bạn còn giải mã được các secret đã lưu. Để làm việc với từng tenant, dùng `dewee tenant-backup` và `dewee tenant-restore`. Mọi lệnh bảo trì có trong [Tham chiếu CLI](/docs/runtime/cli).

Trước khi khôi phục bản sao lưu tenant có tài nguyên riêng tư, hãy xem [giới hạn khôi phục và cảnh báo phục hồi](/docs/concepts/multi-tenancy); tài nguyên riêng tư được lưu vẫn bị cách ly sau khi khôi phục.
