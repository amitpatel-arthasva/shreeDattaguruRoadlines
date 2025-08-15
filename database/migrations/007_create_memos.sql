-- Create memos table
CREATE TABLE IF NOT EXISTS memos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    memo_number VARCHAR(50) UNIQUE NOT NULL,
    memo_date DATE NOT NULL,
    lorry_no TEXT,
    driver_name TEXT,
    ac_no TEXT,
    address TEXT,
    from_location TEXT,
    to_location TEXT,
    lorry_hire REAL DEFAULT 0,
    advance REAL DEFAULT 0,
    hamali REAL DEFAULT 0,
    balance REAL DEFAULT 0,
    payable_at TEXT,
    broker TEXT,
    table_data TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_memos_memo_number ON memos(memo_number);
CREATE INDEX IF NOT EXISTS idx_memos_memo_date ON memos(memo_date);
-- Removed indexes for company_id, status, priority, memo_type (columns do not exist)
CREATE INDEX IF NOT EXISTS idx_memos_created_at ON memos(created_at);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_memos_timestamp 
    AFTER UPDATE ON memos
    FOR EACH ROW
BEGIN
    UPDATE memos SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
