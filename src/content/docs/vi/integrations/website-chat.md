---
title: Gắn agent lên website của bạn
description: "Đưa agent dewee lên bất kỳ website nào với dewee-webchat, widget chat mã nguồn mở: một thẻ script hoặc component React, Vue, Astro, kèm một backend handler nhỏ."
section: integrations
order: 3
updated: 2026-10-10
---

[dewee-webchat](https://github.com/nextlevelbuilder/dewee-webchat) là widget chat mã nguồn mở (MIT) giúp bạn đặt một agent lên chính website của mình. Khách truy cập trò chuyện với agent qua bong bóng chat nổi hoặc khung chat gắn trong trang, và thấy được agent làm việc: phần suy luận, các tool nó gọi cùng kết quả, và câu trả lời dạng Markdown. Gói này có trên npm với tên `dewee-webchat`.

Hãy thử trước trên [playground](https://webchat.dewee.sh). Form ở đó cho bạn chọn tuỳ chọn và sinh sẵn đoạn mã nhúng cho framework bạn dùng.

## Các phần ghép với nhau ra sao

Widget không bao giờ nói chuyện trực tiếp với gateway dewee của bạn. Ở giữa là một backend nhỏ do bạn tự host, và chỉ backend này giữ gateway token:

```text
browser <dewee-chat>  ──HTTPS + SSE──▶  your backend /api/dewee/*  ──WebSocket──▶  dewee gateway
   (visitor token only)                   (holds the gateway token)                (agents, MCP, tools)
```

- **Widget** là một Web Component, `<dewee-chat>`, hiển thị trong Shadow DOM nên CSS của website và của widget không giẫm lên nhau. Đi kèm có wrapper cho React (`dewee-webchat/react`), Vue (`dewee-webchat/vue`), Astro (`dewee-webchat/astro`), và một thẻ script tự gắn widget dựa trên các thuộc tính `data-*`.
- **Backend** là `createDeweeHandler` từ `dewee-webchat/server`, một handler chuẩn `(Request) => Response` gắn tại `/api/dewee/*`. Handler chạy được trên Cloudflare Workers, Next.js, Astro, Bun, Deno và Node (qua `toNodeHandler`). Nếu hosting của bạn là PHP, có sẵn backend một file `php/dewee-webchat.php`, không cần Composer.

## 1. Tạo API key giới hạn quyền

Cấp cho website một key riêng, chỉ đủ quyền cho việc chat:

```bash
dewee api-keys create --name "website chat" --scopes operator.read,operator.write
```

Key này chỉ nằm trên server của bạn. Xem [Xác thực](/docs/api/authentication) để biết từng scope cho phép những gì.

## 2. Gắn backend

Cài gói và gắn handler. Với một dự án Next.js dùng App Router:

```bash
npm i dewee-webchat
```

```ts
// app/api/dewee/[...path]/route.ts
import { createDeweeHandler, optionsFromEnv } from "dewee-webchat/server";

export const dynamic = "force-dynamic";
const handler = createDeweeHandler(optionsFromEnv(process.env));
export { handler as GET, handler as POST, handler as OPTIONS };
```

Với Express, gắn `toNodeHandler(createDeweeHandler(optionsFromEnv(process.env)))` tại `/api/dewee/*path`. Repository có ví dụ chạy được cho từng runtime.

Sau đó đặt các biến môi trường trên server:

| Biến | Chứa gì |
|---|---|
| `DEWEE_GATEWAY_URL` | Địa chỉ gateway của bạn |
| `DEWEE_GATEWAY_TOKEN` | Key ở bước 1. Chỉ nằm trên server, không bao giờ gửi xuống trình duyệt |
| `DEWEE_WEBCHAT_SECRET` | Một chuỗi bí mật ngẫu nhiên từ 32 ký tự trở lên, dùng để ký phiên của khách |
| `DEWEE_AGENTS` | Các agent khách được phép trò chuyện, cách nhau bằng dấu phẩy (`support,sales`) |
| `DEWEE_DEFAULT_AGENT` | Không bắt buộc; agent mở đầu mỗi cuộc chat mới |
| `DEWEE_ALLOWED_ORIGINS` | Không bắt buộc; các website khác được phép nhúng widget (cùng origin thì luôn được) |
| `TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Không bắt buộc; kiểm tra khách mới bằng Cloudflare Turnstile |

## 3. Thêm widget

Cách nhanh nhất là thẻ script từ CDN, không cần bước build:

```html
<script
  src="https://webchat-cdn.dewee.sh/dewee-webchat@0.1.1/dewee-webchat.js"
  data-endpoint="/api/dewee"
  data-title="Hỗ trợ"
  defer
></script>
```

Trong ứng dụng React, Vue hoặc Astro, import `DeweeChat` từ wrapper tương ứng và truyền `endpoint="/api/dewee"`. Ở những nơi khác, import `dewee-webchat` rồi viết `<dewee-chat endpoint="/api/dewee"></dewee-chat>`.

## Tuỳ chọn

Tuỳ chọn là thuộc tính kebab-case trên `<dewee-chat>`, thuộc tính `data-*` trên thẻ script, hoặc prop camelCase trong các wrapper.

| Tuỳ chọn | Tác dụng |
|---|---|
| `mode` | `floating` (bong bóng mở ra khung chat) hoặc `inline` (lấp đầy khung chứa) |
| `theme` | `light`, `dark` hoặc `auto` |
| `accent-color` | Màu nhấn, nhận mọi giá trị màu CSS |
| `locale` | `en` hoặc `vi`; mặc định theo ngôn ngữ của trang |
| `show-reasoning` | Stream phần suy luận của model |
| `show-tool-calls` | Hiện các lần gọi tool kèm tham số và kết quả |
| `allow-agent-switch` | Cho khách chọn agent khác trong danh sách được phép |
| `persist` | Giữ cuộc trò chuyện khi tải lại trang |

Từ script của bạn, có thể gọi `open()`, `close()`, `toggle()`, `send(text)`, `stop()`, `newConversation()`, và lắng nghe các sự kiện `dewee:ready`, `dewee:open`, `dewee:close`, `dewee:send`, `dewee:reply`, `dewee:error`.

## Bảo mật

- **Gateway token ở yên trên server.** Trình duyệt chỉ giữ một visitor token được ký bằng HMAC.
- **Mỗi khách là một user riêng** trên gateway, `webchat-<id>`, nên lịch sử chat của ai chỉ người đó xem được.
- **Allowlist**: khách chỉ tới được các agent trong `DEWEE_AGENTS`, và chỉ từ các origin được phép.
- **Giới hạn**: 20 tin mỗi phút cho mỗi khách, 10 phiên mới mỗi 10 phút cho mỗi địa chỉ IP, và 4.000 ký tự mỗi tin.
- **Chặn bot**: bật Cloudflare Turnstile để kiểm tra khách mới.

> [!TIP]
> Chat trên website là nói chuyện với người lạ. Chỉ cấp cho agent đó những tool và tri thức mà người ngoài được phép chạm tới, cẩn thận như với một channel để `open`. Xem [Tool và quyền hạn](/docs/concepts/tools-and-permissions).

## Ví dụ chạy thật

| Stack | Bản demo |
|---|---|
| HTML thuần trên Worker (chính là playground) | [webchat.dewee.sh](https://webchat.dewee.sh) |
| Next.js | [webchat-next.dewee.sh](https://webchat-next.dewee.sh) |
| Astro | [webchat-astro.dewee.sh](https://webchat-astro.dewee.sh) |
| React | [webchat-react.dewee.sh](https://webchat-react.dewee.sh) |
| Vue | [webchat-vue.dewee.sh](https://webchat-vue.dewee.sh) |

Ví dụ cho Node với Express và cho PHP nằm trong [repository](https://github.com/nextlevelbuilder/dewee-webchat), cùng toàn bộ tuỳ chọn và định dạng giao tiếp giữa widget với backend.
