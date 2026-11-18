---
title: Provider, fallback và suy luận
description: Cách dewee làm việc với 32 loại LLM provider, xử lý lệnh gọi lỗi, giới hạn chi phí, prompt caching, định tuyến thích ứng và mức suy luận của agent.
section: concepts
order: 3
updated: 2026-11-18
---

Vòng lặp agent không bao giờ gọi thẳng tới nhà cung cấp model. Nó gọi một giao diện provider duy nhất, và một adapter chuyển từng request sang định dạng riêng của nhà cung cấp. Trang này giải thích các loại provider, điều gì xảy ra khi lệnh gọi thất bại, giới hạn chi phí và các thiết lập suy luận.

## Loại provider và adapter

Provider là một tài khoản bạn đăng ký trong tenant, gồm tên, `provider_type`, key hoặc thông tin xác thực khác, và base URL khi cần. Có 32 loại provider, được phục vụ bởi sáu nhóm adapter. Loại provider là một kiểu kết nối mà runtime chấp nhận, không phải một hãng: một hãng có thể cần nhiều hơn một loại (ví dụ Z.ai và gói Coding Plan của họ).

| Nhóm adapter | Loại provider |
|---|---|
| Anthropic native (HTTP + SSE) | `anthropic_native` |
| Tương thích OpenAI | `openai_compat`, `openrouter`, `groq`, `deepseek`, `gemini_native`, `vertex`, `mistral`, `xai`, `minimax_native`, `cohere`, `perplexity`, `bailian`, `alibaba_token_plan`, `yescale`, `zai`, `zai_coding`, `ollama`, `ollama_cloud`, `novita`, `byteplus`, `byteplus_coding`, `kimi_coding`, `cloudflare_workers_ai`, `cline_pass`, `opencode_go`, `vercel_ai_gateway`, `atlascloud` |
| DashScope (Qwen) | `dashscope` |
| Gói ChatGPT (Codex OAuth) | `chatgpt_oauth` |
| Claude CLI (chương trình chạy trên máy) | `claude_cli` |
| ACP (agent lập trình bên ngoài, qua JSON-RPC) | `acp` |

Các provider dùng HTTP có thời gian chờ request là 300 giây. Provider ACP chạy một agent bên ngoài dưới dạng tiến trình con, với chế độ quyền `approve-all` (mặc định), `approve-reads` hoặc `deny-all`.

Provider đăng ký trong database được ưu tiên hơn provider cùng tên trong file cấu hình. Khi `GOCLAW_ENCRYPTION_KEY` được đặt, key của provider được mã hoá bằng AES-256-GCM trước khi lưu. Nếu không có biến này, key được lưu nguyên như khi nhập, vì vậy hãy đặt nó trước khi thêm provider.

## Khi lệnh gọi thất bại

### Thử lại

Mỗi lệnh gọi provider có tối đa 3 lần thử. Thời gian chờ bắt đầu từ 300 ms, tăng gấp đôi sau mỗi lần cho tới tối đa 30 giây, và dao động 10%. Header `Retry-After` trong phản hồi 429 hoặc 503 sẽ thay cho thời gian chờ tự tính. Mã HTTP 429, 500, 502, 503, 504 và lỗi mạng được thử lại; 400, 401, 403 và 404 thì không.

### Model fallback

Agent có thể khai báo danh sách cặp provider và model dự phòng trong `model_fallback`. Provider và model của chính agent luôn được thử trước, sau đó tới các lựa chọn dự phòng theo đúng thứ tự bạn liệt kê:

```json
{
  "model_fallback": {
    "enabled": true,
    "candidates": [
      { "provider": "openai-codex", "model": "gpt-5.5" },
      { "provider": "openrouter", "model": "<model-id>" }
    ]
  }
}
```

Fallback xảy ra khi gặp giới hạn tốc độ, quá tải, hết thời gian chờ hay lỗi mạng, lỗi xác thực hoặc thanh toán, lỗi không tìm thấy model, khi các tuyến ChatGPT OAuth đều đã cạn, hoặc khi Codex gặp lỗi tạm thời. Fallback không xảy ra khi:

