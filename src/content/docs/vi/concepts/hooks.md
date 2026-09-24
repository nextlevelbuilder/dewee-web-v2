---
title: Hook
description: Cách hook trong dewee cho phép, chặn hoặc quan sát agent tại bảy điểm trong lượt chạy, với handler HTTP, prompt, script, cơ chế fail-closed và nhật ký.
section: concepts
order: 11
updated: 2026-09-25
---

Hook cho phép bạn chạy các bước kiểm tra riêng tại những điểm cố định trong lượt chạy của agent, chẳng hạn trước khi tin nhắn của người dùng đi vào pipeline hoặc trước khi một tool được gọi. Hook có thể cho phép hoặc chặn bước đó, hoặc chỉ quan sát. Hook tác động lên những gì agent làm bên trong dewee. Để gửi yêu cầu vào dewee từ một hệ thống khác, hãy dùng [webhook đầu vào](/docs/api/webhooks-and-mcp).

## Sự kiện

| Sự kiện | Thời điểm | Có thể chặn |
|---|---|---|
| `session_start` | Khi bắt đầu mỗi lượt chạy agent, không chỉ lượt đầu tiên của session | Không |
| `user_prompt_submit` | Trước khi tin nhắn của người dùng đi vào pipeline | Có |
| `pre_tool_use` | Trước khi một tool được gọi, kể cả tool do node workflow gọi | Có |
| `post_tool_use` | Sau khi một lần gọi tool hoàn tất | Không |
| `stop` | Khi một lượt chạy agent kết thúc | Không |
| `subagent_start` | Trước khi bắt đầu giao việc cho một agent khác | Có |
| `subagent_stop` | Khi một lần giao việc hoàn tất hoặc thất bại | Không |

Với ba sự kiện có thể chặn, bước đó sẽ chờ các hook đưa ra quyết định. Hook trên các sự kiện còn lại chạy nền và chỉ có thể quan sát.

## Các loại handler

| Handler | Bản | Cách quyết định |
|---|---|---|
| `http` | Standard và Lite | Gửi sự kiện dạng JSON tới URL của bạn và đọc quyết định từ phản hồi |
| `prompt` | Standard và Lite | Hỏi một model, và model phải trả lời qua lệnh gọi tool `decide` |
| `script` | Standard và Lite | Chạy hàm ES5.1 `handle(event)` trong sandbox, mã nguồn tối đa 32 KiB |
| `command` | Chỉ Lite | Chạy một lệnh shell cục bộ, nhận sự kiện qua stdin. Mã thoát 2 là chặn, 0 là cho phép |

`command` bị từ chối trên bản Standard cả lúc lưu hook lẫn lúc hook chạy. Hook `command` chỉ nhận những biến môi trường bạn liệt kê. Handler `http` từ chối các địa chỉ loopback, link-local và mạng nội bộ.

Hook `prompt` chỉ thấy đầu vào của tool, được tách riêng khỏi phần hướng dẫn, và không bao giờ thấy tin nhắn gốc của người dùng. Nếu model trả lời bằng văn bản tự do thay vì gọi `decide`, kết quả được xử lý theo hướng chặn. Vì mỗi lần chạy đều tốn token, hook `prompt` bắt buộc phải có matcher hoặc `if_expr`.

Hook `script` có thể trả về `additionalContext`. Với một `user_prompt_submit` được cho phép, đoạn văn bản này được thêm vào system prompt của lượt đó. Script do bạn viết không thể thay đổi đầu vào. Chỉ hook dựng sẵn mới làm được, chẳng hạn `pii-redactor`, hook che địa chỉ email và số điện thoại, tắt mặc định.

## Phạm vi, độ ưu tiên và điều kiện khớp

| Phạm vi | Áp dụng cho | Người tạo |
|---|---|---|
| `global` | Mọi tenant | Chỉ nhà vận hành |
| `tenant` | Mọi agent trong một tenant | Quản trị viên tenant |
| `agent` | Các agent được chọn trong một tenant | Quản trị viên tenant |

Mọi hook khớp với một sự kiện chạy thành một chuỗi, theo `priority` từ cao xuống thấp, và nếu bằng nhau thì theo thứ tự tạo. Lần chặn đầu tiên sẽ kết thúc chuỗi. Có hai bộ lọc tuỳ chọn để thu hẹp thời điểm hook chạy:

- **`matcher`**, một biểu thức chính quy so với tên tool, chẳng hạn `^(exec|write_file)$`.
- **`if_expr`**, một biểu thức CEL trên `tool_name`, `tool_input` và `depth`, chẳng hạn `tool_name == "exec" && size(tool_input.cmd) > 80`.

## Quy tắc an toàn và giới hạn

