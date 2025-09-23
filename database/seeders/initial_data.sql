-- Initial Data Seeder
-- This script checks for missing data and inserts only what's needed

-- Check if admin user exists, if not create it
-- Password: 'admin' - hashed with bcrypt
INSERT INTO users (name, email, phonenumber, password_hash, role, created_at, updated_at)
SELECT 'Administrator', 'admin@test.com', '1234567890', '$2b$10$tONrrbnmLaoI7bnqy67Hne.LhH87vS8lRDVui3hPMT8uFYB8NPh/e', 'admin', datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@test.com' AND role = 'admin');

-- Insert sample companies
INSERT INTO companies (name, address, city, state, pin_code, gstin, pan)
SELECT 'ABC Industries Ltd.', '123 Industrial Area, Phase 1', 'Mumbai', 'Maharashtra', '400001', '27ABCIN1234F1Z5', 'ABCIN1234F'
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE name = 'ABC Industries Ltd.');

INSERT INTO companies (name, address, city, state, pin_code, gstin, pan)
SELECT 'XYZ Manufacturing Pvt. Ltd.', '456 Manufacturing Hub, Sector 10', 'Delhi', 'Delhi', '110001', '07XYZMA1234C1Z8', 'XYZMA1234C'
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE name = 'XYZ Manufacturing Pvt. Ltd.');

INSERT INTO companies (name, address, city, state, pin_code, gstin, pan)
SELECT 'PQR Traders', '789 Trade Center, Main Road', 'Ahmedabad', 'Gujarat', '380001', '24PQRTR1234G1Z9', 'PQRTR1234G'
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE name = 'PQR Traders');

INSERT INTO companies (name, address, city, state, pin_code, gstin, pan)
SELECT 'LMN Enterprises', '321 Business Park', 'Pune', 'Maharashtra', '411001', '27LMNEN1234H1Z7', 'LMNEN1234H'
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE name = 'LMN Enterprises');

INSERT INTO companies (name, address, city, state, pin_code, gstin, pan)
SELECT 'RST Corporation', '654 Corporate Plaza', 'Bangalore', 'Karnataka', '560001', '29RSTCO1234K1Z3', 'RSTCO1234K'
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE name = 'RST Corporation');

INSERT INTO companies (name, address, city, state, pin_code, gstin, pan)
SELECT 'Global Textiles Inc.', '987 Textile Zone', 'Surat', 'Gujarat', '395001', '24GLTEX1234M1Z1', 'GLTEX1234M'
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE name = 'Global Textiles Inc.');

-- Insert sample trucks
INSERT INTO trucks (truck_number, truck_type, capacity_ton, owner_name)
SELECT 'MH 12 AB 1234', 'Open', 10.0, 'Rajesh Kumar'
WHERE NOT EXISTS (SELECT 1 FROM trucks WHERE truck_number = 'MH 12 AB 1234');

INSERT INTO trucks (truck_number, truck_type, capacity_ton, owner_name)
SELECT 'GJ 01 AA 5678', 'Closed', 15.0, 'Nitin Desai'
WHERE NOT EXISTS (SELECT 1 FROM trucks WHERE truck_number = 'GJ 01 AA 5678');

INSERT INTO trucks (truck_number, truck_type, capacity_ton, owner_name)
SELECT 'DL 82 AA 9012', 'Container', 20.0, 'Priya Sharma'
WHERE NOT EXISTS (SELECT 1 FROM trucks WHERE truck_number = 'DL 8C AA 9012');

INSERT INTO trucks (truck_number, truck_type, capacity_ton, owner_name)
SELECT 'KA 05 BC 3456', 'Open', 12.0, 'Suresh Reddy'
WHERE NOT EXISTS (SELECT 1 FROM trucks WHERE truck_number = 'KA 05 BC 3456');

-- Insert sample drivers
INSERT INTO drivers (name, phone, license_number, address)
SELECT 'Ramesh Singh', '9876543210', 'DL1234567890', 'Driver Colony, Mumbai'
WHERE NOT EXISTS (SELECT 1 FROM drivers WHERE phone = '9876543210');

INSERT INTO drivers (name, phone, license_number, address)
SELECT 'Suresh Yadav', '9876543211', 'GJ1234567891', 'Transport Nagar, Ahmedabad'
WHERE NOT EXISTS (SELECT 1 FROM drivers WHERE phone = '9876543211');

INSERT INTO drivers (name, phone, license_number, address)
SELECT 'Jeet Bari', '9876543212', 'MH1234567892', 'Patel Wadi, Pune'
WHERE NOT EXISTS (SELECT 1 FROM drivers WHERE phone = '9876543212');

