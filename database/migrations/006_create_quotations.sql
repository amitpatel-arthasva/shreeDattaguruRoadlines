
CREATE TABLE IF NOT EXISTS quotations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quotation_number TEXT NOT NULL, -- ref
    quotation_date TEXT NOT NULL,   -- date
    company_id INTEGER NOT NULL,    -- company name (FK)
    q_company_name TEXT NOT NULL,
    company_location TEXT NOT NULL,
    to_user TEXT NOT NULL,          -- kind atten
    destinations_json TEXT NOT NULL, -- destinations and freight together as JSON
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (company_id) REFERENCES companies(id)
);