CREATE TABLE IF NOT EXISTS lorry_receipts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- LR Details
    lr_number TEXT NOT NULL UNIQUE,
    lr_date DATE NOT NULL,
    from_location TEXT NOT NULL,
    to_location TEXT NOT NULL,
    
    -- Parties
    consignor_id INTEGER NOT NULL,
    consignee_id INTEGER NOT NULL,
    
    -- Vehicle & Driver
    truck_id INTEGER,
    driver_id INTEGER,
    truck_number TEXT,
    
    -- Particulars
    particulars TEXT,           -- e.g. "Diammonium Phosphate, MPK"
    quantity INTEGER,           -- Total number of bags/packages/etc.
    unit TEXT DEFAULT 'Bags',   -- e.g., Bags, Kg, Nos
    
    -- Charges
    freight REAL,
    hamali REAL,
    aoc REAL,
    door_delivery REAL,
    collection REAL,
    service_charge REAL DEFAULT 20,
    extra_loading REAL,
    
    -- Weight Info
    actual_weight REAL,
    charged_weight REAL,
    
    -- Payment
    payment_type TEXT CHECK (payment_type IN ('Paid', 'To Be Bill', 'To Pay')),
    service_tax_payable_by TEXT CHECK (service_tax_payable_by IN ('Consignor', 'Consignee')),
    
    -- Risk & Docs
    goods_risk TEXT DEFAULT 'Owner',
    invoice_number TEXT,
    challan_number TEXT,
    
    -- Other
    delivery_at TEXT,
    remarks TEXT,
    
    -- Audit
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Foreign Keys
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
