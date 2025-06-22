CREATE TABLE IF NOT EXISTS quotations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Quotation Details
    quotation_number TEXT NOT NULL UNIQUE,
    quotation_date DATE NOT NULL,
    
    -- Company Reference
    company_id INTEGER NOT NULL,
    
    -- Trip Details
    from_location TEXT NOT NULL,
    to_location TEXT NOT NULL,
    load_type TEXT DEFAULT 'Full Load' CHECK (load_type IN ('Full Load', 'Part Load')),
    trip_type TEXT DEFAULT 'One Way' CHECK (trip_type IN ('One Way', 'Round Trip')),
    
    -- Material Details (stored as JSON array)
    material_details TEXT,  -- JSON array of material objects
    
    -- Freight Details
    rate_per_ton REAL DEFAULT 0,
    rate_type TEXT DEFAULT 'Per Ton' CHECK (rate_type IN ('Per Ton', 'Per Trip', 'Per KM')),
    applicable_gst TEXT DEFAULT '18%',
    total_freight_with_gst REAL DEFAULT 0,
    
    -- Payment Terms
    pay_by TEXT DEFAULT 'Consignee' CHECK (pay_by IN ('Consignor', 'Consignee')),
    driver_cash_required REAL DEFAULT 0,
    payment_remark TEXT,
    
    -- Quotation Validity
    validity_days INTEGER DEFAULT 30,
    expiry_date DATE,
    
    -- Demurrage Details
    demurrage_rate_per_day REAL DEFAULT 0,
    demurrage_remark TEXT,
    
    -- Terms and Conditions
    terms_conditions TEXT,
    
    -- Status
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Expired', 'Accepted', 'Rejected')),
    
    -- Audit
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER,
    
    -- Foreign Keys
    FOREIGN KEY (company_id) REFERENCES companies(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create trigger to update timestamp
CREATE TRIGGER IF NOT EXISTS update_quotations_timestamp 
AFTER UPDATE ON quotations
FOR EACH ROW
BEGIN
    UPDATE quotations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_quotations_company_id ON quotations(company_id);
CREATE INDEX IF NOT EXISTS idx_quotations_date ON quotations(quotation_date);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_number ON quotations(quotation_number); 