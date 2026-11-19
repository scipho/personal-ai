-- Projects: one folder (files) + one permanent conversation per project.
-- Idempotent; the Worker applies it automatically on first request.

CREATE TABLE IF NOT EXISTS projects (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  instructions TEXT NOT NULL DEFAULT '',
  settings     TEXT NOT NULL DEFAULT '{}',
  summary      TEXT NOT NULL DEFAULT '',
  summary_upto INTEGER NOT NULL DEFAULT 0,
  rev          INTEGER NOT NULL DEFAULT 0,
  epoch        INTEGER NOT NULL DEFAULT 0,
  created_at   INTEGER NOT NULL,
  updated_at   INTEGER NOT NULL
);

-- One row per message; paged by id. meta holds tool steps/sources (JSON).
CREATE TABLE IF NOT EXISTS project_messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id TEXT NOT NULL,
  role       TEXT NOT NULL,
  content    TEXT NOT NULL,
  meta       TEXT NOT NULL DEFAULT '{}',
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_project_messages ON project_messages (project_id, id);

-- Project folder tree. Text only (max 1 MB per file). Directories are
-- explicit rows (is_dir = 1); seq is the project rev of the last change.
CREATE TABLE IF NOT EXISTS files (
  project_id TEXT NOT NULL,
  path       TEXT NOT NULL,
  content    TEXT NOT NULL DEFAULT '',
  is_dir     INTEGER NOT NULL DEFAULT 0,
  size       INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL,
  seq        INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (project_id, path)
);

INSERT OR REPLACE INTO schema_meta (k, v) VALUES ('version', '3');
