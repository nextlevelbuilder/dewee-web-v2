---
title: Lớp quyết định (Jev by TypeSafe)
description: Cách dewee hỏi TypeSafe Jev những câu hỏi nhỏ, có kiểu rõ ràng để chặn ghi bộ nhớ, phân loại ý định khi agent đang bận và gắn nhãn trace. Mọi thứ đều tắt sẵn.
section: concepts
order: 12
updated: 2026-10-10
---

Lớp quyết định cho phép dewee hỏi một model nhỏ và nhanh những câu hỏi hẹp, có kiểu rõ ràng, thay vì tốn cả một lần gọi LLM cho chúng. Model này là **Jev**, một model "System One" của TypeSafe. Mỗi câu hỏi có khuôn cố định, chẳng hạn "nội dung này có đáng giữ không?" hay "tin nhắn này thuộc ý định nào trong bốn ý định?", và Jev trả lời bằng một lựa chọn hoặc một điểm số kèm độ tin cậy.

dewee dùng Jev ở ba chỗ. Cả ba đều **tắt mặc định** và được bật riêng, nên bật chỗ này không bao giờ kéo theo chỗ khác:

| Mục đích | Jev quyết định điều gì | Khoá cấu hình |
|---|---|---|
| Kiểm duyệt ghi bộ nhớ | Nội dung có đáng ghi vào bộ nhớ hay knowledge graph không, và ký ức nào đáng đưa vào lượt hiện tại | `reflex_enabled` cùng `reflex_mode` và mode theo từng seam |
| Ý định khi agent đang bận | Một tin nhắn mang ý nghĩa gì khi nó đến lúc agent vẫn đang làm việc | `intent_classify_mode` |
| Đánh giá ngữ nghĩa trace (beta) | Nhãn cho các trace đã xong, chẳng hạn tác vụ có thành công không | `trace_semantic_enabled` |

Jev không chọn model hay tool, không viết câu trả lời và không kiểm duyệt nội dung người dùng gửi. Nó chỉ trả lời những câu hỏi được nêu trong trang này.

Trong phần cài đặt của console, tính năng này hiện với tên **Lớp quyết định: Jev by TypeSafe**. Người vận hành cấu hình nó một lần cho toàn bộ hệ thống.

> [!WARNING]
> Khi bất kỳ tính năng nào ở đây được bật, dewee gửi nội dung tới một bên thứ ba là `api.typesafe.ai`. Thông tin xác thực, địa chỉ email và số điện thoại được che trước mỗi yêu cầu, nhưng phần còn lại của bộ nhớ, tin nhắn hay trace vẫn rời khỏi máy chủ của bạn. Chế độ không lưu dữ liệu (zero data retention) của TypeSafe chỉ có ở gói enterprise; gói early access lưu dữ liệu theo điều khoản riêng của TypeSafe. Hãy đọc kỹ các điều khoản đó trước khi bật cho nội dung bạn không được phép tiết lộ.

## Thiết lập và phạm vi

Cả ba mục đích dùng chung một API key của TypeSafe, một endpoint và một model được ghim là `jev-1.13.0`. Alias `jev-latest` không bao giờ được dùng, vì ngưỡng được tinh chỉnh theo từng phiên bản model. Lưu key mà không in nó ra màn hình:

```bash
read -rs KEY && printf '%s' "$KEY" | dewee reflex config set-key
dewee reflex status
```

Cấu hình áp dụng cho **toàn bộ hệ thống**. Giá trị được đọc từ tenant rồi tới master tenant, nên một lần ghi ở phạm vi master áp dụng cho mọi tenant chưa tự đặt giá trị riêng. `dewee reflex status` báo `scope: instance` và `key_present` để bạn thấy cấu hình nào đang có hiệu lực. Mọi mode khác `off` đều không làm gì cho tới khi có key.

## Kiểm duyệt ghi bộ nhớ

