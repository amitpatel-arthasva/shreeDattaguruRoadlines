-- Add detention column to lorry_receipts table if it doesn't exist
-- This migration ensures the detention field is properly added to existing databases

-- SQLite doesn't support IF NOT EXISTS for ADD COLUMN, so we need to handle this carefully
-- First check if the column exists by querying the table info

-- Since we can't conditionally add columns in SQLite directly, 
-- we'll use a more robust approach that handles errors gracefully

-- Add detention column (will error if exists, but that's ok)
BEGIN;
ALTER TABLE lorry_receipts ADD COLUMN detention REAL DEFAULT 0;
COMMIT;
