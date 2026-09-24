---
title: Tham chiếu CLI
description: "Dòng lệnh dewee: global flag, cách CLI tìm gateway và key của bạn, định dạng đầu ra, và mọi nhóm lệnh cho agent, skill, workflow, bộ nhớ và quản trị."
section: runtime
order: 2
updated: 2026-09-25
---

Chính binary `dewee` dùng để chạy gateway cũng là client dòng lệnh của nó. Phần lớn lệnh nói chuyện với một gateway đang chạy qua HTTP hoặc WebSocket, trên máy hay từ xa, nên người vận hành có thể viết script cho gần như mọi việc làm được trong console. Một vài lệnh bảo trì làm việc trực tiếp với cơ sở dữ liệu và chỉ dùng trên máy chủ.

## Global flag

Các flag này dùng được với mọi lệnh, đặt trước hay sau subcommand đều được.

| Flag | Ý nghĩa |
|---|---|
| `--server` | URL của gateway cần gọi |
| `--token` | Bearer token cho gateway đó: gateway token hoặc một API key |
| `--tenant` | ID hoặc slug của tenant sẽ thao tác |
| `--user-id` | User ID ghi nhận cho mục đích truy vết. Mặc định: `system` |
| `--config` | File cấu hình cho các lệnh đọc cấu hình trên máy |
| `-v`, `--verbose` | Log ở mức debug |

Chạy `dewee` không kèm subcommand sẽ khởi động gateway; không có lệnh start riêng. `dewee version` in ra phiên bản và số hiệu protocol, và mỗi lệnh đều tự mô tả flag của mình trong phần help đi kèm.

## Gọi một gateway từ xa

Truyền server và key bằng flag, hoặc đặt một lần trong biến môi trường:

```bash
dewee --server https://dewee.example.com --token "<api-key>" agent list

export DEWEE_SERVER=https://dewee.example.com
export DEWEE_API_KEY=<api-key>
dewee agent list --json
```

CLI xác định từng giá trị theo thứ tự sau:

- **Server:** `--server`, rồi `DEWEE_SERVER`, rồi `GOCLAW_SERVER` hoặc `GOCLAW_GATEWAY_URL`, rồi host và cổng trong cấu hình trên máy. Giá trị cuối cùng là `http://127.0.0.1:18790`.
- **Key:** `--token`, rồi `DEWEE_API_KEY`, rồi `GOCLAW_GATEWAY_TOKEN`, rồi cấu hình trên máy.
- **Tenant:** `--tenant`, rồi `DEWEE_TENANT_ID`, rồi `GOCLAW_TENANT_ID`. Giá trị được gửi trong header `X-GoClaw-Tenant-Id`.

> [!NOTE]
> Để an toàn, CLI không gửi `DEWEE_API_KEY` trong biến môi trường tới một `--server` khác với `DEWEE_SERVER`. Hãy truyền `--token` rõ ràng khi bạn cố ý trỏ tới một gateway khác.

Tạo API key ở trang **API key** trong console, hoặc bằng `dewee api-keys create`. Xem [Xác thực](/docs/api/authentication) để biết về phạm vi quyền.

## Định dạng đầu ra

Không có flag đầu ra chung. Phần lớn lệnh đọc dữ liệu nhận `--json` để xuất dạng máy đọc được. `traces`, `usage`, `fleet` và `cli-credentials` dùng `-o table` hoặc `-o json`, còn `workflows`, `memory`, `vault`, `kg` và `files` nhận cả hai. Với `backup`, `tenant-backup` và `skills export`, `-o` là đường dẫn file đầu ra.

```bash
dewee usage summary --period 7d -o json
dewee mcp list --json
```

## Thiết lập và chẩn đoán

| Lệnh | Tác dụng |
|---|---|
| `dewee onboard` | Thiết lập lần đầu trên máy chủ: cơ sở dữ liệu, secret, migration, `.env.local` |
| `dewee setup` | Trình hướng dẫn cho provider, model, agent và channel. Cần gateway đang chạy |
| `dewee doctor` | In phiên bản, đường dẫn cấu hình và trạng thái cơ sở dữ liệu |
| `dewee config` | `show` (đã che secret), `path`, `validate` |
| `dewee auth` | `status` và `logout` cho tài khoản ChatGPT kết nối qua gateway |

## Agent và hội thoại

| Lệnh | Subcommand |
|---|---|
| `dewee agent` | `list`, `get`, `status`, `add`, `update`, `delete`, `chat`; `files` để đọc và đặt các file ngữ cảnh của agent; `evolution` cho các đề xuất cải thiện |
| `dewee sessions` | `list`, `get`, `history`, `status`, `send`, `rename`, `reset`, `delete` |
| `dewee contacts` | `list`, `get`, `merge`, `unmerge` |
| `dewee pairing` | `list`, `approve`, `revoke` cho người gửi từ ứng dụng chat đang chờ được cấp quyền |
| `dewee tasks` | `comments list` và `comments add` trên task của nhóm agent |