INSERT INTO drivers (name, phone, license_number, address)
SELECT 'Kumar Swamy', '9876543213', 'KA1234567893', 'Whitefield, Bangalore'
WHERE NOT EXISTS (SELECT 1 FROM drivers WHERE phone = '9876543213');

-- Insert sample lorry receipts (check for existing CN numbers and verify referenced data exists)
-- TPR-001: Electronics shipment from Tarapur to Mumbai


/*
-- Verify admin user exists
SELECT 'Admin user check:' as verification, 
     CASE WHEN EXISTS(SELECT 1 FROM users WHERE email = 'admin@test.com' AND role = 'admin')
      THEN 'PRESENT' ELSE 'MISSING' END as status;

-- Verify companies (should be 6)
SELECT 'Companies check:' as verification,
     CASE WHEN (SELECT COUNT(*) FROM companies) >= 6
      THEN 'ALL PRESENT (' || (SELECT COUNT(*) FROM companies) || ' total)' 
      ELSE 'MISSING - Found ' || (SELECT COUNT(*) FROM companies) END as status;

-- Verify trucks (should be 4)
SELECT 'Trucks check:' as verification,
     CASE WHEN (SELECT COUNT(*) FROM trucks) >= 4
      THEN 'ALL PRESENT (' || (SELECT COUNT(*) FROM trucks) || ' total)'
      ELSE 'MISSING - Found ' || (SELECT COUNT(*) FROM trucks) END as status;

-- Verify drivers (should be 4)
SELECT 'Drivers check:' as verification,
     CASE WHEN (SELECT COUNT(*) FROM drivers) >= 4
      THEN 'ALL PRESENT (' || (SELECT COUNT(*) FROM drivers) || ' total)'
      ELSE 'MISSING - Found ' || (SELECT COUNT(*) FROM drivers) END as status;

-- Verify lorry receipts (should be 6)
SELECT 'Lorry Receipts check:' as verification,
     CASE WHEN (SELECT COUNT(*) FROM lorry_receipts WHERE cn_number IN ('TPR-001', 'BWD-001', 'TPR-002', 'BWD-002', 'TPR-003')) >= 5
      THEN 'ALL PRESENT (' || (SELECT COUNT(*) FROM lorry_receipts) || ' total)'
      ELSE 'MISSING - Expected 5+, Found ' || (SELECT COUNT(*) FROM lorry_receipts WHERE cn_number IN ('TPR-001', 'BWD-001', 'TPR-002', 'BWD-002', 'TPR-003')) END as status;

-- Verify quotations (should be 6)
SELECT 'Quotations check:' as verification,
     CASE WHEN (SELECT COUNT(*) FROM quotations WHERE quotation_number IN ('QUO-2024001', 'QUO-2024002', 'QUO-2024003', 'QUO-2024004', 'QUO-2024005', 'QUO-2024006')) >= 6
      THEN 'ALL PRESENT (' || (SELECT COUNT(*) FROM quotations) || ' total)'
      ELSE 'MISSING - Expected 6+, Found ' || (SELECT COUNT(*) FROM quotations WHERE quotation_number IN ('QUO-2024001', 'QUO-2024002', 'QUO-2024003', 'QUO-2024004', 'QUO-2024005', 'QUO-2024006')) END as status;

-- Verify memos (should be 5)
SELECT 'Memos check:' as verification,
     CASE WHEN (SELECT COUNT(*) FROM memos WHERE memo_number IN ('MEMO-202501-0001', 'MEMO-202501-0002', 'MEMO-202501-0003', 'MEMO-202501-0004', 'MEMO-202501-0005')) >= 5
      THEN 'ALL PRESENT (' || (SELECT COUNT(*) FROM memos) || ' total)'
      ELSE 'MISSING - Expected 5+, Found ' || (SELECT COUNT(*) FROM memos WHERE memo_number IN ('MEMO-202501-0001', 'MEMO-202501-0002', 'MEMO-202501-0003', 'MEMO-202501-0004', 'MEMO-202501-0005')) END as status;

-- Overall summary
SELECT 'SEEDER SUMMARY:' as verification, 
     'Users: ' || (SELECT COUNT(*) FROM users) || 
     ', Companies: ' || (SELECT COUNT(*) FROM companies) ||
     ', Trucks: ' || (SELECT COUNT(*) FROM trucks) ||
     ', Drivers: ' || (SELECT COUNT(*) FROM drivers) ||
     ', Lorry Receipts: ' || (SELECT COUNT(*) FROM lorry_receipts) ||
     ', Quotations: ' || (SELECT COUNT(*) FROM quotations) ||
     ', Memos: ' || (SELECT COUNT(*) FROM memos) as status;
*/
