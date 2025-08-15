CREATE TABLE IF NOT EXISTS lorry_receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- LR Details
    cn_number TEXT NOT NULL UNIQUE,
    truck_number TEXT, -- Only one column for lorry/truck number
    lr_date DATE NOT NULL,
    to_location TEXT NOT NULL,
    from_location TEXT NOT NULL,
    
    -- Company References
    company_id INTEGER,
    consignor_id INTEGER NOT NULL,
    consignee_id INTEGER NOT NULL,
    
    -- Vehicle & Driver
    truck_id INTEGER,
    driver_id INTEGER,
    
    -- Particulars (stored as JSON arrays)
    nos TEXT,                   -- JSON array of nos entries
    particulars TEXT,           -- JSON array of particulars entries
    
    -- Charges
    freight REAL DEFAULT 0,
    hamali REAL DEFAULT 0,
    aoc REAL DEFAULT 0,
    door_delivery REAL DEFAULT 0,
    collection REAL DEFAULT 0,
    st_charge REAL DEFAULT 0,
    extra_loading REAL DEFAULT 0,
    
    -- Weight Info
    actual_weight REAL,
    chargeable_weight REAL,
    -- Payment
    payment_type TEXT DEFAULT 'paid' CHECK (payment_type IN ('paid', 'toBeBill', 'toPay')),
    
    -- Other Details
    delivery_at TEXT,
    eway_bill TEXT,
    total REAL DEFAULT 0,
    remarks TEXT,
    
    -- Audit
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Keys
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (consignor_id) REFERENCES companies(id),
    FOREIGN KEY (consignee_id) REFERENCES companies(id),
    FOREIGN KEY (truck_id) REFERENCES trucks(id),
    FOREIGN KEY (driver_id) REFERENCES drivers(id)
);


CREATE TRIGGER IF NOT EXISTS update_lorry_receipts_timestamp 
AFTER UPDATE ON lorry_receipts
FOR EACH ROW
BEGIN
    UPDATE lorry_receipts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
