---
title: Tool tích hợp, MCP server và hook
description: Bật hoặc tắt tool tích hợp cho workspace, kết nối MCP server và cấp quyền dùng tool, chạy hook theo sự kiện của agent, thiết lập gói runtime và giọng nói.
section: console
order: 7
screens: [tools, mcp-servers, hooks]
updated: 2026-09-25
---

Tool là cách agent hành động: tìm kiếm trên web, đọc file, gọi một API. dewee mặc định từ chối mọi thứ, nên agent chỉ dùng được một tool sau khi bạn cho phép. Trang này nói về ba khu vực quyết định agent được gọi những gì và điều gì chạy quanh các lần gọi đó, cùng hai khu vực **Gói runtime** và **Giọng nói**.

## Ai được dùng

| Khu vực | Khoá quyền |
|---|---|
| Tool tích hợp, Giọng nói (TTS & STT) | `settings.manage` |
| MCP server, Hook | `integrations.manage` |
| Gói runtime | `packages.install` |

Chủ workspace và vai trò Admin có sẵn giữ tất cả các khoá này. Xem [Thành viên, vai trò và API key](/docs/console/members-roles-and-api-keys).

## Tool tích hợp

**Tool tích hợp** liệt kê các tool đi kèm runtime, được nhóm theo danh mục. Mỗi tool cho biết nó cần gì, đang bật hay tắt, mức rủi ro, và thiết lập hiện tại là **runtime default** hay **tenant override** riêng của workspace.

::shot{id="tools"}

Để thay đổi một tool:

1. Mở danh mục chứa tool và chọn **Configure**, rồi **Load config**.
2. Bật hoặc tắt **Enabled override**, hoặc chọn **Use runtime default**.
3. Sửa **Settings JSON** nếu tool có thiết lập riêng.
4. Với tool có thể sửa file, chạy lệnh hoặc dùng secret đã lưu, hãy đánh dấu vào ô xác nhận.
5. Chọn **Save**. Sau này, dùng **Revert override** để quay về mặc định của runtime.

## MCP server

MCP server bổ sung tool từ bên ngoài dewee, như GitHub hay một hệ thống ticket. Server đã kết nối vẫn chưa dùng được cho tới khi bạn cấp quyền cho agent.

::shot{id="mcp-servers"}

1. Chọn **New server** và điền phần **Profile**: tên (chữ thường, chữ số và dấu gạch ngang), tên hiển thị, tiền tố tool và thời gian chờ.
2. Chọn transport. **stdio** chạy một lệnh kèm tham số và biến môi trường, trong đó biến bí mật luôn được che. **SSE** và **Streamable HTTP** cần URL, header và API key nếu có.
3. Lưu server. Với server SSE hoặc Streamable HTTP dùng OAuth, mở tab **OAuth**, giữ chế độ đăng ký **Auto (Recommended)** trừ khi server yêu cầu khác, rồi chọn **Authorize**.
4. Ở tab **Test**, chọn **Test connection** để kiểm tra server và tìm các tool của nó.
5. Ở tab **Grants**, chọn một **Agent**, một **Team** (các agent hiện có trong nhóm) hoặc một **User**, chọn các tool được phép hoặc bị cấm, rồi chọn **Save grant**.

Bạn thu hồi quyền ngay trong tab đó. Tắt một server sẽ giữ nguyên cấu hình nhưng agent không dùng được nữa.

## Hook

Hook chạy handler của riêng bạn khi một sự kiện của agent xảy ra, để cho phép, chặn hoặc bổ sung ngữ cảnh cho bước tiếp theo. Khu vực hook đang ở giai đoạn beta.

::shot{id="hooks"}

| Sự kiện | Có chặn thao tác không? |
|---|---|
| `user_prompt_submit`, `pre_tool_use`, `subagent_start` | Có: lỗi hoặc quyết định chặn sẽ dừng thao tác |
| `session_start`, `post_tool_use`, `stop`, `subagent_stop` | Không: hook chạy bất đồng bộ |

Để thêm hook:

1. Chọn **New hook**, đặt tên và chọn **Event**.
2. Chọn **Handler**: **Prompt** (một prompt template chạy trên model, cần tool matcher hoặc if expression), **HTTP** (một endpoint http hoặc https kèm header dạng JSON) hoặc **Script** (JavaScript chạy trong sandbox, tối đa 32 KiB).
3. Đặt **Scope** cho toàn tenant hoặc cho các agent được chọn, và đặt độ ưu tiên.
4. Đặt **Timeout (ms)** từ 0 đến 10.000, và **On timeout** là **Block** hoặc **Allow**.
5. Chọn **Create hook**, rồi dùng **Dry run** với một sự kiện mẫu để kiểm tra. Các lần chạy thử không được ghi vào lịch sử.

Tab **History** hiển thị các lần chạy trước, với những giá trị trông giống secret đã được che. Hook global, hook có sẵn và hook dạng command do người vận hành runtime thiết lập chỉ hiển thị để xem. Xoá một hook sẽ khiến nó không chạy nữa, nhưng lịch sử vẫn được giữ để phục vụ audit.

> [!WARNING]
> Một hook chặn bị lỗi, hoặc hết thời gian chờ khi **On timeout** đặt là **Block**, sẽ dừng thao tác của agent. Hãy chạy thử bằng dry run trước khi bật hook.

## Gói runtime

**Gói runtime** hiển thị chính sách cài gói theo hình thức triển khai của bạn. Trên AaaS, người vận hành chọn lọc gói chung cho mọi workspace, nên bạn yêu cầu gói mới qua bộ phận hỗ trợ. Trên Dedicated và On-Premises, runtime của bạn tách biệt, nên có thể cài gói trực tiếp khi license còn hiệu lực, hoặc gửi yêu cầu để người vận hành xem xét. Tab **CLI Credentials** ghép cặp terminal của lập trình viên với runtime của workspace; bạn duyệt yêu cầu ghép cặp trong hộp ghép cặp.

## Giọng nói (TTS & STT)

**Giọng nói (TTS & STT)**, ở một số phiên bản menu có tên **Provider TTS**, quyết định cách agent nói và nghe trên các kênh. Với chuyển văn bản thành giọng nói, bạn chọn engine đang dùng (OpenAI, ElevenLabs, Edge, MiniMax hoặc Gemini), khi nào tổng hợp giọng (**Off**, **Inbound voice replies** hoặc **Always synthesize**), giới hạn ký tự và thời gian chờ, rồi kiểm tra kết nối hoặc tạo thử một đoạn âm thanh. Với chuyển giọng nói thành văn bản, bạn đặt provider chính và provider dự phòng. Key của provider chỉ ghi được, không đọc lại được.

## Liên quan

- [Tool và quyền hạn](/docs/concepts/tools-and-permissions)
- [Hook](/docs/concepts/hooks)
- [Webhook và MCP](/docs/api/webhooks-and-mcp)
- [Agent](/docs/console/agents)
- [Hỗ trợ và thanh toán](/docs/console/support-and-billing)
