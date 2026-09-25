#!/usr/bin/env bash
# Dewee self-install for macOS and Linux (amd64/arm64).
#
#   curl -fsSL https://dewee.sh/install.sh | bash
#   curl -fsSL https://dewee.sh/install.sh | bash -s -- --version 1.2.3
#   curl -fsSL https://dewee.sh/install.sh | bash -s -- --docker
#
# Installs the prebuilt bundle (runtime + control panel + Node) into ~/.dewee,
# prepares PostgreSQL, registers user services and opens
# http://localhost:4321. Re-running it upgrades in place and keeps your
# secrets. Windows: use Docker Compose (https://dewee.sh/docker-compose.yml).
#
# Canonical source: scripts/selfhost/install.sh in the Dewee repository. The
# release workflow publishes it to cdn.dewee.sh, and dewee.sh serves a copy.
#
# Exit codes: 0 ok, 1 usage or other error, 2 unsupported platform,
# 3 PostgreSQL unavailable, 4 readiness timeout, 5 checksum mismatch,
# 6 download error.

set -euo pipefail

# Everything runs from main() at the very end, so a download cut short by
# `curl | bash` never executes a partial script.

DEWEE_DEFAULT_CDN="https://cdn.dewee.sh"
DEWEE_COMPOSE_HINT="curl -fsSL https://dewee.sh/docker-compose.yml -o docker-compose.yml && docker compose up -d"
# Internal runtime port. It is bound to 127.0.0.1 and never shown to users.
DEWEE_RUNTIME_PORT=18790
DEWEE_LAUNCHD_RUNTIME="sh.dewee.runtime"
DEWEE_LAUNCHD_CCP="sh.dewee.ccp"
DEWEE_UNIT_RUNTIME="dewee-runtime.service"
DEWEE_UNIT_CCP="dewee-ccp.service"
DEWEE_CLI_MARKER="# dewee-selfhost-cli-wrapper"

# ── Output ────────────────────────────────────────────────────────────────

say() { printf '%s\n' "$*"; }
info() { printf '==> %s\n' "$*"; }
warn() { printf 'Warning: %s\n' "$*" >&2; }
die() {
  local code="$1"
  shift
  printf 'Error: %s\n' "$*" >&2
  exit "$code"
}
docker_hint() {
  say "Use Docker instead:" >&2
  say "  $DEWEE_COMPOSE_HINT" >&2
}

# ── Options ───────────────────────────────────────────────────────────────

init_options() {
  OPT_VERSION="${DEWEE_VERSION:-}"
  OPT_CHANNEL="${DEWEE_CHANNEL:-stable}"
  OPT_HOME="${DEWEE_HOME:-}"
  OPT_HOME_EXPLICIT=0
  [ -n "$OPT_HOME" ] && OPT_HOME_EXPLICIT=1
  OPT_PORT="${DEWEE_APP_PORT:-4321}"
  OPT_PORT_EXPLICIT=0
  [ -n "${DEWEE_APP_PORT:-}" ] && OPT_PORT_EXPLICIT=1
  OPT_BIND="${DEWEE_BIND_ADDR:-127.0.0.1}"
  OPT_BIND_EXPLICIT=0
  [ -n "${DEWEE_BIND_ADDR:-}" ] && OPT_BIND_EXPLICIT=1
  OPT_MODE="${DEWEE_INSTALL_MODE:-binary}"
  OPT_INSTALL_PG="${DEWEE_INSTALL_POSTGRES:-0}"
  OPT_DSN_RUNTIME="${GOCLAW_POSTGRES_DSN:-}"
  OPT_DSN_APP="${DEWEE_APP_POSTGRES_DSN:-}"
  OPT_NO_START="${DEWEE_NO_START:-0}"
  OPT_NO_OPEN="${DEWEE_NO_OPEN:-0}"
  OPT_YES="${DEWEE_YES:-0}"
  OPT_UNINSTALL=0
  OPT_PURGE=0
  CDN_BASE="${DEWEE_CDN_BASE:-$DEWEE_DEFAULT_CDN}"
  CDN_BASE="${CDN_BASE%/}"
}

usage() {
  cat <<'USAGE'
Dewee self-install (macOS and Linux)

Usage: install.sh [options]

  --version X             Install this version (default: newest on the channel)
  --channel stable|beta   Release channel (default: stable)
  --dir PATH              Install root (default: ~/.dewee)
  --port N                Control panel port (default: 4321)
  --bind ADDR             Control panel bind address (default: 127.0.0.1)
  --docker                Install with Docker Compose instead of the bundle
  --install-postgres      Allow installing PostgreSQL + pgvector (brew or apt)
  --postgres-dsn-runtime  Existing PostgreSQL URL for the runtime
  --postgres-dsn-app      Existing PostgreSQL URL for the control panel
  --no-start              Install only; do not start services
  --no-open               Do not open the browser (the URL is still printed)
  --yes                   Non-interactive; accept the defaults (never installs
                          PostgreSQL; add --install-postgres for that)
  --uninstall [--purge]   Remove services and binaries; --purge also removes
                          data and the databases this script created
  -h, --help              Show this help

Every option has an environment equivalent, e.g. DEWEE_VERSION, DEWEE_HOME.
USAGE
}

need_value() {
  if [ "$#" -lt 2 ] || [ -z "$2" ]; then die 1 "$1 needs a value"; fi
}

parse_args() {
  while [ "$#" -gt 0 ]; do
    case "$1" in
      --version) need_value "$@"; OPT_VERSION="$2"; shift 2 ;;
      --channel) need_value "$@"; OPT_CHANNEL="$2"; shift 2 ;;
      --dir) need_value "$@"; OPT_HOME="$2"; OPT_HOME_EXPLICIT=1; shift 2 ;;
      --port) need_value "$@"; OPT_PORT="$2"; OPT_PORT_EXPLICIT=1; shift 2 ;;
      --bind) need_value "$@"; OPT_BIND="$2"; OPT_BIND_EXPLICIT=1; shift 2 ;;
      --docker) OPT_MODE=docker; shift ;;
      --install-postgres) OPT_INSTALL_PG=1; shift ;;
      --postgres-dsn-runtime) need_value "$@"; OPT_DSN_RUNTIME="$2"; shift 2 ;;
      --postgres-dsn-app) need_value "$@"; OPT_DSN_APP="$2"; shift 2 ;;
      --no-start) OPT_NO_START=1; shift ;;
      --no-open) OPT_NO_OPEN=1; shift ;;
      --yes|-y) OPT_YES=1; shift ;;
      --uninstall) OPT_UNINSTALL=1; shift ;;
      --purge) OPT_PURGE=1; shift ;;
      -h|--help) usage; exit 0 ;;
      *) usage >&2; die 1 "unknown option: $1" ;;
    esac
  done
}

