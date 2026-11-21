-- Skills and remote MCP servers. Idempotent; auto-applied by the Worker.

CREATE TABLE IF NOT EXISTS skills (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  description   TEXT NOT NULL DEFAULT '',
  instructions  TEXT NOT NULL DEFAULT '',
  allowed_tools TEXT NOT NULL DEFAULT '[]',
  files         TEXT NOT NULL DEFAULT '[]',
  enabled       INTEGER NOT NULL DEFAULT 1,
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);

-- Remote MCP servers (Streamable HTTP only). The auth token lives encrypted
-- in secrets as mcp:<id>. `tools` is the cached tools/list result, refreshed
-- only by "測試連線"; chats never re-list.
CREATE TABLE IF NOT EXISTS mcp_servers (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL UNIQUE,
  url              TEXT NOT NULL,
  auth_type        TEXT NOT NULL DEFAULT 'none',
  header_name      TEXT NOT NULL DEFAULT '',
  tools            TEXT NOT NULL DEFAULT '[]',
  disabled_tools   TEXT NOT NULL DEFAULT '[]',
  session_id       TEXT NOT NULL DEFAULT '',
  protocol_version TEXT NOT NULL DEFAULT '',
  enabled          INTEGER NOT NULL DEFAULT 1,
  last_tested_at   INTEGER NOT NULL DEFAULT 0,
  last_error       TEXT NOT NULL DEFAULT '',
  created_at       INTEGER NOT NULL,
  updated_at       INTEGER NOT NULL
);

INSERT OR REPLACE INTO schema_meta (k, v) VALUES ('version', '4');
