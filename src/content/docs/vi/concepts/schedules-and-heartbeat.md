---
title: Lịch chạy và heartbeat
description: Cách dewee chạy agent theo lịch, từ cron job có cơ chế thử lại và lịch sử chạy tới checklist heartbeat, cùng cách tin nhắn xếp hàng dùng chung bộ lập lịch.
section: concepts
order: 9
updated: 2026-09-25
---

Agent trong dewee không nhất thiết phải chờ có người nhắn tin. Một cron job chạy một lượt agent hoặc một workflow vào thời điểm định sẵn hoặc theo chu kỳ. Heartbeat đánh thức agent theo một khoảng thời gian cố định để nó tự rà soát checklist của mình. Cả hai đều đi qua cùng bộ lập lịch xếp hàng tin nhắn chat, nên việc chạy theo lịch không va chạm với các cuộc hội thoại đang diễn ra.

## Cron job và các loại lịch

Mỗi cron job thuộc về một agent, gồm một lịch và một payload. Bộ lập lịch kiểm tra job đến hạn mỗi giây.

| Loại | Chạy | Giá trị `--schedule` |
|---|---|---|
| `at` | Một lần, tại một thời điểm | `at:2026-10-01T09:00:00+07:00` |
| `every` | Theo chu kỳ cố định | `@every 30m` hoặc `every:30m` |
| `cron` | Theo biểu thức cron | `0 9 * * 1-5` |

Bạn cũng có thể truyền lịch dưới dạng JSON, và đây là cách đặt múi giờ riêng cho một job: `{"kind":"cron","expr":"0 9 * * 1-5","tz":"Asia/Ho_Chi_Minh"}`. Biểu thức cron không có `tz` dùng `default_timezone` của gateway.

Payload quyết định lượt chạy làm gì. `agent_turn` gửi tin nhắn của job tới agent như một lượt bình thường. `workflow_run` khởi chạy một workflow với đầu vào bạn cung cấp, và workflow đó phải đang bật. Job còn có thể kèm các tuỳ chọn sau:

| Tuỳ chọn | Tác dụng |
|---|---|
| `deliver`, `deliverChannel`, `deliverTo` | Gửi kết quả tới một kênh và cuộc chat. Nếu không đặt, kết quả chỉ nằm trong lịch sử chạy |
| `stateless` | Chạy mà không giữ trạng thái session |
| `wakeHeartbeat` | Đánh thức heartbeat của agent khi job chạy xong |
| `deleteAfterRun` | Xoá job sau khi đã chạy |

Nếu câu trả lời của agent chứa từ `NO_REPLY`, lượt chạy đó sẽ không gửi kết quả đi.

## Thử lại, thời gian chờ và lịch sử chạy

Phần `cron` trong cấu hình gateway đặt các giá trị mặc định sau:

| Thiết lập | Mặc định |
|---|---|
| `max_retries` | Thử lại tối đa 3 lần sau lần chạy đầu (0 là tắt thử lại) |
| `retry_base_delay` | 2 giây, tăng gấp đôi sau mỗi lần |
| `retry_max_delay` | 30 giây, dao động ±25% |
| `job_timeout` | 10 phút mỗi lượt chạy |
| `default_timezone` | Tên múi giờ IANA cho biểu thức cron không có `tz` riêng |

Mỗi lượt chạy được ghi lại cùng trạng thái, lỗi nếu có, bản tóm tắt kết quả, thời lượng và số token. `dewee cron runs` cho phép xem lần lượt lịch sử đó.

```bash
dewee cron create --name morning-brief --agent <agent-id> --schedule "0 8 * * 1-5" --message "Summarise overnight tickets" --deliver --channel telegram --to <chat-id>
dewee cron create --name order-sweep --agent <agent-id> --schedule "@every 1h" --workflow order-check --input region=south
dewee cron list --all
dewee cron run morning-brief --force
dewee cron runs morning-brief --limit 50
dewee cron toggle <job-id> false
```

`--force` chạy job ngay cả khi chưa đến hạn.

## Hàng đợi session và các lane

Mọi lượt chạy của agent đều đi qua bộ lập lịch, và tin nhắn gửi tới một session sẽ chờ trong hàng đợi của session đó. Session DM chạy từng lượt một, còn session nhóm chạy từ ba lượt trở lên cùng lúc. Khi lịch sử của session vượt quá 60% cửa sổ ngữ cảnh của model, số lượt chạy đồng thời giảm về một.

| Thiết lập hàng đợi | Mặc định | Ý nghĩa |
|---|---|---|
| `mode` | `queue` | `queue` và `followup` chờ tới lượt; `interrupt` huỷ lượt đang chạy và bắt đầu tin nhắn mới |
| `cap` | 10 | Số tin nhắn giữ lại mỗi session |
| `drop` | `old` | Khi đầy, `old` bỏ tin nhắn cũ nhất, còn `new` từ chối tin nhắn mới đến |
| `debounce_ms` | 800 | Các tin nhắn gửi liên tiếp nhanh được gộp thành một lượt |