- context window bị tràn, vì trường hợp này cần nén lịch sử chứ không cần model khác;
- lỗi không phân loại được;
- request chỉ định rõ provider hoặc model, như lượt chạy thủ công và heartbeat có thể làm;
- câu trả lời dạng stream đã gửi đi bất kỳ đoạn văn bản, thinking hay hình ảnh nào.

### Thời gian tạm nghỉ

Khi fallback đang bật, tuyến nào thất bại vì một lý do đã biết sẽ bị đưa vào thời gian tạm nghỉ (cooldown), và các request sau sẽ bỏ qua nó cho tới khi hết thời gian này hoặc một lần thăm dò định kỳ thành công. Cooldown được bật mặc định (`cooldown_enabled`), còn `max_attempts` giới hạn số tuyến mà một request được thử.

| Lý do | Thời gian tạm nghỉ |
|---|---|
| Giới hạn tốc độ | 30 giây |
| Quá tải | 60 giây, tăng lên 120 giây |
| Hết thời gian chờ | 15 giây |
| Thanh toán | 5 phút |
| Xác thực | 10 phút |
| Lỗi xác thực vĩnh viễn hoặc không tìm thấy model | 1 giờ |

## Giới hạn sử dụng và giá

Trên bản Standard, bạn có thể giới hạn chi phí theo token hoặc theo USD cho từng tenant, agent, provider, loại provider hoặc model. Trước mỗi lệnh gọi, dewee giữ trước số token và chi phí ước tính, rồi đối chiếu lại với mức sử dụng mà provider báo về. Các lệnh gọi nội bộ như ghi bộ nhớ, nén lịch sử, tool đọc media và sub-agent cũng đi qua cùng bước kiểm tra này.

Giá lấy từ danh mục model của OpenRouter, và bạn có thể ghi đè giá theo tenant, provider hoặc model. Các đơn vị tính giá gồm input, output, đọc cache, ghi cache, suy luận, request, hình ảnh và tìm kiếm web. Provider theo gói thuê bao và provider chạy cục bộ (`chatgpt_oauth`, `claude_cli`, `bailian`, `acp`, `ollama`) không được tính giá. Thiết lập cũ `budget_monthly_cents` của agent được chuyển thành giới hạn USD hằng tháng cho agent đó.

## Prompt caching và nhóm tài khoản

dewee tách system prompt thành một phần ổn định và một phần thay đổi theo từng lượt. Với Anthropic, khối ổn định được đánh dấu để cache, nên các lượt sau dùng lại nó thay vì phải trả tiền lại từ đầu. Lượt đọc và ghi cache được tính vào mức sử dụng và có đơn giá riêng.

Một tenant có thể kết nối nhiều tài khoản gói ChatGPT, mỗi tài khoản là một provider `chatgpt_oauth` riêng. Một trong số đó có thể quản lý một nhóm gồm các tài khoản còn lại:

```json
{
  "name": "openai-codex",
  "provider_type": "chatgpt_oauth",
  "settings": {
    "codex_pool": {
      "strategy": "round_robin",
      "extra_provider_names": ["codex-work"]
    }
  }
}
```

`round_robin` chia đều request cho các tài khoản. `priority_order` dùng tài khoản chính trước rồi lần lượt đi xuống danh sách. Khi gặp lỗi có thể thử lại, request chuyển sang tài khoản kế tiếp ngay trong cùng lần gọi. Lịch sử định tuyến gần đây và tình trạng từng tài khoản của một agent có tại `GET /v1/agents/{id}/codex-pool-activity`.

## Định tuyến thích ứng

Định tuyến thích ứng (adaptive routing) cho phép một routing preset chọn provider và model cho lượt chạy, thay vì luôn dùng provider và model của agent. Tính năng này tắt sẵn: preset cần `DEWEE_ROUTING_PRESETS_ENABLED=true`, và tuyến chỉ thực sự có hiệu lực (canary, và câu trả lời chọn tuyến của model quyết định) khi đặt thêm `DEWEE_ROUTING_ACTIVE_ENABLED=true`. Cả hai mặc định tắt, nên gateway không bật chúng sẽ chạy mọi request đúng như cấu hình của agent.

