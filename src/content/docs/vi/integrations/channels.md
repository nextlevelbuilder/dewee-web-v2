---
title: Kênh chat
description: "Các ứng dụng chat mà agent của dewee có mặt, từ Telegram, Slack tới Zalo, Pancake và Bitrix24: mỗi kênh hỗ trợ gì, ai được trò chuyện và mức độ hoàn thiện."
section: integrations
order: 1
updated: 2026-09-25
---

Channel kết nối agent với một ứng dụng chat, để mọi người trò chuyện với agent ngay nơi họ vẫn làm việc. Mỗi kết nối thuộc về một tenant và trỏ tới một agent, và một workspace có thể kết nối nhiều tài khoản của cùng một ứng dụng. Trang này là danh mục; cách kết nối từng bước nằm ở [Kênh, ghép cặp và danh bạ](/docs/console/channels-and-contacts).

## Các channel được hỗ trợ

| Channel | Cách kết nối | Ghi chú |
|---|---|---|
| Telegram | Bot token, long polling | Reaction báo trạng thái, forum topic với cài đặt và danh sách tool riêng, tin nhắn thoại, tối đa 3 lượt chạy đồng thời mỗi nhóm |
| Slack | Socket Mode, không cần URL công khai | Bot token và app token; câu trả lời được sửa tại chỗ, reaction báo trạng thái, tiếp tục trả lời trong thread đã tham gia mà không cần mention lại |
| Discord | Kết nối gateway của bot | Tin nhắn chờ được sửa thành câu trả lời; khi được mention trong thread, bot đọc các tin trước đó trong thread làm ngữ cảnh |
| WhatsApp | Kết nối trực tiếp, ghép cặp bằng mã QR | Chuyển tin nhắn thoại thành văn bản mặc định tắt vì việc này phá vỡ mã hoá đầu cuối |
| Feishu / Lark | WebSocket hoặc webhook | Câu trả lời stream dưới dạng message card; tuỳ chọn tách session riêng cho mỗi thread |
| Zalo OA | API Official Account, webhook | Áp dụng giới hạn upload của Zalo: ảnh 1 MB, file 5 MB; ảnh lớn hơn được nén lại |
| Zalo Bot | Zalo Bot API, polling hoặc webhook | Chỉ tin nhắn trực tiếp, 2.000 ký tự mỗi tin, ảnh tối đa 5 MB |
| Zalo Personal | Một tài khoản Zalo cá nhân | Tin nhắn trực tiếp và nhóm mặc định dùng allowlist |
| Facebook | Webhook của Page | Tự động trả lời bình luận và Messenger, và gửi tin nhắn riêng đầu tiên cho người bình luận |
| Pancake (pages.fm) | Webhook | Page trên Facebook, Zalo, Instagram và các nền tảng khác; trả lời inbox và bình luận |
| Bitrix24 | Bot đăng ký trên portal của bạn | Nhiều bot có thể dùng chung một portal |

Form channel trong console có Telegram, Discord, Slack, WhatsApp, ba loại Zalo, Feishu/Lark và Bitrix24. Facebook và Pancake được kết nối qua dashboard tích hợp sẵn của gateway hoặc qua API trên runtime On-Premises của bạn.

> [!WARNING]
> Zalo Personal dùng một giao thức không chính thức, không phải API của Zalo. Zalo có thể khoá hoặc cấm tài khoản. Hãy dùng một tài khoản riêng cho việc này, đừng dùng tài khoản chính của ai.

> [!NOTE]
> Mức độ hoàn thiện khác nhau giữa các channel. Telegram đã được kiểm chứng trong môi trường thật với người dùng thật. Slack, Discord, WhatsApp, Feishu/Lark, Zalo OA và Zalo Personal đã được xây dựng nhưng chưa được kiểm thử đầu cuối trong môi trường thật. Hãy thử một channel với một nhóm nhỏ trước khi triển khai rộng.

## Ai được trò chuyện với agent

Mỗi channel có một policy cho tin nhắn trực tiếp và một policy cho nhóm:

| Policy | Tin nhắn trực tiếp | Nhóm |
|---|---|---|
| `pairing` | Người gửi mới nhận mã và chờ duyệt | Nhóm cũng chờ duyệt theo cách tương tự |
| `allowlist` | Chỉ người gửi có trong danh sách | Chỉ nhóm có trong danh sách |
| `open` | Bất kỳ ai | Bất kỳ nhóm nào có bot |
| `disabled` | Không nhận tin nhắn trực tiếp | Không nhận tin nhắn nhóm |

Form channel trong console đặt mọi channel ở `pairing`, trừ Zalo Personal bắt đầu với `allowlist`.

Mã ghép cặp có 8 ký tự, hiệu lực 60 phút, và mỗi tài khoản có tối đa ba mã đang chờ. Admin duyệt mã trong **Hộp ghép cặp** hoặc bằng `dewee pairing approve`. Một lần ghép cặp đã duyệt mặc định có hiệu lực 30 ngày; workspace có thể chọn thời hạn khác hoặc không hết hạn, và từng channel có thể đặt riêng.

Trong nhóm, agent chỉ trả lời khi được mention, trừ khi bạn tắt chế độ này. Những tin nhắn không mention agent vẫn được giữ làm ngữ cảnh cho lần được mention tiếp theo. Trên Telegram, Feishu và Discord, chỉ các writer được chỉ định mới có thể yêu cầu agent thay đổi file, và trên Telegram chỉ họ mới reset được cuộc trò chuyện.

## Tin nhắn, media và giọng nói

- **Câu trả lời dài** được chia nhỏ cho vừa từng ứng dụng: 4.096 ký tự trên Telegram, 4.000 trên Slack và Feishu, 2.000 trên Discord và Zalo.
- **Media**: ảnh và file đi được cả hai chiều trong giới hạn của từng ứng dụng. Telegram gom nhiều ảnh hoặc file thành album tối đa 10 mục.
- **Tin nhắn thoại** trên Telegram, Discord và Feishu được chuyển thành văn bản trước khi agent đọc, bằng các provider speech-to-text bạn cấu hình. Trên WhatsApp, việc này tắt cho tới khi admin bật lên. Telegram có thể chuyển tin nhắn thoại cho một agent riêng.
- **Trả lời bằng giọng nói**: agent có thể trả lời bằng giọng tổng hợp khi đã cấu hình provider giọng nói. Xem [Provider LLM và giọng nói](/docs/integrations/llm-providers).

## Lệnh trong chat

Trên Telegram, mọi người điều khiển cuộc trò chuyện bằng các lệnh như `/help`, `/status`, `/stop`, `/stopall`, `/reset` và `/tasks`. Writer được quản lý bằng `/addwriter`, `/removewriter` và `/writers` trong nhóm Telegram, Feishu và Discord.

## Gửi tin nhắn từ hệ thống khác

Để phần mềm của bạn đăng tin nhắn lên một channel, hãy dùng webhook `message`: nó nhận tên channel, chat ID và nội dung, kèm media tuỳ chọn. Xem [Webhook và MCP](/docs/api/webhooks-and-mcp). Tin nhắn channel đang được đệm và chờ agent xử lý hiện trong **Tin nhắn chờ**.
