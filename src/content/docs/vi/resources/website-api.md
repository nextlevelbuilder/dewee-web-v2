---
title: Website dewee.sh cho công cụ và AI
description: "Cách phần mềm và trợ lý AI đọc chính website dewee.sh: bản Markdown của từng trang, llms.txt, cùng API, CLI và MCP riêng của website, tách biệt với API runtime."
section: resources
order: 2
updated: 2026-09-25
---

Quanh dewee có hai API khác nhau, và nên tách bạch chúng ngay từ đầu:

| API | Phục vụ | Tài liệu ở đâu |
|---|---|---|
| **API của runtime** | Agent, session, provider, channel và mọi thứ khác trong workspace của bạn | [Tổng quan API](/docs/api/overview) |
| **Giao diện của website** | Nội dung công khai của dewee.sh: trang sản phẩm, tài liệu, nhật ký thay đổi và blog | Trang này và trang [Developers](/developers) |

Không gì trên trang này chạm tới workspace hay dữ liệu của bạn. Trang này dành cho các công cụ muốn đọc dewee.sh giống như một người đọc.

## Đọc trang dưới dạng Markdown

Mỗi trang trên dewee.sh trỏ tới bản Markdown của chính nó trong phần `<head>`, bằng một liên kết như sau:

```html
<link rel="alternate" type="text/markdown" href="/vi/docs/get-started/quickstart.md" title="Markdown" />
```

Bản Markdown nằm ở đường dẫn của trang, thêm đuôi `.md`; bản của trang chủ là `/index.md`. Các trang tiếng Việt nằm dưới `/vi`, nên bản Markdown của chúng cũng vậy. Hãy dùng bản này khi bạn cần phần chữ của trang mà không kèm menu, style hay script.

## llms.txt

`/llms.txt` là bản hướng dẫn ngắn về website cho các mô hình ngôn ngữ: dewee là gì và các trang quan trọng nằm ở đâu. Nó được liên kết từ footer và từ phần `<head>` của mọi trang.

## API, CLI và MCP của website

Website cũng có các giao diện lập trình riêng để đọc và quản lý nội dung của dewee.sh. Trang [Developers](/developers) là tài liệu tham chiếu cho chúng: cách xác thực, có những thao tác nào và cách kết nối một client MCP.

> [!NOTE]
> Credential của website tách biệt với API key của runtime. Key bạn tạo trong console cho workspace không dùng được trên dewee.sh, và ngược lại.
