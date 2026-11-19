-- OAuth 2.1 for the remote MCP server (POST /mcp), so clients that cannot send a custom header
-- (Claude desktop / claude.ai connectors, ChatGPT) can sign in as a super admin.
-- Clients register themselves (RFC 7591, public clients with PKCE only). Codes and tokens are
-- stored only as SHA-256 hashes, like API keys and sessions.

CREATE TABLE IF NOT EXISTS oauth_clients (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  redirect_uris TEXT NOT NULL,                  -- JSON array of exact redirect URIs
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Authorization codes (single use, ten minutes) and access/refresh tokens.
CREATE TABLE IF NOT EXISTS oauth_grants (
  hash           TEXT PRIMARY KEY,
  kind           TEXT NOT NULL CHECK (kind IN ('code', 'access', 'refresh')),
  client_id      TEXT NOT NULL REFERENCES oauth_clients (id) ON DELETE CASCADE,
  email          TEXT NOT NULL,
  scopes         TEXT NOT NULL,
  redirect_uri   TEXT,                            -- code only
  code_challenge TEXT,                            -- code only (S256)
  expires_at     TEXT NOT NULL,
  used_at        TEXT,                            -- code / refresh: set once consumed
  created_at     TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX IF NOT EXISTS oauth_grants_expiry ON oauth_grants (expires_at);
