---
title: Cấp quyền theo tài nguyên
description: Chọn agent và người nào được dùng, sửa hay quản lý từng skill, MCP server, package, provider, hook và agent, và xem dewee kiểm tra, ghi nhận việc đó ở đâu.
section: security
order: 3
updated: 2026-10-14
---

Vai trò quyết định một người làm được gì trong cả workspace. Cấp quyền theo tài nguyên đi sâu hơn một bậc: với từng skill, MCP server, package, provider, hook hay agent, nó cho biết agent nào được dùng và người nào được sửa hoặc trao quyền tiếp cho người khác. Gateway lưu các quyền này trong tenant của bạn, kiểm tra chúng khi agent chạy, và ghi lại mọi thay đổi cũng như mọi lần từ chối.

Workspace không cấp quyền gì thì không có gì thay đổi. Provider và package vẫn mở cho mọi agent cho tới khi admin của workspace giới hạn chúng, còn skill và MCP server giữ nguyên quy tắc truy cập vốn có.

## Các mức quyền

Có bốn mức: `use`, `edit`, `manage` và `admin`, mức cao bao gồm mọi mức thấp hơn. Không phải tài nguyên nào cũng có đủ bốn mức:

| Tài nguyên | Agent có thể giữ | Người có thể giữ |
|---|---|---|
| Skill | `use`, `manage` | `use`, `edit`, `manage` |
| MCP server | `use` | `use`, `edit`, `manage` |
| Package | `use` | không có: package được cài cho cả instance |
| Provider | `use` | không có |
| Hook | `use`, nghĩa là hook chạy cho agent đó | `edit`, `manage` |
| Agent | không có | `use`, `edit`, `manage`, `admin` |

Mỗi mức mở ra điều gì tuỳ vào loại tài nguyên:

