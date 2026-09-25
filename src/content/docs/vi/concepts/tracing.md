---
title: Tracing và quan sát hệ thống
description: Những gì dewee ghi lại cho mỗi lượt chạy agent, trace giữ bao lâu, chi phí và mức sử dụng được tính ra sao, và cách đọc trace qua console, CLI, API hay OTel.
section: concepts
order: 10
updated: 2026-09-25
---

Mỗi lượt chạy agent trong dewee đều để lại một trace: bản ghi về yêu cầu agent nhận được, các model và tool nó đã gọi, thời gian của từng bước, chi phí và kết quả cuối cùng. Trace là nơi đầu tiên cần xem khi một câu trả lời sai, chậm hoặc tốn kém. Trace được ghi ở chế độ nền, nên việc ghi lại không làm chậm lượt chạy.

## Trace ghi lại những gì

Một trace tương ứng với một lượt chạy agent. Trace lưu:

- agent, người dùng, kênh, session key và run ID;
- thời điểm bắt đầu và kết thúc, thời lượng, và trạng thái `running`, `completed`, `error` hoặc `cancelled`;
- bản xem trước của đầu vào và đầu ra cuối cùng;
- tổng số token đầu vào và đầu ra, chi phí, số lần gọi model và số lần gọi tool;
- các thẻ, chẳng hạn `workflow` cho lượt chạy workflow, và nhóm khi lượt chạy là việc của nhóm.

Khi một agent giao việc cho agent khác, lượt chạy của agent được giao có trace riêng, trỏ ngược về trace cha qua `parent_trace_id`, nhờ đó bạn theo dõi được một yêu cầu qua nhiều agent. Nếu một lượt chạy đã bị huỷ mà sau 3 giây vẫn chưa dừng, trace của nó vẫn được đánh dấu `cancelled`, để không bị treo ở trạng thái đang chạy.

## Các loại span

Một trace gồm nhiều span, mỗi span ứng với một bước:

| Loại span | Ghi lại |
|---|---|
| `agent` | Toàn bộ lượt chạy; các span khác của lượt chạy nằm bên dưới nó |
| `llm_call` | Một lần gọi model, kèm model, số token, chi phí và lý do kết thúc |
| `tool_call` | Một lần gọi tool, kèm tên tool, đầu vào, đầu ra và thời lượng |
| `embedding` | Một yêu cầu embedding, ví dụ khi tìm kiếm bộ nhớ |
| `event` | Một mốc tại một thời điểm, chẳng hạn `delivery.sent` hoặc `delivery.failed` khi câu trả lời được gửi tới kênh |
| `workflow_node` | Một lần thử của một node workflow; các lần gọi model và tool của node `agent` nằm bên dưới nó |

Tổng token và chi phí của trace chỉ được cộng từ các span `llm_call`, nên không có gì bị tính hai lần.

## Thời gian lưu và bản xem trước

| Thiết lập | Giá trị |
|---|---|
| Thời gian lưu | 7 ngày, sau đó trace và các span của nó bị xoá |
| Dọn dẹp | Mỗi 8 giờ |
| Kích thước bản xem trước | Tối đa 40.000 ký tự cho mỗi đầu vào hoặc đầu ra |
| Bản xem trước chi tiết | Tối đa 200.000 ký tự, khi người vận hành bật chế độ tracing chi tiết |
| Bộ đệm span | 1.000 span, ghi vào cơ sở dữ liệu mỗi 5 giây |

Bản xem trước bị cắt ở giới hạn, nên một prompt hay kết quả tool dài có thể không đầy đủ. Hình ảnh trong đầu vào của model được thay bằng một dòng ghi chú cho biết loại và kích thước ảnh. Nếu một đợt hoạt động dồn dập làm đầy bộ đệm span, các span thừa bị bỏ và một cảnh báo được ghi vào log.

## Chi phí và snapshot mức sử dụng

dewee tính giá mỗi lần gọi model theo mức giá bạn đặt trong `telemetry.model_pricing`, với khoá là `provider/model` hoặc chỉ tên model. Token đầu vào, đầu ra, token đọc cache và ghi cache đều có mức giá riêng, và token suy luận cũng có thể có mức giá riêng. Model không có mục giá sẽ hiện chi phí bằng 0.

Vào phút thứ năm của mỗi giờ (UTC), một worker chạy nền tổng hợp giờ trước đó thành snapshot mức sử dụng theo agent, kênh, provider và model. Mỗi snapshot gồm số yêu cầu, số lỗi, số người dùng khác nhau, token, chi phí, số lần gọi tool và thời lượng trung bình. Snapshot không bị dọn cùng trace, nên lịch sử sử dụng được giữ lâu hơn khung 7 ngày của trace.

