-- Dataset Soft Delete Schema
-- Apply after 001_auth.sql and 002_dataset_management.sql.

ALTER TABLE datasets
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS recovery_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID;

CREATE INDEX IF NOT EXISTS idx_datasets_deleted_at
  ON datasets(deleted_at);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    WHERE c.conname = 'fk_datasets_deleted_by' AND t.relname = 'datasets'
  ) THEN
    ALTER TABLE datasets
      ADD CONSTRAINT fk_datasets_deleted_by
      FOREIGN KEY (deleted_by)
      REFERENCES auth_users(id)
      ON DELETE RESTRICT;
  END IF;
END $$;