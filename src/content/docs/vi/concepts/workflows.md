---
title: Workflow
description: Cách workflow trong dewee chạy một chuỗi bước cố định theo cùng một cách mỗi lần, cách bản nháp được xuất bản thành phiên bản, cùng giới hạn và cơ chế thử lại.
section: concepts
order: 7
updated: 2026-09-25
---

Workflow là một đồ thị các bước cố định mà dewee chạy theo cùng một cách mỗi lần. Hãy dùng workflow khi một quy trình không được phép bỏ sót bước nào, chẳng hạn kiểm tra đơn hàng trước khi trả lời, hoặc duyệt bài trước khi đăng. Model chỉ làm việc bên trong các node có giới hạn rõ ràng, còn đồ thị quyết định bước tiếp theo. Workflow đang ở giai đoạn beta.

## Cấu trúc của một workflow

Workflow là một đồ thị có hướng không chu trình (DAG) gồm các node và cạnh, thuộc về một tenant. Phần định nghĩa khai báo schema đầu vào, schema đầu ra, các node, các cạnh nối giữa chúng và các trigger tuỳ chọn. Có 15 loại node:

| Nhóm | Node | Tác dụng |
|---|---|---|
| Điều khiển | `start`, `end`, `condition`, `transform`, `compare`, `approval` | Nhận đầu vào, trả đầu ra, rẽ nhánh, định dạng lại dữ liệu, so sánh giá trị và tạm dừng chờ người duyệt |
| Năng lực | `agent`, `task_create` | Chạy một lượt model có giới hạn, hoặc tạo công việc |
| Tri thức và dữ liệu | `vault_search`, `kg_query`, `storage_read`, `storage_write` | Truy vấn kho tri thức và knowledge graph, đọc và ghi vào kho lưu trữ của tenant |
| Gửi đi và tool | `deliver`, `deliver_multi`, `mcp_tool` | Gửi tới một hoặc nhiều kênh, gọi một tool MCP |

- **`agent`** chạy một lượt model duy nhất và phải trả về JSON khớp với `output_schema`. Thời gian chờ mặc định là 120 giây.
- **`condition`** tính một biểu thức CEL và có đúng hai cạnh đi ra, `true` và `false`.
- **`approval`** tạm dừng lượt chạy ở trạng thái `waiting_approval` cho tới khi có người quyết định, mặc định tối đa 3.600 giây.
- **`mcp_tool`** ở trạng thái tắt cho tới khi người vận hành thêm server và tool vào danh sách MCP được phép dùng trong workflow của tenant.

Chỉ các node tất định `condition`, `transform` và `compare` mới được ghi vào trạng thái của lượt chạy. Node model thì không, nên nó không thể tự bật một bước kiểm tra như "đã xác minh".

## Bản nháp, xuất bản và phiên bản

Bạn chỉnh sửa bản nháp, kiểm tra hợp lệ rồi chạy thử. Lần chạy thử giả lập mọi node có thể làm thay đổi dữ liệu, và trace của nó được gắn thẻ `dry_run`. Khi xuất bản, bản nháp trở thành một phiên bản có đánh số và không thể sửa, và mọi lượt chạy luôn dùng phiên bản đã xuất bản. Bạn có thể quay về phiên bản trước.

Lúc xuất bản, dewee lưu kèm quyền dùng tool của agent tạo ra workflow. Những thay đổi sau đó trên agent này không thể mở rộng những gì phiên bản đã xuất bản được phép làm.

Quản trị viên hoặc chủ sở hữu tenant có thể xuất bản trực tiếp. Những người khác, kể cả agent, sẽ tạo một yêu cầu xuất bản. Chỉ một quản trị viên là người thật, khác với người gửi yêu cầu, mới được duyệt, và chỉ khi bản nháp vẫn khớp với bản đã gửi. Nếu bản nháp đã thay đổi trong lúc chờ, yêu cầu duyệt bị từ chối.

## Lượt chạy và trigger