`dewee agent chat` mở một cuộc trò chuyện tương tác với agent có tên trong `--name` (mặc định `default`). Thêm `--message` để hỏi đáp một lần, và `--session` để tiếp tục một session.

```bash
dewee agent chat --name support-bot --message "Summarise today's open tickets"
```

## Năng lực

| Lệnh | Subcommand |
|---|---|
| `dewee providers` | `list`, `add`, `update`, `delete`, `verify` |
| `dewee skills` | `list`, `show`, `upload`, `export`, `promote`, `metrics`, `activity`; cùng `access`, `grant`, `revoke`, `deps`, `evolve` và `suggestions` |
| `dewee mcp` | `list`, `get`, `tools`, `test`, `reload`, `connect-config`; `access`, `grant`, `revoke`; `oauth` cho server đăng nhập bằng OAuth |
| `dewee packages` | `list`, `get`, `runtimes`, `install`, `remove`, `verify`, `logs`; `approvals` để duyệt hoặc từ chối yêu cầu cài đặt |
| `dewee channels` | `list`, `add`, `delete` |
| `dewee tts`, `dewee stt` | Provider giọng nói và `config` của chúng |

## Tự động hoá

| Lệnh | Subcommand |
|---|---|
| `dewee cron` | `list`, `get`, `create`, `update`, `toggle`, `run`, `runs`, `status`, `delete` |
| `dewee workflows` | `list`, `show`, `create`, `validate`, `apply`, `export`, `publish`, `rollback`, `enable`, `disable`, `trigger`, `delete`, `node-types`; `runs` để liệt kê, xem, theo dõi, huỷ hoặc chạy lại |
| `dewee heartbeat` | `get`, `set`, `toggle`, `test`, `logs`, `targets` |
| `dewee reflex` | `status`, `config`, `test`, `eval` |

Workflow có thể được giữ dưới dạng file và áp dụng từ CI:

```bash
dewee workflows validate -f workflow.json
dewee workflows apply -f workflow.json
```

## Bộ nhớ, tri thức và file

| Lệnh | Subcommand |
|---|---|
| `dewee memory` | `list`, `get`, `search`, `chunks`, `put`, `delete`, `index`, `index-all`. Cần `--agent` |
| `dewee vault` | `list`, `get`, `search`, `tree`, `links`, `graph`, `upload`, `rescan`, `link`, `enrichment` |
| `dewee kg` | Knowledge graph: `entities`, `entity`, `traverse`, `stats`, `extract`, `dedup`, `merge` |
| `dewee files` | `list`, `get`, `upload`, `delete`, `move`, `size` |

## Quan sát và quản trị

| Lệnh | Subcommand |
|---|---|
| `dewee traces` | `list`, `get`, `follow`, `timeline`, `export` |
| `dewee usage` | `summary`, `list`, `timeseries`, `events` |
| `dewee activity` | `list` |
| `dewee api-keys` | `list`, `create`, `revoke` |
| `dewee settings`, `dewee system-config` | `list`, `get`, `set` (và `reset` cho settings) |
| `dewee import-export` | `preview`, `import` |
| `dewee workstations` | `list`, `create`, `delete` |

## Bảo trì máy chủ

Phần lớn các lệnh này chạy trên máy chủ gateway và làm việc trực tiếp với cơ sở dữ liệu và thư mục dữ liệu. Riêng `tenant-transfer` đi qua gateway và cần key của owner hoặc admin.

| Lệnh | Tác dụng |
|---|---|
| `dewee upgrade` | Nâng cấp schema và dữ liệu. `--status` và `--dry-run` để kiểm tra trước |
| `dewee migrate` | `up`, `down`, `version`, `force`, `goto` để khắc phục sự cố |
| `dewee backup` | Sao lưu toàn bộ cơ sở dữ liệu và file |
| `dewee restore` | Khôi phục bản sao lưu. `--dry-run` để xem trước, `--force` để áp dụng, `smoke` để thử trên cơ sở dữ liệu tạm |
| `dewee tenant-backup`, `dewee tenant-restore` | Tương tự cho một tenant |
| `dewee tenant-transfer` | Xem trước, sao chép hoặc di chuyển tài nguyên giữa các tenant. Đang beta; chỉ với PostgreSQL |

Cách dùng an toàn được hướng dẫn trong [Cài đặt và chạy gateway](/docs/runtime/install-and-run#sao-lưu-và-khôi-phục).
