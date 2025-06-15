-- Create trucks table
CREATE TABLE IF NOT EXISTS trucks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    truck_number TEXT NOT NULL UNIQUE,
    truck_type TEXT,           -- e.g., 'Open', 'Closed', 'Container', etc.
    capacity_ton REAL,         -- Optional: for tracking tonnage
    owner_name TEXT,           -- Optional: if you want to record who owns it
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_trucks_timestamp
    AFTER UPDATE ON trucks
    FOR EACH ROW
BEGIN
    UPDATE trucks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
