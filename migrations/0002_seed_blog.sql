-- Seed: the first four blog posts, in English and Vietnamese (published).
-- Facts only: every number and release item is taken from the dewee repository and its GitHub
-- releases as of 2026-09-24 (test functions counted under internal/, tests/, cmd/ and pkg/).
-- Each post gets its version-1 revision snapshot so history and restore work like any other post.

INSERT OR IGNORE INTO pages (id, kind, locale, slug, title, description, layout, blocks, body_md, seo, cover, tags, author, status, translation_key, published_at, created_at, updated_at, version) VALUES ('5d1b7c1e-2f7a-4c8e-9a51-0b6f3e2a7c01', 'post', 'en', 'introducing-dewee', 'Introducing dewee', 'dewee is the enterprise AI-agent platform from the team behind GoClaw. What it is, what an agent can do in it, and where it runs.', 'article', '[]', 'dewee puts AI agents to work inside your company: in the chat apps your team already uses, on the models you trust, behind security that starts closed.

It comes from the team behind [GoClaw](/story), the open agent gateway we started in February 2026. dewee forked off in June 2026 to carry what businesses kept asking for: stricter security, faster patches and a team to call.

## What an agent can do in dewee

- **Talk where your team talks.** Telegram, Zalo, Slack, Lark, Discord, WhatsApp, Facebook and more: 10 chat channels, and no new app to roll out.
- **Remember what matters.** Three-tier memory and a knowledge vault, so an agent learns your business instead of asking twice.
- **Work as a team.** Agents share task boards, delegate to each other and hand off to a human when it counts.
- **Think on the models you trust.** More than 20 providers, from Anthropic, OpenAI and Gemini to a local Ollama, with automatic fallback per agent.
- **Run on schedule.** Cron jobs and visual workflows turn one-off prompts into dependable routines.
- **Show its work.** Every run is traced: which model, which tool, how long and how much.

## Closed by default

Most agent stacks start wide open and hope for the best. dewee starts shut. Five defence layers sit between your data and the internet (transport, input, tools, output and isolation), stored secrets are encrypted with AES-256-GCM, and every capability an agent gets is one you granted. The [security page](/security) walks through each layer.

## Where it runs

The runtime is a single Go binary of about 25 MB that starts in under a second. Start on our shared cloud, move to a dedicated runtime, or keep everything on your own hardware with an On-Premises licence. [Compare the options](/pricing).

## What comes next

Every stable release lands in the [changelog](/changelog). If there is work your team would rather not do, [tell us about it](/contact): that is usually where the first agent starts.', '{}', NULL, '["launch", "product"]', NULL, 'published', 'introducing-dewee', '2026-09-24T09:00:00.000Z', '2026-09-24T09:00:00.000Z', '2026-09-24T09:00:00.000Z', 1);

INSERT OR IGNORE INTO pages (id, kind, locale, slug, title, description, layout, blocks, body_md, seo, cover, tags, author, status, translation_key, published_at, created_at, updated_at, version) VALUES ('5d1b7c1e-2f7a-4c8e-9a51-0b6f3e2a7c02', 'post', 'vi', 'introducing-dewee', 'Giới thiệu dewee', 'dewee là nền tảng AI agent cho doanh nghiệp từ đội ngũ làm ra GoClaw. dewee là gì, agent làm được gì trong đó, và chạy ở đâu.', 'article', '[]', 'dewee đưa AI agent vào làm việc ngay trong công ty bạn: trong những ứng dụng chat đội ngũ đang dùng, trên các mô hình bạn tin tưởng, sau một lớp bảo mật đóng ngay từ đầu.

dewee đến từ đội ngũ làm ra [GoClaw](/vi/story), agent gateway mã nguồn mở mà chúng tôi bắt đầu từ tháng 2/2026. Tháng 6/2026, dewee tách ra để gánh những gì doanh nghiệp liên tục yêu cầu: bảo mật chặt hơn, vá lỗi nhanh hơn và một đội ngũ để gọi khi cần.

## Agent trong dewee làm được gì

- **Có mặt nơi đội ngũ bạn trò chuyện.** Telegram, Zalo, Slack, Lark, Discord, WhatsApp, Facebook và hơn thế: 10 kênh chat, không phải triển khai thêm ứng dụng mới nào.
- **Nhớ những điều quan trọng.** Bộ nhớ ba tầng và kho tri thức, để agent hiểu doanh nghiệp của bạn thay vì hỏi đi hỏi lại.
- **Làm việc theo nhóm.** Các agent dùng chung bảng công việc, giao việc cho nhau và chuyển cho người thật khi cần.
- **Suy nghĩ trên mô hình bạn tin tưởng.** Hơn 20 nhà cung cấp, từ Anthropic, OpenAI, Gemini đến Ollama chạy nội bộ, với cơ chế dự phòng tự động cho từng agent.
- **Chạy theo lịch.** Cron job và workflow trực quan biến những câu lệnh rời rạc thành quy trình đáng tin cậy.
- **Minh bạch mọi bước.** Mỗi lần chạy đều được trace: mô hình nào, công cụ nào, mất bao lâu, tốn bao nhiêu.

## Đóng mặc định

Phần lớn các hệ thống agent mở toang từ đầu rồi hy vọng mọi chuyện ổn. dewee thì bắt đầu ở trạng thái đóng. Năm lớp phòng thủ nằm giữa dữ liệu của bạn và internet (truyền tải, đầu vào, công cụ, đầu ra và cô lập), mọi secret lưu trữ đều được mã hoá AES-256-GCM, và mỗi quyền agent có được đều do chính bạn cấp. [Trang bảo mật](/vi/security) đi qua từng lớp.

## Chạy ở đâu

Runtime là một file Go duy nhất khoảng 25 MB, khởi động dưới một giây. Bạn có thể bắt đầu trên cloud dùng chung, chuyển sang runtime riêng, hoặc giữ mọi thứ trên phần cứng của mình với giấy phép On-Premises. Tại Việt Nam, chúng tôi cung cấp hình thức On-Premises. [Xem các lựa chọn](/vi/pricing).

## Tiếp theo

Mọi bản phát hành stable đều được ghi trong [nhật ký thay đổi](/vi/changelog). Nếu đội ngũ bạn có việc gì không muốn làm, [kể cho chúng tôi nghe](/vi/contact): agent đầu tiên thường bắt đầu từ đó.', '{}', NULL, '["ra mắt", "sản phẩm"]', NULL, 'published', 'introducing-dewee', '2026-09-24T09:00:00.000Z', '2026-09-24T09:00:00.000Z', '2026-09-24T09:00:00.000Z', 1);

INSERT OR IGNORE INTO pages (id, kind, locale, slug, title, description, layout, blocks, body_md, seo, cover, tags, author, status, translation_key, published_at, created_at, updated_at, version) VALUES ('5d1b7c1e-2f7a-4c8e-9a51-0b6f3e2a7c03', 'post', 'en', 'from-goclaw-to-dewee', 'From GoClaw to dewee: why we closed the source', 'GoClaw stays open for the community; dewee carries the enterprise weight. The short version of why.', 'article', '[]', 'GoClaw started in February 2026 as an open agent gateway: inspired by OpenClaw, rebuilt from scratch in Go, and secure by default from day one. Versions 1 and 2 shipped in public in March, and v3 brought multi-tenancy, agent teams and five-layer security in April.

Then businesses came asking for more: stricter security, faster patches, someone to call. An open codebase meant a bigger attack surface than a small team could guard while also moving fast for enterprise customers.

So in June 2026 we split the work:

- **GoClaw stays open** and free for the community, under CC BY-NC 4.0.
- **dewee carries the enterprise weight**: a closed-source product with enterprise hardening, a customer control plane, licensing and a team that supports you.

> Inspired by OpenClaw. Rebuilt from scratch. Grown up for business.

That is the short version. [The whole story](/story) covers the people, the timeline and what changed along the way.', '{}', NULL, '["story"]', NULL, 'published', 'from-goclaw-to-dewee', '2026-09-24T10:00:00.000Z', '2026-09-24T10:00:00.000Z', '2026-09-24T10:00:00.000Z', 1);

INSERT OR IGNORE INTO pages (id, kind, locale, slug, title, description, layout, blocks, body_md, seo, cover, tags, author, status, translation_key, published_at, created_at, updated_at, version) VALUES ('5d1b7c1e-2f7a-4c8e-9a51-0b6f3e2a7c04', 'post', 'vi', 'from-goclaw-to-dewee', 'Từ GoClaw đến dewee: vì sao chúng tôi đóng mã nguồn', 'GoClaw vẫn mở cho cộng đồng; dewee gánh phần doanh nghiệp. Phiên bản ngắn của câu chuyện.', 'article', '[]', 'GoClaw ra đời vào tháng 2/2026 như một agent gateway mã nguồn mở: lấy cảm hứng từ OpenClaw, viết lại từ đầu bằng Go, và bảo mật mặc định ngay từ ngày đầu tiên. Phiên bản 1 và 2 ra mắt công khai trong tháng 3, rồi v3 mang đến đa người thuê, đội agent và bảo mật 5 lớp vào tháng 4.

Sau đó các doanh nghiệp tìm đến và cần nhiều hơn: bảo mật chặt hơn, vá lỗi nhanh hơn, có người để gọi khi cần. Một codebase mở đồng nghĩa với bề mặt tấn công lớn hơn mức một đội nhỏ có thể canh giữ, trong khi vẫn phải chạy nhanh cho khách hàng doanh nghiệp.

Vì vậy, tháng 6/2026 chúng tôi chia việc:

- **GoClaw vẫn mở** và miễn phí cho cộng đồng, theo giấy phép CC BY-NC 4.0.
- **dewee gánh phần doanh nghiệp**: một sản phẩm mã nguồn đóng, được gia cố cho doanh nghiệp, có control plane cho khách hàng, có giấy phép và một đội ngũ hỗ trợ bạn.

> Lấy cảm hứng từ OpenClaw. Viết lại từ đầu. Trưởng thành cho doanh nghiệp.

Đó là phiên bản ngắn. [Toàn bộ câu chuyện](/vi/story) kể về con người, các mốc thời gian và những gì đã thay đổi trên đường đi.', '{}', NULL, '["câu chuyện"]', NULL, 'published', 'from-goclaw-to-dewee', '2026-09-24T10:00:00.000Z', '2026-09-24T10:00:00.000Z', '2026-09-24T10:00:00.000Z', 1);

INSERT OR IGNORE INTO pages (id, kind, locale, slug, title, description, layout, blocks, body_md, seo, cover, tags, author, status, translation_key, published_at, created_at, updated_at, version) VALUES ('5d1b7c1e-2f7a-4c8e-9a51-0b6f3e2a7c05', 'post', 'en', 'how-we-test-dewee', 'How we test dewee: 8,900+ tests and counting', 'Unit, contract, invariant, integration and scenario tests: how dewee is checked before an agent ever meets a customer.', 'article', '[]', 'Agents that touch real customers and real money cannot be a weekend demo. So before we talk about features, here is how we check them.

## The number

As of 24 September 2026, the dewee repository holds more than 8,900 Go test functions, for about 637,000 lines of Go in the core runtime. They run on every change.

## The layers

- **Unit tests** sit next to the code they check, across the runtime''s packages.
- **Contract tests** pin the shape of the HTTP API and the WebSocket methods, such as `connect`, `chat.send` and `agents.list`. Removing a field or changing its type counts as a breaking change, and the tests say so before a client does.
- **Invariant tests** guard the rules that must never bend: tenant isolation, session boundaries, permission enforcement, and webhooks that stay inside their tenant.
- **Integration tests** run real subsystems end to end: hooks (including a chaos suite and a script sandbox), cross-tenant isolation and deny lists for the secure CLI, MCP grants and revokes, team task retries, and storage on both PostgreSQL and SQLite.
- **Scenario tests** replay whole journeys: an agent conversation, a session recovering after a failure, a task through its full lifecycle.
- **End-to-end channel tests** for Zalo.

## Every fix brings a test

When something breaks, the fix ships with a test that proves it. In September alone, releases added tests that pin a provider''s capability profile, prove that OpenCode Go requests carry the right session header, and make an audit-flagged MCP test independent of the machine it runs on.

## The release checks itself

Since v3.31 the release pipeline fails loudly when production surfaces diverge and refuses a relative release path. Since v3.32 every deploy gate retries the readiness check, not just the file transfer.

Tests do not make software perfect. They make mistakes cheaper to catch, which is how we could ship [six stable releases in September](/blog/september-2026-releases) without asking anyone to hold their breath.', '{}', NULL, '["engineering", "testing"]', NULL, 'published', 'how-we-test-dewee', '2026-09-24T11:00:00.000Z', '2026-09-24T11:00:00.000Z', '2026-09-24T11:00:00.000Z', 1);

INSERT OR IGNORE INTO pages (id, kind, locale, slug, title, description, layout, blocks, body_md, seo, cover, tags, author, status, translation_key, published_at, created_at, updated_at, version) VALUES ('5d1b7c1e-2f7a-4c8e-9a51-0b6f3e2a7c06', 'post', 'vi', 'how-we-test-dewee', 'Cách chúng tôi kiểm thử dewee: hơn 8.900 bài test và vẫn đang tăng', 'Unit, contract, invariant, integration và scenario test: dewee được kiểm tra thế nào trước khi agent gặp khách hàng.', 'article', '[]', 'Agent làm việc với khách hàng thật và tiền thật không thể là bản demo làm vội cuối tuần. Vì vậy, trước khi nói về tính năng, đây là cách chúng tôi kiểm tra chúng.

## Con số

Tính đến ngày 24/9/2026, repository của dewee có hơn 8.900 hàm test Go, cho khoảng 637.000 dòng Go của runtime lõi. Toàn bộ chạy lại mỗi khi có thay đổi.

## Các tầng kiểm thử

- **Unit test** nằm ngay cạnh phần code mà chúng kiểm tra, trên khắp các package của runtime.
- **Contract test** cố định hình dạng của HTTP API và các phương thức WebSocket như `connect`, `chat.send` và `agents.list`. Xoá một trường hay đổi kiểu dữ liệu đều bị tính là thay đổi phá vỡ tương thích, và test sẽ báo trước khi client phát hiện.
- **Invariant test** canh giữ những quy tắc không bao giờ được bẻ cong: cô lập tenant, ranh giới session, thực thi phân quyền, và webhook không vượt ra khỏi tenant của mình.
- **Integration test** chạy các hệ thống con thật từ đầu đến cuối: hooks (gồm cả bộ chaos test và script sandbox), cô lập liên tenant và danh sách chặn của secure CLI, cấp và thu hồi quyền MCP, retry task của đội agent, và lưu trữ trên cả PostgreSQL lẫn SQLite.
- **Scenario test** tái hiện trọn một hành trình: một cuộc hội thoại với agent, một session tự phục hồi sau sự cố, một task đi hết vòng đời.
- **Test end-to-end cho kênh** Zalo.

## Mỗi bản vá đi kèm một bài test

Khi có lỗi, bản vá luôn đi kèm một bài test chứng minh lỗi đã được sửa. Chỉ riêng tháng 9, các bản phát hành đã thêm test cố định hồ sơ năng lực của một nhà cung cấp, chứng minh request OpenCode Go gửi đúng header session, và làm cho một bài test MCP bị audit gắn cờ không còn phụ thuộc vào máy chạy nó.

## Quy trình phát hành tự kiểm tra chính nó

Từ v3.31, pipeline phát hành báo lỗi rõ ràng khi các môi trường production lệch nhau và từ chối đường dẫn phát hành tương đối. Từ v3.32, mọi cổng deploy đều thử lại bước kiểm tra sẵn sàng, chứ không chỉ bước chuyển file.

Test không làm phần mềm hoàn hảo. Test giúp phát hiện sai sót rẻ hơn, và nhờ vậy chúng tôi có thể phát hành [sáu bản stable trong tháng 9](/vi/blog/september-2026-releases) mà không bắt ai phải nín thở.', '{}', NULL, '["kỹ thuật", "kiểm thử"]', NULL, 'published', 'how-we-test-dewee', '2026-09-24T11:00:00.000Z', '2026-09-24T11:00:00.000Z', '2026-09-24T11:00:00.000Z', 1);

INSERT OR IGNORE INTO pages (id, kind, locale, slug, title, description, layout, blocks, body_md, seo, cover, tags, author, status, translation_key, published_at, created_at, updated_at, version) VALUES ('5d1b7c1e-2f7a-4c8e-9a51-0b6f3e2a7c07', 'post', 'en', 'september-2026-releases', 'September 2026: six stable releases', 'v3.28 to v3.33 in plain words: visual workflows, a public MCP server, new model providers and a round of security fixes.', 'article', '[]', 'September was a busy month in the changelog: six stable releases, v3.28 to v3.33, between 3 and 24 September. Here is what each one brought, in plain words. The full notes are in the [changelog](/changelog).

## v3.28 · 3 September

- CLI controls for text-to-speech provider settings, and new `dewee stt config get` and `set` commands for speech-to-text.
- Per-agent reasoning settings are validated, with CLI controls to change them.

## v3.29 · 4 September

- Traces show how an agent''s reasoning was delivered.
- Fleet administration actions leave trace spans too.
- The gateway rejects a tenant hint it cannot resolve instead of silently falling back.
- Safer VPS backups, with operator skills to run them.

## v3.30 · 19 September

- **Visual workflows:** a deterministic workflow engine with a canvas editor, a CLI and a run inspector.
- Cron jobs can start a workflow.
- An intent classifier for busy agents that can be off, run in shadow mode, or be active.
- Stuck team tasks get a recoverable retry path.

## v3.31 · 21 September

- New model providers in the catalog: GPT-6 Astra, ClinePass and OpenCode Go, plus a corrected Workers AI catalog and the Vercel AI Gateway.
- The release pipeline fails loudly when production surfaces diverge.
- The runtime fails closed when its database connection string is missing.

## v3.32 · 22 September

- A public, tenant-aware MCP HTTP server, so the tools in dewee can be used from other MCP clients.
- Deploy gates retry the readiness check, not just the transfer.

## v3.33 · 24 September

- Security: the operator CLI can no longer retarget credentials, and gateway secrets are stripped from the environment of host commands.
- Follow-up fixes for the public MCP beta.
- The customer control plane gains time zones, a changelog, and English and Vietnamese interface languages.

Work on v3.34 is already in beta. If one of these changes matters to your team, [ask us about it](/contact).', '{}', NULL, '["releases", "changelog"]', NULL, 'published', 'september-2026-releases', '2026-09-24T12:00:00.000Z', '2026-09-24T12:00:00.000Z', '2026-09-24T12:00:00.000Z', 1);

INSERT OR IGNORE INTO pages (id, kind, locale, slug, title, description, layout, blocks, body_md, seo, cover, tags, author, status, translation_key, published_at, created_at, updated_at, version) VALUES ('5d1b7c1e-2f7a-4c8e-9a51-0b6f3e2a7c08', 'post', 'vi', 'september-2026-releases', 'Tháng 9/2026: sáu bản phát hành stable', 'Từ v3.28 đến v3.33, nói dễ hiểu: workflow trực quan, MCP server công khai, nhà cung cấp mô hình mới và một loạt bản vá bảo mật.', 'article', '[]', 'Tháng 9 là một tháng bận rộn trong nhật ký thay đổi: sáu bản phát hành stable, từ v3.28 đến v3.33, trong khoảng từ ngày 3 đến ngày 24/9. Dưới đây là những gì mỗi bản mang lại, nói cho dễ hiểu. Ghi chú đầy đủ nằm trong [nhật ký thay đổi](/vi/changelog).

## v3.28 · 3/9

- Lệnh CLI để cấu hình nhà cung cấp chuyển văn bản thành giọng nói (TTS), và lệnh mới `dewee stt config get` và `set` cho nhận dạng giọng nói (STT).
- Cấu hình reasoning của từng agent được kiểm tra hợp lệ, kèm lệnh CLI để thay đổi.

## v3.29 · 4/9

- Trace cho thấy cách phần suy luận của agent được gửi đi.
- Các thao tác quản trị fleet cũng để lại trace span.
- Gateway từ chối tenant hint không xác định được, thay vì âm thầm quay về mặc định.
- Sao lưu VPS an toàn hơn, kèm skill vận hành để chạy việc sao lưu.

## v3.30 · 19/9

- **Workflow trực quan:** engine workflow tất định với trình soạn thảo dạng canvas, CLI và công cụ xem lại từng lần chạy.
- Cron job có thể khởi chạy một workflow.
- Bộ phân loại ý định cho agent đang bận, có thể tắt, chạy ở chế độ shadow, hoặc bật hẳn.
- Task của đội agent bị kẹt giờ có đường retry để phục hồi.

## v3.31 · 21/9

- Nhà cung cấp mô hình mới trong danh mục: GPT-6 Astra, ClinePass và OpenCode Go, cùng danh mục Workers AI được sửa lại và Vercel AI Gateway.
- Pipeline phát hành báo lỗi rõ ràng khi các môi trường production lệch nhau.
- Runtime dừng hẳn (fail closed) khi thiếu chuỗi kết nối cơ sở dữ liệu.

## v3.32 · 22/9

- MCP HTTP server công khai, nhận biết tenant, để các công cụ trong dewee dùng được từ những MCP client khác.
- Các cổng deploy thử lại bước kiểm tra sẵn sàng, chứ không chỉ bước chuyển file.

## v3.33 · 24/9

- Bảo mật: CLI vận hành không còn chuyển hướng được thông tin xác thực, và secret của gateway được loại khỏi môi trường của các lệnh chạy trên máy chủ.
- Các bản vá tiếp theo cho bản beta của MCP công khai.
- Control plane cho khách hàng có thêm múi giờ, nhật ký thay đổi, và giao diện tiếng Anh lẫn tiếng Việt.

v3.34 đã ở giai đoạn beta. Nếu thay đổi nào trong số này quan trọng với đội ngũ bạn, [hãy hỏi chúng tôi](/vi/contact).', '{}', NULL, '["phát hành", "changelog"]', NULL, 'published', 'september-2026-releases', '2026-09-24T12:00:00.000Z', '2026-09-24T12:00:00.000Z', '2026-09-24T12:00:00.000Z', 1);

INSERT INTO page_revisions (page_id, version, snapshot, actor, note)
SELECT id, 1, json_object('id', id, 'kind', kind, 'locale', locale, 'slug', slug, 'title', title, 'description', description, 'layout', layout, 'blocks', blocks, 'body_md', body_md, 'seo', seo, 'cover', cover, 'tags', tags, 'author', author, 'status', status, 'translation_key', translation_key, 'published_at', published_at, 'created_at', created_at, 'updated_at', updated_at, 'version', version), 'seed', 'seeded' FROM pages
WHERE id IN ('5d1b7c1e-2f7a-4c8e-9a51-0b6f3e2a7c01', '5d1b7c1e-2f7a-4c8e-9a51-0b6f3e2a7c02', '5d1b7c1e-2f7a-4c8e-9a51-0b6f3e2a7c03', '5d1b7c1e-2f7a-4c8e-9a51-0b6f3e2a7c04', '5d1b7c1e-2f7a-4c8e-9a51-0b6f3e2a7c05', '5d1b7c1e-2f7a-4c8e-9a51-0b6f3e2a7c06', '5d1b7c1e-2f7a-4c8e-9a51-0b6f3e2a7c07', '5d1b7c1e-2f7a-4c8e-9a51-0b6f3e2a7c08')
  AND NOT EXISTS (SELECT 1 FROM page_revisions r WHERE r.page_id = pages.id);