### Giữ provider theo phiên và cache hết hạn

Khi một phiên đã được định tuyến tới một provider, phiên đó giữ nguyên provider ấy để dùng lại prompt cache của lịch sử phiên. Lợi ích này mất đi khi cache chắc chắn đã hết hạn. Khi định tuyến chủ động đang bật, phiên nào có lượt cuối cũ hơn thời gian sống cache của provider sẽ hỏi lại model quyết định, nhưng vẫn trong provider đang giữ. Nếu lần quyết định mới thất bại, phiên giữ tuyến cũ và không bị hỏi lại ở mỗi lượt.

Thời gian sống cache đặt theo loại provider: mặc định 5 phút cho `anthropic_native` và 10 phút cho `chatgpt_oauth`. Các loại provider khác không có thời gian sống đã biết và không bao giờ kích hoạt quyết định lại. Ghi đè bảng này bằng `DEWEE_ROUTING_CACHE_TTLS`, một danh sách `provider_type=duration` cách nhau bởi dấu phẩy, theo định dạng duration của Go:

```bash
DEWEE_ROUTING_CACHE_TTLS="anthropic_native=1h,openai_compat=10m"
```

Duration `0` xoá một loại provider khỏi bảng. Mục sai định dạng được ghi log một lần và bị bỏ qua.

### Đo lường lựa chọn tuyến

Khi bật đo lường lượt chạy (`run_measurement.enabled`), mỗi lượt chạy được định tuyến ghi lại tuyến của nó là `initial` (lượt định tuyến đầu tiên của phiên), `kept` (cùng tuyến và cùng phiên bản preset như trước, nên có thể dùng lại prompt cache) hay `switched`. Một lần thử lại chỉ được nối với lần thử trước của cùng tác vụ khi cả hai chạy trong cùng một cohort định tuyến (tuyến, phiên bản preset và nhánh canary), nên thời gian tới khi thành công không bao giờ bị cộng chéo giữa các nhánh canary.

Owner và admin của tenant so sánh các lựa chọn bằng `GET /v1/usage/runs/route-choices` hoặc CLI:

```bash
dewee usage route-choices --agent-id <agent-uuid> -o json
```

Lệnh nhận cùng bộ lọc với `dewee usage runs`, trừ `--group-by` và `--include-runs`, và báo cáo số lượt chạy, tỉ lệ thành công ước lượng (proxy), chi phí và thời gian chạy p50/p95 cho từng lựa chọn. Khi gateway chạy thêm với `DEWEE_ROUTING_EXPERIMENTS_ENABLED=true`, báo cáo có thêm các nhánh fork experiment, gom theo loại (`sticky`, `checkpoint`, `switch`). Các nhánh là bản chạy lại và không bao giờ được cộng vào lượt chạy thật.

Khi model quyết định chỉ đề xuất một tuyến mà không áp dụng (chế độ shadow), `summary.shadow` trong `GET /v1/usage/runs` ước tính chi phí của những lượt chạy mà đề xuất khác tuyến thực tế nếu chạy trên model được đề xuất: `diverged_estimated_cost_usd`, `diverged_estimated_runs`, `diverged_unestimated_runs`, `estimate_coverage` và `estimated_cost_delta_pct` (âm khi đề xuất rẻ hơn). Ước tính giả định số token không đổi, nêu cơ sở tính trong `estimate_basis`, và là `null` chứ không phải 0 khi không tính được giá của model.

### Checkpoint và fork experiment

Khi bật `DEWEE_ROUTING_EXPERIMENTS_ENABLED=true`, [endpoint MCP của workspace](/docs/api/workspace-mcp) có thêm các tool dưới đây. Chúng chỉ thấy các phiên của chính bạn, kể cả khi bạn là owner hoặc admin của workspace.

