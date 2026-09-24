---
title: Tool và quyền hạn
description: Cách dewee quyết định agent được gọi tool nào, cách lệnh shell được lọc và phê duyệt, và những mặc định còn thoáng bạn nên siết lại trước khi đưa vào vận hành.
section: concepts
order: 4
updated: 2026-09-25
---

Tool là cách agent hành động. Trước mỗi lần gọi model, dewee lọc danh sách tool qua một chuỗi chính sách, và mỗi lệnh shell còn phải qua thêm các bước kiểm tra khi chạy. Giá trị mặc định khá thoáng; phần cuối trang liệt kê những gì nên siết lại.

## Nhóm tool và profile

Tool tích hợp được chia thành các nhóm, và bạn có thể gọi tên nhóm dạng `group:<name>` trong danh sách cho phép và danh sách chặn.

| Nhóm | Tool |
|---|---|
| `fs` | `read_file`, `write_file`, `list_files`, `search_files`, `edit`, `multi_edit`, `apply_patch`, `diff_preview`, `checkpoint`, `rollback` |
| `runtime` | `exec`, `wait` |
| `web` | `web_search`, `web_fetch` |
| `memory` | `memory_search`, `memory_get` |
| `sessions` | `sessions_list`, `sessions_history`, `sessions_send`, `spawn`, `session_status`, `session_tasks`, `native_job`, `native_task` |
| `ui` | `browser`, `AskUserQuestion` |
| `automation` | `cron` |
| `messaging` | `message`, `human_handoff`, `create_forum_topic`, `list_group_members` |
| `team` | `team_tasks` |
| `vault` | `vault_search`, `vault_read` |
| `dewee` | Mọi tool gốc, kể cả tool media, skill và giao việc |

Profile là một bộ cho phép dựng sẵn:

| Profile | Cho phép |
|---|---|
| `full` | Tất cả. Đây là mặc định. |
| `coding` | `fs`, `runtime`, `sessions`, `memory`, `web` và `vault`, cùng `read_image`, `create_image` và `skill_search`. |
| `messaging` | `messaging`, `web` và `vault`, `wait`, các tool session cơ bản, `read_image` và `skill_search`. |
| `minimal` | Chỉ `session_status`. |

## Chuỗi chính sách

Danh sách tool mà model nhìn thấy được dựng theo thứ tự sau:

1. Bắt đầu từ profile toàn cục (`tools.profile`), rồi tới profile theo provider nếu có.
2. Thu hẹp bằng danh sách cho phép toàn cục, theo provider, của agent, và của agent theo provider.
3. Thu hẹp bằng danh sách cho phép theo từng request mà kênh gửi kèm, nếu có. Ví dụ, một forum topic trên Telegram có thể giới hạn tool cho riêng topic đó.
4. Loại bỏ mọi thứ nằm trong danh sách chặn, toàn cục trước rồi tới của agent.
5. Thêm lại những gì có trong `alsoAllow`; danh sách này chỉ thêm, không bớt.
6. Với sub-agent, loại bỏ các tool mà sub-agent không được dùng, như `exec`, `cron` và tìm kiếm bộ nhớ. Ở độ sâu spawn tối đa, `spawn` và các tool xem lịch sử session cũng bị loại.

MCP server được đăng ký thành các nhóm `mcp` và `mcp:<server>`.

## Lệnh shell

`exec` chạy với thời gian chờ mặc định 60 giây, có thể chỉnh trong khoảng 1 đến 3.600 giây.

### Nhóm chặn

Mọi lệnh đều được đối chiếu với 16 nhóm chặn, tất cả đều bật sẵn: `destructive_ops`, `data_exfiltration`, `reverse_shell`, `code_injection`, `privilege_escalation`, `dangerous_paths`, `env_injection`, `container_escape`, `crypto_mining`, `filter_bypass`, `network_recon`, `package_install`, `package_remove`, `persistence`, `process_control` và `env_dump`. Bạn tắt một nhóm ở cấp toàn cục trong `tools.shellDenyGroups`, hoặc theo từng agent trong `other_config.shell_deny_groups`; với mỗi nhóm, giá trị của agent được ưu tiên. Thay đổi có hiệu lực từ lượt chạy kế tiếp.

Lệnh khớp với `package_install` không bị từ chối ngay mà trở thành một yêu cầu phê duyệt.

### Phê duyệt lệnh

| Thiết lập | Giá trị | Mặc định |
|---|---|---|
| `tools.execApproval.security` | `deny` (không cho chạy lệnh nào), `allowlist` (chỉ lệnh khớp danh sách), `full` (mọi lệnh vượt qua các nhóm chặn) | `full` |
| `tools.execApproval.ask` | `off`, `on-miss` (hỏi khi lệnh không có trong allowlist), `always` | `off` |

Mỗi yêu cầu phê duyệt là một bản ghi bền vững, gắn với tenant, chỉ chứa bản tóm tắt đã che thông tin nhạy cảm và mã hash của lệnh, không bao giờ lưu lệnh gốc hay output. Sau khi được duyệt, agent chạy lại đúng lệnh đó kèm một `approval_token` chỉ dùng được một lần. Yêu cầu được xem xét trên trang phê duyệt trên web hoặc qua CLI; nút bấm trong kênh chat không thể phê duyệt lệnh.

