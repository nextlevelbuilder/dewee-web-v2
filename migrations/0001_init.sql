-- dewee.sh v2 schema: page builder, blog, auth, leads, chat index, changelog, audit.
-- Timestamps are ISO-8601 UTC strings.

CREATE TABLE IF NOT EXISTS pages (
  id              TEXT PRIMARY KEY,
  kind            TEXT NOT NULL CHECK (kind IN ('page', 'post')),
  locale          TEXT NOT NULL CHECK (locale IN ('en', 'vi')),
  slug            TEXT NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  layout          TEXT NOT NULL DEFAULT 'default',
  blocks          TEXT NOT NULL DEFAULT '[]',
  body_md         TEXT,
  seo             TEXT NOT NULL DEFAULT '{}',
  cover           TEXT,
  tags            TEXT NOT NULL DEFAULT '[]',
  author          TEXT,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  translation_key TEXT,
  published_at    TEXT,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  version         INTEGER NOT NULL DEFAULT 1,
  UNIQUE (kind, locale, slug)
);
CREATE INDEX IF NOT EXISTS pages_listing ON pages (kind, locale, status, published_at DESC);
CREATE INDEX IF NOT EXISTS pages_translation ON pages (translation_key);

CREATE TABLE IF NOT EXISTS page_revisions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  page_id    TEXT NOT NULL REFERENCES pages (id) ON DELETE CASCADE,
  version    INTEGER NOT NULL,
  snapshot   TEXT NOT NULL,
  actor      TEXT NOT NULL,
  note       TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS page_revisions_page ON page_revisions (page_id, version DESC);

CREATE TABLE IF NOT EXISTS api_keys (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  prefix       TEXT NOT NULL,
  hash         TEXT NOT NULL UNIQUE,
  scopes       TEXT NOT NULL,
  owner_email  TEXT NOT NULL,
  created_at   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  last_used_at TEXT,
  expires_at   TEXT,
  revoked_at   TEXT
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id         TEXT PRIMARY KEY,
  email      TEXT NOT NULL,
  method     TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS login_codes (
  email      TEXT PRIMARY KEY,
  code_hash  TEXT NOT NULL,
  attempts   INTEGER NOT NULL DEFAULT 0,
  expires_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS leads (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  kind       TEXT NOT NULL,
  email      TEXT,
  name       TEXT,
  company    TEXT,
  locale     TEXT,
  source     TEXT,
  payload    TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS leads_kind ON leads (kind, created_at DESC);

CREATE TABLE IF NOT EXISTS chat_sessions (
  sid           TEXT PRIMARY KEY,
  locale        TEXT,
  email         TEXT,
  first_message TEXT,
  messages      INTEGER NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'open',
  created_at    TEXT NOT NULL,
  last_at       TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS chat_sessions_recent ON chat_sessions (last_at DESC);

CREATE TABLE IF NOT EXISTS releases (
  tag          TEXT PRIMARY KEY,
  name         TEXT,
  channel      TEXT NOT NULL CHECK (channel IN ('stable', 'beta')),
  published_at TEXT NOT NULL,
  body         TEXT NOT NULL DEFAULT '',
  url          TEXT,
  synced_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS releases_recent ON releases (published_at DESC);

CREATE TABLE IF NOT EXISTS audit_log (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  actor  TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT,
  detail TEXT,
  at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

CREATE TABLE IF NOT EXISTS idempotency (
  key        TEXT PRIMARY KEY,
  actor      TEXT NOT NULL,
  status     INTEGER NOT NULL,
  response   TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