Một số tác vụ nền biến hội thoại và tài liệu thành bộ nhớ: gom tin nhắn theo kênh, trích xuất knowledge graph, dreaming (hợp nhất bộ nhớ), tóm tắt phiên episodic và memory flush ở cuối mỗi lượt. Mỗi tác vụ là một **seam**, nơi dewee có thể hỏi Jev trước khi gọi LLM tốn kém rằng nội dung có đáng giữ hay không. Seam thứ sáu, `retrieval`, hoạt động ở phía đọc: nó quyết định những ký ức đã truy xuất nào đáng đưa vào lượt hiện tại.

### Các mode

| Mode | Hành vi |
|---|---|
| `off` (mặc định) | Không gửi yêu cầu tới TypeSafe và không ghi span. dewee chạy y như khi chưa có tính năng này. |
| `shadow` | Jev được hỏi và câu trả lời được ghi vào trace, nhưng không bao giờ thay đổi kết quả. Dùng mode này để quan sát trước khi tin tưởng. |
| `gate` | Jev có thể chặn lần gọi khi chắc chắn nội dung không có giá trị. Với `retrieval`, `gate` nghĩa là lọc và xếp hạng các ký ức được truy xuất. |

Một lần chặn không bao giờ âm thầm làm mất việc. Mỗi seam có một đường dự phòng xác định: memory flush vẫn ghi bộ nhớ, tóm tắt episodic vẫn được ghi bằng bản tóm tắt đơn giản, dreaming bỏ qua cổng chặn sau 3 lần bị chặn liên tiếp, còn `retrieval` đưa vào kết quả như bình thường. Ngoại lệ là trích xuất knowledge graph: một đoạn bị chặn sẽ không có cạnh nào trong graph và không được thử lại. Khi người vận hành gọi trích xuất trực tiếp qua API, yêu cầu đó không bao giờ bị chặn.

`shadow` không đổi câu trả lời nhưng có tăng độ trễ ở các seam chạy bên trong một lượt, vì vậy seam memory flush và `retrieval` mặc định chỉ lấy mẫu 20% và 25% số lần đánh giá ở mode shadow.

### Bật tính năng

`reflex_enabled` cùng một key đã lưu là công tắc tổng cho mọi yêu cầu kiểm duyệt bộ nhớ. `reflex_mode` đặt mode mặc định cho năm seam ghi. Seam `retrieval` không bao giờ kế thừa giá trị này: bạn bật nó bằng mode riêng của seam.

```bash
dewee reflex config set --mode shadow                  # các seam ghi quan sát (đồng thời bật reflex_enabled)
dewee reflex config set --seam-mode kg_chunk=gate      # một seam được phép chặn
dewee reflex config set --seam-mode retrieval=shadow   # phía đọc quan sát
dewee reflex config set --mode off                     # tắt các seam ghi
dewee reflex config set --disable                      # dừng mọi yêu cầu kiểm duyệt bộ nhớ
```

`reflex_mode=off` chỉ dừng các seam ghi. Để dừng mọi yêu cầu kiểm duyệt bộ nhớ cùng lúc, hãy tắt `reflex_enabled` bằng `--disable`. Hoàn tác chỉ cần một lần ghi cấu hình; không có migration nào và không có dữ liệu nào cần dọn.

### Kiểm duyệt phía đọc

Khi bật `retrieval`, mỗi lượt gửi một yêu cầu gộp để chấm điểm mức hữu ích của từng ký ức được truy xuất. Các ký ức được chấp nhận sẽ được xếp hạng và cắt theo ngân sách token; nếu mọi ứng viên đều bị loại thì không có phần bộ nhớ nào được thêm vào. Cơ chế này nghiêng về phía giữ lại: muốn loại một ký ức phải có điểm thấp với độ tin cậy cao, còn câu trả lời có độ tin cậy thấp thì ký ức vẫn được giữ.

