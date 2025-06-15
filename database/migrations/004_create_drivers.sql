-- Create drivers table
CREATE TABLE IF NOT EXISTS drivers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    license_number TEXT,       -- Optional
    address TEXT,              -- Optional
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_drivers_timestamp
    AFTER UPDATE ON drivers
    FOR EACH ROW
BEGIN
    UPDATE drivers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
