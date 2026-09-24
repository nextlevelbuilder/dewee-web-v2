---
title: Câu hỏi thường gặp
description: "Trả lời thẳng những gì CTO và người vận hành hay hỏi về dewee: tên GoClaw, dữ liệu nằm ở đâu, kiểm tra license, mặc định an toàn, model, sao lưu và kênh chat."
section: resources
order: 1
updated: 2026-09-25
---

Câu hỏi về giá, gói dịch vụ và thanh toán được trả lời ở [trang bảng giá](/pricing). Trang này tập trung vào phần kỹ thuật.

## Sản phẩm

### dewee có phải mã nguồn mở không?

Không. dewee lớn lên từ GoClaw nhưng là sản phẩm riêng, mã nguồn đóng, có console cho khách hàng, license và đội ngũ hỗ trợ bạn. GoClaw vẫn mở và miễn phí cho mục đích phi thương mại.

### Vì sao một số cài đặt và header mang tên GoClaw?

GoClaw là tên gốc của runtime, và nhiều biến môi trường (`GOCLAW_*`) cũng như HTTP header (`X-GoClaw-*`) vẫn dùng tên này. Khi có biến `DEWEE_*` tương ứng, như `DEWEE_SERVER` hay `DEWEE_API_KEY` cho CLI, biến đó được ưu tiên. Hãy dùng đúng tên như trong tài liệu.

### Dùng được những model nào?

Anthropic, OpenAI, Gemini, DeepSeek, Qwen, Mistral, xAI, OpenRouter, Groq, Ollama và nhiều provider khác, kể cả bất kỳ endpoint nào tương thích OpenAI. Bạn dùng key của chính mình và trả tiền trực tiếp cho provider. Xem [Provider LLM và giọng nói](/docs/integrations/llm-providers).

### Những ứng dụng chat nào đã sẵn sàng cho môi trường thật?

Telegram đã được kiểm chứng với người dùng thật. Slack, Discord, WhatsApp, Feishu/Lark, Zalo OA và Zalo Personal đã được xây dựng nhưng chưa được kiểm thử đầu cuối trong môi trường thật, nên hãy thử với một nhóm nhỏ trước. Xem [Kênh chat](/docs/integrations/channels).

## Dữ liệu và triển khai

### Dữ liệu của chúng tôi nằm ở đâu?

Trong cơ sở dữ liệu và bộ lưu trữ file của runtime, tức là trên hạ tầng của bạn. Tại Việt Nam, dewee chỉ được cung cấp dưới dạng On-Premises: runtime chạy trên VPS hoặc Mac mini do công ty bạn quản lý, và chúng tôi cài đặt cùng bạn. Xem [Chọn cách triển khai](/docs/get-started/deployment-options).

### Runtime On-Premises gửi gì về cho các bạn?

Một lần kiểm tra license mỗi năm phút, dùng mã kích hoạt và credential của runtime chứ không gửi license key gốc. Nếu không kết nối được tới dịch vụ license của chúng tôi, runtime vẫn chạy tối đa 24 giờ kể từ lần kiểm tra thành công gần nhất. Xem [Kích hoạt license](/docs/runtime/licence).

### Runtime cần cơ sở dữ liệu nào?

PostgreSQL có extension pgvector cho edition Standard. Với SQLite, runtime chạy ở edition Lite, giới hạn thấp hơn và không có workflow, phân quyền theo vai trò, knowledge graph hay tìm kiếm vector. Xem [Cài đặt và chạy gateway](/docs/runtime/install-and-run#edition).

### Một runtime có phục vụ được nhiều đội hoặc nhiều khách hàng không?

Có. Mỗi tenant được tách biệt: agent, session, bộ nhớ, provider và tool thuộc về đúng một tenant, và mọi truy vấn đều bị giới hạn trong tenant đó. Xem [Tách biệt đa tenant](/docs/concepts/multi-tenancy).

## Bảo mật

### Runtime mới có được khoá chặt theo mặc định không?

Phần biên thì có: gateway không khởi động trên địa chỉ mạng nếu thiếu gateway token, và người gửi mới trên các channel tạo từ console phải chờ duyệt ghép cặp. Còn những gì agent được làm thì ban đầu cố ý để rộng: tool profile đầy đủ, không cần phê duyệt lệnh và không có sandbox. Hãy siết lại trước khi agent chạm vào dữ liệu thật; [tổng quan bảo mật](/docs/security/overview#trước-khi-chạy-thật) có danh sách kiểm tra.

### Key của provider và các secret khác được bảo vệ thế nào?

Chúng được mã hoá trong cơ sở dữ liệu bằng encryption key của runtime, và API không bao giờ trả chúng về. API key chỉ được lưu dưới dạng hash. Xem [Secret, vai trò và nhật ký kiểm toán](/docs/security/secrets-roles-and-audit).

### Nếu agent làm sai thì sao?

Mọi lượt chạy đều để lại trace gồm các lời gọi model và tool, lệnh shell rủi ro có thể yêu cầu phê duyệt, và bạn có thể dừng câu trả lời trong khung chat của console hoặc gửi `/stop` trong channel chat. Xem [Vòng lặp agent](/docs/concepts/agent-loop).

## Vận hành

### Sao lưu và nâng cấp thế nào?

`dewee backup` ghi cơ sở dữ liệu và file dữ liệu vào một archive, còn `dewee restore smoke` chứng minh archive khôi phục được trước khi bạn thật sự cần. `dewee upgrade` đưa schema lên phiên bản mới và chạy lại nhiều lần vẫn an toàn. Xem [Sao lưu và khôi phục](/docs/runtime/install-and-run#sao-lưu-và-khôi-phục) và [Nâng cấp](/docs/runtime/install-and-run#nâng-cấp).

### Có tự động hoá được những gì làm trong console không?

Phần lớn là được. Agent, session, provider, channel, tool và bộ nhớ đều được quản lý qua API của runtime, và CLI `dewee` bao quát cùng phạm vi đó. Thành viên, thanh toán và hỗ trợ thì vẫn nằm trong console. Xem [Tổng quan API](/docs/api/overview) và [CLI](/docs/runtime/cli).

### Có dùng workspace từ trình soạn thảo code được không?

Được, qua endpoint MCP công khai của runtime, mặc định tắt trên runtime On-Premises. Sau khi bật, Claude Code, Cursor, VS Code và Gemini CLI có thể tìm trong bộ nhớ và skill và làm việc với workflow. Xem [Webhook và MCP](/docs/api/webhooks-and-mcp#mcp-server-công-khai).

### Cần hỗ trợ thì tìm ở đâu?

Mở **Hỗ trợ** trong console, hoặc [liên hệ với chúng tôi](/contact).
