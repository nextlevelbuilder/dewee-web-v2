---
title: Vòng lặp agent
description: Cách dewee biến một tin nhắn thành câu trả lời qua chu trình suy nghĩ, hành động, quan sát, cùng giới hạn, prompt mode, file ngữ cảnh và bước dọn dẹp.
section: concepts
order: 1
updated: 2026-09-25
---

Mọi lượt chạy của agent trong dewee đều đi theo cùng một vòng lặp. Runtime dựng prompt, hỏi model cần làm gì, chạy các tool mà model yêu cầu, đưa kết quả trở lại cho model, rồi lặp lại cho tới khi model đưa ra câu trả lời cuối cùng hoặc chạm giới hạn. Trang này giải thích từng giai đoạn, các giá trị mặc định giới hạn chúng, và những gì bạn có thể điều khiển khi một lượt chạy đang diễn ra.

## Suy nghĩ, hành động, quan sát

Một lượt chạy gồm một bước chuẩn bị, một vòng lặp và một bước kết thúc.

| Giai đoạn | Khi nào | Việc thực hiện |
|---|---|---|
| Context | Một lần, lúc bắt đầu | Xác định agent, người dùng, thư mục workspace và các file ngữ cảnh cho cuộc hội thoại này. |
| Think | Mỗi vòng lặp | Dựng system prompt, lọc danh sách tool qua chính sách và vai trò, rồi gọi model. |
| Prune | Mỗi vòng lặp | Giữ lịch sử hội thoại trong ngân sách ngữ cảnh (xem bên dưới). |
| Tool | Mỗi vòng lặp | Chạy các lệnh gọi tool mà model trả về. |
| Observe | Mỗi vòng lặp | Thêm kết quả tool vào cuộc hội thoại. |
| Checkpoint | Mỗi vòng lặp | Đếm số vòng và dừng khi chạm mức trần hoặc khi lượt chạy bị huỷ. |
| Finalize | Một lần, lúc kết thúc | Làm sạch output, lưu toàn bộ tin nhắn trong một lần ghi và cập nhật metadata của session. |

Nếu model trả lời mà không gọi tool nào, vòng lặp kết thúc và câu trả lời được gửi đi.

## Giới hạn và giá trị mặc định

| Thiết lập | Mặc định | Ghi chú |
|---|---|---|
| Số vòng lặp tối đa | 30 | Ghi đè theo từng agent bằng `max_tool_iterations`, hoặc theo từng request. |
| Context window | 200.000 token | Theo từng agent. |
| Token đầu ra (`max_tokens`) | 8.192 | Theo từng agent. |
| Temperature | 0,7 | Theo từng agent. |
| Độ dài tin nhắn (`max_message_chars`) | 32.000 ký tự | Tin nhắn dài hơn bị cắt bớt và model được báo điều đó; tin nhắn không bao giờ bị từ chối. |
| Kết quả tool lớn | 48.000 ký tự | Kết quả dài hơn được ghi ra một file trong workspace, cuộc hội thoại chỉ giữ bản xem trước 3.000 ký tự. |

## Cách tool được chạy

Khi model yêu cầu nhiều tool cùng lúc, dewee chạy song song các tool chỉ đọc trong một nhóm luồng có giới hạn, rồi xử lý kết quả theo đúng thứ tự model đã yêu cầu. Những gì có thể thay đổi trạng thái đều chạy lần lượt từng lệnh: `exec`, ghi file và các tool thay đổi dữ liệu khác, tool bất đồng bộ, tool MCP, `wait`, và mọi tool mà runtime không nhận ra. Một [hook](/docs/concepts/hooks) `pre_tool_use` chạy trước tool và có thể chặn nó.

## System prompt

### Prompt mode

Mỗi agent có một prompt mode (`prompt_mode` trong `other_config` của agent) quyết định agent nhận được bao nhiêu phần của system prompt.

| Mode | Dùng cho |
|---|---|
| `full` | Agent hội thoại chính. Đủ mọi phần. Đây là mặc định. |
| `task` | Tự động hoá gọn nhẹ nhưng vẫn cần tìm skill, bộ nhớ và tool. |
| `minimal` | Các lượt chạy ngắn, đơn giản, với ít phần hơn. |
| `none` | Chỉ một dòng giới thiệu danh tính. |

dewee xác định mode theo thứ tự: giá trị ghi đè lúc chạy cho request được ưu tiên nhất; lượt chạy heartbeat bị giới hạn ở `minimal`; lượt chạy của sub-agent và cron bị giới hạn ở `task`; tiếp đến là thiết lập của chính agent; cuối cùng là `full`. Mức giới hạn chỉ hạ mode xuống, không bao giờ nâng lên.

### File ngữ cảnh