| Trạng thái | Ý nghĩa |
|---|---|
| `queued` | Đang chờ worker |
| `running` | Đang chạy các node |
| `waiting_approval` | Tạm dừng ở một node `approval` |
| `succeeded`, `failed`, `cancelled` | Đã kết thúc |

Một lượt chạy bắt đầu từ một trong bốn trigger:

- **manual**, từ console, CLI hoặc API. Lượt chạy thủ công vẫn hoạt động khi workflow đang tắt.
- **cron**, từ một lịch chạy có loại payload là `workflow_run`.
- **agent_tool**, khi agent gọi tool `workflow`.
- **channel_event**, khi một tin nhắn đến từ kênh khớp với một trigger `channel_inbound` trong định nghĩa. Mỗi trigger chỉ định một kênh và một biểu thức CEL để so khớp.

Mọi trigger, trừ manual, đều cần workflow đang bật.

## Giới hạn và thử lại

| Giới hạn | Giá trị |
|---|---|
| Số node mỗi workflow | 100 |
| Số cạnh mỗi workflow | 200 |
| Kích thước định nghĩa | 256 KiB |
| Số trigger mỗi workflow | 3 |
| Workflow được khởi chạy bởi workflow khác | Tối đa 3 cấp; workflow không thể tự khởi chạy chính nó |

Một node thất bại có mặc định 3 lần thử (`settings.max_attempts_default`, hoặc `max_attempts` trên từng node). Thời gian chờ bắt đầu từ 1 giây và tăng gấp đôi tới tối đa 60 giây. Chỉ lỗi hết thời gian chờ, lỗi provider và lỗi tạm thời mới được thử lại. Trước khi một node gửi tin nhắn, ghi vào kho lưu trữ hay tạo công việc, dewee lưu một khoá idempotency, nên việc thử lại hay khởi động lại không lặp lại tác động đó. Một lượt chạy thất bại cũng có thể được chạy lại từ một node bạn chọn.

## Những gì workflow không làm

- Không có node exec hay node script. Workflow chỉ dùng các node của dewee và các tool MCP được phép.
- Không có vòng lặp và không chạy song song nhiều nhánh. Cách rẽ nhánh duy nhất là qua `condition`.
- Webhook công khai từ bên ngoài không thể khởi chạy workflow.
- Bản Lite tạo và chỉnh sửa được workflow nhưng không chạy chúng.

## Agent, tracing và CLI

Agent làm việc với workflow qua tool `workflow`. Các thao tác của tool gồm `list`, `get`, `draft`, `update_draft`, `validate`, `dry_run`, `request_publish`, `run`, `runs` và `run_status`. Tool không có thao tác xuất bản: agent có thể soạn workflow từ một yêu cầu bằng ngôn ngữ tự nhiên, nhưng người thật mới là người duyệt.

Mỗi lượt chạy tạo một trace gắn thẻ `workflow`, với một span `workflow_node` cho mỗi lần thử của từng node, và các lệnh gọi model của node `agent` nằm bên dưới. Đầu vào và đầu ra của node chỉ được lưu dưới dạng bản xem trước đã che thông tin nhạy cảm.

```bash
dewee workflows validate -f order-check.json
dewee workflows apply -f order-check.json
dewee workflows publish order-check --yes
dewee workflows trigger order-check --input order_id=A-1042
dewee workflows runs tail <run-id>
dewee workflows runs retry <run-id> --from-node <node-id>
```

Thêm `-o json` vào bất kỳ lệnh nào để nhận kết quả dạng máy đọc được.

## Liên quan

- [Lịch chạy và workflow trong console](/docs/console/schedules-and-workflows): canvas, phiên bản và lịch sử chạy.
- [Lịch chạy và heartbeat](/docs/concepts/schedules-and-heartbeat): khởi chạy workflow từ một cron job.
- [Tracing và quan sát hệ thống](/docs/concepts/tracing): đọc các span của một lượt chạy.
- [Tool và quyền hạn](/docs/concepts/tools-and-permissions): các quyền mà một phiên bản đã xuất bản giữ lại.
- [Tham chiếu CLI](/docs/runtime/cli): toàn bộ lệnh `dewee workflows`.
