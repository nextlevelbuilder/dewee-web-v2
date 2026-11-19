---
title: Workspace MCP
description: Kết nối Claude Code, Cursor, VS Code, ChatGPT hay Gemini CLI tới /mcp/workspace bằng đăng nhập Dewee, đọc agent, workflow, lịch chạy và bật tắt một lịch chạy.
section: api
order: 4
updated: 2026-11-08
---

Endpoint workspace MCP, `/mcp/workspace`, cho một client AI quản lý workspace **dưới danh nghĩa của bạn**: liệt kê agent, workflow và lịch chạy, xem mức sử dụng và tình trạng workspace, bật hoặc tắt một lịch chạy. Nó khác với [MCP server công khai](/docs/api/webhooks-and-mcp#mcp-server-công-khai) ở `/mcp/server`, nơi client đóng vai một agent và dùng MCP API key. Ở đây không có agent và không có API key: bạn đăng nhập bằng tài khoản Dewee và duyệt client trên trang đồng ý.

> [!WARNING]
> Endpoint này có từ dewee v3.47.0, **mặc định tắt** và **chưa được duyệt cho production**. Nó đang được thử trên staging trước. Khi người vận hành chưa bật cho workspace của bạn, `/mcp/workspace` trả về `404` và các bước dưới đây không dùng được.

## Trước khi bắt đầu

Người vận hành bật endpoint, OAuth và quyền đọc cho môi trường. Khi đó các workspace hiện có và mới tạo đủ điều kiện đều có thể kết nối; người dùng vẫn phải đăng nhập và chấp thuận. Danh sách workspace được cấu hình sẽ giới hạn quyền truy cập; danh sách được đặt rỗng chủ động sẽ từ chối tất cả. Các thao tác cấu hình và quyền nâng cao vẫn được kiểm soát riêng:

| Thiết lập | Biến môi trường | Tác dụng |
|---|---|---|
| `tools.mcp.workspace.enabled` | `GOCLAW_MCP_WORKSPACE_ENABLED` | Công tắc chính. Khi tắt, route không tồn tại và trả về `404` |
| `tools.mcp.workspace.read` | `GOCLAW_MCP_WORKSPACE_READ` | Phục vụ các read tool |
| `tools.mcp.workspace.config_write` | `GOCLAW_MCP_WORKSPACE_CONFIG_WRITE` | Kiểm soát các thao tác ghi cấu hình |
| `tools.mcp.workspace.oauth` | `GOCLAW_MCP_WORKSPACE_OAUTH` | Nhận token đăng nhập Dewee. Khi tắt, route vẫn còn nhưng từ chối mọi credential với `401` |
| `tools.mcp.workspace.resource_origin` | `GOCLAW_MCP_WORKSPACE_RESOURCE_ORIGIN` | Origin công khai của gateway, phải khai báo rõ. Bắt buộc khi bật endpoint; gateway không bao giờ đoán nó từ header của request |
| `tools.mcp.workspace.tenants` | `GOCLAW_MCP_WORKSPACE_TENANTS` | Danh sách workspace tùy chọn. Không khai báo cho phép workspace đủ điều kiện đọc; khai báo danh sách rỗng từ chối tất cả |

Công tắc `privileged_write` kiểm soát riêng các thao tác đặc quyền. Bật quyền đọc không tự bật ghi cấu hình hay thao tác đặc quyền; mỗi nhóm vẫn có điều kiện truy cập và phê duyệt riêng.

Khi bật `oauth`, gateway không khởi động nếu thiếu issuer đăng nhập Dewee và khóa của nó (`GOCLAW_MCP_PUBLIC_OAUTH_ISSUER`, `GOCLAW_MCP_PUBLIC_OAUTH_JWKS_URI`), gateway token, hoặc kho grant trên PostgreSQL (migration `000178` trở lên). Bản Lite không có kho grant nên không phục vụ được endpoint này.

Để kết nối, bạn cần là thành viên của một workspace đã được bật, có quyền quản lý truy cập API ở đó; nếu không, trang đồng ý sẽ báo bạn không thể kết nối ứng dụng với workspace đó.

## Kết nối client

Địa chỉ là origin công khai của gateway nối thêm `/mcp/workspace`, ví dụ `https://dewee.example.com/mcp/workspace`. Thêm nó vào client như một MCP server từ xa (HTTP), không kèm key hay header nào. Ở request đầu tiên, gateway trả về `401` và chỉ client tới `/.well-known/oauth-protected-resource/mcp/workspace`; từ đó client tìm ra trang đăng nhập Dewee và mở nó trong trình duyệt.

Trên trang đồng ý, chọn workspace và chọn những gì client được làm:

- **Xem workspace** (`workspace.read`) luôn có.
- **Cho phép thay đổi cấu hình workspace** (`workspace.configure`) tắt trừ khi bạn đánh dấu. Hãy để tắt nếu bạn không cần client thay đổi gì.

Dewee không hỗ trợ đăng ký client động (dynamic client registration). Client tự giới thiệu bằng Client ID Metadata Document, cách OAuth mới hơn dành cho client MCP, hoặc bằng một client id mà người vận hành đã đăng ký sẵn. Client chỉ biết đăng ký động thì không đăng nhập được.

### Claude Code

```bash
claude mcp add --transport http dewee-workspace https://dewee.example.com/mcp/workspace
```

Sau đó chạy `/mcp` trong Claude Code, chọn `dewee-workspace` và xác thực.

### Cursor

Trong `~/.cursor/mcp.json` (hoặc `.cursor/mcp.json` trong một dự án):

```json
{
  "mcpServers": {
    "dewee-workspace": {
      "url": "https://dewee.example.com/mcp/workspace"
    }
  }
}
```

Cursor hiện lời mời đăng nhập cho server này trong phần cài đặt MCP.

### VS Code

Trong `.vscode/mcp.json`:

```json
{
  "servers": {
    "dewee-workspace": {
      "type": "http",
      "url": "https://dewee.example.com/mcp/workspace"
    }
  }
}
```

Khởi động server từ file này hoặc từ danh sách MCP server, VS Code sẽ yêu cầu bạn đăng nhập.

### Gemini CLI

Trong `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "dewee-workspace": {
      "httpUrl": "https://dewee.example.com/mcp/workspace"
    }
  }
}
```

Gemini CLI bắt đầu đăng nhập khi server trả về `401`; bạn cũng có thể chạy `/mcp auth dewee-workspace`.

### ChatGPT

Tạo một connector tùy chỉnh trong phần cài đặt của ChatGPT (cần bật developer mode), điền địa chỉ endpoint và chọn OAuth làm cách xác thực. ChatGPT kết nối từ internet, nên origin phải truy cập được công khai; gateway nằm trong mạng riêng sẽ không dùng được.

> [!NOTE]
> Tên menu và khả năng đăng nhập thay đổi theo phiên bản client. Nếu client không đăng nhập được, hãy kiểm tra phiên bản đó có hỗ trợ OAuth cho MCP server từ xa với Client ID Metadata Document hay không.

## Client thấy được gì

Token có hạn 5 phút và client tự làm mới. Token mang các quyền (scope `customer.*`) mà vai trò của bạn có lúc token được cấp, và các quyền này được đọc lại ở mỗi lần làm mới, nên một thay đổi có hiệu lực trong vòng 5 phút. Nếu bạn bị gỡ khỏi workspace hoặc bị hạ vai trò, request tiếp theo sẽ bị từ chối. `tools/list` chỉ hiện những tool mà gateway đang phục vụ, sự đồng ý của kết nối bao phủ và quyền của bạn cho phép.

| Tool | Trả về | Cần |
|---|---|---|
| `agents_list` | Các agent đang hoạt động mà bạn dùng được: của bạn, agent mặc định và agent được chia sẻ với bạn (key, tên, model, provider, loại, trạng thái) | `customer.agents.manage` |
| `agents_links_list` | Các liên kết ủy quyền của một agent bạn truy cập được (`agentId`, tùy chọn `direction`: `from`, `to` hoặc `all`) | `customer.agents.manage` |
| `cron_list` | Các lịch chạy của chính bạn, đã bỏ credential gắn kèm (`includeDisabled` để lấy cả lịch đang tắt) | `customer.tasks.manage` |
| `workflows_list` | Các workflow của workspace, lọc theo `enabled` hoặc `query`, có `limit` và `offset` | `customer.tasks.manage` |
| `workflows_get` | Một workflow theo `id` hoặc `slug`, kèm bản nháp | `customer.tasks.manage` |
| `workflows_node_types` | Các loại node workflow mà gateway hỗ trợ, kèm thiết lập của chúng | `customer.tasks.manage` |
| `channels_list` | Tên và loại các channel của workspace | `customer.integrations.manage` |
| `channels_writers_read`, `channels_writers_write` | Liệt kê, kiểm tra, thêm hoặc xóa writer của nhóm; mỗi lần gọi cần phê duyệt, thao tác ghi cần owner hoặc admin | `customer.integrations.manage` |
| `quota_usage` | Số request, token và chi phí trong hôm nay của workspace, kèm số liệu của những người dùng nhiều nhất | `customer.observability.read` |
| `workspace_setup_readiness_read` | Tình trạng workspace: provider model đã xác minh, Super Agent, channel đang chạy, phê duyệt đang chờ, và cách sửa từng mục chưa đạt | `customer.observability.read` |

Mỗi tool chạy qua cùng các bước kiểm tra như trong console, với tư cách của bạn. Đối tượng của workspace khác không bao giờ được trả về; id workflow của workspace khác cho kết quả `NOT_FOUND`.

Mỗi thao tác kiểm tra vai trò và quyền hiện tại của người đã đăng nhập trong workspace. Tool nâng cao có thể yêu cầu owner hoặc admin và phê duyệt riêng; quyền đọc không tự cấp các thao tác đó.

Tham số được kiểm tra theo schema của từng tool. Tham số mà tool không khai báo, như `createdVia` chỉ dành cho admin của `cron_list`, bị từ chối với `invalid_arguments` trước khi bất cứ thứ gì chạy.

`cron_list` mặc định trả tối đa 20 job; giới hạn yêu cầu lớn nhất là 100. Kết quả gồm `jobs`, `hasMore` và `nextCursor`. Dùng cursor được trả về với cùng bộ lọc để xem tiếp, hoặc bỏ cursor để bắt đầu lại. Cursor rỗng hoặc không hợp lệ gây lỗi. Cursor chỉ đánh dấu vị trí, không phải ảnh chụp: hãy duyệt lại từ đầu để thấy các job mới hơn được thêm vào.

Khi thao tác ghi cấu hình workflow được bật, `workflows_update` có thể thay thế bản nháp. Đọc `updated_at` bằng `workflows_get` rồi truyền đầy đủ giá trị đó vào `expected_version` để tránh ghi đè một chỉnh sửa đồng thời. Phiên bản cũ trả `VERSION_CONFLICT`; hãy đọc lại workflow và đối chiếu thay đổi. Thao tác cần owner hoặc admin của workspace và sự phê duyệt của một owner hoặc admin khác; sau khi được duyệt, gọi lại yêu cầu giống hệt với `approval_id`. Xem [Workflow](/docs/concepts/workflows) để biết độ chính xác timestamp và cách tương ứng qua CLI, HTTP và WebSocket.

`cron_status`, `cron_runs` và `hooks_list` không có.

### Trình duyệt đã kết nối

Các tool sau cần gateway và control plane có bản cập nhật MCP cho trình duyệt kết nối; hãy kiểm tra `tools/list` để biết có dùng được hay không. Kết nối nhận scope `customer.browser.manage` cho các thao tác này mà không nâng vai trò chung. Bạn chỉ thấy trình duyệt và quyền cấp của chính mình, kể cả khi là owner hoặc admin workspace; ID của người khác trả `NOT_FOUND`.

| Tool | Công dụng |
|---|---|
| `browser_devices_list` | Liệt kê trình duyệt của bạn cùng trạng thái trực tuyến và điều khiển |
| `browser_grants_list` | Liệt kê quyền đang có hiệu lực của một trình duyệt, gồm tab được chia sẻ nếu có |
| `browser_devices_rename` | Đổi tên trình duyệt; `validate_only` xem trước tên đã bỏ khoảng trắng thừa |
| `browser_devices_revoke` | Thu hồi trình duyệt, các quyền của nó và kết nối đang mở |
| `browser_grants_revoke` | Thu hồi một quyền và hủy các lệnh đang chạy theo quyền đó |

Các tool này tương ứng với `dewee browser devices list`, `rename`, `revoke` và `dewee browser grants list`, `revoke`; kết quả khớp đầu ra CLI `--json` tương ứng. Quản lý trình duyệt hoặc quyền cá nhân đã có không tự cấp cho agent quyền truy cập một tab.

Đổi tên là thao tác cấu hình; hai thao tác thu hồi là thao tác phá hủy. Lần gọi thu hồi đầu tiên mở xác nhận do Dewee cung cấp cho chính bạn, người gửi yêu cầu. Sau khi xác nhận, gọi lại cùng yêu cầu với `approval_id`; hai thao tác này không cần owner hoặc admin thứ hai. Thu hồi lại trình duyệt hoặc quyền của chính bạn đã hết hiệu lực là thao tác lặp an toàn. ID không tồn tại hoặc thuộc người khác vẫn trả `NOT_FOUND` sau khi xác nhận. Việc đăng ký, kết nối và tạo quyền vẫn thực hiện trong extension.

## Thay đổi một lịch chạy

`cron_toggle` bật hoặc tắt một lịch chạy của bạn. Nó cần cả công tắc `config_write` trên gateway lẫn sự đồng ý `workspace.configure` trên kết nối của bạn.

| Tham số | Ý nghĩa |
|---|---|
| `jobId` | Bắt buộc. Id của lịch chạy lấy từ `cron_list` |
| `enabled` | Bắt buộc. `true` để bật lịch chạy, `false` để tắt |
| `expected_version` | Tùy chọn. Giá trị `updatedAtMs` của lịch chạy lấy từ `cron_list`, dạng chuỗi. Thay đổi bị từ chối nếu lịch chạy đã đổi kể từ lúc bạn đọc |
| `validate_only` | Tùy chọn. Xem trước thay đổi mà không thực hiện |
| `idempotency_key` | Tùy chọn, 8 đến 128 ký tự. Gọi lại với cùng key và cùng tham số sẽ trả về kết quả lần đầu thay vì bật tắt thêm lần nữa |

Một lần ghi đầu tiên an toàn gồm đọc, xem trước rồi mới ghi:

1. Gọi `cron_list` và ghi lại `id` cùng `updatedAtMs` của lịch chạy.
2. Gọi `cron_toggle` với `{"jobId": "<id>", "enabled": false, "expected_version": "<updatedAtMs>", "validate_only": true}`. Kết quả cho thấy `enabled` từ giá trị nào sang giá trị nào và `version` hiện tại; không có gì thay đổi.
3. Gọi lại mà không có `validate_only` và có `idempotency_key`. Kết quả có `previousEnabled`, và thay đổi được ghi vào nhật ký audit của workspace dưới tên `cron.toggled`.

Phiên bản được kiểm tra ngay trước khi bật tắt, không nằm cùng một bước, và chính các lần chạy của lịch cũng làm `updatedAtMs` thay đổi. Nếu nhận `VERSION_CONFLICT`, hãy đọc lại lịch chạy rồi thử lại với phiên bản mới.

| Lỗi | Ý nghĩa |
|---|---|
| `VERSION_CONFLICT` | Lịch chạy đã đổi kể từ lúc bạn đọc |
| `IDEMPOTENCY_KEY_REUSED` | Key đã được dùng trước đó với tham số khác |
| `IDEMPOTENCY_IN_PROGRESS` | Một lần gọi với key này vẫn đang chạy |
| `NOT_FOUND` | Không có lịch chạy với id đó trong danh sách của chính bạn, kể cả lịch chạy của thành viên khác |
| `UNAVAILABLE` | Gateway hiện không lưu được idempotency key |

Lỗi được trả về dưới dạng lỗi của tool, chỉ chứa mã lỗi; lỗi ngoài dự kiến là `operation_failed`. Tool mà kết nối của bạn không được gọi sẽ được trả lời như một tool không tồn tại.

## Ngắt kết nối client

Thành viên workspace có quyền quản lý truy cập API có thể ngắt kết nối bất kỳ ứng dụng nào trong phần cài đặt kết nối MCP của workspace trên ứng dụng Dewee. Refresh token của client ngừng hoạt động ngay, còn access token bị từ chối ở request tiếp theo, vì gateway đọc lại grant ở mỗi request. Client cũng có thể tự thu hồi token của mình tại endpoint thu hồi OAuth của Dewee.

Để cắt mọi client cùng lúc, người vận hành gỡ workspace khỏi `tools.mcp.workspace.tenants` hoặc tắt endpoint.

## Lỗi và giới hạn

| Mã trạng thái | Mã lỗi | Ý nghĩa |
|---|---|---|
| `401` | `workspace_credential_rejected` | Không phải token đăng nhập Dewee dành cho endpoint này. MCP API key, gateway token, phiên console và token của `/mcp/server` đều bị từ chối ở đây |
| `401` | `workspace_membership_revoked` | Bạn không còn là thành viên của workspace |
| `401` | `workspace_tenant_inactive` | Workspace không hoạt động hoặc không còn tồn tại |
| `403` | `workspace_tenant_not_enabled` | Workspace không nằm trong danh sách cho phép của endpoint |
| `429` | `rate_limited`, `too_many_concurrent_calls`, `tenant_rate_limited`, `tenant_too_many_concurrent_calls` | Vượt giới hạn bên dưới; các mã `tenant_` nghĩa là cả workspace đã vượt ngân sách. Hãy đợi theo `Retry-After` |
| `503` | `workspace_oauth_verifier_unavailable` | Gateway hiện không kiểm tra được token; hãy thử lại sau |

Endpoint dùng cùng thiết lập giới hạn với `/mcp/server` (số request mỗi phút, số tool call đồng thời, thời gian chờ mỗi lần gọi và kích thước body) nhưng giữ ngân sách riêng cho từng kết nối, nên lưu lượng ở endpoint này không bao giờ tiêu vào ngân sách của endpoint kia. [Ngân sách của workspace](/docs/api/webhooks-and-mcp#giới-hạn-hạn-mức-và-thu-hồi-key), dùng chung cho mọi kết nối của một workspace, cũng áp dụng ở đây và được tính riêng với `/mcp/server`. Không endpoint nào nhận token của endpoint còn lại.

Gateway ghi log mọi lần gọi với thao tác, kết quả, workspace, người dùng, client id và id của token, không bao giờ ghi tham số, kết quả trả về hay bản thân token.
