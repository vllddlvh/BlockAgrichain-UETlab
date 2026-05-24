-- Migration for existing local databases after enabling blockchain anchor proofs.
-- Run this once against the PostgreSQL database configured in application.yaml.

ALTER TABLE batches
    ADD COLUMN IF NOT EXISTS blockchain_tx_hash VARCHAR(255),
    ADD COLUMN IF NOT EXISTS blockchain_data_hash VARCHAR(255),
    ADD COLUMN IF NOT EXISTS blockchain_anchored_at TIMESTAMP;

ALTER TABLE batches
    DROP COLUMN IF EXISTS onchain_hash;

ALTER TABLE batch_events
    DROP COLUMN IF EXISTS onchain_event_hash;
