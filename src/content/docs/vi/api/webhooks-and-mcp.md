---
title: Webhook và MCP
description: Cho hệ thống khác kích hoạt agent và gửi tin nhắn qua channel bằng webhook có chữ ký, và kết nối Claude Code, Cursor, VS Code hay Gemini CLI tới dewee qua MCP.
section: api
order: 3
updated: 2026-11-08
---

Có hai endpoint dành riêng cho phần mềm khác gọi vào dewee. **Webhook** cho một hệ thống bạn đang chạy, như CRM, biểu mẫu hay công cụ giám sát, khởi động agent hoặc đăng tin nhắn lên ứng dụng chat. **MCP server công khai** cho trợ lý lập trình AI tìm trong bộ nhớ và skill của workspace và làm việc với workflow của nó. Cả hai đều cố ý hẹp: mỗi endpoint chỉ nhận đúng loại credential của mình và chỉ mở một tập thao tác cố định.

## Webhook

Có hai loại webhook:

| Loại | Endpoint | Tác dụng | Edition |
|---|---|---|---|
| `llm` | `POST /v1/webhooks/llm` | Chạy agent với đầu vào bạn gửi và trả về câu trả lời | Standard và Lite |
| `message` | `POST /v1/webhooks/message` | Gửi tin nhắn, có thể kèm media, tới một cuộc chat trên channel đã kết nối | Standard |

Admin của tenant tạo webhook bằng `POST /v1/webhooks`, chỉ rõ loại và, với `llm`, agent cần chạy. Phản hồi chứa secret của webhook, bắt đầu bằng `wh_` và chỉ hiện một lần. Webhook cần `GOCLAW_ENCRYPTION_KEY` trên gateway, vì secret còn được giữ ở dạng mã hoá để ký callback.

### Gọi agent

```bash
curl https://dewee.example.com/v1/webhooks/llm \
  -H "Authorization: Bearer <webhook-secret>" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: <unique-request-id>" \
  -d '{"input": "Summarise the new ticket and suggest a reply", "session_key": "ticket-4812", "mode": "sync"}'
```

Ở chế độ `sync`, câu trả lời nằm ngay trong phản hồi, và lời gọi hết thời gian sau 30 giây với mã `504`. Ở chế độ `async`, gateway trả `202` ngay và gửi kết quả tới `callback_url` của bạn, bắt buộc là HTTPS. `session_key` giữ các lời gọi liên quan trong cùng một cuộc trò chuyện.

Với lời gọi đồng bộ, gateway lưu bản ghi trước khi khởi chạy agent, kể cả khi không có idempotency key. Nếu lưu thất bại, gateway trả lỗi máy chủ và không khởi chạy agent; hãy thử lại khi hệ thống lưu trữ phục hồi. Các quy tắc phát lại và xung đột idempotency hiện có vẫn áp dụng.

### Gửi tin nhắn

Webhook `message` nhận `channel_name`, `chat_id` và `content` tối đa 16 KB, cùng `media_url` tuỳ chọn. Với `fallback_to_text`, media được bỏ qua trên những channel không hiển thị được, thay vì làm lời gọi thất bại.

### Ký request

Bearer secret là cách đơn giản nhất. Để bảo vệ chặt hơn, hãy ký mỗi request bằng HMAC và bật `require_hmac` để từ chối dạng bearer:

```text
X-Webhook-Id: <webhook-id>
X-GoClaw-Signature: t=<unix-seconds>,v1=<hex HMAC-SHA256 of "<t>.<raw body>">
```

Dấu thời gian phải lệch không quá 5 phút so với đồng hồ của gateway, và một chữ ký không dùng lại được. Bạn cũng có thể giới hạn bên gọi bằng danh sách IP; danh sách này dùng địa chỉ kết nối thật và bỏ qua `X-Forwarded-For`.

### Thử lại và idempotency

