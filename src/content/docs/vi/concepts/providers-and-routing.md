---
title: Provider, fallback và suy luận
description: Cách dewee làm việc với 31 loại LLM provider, xử lý khi lệnh gọi model thất bại, giới hạn chi phí, prompt caching và cách đặt mức suy luận cho từng agent.
section: concepts
order: 3
updated: 2026-09-25
---

Vòng lặp agent không bao giờ gọi thẳng tới nhà cung cấp model. Nó gọi một giao diện provider duy nhất, và một adapter chuyển từng request sang định dạng riêng của nhà cung cấp. Trang này giải thích các loại provider, điều gì xảy ra khi lệnh gọi thất bại, giới hạn chi phí và các thiết lập suy luận.

## Loại provider và adapter

Provider là một tài khoản bạn đăng ký trong tenant, gồm tên, `provider_type`, key hoặc thông tin xác thực khác, và base URL khi cần. Có 31 loại provider, được phục vụ bởi sáu nhóm adapter.

| Nhóm adapter | Loại provider |
|---|---|
| Anthropic native (HTTP + SSE) | `anthropic_native` |
| Tương thích OpenAI | `openai_compat`, `openrouter`, `groq`, `deepseek`, `gemini_native`, `vertex`, `mistral`, `xai`, `minimax_native`, `cohere`, `perplexity`, `bailian`, `alibaba_token_plan`, `yescale`, `zai`, `zai_coding`, `ollama`, `ollama_cloud`, `novita`, `byteplus`, `byteplus_coding`, `kimi_coding`, `cloudflare_workers_ai`, `cline_pass`, `opencode_go`, `vercel_ai_gateway` |
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