validate_options() {
  case "$OPT_CHANNEL" in
    stable|beta) ;;
    *) die 1 "--channel must be stable or beta" ;;
  esac
  case "$OPT_MODE" in
    binary|docker) ;;
    *) die 1 "DEWEE_INSTALL_MODE must be binary or docker" ;;
  esac
  case "$OPT_PORT" in
    ''|*[!0-9]*) die 1 "--port must be a number" ;;
  esac
  if [ "$OPT_PORT" -lt 1 ] || [ "$OPT_PORT" -gt 65535 ] || [ "$OPT_PORT" -eq "$DEWEE_RUNTIME_PORT" ]; then
    die 1 "--port $OPT_PORT is not available for the control panel"
  fi
  case "$OPT_BIND" in
    *[!0-9A-Za-z.:-]*|'') die 1 "--bind must be an IP address or host name" ;;
  esac
  # "latest" is the Docker Compose default for DEWEE_VERSION; it means "newest".
  [ "$OPT_VERSION" = latest ] && OPT_VERSION=""
  if [ -n "$OPT_VERSION" ]; then
    OPT_VERSION="${OPT_VERSION#v}"
    is_version "$OPT_VERSION" || die 1 "--version must look like 1.2.3 or 1.2.3-beta.4"
  fi
  if [ "$OPT_PURGE" = 1 ] && [ "$OPT_UNINSTALL" != 1 ]; then
    die 1 "--purge is only valid with --uninstall"
  fi
  if { [ -n "$OPT_DSN_RUNTIME" ] && [ -z "$OPT_DSN_APP" ]; } || { [ -z "$OPT_DSN_RUNTIME" ] && [ -n "$OPT_DSN_APP" ]; }; then
    die 1 "give both --postgres-dsn-runtime and --postgres-dsn-app, or neither"
  fi
  if [ -n "$OPT_DSN_RUNTIME" ] && [ "$OPT_DSN_RUNTIME" = "$OPT_DSN_APP" ]; then
    die 1 "the runtime and control panel need separate databases"
  fi
  [ -n "$OPT_HOME" ] || OPT_HOME="${HOME:?HOME is not set}/.dewee"
  case "$OPT_HOME" in
    /*) ;;
    *) OPT_HOME="$(pwd)/$OPT_HOME" ;;
  esac
  OPT_HOME="${OPT_HOME%/}"
  # shellcheck disable=SC1003
  case "$OPT_HOME" in
    ''|/|"$HOME") die 1 "--dir must be a dedicated directory, not $OPT_HOME" ;;
    *'#'*|*'%'*|*'"'*|*"'"*|*'\'*|*'$'*|*'`'*) die 1 "--dir must not contain quotes, #, %, \$, \` or backslashes" ;;
  esac
}

is_version() {
  printf '%s' "$1" | grep -Eq '^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.]+)?$'
}

is_loopback() {
  case "$1" in
    127.*|localhost|::1) return 0 ;;
    *) return 1 ;;
  esac
}

# ── Prompts (always through /dev/tty so `curl | bash` works) ──────────────

have_tty() {
  [ -r /dev/tty ] && [ -w /dev/tty ] && { : </dev/tty; } 2>/dev/null
}

# confirm QUESTION: yes with --yes; no when there is no terminal.
confirm() {
  [ "$OPT_YES" = 1 ] && return 0
  have_tty || return 1
  local answer=""
  printf '%s [y/N] ' "$1" >/dev/tty
  read -r -t 300 answer </dev/tty || return 1
  case "$answer" in
    y|Y|yes|YES|Yes) return 0 ;;
    *) return 1 ;;
  esac
}

# ── Platform ──────────────────────────────────────────────────────────────

detect_platform() {
  local kernel machine
  kernel="$(uname -s 2>/dev/null || echo unknown)"
  machine="$(uname -m 2>/dev/null || echo unknown)"
  case "$kernel" in
    Darwin) OS=darwin ;;
    Linux) OS=linux ;;
    MINGW*|MSYS*|CYGWIN*|Windows_NT)
      say "Windows is supported through Docker Desktop." >&2
      say "  PowerShell: iwr https://dewee.sh/docker-compose.yml -OutFile docker-compose.yml; docker compose up -d" >&2
      exit 2 ;;
    *)
      printf 'Error: unsupported operating system: %s\n' "$kernel" >&2
      docker_hint
      exit 2 ;;
  esac
  case "$machine" in
    x86_64|amd64) ARCH=amd64 ;;
    arm64|aarch64) ARCH=arm64 ;;
    *)
      printf 'Error: unsupported CPU architecture: %s\n' "$machine" >&2
      docker_hint
      exit 2 ;;
  esac
}

# The bundle's Node and native modules are built for glibc.
detect_musl() {
  [ "$OS" = linux ] || return 1
  [ -f /etc/alpine-release ] && return 0
  if command -v ldd >/dev/null 2>&1 && { ldd --version 2>&1 || true; } | grep -qi musl; then
    return 0
  fi
  return 1
}

sha256_of() {
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$1" | awk '{print $1}'
  else
    shasum -a 256 "$1" | awk '{print $1}'
  fi
}

preflight() {
  detect_platform
  if [ "$OPT_MODE" = binary ] && detect_musl; then
    say "This Linux uses musl libc (for example Alpine); the prebuilt bundle needs glibc." >&2
    say "Re-run with --docker, or: $DEWEE_COMPOSE_HINT" >&2
    exit 2
  fi
  local tool
  for tool in curl tar awk sed grep; do
    command -v "$tool" >/dev/null 2>&1 || die 1 "$tool is required"
  done
  if ! command -v sha256sum >/dev/null 2>&1 && ! command -v shasum >/dev/null 2>&1; then
    die 1 "sha256sum or shasum is required"
  fi
  if [ "$(id -u)" = 0 ] && [ "$OPT_HOME_EXPLICIT" != 1 ]; then
    die 1 "do not run the installer as root; run it as your user (or pass --dir explicitly)"
  fi
}

# ── Downloads and manifests ───────────────────────────────────────────────

fetch() {
  curl -fsSL --retry 3 --connect-timeout 15 -o "$2" "$1" || die 6 "download failed: $1"
}

# json_string FILE KEY prints the first top-level "KEY": "value" string.
json_string() {
  tr -d '\n\r' <"$1" | sed -n "s/^[^{]*{.*\"$2\"[[:space:]]*:[[:space:]]*\"\\([^\"]*\\)\".*/\\1/p" | head -n 1
}