Prompt chứa các file ngữ cảnh của agent: `AGENTS.md`, `SOUL.md`, `IDENTITY.md`, `TOOLS.md`, `USER.md`, `BOOTSTRAP.md` và `USER_PREDEFINED.md`, cộng thêm các file được sinh tự động như `DELEGATION.md` và `TEAM.md` khi agent có thể giao việc hoặc thuộc một nhóm. Một file an toàn nền tảng được nạp ở mọi mode trừ `none`. Mode càng thấp thì càng nạp ít file.

Mỗi file tối đa 20.000 ký tự, tổng tất cả các file tối đa 24.000 ký tự. File vượt mức giữ lại 70% phần đầu và 20% phần cuối, ở giữa có một dấu đánh dấu nhắc model đọc bản đầy đủ.

### Agent predefined và agent open

- Agent **predefined** dùng chung một persona cho mọi người dùng: `AGENTS.md`, `SOUL.md`, `IDENTITY.md` và `USER_PREDEFINED.md` nằm ở cấp agent, còn mỗi người dùng có `USER.md` riêng.
- Agent **open** giữ trọn bộ file ngữ cảnh riêng cho từng người dùng, được tạo từ template ở lần chat đầu tiên.

Hãy dùng agent predefined cho bàn hỗ trợ khách hàng và trợ lý dùng chung; dùng agent open khi mỗi người cần tự định hình trợ lý của riêng mình.

## Giữ ngữ cảnh trong ngân sách

- **Cắt gọn kết quả tool** (tuỳ chọn bật, `contextPruning.mode: "cache-ttl"`). Khi vượt 25% ngữ cảnh, các kết quả tool cũ bị rút gọn chỉ còn phần đầu và phần cuối; vượt 50%, các kết quả lớn bị thay bằng một đoạn giữ chỗ (placeholder). Tin nhắn hệ thống, tin nhắn đầu tiên của người dùng và ba câu trả lời gần nhất của agent không bao giờ bị cắt.
- **Nén giữa vòng lặp.** Runtime chừa lại 20.000 token và nén lịch sử khi nó vượt 85% ngân sách còn lại. Model viết bản tóm tắt trong vòng 30 giây; nếu không kịp, một cơ chế dự phòng cố định sẽ giữ lại bản tóm tắt sẵn có, các nhóm lệnh gọi tool hoàn chỉnh và những tin nhắn mới nhất.
- **Tóm tắt sau lượt chạy.** Sau mỗi lượt chạy, session có hơn 50 tin nhắn hoặc dùng quá 75% ngữ cảnh sẽ được tóm tắt ở chế độ nền. Bốn tin nhắn cuối được giữ nguyên.
- **Ghi bộ nhớ trước khi tóm tắt.** Trước bản tóm tắt đó, agent có một lượt ngắn (tối đa 5 vòng lặp, 90 giây) để lưu các ghi chú lâu dài vào `memory/YYYY-MM-DD.md`. Phần này được cấu hình trong `compaction.memory_flush`. Xem [Bộ nhớ và kho tri thức](/docs/concepts/memory-and-knowledge).

## Dừng và theo dõi lượt chạy

- **Dừng.** Trong một kênh chat, `/stop` huỷ tác vụ đang chạy lâu nhất trong session, còn `/stopall` huỷ tất cả và xoá hàng đợi. Trace vẫn được lưu lại.
- **Sự kiện stream.** Client dùng WebSocket API nhận `run.started`, `activity`, `tool.call`, `tool.result`, `block.reply`, `run.retrying`, sau đó là `run.completed`, `run.failed` hoặc `run.cancelled`; nội dung trả lời tới dưới dạng các sự kiện chat `chunk` và `thinking`.
- **Input guard.** Mỗi tin nhắn đến được đối chiếu với sáu mẫu prompt injection. Hành động được đặt bằng `gateway.injection_action`: `off`, `log`, `warn` (mặc định) hoặc `block`. Chỉ `block` mới chặn tin nhắn trước khi nó tới model.

> [!NOTE]
> Mỗi vòng lặp được ghi thành các span trong trace: lệnh gọi model, lệnh gọi tool, số token và chi phí. Xem [Tracing và quan sát hệ thống](/docs/concepts/tracing).

## Liên quan

- [Agent trong console](/docs/console/agents): nơi bạn tạo agent, chọn model và viết hướng dẫn cho agent.
- [Chat và session](/docs/console/chat-and-sessions): session, lịch sử và dừng lượt chạy.
- [Tool và quyền hạn](/docs/concepts/tools-and-permissions): những gì giai đoạn Tool được phép chạy.
- [Provider, fallback và suy luận](/docs/concepts/providers-and-routing): điều gì xảy ra khi lệnh gọi model thất bại.
- [Mô hình bảo mật](/docs/security/overview): input guard trong bức tranh chung.
- [Tổng quan API](/docs/api/overview): các endpoint chat và sự kiện WebSocket.
