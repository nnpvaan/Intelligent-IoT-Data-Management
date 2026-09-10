-- ============================================================
-- Migration: 001_add_soft_delete.sql
-- Purpose: Add soft-delete support to datasets table
-- Allows 15-day recovery period and name reuse after deletion
-- ============================================================

-- Step 1: Add soft-delete columns to datasets table
ALTER TABLE datasets
    ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL,
    ADD COLUMN deleted_by TEXT DEFAULT NULL;

-- Step 2: Drop the old UNIQUE constraint on name
ALTER TABLE datasets DROP CONSTRAINT datasets_name_key;

-- Step 3: Create new unique index on name for ACTIVE datasets only
CREATE UNIQUE INDEX idx_datasets_name_active
    ON datasets (name)
    WHERE deleted_at IS NULL;

-- Step 4: Create index on deleted_at for efficient queries
CREATE INDEX idx_datasets_deleted_at
    ON datasets (deleted_at);
