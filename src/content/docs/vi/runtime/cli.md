---
title: Tham chiếu CLI
description: "Dòng lệnh dewee: global flag, cách CLI tìm gateway và key của bạn, định dạng đầu ra, và mọi nhóm lệnh cho agent, skill, workflow, bộ nhớ và quản trị."
section: runtime
order: 2
updated: 2026-11-08
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

Tạo API key ở trang **API key & tài liệu** trong console, hoặc bằng `dewee api-keys create`. Xem [Xác thực](/docs/api/authentication) để biết về phạm vi quyền.

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
| `dewee workspace-setup` | `next` thực hiện lượt tiếp theo của quy trình thiết lập workspace có hướng dẫn trong console; `--replace-key`, có thể kèm `--step <id>`, yêu cầu nhập key mới cho một provider đã lưu. Xem [Trang Tổng quan](/docs/console/overview#trang-tổng-quan) |
| `dewee doctor` | In phiên bản, đường dẫn cấu hình và trạng thái cơ sở dữ liệu |
| `dewee config` | `show` (đã che secret), `path`, `validate` |
| `dewee auth` | `status` và `logout` cho tài khoản ChatGPT kết nối qua gateway |

## Agent và hội thoại

| Lệnh | Subcommand |
|---|---|
| `dewee agent` | `list`, `get`, `status`, `add`, `update`, `delete`, `chat`; `files` để đọc và đặt các file ngữ cảnh của agent; `evolution` cho các đề xuất cải thiện; `access` cho quyền chia sẻ agent |
| `dewee sessions` | `list`, `get`, `history`, `status`, `send`, `rename`, `reset`, `delete` |
| `dewee contacts` | `list`, `get`, `merge`, `unmerge` |
| `dewee pairing` | `list`, `approve`, `revoke` cho người gửi từ ứng dụng chat đang chờ được cấp quyền |
| `dewee tasks` | `comments list` và `comments add` trên task của nhóm agent |

Lệnh `merge` và `unmerge` contact nhận tối đa 500 ID mỗi yêu cầu, tính cả ID trùng. Lựa chọn lớn hơn trả lỗi kiểm tra mà không thay đổi một phần contact; hãy chia thành nhiều yêu cầu và kiểm tra từng kết quả.

`dewee agent chat` mở một cuộc trò chuyện tương tác với agent có tên trong `--name` (mặc định `default`). Thêm `--message` để hỏi đáp một lần, và `--session` để tiếp tục một session.

Với `dewee agent chat`, ngữ cảnh người gọi được chọn theo thứ tự: `--user-id` tường minh, `GOCLAW_GATEWAY_USER_ID`, `GOCLAW_USER_ID` cũ, rồi `system`. Biến môi trường rỗng được coi là chưa đặt; cờ rỗng tường minh, giá trị chỉ có khoảng trắng hoặc chứa ký tự điều khiển ASCII bị từ chối trước khi kết nối. Khoảng trắng hai đầu được bỏ. Lệnh HTTP không dùng giá trị dự phòng cũ. Ngữ cảnh này không chứng minh danh tính hay quyền: gateway vẫn kiểm tra ràng buộc credential, vai trò, tenant và tư cách thành viên.

```bash
dewee agent chat --name support-bot --message "Summarise today's open tickets"
```

## Năng lực

| Lệnh | Subcommand |
|---|---|
| `dewee providers` | `list`, `add`, `update`, `delete`, `verify`; `access` cho quyền và chế độ mở/giới hạn |
| `dewee skills` | `list`, `show`, `upload`, `export`, `promote`, `metrics`, `activity`; cùng `access`, `grant`, `revoke`, `deps`, `evolve` và `suggestions` |
| `dewee mcp` | `list`, `get`, `tools`, `test`, `reload`, `connect-config` (`--auth oauth` cho client đăng nhập bằng Dewee thay vì dùng key); `access`, `grant`, `revoke`; `oauth` cho server đăng nhập bằng OAuth; `authorizations` (`list`, `revoke`) cho các ứng dụng đã kết nối tới endpoint MCP công khai bằng cách đăng nhập, xem [Webhook và MCP](/docs/api/webhooks-and-mcp#xem-và-thu-hồi-ứng-dụng-đã-kết-nối) |
| `dewee packages` | `list`, `get`, `runtimes`, `install`, `remove`, `verify`, `logs`; `approvals` để phê duyệt hoặc từ chối yêu cầu cài đặt; `access` cho quyền và chế độ mở/giới hạn |
| `dewee hooks` | Chỉ có `access`: hook chạy cho những agent nào và ai được sửa nó |
| `dewee channels` | `list`, `add`, `delete` |
| `dewee tts`, `dewee stt` | Provider giọng nói và `config` của chúng |

Mỗi nhóm `access` có `list`, `grant`, `set-level`, `revoke` và `activity`; riêng provider và package có thêm `mode get` và `mode set`. Các mức quyền, chế độ và những gì được kiểm tra được giải thích ở [Cấp quyền theo tài nguyên](/docs/security/access-grants).

### Writer của nhóm kênh

`dewee channels writers groups <instance-id>` liệt kê nhóm và số writer theo thứ tự. `list <instance-id> --group <scope>` liệt kê writer (nhóm trống trả `[]` với `-o json`), còn `test <instance-id> --group <scope> --user <id>` trả `allowed` và `reason`. Dùng `add <instance-id> --group <scope> --user <id>`, có thể thêm `--display-name`, `--username` hoặc `--dry-run`. Dùng `remove <instance-id> --group <scope> --user <id> --yes`, hoặc `--dry-run` để xem trước; lệnh xóa không hỏi lại và bắt buộc một trong hai cờ.

Mọi lệnh đều nhận `-o json`. Phạm vi nhóm là `group:<channel>:<chatId>`, hoặc `guild:<guildId>:*` trên Discord. Thêm và xóa yêu cầu quyền admin. Mã thoát là 2 khi dữ liệu không hợp lệ, 4 khi không đủ quyền, 5 khi không tìm thấy instance hoặc writer, và 6 khi xóa writer cuối cùng.

## Tự động hoá

| Lệnh | Subcommand |
|---|---|
| `dewee cron` | `list`, `get`, `create`, `update`, `toggle`, `run`, `runs`, `status`, `delete` |
| `dewee workflows` | `list`, `show`, `create`, `validate`, `apply`, `export`, `publish`, `rollback`, `enable`, `disable`, `trigger`, `delete`, `node-types`; `runs` để liệt kê, xem, theo dõi, huỷ hoặc chạy lại |
| `dewee heartbeat` | `get`, `set`, `toggle`, `test`, `logs`, `targets` |
| `dewee reflex` | `status`, `config` (`set`, `set-key`, `reset`), `settings`, `overrides` (`set`, `reset`), `decisions`, `test`, `eval`; xem [Lớp quyết định](/docs/concepts/decision-layer) |

Workflow có thể được giữ dưới dạng file và áp dụng từ CI:

```bash
dewee workflows validate -f workflow.json
dewee workflows apply -f workflow.json
```

Để tránh ghi đè chỉnh sửa đồng thời của bản nháp, dùng `--expected-version <updated_at>` như hướng dẫn trong [Workflow](/docs/concepts/workflows). CLI phiên bản cũ vẫn được hỗ trợ; riêng cập nhật có điều kiện cần gateway tương thích.

Để xem danh sách lịch theo trang, dùng `dewee cron list --limit 20 --json`; truyền `nextCursor` được trả về qua `--cursor` để xem tiếp, và giữ `--all` nếu đã dùng. Khi không có cờ phân trang, JSON vẫn là mảng đầy đủ. Nếu gateway cũ không cung cấp metadata phân trang, CLI báo lỗi tương thích thay vì thử lại bằng yêu cầu không giới hạn.

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

Người vận hành nền tảng có thể dùng `dewee tenant members list|add|remove` với gateway token và owner ID nền tảng đã cấu hình. Credential khác nhận `PERMISSION_DENIED` (mã thoát 4). `list` hỗ trợ `--role`, `--limit` (1–500), `--offset`, `-o json` và trả `{users, total, limit, offset}`. `add` thêm thành viên hoặc đổi vai trò (mặc định `member`), hỗ trợ `--dry-run`. `remove` cần `--yes` hoặc `--dry-run`; thành viên không tồn tại trả `NOT_FOUND` (mã 5). Tenant ngoài tenant nền tảng phải giữ ít nhất một owner: hãy thêm owner khác trước khi gỡ hoặc hạ vai trò owner cuối, nếu không lệnh trả `CONFLICT` (mã 6). Workspace khách hàng tự quản lý lời mời và vai trò trong ứng dụng; workspace MCP không cung cấp các lệnh vận hành này.

### Cấp quyền miễn phí cho người vận hành

Ở nơi tính năng được bật, super admin có thể cấp quyền cho danh sách email cụ thể bằng `dewee admin access-grants bulk-issue`. Trước tiên chạy `--dry-run`, xem kết quả từng người nhận, rồi chạy cùng yêu cầu không có `--dry-run` và xác nhận. Giữ cùng idempotency key sau khi hết thời gian chờ hoặc lỗi một phần: các lượt đã cấp được phát lại và các lượt còn lại có thể thử tiếp. Email nhận quà chỉ được gửi khi chọn `--notify`. Giới hạn là 100 người mỗi lô và 10 lượt commit lô mới mỗi người vận hành mỗi giờ; thử lại với cùng key không tính thêm lô.

ACP Operations MCP cung cấp `ops_access_grants_issue`, `ops_access_grants_bulk_issue`, `ops_access_grants_revoke` và `ops_access_grants_extend`. Các tool ghi cần scope `access_grants:admin` của super admin và các công tắc triển khai do người vận hành bật; kết nối chỉ đọc không thấy hoặc gọi được chúng. Với API hoặc MCP, hãy xem trước rồi commit bằng preview digest trả về; REST dùng `POST /api/access-grants/bulk`. Đây là thao tác ACP, tách biệt với MCP workspace và MCP nội dung website. Chạy `dewee admin access-grants bulk-issue --help` và xem [hướng dẫn vận hành](https://github.com/nextlevelbuilder/dewee/blob/dev/docs/runbooks/complimentary-access-grants.md) để biết cờ và cách khôi phục hiện tại.

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

Nếu `tenant-transfer` bị gián đoạn, hãy kiểm tra trạng thái trước khi thử lại: yêu cầu dùng cùng key báo lỗi đã phục hồi nếu lần chuyển dừng trước khi lấy được runtime lease. Xem [Chuyển giữa các tenant](/docs/concepts/multi-tenancy).
