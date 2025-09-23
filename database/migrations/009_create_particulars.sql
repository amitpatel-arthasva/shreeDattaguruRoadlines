-- Create particulars table
-- This table stores particular types/items used in lorry receipts

CREATE TABLE IF NOT EXISTS particulars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index on name for better query performance
CREATE INDEX IF NOT EXISTS idx_particulars_name ON particulars(name);