```bash
dewee packages approvals list --all
dewee packages approvals approve <approval-id>
dewee packages approvals deny <approval-id> --reason "not needed"
```

Khi bật `tools.execApproval.scopedPackageGrantsEnabled` (mặc định tắt), quyết định "luôn cho phép" chỉ tạo một quyền cài package trong 30 phút, gắn với đúng session, workspace, lệnh và lockfile đó.

## Custom tool, secret và thông tin xác thực CLI

- **Custom tool** là các lệnh shell bạn định nghĩa qua API, với tham số khai báo bằng JSON Schema được điền vào các chỗ giữ chỗ `{{.param}}`, thời gian chờ (mặc định 60 giây) và biến môi trường tuỳ chọn. Tham số được escape cho shell và các nhóm chặn vẫn áp dụng. Custom tool dùng chung toàn cục hoặc thuộc về một agent.
- **Secret** của tool tích hợp, như API key của dịch vụ tìm kiếm, nằm trong kho lưu trữ theo tenant, được mã hoá AES-256-GCM khi `GOCLAW_ENCRYPTION_KEY` được đặt.
- **Che thông tin nhạy cảm.** Output của tool được quét tìm các mẫu key, token và chuỗi kết nối, cùng giá trị thực của các secret mà runtime đang giữ. Phần khớp được thay bằng `[REDACTED]` trước khi model hoặc người dùng nhìn thấy.
- **CLI có thông tin xác thực.** Các preset cho `gh`, `gcloud`, `gws`, `aws`, `kubectl` và `terraform` cho phép agent chạy những công cụ này bằng thông tin xác thực đã lưu mà agent không bao giờ nhìn thấy. Lệnh chạy không qua shell, và các biến bắt đầu bằng `GOCLAW_` hoặc `DEWEE_`, hay kết thúc bằng `_TOKEN`, `_SECRET`, `_KEY` hoặc `_PASSWORD` bị gỡ bỏ trước khi chạy.

## MCP server

dewee kết nối tới MCP server qua `stdio`, `sse` hoặc `streamable-http`, kiểm tra tình trạng mỗi 30 giây, và kết nối lại với thời gian chờ tăng dần từ 2 đến 60 giây, tối đa 10 lần. Quyền truy cập được cấp theo agent và theo người dùng, mỗi lần cấp có danh sách `tool_allow` và `tool_deny` riêng; danh sách chặn luôn thắng. Người dùng cũng có thể gửi yêu cầu truy cập để quản trị viên duyệt.

Khi agent có hơn 40 tool MCP, các tool này không còn được liệt kê từng cái. Thay vào đó, agent tìm chúng bằng `mcp_tool_search`. OAuth 2.1 với PKCE cho server từ xa đang ở giai đoạn beta.

## Sandbox

Lệnh có thể chạy trong một container Docker thay vì trực tiếp trên máy chủ. Sandbox mặc định tắt.

| Thiết lập | Giá trị hoặc giới hạn |
|---|---|
| Chế độ | `off` (mặc định), `non-main` (mọi agent trừ agent mặc định), `all` |
| Phạm vi | `session` (mặc định), `agent`, `shared` |
| Container | Root chỉ đọc, bỏ toàn bộ capability, không có mạng |
| Giới hạn | 512 MB bộ nhớ, 1 CPU, 256 tiến trình, 1 MB output, 300 giây |

Khi sandbox đang bật mà không có Docker, `exec` báo lỗi chứ không quay về chạy trên máy chủ.

## Các mặc định cần xem lại

dewee đóng theo mặc định ở lớp biên, nhưng năng lực của agent ban đầu khá mở:

| Thiết lập | Mặc định | Lựa chọn chặt hơn |
|---|---|---|
| Profile tool | `full` | `coding`, `messaging` hoặc `minimal`, kèm danh sách chặn |
| Phê duyệt lệnh | `security: full`, `ask: off` | `allowlist` với `on-miss` |
| Sandbox | `off` | `non-main` hoặc `all` |
| `web_fetch` | `allow_all` (địa chỉ nội bộ luôn bị chặn) | `allowlist` với `allowed_domains` |
| Tool trình duyệt | Bật | Tắt |
| Giới hạn tần suất tool | 150 lần gọi mỗi giờ | Đặt `rate_limit_per_hour` thấp hơn |

> [!WARNING]
> Với cấu hình mặc định, agent có thể chạy bất kỳ lệnh nào vượt qua các nhóm chặn, ngay trên máy chủ, mà không cần hỏi. Hãy siết profile, phê duyệt lệnh hoặc sandbox trước khi cho người dùng không tin cậy tiếp cận agent.

## Liên quan

- [Tool, MCP và hook](/docs/console/tools-mcp-and-hooks): quản lý tool, MCP server và hook trong console.
- [Mô hình bảo mật](/docs/security/overview): các lớp kiểm soát ở biên và các lớp phòng vệ.
- [Secret, vai trò và nhật ký kiểm toán](/docs/security/secrets-roles-and-audit): cách secret được lưu và ai được đổi chính sách.
- [Hook](/docs/concepts/hooks): chặn hoặc sửa một lệnh gọi tool trước khi nó chạy.
- [Webhook và MCP](/docs/api/webhooks-and-mcp): đưa chính dewee ra làm MCP server.