| Tool | Chức năng |
|---|---|
| `routing_checkpoints_list` | Liệt kê checkpoint định tuyến của các phiên của bạn: provider và model đã phục vụ phiên tại một thời điểm trong lịch sử. Checkpoint không chứa nội dung tin nhắn |
| `routing_checkpoint_create` | Ghi một checkpoint cho một phiên. Mỗi phiên giữ 8 checkpoint mới nhất; checkpoint không dùng tới hết hạn sau 24 giờ |
| `routing_checkpoint_delete` | Xoá một checkpoint |
| `routing_fork_experiments_list` | Liệt kê fork experiment của các phiên của bạn, kèm chi phí, thời gian và token cache của từng nhánh |
| `routing_fork_experiments_get` | Đọc trạng thái của một experiment và, khi đã xong, kết quả của từng nhánh |
| `routing_fork_experiment_start` | Chạy lại lượt người dùng mới nhất của phiên trên các bản sao trong bộ nhớ với 1 đến 3 nhánh (`sticky`, `checkpoint`, `switch`). Bản thân phiên không bị thay đổi |

Ba thao tác ghi cần `idempotency_key` và sự phê duyệt của owner hoặc admin workspace trước khi chạy. Mỗi nhánh experiment là một lệnh gọi model thật, có tốn chi phí, và nhánh `switch` gửi lịch sử phiên sang provider khác, nên workspace cũng phải đồng ý cho việc đó. Thành công trong experiment là chỉ số ước lượng, không phải kết quả chắc chắn.

## Suy luận

Suy luận (extended thinking) ở trạng thái tắt, trừ khi thiết lập mặc định của provider hoặc thiết lập của agent bật nó lên.

- **Mặc định của provider.** `settings.reasoning_defaults` trên provider chứa `effort` và `fallback`, dùng chung cho mọi agent dùng provider đó.
- **Ghi đè theo agent.** `reasoning_config.override_mode` là `inherit` (dùng mặc định của provider) hoặc `custom` (agent tự đặt `effort` và `fallback`).
- **Giá trị effort.** `off`, `auto`, `none`, `minimal`, `low`, `medium`, `high`, `xhigh` và `max`.
- **Fallback.** `downgrade` hạ xuống mức cao nhất mà model hỗ trợ, `off` tắt suy luận, còn `provider_default` dùng thiết lập của provider.
- **Mức cũ.** Thiết lập `thinking_level` trước đây (`off`, `low`, `medium`, `high`) vẫn dùng được.

Mỗi adapter quy đổi mức suy luận theo cách riêng:

| Provider | Cách hoạt động |
|---|---|
| Anthropic | Ngân sách thinking 4.096, 10.000 và 32.000 token cho low, medium và high. `max_tokens` được nâng lên ít nhất bằng ngân sách cộng 4.096, và temperature không được gửi đi. Các model Claude mới hơn dùng adaptive thinking với mức effort thay cho ngân sách. |
| OpenAI và Codex | `reasoning_effort`, được điều chỉnh theo khả năng của model. |
| DashScope | Ngân sách 4.096, 16.384 và 32.768 token. Khi có tool, câu trả lời không được stream. |

Mức effort thực tế và nguồn gốc của nó được ghi vào metadata của trace (`metadata.reasoning`).

## Embedding

Tìm kiếm vector trong kho tri thức và bộ nhớ theo phiên dùng một trong hai embedding provider: OpenAI `text-embedding-3-small` (1.536 chiều) hoặc Voyage (1.024 chiều, lưu ở dạng 1.536 chiều). Tìm kiếm vector cần PostgreSQL có pgvector; bản Lite chỉ tìm theo từ khoá.

## Liên quan

- [Provider và model](/docs/console/providers-and-models): thêm tài khoản provider và chọn model trong console.
- [LLM provider](/docs/integrations/llm-providers): ghi chú thiết lập cho từng nhà cung cấp.
- [Vòng lặp agent](/docs/concepts/agent-loop): lệnh gọi model nằm ở đâu trong một lượt chạy.
- [Tracing và quan sát hệ thống](/docs/concepts/tracing): token, chi phí và các lần fallback của từng lệnh gọi.
- [Mô hình bảo mật](/docs/security/overview): cách key và secret được bảo vệ.
