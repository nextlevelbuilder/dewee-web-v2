/**
 * The prompt a visitor hands to their coding agent (Claude Code, Codex, Cursor…) so it installs
 * dewee for them. Commands, the port and the dashboard URL come from SELF_INSTALL, and option names
 * mirror `install.sh --help` (public/install.sh), so the prompt never drifts from the real
 * installer; tests/install-agent-prompt.test.ts checks both.
 *
 * Decisions are split on purpose: the agent detects and automates everything safe, and must stop
 * and ask before sudo or system packages, anything destructive, exposing dewee beyond localhost,
 * and anything involving a secret (the user types those in the dashboard, never the agent).
 */
import type { Bi, Locale } from "~/i18n/config";
import { SELF_INSTALL } from "~/content/site";

const c = SELF_INSTALL.commands;
const vars = {
  script: c.script,
  docker: c.docker.join(" && "),
  windows: c.dockerWindows.join("; "),
  port: String(SELF_INSTALL.port),
  url: SELF_INSTALL.dashboardUrl,
};

const TEMPLATES: Bi = {
  en: `You are installing dewee (https://dewee.sh), a self-hosted AI agent platform, on this machine for me. Work step by step, run the checks yourself, and keep me informed in short messages. Follow these rules exactly.

## Ground rules
- Use only the official installer and compose file below. Never build from source, never pipe any other URL into a shell.
- Never print, log or ask me to paste secrets (database passwords, licence keys, LLM API keys, tokens). dewee generates its own secrets; I type the rest in the dashboard myself.
- STOP and ask me before you: use sudo or install system packages (PostgreSQL, Docker, Homebrew…); delete, uninstall, purge or overwrite anything; make dewee reachable from outside this machine (any bind address other than 127.0.0.1, domains, DNS, firewall, reverse proxy, TLS); or need a secret from me. Ask one clear question with your recommended option first.

## 1. Detect (no changes yet)
Find out and report in one short summary:
- OS and version, CPU architecture (amd64/arm64), and on Linux whether libc is glibc or musl.
- Whether Docker and Docker Compose v2 are installed and running (\`docker compose version\`, \`docker info\`).
- Whether a local PostgreSQL server answers (\`psql\`, \`pg_isready\`, Homebrew \`postgresql@17\`, or the \`postgres\` system user on Linux).
- Whether dewee is already installed (\`~/.dewee\`, a \`dewee\` command, launchd/systemd services, or a \`dewee\` compose project).
- Whether port {port} is free (\`lsof -i :{port}\` or \`ss -ltnp\`).
- Whether this looks like a headless server (no desktop session, reached over SSH) or a personal computer.
- Free RAM (dewee needs at least 2 GB).

## 2. Decide
Pick the method yourself:
- Windows → Docker Desktop with Docker Compose.
- Linux with musl → Docker.
- macOS or Linux with glibc and a working local PostgreSQL → the standalone binary.
- macOS or Linux with glibc, no PostgreSQL, Docker available → ask me: Docker (recommended, brings its own databases), or the binary with PostgreSQL installed by the installer (\`--install-postgres\`, uses brew or apt and may need sudo), or the binary with two existing database URLs I provide.
- No Docker and no PostgreSQL → ask me before installing either.
Defaults (do not ask about these): the stable channel and the newest version, install folder \`~/.dewee\`, port {port}, bind address 127.0.0.1.
If dewee is already installed, ask me whether to upgrade it in place (secrets and data are kept). If port {port} is held by something else, never kill it: suggest the next free port and ask.
If this is a headless server, ask whether I want to reach the dashboard through an SSH tunnel (recommended, nothing exposed) or through my own domain. For a domain, propose a reverse proxy with TLS (for example Caddy) in front of 127.0.0.1:{port}, wait for my approval, and set \`DEWEE_TRUSTED_PROXY_CIDRS\` to the proxy address. Never bind 0.0.0.0 without TLS.

## 3. Install
Standalone binary (macOS/Linux):
\`\`\`
{script}
\`\`\`
Add options after \`bash -s --\` when needed: \`--port N\`, \`--install-postgres\` (only after I approved), \`--postgres-dsn-runtime URL --postgres-dsn-app URL\` (two separate databases), \`--no-open\` on a headless server, \`--yes\` for non-interactive runs. Example: \`curl -fsSL https://dewee.sh/install.sh | bash -s -- --no-open --port 4322\`. Run as my normal user, never as root.
Docker (macOS/Linux), in a dedicated folder such as \`~/dewee\`:
\`\`\`
{docker}
\`\`\`
Docker Desktop on Windows, in PowerShell, in a dedicated folder:
\`\`\`
{windows}
\`\`\`
For Docker, change the port with \`DEWEE_APP_PORT=N\` in front of \`docker compose up -d\`. No .env file is needed; dewee creates its secrets on first start.
If the installer fails, read its exit code: 2 unsupported platform (switch to Docker), 3 PostgreSQL unavailable (go back to step 2), 4 readiness timeout (check the logs in \`~/.dewee/logs\` or \`docker compose logs\`), 5 checksum mismatch (stop and tell me; do not retry with another source), 6 download error (retry once, then tell me).

## 4. Verify and hand over
- Check \`http://localhost:{port}/readyz\` (or your chosen port) answers.
- Get the one-time owner setup link. The binary installer prints it; otherwise run \`dewee selfhost access-link --purpose setup\` (binary) or \`docker compose exec dewee dewee selfhost access-link --purpose setup\` (Docker). The link is valid for 30 minutes.
- Give me: the method you used, the version, the dashboard URL ({url} unless the port changed), the setup link, and how to start, stop, upgrade (re-run the same install command, or \`docker compose pull && docker compose up -d\`) and view logs.
- Then stop. I will create the owner account and add my LLM API key in the dashboard myself. Do not touch licences or channels.`,
  vi: `Bạn sẽ cài dewee (https://dewee.sh), nền tảng AI agent tự host, lên máy này giúp tôi. Làm từng bước, tự chạy các bước kiểm tra, báo cho tôi bằng tin nhắn ngắn và trả lời tôi bằng tiếng Việt. Tuân thủ đúng các quy tắc sau.

## Quy tắc chung
- Chỉ dùng bộ cài và file compose chính thức bên dưới. Không build từ mã nguồn, không pipe bất kỳ URL nào khác vào shell.
- Không bao giờ in ra, ghi log hay bảo tôi dán bí mật (mật khẩu database, license key, API key LLM, token). dewee tự sinh secrets của nó; phần còn lại tôi tự nhập trên bảng điều khiển.
- DỪNG LẠI và hỏi tôi trước khi: dùng sudo hoặc cài gói hệ thống (PostgreSQL, Docker, Homebrew…); xoá, gỡ cài đặt, purge hay ghi đè bất cứ thứ gì; cho dewee truy cập được từ ngoài máy này (bind khác 127.0.0.1, domain, DNS, firewall, reverse proxy, TLS); hoặc cần một bí mật từ tôi. Hỏi một câu rõ ràng, đặt phương án bạn khuyên lên đầu.

## 1. Dò môi trường (chưa thay đổi gì)
Kiểm tra và báo lại trong một bản tóm tắt ngắn:
- Hệ điều hành và phiên bản, kiến trúc CPU (amd64/arm64), và trên Linux thì libc là glibc hay musl.
- Docker và Docker Compose v2 đã cài và đang chạy chưa (\`docker compose version\`, \`docker info\`).
- Có PostgreSQL local đang trả lời không (\`psql\`, \`pg_isready\`, \`postgresql@17\` của Homebrew, hoặc user hệ thống \`postgres\` trên Linux).
- dewee đã được cài chưa (\`~/.dewee\`, lệnh \`dewee\`, dịch vụ launchd/systemd, hoặc project compose \`dewee\`).
- Cổng {port} có trống không (\`lsof -i :{port}\` hoặc \`ss -ltnp\`).
- Máy này là server không màn hình (vào qua SSH) hay máy cá nhân.
- RAM trống (dewee cần ít nhất 2 GB).

## 2. Quyết định
Tự chọn cách cài:
- Windows → Docker Desktop với Docker Compose.
- Linux dùng musl → Docker.
- macOS hoặc Linux glibc, có PostgreSQL local chạy được → binary độc lập.
- macOS hoặc Linux glibc, không có PostgreSQL, có Docker → hỏi tôi: Docker (khuyên dùng, tự kèm database), hoặc binary để bộ cài tự cài PostgreSQL (\`--install-postgres\`, dùng brew hoặc apt, có thể cần sudo), hoặc binary với hai URL database có sẵn do tôi cung cấp.
- Không có Docker lẫn PostgreSQL → hỏi tôi trước khi cài bất cứ thứ nào.
Mặc định (không cần hỏi): kênh stable và phiên bản mới nhất, thư mục cài \`~/.dewee\`, cổng {port}, địa chỉ bind 127.0.0.1.
Nếu dewee đã được cài, hỏi tôi có nâng cấp tại chỗ không (secrets và dữ liệu được giữ nguyên). Nếu cổng {port} đang bị chương trình khác dùng, không được kill: đề xuất cổng trống kế tiếp và hỏi tôi.
Nếu là server không màn hình, hỏi tôi muốn vào bảng điều khiển qua SSH tunnel (khuyên dùng, không phơi gì ra ngoài) hay qua domain riêng. Với domain, đề xuất reverse proxy có TLS (ví dụ Caddy) đứng trước 127.0.0.1:{port}, chờ tôi đồng ý, rồi đặt \`DEWEE_TRUSTED_PROXY_CIDRS\` là địa chỉ của proxy. Không bao giờ bind 0.0.0.0 khi không có TLS.

## 3. Cài đặt
Binary độc lập (macOS/Linux):
\`\`\`
{script}
\`\`\`
Thêm tuỳ chọn sau \`bash -s --\` khi cần: \`--port N\`, \`--install-postgres\` (chỉ khi tôi đã đồng ý), \`--postgres-dsn-runtime URL --postgres-dsn-app URL\` (hai database riêng), \`--no-open\` trên server không màn hình, \`--yes\` để chạy không tương tác. Ví dụ: \`curl -fsSL https://dewee.sh/install.sh | bash -s -- --no-open --port 4322\`. Chạy bằng user thường của tôi, không bao giờ bằng root.
Docker (macOS/Linux), trong một thư mục riêng như \`~/dewee\`:
\`\`\`
{docker}
\`\`\`
Docker Desktop trên Windows, trong PowerShell, tại một thư mục riêng:
\`\`\`
{windows}
\`\`\`
Với Docker, đổi cổng bằng \`DEWEE_APP_PORT=N\` đặt trước \`docker compose up -d\`. Không cần file .env; dewee tự tạo secrets ở lần chạy đầu.
Nếu bộ cài lỗi, đọc exit code: 2 nền tảng không hỗ trợ (chuyển sang Docker), 3 không có PostgreSQL (quay lại bước 2), 4 quá thời gian chờ sẵn sàng (xem log ở \`~/.dewee/logs\` hoặc \`docker compose logs\`), 5 sai checksum (dừng lại và báo tôi; không thử nguồn khác), 6 lỗi tải về (thử lại một lần, rồi báo tôi).

## 4. Kiểm tra và bàn giao
- Kiểm tra \`http://localhost:{port}/readyz\` (hoặc cổng đã chọn) trả lời được.
- Lấy link thiết lập chủ sở hữu dùng một lần. Bộ cài binary sẽ in ra; nếu không, chạy \`dewee selfhost access-link --purpose setup\` (binary) hoặc \`docker compose exec dewee dewee selfhost access-link --purpose setup\` (Docker). Link có hiệu lực 30 phút.
- Gửi tôi: cách cài đã dùng, phiên bản, địa chỉ bảng điều khiển ({url} nếu không đổi cổng), link thiết lập, và cách khởi động, dừng, nâng cấp (chạy lại đúng lệnh cài, hoặc \`docker compose pull && docker compose up -d\`) và xem log.
- Rồi dừng lại. Tôi sẽ tự tạo tài khoản chủ sở hữu và thêm API key LLM trên bảng điều khiển. Không đụng tới license hay kênh chat.`,
};

/** The install prompt for a locale, with the real commands and port filled in. */
export function installAgentPrompt(locale: Locale): string {
  return TEMPLATES[locale].replace(/\{(script|docker|windows|port|url)\}/g, (_, k: keyof typeof vars) => vars[k]);
}