# asset_field FILE PLATFORM FIELD reads assets.<PLATFORM>.<FIELD>. Asset
# objects hold only strings, so "{...}" without nested braces is exact.
asset_field() {
  local object
  object="$(tr -d '\n\r' <"$1" | sed -n "s/.*\"$2\"[[:space:]]*:[[:space:]]*{\\([^}]*\\)}.*/\\1/p" | head -n 1)"
  [ -n "$object" ] || return 0
  printf '{%s}' "$object" | sed -n "s/.*\"$3\"[[:space:]]*:[[:space:]]*\"\\([^\"]*\\)\".*/\\1/p"
}

pointer_url() {
  if [ -n "$OPT_VERSION" ]; then
    printf '%s/releases/%s/manifest.json' "$CDN_BASE" "$OPT_VERSION"
  elif [ "$OPT_CHANNEL" = beta ]; then
    printf '%s/beta.json' "$CDN_BASE"
  else
    printf '%s/latest.json' "$CDN_BASE"
  fi
}

# version_cmp A B prints -1, 0 or 1 (semver, including -beta.N suffixes).
version_cmp() {
  local a_core="${1%%-*}" b_core="${2%%-*}" a_pre="" b_pre="" i x y
  case "$1" in *-*) a_pre="${1#*-}" ;; esac
  case "$2" in *-*) b_pre="${2#*-}" ;; esac
  for i in 1 2 3; do
    x="$(printf '%s' "$a_core" | cut -d. -f"$i")"
    y="$(printf '%s' "$b_core" | cut -d. -f"$i")"
    if [ "${x:-0}" -gt "${y:-0}" ]; then echo 1; return; fi
    if [ "${x:-0}" -lt "${y:-0}" ]; then echo -1; return; fi
  done
  if [ "$a_pre" = "$b_pre" ]; then echo 0; return; fi
  [ -z "$a_pre" ] && { echo 1; return; }
  [ -z "$b_pre" ] && { echo -1; return; }
  local a_tag="${a_pre%.*}" b_tag="${b_pre%.*}" a_num="${a_pre##*.}" b_num="${b_pre##*.}"
  if [ "$a_tag" = "$b_tag" ] && [ -n "${a_num##*[!0-9]*}" ] && [ -n "${b_num##*[!0-9]*}" ]; then
    if [ "$a_num" -gt "$b_num" ]; then echo 1; else echo -1; fi
    return
  fi
  if [ "$(printf '%s\n%s\n' "$a_pre" "$b_pre" | LC_ALL=C sort | head -n 1)" = "$a_pre" ]; then echo -1; else echo 1; fi
}

installed_version() {
  if [ -f "$OPT_HOME/current/VERSION" ]; then tr -d ' \n\r' <"$OPT_HOME/current/VERSION"; fi
}

# ── Bundle install ────────────────────────────────────────────────────────

download_bundle() {
  local manifest="$WORK_DIR/manifest.json" version url expected sums_url sums_file listed actual name
  info "Resolving the Dewee release ($(pointer_url))"
  fetch "$(pointer_url)" "$manifest"
  version="$(json_string "$manifest" version)"
  version="${version#v}"
  is_version "$version" || die 6 "the release manifest has no valid version"
  if [ -n "$OPT_VERSION" ] && [ "$version" != "$OPT_VERSION" ]; then
    die 6 "the manifest for $OPT_VERSION names version $version"
  fi
  INSTALL_VERSION="$version"

  local current
  current="$(installed_version)"
  if [ -n "$current" ] && [ "$(version_cmp "$version" "$current")" = -1 ]; then
    warn "$version is older than the installed $current (downgrade)."
    confirm "Downgrade to $version?" || die 1 "downgrade refused; re-run with --yes to downgrade"
  fi

  if [ -f "$OPT_HOME/versions/$version/.complete" ]; then
    info "Dewee $version is already downloaded"
    return
  fi

  url="$(asset_field "$manifest" "$OS-$ARCH" url)"
  expected="$(asset_field "$manifest" "$OS-$ARCH" sha256)"
  if [ -z "$url" ] || [ -z "$expected" ]; then die 2 "release $version has no bundle for $OS-$ARCH"; fi
  case "$url" in
    https://*) ;;
    *) die 6 "refusing a non-HTTPS bundle URL" ;;
  esac
  name="${url##*/}"
  sums_url="$(json_string "$manifest" checksumsUrl)"
  [ -n "$sums_url" ] || sums_url="$CDN_BASE/releases/$version/CHECKSUMS.sha256"
  case "$sums_url" in
    https://*) ;;
    *) die 6 "refusing a non-HTTPS checksums URL" ;;
  esac

  info "Downloading Dewee $version for $OS-$ARCH"
  sums_file="$WORK_DIR/CHECKSUMS.sha256"
  fetch "$sums_url" "$sums_file"
  fetch "$url" "$WORK_DIR/$name"

  actual="$(sha256_of "$WORK_DIR/$name")"
  listed="$(awk -v n="$name" '$2 == n || $2 == "*" n {print $1; exit}' "$sums_file")"
  if [ "$actual" != "$expected" ] || [ "$actual" != "$listed" ]; then
    rm -f "$WORK_DIR/$name"
    die 5 "checksum mismatch for $name; nothing was installed"
  fi

  local staging="$OPT_HOME/versions/.unpack-$version-$$"
  rm -rf "$staging"
  mkdir -p "$staging"
  tar -xzf "$WORK_DIR/$name" -C "$staging" || { rm -rf "$staging"; die 6 "could not unpack $name"; }
  if [ ! -x "$staging/bin/dewee" ] || [ ! -x "$staging/node/bin/node" ] || [ ! -d "$staging/ccp" ]; then
    rm -rf "$staging"
    die 6 "$name is not a complete Dewee bundle"
  fi
  [ -f "$staging/VERSION" ] || printf '%s\n' "$version" >"$staging/VERSION"
  touch "$staging/.complete"
  rm -rf "$OPT_HOME/versions/$version"
  mv "$staging" "$OPT_HOME/versions/$version"
}

