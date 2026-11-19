---
title: Nhóm agent và giao việc
description: Cách agent trong dewee chuyển việc cho nhau, từ tự nhân bản, giao việc qua liên kết, tới vận hành một nhóm có trưởng nhóm, thành viên và bảng task chung.
section: concepts
order: 8
updated: 2026-09-25
---

Một agent không phải tự làm mọi việc. Agent trong dewee có thể tự nhân bản để xử lý việc phụ, giao việc cho một agent khác mà nó được liên kết tới, hoặc dẫn dắt một nhóm dùng chung bảng task. Agent làm được điều nào tuỳ thuộc vào cách nó được thiết lập, chứ không phải một công tắc trong prompt.

## Ba chế độ điều phối

| Chế độ | Khi nào áp dụng | Tool agent nhận được |
|---|---|---|
| `spawn` | Agent không có liên kết uỷ quyền và không thuộc nhóm nào | `spawn` |
| `delegate` | Agent có ít nhất một liên kết uỷ quyền | `spawn`, `delegate` |
| `team` | Agent thuộc một nhóm | `spawn`, `delegate`, `team_tasks` |

dewee xác định chế độ dựa trên thiết lập của agent, xét nhóm trước, rồi tới liên kết uỷ quyền, sau cùng là spawn. Các tool không hợp với chế độ bị ẩn đi, nên model không mất lượt để thử chúng.

## Spawn: tự nhân bản agent

`spawn` khởi tạo một sub-agent là bản sao của chính agent đang gọi, với một nhiệm vụ cụ thể và bộ tool thu gọn. Nó không thể nhắm tới một agent khác. Các thao tác gồm `spawn`, `list`, `cancel`, `steer` (gửi hướng dẫn mới) và `wait`. Mặc định spawn chạy bất đồng bộ và báo lại khi xong; `mode: "sync"` sẽ chờ tới khi hoàn tất.

| Mặc định | Giá trị |
|---|---|
| Số sub-agent chạy cùng lúc | 8 (bản Lite là 2) |
| Độ sâu spawn | 1, nên sub-agent không thể spawn tiếp |
| Số sub-agent con mỗi agent | 5 |
| Sub-agent đã xong được lưu trữ sau | 60 phút |

## Giao việc qua liên kết agent

Liên kết agent cho phép một agent giao việc cho agent khác. Liên kết có hướng, thuộc về tenant và có thể có danh sách người dùng được phép và bị chặn riêng. Tool `delegate` nhận `agent_key` của agent đích, `task` và `mode`:

- **async** (mặc định) trả về ngay. Agent đích chạy nền trong tối đa 10 phút, và kết quả được gửi lại vào đúng cuộc hội thoại ban đầu, kể cả forum topic trên Telegram.
- **sync** chờ lấy kết quả. Thời gian chờ mặc định là 300 giây, tối đa 600 giây.

Mỗi lần giao việc chạy trong một session riêng. Trace của nó ghi lại trace cha (`parent_trace_id`), nên bạn có thể theo dõi một yêu cầu từ người dùng, qua trưởng nhóm, tới thành viên trong màn hình trace. Một hook `subagent_start` có thể chặn việc giao trước khi nó bắt đầu.

## Nhóm: trưởng nhóm và thành viên

Một nhóm có một agent trưởng nhóm và một hoặc nhiều thành viên. Khi tạo nhóm, trưởng nhóm được tự động liên kết tới từng thành viên. Chỉ trưởng nhóm nhận hướng dẫn điều phối `TEAM.md`; thành viên tìm hiểu những gì cần thiết qua tool, nhờ đó prompt của họ gọn nhẹ. Thành viên trao đổi với nhau và với trưởng nhóm qua bình luận trên task. Hộp thư nhóm trước đây đã bị gỡ bỏ.

Thiết lập của nhóm có thể giới hạn người dùng và kênh nào được kích hoạt công việc của nhóm, trong đó danh sách chặn được ưu tiên hơn danh sách cho phép. Bản Lite cho phép một nhóm với tối đa 5 thành viên, và bảng task của bản này không có bình luận, xét duyệt, phê duyệt, đính kèm và `ask_user`.

