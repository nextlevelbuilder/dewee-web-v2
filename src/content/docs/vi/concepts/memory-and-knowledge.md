---
title: Bộ nhớ và kho tri thức
description: Cách agent trong dewee ghi nhớ qua nhiều session, cách bộ nhớ được tìm kiếm và hợp nhất, và cách kho tri thức cùng knowledge graph sắp xếp những gì agent biết.
section: concepts
order: 6
updated: 2026-09-25
---

Agent trong dewee ghi nhớ theo nhiều lớp: cuộc hội thoại đang diễn ra, bản tóm tắt các session trước, và một knowledge graph về những người và sự vật mà agent đã biết. Kho tri thức nằm phía trên, liên kết các tài liệu với nhau và tìm kiếm trên mọi lớp cùng lúc. Tất cả đều gói gọn trong tenant và agent, và thường là theo từng người dùng.

## Ba tầng bộ nhớ

| Tầng | Nội dung | Thời gian lưu |
|---|---|---|
| Làm việc (L0) | Các tin nhắn của session hiện tại | Tới khi bước nén tóm tắt chúng |
| Sự kiện (L1) | Bản tóm tắt mỗi session đã kết thúc, kèm phần tóm lược ngắn và các chủ đề chính | Mặc định 90 ngày (`episodic_ttl_days`) |
| Ngữ nghĩa (L2) | Knowledge graph gồm các thực thể và quan hệ giữa chúng | Tới khi một dữ kiện bị thay thế |

Mỗi agent còn có các file bộ nhớ: `MEMORY.md` và mọi file trong `memory/`. Ngay trước khi lịch sử session bị nén, agent được một lượt ngắn (tối đa 5 vòng lặp, 90 giây) để lưu các ghi chú lâu dài vào `memory/YYYY-MM-DD.md`.

## Tìm kiếm trong bộ nhớ

File bộ nhớ được chia thành các đoạn tối đa 1.000 ký tự và được lập chỉ mục cho cả tìm kiếm toàn văn lẫn tìm kiếm vector. Điểm được trộn theo tỉ lệ 0,7 vector và 0,3 toàn văn. Bộ nhớ riêng của người dùng được tăng điểm 1,2 lần so với bộ nhớ chung của agent, và được ưu tiên khi cả hai chứa cùng một đoạn.

| Tool | Tác dụng |
|---|---|
| `memory_search` | Tìm trong file bộ nhớ và bản tóm tắt các session trước, trả về đoạn trích kèm đường dẫn và số dòng |
| `memory_get` | Chỉ đọc những dòng cần thiết trong một file bộ nhớ |
| `memory_expand` | Nạp toàn bộ bản tóm tắt của một session trước theo ID |

Agent cũng nhận được bộ nhớ liên quan mà không cần hỏi. Trước mỗi lượt, dewee đối chiếu tin nhắn của người dùng với bản tóm tắt các session trước, rồi thêm tối đa 5 phần tóm lược có điểm từ 0,3 trở lên vào system prompt, trong giới hạn khoảng 200 token. Bạn điều chỉnh bằng `auto_inject_enabled`, `auto_inject_threshold` và `auto_inject_max_tokens`.

## Hợp nhất bộ nhớ

Khi một lượt chạy kết thúc, các worker chạy nền biến nó thành bộ nhớ dài hạn. Việc hợp nhất được bật mặc định (`consolidation_enabled`).

1. **Episodic.** Tóm tắt session, dùng lại bản tóm tắt từ bước nén nếu có, và viết phần tóm lược khoảng 50 token.
2. **Semantic.** Trích xuất thực thể và quan hệ từ bản tóm tắt vào knowledge graph.
3. **Dedup.** Gộp các thực thể mà embedding cho thấy là cùng một đối tượng.
4. **Dreaming.** Chờ 10 phút sau khi có bản tóm tắt mới, rồi tổng hợp một lô bản tóm tắt (mặc định 10) thành tri thức dài hạn hơn.

## Nhóm chat và bộ nhớ kênh thụ động

Trong một nhóm Telegram, bộ nhớ và file workspace thuộc về cả nhóm, nên mọi thành viên cùng dựa trên một ngữ cảnh. Kiểm tra quyền, nhật ký kiểm toán và quyền sở hữu vẫn theo từng người gửi.

Bộ nhớ kênh thụ động cho phép agent học từ những cuộc trò chuyện trong nhóm không gửi trực tiếp cho nó. Quản trị viên kênh bật tính năng này cho từng kênh trong `passive_memory`.

| Thiết lập | Mặc định |
|---|---|
| `enabled` | Tắt |
| `review_mode` | Bật, các mục trích xuất nằm chờ trong hàng đợi xem xét |
| `interval_minutes` | 360 (từ 15 đến 10.080) |
| `message_cap` / `min_messages` | 100 tin mỗi lần chạy, và cần ít nhất 5 tin mới |
| `allowed_types` | people, projects, decisions, todos, preferences, events |
| Phạm vi | Chỉ nhóm chat |