- **Skill.** Agent có `use` thấy skill và được nạp nó. Agent có `manage` còn được cập nhật hoặc xoá skill. Với người dùng, `use` cho phép dùng skill trong các cuộc chat của họ, `edit` hiện có tác dụng như `use`, còn `manage` cho phép cấp và thu hồi quyền tới đúng mức của chính họ và xem hoạt động của skill.
- **MCP server.** Agent có `use` được gọi tool của server; danh sách cho phép và chặn theo từng tool vẫn áp dụng. Với người dùng, `use` giữ nguyên ý nghĩa cũ: những người chat mà agent được gọi server thay cho họ. `edit` hiện có tác dụng như `use`, còn `manage` cho phép cấp quyền, thu hồi và xem hoạt động, giống như với skill.
- **Package và provider.** Khi tài nguyên đã bị giới hạn, agent có `use` mới được chạy lệnh của package hoặc chạy trên provider đó. Khi tài nguyên còn mở, quyền này không thay đổi gì.
- **Hook.** `edit` cho phép một người sửa hook chạy cho các agent cụ thể. `manage` cho phép thêm việc đổi danh sách agent mà hook chạy cho, bật hoặc tắt hook, xoá hook và quản lý quyền của nó. Muốn sửa hook hoặc đổi danh sách agent của nó thì còn cần quyền chia sẻ mức `edit` trên từng agent liên quan, vì hook thấy mọi sự kiện của agent đó và có thể chặn các lời gọi tool của nó. Hook chạy cho cả workspace vẫn chỉ admin của workspace mới đụng tới được.
- **Agent.** Đây chính là quyền chia sẻ agent được mô tả ở [Secret, vai trò và nhật ký kiểm toán](/docs/security/secrets-roles-and-audit#vai-trò-trong-runtime). `use` cho phép chat. `edit` cho phép đổi tên, mô tả, model và các thiết lập prompt của agent, và tạo lại agent. `manage` cho phép thêm việc nâng giới hạn chi phí và quản lý quyền chia sẻ. `admin` cho phép thêm việc xoá agent, trừ agent mặc định của workspace. Key, trạng thái, workspace, sandbox, chính sách tool và ngân sách của agent vẫn do admin của workspace nắm.

Owner, admin của workspace và chủ sở hữu agent giữ đúng những quyền họ đã có; quyền theo tài nguyên chỉ cộng thêm quyền cho người được cấp. Muốn dùng quyền chia sẻ mức `edit`, `manage` hay `admin` từ script, người đó cần một API key gắn với chính họ và có quyền ghi (operator trở lên).

## Ai được cấp quyền

Admin của workspace cấp được mọi mức mà tài nguyên cho phép. Người có `manage` trên một tài nguyên cũng cấp và thu hồi được, nhưng không bao giờ vượt quá mức của chính mình, và không sửa hay gỡ được quyền của người khác nếu quyền đó cao hơn mức của mình. Mỗi agent luôn giữ ít nhất một admin, và chủ sở hữu agent cũng được tính.

Skill dựng sẵn, provider dùng chung cho cả instance và hook toàn cục luôn mở cho mọi workspace, và một workspace không cấp quyền hay giới hạn chúng được.

## Mở và giới hạn

Provider và package có chế độ truy cập. **Mở** (open), chế độ mặc định, cho mọi agent của workspace dùng. **Giới hạn** (restricted) chỉ cho các agent có quyền `use`. Chỉ admin của workspace đổi được chế độ này.

Giới hạn một provider có thể làm các agent đang chạy trên nó ngừng hoạt động, nên dewee cho xem trước ảnh hưởng. Nó liệt kê các agent sẽ mất quyền truy cập: những agent dùng provider này làm provider chính, làm fallback đang bật, hoặc qua nhóm tài khoản ChatGPT OAuth, mà chưa được cấp quyền. Dashboard hỏi xác nhận kèm danh sách đó, rồi đề nghị cấp `use` cho tất cả trong một bước. Trên CLI, `--dry-run` in ra cùng danh sách mà không thay đổi gì. Package không có agent nào bị ảnh hưởng để liệt kê.

Skill vẫn dùng chế độ hiển thị riêng, xem ở [Skill](/docs/concepts/skills#quyền-truy-cập-và-cấp-quyền). MCP server vốn đã không dùng được với một agent cho tới khi được cấp quyền.

## Những gì được kiểm tra khi chạy

Mỗi lượt chạy được kiểm tra dưới danh nghĩa agent của nó, nên admin chat với một agent cũng không vượt qua được quyền của agent đó.

| Tài nguyên | Khi agent không có quyền |
|---|---|
| Skill | Skill không xuất hiện trong prompt, trong kết quả tìm skill hay dưới dạng lệnh slash. Nạp skill, hoặc đọc file của nó bằng `read_file`, trả về lỗi tool |
| MCP server | Tool của server trả về lỗi khi agent gọi |
| Package (giới hạn) | Chạy một lệnh của package qua `exec` trả về lỗi tool, kể cả khi lệnh được bọc trong `sh -c`, `env` hay `xargs` |
| Provider (giới hạn) | Lượt chạy thất bại với `provider_not_granted` và không bao giờ bị chuyển sang provider khác. Model fallback chưa được cấp quyền bị bỏ qua. Tạo agent trên provider này, hoặc chuyển agent sang nó, đều bị từ chối |

Thay đổi về quyền và chế độ có hiệu lực từ lượt chạy kế tiếp của agent; lượt chạy đang diễn ra giữ provider của nó tới khi kết thúc. Nếu không đọc được kho lưu quyền, việc kiểm tra skill và MCP sẽ từ chối. Với provider và package, workspace không giới hạn gì vẫn chạy như trước, còn workspace có giới hạn sẽ từ chối cho tới khi đọc lại được.

### Những gì quyền theo tài nguyên không bao phủ

- **Thư viện trong package.** Quyền trên package chặn các lệnh mà package cài vào, theo tên lệnh. Nó không chặn code import package như một thư viện, bản sao đã đổi tên của một lệnh, hay script bên trong package được chạy qua trình thông dịch. Khi cần cô lập thật sự, hãy dùng [sandbox Docker](/docs/security/overview#cách-ly).
- **File của skill ngoài `read_file`.** Lệnh shell, `search_files` và `list_files` vẫn chạm được tới file của skill.
- **MCP server khai báo trong file cấu hình gateway.** Chúng không có quyền theo tài nguyên và vẫn mở cho bất kỳ ai gọi được chúng.
- **Tác vụ nền.** Bộ nhớ, embedding, giọng nói và tóm tắt dùng provider của workspace bên ngoài lượt chạy của agent chưa được kiểm tra theo quyền trên provider.
- **Bản Lite.** Lite không có kho lưu quyền: panel và lệnh `access` không hoạt động ở đó, provider và package không giới hạn được, còn skill, MCP server, agent và hook giữ quy tắc cũ.

## Hoạt động

Mỗi tài nguyên có một luồng hoạt động gồm ba loại sự kiện:

- **Thay đổi quyền.** Cấp quyền, đổi mức, thu hồi và đổi chế độ, kèm người thực hiện. Bản ghi được lưu cùng lúc với thay đổi.
- **Từ chối.** Mỗi lần bị từ chối khi chạy, gộp lại tối đa một mục cho mỗi agent, tài nguyên và hành động trong một phút. Gateway cũng ghi log `security.resource_grant_denied`. Lời gọi tool MCP bị từ chối trong lúc chat được gateway ghi log nhưng không xuất hiện trong luồng hoạt động.
- **Sử dụng.** Các lần chạy skill, lần thực thi hook và lời gọi model trên một provider trong 7 ngày gần nhất. MCP server, package và agent chưa có sự kiện sử dụng.

Admin của workspace và người có `manage` trên tài nguyên xem được luồng này.

## Quản lý quyền ở đâu

- **Dashboard tích hợp sẵn của gateway.** Panel **Access** trên skill (một tab trong hộp thoại skill), provider (trang provider), package (một thao tác trên từng dòng của danh sách pip, npm, system và GitHub), hook và agent (một tab trên trang của chúng). Panel liệt kê quyền, thêm agent hoặc người ở các mức tài nguyên cho phép, đổi mức và thu hồi quyền, hiện luồng hoạt động, và có công tắc mở/giới hạn cho provider và package.
- **CLI.** `dewee skills`, `mcp`, `providers`, `packages`, `agent` và `hooks` đều có nhóm `access` với `list`, `grant`, `set-level`, `revoke` và `activity`; provider và package có thêm `mode get` và `mode set`. Xem [Tham chiếu CLI](/docs/runtime/cli).
- **HTTP API.** `/v1/resource-grants/{type}/{id}`, theo cùng quy tắc với dashboard.
- **Console.** Trên app.dewee.sh, skill, MCP server, provider và package có tab **Access** và một tab hoạt động, agent có tab **Permissions**, còn hook chạy cho các agent được chọn có tab **Access**. Khi cấp mới, console chỉ đề xuất các mức nó thực thi: một người nhận **Use** hoặc **Manage** trên skill, MCP server hay agent, và **Edit** hoặc **Manage** trên hook, còn các agent của hook nằm trong mục **Runs for**. Quản trị viên workspace còn có công tắc mở/giới hạn cho provider và package, kèm bản xem trước các agent sẽ mất quyền. Package phát hành trên GitHub và hook áp dụng cho cả workspace hiện thông báo thay cho các nút điều khiển, còn thành viên mà gateway sẽ từ chối chỉ xem được danh sách quyền. Xem [Agent](/docs/console/agents), [Skill](/docs/console/skills), [Provider và model](/docs/console/providers-and-models) và [Tool tích hợp, MCP server và hook](/docs/console/tools-mcp-and-hooks).

```bash
dewee skills access grant git-helper --agent support-bot --level use
dewee agent access set-level support-bot --user <user-id> --level edit
dewee providers access mode set anthropic restricted --dry-run
dewee providers access mode set anthropic restricted --yes
dewee packages access grant pip:requests --agent support-bot
dewee hooks access activity <hook-id> --type denied
```

`revoke` luôn cần `--yes` hoặc `--dry-run`. Giới hạn bằng `mode set` sẽ hỏi xác nhận khi chạy trong terminal, và cần `--yes` hoặc `--dry-run` ở mọi nơi khác; mở lại thì không cần xác nhận.