- **Fail-closed.** Với sự kiện có thể chặn, một lỗi, một câu trả lời không đọc được hoặc việc hết ngân sách thời gian của chuỗi đều được tính là chặn. Khi hết thời gian chờ, hook làm theo `on_timeout`, mặc định là `block` với sự kiện có thể chặn.
- **Ngắt mạch.** Hook chặn hoặc hết thời gian chờ 5 lần trong vòng một phút sẽ bị tắt, và giữ nguyên trạng thái tắt cho tới khi có người bật lại.
- **Lồng nhau.** Chuỗi hook dừng ở độ sâu lồng nhau là 3, và các sự kiện sâu hơn bị từ chối.

| Giới hạn | Mặc định |
|---|---|
| Thời gian chờ mỗi hook | 5 giây (`timeout_ms`, tối đa 10 giây) |
| Toàn bộ chuỗi | 10 giây |
| Số lần gọi `prompt` | 5 lần mỗi lượt người dùng (`max_invocations_per_turn`) |
| Bộ nhớ đệm quyết định của `prompt` | 60 giây cho cùng hook, tool và đầu vào |
| Ngân sách token của `prompt` | 1.000.000 token mỗi tenant mỗi tháng trên bản Standard. Khi dùng hết, hook `prompt` sẽ chặn |
| `additionalContext` | 32 KiB mỗi hook và mỗi chuỗi |
| Phản hồi HTTP | 1 MiB |

## Giao ước của handler HTTP

dewee gửi một yêu cầu `POST` với phần thân là sự kiện dạng JSON. Các header bạn cấu hình, chẳng hạn `Authorization`, được lưu ở dạng mã hoá và chỉ được giải mã khi gửi yêu cầu. Yêu cầu thất bại, dù do mã lỗi hay lỗi mạng, được thử lại một lần sau 1 giây. Endpoint của bạn trả về:

```json
{
  "decision": "block",
  "additionalContext": "",
  "updatedInput": {},
  "continue": true
}
```

- **`decision`** là `allow` hoặc `block`, và được ưu tiên khi có mặt.
- **`continue`**, khi không có `decision`, sẽ chặn nếu đặt là `false`.
- Phần thân rỗng, hoặc phản hồi 2xx không phải JSON, sẽ cho phép bước đó.
- **`additionalContext`** và **`updatedInput`** được chấp nhận nhưng hiện chưa được áp dụng cho hook HTTP. Chỉ hook script mới thêm được ngữ cảnh, và chỉ hook dựng sẵn mới thay đổi được đầu vào.

> [!IMPORTANT]
> Một hook có thể chặn mà trỏ tới endpoint chậm hoặc hay lỗi sẽ chặn mọi bước khớp với nó. Hãy thử hook trước khi bật, và giữ `timeout_ms` thấp hơn nhiều so với ngân sách 10 giây của chuỗi.

## Nhật ký, span và console

Mỗi lần hook chạy được ghi vào nhật ký thực thi, kèm session, sự kiện, quyết định, thời lượng và lỗi nếu có. Nhật ký lưu mã hash của đầu vào chứ không lưu bản thân đầu vào. Nội dung lỗi được cắt còn 256 ký tự, còn chi tiết đầy đủ được lưu ở dạng mã hoá. Các mục nhật ký vẫn còn sau khi hook bị xoá.

Mỗi lần chạy cũng thêm một span `event` vào trace, có tên `hook.<handler>.<event>` (ví dụ `hook.http.pre_tool_use`), với quyết định nằm trong metadata.

Trang **Hook** trong console đang ở giai đoạn beta. Tại đây bạn tạo hook cấp tenant và cấp agent với handler `http`, `prompt` hoặc `script`, đặt độ ưu tiên và xem lịch sử chạy. Chạy thử kiểm tra hook với một sự kiện mẫu mà không ghi vào nhật ký, đồng thời che các giá trị trông giống secret. Hook global, hook dựng sẵn và hook `command` chỉ hiển thị ở chế độ chỉ đọc. CLI không có lệnh quản lý hook.

## Liên quan

- [Tool, MCP và hook trong console](/docs/console/tools-mcp-and-hooks): tạo và chạy thử hook.
- [Tool và quyền hạn](/docs/concepts/tools-and-permissions): cách quyền dùng tool được cấp và giới hạn.
- [Nhóm agent và giao việc](/docs/concepts/agent-teams): nơi `subagent_start` được kích hoạt.
- [Tracing và quan sát hệ thống](/docs/concepts/tracing): đọc span của hook trong trace.
- [Webhook và MCP](/docs/api/webhooks-and-mcp): gọi dewee từ hệ thống bên ngoài.