Tin nhắn được che thông tin nhạy cảm trước khi trích xuất: secret, token, chuỗi kết nối, số giống số thẻ thanh toán, địa chỉ email, số điện thoại, cùng những người dùng hoặc mẫu mà bạn loại trừ. Các mục được duyệt trở thành bản tóm tắt session và đi vào knowledge graph giống như bộ nhớ từ session.

## Kho tri thức

Kho tri thức (vault), tức màn hình **Kho tri thức** trong console, là nơi đăng ký tài liệu. Kho lưu đường dẫn, tiêu đề, loại, mã hash và embedding của từng tài liệu; nội dung vẫn nằm trong file.

| Phạm vi | Ai thấy |
|---|---|
| `personal` | Agent sở hữu |
| `team` | Thành viên của một nhóm agent |
| `shared` | Mọi agent trong tenant |
| `custom` | Phạm vi do bạn định nghĩa |

Agent thấy tài liệu của chính nó và tài liệu dùng chung, cùng tài liệu của nhóm khi nó làm việc cho nhóm đó.

**Wikilink.** Viết `[[notes/pricing.md]]` hoặc `[[SOUL.md|persona]]` trong tài liệu sẽ tạo liên kết, và tài liệu đích ghi nhận một backlink. `.md` được thêm vào nếu thiếu, và đích được so khớp theo đúng đường dẫn, sau đó theo tên file. Bạn cũng có thể tự liên kết tài liệu:

```bash
dewee vault search --query "renewal terms" --agent <agent-id>
dewee vault link create --from <doc-id> --to <doc-id>
```

**Tool của agent.** `vault_search` tìm song song trong tài liệu của kho, bản tóm tắt session và thực thể trong graph, với trọng số 0,4, 0,3 và 0,3, và mặc định trả về 10 kết quả. `vault_read` trả về toàn văn một tài liệu theo ID, kể cả tài liệu dùng chung và tài liệu nhóm nằm ngoài workspace của agent, mặc định tối đa 500.000 byte. Agent không có tool nào để tạo liên kết.

**Giới hạn.** Chỉ những tài liệu đã đăng ký mới được đồng bộ từ ổ đĩa, theo một chiều từ file vào kho, sau khoảng chờ 500 ms. Tìm kiếm toàn văn chỉ bao gồm tiêu đề và đường dẫn; nội dung được tìm qua embedding. Lần ghi sau cùng thắng, và hiện chưa có lịch sử phiên bản.

## Knowledge graph

Graph chứa các thực thể như người, tổ chức, dự án, công việc và địa điểm, cùng quan hệ giữa chúng. Mỗi dữ kiện có một khoảng hiệu lực (`valid_from`, `valid_until`), nên dữ kiện lỗi thời được đóng lại chứ không bị xoá. Agent truy vấn graph bằng `knowledge_graph_search`, phù hợp với câu hỏi nhiều bước như ai đang làm dự án nào.

```bash
dewee kg entities --agent <agent-id> --query "Acme"
dewee kg traverse --agent <agent-id> --entity <entity-id> --depth 2
dewee kg extract --agent <agent-id> --file ./meeting-notes.md --provider <provider> --model <model>
dewee kg dedup scan --agent <agent-id>
```

Trích xuất thủ công giữ lại các thực thể có độ tin cậy từ 0,75 trở lên, còn lệnh quét trùng lặp đánh dấu các cặp có độ tương đồng từ 0,90 để bạn gộp hoặc bỏ qua. Chế độ xem graph trong console đang ở giai đoạn beta. Với từng agent, `knowledge_graph_enabled` và `knowledge_vault_enabled` trong `other_config` được bật mặc định.

Các thao tác ghi theo lô (tải lên hàng loạt vào kho, nạp dữ liệu vào graph, ghi hàng loạt vào bộ nhớ) thất bại toàn bộ ngay ở ID không hợp lệ đầu tiên.

## Bản Standard và bản Lite

| | Standard (PostgreSQL) | Lite (SQLite) |
|---|---|---|
| Tìm kiếm bộ nhớ và kho | Toàn văn và vector (pgvector) | Chỉ theo từ khoá |
| Bộ nhớ sự kiện và kho tri thức | Có | Có |
| Knowledge graph | Có | Tắt ở bản Lite |

Tìm kiếm vector còn cần một embedding provider. Nếu không có, việc tìm kiếm quay về dạng toàn văn.

## Liên quan

- [Bộ nhớ và kho tri thức trong console](/docs/console/memory-and-knowledge): xem bộ nhớ, Kho tri thức và graph.
- [Vòng lặp agent](/docs/concepts/agent-loop): bước nén và cách prompt được dựng.
- [Provider, fallback và suy luận](/docs/concepts/providers-and-routing): các embedding provider.
- [Tách biệt đa tenant](/docs/concepts/multi-tenancy): cách bộ nhớ được giữ trong phạm vi một tenant.
- [Tham chiếu CLI](/docs/runtime/cli): toàn bộ lệnh `dewee memory`, `dewee vault` và `dewee kg`.
