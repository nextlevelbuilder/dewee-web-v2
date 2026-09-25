---
title: Chọn cách triển khai
description: Tại Việt Nam, dewee được triển khai On-Premises trên hạ tầng của bạn. Trang này nói rõ gói gồm những gì, chi phí, thời gian triển khai và điều cần chuẩn bị.
section: get-started
order: 3
updated: 2026-09-25
---

dewee là cùng một sản phẩm dù chạy ở đâu: cùng console, cùng agent, tool, bộ nhớ và API. Điều thay đổi là runtime gateway chạy ở đâu, ai vận hành nó, bạn được cài thêm gì lên đó và nó được cấp license ra sao. Tại Việt Nam, chúng tôi cung cấp dewee theo **một hình thức duy nhất: On-Premises**, tức runtime chạy trên hạ tầng của chính bạn.

## Tổng quan

| | On-Premises |
|---|---|
| **Runtime chạy trên** | VPS, máy chủ hoặc Mac mini của bạn |
| **Chi phí** | Từ $5K, báo giá theo từng dự án, đã gồm license $500/năm |
| **Cấu hình runtime** | Theo phần cứng của bạn |
| **Cài thêm package và CLI** | Tự cài những gì agent cần |
| **License key** | Có |
| **Thời gian triển khai** | 1 đến 3 tuần, cùng đội ngũ của chúng tôi |
| **Dữ liệu nằm ở đâu** | Chỉ trong mạng nội bộ của bạn |

Thông tin giá cũng có trên [trang bảng giá](/pricing).

## On-Premises tại Việt Nam

Runtime chạy trên phần cứng bạn sở hữu, bên trong mạng của bạn. Đội ngũ chúng tôi cùng bạn cài đặt.

- **Bạn nhận được:** runtime trên VPS hoặc Mac mini của bạn, 5 quy trình (workflow) tuỳ chỉnh xây dựng cùng đội ngũ của bạn, và 1 năm bảo trì, cập nhật. License $500/năm đã nằm trong báo giá, khởi điểm từ $5K.
- **License key:** runtime được bảo vệ bằng license key, và không tính phí theo lượt sử dụng.
- **Dữ liệu của bạn:** hội thoại, bộ nhớ, file và API key của provider đều nằm trong mạng của bạn.
- **Đánh đổi:** cần 1 đến 3 tuần để triển khai, và bạn là người sở hữu, chăm sóc phần cứng.

On-Premises phù hợp khi dữ liệu không được phép ra khỏi mạng nội bộ, hoặc khi bạn muốn agent dùng model chạy nội bộ qua Ollama ngay trong mạng đó.

> [!TIP]
> Bạn tự vận hành runtime? Trang [Cài đặt và chạy gateway](/docs/runtime/install-and-run) liệt kê những gì máy chủ cần: Docker hoặc bản build Go, cùng PostgreSQL 18 có pgvector.

## Hai hình thức khác ngoài Việt Nam

Ở các thị trường khác, dewee còn có hai hình thức nữa. Chúng không được cung cấp tại Việt Nam; chúng tôi nhắc tới để bạn hiểu các phần tài liệu có liên quan.

- **AaaS:** workspace chạy trên runtime dùng chung, đa tenant, do chúng tôi vận hành. Không cần license key; màn hình Thanh toán trong console chỉ xuất hiện với workspace AaaS.
- **Dedicated trên TOSE:** mỗi workspace có một runtime Docker riêng trên [TOSE.sh](https://tose.sh), kích hoạt bằng license key như On-Premises.

## Những câu hỏi nên trả lời trước khi triển khai

- **Runtime sẽ đặt ở đâu?** Một VPS trong hạ tầng của bạn hay một Mac mini tại văn phòng; cả hai đều được.
- **Agent cần những tool riêng nào?** Liệt kê các CLI, runtime ngôn ngữ hoặc package hệ thống mà agent sẽ dùng để chúng tôi chuẩn bị sẵn.
- **Ai sẽ chăm sóc phần cứng?** Máy chủ thuộc về bạn; chúng tôi lo phần cài đặt và cập nhật trong năm bảo trì.
- **Năm quy trình tuỳ chỉnh là gì?** Chuẩn bị sẵn các quy trình bạn muốn tự động hoá trước để buổi làm việc đầu tiên hiệu quả hơn.

Còn băn khoăn? [Liên hệ chúng tôi](/contact) và mô tả yêu cầu của bạn, chúng tôi sẽ đề xuất cách phù hợp.

## Bước tiếp theo

- [Bắt đầu nhanh](/docs/get-started/quickstart): đăng nhập và nhận câu trả lời đầu tiên từ agent.
- [Kích hoạt license](/docs/runtime/licence): cách runtime On-Premises được kích hoạt.
- [Mô hình bảo mật](/docs/security/overview): mỗi lớp bảo vệ điều gì.
