---
title: Provider LLM và giọng nói
description: Các model provider mà dewee kết nối được, từ Anthropic, OpenAI, Gemini tới Ollama chạy nội bộ và coding agent, cùng các provider giọng nói cho tính năng thoại.
section: integrations
order: 2
updated: 2026-09-25
---

dewee không kèm model riêng. Mỗi workspace kết nối các provider mà bạn đang dùng, bằng key hoặc gói thuê bao của chính bạn, và bạn trả tiền trực tiếp cho provider; giá của chúng tôi không bao giờ gồm chi phí model. Sau đó mỗi agent chọn một provider và model, cùng các provider khác làm dự phòng. Trang này liệt kê những gì bạn kết nối được. Cách chọn provider khi chạy nằm ở [Provider, fallback và suy luận](/docs/concepts/providers-and-routing), còn các bước trong console nằm ở [Provider và model](/docs/console/providers-and-models).

## Các provider được hỗ trợ

| Nhóm | Provider |
|---|---|
| Hãng làm model | Anthropic, OpenAI hoặc bất kỳ endpoint tương thích OpenAI nào, Google Gemini, Google Vertex AI, xAI (Grok), Mistral AI, DeepSeek, Cohere, Perplexity |
| Nền tảng khu vực và gói coding | DashScope (Qwen), Bailian Coding, Z.ai và Z.ai Coding Plan, BytePlus ModelArk và BytePlus Coding Plan, Kimi Coding (Moonshot), MiniMax |
| Router và gateway | OpenRouter, Groq, Novita AI, YesScale, Cloudflare Workers AI, Vercel AI Gateway, ClinePass, OpenCode Go |
| Chạy nội bộ và tự host | Ollama trên phần cứng của bạn, Ollama Cloud |
| Gói thuê bao và coding agent | Gói ChatGPT (OAuth), Claude CLI, và các coding agent qua ACP như Claude Code, Codex CLI và Gemini CLI |

Bên dưới, các provider này chạy trên sáu adapter: API gốc của Anthropic, một adapter tương thích OpenAI bao phần lớn danh sách, Claude CLI, backend của gói ChatGPT, ACP cho coding agent, và DashScope. Provider nào nói chuẩn API của OpenAI mà chưa có trong danh sách thì thêm được dưới dạng **OpenAI Compatible** với base URL của nó.

## Mỗi loại cần gì

| Loại | Bạn cung cấp | Ghi chú |
|---|---|---|
| API key | Key, và base URL nếu provider cần | Trường hợp phổ biến |
| OAuth | Đăng nhập vào tài khoản của provider | Gói ChatGPT |
| Binary nội bộ | Một CLI cài trên máy chủ chạy runtime | Claude CLI và agent ACP chạy như tiến trình trên máy chủ đó |
| Server nội bộ | Địa chỉ của model server | Ollama; runtime phải truy cập được tới nó |

Sau khi lưu provider, hãy **verify** để xác nhận credential và model hoạt động. Một lần kiểm tra thành công phản ánh quyền truy cập ở thời điểm đó, không phản ánh thay đổi sau này của tài khoản hay gói dịch vụ.

## Cách xử lý key

- Key được mã hoá khi lưu bằng encryption key của runtime.
- API không bao giờ trả về key đã lưu. Khi đọc sẽ thấy `***`, và lưu một form vẫn hiển thị `***` sẽ giữ nguyên key cũ.
- Provider lưu qua console hoặc API được ưu tiên hơn provider trong file cấu hình của runtime.
- Chỉ người có quyền quản lý provider mới thêm, sửa hoặc xoá được provider. Xem [Secret, vai trò và nhật ký kiểm toán](/docs/security/secrets-roles-and-audit).

## Chi phí và giới hạn

Trên edition Standard, admin có thể đặt trần token hoặc chi phí cho một workspace, một agent, một provider, một loại provider hoặc một model, và lời gọi nào sẽ vượt trần bị chặn trước khi gửi đi. Giá của các provider dùng API key lấy từ danh mục model của OpenRouter, và admin có thể ghi đè. Các provider dạng thuê bao như gói ChatGPT, Claude CLI và Bailian Coding không tính giá theo token, còn provider nội bộ như Ollama và agent ACP không được tính. Chi phí hiện trên trang **Mức sử dụng**.

## Embedding

Tìm kiếm vector trên bộ nhớ và kho tri thức dùng một embedding model, là `text-embedding-3-small` của OpenAI hoặc Voyage. Tính năng này cần PostgreSQL có pgvector; edition Lite chỉ tìm theo từ khoá.

## Giọng nói

Agent có thể nghe và nói khi đã cấu hình provider giọng nói:

| Chiều | Provider |
|---|---|
| Giọng nói thành văn bản, cho tin nhắn thoại trong chat | Soniox, ElevenLabs, hoặc một dịch vụ proxy bạn tự chạy |
| Văn bản thành giọng nói, cho câu trả lời bằng giọng | OpenAI, ElevenLabs, Edge, MiniMax, Gemini |

Tin nhắn thoại được chuyển thành văn bản trên Telegram, Discord và Feishu; trên WhatsApp, việc này tắt cho tới khi admin bật lên. Xem [Kênh chat](/docs/integrations/channels).

## Từ dòng lệnh

Trên runtime On-Premises của bạn, `dewee providers` liệt kê, thêm, cập nhật, xoá và verify provider, còn `dewee tts` liệt kê provider giọng nói, danh sách giọng và kiểm tra kết nối tới một provider. Xem [CLI](/docs/runtime/cli).

Danh sách đầy đủ các đối tác và nền tảng nằm ở trang [Tích hợp](/integrations).
