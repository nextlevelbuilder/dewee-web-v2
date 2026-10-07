-- Website chat sessions: where the visitor came from, how the session ended, and the counters the
-- daily digest reads. All context is validated and clipped by the worker before it lands here.

ALTER TABLE chat_sessions ADD COLUMN landing_path TEXT;   -- first page of the visit (path only)
ALTER TABLE chat_sessions ADD COLUMN page_path TEXT;      -- page the visitor chatted from most recently
ALTER TABLE chat_sessions ADD COLUMN referrer TEXT;       -- host + path of the external referrer, no query
ALTER TABLE chat_sessions ADD COLUMN utm_source TEXT;
ALTER TABLE chat_sessions ADD COLUMN utm_medium TEXT;
ALTER TABLE chat_sessions ADD COLUMN utm_campaign TEXT;
ALTER TABLE chat_sessions ADD COLUMN country TEXT;        -- Cloudflare request.cf.country
-- Best outcome so far: answered < faq_fallback < handoff < lead (NULL until the first reply).
ALTER TABLE chat_sessions ADD COLUMN outcome TEXT;
ALTER TABLE chat_sessions ADD COLUMN agent_replies INTEGER NOT NULL DEFAULT 0;
ALTER TABLE chat_sessions ADD COLUMN agent_failures INTEGER NOT NULL DEFAULT 0;
ALTER TABLE chat_sessions ADD COLUMN faq_fallbacks INTEGER NOT NULL DEFAULT 0;
ALTER TABLE chat_sessions ADD COLUMN handoff_at TEXT;
ALTER TABLE chat_sessions ADD COLUMN lead_id INTEGER;

CREATE INDEX IF NOT EXISTS chat_sessions_created ON chat_sessions (created_at DESC);