Trong cuộc chat, `/stop` huỷ lượt đang chạy lâu nhất, còn `/stopall` huỷ tất cả và làm trống hàng đợi.

Trên toàn gateway, các lượt chạy được chia thành lane để loại việc này không chiếm hết tài nguyên của loại việc khác: `main` cho phép 30 lượt cùng lúc, `subagent` 50, `team` 100 và `cron` 30. Cả cron job lẫn heartbeat đều dùng lane `cron`.

## Heartbeat

Heartbeat là một lần kiểm tra định kỳ. Mỗi agent có thể có một heartbeat, chạy theo checklist `HEARTBEAT.md` nằm trong các file ngữ cảnh của nó. Bạn thiết lập heartbeat ở tab **Heartbeat** trên trang của agent trong console, bằng CLI, hoặc qua tool `heartbeat` của chính agent.

| Thiết lập | Mặc định |
|---|---|
| Chu kỳ | 1.800 giây, tối thiểu 300 |
| Session riêng | Bật, nên mỗi lượt bắt đầu từ đầu và session bị xoá sau đó |
| Ngữ cảnh rút gọn | Tắt. Khi bật, chỉ checklist được nạp, không nạp các file ngữ cảnh khác |
| Thử lại | 2 lần (từ 0 đến 10), chờ 1 giây rồi 2 giây |
| Giờ hoạt động | Không đặt, nên chạy suốt ngày đêm. Đặt giờ bắt đầu và kết thúc dạng HH:MM theo một múi giờ IANA (mặc định UTC); khung giờ có thể vắt qua nửa đêm |
| Nơi gửi | Một kênh và chat ID; `dewee heartbeat targets` liệt kê các cuộc chat agent đang dùng |

Gateway kiểm tra heartbeat đến hạn mỗi 30 giây. Một lượt bị bỏ qua khi nằm ngoài giờ hoạt động, khi agent đang bận việc khác, hoặc khi `HEARTBEAT.md` trống hay không tồn tại. Agent đang bận sẽ được thử lại ở lần kiểm tra kế tiếp. Khi heartbeat được bật lần đầu, thời điểm bắt đầu được lùi thêm tối đa 10% chu kỳ, để các agent có cùng chu kỳ không chạy đồng loạt.

Nếu câu trả lời chứa `HEARTBEAT_OK`, lượt chạy được ghi là đã chặn gửi và không có gì được gửi đi. Ngược lại, câu trả lời được gửi tới cuộc chat đã cấu hình. Heartbeat cũng có thể được đánh thức sớm bằng nút **Test** trong console, khi agent gọi tool `heartbeat` với thao tác `test`, hoặc bởi một cron job có `wakeHeartbeat`.

```bash
dewee heartbeat get <agent-id>
dewee heartbeat set <agent-id> --enabled --interval-sec 3600 --timezone Asia/Ho_Chi_Minh
dewee heartbeat test <agent-id>
dewee heartbeat logs <agent-id> --limit 50
dewee heartbeat targets <agent-id>
dewee heartbeat toggle <agent-id> --enabled=false
```

## Heartbeat hay cron?

| | Heartbeat | Cron job |
|---|---|---|
| Phù hợp cho | Kiểm tra định kỳ mà phần lớn thời gian không có gì để báo | Mọi tác vụ hay workflow chạy theo lịch |
| Mỗi agent | Một | Nhiều |
| Lịch | Chu kỳ cố định, tối thiểu 5 phút | `at`, `every` hoặc biểu thức cron |
| Hướng dẫn | `HEARTBEAT.md` | Tin nhắn lưu trong job |
| Lượt không cần báo | `HEARTBEAT_OK` chặn việc gửi | `NO_REPLY` chặn việc gửi |
| Giờ hoạt động | Có sẵn | Không có sẵn |
| Khi agent bận | Bỏ qua và thử lại sau | Vẫn chạy |
| Thử lại | Mặc định 2 lần, cách nhau 1 đến 2 giây | Mặc định 3 lần, cách nhau 2 đến 30 giây |
| Đổi model riêng | Có | Không |

## Liên quan

- [Lịch chạy và workflow trong console](/docs/console/schedules-and-workflows): tạo job và xem lịch sử chạy.
- [Workflow](/docs/concepts/workflows): những gì một job `workflow_run` khởi chạy.
- [Vòng lặp agent](/docs/concepts/agent-loop): điều gì diễn ra trong mỗi lượt chạy theo lịch.
- [Tracing và quan sát hệ thống](/docs/concepts/tracing): xem chi tiết một lượt chạy theo lịch.
- [Tham chiếu CLI](/docs/runtime/cli): toàn bộ lệnh `dewee cron` và `dewee heartbeat`.