| Khoá | Mặc định | Ý nghĩa |
|---|---|---|
| `reflex_seam_mode_retrieval` | `off` | `off`, `shadow` hoặc `gate` |
| `reflex_read_timeout_ms` | `1500` | Thời hạn cho mỗi lần đánh giá, trên đường người dùng chờ |
| `reflex_retrieval_max_candidates` | `10` | Số ứng viên gửi đi mỗi lượt |
| `reflex_retrieval_max_tokens` | `200` | Kích thước tối đa của phần bộ nhớ được thêm vào |
| `reflex_retrieval_admit_threshold` | `0.5` | Mức hữu ích tối thiểu để một ký ức được chấp nhận |
| `reflex_retrieval_min_confidence` | `0.5` | Độ tin cậy tối thiểu trước khi một ký ức có thể bị loại |

Hãy chạy `retrieval` ở `shadow` trước khi chuyển sang `gate` trên lưu lượng thật. Span `reflex.decision` ghi lại số lượng và điểm số, nhưng không bao giờ ghi nội dung ký ức.

## Ý định khi agent đang bận

Khi một tin nhắn đến lúc agent vẫn đang làm việc, dewee phải hiểu tin nhắn đó muốn gì trước khi xử lý:

| Ý định | dewee làm gì |
|---|---|
| `status_query` | Trả lời tiến độ và bỏ qua tin nhắn |
| `cancel` | Dừng công việc đang chạy |
| `steer` | Đưa tin nhắn vào vòng lặp đang chạy |
| `new_task` | Xếp tin nhắn vào hàng đợi thành một lượt chạy riêng |

Quyết định đi qua ba bước. Đường nhanh xác định nhận ra các tin nhắn rõ ràng như `stop`, `thôi`, `取消` hay `?` mà không cần gọi mạng; những tin nhắn này không bao giờ tới Jev. Tin nhắn mơ hồ được gửi tới Jev nếu mode cho phép. Những gì Jev không trả lời được với đủ độ tin cậy sẽ chuyển sang bộ phân loại LLM sinh văn bản mà dewee vẫn dùng từ trước.

| Mode | Hành vi |
|---|---|
| `off` (mặc định) | Đường nhanh cộng bộ phân loại sinh văn bản. Không gửi yêu cầu tới TypeSafe và không ghi span. |
| `shadow` | Bộ phân loại sinh văn bản quyết định. Jev cũng được hỏi và lựa chọn của nó được ghi lại để so sánh. |
| `active` | Câu trả lời của Jev đạt ngưỡng tin cậy trở lên sẽ được dùng. Dưới ngưỡng, hoặc khi có bất kỳ lỗi nào, bộ phân loại sinh văn bản quyết định. |

| Khoá | Mặc định | Ý nghĩa |
|---|---|---|
| `intent_classify_mode` | `off` | `off`, `shadow` hoặc `active` |
| `intent_classify_confidence_threshold` | `0.75` | Ngưỡng tin cậy để dùng câu trả lời của Jev |
| `intent_classify_confidence_threshold.<locale>` | ngưỡng của hệ thống | Ngưỡng riêng theo ngôn ngữ, chẳng hạn `.vi` |
| `intent_classify_timeout_ms` | `1500` | Thời hạn cho mỗi lần đánh giá, tối đa 5000 |

```bash
dewee reflex config set --intent-mode shadow
dewee reflex config set --intent-confidence 0.8 --intent-confidence-by-locale vi=0.8
dewee reflex config set --intent-mode active
```

Công tắc này độc lập với kiểm duyệt bộ nhớ: bật phân loại ý định chỉ gửi tin nhắn vừa đến, không bao giờ gửi nội dung bộ nhớ. Mọi lỗi, từ thiếu key tới quá thời hạn, đều chuyển sang bộ phân loại sinh văn bản kèm lý do được ghi lại. Nếu bộ phân loại đó cũng lỗi, tin nhắn được coi là `new_task` và xếp vào hàng đợi, không bao giờ bị bỏ.

Mỗi quyết định trong lúc mode đang bật ghi một span `intent.decision`, cho biết bộ phân loại nào đã quyết định, độ tin cậy, lý do chuyển dự phòng nếu có và, ở mode shadow, Jev có đồng ý hay không. Nội dung tin nhắn không bao giờ được lưu. Đồng ý với bộ phân loại sinh văn bản không có nghĩa là chính xác, vì vậy hãy đánh giá `active` dựa trên một mẫu do người gắn nhãn.

