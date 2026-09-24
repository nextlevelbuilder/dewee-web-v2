---
title: Tổng quan API
description: "REST API, WebSocket RPC, chat tương thích OpenAI, MCP server công khai và webhook của runtime: mỗi phần để làm gì, tài liệu ở đâu, lỗi trông ra sao."
section: api
order: 1
updated: 2026-09-25
---

API của runtime bao quát những gì agent làm và cách cấu hình chúng: agent, session, provider, channel, tool, bộ nhớ và nhiều thứ khác, nên các việc này tự động hoá được chứ không chỉ bấm tay. Những phần riêng của console như thành viên, thanh toán và hỗ trợ thì vẫn nằm trong console. Gateway phục vụ tất cả trên cùng một cổng: REST API dưới `/v1`, một WebSocket cho các phiên trực tiếp, và vài endpoint dành cho phần mềm khác gọi vào. Trang này vẽ bản đồ tổng thể; [Xác thực](/docs/api/authentication) giải thích về key, còn [Webhook và MCP](/docs/api/webhooks-and-mcp) nói về hai endpoint tích hợp.

## Base URL và tài liệu tham chiếu

Với runtime On-Premises mà bạn vận hành, base URL là địa chỉ gateway của bạn, ví dụ `https://dewee.example.com`. Trong console, trang **API key** hiển thị base URL cùng các ví dụ sẵn để sao chép bằng cURL, JavaScript, Python và WebSocket.

Mỗi gateway cũng tự xuất bản tài liệu tham chiếu của mình:

- `/docs` phục vụ giao diện Swagger UI để thử trực tiếp.
- `/v1/openapi.json` là đặc tả OpenAPI 3.0, dùng để sinh client.

Tài liệu trên gateway luôn khớp đúng phiên bản bạn đang chạy, nên hãy ưu tiên nó hơn mọi bản sao.

## Các bề mặt API

| Bề mặt | Đường dẫn | Dùng để |
|---|---|---|
| REST API | `/v1/...` | Quản lý agent, session, provider, skill, workflow, channel, bộ nhớ, file, mức sử dụng và nhiều thứ khác |
| WebSocket RPC | `/ws` | Chat trực tiếp có streaming, sự kiện của agent và nhóm agent, phê duyệt |
| Chat completions | `POST /v1/chat/completions` | Trò chuyện với agent từ bất kỳ client nào tương thích OpenAI |
| Responses | `POST /v1/responses` | Tương tự, cho client dùng định dạng OpenAI Responses |
| MCP server công khai | `POST /mcp` | Cho Claude Code, Cursor, VS Code hoặc Gemini CLI dùng tri thức và workflow của workspace |
| Webhook | `POST /v1/webhooks/llm`, `POST /v1/webhooks/message` | Cho hệ thống khác kích hoạt agent hoặc gửi tin nhắn qua một channel |
| Kiểm tra sức khoẻ | `/health`, `/livez`, `/readyz` | Cho load balancer và orchestrator; không cần xác thực |

## Trò chuyện với agent

Endpoint chat dùng định dạng OpenAI Chat Completions, nên các SDK sẵn có chạy được chỉ bằng cách đổi base URL và key. Chọn agent bằng tiền tố `agent:` trong `model`, hoặc bằng header `X-GoClaw-Agent-Id`; nếu không có cả hai, request đi tới agent tên `default`.

```bash
curl https://dewee.example.com/v1/chat/completions \
  -H "Authorization: Bearer <api-key>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "agent:<agent-key>",
    "messages": [{"role": "user", "content": "Summarise yesterday'\''s support tickets"}],
    "stream": false
  }'
```

Đặt `"stream": true` để nhận server-sent events, kết thúc bằng `data: [DONE]`. Để giữ một cuộc trò chuyện qua nhiều request, hãy gửi cùng một header `X-GoClaw-Session-Key` mỗi lần. Agent chạy trọn vòng lặp của nó, với tool, skill và bộ nhớ riêng, trước khi trả lời; xem [Vòng lặp agent](/docs/concepts/agent-loop).

## WebSocket RPC

WebSocket tại `/ws` là thứ console dùng cho chat trực tiếp. Frame đầu tiên phải là request `connect` kèm key của bạn; mọi thứ khác bị từ chối.

```json
{"type": "req", "id": "1", "method": "connect", "params": {"token": "<api-key>", "locale": "vi"}}
```

Phản hồi cho biết vai trò và tenant của bạn. Sau đó, mỗi request là một frame `req` có `method` và `params`, được trả lời bằng frame `res` có cùng `id`. Máy chủ đẩy các frame `event` cho câu trả lời dạng stream, lời gọi tool, task của nhóm agent, yêu cầu phê duyệt và cập nhật trace. Phiên bản protocol là 3; `/health` cũng báo con số này.

## Lỗi và giới hạn

- Lỗi trả về dạng JSON có trường `error` cùng các mã trạng thái quen thuộc: `400`, `401`, `403`, `404`, `409`, `429` và `500`.
- Trên WebSocket, request thất bại trả về `ok: false` kèm `code`, `message` của lỗi và gợi ý `retryable`.
- Chat bị giới hạn tần suất theo người dùng hoặc IP, mặc định 20 request mỗi phút; vượt ngưỡng sẽ nhận `429` kèm `Retry-After`.
- Body HTTP giới hạn 1 MB và frame WebSocket giới hạn 512 KB.

## Các nhóm route

| Nhóm | Ví dụ những gì bạn quản lý được |
|---|---|
| Agent và hội thoại | Agent và việc chia sẻ, session, task, skill, bộ nhớ theo sự kiện, knowledge graph, vault |
| Model và tool | Provider và model của họ, giá model, các MCP server mà dewee kết nối tới, custom tool, giọng nói |
| Channel và con người | Kết nối channel, danh bạ, người dùng trong tenant, nhóm agent, tin nhắn chờ |
| Tự động hoá | Workflow và các lượt chạy, webhook |
| Kiểm soát thực thi | Credential cho CLI, package, nhóm lệnh shell bị chặn |
| Quan sát | Trace, lượt chạy, chi phí, mức sử dụng, hoạt động |
| File | Lưu trữ, media và đường dẫn file có chữ ký |
| Quản trị | API key, tenant, cấu hình hệ thống, sao lưu và khôi phục |

Một số thao tác, như quản lý lịch chạy và chỉnh sửa session, chỉ có dưới dạng phương thức WebSocket. [CLI](/docs/runtime/cli) bao cả hai bề mặt, và thường là cách nhanh nhất để viết script.
