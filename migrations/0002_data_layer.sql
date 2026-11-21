-- Personal AI v2 data layer. D1 is the single source of truth for settings,
-- encrypted secrets, providers and memory.
--
-- Every statement is idempotent: the Worker applies the same statements on
-- its first request (src/schema.js), so running this file before or after a
-- deploy is safe.

CREATE TABLE IF NOT EXISTS schema_meta (
  k TEXT PRIMARY KEY,
  v TEXT NOT NULL
);

-- Sync storage paged by a server-assigned sequence instead of the client's
-- clock (devices with skewed clocks used to skip each other's items).
CREATE TABLE IF NOT EXISTS sync_items_v2 (
  owner_id   TEXT    NOT NULL DEFAULT 'owner',
  item_key   TEXT    NOT NULL,
  value      TEXT,
  updated_at INTEGER NOT NULL,
  deleted    INTEGER NOT NULL DEFAULT 0,
  seq        INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (owner_id, item_key)
);
CREATE INDEX IF NOT EXISTS idx_sync_items_v2_seq ON sync_items_v2 (owner_id, seq);
CREATE TABLE IF NOT EXISTS sync_items (
  owner_id   TEXT    NOT NULL DEFAULT 'owner',
  item_key   TEXT    NOT NULL,
  value      TEXT,
  updated_at INTEGER NOT NULL,
  deleted    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (owner_id, item_key)
);
INSERT OR IGNORE INTO sync_items_v2 (owner_id, item_key, value, updated_at, deleted, seq)
  SELECT owner_id, item_key, value, updated_at, deleted, rowid FROM sync_items;

-- Global settings (JSON values). Secrets never go here.
CREATE TABLE IF NOT EXISTS settings (
  k          TEXT PRIMARY KEY,
  v          TEXT NOT NULL,
  updated_at INTEGER NOT NULL
);

-- AES-GCM sealed secrets (key derived from AUTH_SECRET). `preview` is a
-- masked hint such as "sk-…1e24" that is safe to show in the UI.
CREATE TABLE IF NOT EXISTS secrets (
  name       TEXT PRIMARY KEY,
  sealed     TEXT NOT NULL,
  preview    TEXT NOT NULL DEFAULT '',
  updated_at INTEGER NOT NULL
);

-- OpenAI-compatible providers. The API key lives in secrets as provider:<id>.
CREATE TABLE IF NOT EXISTS providers (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  base_url      TEXT NOT NULL,
  default_model TEXT NOT NULL DEFAULT '',
  models        TEXT NOT NULL DEFAULT '[]',
  sort          INTEGER NOT NULL DEFAULT 0,
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);

-- Long-term memory. scope = 'global' or a project id.
CREATE TABLE IF NOT EXISTS memories (
  id         TEXT PRIMARY KEY,
  scope      TEXT NOT NULL DEFAULT 'global',
  content    TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_memories_scope ON memories (scope, updated_at);

INSERT OR REPLACE INTO schema_meta (k, v) VALUES ('version', '2');
