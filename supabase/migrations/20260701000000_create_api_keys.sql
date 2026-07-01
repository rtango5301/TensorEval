-- Migration: API keys + SDK trace ingestion
-- Adds: api_keys table, sdk_traces table, relaxes evaluation_runs/results
--       NOT NULL constraints so SDK-ingested runs (no dataset) can be stored.
-- Date: 2026-07-01

-- ===========================================================================
-- 1. api_keys — SDK authentication tokens (SHA-256 hashed, never stored raw)
-- ===========================================================================

CREATE TABLE api_keys (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name         VARCHAR(255) NOT NULL,
    key_prefix   VARCHAR(10) NOT NULL,       -- first 8 chars, shown in UI
    key_hash     TEXT NOT NULL UNIQUE,        -- SHA-256 hex digest
    last_used_at TIMESTAMPTZ,
    expires_at   TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at   TIMESTAMPTZ
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own API keys"
    ON api_keys FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users insert own API keys"
    ON api_keys FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own API keys"
    ON api_keys FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users delete own API keys"
    ON api_keys FOR DELETE
    USING (user_id = auth.uid());

-- ===========================================================================
-- 2. sdk_traces — observability trace batches pushed by the Python SDK
-- ===========================================================================

CREATE TABLE sdk_traces (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name        VARCHAR(255) NOT NULL DEFAULT 'sdk-trace',
    events      JSONB NOT NULL DEFAULT '[]',
    event_count INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sdk_traces_user_id ON sdk_traces(user_id);
CREATE INDEX idx_sdk_traces_created_at ON sdk_traces(created_at DESC);

ALTER TABLE sdk_traces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own SDK traces"
    ON sdk_traces FOR SELECT
    USING (user_id = auth.uid());

-- ===========================================================================
-- 3. Relax evaluation_runs NOT NULL constraints for SDK-ingested runs
--    SDK runs have no dataset and may not supply a name/config.
-- ===========================================================================

ALTER TABLE evaluation_runs ALTER COLUMN name DROP NOT NULL;
ALTER TABLE evaluation_runs ALTER COLUMN dataset_id DROP NOT NULL;
ALTER TABLE evaluation_runs ALTER COLUMN config DROP NOT NULL;
ALTER TABLE evaluation_runs ALTER COLUMN config SET DEFAULT '{}';

-- ===========================================================================
-- 4. Relax evaluation_results NOT NULL for SDK-ingested rows
--    SDK rows may not have a reference_answer or rubric.
-- ===========================================================================

ALTER TABLE evaluation_results ALTER COLUMN reference_answer DROP NOT NULL;
ALTER TABLE evaluation_results ALTER COLUMN reference_answer SET DEFAULT '';
ALTER TABLE evaluation_results ALTER COLUMN rubric SET DEFAULT '[]';
