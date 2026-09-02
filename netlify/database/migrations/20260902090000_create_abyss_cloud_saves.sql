CREATE TABLE IF NOT EXISTS abyss_cloud_saves (
  code_hash CHAR(64) PRIMARY KEY,
  payload JSONB NOT NULL,
  revision BIGINT NOT NULL CHECK (revision > 0),
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS abyss_cloud_save_history (
  code_hash CHAR(64) NOT NULL REFERENCES abyss_cloud_saves(code_hash) ON DELETE CASCADE,
  revision BIGINT NOT NULL CHECK (revision > 0),
  payload JSONB NOT NULL,
  saved_at BIGINT NOT NULL,
  PRIMARY KEY (code_hash, revision)
);

CREATE INDEX IF NOT EXISTS abyss_cloud_save_history_recent
  ON abyss_cloud_save_history (code_hash, revision DESC);
