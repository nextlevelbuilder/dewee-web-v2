---
title: Extension cho Chrome
description: "Trò chuyện với agent dewee trong side panel của Chrome và trả lời yêu cầu credential mà không dán secret vào chat, trên Dewee Cloud hoặc gateway tự host."
section: integrations
order: 4
updated: 2026-10-11
---

[Dewee Chrome extension](https://github.com/nextlevelbuilder/dewee-chrome-ext) (MIT) mở một side panel bên phải Chrome để bạn trò chuyện với các agent dewee. Super Agent luôn được ghim lên đầu. Khi agent cần một API key hay một kết nối OAuth, panel hiện thẻ credential, nên bạn không bao giờ phải dán secret vào chat.

Extension chỉ là một client mỏng. Server dewee của bạn vẫn nắm agent, phiên chat, quyền hạn và kho credential mã hoá, còn panel không bao giờ đọc các trang bạn đang xem.

## Cài extension

Bạn cần Chrome 116 trở lên. Extension chưa có trên Chrome Web Store, nên bạn tự nạp vào:

1. Lấy bản build. Tải file zip đính kèm một bản phát hành trên trang [Releases](https://github.com/nextlevelbuilder/dewee-chrome-ext/releases) của repository rồi giải nén, hoặc tự build từ mã nguồn bằng `pnpm install` và `pnpm build` (kết quả nằm ở `.output/chrome-mv3`).
2. Mở `chrome://extensions` và bật **Developer mode** (Chế độ dành cho nhà phát triển).
3. Chọn **Load unpacked** (Tải tiện ích đã giải nén) và chọn thư mục vừa giải nén (hoặc `.output/chrome-mv3`).
4. Ghim extension, rồi bấm vào biểu tượng của nó hoặc nhấn `Alt+Shift+D` để mở panel.

> [!NOTE]
> Extension cần phía server tương ứng: một gateway dewee có browser extension API (`/v1/extension`), hoặc Dewee Cloud có hỗ trợ đăng nhập từ extension. Nếu gateway của bạn là bản cũ, hãy cập nhật trước khi kết nối.

## Kết nối

Màn hình đầu tiên, **Kết nối Dewee**, có hai chế độ. Bạn có thể thêm kết nối khác sau này trong **Cài đặt** và chuyển qua lại ngay trên đầu panel.

### Dewee Cloud

1. Chọn **Dewee Cloud**, đặt tên cho hồ sơ nếu muốn, rồi chọn **Đăng nhập với Dewee**.
2. Chấp thuận quyền truy cập trên Dewee. Việc đăng nhập dùng OAuth với PKCE, nên extension không bao giờ thấy mật khẩu của bạn.
3. Quay lại panel và chọn workspace. Mọi workspace bạn là thành viên đều hiện ra; workspace *bị tạm ngưng* hoặc *chưa sẵn sàng* vẫn có trong danh sách nhưng không chọn được.

### Gateway tự host

1. Nhờ người vận hành gateway cho phép origin của extension. Mặc định gateway không cho extension nào truy cập; hãy thêm đúng origin này vào `GOCLAW_ALLOWED_ORIGINS`:

   ```bash
   GOCLAW_ALLOWED_ORIGINS=chrome-extension://poicgajeapmbcilfbeobdfedibiffbbm
   ```

   Id này thuộc về bản phát hành và bản build từ mã nguồn. Bản trên Chrome Web Store sau này sẽ có id riêng.

2. Tạo một API key cá nhân gắn với người dùng và tenant của bạn, có `operator.read` và `operator.write`:

   ```bash
   dewee api-keys create --name chrome-extension --scopes operator.read,operator.write --tenant-id <tenant> --owner-id <you>
   ```

   Key không gắn owner và tenant sẽ bị từ chối. Xem [Xác thực](/docs/api/authentication) để biết về scope.

3. Trong panel, chọn **Gateway tự host**, nhập **URL Gateway** và **API key cá nhân**, rồi chọn **Kết nối**. Chrome sẽ hỏi quyền truy cập đúng một địa chỉ đó; hãy cho phép.

URL phải dùng HTTPS. HTTP thường chỉ dùng được cho `localhost` và `127.0.0.1`, để phát triển, và panel sẽ cảnh báo rằng dữ liệu không được mã hoá. Extension kiểm tra key với gateway trước khi lưu bất cứ thứ gì, nên key bị từ chối sẽ không bao giờ được lưu.

> [!CAUTION]
> Không bao giờ dùng gateway master token trong extension. Gateway từ chối token này trên các route của extension, còn key cá nhân giới hạn panel trong những gì bạn được làm ở một tenant.

## Trò chuyện

- **Chọn agent.** Bộ chọn agent trên đầu panel có ô **Tìm agent**. Danh sách chỉ gồm các agent đang hoạt động mà bạn được phép trò chuyện, với Super Agent đứng đầu.
- **Cuộc trò chuyện.** Mỗi agent giữ các cuộc trò chuyện riêng. Mở **Cuộc trò chuyện** để quay lại một cuộc cũ, hoặc chọn **Chat mới** (`Alt+N`) để bắt đầu lại.
- **Trong lúc câu trả lời đang stream,** bạn thấy phần suy nghĩ của agent và các tool nó chạy. Chọn **Dừng**, hoặc nhấn `Esc`, để dừng câu trả lời.
- **Lịch sử.** Tin nhắn cũ hơn được tải bằng **Tải tin nhắn cũ hơn**.
- **Khi gửi thất bại,** chọn **Gửi lại** trên tin nhắn bị lỗi. Panel không bao giờ tự gửi lại.

Nếu bạn đóng panel, hoặc mất kết nối khi câu trả lời đang chạy, không có gì bị mất hay bị gửi hai lần. Khi bạn quay lại, panel hỏi server xem câu trả lời còn chạy không, tải lại cuộc trò chuyện cùng các thẻ đang mở, và hiện *Đang kết nối lại với câu trả lời đang chạy…* trong lúc bắt kịp.

| Phím | Tác dụng |
|---|---|
| `Enter` / `Shift+Enter` | Gửi / xuống dòng |
| `Esc` | Dừng câu trả lời |
| `Alt+N` | Chat mới |
| `/` | Đưa con trỏ vào ô nhập tin |

## Thẻ credential

Khi agent cần một credential, một thẻ hiện ra trong cuộc trò chuyện thay vì yêu cầu bạn gõ vào chat.

- **Yêu cầu secret.** Một form cho biết giá trị sẽ được lưu vào đâu (ví dụ *Lưu vào AI provider openai*) và việc này thêm credential mới hay thay thế credential đã lưu. Muốn thay thế phải bấm thêm bước **Thay thế thông tin xác thực đã lưu**. Nhập giá trị rồi chọn **Lưu an toàn**.
- **Yêu cầu OAuth.** Một thẻ báo rằng bạn sẽ đăng nhập trên chính trang của nhà cung cấp. Chọn **Mở Dewee để đăng nhập**, làm xong ở đó, rồi chọn **Tôi đã đăng nhập**. Dewee kiểm tra ở phía server rằng việc đăng nhập đã thật sự hoàn tất.

Secret của bạn đi đâu:

- Chỉ tới respond endpoint của thẻ trên server dewee, không bao giờ vào chat, vào bộ nhớ hay log của extension. Form xoá giá trị trước cả khi gửi request.
- Chỉ người có quyền owner hoặc admin trong workspace mới gửi được thẻ. Thành viên khác vẫn thấy thẻ nhưng không trả lời được.
- Agent chỉ nhận một tham chiếu tới credential, không bao giờ nhận giá trị: *Đã lưu. Agent chỉ nhận một tham chiếu, không bao giờ nhận giá trị.*

Biểu tượng trên thanh công cụ có badge đếm số thẻ đang chờ trong workspace bạn đang chọn, nên bạn vẫn biết có yêu cầu ngay cả khi panel đang đóng.

Agent setup có thể tạo các thẻ này sẵn. Agent khác chỉ được hỏi credential sau khi owner hoặc admin của workspace cấp cho nó capability `credential_request`, kèm allowlist các đích nó được hỏi (ví dụ một loại provider, để tạo mới hoặc cập nhật). Có capability này không bao giờ cho agent đọc, duyệt hay tự gửi credential. Capability này cần một phiên bản gateway có hỗ trợ nó; policy được quản lý qua gateway API.

## Credential của bạn được giữ ở đâu

Mặc định extension chỉ giữ token Cloud hoặc API key trong bộ nhớ, và xoá khi bạn đóng Chrome. Tích **Ghi nhớ trên thiết bị này** khi kết nối để giữ chúng trên máy cho tới khi bạn đăng xuất hoặc xoá kết nối. Cách này tiện, nhưng ai truy cập được hồ sơ Chrome của bạn cũng dùng được chúng, nên đừng bật trên máy dùng chung.

Trong **Cài đặt**, mỗi kết nối có **Kiểm tra**, **Đăng xuất** và **Xoá**:

- **Đăng xuất** xoá credential đã lưu. Với Dewee Cloud, thao tác này còn thu hồi phiên đăng nhập trên server.
- **Xoá** đăng xuất, xoá kết nối và gỡ quyền truy cập địa chỉ đó của Chrome nếu không còn kết nối nào khác dùng nó.
- API key tự host vẫn còn hiệu lực trên gateway cho tới khi bị thu hồi ở đó. Hãy thu hồi key trong dewee khi bạn thôi dùng extension hoặc mất thiết bị.

Khi một credential không còn dùng được (hết hạn, bị thu hồi hoặc bị từ chối), panel xoá nó và yêu cầu bạn kết nối lại đúng kết nối đó. Panel không bao giờ tự chuyển sang workspace hay kết nối khác.

## Cài đặt của extension

Mở **Cài đặt** bằng biểu tượng bánh răng trên đầu panel.

| Mục | Lựa chọn |
|---|---|
| **Ngôn ngữ** | Theo trình duyệt, English hoặc Tiếng Việt |
| **Giao diện** | Theo hệ thống, Sáng hoặc Tối |
| **Kết nối** | Thêm, dùng, kiểm tra, đăng xuất hoặc xoá một kết nối |

Phím tắt `Alt+Shift+D` để mở panel có thể đổi tại `chrome://extensions/shortcuts`.

## Xử lý sự cố

| Bạn thấy | Cách xử lý |
|---|---|
| *Hãy dùng HTTPS. HTTP thường chỉ dùng được cho localhost.* | Dùng địa chỉ `https://` của gateway. HTTP chỉ dành cho gateway chạy trên chính máy này. |
| *Chrome chưa cấp quyền truy cập địa chỉ này…* | Chọn **Kết nối** lại và cho phép khi Chrome hỏi. |
| *Không kết nối được máy chủ. Kiểm tra mạng của bạn.* với gateway tự host | Kiểm tra URL và mạng. Nếu gateway vẫn truy cập được, nhiều khả năng `GOCLAW_ALLOWED_ORIGINS` chưa có `chrome-extension://poicgajeapmbcilfbeobdfedibiffbbm`. |
| *Key này không phải key cá nhân…* (`owner_binding_required`) | Tạo key có cả `--tenant-id` lẫn `--owner-id`. |
| *Key này thiếu scope bắt buộc…* (`scope_required`) | Key cần `operator.read` và `operator.write`. Key chỉ đọc thì xem được nhưng không chat hay trả lời thẻ được. |
| *API key bị từ chối hoặc đã bị thu hồi.* / *Hồ sơ này cần API key mới.* | Tạo key cá nhân mới và kết nối lại hồ sơ. |
| *Phiên Dewee Cloud đã kết thúc. Hãy đăng nhập lại.* | Chọn **Đăng nhập với Dewee** lần nữa. |
| *Chỉ người có quyền owner hoặc admin mới trả lời được thẻ này.* | Nhờ owner hoặc admin của workspace trả lời. |
| *Tư cách thành viên của bạn trong workspace này đang bị tạm ngưng.* | Nhờ owner của workspace khôi phục tư cách thành viên. |
| *Không tìm thấy, hoặc bạn không còn quyền truy cập.* | Workspace, agent hoặc cuộc trò chuyện không còn, hoặc không còn thuộc về bạn. Hãy chọn cái khác. |
| *Cuộc trò chuyện này vẫn đang chạy.* | Chờ câu trả lời xong, hoặc chọn **Dừng**. |
| *Quá nhiều yêu cầu. Thử lại sau … giây.* | Chờ hết thời gian được báo rồi thử lại. |

## Bảo mật

- Secret chỉ đi tới respond endpoint của thẻ, không bao giờ vào chat, URL, log hay bộ nhớ của extension.
- Gateway master token không bao giờ được chấp nhận; chế độ tự host dùng key cá nhân giới hạn trong một tenant.
- Thẻ thuộc một danh sách loại cố định và được kiểm tra trước khi hiển thị. Chữ do agent viết chỉ hiện dưới dạng văn bản thường, còn Markdown được làm sạch, nên agent không thể tự vẽ form giả.
- Không có mã tải từ xa, có content security policy chặt, và chỉ truy cập từng địa chỉ gateway một thay vì mọi trang web.
- Panel không bao giờ đọc trang bạn đang mở.

Lý do đằng sau các quy tắc này nằm trong [threat model xác thực](https://github.com/nextlevelbuilder/dewee-chrome-ext/blob/main/docs/auth-threat-model.md) và [threat model yêu cầu credential](https://github.com/nextlevelbuilder/dewee-chrome-ext/blob/main/docs/credential-threat-model.md) của repository.
