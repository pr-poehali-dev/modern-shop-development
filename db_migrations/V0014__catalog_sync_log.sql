CREATE TABLE IF NOT EXISTS catalog_sync_log (
    id SERIAL PRIMARY KEY,
    started_at TIMESTAMP NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMP NULL,
    trigger_type VARCHAR(20) NOT NULL DEFAULT 'manual', -- 'manual' | 'auto'
    status VARCHAR(20) NULL, -- 'ok' | 'error' | 'running'
    synced_count INTEGER NULL,
    error_text TEXT NULL
);