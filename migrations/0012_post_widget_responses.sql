-- Reader answers to the Poll, Quiz and Survey post widgets. One row per (post, widget, voter).
-- `voter` is HMAC-SHA256(salt, post id + a random first-party cookie id): it stops double votes
-- but cannot be turned back into the cookie, and differs per post so answers cannot be linked
-- across posts. No IP address, user agent or other personal data is stored.

CREATE TABLE IF NOT EXISTS widget_responses (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id     TEXT NOT NULL REFERENCES pages (id) ON DELETE CASCADE,
  widget_id   TEXT NOT NULL,                     -- the block id in the post's `blocks`
  widget_type TEXT NOT NULL CHECK (widget_type IN ('Poll', 'Quiz', 'Survey')),
  voter       TEXT NOT NULL,
  choice      TEXT,                              -- Poll/Quiz: the chosen option id
  answers     TEXT,                              -- Survey: JSON { question id: option id | option ids | text }
  created_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at  TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  UNIQUE (post_id, widget_id, voter)
);
CREATE INDEX IF NOT EXISTS widget_responses_tally ON widget_responses (post_id, widget_id, widget_type, choice);
-- A reader's own answers on a post (results endpoint), without scanning every vote on the post.
CREATE INDEX IF NOT EXISTS widget_responses_voter ON widget_responses (post_id, voter);

-- Server-side random values the worker creates on first use (the voter-hash salt), so no extra
-- secret has to be provisioned per environment.
CREATE TABLE IF NOT EXISTS widget_secrets (
  name       TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