# swap_current points current at the new version atomically, then keeps only
# the new and the previous version.
swap_current() {
  local previous="" link="$OPT_HOME/current" tmp="$OPT_HOME/.current-$$"
  if [ -L "$link" ]; then
    previous="$(basename "$(readlink "$link")")"
  fi
  rm -f "$tmp"
  ln -s "versions/$INSTALL_VERSION" "$tmp"
  mv -Tf "$tmp" "$link" 2>/dev/null || mv -fh "$tmp" "$link" 2>/dev/null || {
    rm -f "$link"
    mv -f "$tmp" "$link"
  }
  local entry base
  for entry in "$OPT_HOME"/versions/*; do
    [ -d "$entry" ] || continue
    base="$(basename "$entry")"
    [ "$base" = "$INSTALL_VERSION" ] && continue
    [ -n "$previous" ] && [ "$base" = "$previous" ] && continue
    rm -rf "$entry"
  done
}

# ── Env file ──────────────────────────────────────────────────────────────

env_get() {
  [ -f "$ENV_FILE" ] || return 0
  sed -n "s/^$1=//p" "$ENV_FILE" | tail -n 1 | sed -e "s/^\"\\(.*\\)\"\$/\\1/" -e "s/^'\\(.*\\)'\$/\\1/"
}

# env_set KEY VALUE [replace]: append KEY when missing; replace it only when
# the caller passes "replace" (an explicit flag on this run).
env_set() {
  local key="$1" value="$2" mode="${3:-}"
  if grep -q "^$key=" "$ENV_FILE" 2>/dev/null; then
    [ "$mode" = replace ] || return 0
    [ "$(env_get "$key")" = "$value" ] && return 0
    local tmp="$ENV_FILE.tmp.$$"
    (umask 077 && awk -v k="$key" -v v="$value" 'index($0, k "=") == 1 { print k "=" v; next } { print }' "$ENV_FILE" >"$tmp")
    mv -f "$tmp" "$ENV_FILE"
    return 0
  fi
  if [ -s "$ENV_FILE" ] && [ -n "$(tail -c 1 "$ENV_FILE")" ]; then
    printf '\n' >>"$ENV_FILE"
  fi
  printf '%s=%s\n' "$key" "$value" >>"$ENV_FILE"
}

write_env() {
  local cur="$OPT_HOME/current" port_mode="" bind_mode="" dsn_mode=""
  [ "$OPT_PORT_EXPLICIT" = 1 ] && port_mode=replace
  [ "$OPT_BIND_EXPLICIT" = 1 ] && bind_mode=replace
  [ "$DSN_EXPLICIT" = 1 ] && dsn_mode=replace

  info "Preparing secrets"
  "$cur/bin/dewee" selfhost init-secrets --out "$ENV_FILE" >/dev/null || die 1 "could not create $ENV_FILE"
  chmod 600 "$ENV_FILE"

  env_set GOCLAW_HOST 127.0.0.1
  env_set GOCLAW_PORT "$DEWEE_RUNTIME_PORT"
  env_set GOCLAW_DATA_DIR "$OPT_HOME/data"
  env_set GOCLAW_WORKSPACE "$OPT_HOME/workspace"
  env_set GOCLAW_CONFIG "$OPT_HOME/config.json"
  env_set GOCLAW_SKILLS_DIR "$OPT_HOME/data/skills"
  env_set GOCLAW_BUNDLED_SKILLS_DIR "$cur/skills"
  env_set GOCLAW_MIGRATIONS_DIR "$cur/migrations"
  env_set GOCLAW_POSTGRES_DSN "$RUNTIME_DSN" "$dsn_mode"
  env_set DEWEE_APP_POSTGRES_DSN "$APP_DSN" "$dsn_mode"
  env_set DEWEE_LICENSE_GATE channels
  env_set DEWEE_RGD_MOUNT hidden
  env_set DEWEE_APP_EDITION self_hosted
  env_set DEWEE_DEPLOYMENT_MODE on_prem
  env_set DEWEE_LICENSE_MODE channels_license
  env_set DEWEE_RUNTIME_URL "http://127.0.0.1:$DEWEE_RUNTIME_PORT"
  env_set DEWEE_RUNTIME_HTTP_URL /_runtime
  env_set DEWEE_CUSTOMER_BUNDLE_DIR "$cur/ccp/app-assets"
  env_set DEWEE_SETUP_TOKEN_MODE required
  env_set DEWEE_PUBLISHED_BIND_ADDR "$OPT_BIND" "$bind_mode"
  env_set HOST "$OPT_BIND" "$bind_mode"
  env_set PORT "$OPT_PORT" "$port_mode"
  env_set DEWEE_INVITE_EMAIL_PROVIDER disabled
  chmod 600 "$ENV_FILE"
}

# ── PostgreSQL ────────────────────────────────────────────────────────────

random_hex() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 24
  else
    od -An -N24 -tx1 /dev/urandom | tr -d ' \n'
  fi
}

# PSQL holds the admin command that reaches the local server.
find_admin_psql() {
  PSQL=()
  local dir brew_bin=""
  # Homebrew's postgresql@17 is keg-only, so its psql is not on PATH.
  if command -v brew >/dev/null 2>&1; then
    brew_bin="$(brew --prefix postgresql@17 2>/dev/null)/bin" || brew_bin=""
  fi
  for dir in "" "$brew_bin"; do
    [ "$dir" = "/bin" ] && continue
    if [ -z "$dir" ]; then
      command -v psql >/dev/null 2>&1 || continue
      if psql -X -d postgres -Atqc 'select 1' >/dev/null 2>&1; then
        PSQL=(psql -X -q -d postgres)
        return 0
      fi
    elif [ -n "$dir" ] && [ -x "$dir/psql" ] && "$dir/psql" -X -d postgres -Atqc 'select 1' >/dev/null 2>&1; then
      PSQL=("$dir/psql" -X -q -d postgres)
      return 0
    fi
  done
  if [ "$OS" = linux ] && command -v sudo >/dev/null 2>&1 && id postgres >/dev/null 2>&1 && command -v psql >/dev/null 2>&1; then
    say "sudo is needed to manage the local PostgreSQL server as the postgres user."
    if sudo -u postgres psql -X -d postgres -Atqc 'select 1' >/dev/null 2>&1; then
      PSQL=(sudo -u postgres psql -X -q -d postgres)
      return 0
    fi
  fi
  return 1
}

psql_admin() {
  "${PSQL[@]}" -v ON_ERROR_STOP=1 -At "$@"
}

has_pgvector() {
  [ "$(psql_admin -c "select 1 from pg_available_extensions where name = 'vector'" 2>/dev/null)" = 1 ]
}

postgres_unavailable() {
  printf 'Error: %s\n' "$1" >&2
  say "Options: re-run with --install-postgres, pass --postgres-dsn-runtime and --postgres-dsn-app," >&2
  say "or use Docker: $DEWEE_COMPOSE_HINT" >&2
  exit 3
}

install_postgres() {
  if [ "$OS" = darwin ]; then
    command -v brew >/dev/null 2>&1 || postgres_unavailable "Homebrew is needed to install PostgreSQL"
    info "Installing PostgreSQL 17 and pgvector with Homebrew"
    brew install postgresql@17 pgvector || postgres_unavailable "brew install failed"
    brew services start postgresql@17 || postgres_unavailable "could not start PostgreSQL"
  else
    command -v apt-get >/dev/null 2>&1 || postgres_unavailable "automatic install supports apt-based Linux only"
    say "sudo is needed to install PostgreSQL and pgvector with apt."
    sudo apt-get update || postgres_unavailable "apt-get update failed"
    sudo apt-get install -y postgresql || postgres_unavailable "apt-get install postgresql failed"
    local major
    major="$(find /usr/lib/postgresql -mindepth 1 -maxdepth 1 -type d -exec basename {} \; 2>/dev/null | sort -n | tail -n 1)"
    [ -n "$major" ] || postgres_unavailable "could not find the installed PostgreSQL version"
    sudo apt-get install -y "postgresql-$major-pgvector" || postgres_unavailable "postgresql-$major-pgvector is not available"
    sudo systemctl enable --now postgresql 2>/dev/null || sudo service postgresql start || true
  fi
  local i
  for i in $(seq 1 30); do
    find_admin_psql && return 0
    sleep 1
  done
  postgres_unavailable "PostgreSQL did not come up after installation"
}

# The role/database name is interpolated into SQL: only ever call this with the
# fixed names dewee_runtime and dewee_app, never user input.
ensure_role_and_db() {
  local name="$1" password
  password="$(random_hex)"
  if [ "$(psql_admin -c "select 1 from pg_roles where rolname = '$name'")" = 1 ]; then
    printf "ALTER ROLE %s WITH LOGIN PASSWORD '%s';\n" "$name" "$password" | psql_admin -f - >/dev/null
  else
    printf "CREATE ROLE %s WITH LOGIN PASSWORD '%s';\n" "$name" "$password" | psql_admin -f - >/dev/null
  fi
  if [ "$(psql_admin -c "select 1 from pg_database where datname = '$name'")" != 1 ]; then
    psql_admin -c "CREATE DATABASE $name OWNER $name" >/dev/null
    grep -qx "$name" "$OPT_HOME/.created-databases" 2>/dev/null || printf '%s\n' "$name" >>"$OPT_HOME/.created-databases"
  fi
  printf '%s' "$password"
}

setup_postgres() {
  DSN_EXPLICIT=0
  if [ -n "$OPT_DSN_RUNTIME" ]; then
    RUNTIME_DSN="$OPT_DSN_RUNTIME"
    APP_DSN="$OPT_DSN_APP"
    DSN_EXPLICIT=1
    return
  fi
  RUNTIME_DSN="$(env_get GOCLAW_POSTGRES_DSN)"
  APP_DSN="$(env_get DEWEE_APP_POSTGRES_DSN)"
  if [ -n "$RUNTIME_DSN" ] && [ -n "$APP_DSN" ]; then
    return
  fi

  info "Looking for a local PostgreSQL server"
  if ! find_admin_psql || ! has_pgvector; then
    # Installing PostgreSQL needs explicit consent: --install-postgres or an interactive "y".
    # --yes alone never installs it.
    if [ "$OPT_INSTALL_PG" = 1 ] || { [ "$OPT_YES" != 1 ] && confirm "Install PostgreSQL and pgvector now (uses $([ "$OS" = darwin ] && echo brew || echo 'sudo apt-get'))?"; }; then
      install_postgres
      has_pgvector || postgres_unavailable "the pgvector extension is not available on the local server"
    elif find_admin_psql; then
      postgres_unavailable "the local PostgreSQL server has no pgvector extension"
    else
      postgres_unavailable "no usable local PostgreSQL server was found"
    fi
  fi

  local port runtime_pw app_pw
  port="$(psql_admin -c 'show port')"
  runtime_pw="$(ensure_role_and_db dewee_runtime)"
  app_pw="$(ensure_role_and_db dewee_app)"
  # The runtime migrations create these; vector is not a trusted extension,
  # so create both here as the admin and the migration becomes a no-op.
  psql_admin -d dewee_runtime -c 'CREATE EXTENSION IF NOT EXISTS vector; CREATE EXTENSION IF NOT EXISTS pgcrypto;' >/dev/null ||
    postgres_unavailable "could not enable the vector extension"
  RUNTIME_DSN="postgres://dewee_runtime:$runtime_pw@127.0.0.1:$port/dewee_runtime?sslmode=disable"
  APP_DSN="postgres://dewee_app:$app_pw@127.0.0.1:$port/dewee_app?sslmode=disable"
  DSN_EXPLICIT=1
}

# ── Migrations ────────────────────────────────────────────────────────────

run_with_env() {
  (
    set -a
    # shellcheck disable=SC1090
    . "$ENV_FILE"
    set +a
    "$@"
  )
}

# print_log_tail FILE: last lines of a log, without internal addresses.
print_log_tail() {
  [ -f "$1" ] || return 0
  say "--- last lines of $1 ---" >&2
  tail -n 40 "$1" | grep -v -e "$DEWEE_RUNTIME_PORT" -e '-rgd' >&2 || true
}

migrate() {
  local cur="$OPT_HOME/current" log="$OPT_HOME/logs/install.log"
  info "Applying database migrations"
  if ! run_with_env "$cur/bin/dewee" upgrade >>"$log" 2>&1; then
    print_log_tail "$log"
    die 1 "runtime database migration failed"
  fi
  if ! run_with_env "$cur/node/bin/node" "$cur/ccp/server/migrate-self-hosted.mjs" >>"$log" 2>&1; then
    print_log_tail "$log"
    die 1 "control panel database migration failed"
  fi
}

# ── Services ──────────────────────────────────────────────────────────────

write_launchers() {
  local bin="$OPT_HOME/bin"
  mkdir -p "$bin"
  cat >"$bin/dewee-runtime-run" <<EOF
#!/bin/sh
# Starts the Dewee runtime with the settings in dewee.env.
set -a
. "$ENV_FILE"
set +a
cd "$OPT_HOME/data" || exit 1
exec "$OPT_HOME/current/bin/dewee"
EOF
  cat >"$bin/dewee-ccp-run" <<EOF
#!/bin/sh
# Starts the Dewee control panel with the settings in dewee.env.
set -a
. "$ENV_FILE"
set +a
cd "$OPT_HOME/current/ccp" || exit 1
exec "$OPT_HOME/current/node/bin/node" "$OPT_HOME/current/ccp/server/self-hosted-server.mjs"
EOF
  cat >"$bin/dewee-start" <<EOF
#!/bin/sh
# Starts Dewee without a service manager (containers, WSL1).
run="$OPT_HOME/run"; logs="$OPT_HOME/logs"
mkdir -p "\$run" "\$logs"
for svc in runtime ccp; do
  pid_file="\$run/\$svc.pid"
  if [ -f "\$pid_file" ] && kill -0 "\$(cat "\$pid_file")" 2>/dev/null; then continue; fi
  nohup /bin/sh "$bin/dewee-\$svc-run" >>"\$logs/\$svc.log" 2>&1 &
  echo \$! >"\$pid_file"
done
EOF
  cat >"$bin/dewee-stop" <<EOF
#!/bin/sh
# Stops Dewee processes started by dewee-start.
run="$OPT_HOME/run"
for svc in ccp runtime; do
  pid_file="\$run/\$svc.pid"
  [ -f "\$pid_file" ] || continue
  pid="\$(cat "\$pid_file")"
  kill "\$pid" 2>/dev/null || true
  i=0
  while kill -0 "\$pid" 2>/dev/null && [ "\$i" -lt 20 ]; do sleep 0.5; i=\$((i + 1)); done
  kill -9 "\$pid" 2>/dev/null || true
  rm -f "\$pid_file"
done
EOF
  chmod 755 "$bin/dewee-runtime-run" "$bin/dewee-ccp-run" "$bin/dewee-start" "$bin/dewee-stop"
}

xml_escape() {
  printf '%s' "$1" | sed -e 's/&/\&amp;/g' -e 's/</\&lt;/g' -e 's/>/\&gt;/g'
}

launchd_plist() {
  local label="$1" script="$2" log="$3"
  cat <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$label</string>
  <key>ProgramArguments</key>
  <array><string>/bin/sh</string><string>$(xml_escape "$script")</string></array>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>$(xml_escape "$log")</string>
  <key>StandardErrorPath</key><string>$(xml_escape "$log")</string>
</dict>
</plist>
EOF
}

systemd_unit() {
  local description="$1" script="$2" log="$3" after="${4:-}"
  cat <<EOF
[Unit]
Description=$description
${after:+After=$after}

[Service]
ExecStart=/bin/sh "$script"
Restart=on-failure
RestartSec=3
StandardOutput=append:$log
StandardError=append:$log

[Install]
WantedBy=default.target
EOF
}

has_user_systemd() {
  command -v systemctl >/dev/null 2>&1 && systemctl --user show-environment >/dev/null 2>&1
}

start_services() {
  local logs="$OPT_HOME/logs" bin="$OPT_HOME/bin"
  if [ "$OS" = darwin ] && command -v launchctl >/dev/null 2>&1; then
    local agents="$HOME/Library/LaunchAgents" uid
    uid="$(id -u)"
    mkdir -p "$agents"
    launchd_plist "$DEWEE_LAUNCHD_RUNTIME" "$bin/dewee-runtime-run" "$logs/runtime.log" >"$agents/$DEWEE_LAUNCHD_RUNTIME.plist"
    launchd_plist "$DEWEE_LAUNCHD_CCP" "$bin/dewee-ccp-run" "$logs/ccp.log" >"$agents/$DEWEE_LAUNCHD_CCP.plist"
    local label
    for label in "$DEWEE_LAUNCHD_RUNTIME" "$DEWEE_LAUNCHD_CCP"; do
      launchctl bootout "gui/$uid/$label" >/dev/null 2>&1 || true
      launchctl bootstrap "gui/$uid" "$agents/$label.plist" || die 1 "launchctl could not start $label"
    done
  elif [ "$OS" = linux ] && has_user_systemd; then
    local units="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"
    mkdir -p "$units"
    systemd_unit "Dewee runtime" "$bin/dewee-runtime-run" "$logs/runtime.log" >"$units/$DEWEE_UNIT_RUNTIME"
    systemd_unit "Dewee control panel" "$bin/dewee-ccp-run" "$logs/ccp.log" "$DEWEE_UNIT_RUNTIME" >"$units/$DEWEE_UNIT_CCP"
    systemctl --user daemon-reload
    systemctl --user enable "$DEWEE_UNIT_RUNTIME" "$DEWEE_UNIT_CCP" >/dev/null 2>&1 || die 1 "systemctl --user enable failed"
    systemctl --user restart "$DEWEE_UNIT_RUNTIME" "$DEWEE_UNIT_CCP" || die 1 "systemctl --user could not start Dewee"
    if command -v loginctl >/dev/null 2>&1 && ! loginctl show-user "$(id -un)" -p Linger 2>/dev/null | grep -q 'Linger=yes'; then
      say "Tip: run 'sudo loginctl enable-linger $(id -un)' so Dewee starts without a login."
    fi
  else
    "$bin/dewee-stop"
    "$bin/dewee-start"
    say "No service manager found: started in the background. Use $bin/dewee-start and $bin/dewee-stop."
  fi
}

stop_services() {
  if [ "$OS" = darwin ] && command -v launchctl >/dev/null 2>&1; then
    local uid label
    uid="$(id -u)"
    for label in "$DEWEE_LAUNCHD_CCP" "$DEWEE_LAUNCHD_RUNTIME"; do
      launchctl bootout "gui/$uid/$label" >/dev/null 2>&1 || true
      rm -f "$HOME/Library/LaunchAgents/$label.plist"
    done
  fi
  if [ "$OS" = linux ] && has_user_systemd; then
    local units="${XDG_CONFIG_HOME:-$HOME/.config}/systemd/user"
    systemctl --user disable --now "$DEWEE_UNIT_CCP" "$DEWEE_UNIT_RUNTIME" >/dev/null 2>&1 || true
    rm -f "$units/$DEWEE_UNIT_CCP" "$units/$DEWEE_UNIT_RUNTIME"
    systemctl --user daemon-reload >/dev/null 2>&1 || true
  fi
  if [ -x "$OPT_HOME/bin/dewee-stop" ]; then
    "$OPT_HOME/bin/dewee-stop" || true
  fi
}

# install_cli puts a `dewee` wrapper on PATH that knows this install root.
install_cli() {
  local dir="$HOME/.local/bin" target="$HOME/.local/bin/dewee"
  mkdir -p "$dir"
  if [ -e "$target" ] && ! grep -q "$DEWEE_CLI_MARKER" "$target" 2>/dev/null; then
    warn "$target exists and was not created by this installer; leaving it alone."
    return
  fi
  cat >"$target" <<EOF
#!/bin/sh
$DEWEE_CLI_MARKER
DEWEE_HOME="\${DEWEE_HOME:-$OPT_HOME}"
export DEWEE_HOME
exec "$OPT_HOME/current/bin/dewee" "\$@"
EOF
  chmod 755 "$target"
  case ":$PATH:" in
    *":$dir:"*) ;;
    *) say "Add $dir to your PATH to use the dewee command, e.g.: export PATH=\"$dir:\$PATH\"" ;;
  esac
}

# ── Readiness and first run ───────────────────────────────────────────────

probe_host() {
  case "$OPT_BIND" in
    0.0.0.0|::|127.*|localhost|::1) printf '127.0.0.1' ;;
    *:*) printf '[%s]' "$OPT_BIND" ;;
    *) printf '%s' "$OPT_BIND" ;;
  esac
}

wait_ready() {
  local deadline=$((SECONDS + ${DEWEE_READY_TIMEOUT:-120}))
  info "Waiting for Dewee to start"
  until curl -fsS -o /dev/null --max-time 3 "http://127.0.0.1:$DEWEE_RUNTIME_PORT/readyz" 2>/dev/null; do
    if [ "$SECONDS" -ge "$deadline" ]; then
      print_log_tail "$OPT_HOME/logs/runtime.log"
      die 4 "the Dewee runtime did not become ready in time"
    fi
    sleep 2
  done
  until curl -fsS -o /dev/null --max-time 3 "http://$(probe_host):$OPT_PORT/readyz" 2>/dev/null; do
    if [ "$SECONDS" -ge "$deadline" ]; then
      print_log_tail "$OPT_HOME/logs/ccp.log"
      die 4 "the Dewee control panel did not become ready in time"
    fi
    sleep 2
  done
}

can_open_browser() {
  [ "$OPT_NO_OPEN" = 1 ] && return 1
  if [ "$OS" = darwin ]; then
    command -v open >/dev/null 2>&1
  else
    { [ -n "${DISPLAY:-}" ] || [ -n "${WAYLAND_DISPLAY:-}" ]; } && command -v xdg-open >/dev/null 2>&1
  fi
}

open_url() {
  can_open_browser || return 0
  if [ "$OS" = darwin ]; then
    open "$1" >/dev/null 2>&1 || true
  else
    xdg-open "$1" >/dev/null 2>&1 || true
  fi
}

# finish prints the control panel URL and, on a first install, the one-time
# setup link. Only the control panel address is ever shown.
finish() {
  local base="http://localhost:$OPT_PORT" setup_link=""
  if [ "$FIRST_INSTALL" = 1 ]; then
    setup_link="$("$@" 2>/dev/null)" || setup_link=""
  fi
  say ""
  say "Dewee is running → $base"
  if [ -n "$setup_link" ]; then
    say "Create your owner account with this one-time setup link (valid 30 minutes):"
    say "  $setup_link"
    open_url "$setup_link"
  else
    open_url "$base/"
  fi
  if ! is_loopback "$OPT_BIND"; then
    warn "the control panel listens on $OPT_BIND, so other machines on your network can reach it."
  fi
}

# ── Docker mode ───────────────────────────────────────────────────────────

install_docker() {
  command -v docker >/dev/null 2>&1 || die 1 "Docker is not installed; see https://docs.docker.com/get-docker/"
  docker compose version >/dev/null 2>&1 || die 1 "the Docker Compose plugin is required (docker compose)"
  mkdir -p "$OPT_HOME"
  local compose="$OPT_HOME/docker-compose.yml" first=1 prefix="" tag="latest"
  [ -f "$compose" ] && first=0
  [ "$OPT_CHANNEL" = beta ] && prefix="beta/" && tag="beta"
  [ -n "$OPT_VERSION" ] && tag="v$OPT_VERSION"

  info "Downloading the Docker Compose file"
  fetch "$CDN_BASE/${prefix}docker-compose.yml" "$WORK_DIR/docker-compose.yml"
  mv -f "$WORK_DIR/docker-compose.yml" "$compose"
  {
    printf '%s\n' "# Written by the Dewee installer; edit, then run: docker compose up -d"
    printf 'DEWEE_VERSION=%s\n' "$tag"
    printf 'DEWEE_APP_PORT=%s\n' "$OPT_PORT"
    printf 'DEWEE_BIND_ADDR=%s\n' "$OPT_BIND"
  } >"$OPT_HOME/.env"

  if [ "$OPT_NO_START" = 1 ]; then
    say "Installed $compose. Start it with: cd $OPT_HOME && docker compose up -d"
    return
  fi
  info "Starting Dewee with Docker Compose"
  (cd "$OPT_HOME" && docker compose pull && docker compose up -d) || die 1 "docker compose up failed"

  local deadline=$((SECONDS + ${DEWEE_READY_TIMEOUT:-180}))
  until curl -fsS -o /dev/null --max-time 3 "http://$(probe_host):$OPT_PORT/readyz" 2>/dev/null; do
    if [ "$SECONDS" -ge "$deadline" ]; then
      (cd "$OPT_HOME" && docker compose logs --tail 40 dewee-app 2>&1 | grep -v -e "$DEWEE_RUNTIME_PORT" -e '-rgd' >&2) || true
      die 4 "Dewee did not become ready in time"
    fi
    sleep 3
  done
  FIRST_INSTALL="$first"
  (cd "$OPT_HOME" && finish docker compose exec -T dewee dewee selfhost access-link --purpose setup --base-url "http://localhost:$OPT_PORT")
  say "Setup link again later: cd $OPT_HOME && docker compose exec dewee dewee selfhost access-link --purpose setup"
  say "Upgrade: cd $OPT_HOME && docker compose pull && docker compose up -d"
}

# ── Uninstall ─────────────────────────────────────────────────────────────

drop_created_databases() {
  [ -f "$OPT_HOME/.created-databases" ] || return 0
  if ! find_admin_psql; then
    warn "could not reach PostgreSQL; drop these databases yourself: $(tr '\n' ' ' <"$OPT_HOME/.created-databases")"
    return 0
  fi
  local name
  while IFS= read -r name; do
    case "$name" in dewee_runtime|dewee_app) ;; *) continue ;; esac
    psql_admin -c "DROP DATABASE IF EXISTS $name" >/dev/null || warn "could not drop database $name"
    psql_admin -c "DROP ROLE IF EXISTS $name" >/dev/null || warn "could not drop role $name"
  done <"$OPT_HOME/.created-databases"
}

uninstall() {
  [ -d "$OPT_HOME" ] || { say "Nothing to remove at $OPT_HOME."; return; }
  if [ ! -f "$OPT_HOME/dewee.env" ] && [ ! -d "$OPT_HOME/versions" ] && [ ! -f "$OPT_HOME/docker-compose.yml" ]; then
    die 1 "$OPT_HOME does not look like a Dewee install; nothing removed"
  fi
  if [ "$OPT_PURGE" = 1 ]; then
    confirm "Permanently delete all Dewee data in $OPT_HOME and the databases this installer created?" ||
      die 1 "purge needs confirmation (or --yes)"
  fi
  if [ -f "$OPT_HOME/docker-compose.yml" ] && command -v docker >/dev/null 2>&1; then
    if [ "$OPT_PURGE" = 1 ]; then
      (cd "$OPT_HOME" && docker compose down -v) || warn "docker compose down failed"
    else
      (cd "$OPT_HOME" && docker compose down) || warn "docker compose down failed"
    fi
  fi
  stop_services
  if grep -q "$DEWEE_CLI_MARKER" "$HOME/.local/bin/dewee" 2>/dev/null; then
    rm -f "$HOME/.local/bin/dewee"
  fi
  rm -rf "${OPT_HOME:?}/versions" "${OPT_HOME:?}/current" "${OPT_HOME:?}/bin" "${OPT_HOME:?}/run"
  if [ "$OPT_PURGE" = 1 ]; then
    drop_created_databases
    rm -rf "$OPT_HOME"
    say "Dewee and its data were removed."
  else
    say "Dewee services and binaries were removed. Data and secrets remain in $OPT_HOME."
  fi
}

# ── Main ──────────────────────────────────────────────────────────────────

cleanup() {
  [ -n "${WORK_DIR:-}" ] && rm -rf "$WORK_DIR"
  [ -n "${LOCK_DIR:-}" ] && rmdir "$LOCK_DIR" 2>/dev/null
  return 0
}

acquire_lock() {
  LOCK_DIR="$OPT_HOME/.install.lock"
  if ! mkdir "$LOCK_DIR" 2>/dev/null; then
    LOCK_DIR=""
    die 1 "another installer run is using $OPT_HOME (remove $OPT_HOME/.install.lock if it is stale)"
  fi
}

main() {
  init_options
  parse_args "$@"
  validate_options
  preflight

  if [ "$OPT_UNINSTALL" = 1 ]; then
    uninstall
    return
  fi

  WORK_DIR="$(mktemp -d "${TMPDIR:-/tmp}/dewee-install.XXXXXX")"
  LOCK_DIR=""
  trap cleanup EXIT
  mkdir -p "$OPT_HOME"
  chmod 700 "$OPT_HOME"
  acquire_lock

  if [ "$OPT_MODE" = docker ]; then
    install_docker
    return
  fi

  ENV_FILE="$OPT_HOME/dewee.env"
  FIRST_INSTALL=1
  [ -L "$OPT_HOME/current" ] && FIRST_INSTALL=0
  mkdir -p "$OPT_HOME/versions" "$OPT_HOME/logs" "$OPT_HOME/data" "$OPT_HOME/workspace"

  download_bundle
  swap_current
  setup_postgres
  write_env
  migrate
  write_launchers
  install_cli

  if [ "$OPT_NO_START" = 1 ]; then
    say "Dewee $INSTALL_VERSION is installed in $OPT_HOME. Start it by re-running the installer without --no-start."
    return
  fi
  start_services
  wait_ready
  finish "$OPT_HOME/current/bin/dewee" selfhost access-link --purpose setup \
    --base-url "http://localhost:$OPT_PORT" --env-file "$ENV_FILE"
  say "Setup link again later: dewee selfhost access-link --purpose setup"
}

if [ "${DEWEE_INSTALL_LIB:-0}" != 1 ]; then
  main "$@"
fi
