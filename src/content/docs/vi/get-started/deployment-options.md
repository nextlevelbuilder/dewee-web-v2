---
title: Chọn cách triển khai
description: Tại Việt Nam, bạn có thể tự cài dewee hoặc chọn On-Premises do chúng tôi triển khai. Trang này so sánh chi phí, thời gian triển khai và điều cần chuẩn bị.
section: get-started
order: 3
updated: 2026-09-25
---

dewee là cùng một sản phẩm dù chạy ở đâu: cùng console, cùng agent, tool, bộ nhớ và API. Điều thay đổi là runtime gateway chạy ở đâu, ai vận hành nó, bạn được cài thêm gì lên đó và nó được cấp license ra sao. Tại Việt Nam, chúng tôi cung cấp dewee theo **hai hình thức: Tự cài đặt và On-Premises**. Cả hai đều chạy runtime trên hạ tầng của chính bạn; khác nhau ở chỗ ai cài đặt và chăm sóc nó.

## Tổng quan

| | Tự cài đặt | On-Premises |
|---|---|---|
| **Runtime chạy trên** | Máy tính hoặc máy chủ của bạn | VPS, máy chủ hoặc Mac mini của bạn |
| **Chi phí** | Cài đặt miễn phí; license $500/năm để kết nối kênh | Từ $5K, báo giá theo từng dự án, đã gồm license $500/năm |
| **Cấu hình runtime** | Theo phần cứng của bạn, tối thiểu 2 GB RAM | Theo phần cứng của bạn |
| **Cài thêm package và CLI** | Tự cài những gì agent cần | Tự cài những gì agent cần |
| **License key** | Cần khi kết nối kênh | Có |
| **Thời gian triển khai** | Bạn tự chạy script cài đặt | 1 đến 3 tuần, cùng đội ngũ của chúng tôi |
| **Dữ liệu nằm ở đâu** | Trên máy hoặc trong mạng của bạn | Chỉ trong mạng nội bộ của bạn |

Thông tin giá cũng có trên [trang bảng giá](/pricing).

## Tự cài đặt

Bạn cài dewee lên máy Mac, máy Linux hoặc máy chủ của mình bằng script cài đặt của chúng tôi, dưới dạng binary độc lập hoặc Docker, rồi tự thiết lập mọi thứ trong dashboard cục bộ.

- **Bạn nhận được:** runtime cùng dashboard tại `http://localhost:4321`, nơi bạn tạo tài khoản chủ sở hữu, thêm LLM provider và xây dựng agent. Việc cài đặt và dùng agent, provider, skill đều miễn phí.
- **License key:** để kết nối các kênh như Zalo, Telegram, Discord hay Slack, bạn cần license dewee giá $500/năm, kích hoạt ngay trong dashboard. Chương trình Early Access giảm 50% năm đầu cho 50 license đầu tiên, đến 23:59 ngày 15/10/2026 (giờ Việt Nam); xem [bảng giá](/pricing).
- **Đánh đổi:** không kèm hỗ trợ cài đặt, và bạn tự lo việc cập nhật, sao lưu. Nếu muốn chúng tôi cài giúp, hãy chọn On-Premises.

Tự cài đặt phù hợp khi bạn muốn thử dewee trên phần cứng của mình ngay hôm nay, hoặc khi bạn tự tin vận hành runtime. Trang [Tự cài đặt dewee](/docs/get-started/self-install) hướng dẫn từng bước.

## On-Premises

Runtime chạy trên phần cứng bạn sở hữu, bên trong mạng của bạn. Đội ngũ chúng tôi cùng bạn cài đặt.

- **Bạn nhận được:** runtime trên VPS hoặc Mac mini của bạn, 5 quy trình (workflow) tuỳ chỉnh xây dựng cùng đội ngũ của bạn, và 1 năm bảo trì, cập nhật. License $500/năm đã nằm trong báo giá, khởi điểm từ $5K.
- **License key:** runtime được bảo vệ bằng license key, và không tính phí theo lượt sử dụng.
- **Dữ liệu của bạn:** hội thoại, bộ nhớ, file và API key của provider đều nằm trong mạng của bạn.
- **Đánh đổi:** cần 1 đến 3 tuần để triển khai, và bạn là người sở hữu, chăm sóc phần cứng.

On-Premises phù hợp khi dữ liệu không được phép ra khỏi mạng nội bộ và bạn muốn đội ngũ chúng tôi triển khai giúp, hoặc khi bạn muốn agent dùng model chạy nội bộ qua Ollama ngay trong mạng đó.

> [!TIP]
> Bạn tự cài đặt? Trang [Tự cài đặt dewee](/docs/get-started/self-install) hướng dẫn script cài đặt và dashboard. Vận hành gateway cho On-Premises? Trang [Cài đặt và chạy gateway](/docs/runtime/install-and-run) liệt kê những gì máy chủ cần: Docker hoặc bản build Go, cùng PostgreSQL 18 có pgvector.

## Hai hình thức khác ngoài Việt Nam

Ở các thị trường khác, dewee còn có hai hình thức nữa. Chúng không được cung cấp tại Việt Nam; chúng tôi nhắc tới để bạn hiểu các phần tài liệu có liên quan.

- **AaaS:** workspace chạy trên runtime dùng chung, đa tenant, do chúng tôi vận hành. Không cần license key; màn hình Thanh toán trong console chỉ xuất hiện với workspace AaaS.
- **Dedicated trên TOSE:** mỗi workspace có một runtime Docker riêng trên [TOSE.sh](https://tose.sh), kích hoạt bằng license key như On-Premises.

## Những câu hỏi nên trả lời trước khi triển khai

- **Dữ liệu phải nằm ở đâu?** Nếu câu trả lời là "trong mạng nội bộ của chúng tôi", cả Tự cài đặt lẫn On-Premises đều phù hợp.
- **Runtime sẽ đặt ở đâu?** Một VPS trong hạ tầng của bạn hay một Mac mini tại văn phòng; cả hai đều được.
- **Agent cần những tool riêng nào?** Liệt kê các CLI, runtime ngôn ngữ hoặc package hệ thống mà agent sẽ dùng; với On-Premises, chúng tôi sẽ chuẩn bị sẵn.
- **Ai sẽ chăm sóc phần cứng?** Máy chủ thuộc về bạn. Với On-Premises, chúng tôi lo phần cài đặt và cập nhật trong năm bảo trì; với Tự cài đặt, việc đó là của bạn.
- **Năm quy trình tuỳ chỉnh là gì?** (với On-Premises) Chuẩn bị sẵn các quy trình bạn muốn tự động hoá trước để buổi làm việc đầu tiên hiệu quả hơn.

Còn băn khoăn? [Liên hệ chúng tôi](/contact) và mô tả yêu cầu của bạn, chúng tôi sẽ đề xuất cách phù hợp.

## Bước tiếp theo

- [Tự cài đặt dewee](/docs/get-started/self-install): từng bước với hình thức Tự cài đặt.
- [Bắt đầu nhanh](/docs/get-started/quickstart): đăng nhập và nhận câu trả lời đầu tiên từ agent.
- [Kích hoạt license](/docs/runtime/licence): cách runtime Tự cài đặt và On-Premises được kích hoạt.
- [Mô hình bảo mật](/docs/security/overview): mỗi lớp bảo vệ điều gì.