> [!CAUTION]
> `dewee usage snapshots rebuild --from <start> --to <end>` xoá các snapshot trong khoảng đó rồi tính lại từ trace. Với những giờ cũ hơn 7 ngày, trace đã bị xoá, nên việc tính lại sẽ làm mất các số liệu tổng đó.

## Đọc trace

Trong console, màn hình **Trace** tìm kiếm các lượt chạy và mở từng lượt thành một cây span đã che thông tin nhạy cảm, kèm thời gian và lượng token. Dữ liệu này cũng có qua HTTP:

| Endpoint | Trả về |
|---|---|
| `GET /v1/traces` | Danh sách trace đã lọc và phân trang (mặc định 50 mỗi trang) |
| `GET /v1/traces/{id}` | Một trace với toàn bộ span |
| `GET /v1/traces/{id}/export` | Cây trace nén gzip, gồm span và các trace con |
| `GET /v1/traces/follow` | Các thay đổi của một session hoặc agent, dùng để hỏi định kỳ |
| `GET /v1/runs/{runID}/timeline` | Dòng thời gian đã lưu của một lượt chạy |

Bộ lọc gồm tìm kiếm văn bản, agent, người dùng, session, trạng thái, kênh, khoảng thời gian, khoảng số token và số lần gọi tool, cùng tên tool.

```bash
dewee traces list --status error --limit 20
dewee traces list --agent support --tool <tool-name> --since 2026-09-24T00:00:00Z
dewee traces get <trace-id> -o json
dewee traces export <trace-id> --file trace.json.gz
dewee traces follow --session <session-key> --since 2026-09-25T01:00:00Z
dewee traces timeline <trace-id>
```

`list` trả về tối đa 200 trace mỗi trang. Để đọc trace trên một gateway từ xa, hãy truyền `--server` và `--token`, hoặc đặt `DEWEE_SERVER` và `DEWEE_API_KEY`. Cờ truyền trực tiếp được ưu tiên.

```bash
dewee --server https://dewee.example.com --token <token> traces get <trace-id> -o json
```

**Đánh giá ngữ nghĩa** đang ở giai đoạn beta và tắt mặc định. Khi người vận hành bật tính năng này và thêm API key của TypeSafe, các trace đã hoàn tất được gửi tới bộ phân loại bên ngoài đó, sau khi đã che thông tin xác thực và dữ liệu cá nhân, rồi được gắn các tín hiệu như tác vụ có thành công hay không. Các nhãn này trở thành bộ lọc bổ sung của `dewee traces list`, chẳng hạn `--semantic-decision`, và không bao giờ thay đổi cách agent chạy. `dewee traces semantic config get` cho biết tính năng có đang bật hay không và vì sao.

## Xuất sang OpenTelemetry

Trace luôn được ghi vào cơ sở dữ liệu của dewee. Bạn cũng có thể gửi span tới một backend OTLP như Jaeger, Grafana Tempo hoặc Datadog. Việc xuất OpenTelemetry là tuỳ chọn lúc build: build với tag `otel`, hoặc build Docker image với `ENABLE_OTEL=true`. Bản build tiêu chuẩn không kèm tính năng này. Sau đó bật nó trong phần `telemetry` của cấu hình:

| Khoá | Mặc định | Ý nghĩa |
|---|---|---|
| `enabled` | `false` | Bật việc xuất; cần có thêm endpoint |
| `endpoint` | Không có | Ví dụ `localhost:4317` cho gRPC hoặc `localhost:4318` cho HTTP |
| `protocol` | `grpc` | `grpc` hoặc `http` |
| `insecure` | `false` | Bỏ qua TLS, dùng khi thử nghiệm cục bộ |
| `service_name` | `dewee-gateway` | Tên service hiển thị trong backend của bạn |
| `headers` | Không có | Header bổ sung, chẳng hạn token xác thực |

Span được xuất theo lô tối đa 100, mỗi 5 giây. Bộ xuất đã được triển khai nhưng chưa được kiểm chứng trong môi trường production.

## Liên quan

- [Giám sát trong console](/docs/console/monitoring): màn hình Trace và các chế độ xem mức sử dụng.
- [Vòng lặp agent](/docs/concepts/agent-loop): các bước mà mỗi span ghi lại.
- [Nhóm agent và giao việc](/docs/concepts/agent-teams): theo dõi một yêu cầu qua nhiều agent.
- [Workflow](/docs/concepts/workflows): lượt chạy workflow và span của các node.
- [Tham chiếu CLI](/docs/runtime/cli): toàn bộ lệnh `dewee traces` và `dewee usage`.