- Gửi header `Idempotency-Key`. Lần thử lại với cùng key và cùng body trả về kết quả lần đầu mà không chạy agent lần nữa; cùng key nhưng body khác sẽ nhận `409`.
- Callback được gửi ít nhất một lần. Mỗi callback có `X-Webhook-Delivery-Id` cố định để loại trùng và `X-Webhook-Signature` ký theo cùng thuật toán, nên bạn xác minh được bằng secret của webhook.
- Callback thất bại được thử lại sau 30 giây, 2 phút, 10 phút, 1 giờ và 6 giờ, rồi bị đánh dấu dead. Phản hồi `4xx` khác `429` sẽ dừng việc thử lại.
- Mỗi webhook và mỗi tenant có giới hạn tần suất. Vượt ngưỡng, gateway trả `429` kèm `Retry-After`.

> [!WARNING]
> Xoay vòng secret bằng `POST /v1/webhooks/{id}/rotate` làm secret cũ mất hiệu lực ngay lập tức, không có thời gian chồng lấp. Hãy cập nhật bên gửi cùng lúc.

### Webhook sau reverse proxy

Webhook tạo với `localhost_only` dành cho bên gọi trên chính máy chạy gateway. Khi gateway chạy với `GOCLAW_REQUIRE_AUTH=1`, như nên làm khi nằm sau [reverse proxy trên cùng máy](/docs/runtime/install-and-run#sau-reverse-proxy-trên-cùng-máy), các webhook này từ chối mọi bên gọi, vì proxy trên cùng máy có thể chuyển tiếp request mà không thêm header nào. Ở chế độ này, tạo hoặc cập nhật webhook với `localhost_only=true` trả về `400`. Edition Lite luôn đặt `localhost_only`, nên Lite không tạo được webhook ở chế độ này; hãy dùng edition Standard cho webhook đặt sau proxy.

## MCP server công khai

Gateway có thể đóng vai MCP server tại `POST /mcp/server`, để một client MCP như Claude Code, Cursor, VS Code hay Gemini CLI dùng workspace ngay trong trình soạn thảo. Nó khác với các MCP server mà chính dewee kết nối tới, vốn được quản lý trong [Tool, MCP và hook](/docs/console/tools-mcp-and-hooks).

`/mcp/server` là địa chỉ mà mọi cấu hình được sinh ra đều dùng. Đường dẫn cũ `/mcp` vẫn trả lời client MCP, kèm header `Deprecation` và header `Link` trỏ sang `/mcp/server`, và sẽ bị gỡ trong một bản phát hành sau, nên hãy chuyển các client hiện có sang `/mcp/server`.

Để client quản lý workspace dưới danh nghĩa người dùng đã đăng nhập thay vì đóng vai một agent, xem [Workspace MCP](/docs/api/workspace-mcp).

Hai công tắc quyết định client có kết nối được hay không:

- **Runtime.** Trên gateway On-Premises, endpoint này **mặc định tắt**. Người vận hành bật nó bằng `GOCLAW_MCP_PUBLIC_ENABLED=1` hoặc `tools.mcp.public.enabled` trong file cấu hình.
- **Workspace.** Khi endpoint đã bật, mỗi workspace **mặc định được kích hoạt**. Chủ sở hữu hoặc admin của workspace có thể tắt rồi bật lại quyền truy cập MCP công khai; xem [Bật hoặc tắt quyền truy cập cho workspace](#bật-hoặc-tắt-quyền-truy-cập-cho-workspace).

### Client làm được gì

| Có | Không bao giờ có |
|---|---|
| `memory_search`, `memory_get` | Chạy lệnh, thay đổi file |
| `skill_search`, `web_search` | Trình duyệt, nhắn tin, lịch chạy, tạo agent con |
| `workflow`: liệt kê, xem, kiểm tra, xem loại node, lượt chạy và trạng thái | Thao tác quản trị, credential, provider và package |
| `workflow`: tạo và sửa bản nháp, với `mcp.tools.write` | Xuất bản hay chạy workflow; tool từ các MCP server khác |

Client hoạt động như một agent trong tenant của nó, được chọn bằng header `X-Dewee-Agent` hoặc tham số `?agent=`, nếu không thì là agent `default`. Owner của key phải có quyền truy cập agent đó, và agent không tồn tại hay không được phép đều trả về cùng một mã `404`.

### Kết nối client trong console

Trong console, mở **API key & tài liệu** rồi chọn tab **Kết nối MCP client**. Tab này dẫn bạn qua năm bước:

1. **Trạng thái endpoint.** Các nhãn trạng thái cho biết runtime đã được liên kết chưa, endpoint có sẵn sàng trên runtime này không, và MCP đã được bật cho workspace chưa. Bên dưới là địa chỉ endpoint chính xác, số tool đọc và tool ghi, cùng các giới hạn, gồm cả dòng **Workspace limits**. Admin của workspace có thể **Bật MCP** hoặc **Tắt MCP** ngay tại đây, sau một bước xác nhận; các thành viên khác chỉ xem được trạng thái và được hướng dẫn liên hệ admin.
2. **Chọn agent.** Chọn agent mà client sẽ làm việc cùng, hoặc để trống để dùng agent mặc định của workspace.
3. **Tạo key.** Key chỉ dùng được cho MCP và mặc định chỉ có quyền đọc. Chỉ đánh dấu **Cho phép thêm công cụ ghi** khi client thật sự cần thay đổi dữ liệu. Key chỉ hiện một lần, nên hãy sao chép ngay.
4. **Sao chép cấu hình client.** Chọn Claude Code, Cursor, VS Code hoặc Gemini CLI rồi sao chép cấu hình, trong đó đã có sẵn endpoint và agent bạn chọn. Cấu hình luôn dùng chỗ giữ chỗ `<your-mcp-key>`, không bao giờ chứa key thật; hãy thay chỗ giữ chỗ bằng key của bạn.
5. **Kiểm tra kết nối.** Dán một key, hoặc dùng key vừa tạo, rồi chọn **Kiểm tra kết nối**. Console chạy đúng bước bắt tay mà client thực hiện và hiển thị kết quả, bước tiếp theo nên làm, số tool tìm thấy và thời gian phản hồi. Tuỳ chọn **Gọi thử một công cụ chỉ đọc** chứng minh rằng tool thật sự chạy được.

Xem tab và chạy kiểm tra cần quyền Giám sát. Bật hoặc tắt MCP, và bài kiểm tra có gọi tool, cần quyền Kết nối; riêng việc bật hoặc tắt MCP chỉ chủ sở hữu hoặc admin của workspace mới làm được. Cấu hình chỉ hiện khi gateway đã được cấu hình địa chỉ công khai; nếu chưa có, tab sẽ báo rõ và không bao giờ tự đoán địa chỉ từ trình duyệt của bạn.

### Kết nối client bằng CLI

1. Tạo key với mức **MCP đọc** hoặc **MCP đọc và ghi** trên trang **API key & tài liệu** của console, hoặc bằng `dewee api-keys create` với `mcp.tools.read` và một owner.
2. Export key thành `DEWEE_MCP_TOKEN` để nó không bao giờ nằm trong file cấu hình.
3. Sinh cấu hình cho client của bạn rồi gộp vào phần cài đặt của client:

```bash
export DEWEE_MCP_TOKEN=<mcp-api-key>
dewee mcp connect-config --client claude
```

`--client` nhận `claude`, `cursor`, `vscode`, `gemini` và `generic`, còn `--agent` thêm bộ chọn agent. Cấu hình sinh ra chỉ tham chiếu tới biến môi trường và không bao giờ chứa key.

CLI cũng có lệnh xem trạng thái, bật tắt và kiểm tra kết nối:

| Lệnh | Tác dụng |
|---|---|
| `dewee mcp status` | Hiển thị trạng thái endpoint và workspace như mô tả bên dưới, kèm một dòng **Workspace limits** |
| `dewee mcp activate`, `dewee mcp deactivate` | Bật hoặc tắt quyền truy cập MCP công khai cho workspace. Lệnh hỏi xác nhận trừ khi bạn truyền `--yes`; `--dry-run` in ra request mà không gửi |
| `dewee mcp test` | Kiểm tra key trong `DEWEE_MCP_TOKEN`, hoặc key truyền qua stdin với `--mcp-token-stdin`. `--agent` chọn agent, `--call-tool` gọi thêm một tool chỉ đọc |

Key không bao giờ được nhận qua tham số dòng lệnh. `dewee mcp test` in kết quả ngay cả khi kiểm tra thất bại, và thoát với mã khác 0 tuỳ theo loại lỗi, để script phân biệt được key bị từ chối với thiếu quyền. Với `--remote`, lệnh chạy bước bắt tay từ máy của bạn tới endpoint được công bố, nhờ đó kiểm tra luôn DNS, TLS và reverse proxy. Lệnh chỉ gửi key tới endpoint cùng origin với gateway mà CLI đang cấu hình; muốn kiểm tra một host khác, hãy chỉ rõ bằng `--remote --endpoint <url>`, và CLI sẽ cảnh báo host nào nhận key. Khi có tên server, `dewee mcp test <server>` vẫn kiểm tra một MCP server mà dewee kết nối tới như trước.

### Đăng nhập bằng Dewee thay cho key

Client cũng có thể kết nối tới `/mcp/server` bằng cách đăng nhập với Dewee (OAuth) thay vì mang theo một API key MCP. Hãy sinh cấu hình chỉ chứa địa chỉ endpoint, không có header `Authorization` và không có `DEWEE_MCP_TOKEN`:

```bash
dewee mcp connect-config --client claude --auth oauth
```

Kết quả cũng cho biết cách mỗi client bắt đầu đăng nhập. Không có `--auth`, hoặc với `--auth key`, bạn nhận cấu hình dùng API key như trên, không thay đổi gì.

- Client phải hỗ trợ cơ chế ủy quyền MCP bằng Client ID Metadata Document hoặc bằng client id được đăng ký trước. Dewee không hỗ trợ đăng ký client động, nên client chỉ biết đăng ký động sẽ không đăng nhập được.
- Cursor chưa đăng nhập được theo cách này, vì địa chỉ chuyển hướng `cursor://` của nó chưa được chấp nhận. Với Cursor, hãy giữ cấu hình mặc định dùng API key.

### Xem và thu hồi ứng dụng đã kết nối

| Lệnh | Tác dụng |
|---|---|
| `dewee mcp authorizations list` | Liệt kê các ứng dụng đã kết nối bằng cách đăng nhập. Thành viên workspace thấy ứng dụng của chính mình; chủ sở hữu hoặc admin của workspace thấy ứng dụng của mọi thành viên. Chỉ hiện các kết nối còn hiệu lực, trừ khi bạn truyền `--all`; `--json` in kết quả cho máy đọc |
| `dewee mcp authorizations revoke <grant-id>` | Thu hồi một kết nối, và ứng dụng phải đăng nhập lại. Lệnh hỏi xác nhận khi chạy trong terminal; `--force` bỏ qua câu hỏi và là bắt buộc trong script. Lệnh cũng nhận `--dry-run` và `--json` |

### Xem trạng thái

`GET /v1/mcp/public/status` trả về trạng thái endpoint cho workspace của request, và thành viên nào của workspace cũng gọi được. Các trường quan trọng nhất khi thiết lập client:

| Trường | Ý nghĩa |
|---|---|
| `instance_enabled` | Runtime đang phục vụ endpoint công khai |
| `workspace_active` | Quyền truy cập MCP công khai đang bật cho workspace này |
| `endpoint_url` | Địa chỉ chính xác để đưa cho client. Chỉ có giá trị khi URL công khai của gateway (`GOCLAW_PUBLIC_URL`) đã được cấu hình; không bao giờ lấy từ header của request |
| `endpoint_url_source` | `configured` khi `endpoint_url` có giá trị, ngược lại là `unset`. Khi là `unset`, `endpoint_url` rỗng và `endpoint_url_next_action` cho biết cách khắc phục |
| `agent_header`, `protocol_version`, `limits`, `tools` | Header chọn agent, phiên bản MCP, các giới hạn endpoint áp dụng, và số tool đọc, tool ghi được mở ra. `limits` có cả [ngân sách của workspace](#giới-hạn-hạn-mức-và-thu-hồi-key): `tenant_requests_per_minute`, `tenant_burst`, `tenant_max_concurrent_tool_calls`, và `tenant_rejections` với `rate_limited` và `concurrency_limited` cho các request bị ngân sách đó từ chối |
| `can_manage_activation` | Bên gọi được phép bật hoặc tắt quyền truy cập |
| `can_call_tool` | Bên gọi được phép chạy bài kiểm tra kết nối có gọi tool |

### Bật hoặc tắt quyền truy cập cho workspace

`PUT /v1/mcp/public/activation` với `{"active": false}` hoặc `{"active": true}` tắt hoặc bật quyền truy cập MCP công khai cho workspace, và trả về trạng thái mới. Chỉ chủ sở hữu hoặc admin của workspace làm được việc này, với một credential chứng minh được họ là ai: API key hoặc phiên console gắn với chính người đó, gateway token, hoặc system owner. API key không có owner sẽ bị từ chối, kể cả khi nó ghi tên một admin trong header.

Workspace chưa có thiết lập nào được coi là đang bật, nên các workspace hiện có vẫn hoạt động bình thường. Khi workspace bị tắt, endpoint công khai từ chối mọi credential của workspace đó với `403 {"error":"workspace_inactive"}`. Key không bị thu hồi: chúng dùng lại được ngay khi quyền truy cập được bật lại. Mỗi lần thay đổi đều được ghi vào log của gateway và nhật ký audit. Việc lưu các thiết lập khác của workspace không bao giờ thay đổi cờ này, nên chỉ route này, công tắc trong console và `dewee mcp activate|deactivate` mới đổi được nó.

### Kiểm tra kết nối

`POST /v1/mcp/public/diagnose` với `{"token": "<mcp-api-key>", "agent": "<agent-key>", "call_tool": false}` kiểm tra một key mà không cần cấu hình client. Thành viên nào của workspace cũng chạy được; `call_tool: true` cần vai trò operator trở lên. Gateway chạy bước bắt tay MCP và liệt kê tool, và với `call_tool` thì gọi thêm tool chỉ đọc đầu tiên. Bài kiểm tra chạy bên trong gateway, qua đúng endpoint mà client dùng, nên không thể trỏ nó sang host khác. Phản hồi luôn là `200`, gồm `ok`, `stage` đã tới, `result`, `message`, `next_action`, `tool_count` và `latency_ms`:

| `result` | Ý nghĩa |
|---|---|
| `ok` | Mọi bước đều qua |
| `endpoint_disabled` | Runtime không phục vụ endpoint công khai |
| `workspace_inactive` | Quyền truy cập MCP công khai đang tắt cho workspace này |
| `key_rejected` | Key không tồn tại, đã thu hồi hoặc hết hạn, hoặc là key của workspace khác |
| `missing_mcp_scope` | Key không có scope `mcp.*` |
| `owner_binding` | Key không có owner, hoặc owner đã rời workspace |
| `agent_not_found` | Không có agent nào khớp với agent được yêu cầu |
| `rate_limited` | Đã dùng hết giới hạn của endpoint, hoặc hết lượt kiểm tra thất bại của chính bạn |
| `tool_error` | Kết nối được nhưng lời gọi tool đọc thất bại |
| `internal` | Phản hồi ngoài dự kiến |

Key được kiểm tra không bao giờ bị ghi log, trả ngược lại hay lưu trữ. Key của workspace khác chỉ nhận `key_rejected`, và không tool nào chạy dưới key đó. Mỗi bên gọi chỉ được 10 lần kiểm tra thất bại mỗi phút, nên không thể dùng route này để dò key.

### Giới hạn, hạn mức và thu hồi key

Mỗi credential được gửi 120 request mỗi phút (tối đa 20 request dồn một lúc) và chạy 4 lời gọi tool cùng lúc, mỗi lời gọi có hạn 60 giây. Body request tối đa 1 MiB. Vượt giới hạn, endpoint trả `429`; body vượt mức tối đa nhận `413`. Server dùng transport Streamable HTTP không trạng thái của MCP `2026-07-28`, và client cũ hơn sẽ tự thương lượng xuống phiên bản thấp hơn. Client HTTP chung được kiểm thử tự động; Claude Code, Cursor, VS Code với Copilot và Gemini CLI đã được kiểm tra thủ công.

Ngoài ngân sách của từng credential, mỗi workspace còn có một ngân sách chung cho mọi key của nó, nên thêm key không bao giờ nâng được mức trần của workspace:

| Thiết lập | Biến môi trường | Mặc định |
|---|---|---|
| `tools.mcp.public.tenant_requests_per_minute` | `GOCLAW_MCP_PUBLIC_TENANT_REQUESTS_PER_MINUTE` | 600 request mỗi phút, tối đa 100 request dồn một lúc |
| `tools.mcp.public.tenant_max_concurrent_tool_calls` | `GOCLAW_MCP_PUBLIC_TENANT_MAX_CONCURRENT_TOOL_CALLS` | 16 lời gọi tool cùng lúc |

`0` nghĩa là dùng giá trị mặc định, còn giá trị âm khiến gateway không khởi động được. Ngân sách của workspace được tính riêng cho `/mcp/server` và `/mcp/workspace`, và riêng trong từng tiến trình gateway. `dewee mcp status`, console và dashboard của gateway hiển thị nó ở dòng **Workspace limits**.

Khi ngân sách của workspace đã hết, endpoint trả `429` với một trong các mã sau:

| Mã | Ý nghĩa | `Retry-After` |
|---|---|---|
| `tenant_rate_limited` | Các key của workspace cộng lại đã gửi quá nhiều request trong phút này | `60` |
| `tenant_too_many_concurrent_calls` | Các key của workspace cộng lại đang chạy số lời gọi tool tối đa | `5` |

Giảm tốc một key không giải quyết được, vì giới hạn này áp cho mọi key của workspace. Hãy đợi theo `Retry-After`, giãn công việc của các client ra theo thời gian, hoặc nhờ người vận hành nâng giới hạn của workspace.

Một số tool đọc tiêu tốn hạn mức trả phí của chính workspace, ví dụ `web_search` dùng các nhà cung cấp tìm kiếm của workspace, nên hãy coi cả key chỉ đọc cũng có thể tiêu hạn mức đó.

Key đã thu hồi hoặc hết hạn thất bại ngay ở request kế tiếp, không có thời gian chờ cache. Key chỉ có scope MCP không tự quản lý được key, nên muốn thu hồi một key bị lộ cần chủ sở hữu hoặc admin, trên trang **API key & tài liệu** của console hoặc bằng một credential admin. Để ngắt mọi client của workspace cùng lúc mà không thu hồi key, hãy tắt quyền truy cập của workspace.

Nếu ai đó vẫn dùng một key sau khi bạn đã thu hồi, hoặc sau khi key hết hạn, mỗi lần thử vẫn chỉ nhận `401` bình thường (bên gọi không phân biệt được với một key chưa từng tồn tại), nhưng lần thử đó được ghi vào **Traces** của workspace trên kênh `mcp_public`, kèm lý do `credential_revoked` hoặc `credential_expired` cùng ID và prefix của key, không bao giờ ghi chính key. Xem trên trang Traces của console hoặc bằng `dewee traces list --channel mcp_public`.