## Bảng task

Mọi phần việc của nhóm là một task, và mỗi task đều cần người được giao. Agent phải tìm trên bảng trước khi tạo task mới, để hai session không tạo trùng cùng một việc.

| Trạng thái | Ý nghĩa |
|---|---|
| `pending` | Sẵn sàng để nhận |
| `blocked` | Đang chờ các task trong danh sách `blocked_by` |
| `in_progress` | Đã có thành viên nhận |
| `in_review` | Đang chờ một người phê duyệt hoặc từ chối |
| `completed`, `failed`, `cancelled` | Đã kết thúc |
| `stale` | Bị kẹt, và được cơ chế khôi phục xử lý |

Tool `team_tasks` gồm các thao tác `create`, `claim`, `complete`, `cancel`, `review`, `approve`, `reject`, `comment`, `progress`, `attach`, `search`, `list`, `get`, `update`, `retry`, `ask_user` và `clear_ask_user`. Quản trị viên còn có thể giao task từ console.

- **Nhận việc nguyên tử.** Thao tác nhận việc chỉ thành công khi task vẫn đang chờ và chưa có ai nhận, nên hai thành viên không bao giờ cùng giữ một task.
- **Phụ thuộc.** Khi mọi task trong `blocked_by` đã hoàn thành hoặc bị huỷ, task phụ thuộc chuyển sang `pending` và được điều phối.
- **Con người xét duyệt.** Task tạo với `require_approval` chuyển sang `in_review` khi thành viên nộp, và một người phê duyệt hoặc từ chối trong console. Từ chối sẽ huỷ task và báo cho trưởng nhóm.
- **Báo vướng mắc.** Khi thành viên đăng một bình luận loại `blocker`, task bị đánh dấu thất bại, và trưởng nhóm nhận thông báo kèm lý do cùng lời nhắc thử lại. Tính năng này bật sẵn và có thể tắt theo từng nhóm bằng `blocker_escalation`.

Khi thành viên hoàn thành task, các file nó đã ghi được gắn vào task, và những task vừa hết bị chặn được điều phối.

## An toàn khi điều phối và workspace của nhóm

Task tạo trong lượt của trưởng nhóm được điều phối sau khi lượt đó kết thúc, để các phụ thuộc được thiết lập trước. Nhiều lớp bảo vệ ngăn vòng lặp mất kiểm soát:

| Lớp bảo vệ | Cách hoạt động |
|---|---|
| Không tự giao | Task giao cho chính trưởng nhóm bị đánh dấu thất bại |
| Ngắt mạch | Task thất bại sau 3 lần điều phối |
| Hạn mức thử lại | Thử lại chỉ được đặt lại số lần điều phối tối đa 3 lần cho mỗi cặp task và người được giao; giao cho người khác sẽ bắt đầu hạn mức mới |
| Quét khôi phục | Task kẹt ở `pending` được phát hiện định kỳ, và trưởng nhóm được nhắc thử lại |

Mỗi nhóm có một workspace chứa file do các thành viên tạo ra. Phạm vi mặc định là `isolated`, mỗi cuộc hội thoại một thư mục, hoặc `shared`, cả nhóm dùng chung một thư mục. Mỗi phạm vi chứa tối đa 100 file, mỗi file tối đa 50 MB.

Console và API nhận các sự kiện trực tiếp `delegation.*` và `team.task.*`, nên bảng task cập nhật ngay khi công việc tiến triển.

## Liên quan

- [Nhóm agent trong console](/docs/console/agent-teams): tạo nhóm và xem xét task.
- [Tool và quyền hạn](/docs/concepts/tools-and-permissions): những tool sub-agent không được dùng.
- [Hook](/docs/concepts/hooks): cho phép hoặc chặn một lần giao việc trước khi bắt đầu.
- [Tracing và quan sát hệ thống](/docs/concepts/tracing): theo dõi một yêu cầu qua nhiều agent.
- [Workflow](/docs/concepts/workflows): quy trình nhiều bước cố định thay cho làm việc nhóm linh hoạt.
