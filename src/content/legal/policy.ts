/**
 * /policy: the practical rules that sit next to the Terms. `#refunds` is linked from /pricing
 * and the Terms, `#licences` from the Terms. Licence facts come from the dewee licence runbook
 * (5-minute heartbeat with activation id + runtime token, 24-hour grace capped at the licence
 * year, revoke/expire closes admission, suspended licences resume by re-enrolling the same key).
 * The VI version covers the Self-install licence and On-Premises.
 */
import type { Bi } from "~/i18n/config";
import type { LegalDoc } from "./types";
import { LEGAL_EMAIL } from "./legal-ui";

const mail = `[${LEGAL_EMAIL}](mailto:${LEGAL_EMAIL})`;

export const POLICY: Bi<LegalDoc> = {
  en: {
    meta: {
      title: "Policies: refunds, licences and packages",
      description: "How dewee handles refunds for AaaS, Dedicated on TOSE and On-Premises, how licence keys check in, which runtime packages you can install and how to report bugs.",
      crumb: "Policies",
    },
    hero: {
      eyebrow: "Legal · Policies",
      title: "The house *rules*.",
      lede: "Refunds, licence keys, runtime packages and security reports: the practical rules that sit next to our Terms of Service.",
    },
    sections: [
      {
        id: "overview",
        title: "What this page covers",
        short: "These are the everyday rules for buying and running dewee. They are part of our Terms of Service.",
        body: [
          "This page explains how refunds work, how licence keys are activated and checked, which runtime packages you can install on each plan, and how to report a security problem. It forms part of our [Terms of Service](/terms). If your signed order or contract says something different, that document applies.",
        ],
      },
      {
        id: "refunds",
        title: "Refund policy",
        short: "AaaS and Self-install licences: a full refund within 14 days. Dedicated and On-Premises: as set out in your order form or contract.",
        body: [
          { sub: "AaaS" },
          "If dewee is not right for you, ask for a refund within 14 days of your purchase and we will refund it in full, no questions asked. The only exception is fraud or clear abuse, such as chargeback abuse or reselling access.",
          { sub: "Dedicated on TOSE.sh" },
          "A Dedicated order has two parts: the $500 yearly licence and the $99 TOSE credit deposit, which we pass to TOSE.sh as credit for your runtime. What we can refund depends on whether your runtime has already been provisioned and on the credit already passed on or used. The exact terms are in your order form.",
          { sub: "Self-install licence" },
          "Ask within 14 days of buying a Self-install licence and we refund what you paid in full, including an Early Access price; the key is revoked when the refund is made. After 14 days we do not give partial or prorated refunds, and the licence stays active until the end of its year. Installing dewee itself is free, so there is nothing else to refund.",
          { sub: "On-Premises" },
          "On-Premises work is quoted individually. Payment stages and refund terms are written into your quote and contract, and we agree them with you before any work starts.",
          { sub: "How to ask for a refund" },
          {
            steps: [
              "Email " + mail + " from the address you used to buy.",
              "Include your order reference and the plan. For AaaS within 14 days you do not need to give a reason.",
              "We may ask you to confirm that you own the account before we process the refund.",
            ],
          },
          { sub: "Timing" },
          "Approved refunds go back to your original payment method where possible. Banks and payment networks set their own timing, and currency conversion or bank fees can change the final amount you receive.",
        ],
      },
      {
        id: "licences",
        title: "Licence keys and activation",
        short: "Dedicated and On-Premises runtimes need a licence key. They check in every five minutes, keep working for up to a day offline, and stop taking new work when a licence ends.",
        body: [
          "AaaS does not use a licence key. Dedicated and On-Premises runtimes are activated with one, and then:",
          {
            defs: [
              ["Check-in", "Every five minutes the runtime sends our licence server an activation ID and a runtime token. It never sends the raw licence key, and never your conversations, files or settings."],
              ["Offline grace", "If the runtime cannot reach us, it keeps working for up to 24 hours after the last successful check-in, but never beyond the end of your licence year."],
              ["Expiry or revocation", "When a licence expires or is revoked, the runtime stops accepting new work straight away."],
              ["Suspension", "A suspended licence can be resumed by enrolling again with the same licence key."],
            ],
          },
          "Treat your licence key like a password. If you think it has leaked, write to " + mail + " so we can revoke it.",
        ],
      },
      {
        id: "packages",
        title: "Runtime packages",
        short: "On AaaS we install curated packages for you. On Dedicated and On-Premises you can install what your agents need.",
        body: [
          {
            defs: [
              ["AaaS", "The runtime is shared, so installing packages is blocked by default. If your agents need a tool, ask support and we can add a curated package."],
              ["Dedicated on TOSE.sh", "Each workspace gets its own isolated runtime, so you can install the packages and CLIs you need. You are responsible for their licences, updates and security."],
              ["On-Premises", "It is your machine. We agree the packages with you during setup, and you can add more later."],
            ],
          },
        ],
      },
      {
        id: "security",
        title: "Reporting a security issue",
        short: "Found a vulnerability? Email us the details, do not touch other people’s data, and give us time to fix it before you tell anyone else.",
        body: [
          "If you believe you have found a security problem in dewee or on this website, email " + mail + " with “Security” in the subject. Include the steps to reproduce it, what an attacker could do, and the URLs or versions involved.",
          "While you investigate, please:",
          {
            list: [
              "do not access, change or delete data that is not yours;",
              "do not degrade the service for others, for example with denial-of-service tests or spam;",
              "give us a reasonable amount of time to fix the issue before you disclose it publicly.",
            ],
          },
          "We read every report and will reply to you.",
        ],
      },
      {
        id: "changes",
        title: "Changes to these policies",
        short: "When a policy changes, the date at the top changes too. Changes do not reach back to purchases you have already made.",
        body: [
          "We may update these policies as dewee changes. The date at the top of this page shows the current version. A change applies to purchases made after it is published; the policy in force when you bought applies to your purchase. Questions: " + mail + ".",
        ],
      },
    ],
  },
  vi: {
    meta: {
      title: "Chính sách: hoàn tiền, license và package",
      description: "Cách dewee xử lý thanh toán và hoàn tiền cho gói On-Premises, cách license key được kích hoạt và kiểm tra, package cài trên máy của bạn và cách báo lỗi bảo mật.",
      crumb: "Chính sách",
    },
    hero: {
      eyebrow: "Pháp lý · Chính sách",
      title: "Những *quy định* chung.",
      lede: "Hoàn tiền, license key, package và báo cáo bảo mật: các quy định thực tế đi kèm Điều khoản dịch vụ của chúng tôi.",
    },
    sections: [
      {
        id: "overview",
        title: "Trang này nói về điều gì",
        short: "Đây là các quy định thường ngày khi mua và vận hành dewee. Chúng là một phần của Điều khoản dịch vụ.",
        body: [
          "Trang này giải thích cách thanh toán và hoàn tiền, cách license key được kích hoạt và kiểm tra, việc cài package trên máy của bạn, và cách báo cáo một lỗ hổng bảo mật. Các chính sách này là một phần của [Điều khoản dịch vụ](/vi/terms). Nếu đơn hàng hoặc hợp đồng đã ký quy định khác, văn bản đã ký được áp dụng.",
        ],
      },
      {
        id: "refunds",
        title: "Chính sách hoàn tiền",
        short: "License Tự cài đặt: hoàn toàn bộ trong 14 ngày. On-Premises: lịch thanh toán và điều kiện hoàn tiền ghi rõ trong báo giá và hợp đồng.",
        body: [
          { sub: "License Tự cài đặt" },
          "Nếu bạn yêu cầu trong vòng 14 ngày kể từ khi mua license Tự cài đặt, chúng tôi hoàn lại toàn bộ số tiền bạn đã trả, kể cả giá Early Access; license key bị thu hồi khi hoàn tiền. Sau 14 ngày, chúng tôi không hoàn tiền một phần hay theo tỉ lệ thời gian, và license vẫn dùng được đến hết năm. Việc cài dewee là miễn phí nên không có khoản nào khác cần hoàn.",
          { sub: "Gói On-Premises" },
          "Mỗi dự án On-Premises có báo giá riêng. Các đợt thanh toán và điều kiện hoàn tiền được ghi trong báo giá và hợp đồng, và chúng tôi thống nhất với bạn trước khi bắt tay vào việc.",
          { sub: "Cách yêu cầu hoàn tiền" },
          {
            steps: [
              "Gửi email tới " + mail + " từ địa chỉ email bạn đã dùng khi mua.",
              "Ghi rõ mã đơn hàng hoặc số hợp đồng, và lý do bạn muốn hoàn tiền.",
              "Chúng tôi có thể đề nghị bạn xác minh quyền sở hữu tài khoản trước khi xử lý.",
            ],
          },
          { sub: "Thời gian nhận tiền" },
          "Khoản hoàn tiền được chấp thuận sẽ trả về phương thức thanh toán ban đầu khi có thể. Thời gian xử lý do ngân hàng và cổng thanh toán quyết định; phí ngân hàng hoặc chênh lệch tỷ giá có thể làm số tiền bạn nhận được thay đổi.",
        ],
      },
      {
        id: "licences",
        title: "License key và kích hoạt",
        short: "Runtime On-Premises cần license key. Runtime báo về máy chủ license 5 phút một lần, vẫn chạy tối đa một ngày khi mất kết nối, và ngừng nhận việc mới khi license kết thúc.",
        body: [
          "Runtime On-Premises được kích hoạt bằng license key, sau đó:",
          {
            defs: [
              ["Kiểm tra định kỳ", "Cứ 5 phút, runtime gửi về máy chủ license của chúng tôi một mã kích hoạt và một runtime token. Runtime không bao giờ gửi license key gốc, càng không gửi hội thoại, tài liệu hay cấu hình của bạn."],
              ["Thời gian gia hạn khi mất kết nối", "Nếu không liên lạc được với chúng tôi, runtime vẫn chạy tối đa 24 giờ kể từ lần kiểm tra thành công gần nhất, nhưng không vượt quá ngày kết thúc năm license."],
              ["Hết hạn hoặc bị thu hồi", "Khi license hết hạn hoặc bị thu hồi, runtime ngừng nhận việc mới ngay lập tức."],
              ["Tạm ngưng", "License bị tạm ngưng có thể dùng lại bằng cách đăng ký kích hoạt lại với chính license key đó."],
            ],
          },
          "Hãy giữ license key như giữ mật khẩu. Nếu nghi ngờ key bị lộ, hãy báo qua " + mail + " để chúng tôi thu hồi.",
        ],
      },
      {
        id: "packages",
        title: "Package trên runtime",
        short: "Máy là của bạn: chúng tôi thống nhất danh sách package khi cài đặt, và bạn có thể cài thêm sau đó.",
        body: [
          "Với On-Premises, runtime chạy trên máy của bạn. Chúng tôi thống nhất các package và CLI cần thiết cùng bạn trong lúc cài đặt, và bạn có thể cài thêm khi agent cần. Bạn chịu trách nhiệm về giấy phép, việc cập nhật và an toàn của các package cài thêm.",
        ],
      },
      {
        id: "security",
        title: "Báo cáo lỗ hổng bảo mật",
        short: "Phát hiện lỗ hổng? Gửi chi tiết cho chúng tôi, không đụng vào dữ liệu của người khác, và cho chúng tôi thời gian sửa trước khi công bố.",
        body: [
          "Nếu bạn phát hiện một vấn đề bảo mật trong dewee hoặc trên website này, hãy gửi email tới " + mail + " với tiêu đề có chữ “Security”. Mô tả các bước tái hiện, tác động có thể xảy ra, và đường dẫn hoặc phiên bản liên quan.",
          "Trong lúc kiểm tra, xin bạn:",
          {
            list: [
              "không truy cập, sửa hay xoá dữ liệu không thuộc về bạn;",
              "không làm ảnh hưởng tới người dùng khác, ví dụ bằng tấn công từ chối dịch vụ hay gửi thư rác;",
              "cho chúng tôi một khoảng thời gian hợp lý để khắc phục trước khi công bố.",
            ],
          },
          "Chúng tôi đọc mọi báo cáo và sẽ phản hồi bạn.",
        ],
      },
      {
        id: "changes",
        title: "Thay đổi chính sách",
        short: "Khi chính sách thay đổi, ngày cập nhật ở đầu trang cũng đổi theo. Thay đổi không áp dụng ngược cho giao dịch bạn đã thực hiện.",
        body: [
          "Chúng tôi có thể cập nhật các chính sách này khi dewee thay đổi. Ngày ở đầu trang cho biết phiên bản hiện hành. Thay đổi chỉ áp dụng cho giao dịch phát sinh sau khi được công bố; giao dịch của bạn tuân theo chính sách có hiệu lực lúc bạn mua. Mọi câu hỏi, xin gửi về " + mail + ".",
        ],
      },
    ],
  },
};