## Đánh giá ngữ nghĩa trace

Đánh giá ngữ nghĩa đang ở giai đoạn beta và chỉ chạy khi `trace_semantic_enabled` được bật và đã có key. Jev đọc một bản tóm tắt có giới hạn, đã che thông tin nhạy cảm, của một trace đã xong rồi gắn nhãn: kết quả tác vụ, cách dùng tool, chất lượng truy xuất, hiệu quả, có cần người xem lại không và kiểu lỗi có khả năng xảy ra. Bạn có thể lấy mẫu trace, hoặc luôn đánh giá các trace bị lỗi, có giao việc, dùng nhiều tool hay có truy xuất.

Các nhãn này **chỉ dùng để chẩn đoán**. Chúng thêm bộ lọc cho `dewee traces list`, chẳng hạn `--semantic-decision`, và không bao giờ thay đổi hành vi, prompt, tool hay trạng thái trace của agent. Khi quá thời hạn, lần đánh giá được ghi là thất bại và không bao giờ chặn agent. `dewee traces semantic config get` cho biết tính năng có đang bật hay không và vì sao. Xem [Tracing và quan sát hệ thống](/docs/concepts/tracing).

## Giới hạn và an toàn

Cả ba mục đích dùng chung một ngân sách yêu cầu và một circuit breaker trên mỗi tiến trình:

- `reflex_budget_rpm` (mặc định 600) giới hạn số yêu cầu gửi đi mỗi phút, tính cả mỗi lần thử lại. Khi hết ngân sách, yêu cầu bị bỏ qua và dewee tiếp tục chạy mà không có Jev.
- Sau 5 lần lỗi liên tiếp, breaker mở trong 30 giây. Breaker mở chỉ có thể khiến dewee dễ dãi hơn: không có gì bị chặn và việc phân loại ý định chuyển sang bộ phân loại sinh văn bản.
- Lỗi `400`, `401` và `403` không làm breaker mở. Chúng cho thấy key hoặc bộ câu hỏi sai, và hiện trong `dewee reflex status` dưới dạng `misconfigured`.
- Ngân sách, breaker và bộ đếm tính theo từng tiến trình. Khi có nhiều replica gateway, mỗi replica có bộ riêng.

Mọi đường xử lý đều fail open. Nếu TypeSafe chậm, ngừng hoạt động hay không kết nối được, dewee chạy như khi lớp quyết định đang tắt.

## Lệnh

| Lệnh | Dùng để |
|---|---|
| `dewee reflex status` | Xem key, phạm vi, mode và tỉ lệ lấy mẫu của từng seam, cấu hình phân loại ý định, breaker, ngân sách và bộ đếm. Thêm `--json` khi dùng trong script. |
| `dewee reflex config set` | Đổi mode, tỉ lệ lấy mẫu, ngưỡng và thời hạn; dùng `set-key` để lưu key |
| `dewee reflex test --set <seam> --state-file <file>` | Hỏi bộ câu hỏi của một seam với một mẫu và xem câu trả lời |
| `dewee reflex eval --labels <file.jsonl> [--sweep]` | Chấm điểm các ngưỡng trên một mẫu do người gắn nhãn |

Các ngưỡng đi kèm là giá trị khởi đầu thận trọng, chưa được hiệu chỉnh. Hãy chạy `dewee reflex eval` với nhãn do người viết, không phải do model tạo ra, trước khi chuyển một seam từ `shadow` sang `gate`.

## Liên quan

- [Bộ nhớ và kho tri thức](/docs/concepts/memory-and-knowledge): các tác vụ bộ nhớ mà các seam kiểm duyệt đứng phía trước.
- [Tracing và quan sát hệ thống](/docs/concepts/tracing): span `reflex.decision`, `intent.decision` và bộ lọc đánh giá ngữ nghĩa.
- [Tham chiếu CLI](/docs/runtime/cli): toàn bộ lệnh `dewee reflex`.
