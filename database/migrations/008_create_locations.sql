-- Create locations table
-- This table stores location names used in lorry receipts for to_location and from_location

CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index on name for better query performance
CREATE INDEX IF NOT EXISTS idx_locations_name ON locations(name);