---
title: Gắn agent lên website của bạn
description: "Đưa agent dewee lên bất kỳ website nào với dewee-webchat, widget chat mã nguồn mở: một thẻ script hoặc component React, Vue, Astro, kèm một backend handler nhỏ."
section: integrations
order: 3
updated: 2026-11-09
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

## Ngữ cảnh trang cho một tin nhắn

Với tích hợp có thu thập trang hiện tại, gateway có hợp đồng ngữ cảnh trang theo phiên bản. Tính năng phụ thuộc vào gateway và website-chat ingress đã triển khai: hãy kiểm tra hỗ trợ trước khi gửi. Không mặc định rằng widget hoặc backend hiện có tự thu thập hay chuyển tiếp ngữ cảnh trang.

- Với client WebSocket của Gateway, kiểm tra `page_context_versions` trong phản hồi `connect`. Nếu danh sách có `1`, gửi ngữ cảnh qua `pageContext` trong `chat.send`.
- Với client tự xây cho website-chat ingress của customer control plane, kiểm tra `page_context.versions` trong `GET config`. Nếu danh sách có `1`, gửi ngữ cảnh qua `page_context` trong body của `POST chat`. Nếu danh sách thiếu hoặc không có `1`, gửi tin nhắn không kèm ngữ cảnh.

Phiên bản 1 bắt buộc có `version` và `url` HTTP(S) tuyệt đối. Các trường tuỳ chọn gồm `title`, `description`, `captured_at`, `selection`, và `content` với `format` (`text` hoặc `markdown`), `text`, `truncated`. Toàn bộ JSON sau mã hoá tối đa 64 KiB; trường không được nhận diện sẽ bị từ chối. Host có thể gửi `source` và `trust_level`, nhưng runtime bỏ qua giá trị được gửi và tự gán. Gateway còn giới hạn từng trường, bỏ fragment của URL, che giá trị query có vẻ là bí mật và thông tin xác thực, đồng thời từ chối URL chứa userinfo.

Gateway coi ngữ cảnh là dữ liệu bên ngoài không đáng tin cậy chỉ cho lượt chạy hiện tại, không phải chỉ dẫn. Nội dung trang không được lưu vào lịch sử chat, bản tóm tắt, memory, log hay nội dung trace, và không thay đổi tool hoặc quyền. Nếu ngữ cảnh bị từ chối, toàn bộ lần gửi thất bại với `page_context_invalid` hoặc `page_context_unsupported`; chỉ gửi lại không kèm ngữ cảnh nếu người dùng vẫn muốn gửi tin nhắn. Không nối nội dung trang vào tin nhắn để thay thế. CLI và MCP không có trang để đính kèm nên hợp đồng này không áp dụng.

## Yêu cầu thông tin xác thực trong chat website

Khi gateway và widget hỗ trợ, agent có thể dùng một thẻ trong cuộc trò chuyện trên website để yêu cầu thông tin xác thực từ thành viên workspace đã đăng nhập. Tính năng này mặc định tắt. Gateway phải kiểm tra cả danh tính chat của khách lẫn tư cách thành viên workspace hiện tại ở phía server; chỉ xác minh danh tính chat là chưa đủ. Giữ tính năng tắt trên những phiên bản gateway chưa thực thi kiểm tra thành viên này. Khách ẩn danh không dùng được thẻ, và tư cách thành viên không cấp quyền quản trị thông tin xác thực.

Trên gateway tự host có hỗ trợ, đặt `GOCLAW_WEBCHAT_CREDENTIAL_REQUESTS_ENABLED=true` và cấu hình `GOCLAW_CREDENTIAL_LINK_BASE_URL`. Bật `credential_requests` cho agent và dùng widget công bố hỗ trợ yêu cầu thông tin xác thực. Để thành viên liên kết danh tính chat website, đặt thêm `GOCLAW_IDENTITY_EXCHANGE_ENABLED=true` và `GOCLAW_WEBCHAT_MEMBER_LINK_PROOF_ENABLED=true`. Hãy kiểm tra phiên bản gateway và widget đã triển khai trước khi bật các thiết lập này.

Trong **Tài khoản tôi đã liên kết** của workspace, bắt đầu liên kết và sao chép mã dùng một lần. Trong chat website đã đăng nhập, chọn **Liên kết tài khoản workspace**, nhập mã vào biểu mẫu riêng, rồi quay lại workspace để kiểm tra và xác nhận tài khoản. Không đưa mã vào tin nhắn hoặc nội dung trang được chia sẻ.

Thẻ không bao giờ hiển thị secret. Chọn **Mở biểu mẫu bảo mật** để mở biểu mẫu do chính Dewee cung cấp ở tab mới. Quản trị viên workspace có quyền phê duyệt phải đăng nhập và nhập secret tại đó, không nhập vào chat. Yêu cầu hết hạn sau một giờ và có thể hủy ngay trên thẻ. Sau khi lưu thông tin xác thực, cuộc trò chuyện ban đầu tiếp tục một lần từ chỗ đã dừng. Tải lại trang sẽ khôi phục trạng thái hiện tại: đang chờ, hoàn tất, hết hạn hoặc đã hủy. Việc mở biểu mẫu bảo mật được giới hạn theo từng khách.

Chat website dùng luồng riêng chỉ dành cho thành viên. Với liên kết nhập thông tin xác thực được gửi qua kênh nhắn tin, xem [Secret, vai trò và audit](/vi/docs/security/secrets-roles-and-audit).

## Ảnh công khai trên Cloudflare Workers

Khi phiên bản webchat đã triển khai hỗ trợ service binding cho ảnh công khai, Worker có thể tải ảnh từ thư mục được cho phép trên hostname cùng zone Cloudflare. Cấu hình cả nguồn ảnh và service binding trong handler phía server, đồng thời cho phép origin bên ngoài trong widget:

```ts
createDeweeHandler({
  // Các tùy chọn backend khác, gồm thông tin xác thực của integration
  imageSources: ["https://images.example.com/products/"],
  cloudflarePublicImageServices: [
    { id: "catalog-v1", binding: env.PUBLIC_IMAGES, prefixes: ["https://images.example.com/products/"] },
  ],
});
```

Cấu hình `PUBLIC_IMAGES` làm Worker service binding và thêm `https://images.example.com` vào `imageOrigins` của widget. Cả tiền tố nguồn và service đều phải cho phép ảnh. Mỗi service cần ID riêng và các tiền tố không được chồng lấn; đổi ID mỗi khi binding trỏ sang service khác để ticket cũ không truy cập service mới.

Binding gọi trực tiếp Worker đích và bỏ qua các quy tắc bảo mật Cloudflare của hostname nguồn. Mọi thư mục được cấu hình phải công khai với tất cả khách chat; không liên kết service hoặc đường dẫn riêng tư. Worker đích nhận GET cho đường dẫn được phép, không có query gốc, cookie hay header xác thực. Phản hồi không hợp lệ bị từ chối, không gọi mạng dự phòng. Xem [cấu hình ảnh của package](https://github.com/nextlevelbuilder/dewee-webchat#markdown-images) để biết đầy đủ yêu cầu.

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
