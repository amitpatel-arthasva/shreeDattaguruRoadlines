-- Initial Data Seeder
-- This script checks for missing data and inserts only what's needed

-- Check if admin user exists, if not create it
-- Password: 'admin' - hashed with bcrypt
INSERT INTO users (name, email, phonenumber, password_hash, role, created_at, updated_at)
SELECT 'Administrator', 'admin@test.com', '1234567890', '$2b$10$tONrrbnmLaoI7bnqy67Hne.LhH87vS8lRDVui3hPMT8uFYB8NPh/e', 'admin', datetime('now'), datetime('now')
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@test.com' AND role = 'admin');

-- Insert sample companies (check each one individually)
-- Company 1: ABC Transport Ltd.
INSERT INTO companies (name, address, city, state, pin_code, gstin, pan)
SELECT 'ABC Transport Ltd.', '123 Transport Nagar, Mumbai, Maharashtra - 400001', 'Mumbai', 'Maharashtra', '400001', '27ABCDE1234F1Z5', 'ABCDE1234F'
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE name = 'ABC Transport Ltd.' OR gstin = '27ABCDE1234F1Z5' OR pan = 'ABCDE1234F');

-- Company 2: XYZ Logistics Pvt. Ltd.
INSERT INTO companies (name, address, city, state, pin_code, gstin, pan)
SELECT 'XYZ Logistics Pvt. Ltd.', '456 Logistics Hub, Delhi - 110001', 'Delhi', 'Delhi', '110001', '07XYZAB1234C1Z8', 'XYZAB1234C'
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE name = 'XYZ Logistics Pvt. Ltd.' OR gstin = '07XYZAB1234C1Z8' OR pan = 'XYZAB1234C');

-- Company 3: PQR Cargo Services
INSERT INTO companies (name, address, city, state, pin_code, gstin, pan)
SELECT 'PQR Cargo Services', '789 Cargo Complex, Ahmedabad, Gujarat - 380001', 'Ahmedabad', 'Gujarat', '380001', '24PQRST1234G1Z9', 'PQRST1234G'
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE name = 'PQR Cargo Services' OR gstin = '24PQRST1234G1Z9' OR pan = 'PQRST1234G');

-- Insert sample trucks (check for duplicates by truck number or license)
-- Truck 1: MH 12 AB 1234
INSERT INTO trucks (truck_number, truck_type, capacity_ton, owner_name)
SELECT 'MH 12 AB 1234', 'Open', 10.0, 'Rajesh Kumar'
WHERE NOT EXISTS (SELECT 1 FROM trucks WHERE truck_number = 'MH 12 AB 1234');

-- Truck 2: GJ 01 AA 5678
INSERT INTO trucks (truck_number, truck_type, capacity_ton, owner_name)
SELECT 'GJ 01 AA 5678', 'Closed', 15.0, 'Nitin Desai'
WHERE NOT EXISTS (SELECT 1 FROM trucks WHERE truck_number = 'GJ 01 AA 5678');

-- Truck 3: DL 8C AA 9012
INSERT INTO trucks (truck_number, truck_type, capacity_ton, owner_name)
SELECT 'DL 8C AA 9012', 'Container', 20.0, 'Priya Sharma'
WHERE NOT EXISTS (SELECT 1 FROM trucks WHERE truck_number = 'DL 8C AA 9012');

-- Insert sample drivers (check for duplicates by name, phone, or license)
-- Driver 1: Ramesh Singh
INSERT INTO drivers (name, phone, license_number, address)
SELECT 'Ramesh Singh', '9876543210', 'DL1234567890', 'Driver Colony, Mumbai'
WHERE NOT EXISTS (SELECT 1 FROM drivers WHERE name = 'Ramesh Singh' OR phone = '9876543210' OR license_number = 'DL1234567890');

-- Driver 2: Suresh Yadav
INSERT INTO drivers (name, phone, license_number, address)
SELECT 'Suresh Yadav', '9876543211', 'GJ1234567891', 'Transport Nagar, Ahmedabad'
WHERE NOT EXISTS (SELECT 1 FROM drivers WHERE name = 'Suresh Yadav' OR phone = '9876543211' OR license_number = 'GJ1234567891');

-- Driver 3: Mahesh Kumar
INSERT INTO drivers (name, phone, license_number, address)
SELECT 'Mahesh Kumar', '9876543212', 'DL1234567892', 'Logistics Hub, Delhi'
WHERE NOT EXISTS (SELECT 1 FROM drivers WHERE name = 'Mahesh Kumar' OR phone = '9876543212' OR license_number = 'DL1234567892');

-- Insert sample lorry receipts (check for existing LR numbers and verify referenced data exists)
-- LR001: Electronics shipment Mumbai to Delhi
INSERT INTO lorry_receipts (
    lr_number, lr_date, from_location, to_location,
    consignor_id, consignee_id, truck_id, driver_id, truck_number,
    particulars, quantity, unit, freight, hamali, aoc, door_delivery,
    collection, service_charge, extra_loading, actual_weight, charged_weight,
    payment_type, service_tax_payable_by, goods_risk, invoice_number,
    challan_number, delivery_at, remarks
)
SELECT 
    'LR001', '2024-12-01', 'Mumbai', 'Delhi',
    1, 2, 1, 1, 'MH 12 AB 1234',
    'Electronics Goods', 50, 'Boxes', 15000.00, 500.00, 200.00, 300.00,
    0.00, 20.00, 0.00, 8.5, 10.0,
    'To Pay', 'Consignee', 'Owner', 'INV001',
    'CH001', 'Door Delivery', 'Handle with care - Electronics'
WHERE NOT EXISTS (SELECT 1 FROM lorry_receipts WHERE lr_number = 'LR001')
  AND EXISTS (SELECT 1 FROM companies WHERE id = 1)
  AND EXISTS (SELECT 1 FROM companies WHERE id = 2)
  AND EXISTS (SELECT 1 FROM trucks WHERE id = 1)
  AND EXISTS (SELECT 1 FROM drivers WHERE id = 1);

-- LR002: Textiles shipment Ahmedabad to Mumbai

INSERT INTO lorry_receipts (
    lr_number, lr_date, from_location, to_location,
    consignor_id, consignee_id, truck_id, driver_id, truck_number,
    particulars, quantity, unit, freight, hamali, aoc, door_delivery,
    collection, service_charge, extra_loading, actual_weight, charged_weight,
    payment_type, service_tax_payable_by, goods_risk, invoice_number,
    challan_number, delivery_at, remarks
)
SELECT 
    'LR002', '2024-12-02', 'Ahmedabad', 'Mumbai',
    3, 1, 2, 2, 'GJ 01 AA 5678',
    'Textiles', 100, 'Bags', 12000.00, 800.00, 150.00, 0.00,
    200.00, 20.00, 500.00, 12.0, 15.0,
    'Paid', 'Consignor', 'Owner', 'INV002',
    'CH002', 'Godown', 'Fragile items'
WHERE NOT EXISTS (SELECT 1 FROM lorry_receipts WHERE lr_number = 'LR002')
  AND EXISTS (SELECT 1 FROM companies WHERE id = 3)
  AND EXISTS (SELECT 1 FROM companies WHERE id = 1)
  AND EXISTS (SELECT 1 FROM trucks WHERE id = 2)
  AND EXISTS (SELECT 1 FROM drivers WHERE id = 2);

-- LR003: Automobile parts shipment Delhi to Ahmedabad

INSERT INTO lorry_receipts (
    lr_number, lr_date, from_location, to_location,
    consignor_id, consignee_id, truck_id, driver_id, truck_number,
    particulars, quantity, unit, freight, hamali, aoc, door_delivery,
    collection, service_charge, extra_loading, actual_weight, charged_weight,
    payment_type, service_tax_payable_by, goods_risk, invoice_number,
    challan_number, delivery_at, remarks
)
SELECT 
    'LR003', '2024-12-03', 'Delhi', 'Ahmedabad',
    2, 3, 3, 3, 'DL 8C AA 9012',
    'Automobile Parts', 75, 'Crates', 18000.00, 600.00, 300.00, 400.00,
    0.00, 20.00, 200.00, 16.5, 20.0,
    'To Be Bill', 'Consignor', 'Company', 'INV003',
    'CH003', 'Factory Gate', 'Heavy machinery parts'
WHERE NOT EXISTS (SELECT 1 FROM lorry_receipts WHERE lr_number = 'LR003')
  AND EXISTS (SELECT 1 FROM companies WHERE id = 2)
  AND EXISTS (SELECT 1 FROM companies WHERE id = 3)
  AND EXISTS (SELECT 1 FROM trucks WHERE id = 3)
  AND EXISTS (SELECT 1 FROM drivers WHERE id = 3);

-- LR004: Pharmaceutical products shipment Mumbai to Ahmedabad

INSERT INTO lorry_receipts (
    lr_number, lr_date, from_location, to_location,
    consignor_id, consignee_id, truck_id, driver_id, truck_number,
    particulars, quantity, unit, freight, hamali, aoc, door_delivery,
    collection, service_charge, extra_loading, actual_weight, charged_weight,
    payment_type, service_tax_payable_by, goods_risk, invoice_number,
    challan_number, delivery_at, remarks
)
SELECT 
    'LR004', '2024-12-04', 'Mumbai', 'Ahmedabad',
    1, 3, 1, 1, 'MH 12 AB 1234',
    'Pharmaceutical Products', 25, 'Boxes', 22000.00, 400.00, 250.00, 500.00,
    100.00, 20.00, 0.00, 5.2, 6.0,
    'Paid', 'Consignee', 'Owner', 'INV004',
    'CH004', 'Cold Storage', 'Temperature controlled - Keep refrigerated'
WHERE NOT EXISTS (SELECT 1 FROM lorry_receipts WHERE lr_number = 'LR004')
  AND EXISTS (SELECT 1 FROM companies WHERE id = 1)
  AND EXISTS (SELECT 1 FROM companies WHERE id = 3)
  AND EXISTS (SELECT 1 FROM trucks WHERE id = 1)
  AND EXISTS (SELECT 1 FROM drivers WHERE id = 1);

-- LR005: Food grains shipment Ahmedabad to Delhi

INSERT INTO lorry_receipts (
    lr_number, lr_date, from_location, to_location,
    consignor_id, consignee_id, truck_id, driver_id, truck_number,
    particulars, quantity, unit, freight, hamali, aoc, door_delivery,
    collection, service_charge, extra_loading, actual_weight, charged_weight,
    payment_type, service_tax_payable_by, goods_risk, invoice_number,
    challan_number, delivery_at, remarks
)
SELECT 
    'LR005', '2024-12-05', 'Ahmedabad', 'Delhi',
    3, 2, 2, 2, 'GJ 01 AA 5678',
    'Food Grains', 200, 'Bags', 8000.00, 1000.00, 100.00, 0.00,
    150.00, 20.00, 300.00, 18.0, 20.0,
    'To Pay', 'Consignor', 'Owner', 'INV005',
    'CH005', 'Warehouse', 'Bulk food grains - Handle carefully'
WHERE NOT EXISTS (SELECT 1 FROM lorry_receipts WHERE lr_number = 'LR005')
  AND EXISTS (SELECT 1 FROM companies WHERE id = 3)
  AND EXISTS (SELECT 1 FROM companies WHERE id = 2)
  AND EXISTS (SELECT 1 FROM trucks WHERE id = 2)
  AND EXISTS (SELECT 1 FROM drivers WHERE id = 2);

-- Data verification and repair script
-- This runs after the main inserts to verify all expected data is present

-- Display current data counts
-- SELECT 'DATA VERIFICATION REPORT:' as report;

-- SELECT 'Admin Users:' as category, 
--        COUNT(*) as count,
--        CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'MISSING' END as status
-- FROM users WHERE role = 'admin';

-- SELECT 'Sample Companies:' as category,
--        COUNT(*) as count,
--        CASE WHEN COUNT(*) >= 3 THEN 'OK' ELSE 'INCOMPLETE' END as status
-- FROM companies WHERE name IN ('ABC Transport Ltd.', 'XYZ Logistics Pvt. Ltd.', 'PQR Cargo Services');

-- SELECT 'Sample Trucks:' as category,
--        COUNT(*) as count,
--        CASE WHEN COUNT(*) >= 3 THEN 'OK' ELSE 'INCOMPLETE' END as status
-- FROM trucks WHERE truck_number IN ('MH 12 AB 1234', 'GJ 01 AA 5678', 'DL 8C AA 9012');

-- SELECT 'Sample Drivers:' as category,
--        COUNT(*) as count,
--        CASE WHEN COUNT(*) >= 3 THEN 'OK' ELSE 'INCOMPLETE' END as status
-- FROM drivers WHERE name IN ('Ramesh Singh', 'Suresh Yadav', 'Mahesh Kumar');

-- SELECT 'Sample Lorry Receipts:' as category,
--        COUNT(*) as count,
--        CASE WHEN COUNT(*) >= 5 THEN 'OK' ELSE 'INCOMPLETE' END as status
-- FROM lorry_receipts WHERE lr_number IN ('LR001', 'LR002', 'LR003', 'LR004', 'LR005');

-- -- Insert any missing critical admin user as fallback
-- INSERT INTO users (name, email, phonenumber, password_hash, role, created_at, updated_at)
-- SELECT 'Fallback Admin', 'admin@roadlines.com', '0000000000', '$2b$10$tONrrbnmLaoI7bnqy67Hne.LhH87vS8lRDVui3hPMT8uFYB8NPh/e', 'admin', datetime('now'), datetime('now')
-- WHERE NOT EXISTS (SELECT 1 FROM users WHERE role = 'admin');

-- -- Log seeder completion
-- SELECT 'SEEDER COMPLETED AT: ' || datetime('now') as completion_log;

/*

-- Verify admin user exists
SELECT 'Admin user check:' as verification, 
       CASE WHEN EXISTS(SELECT 1 FROM users WHERE email = 'admin@test.com' AND role = 'admin')
            THEN 'PRESENT' ELSE 'MISSING' END as status;

-- Verify companies (should be 3)
SELECT 'Companies check:' as verification,
       CASE WHEN (SELECT COUNT(*) FROM companies WHERE name IN ('ABC Transport Ltd.', 'XYZ Logistics Pvt. Ltd.', 'PQR Cargo Services')) = 3
            THEN 'ALL PRESENT (' || (SELECT COUNT(*) FROM companies) || ' total)' 
            ELSE 'MISSING - Expected 3, Found ' || (SELECT COUNT(*) FROM companies WHERE name IN ('ABC Transport Ltd.', 'XYZ Logistics Pvt. Ltd.', 'PQR Cargo Services')) END as status;

-- Verify trucks (should be 3)
SELECT 'Trucks check:' as verification,
       CASE WHEN (SELECT COUNT(*) FROM trucks WHERE truck_number IN ('MH 12 AB 1234', 'GJ 01 AA 5678', 'DL 8C AA 9012')) = 3
            THEN 'ALL PRESENT (' || (SELECT COUNT(*) FROM trucks) || ' total)'
            ELSE 'MISSING - Expected 3, Found ' || (SELECT COUNT(*) FROM trucks WHERE truck_number IN ('MH 12 AB 1234', 'GJ 01 AA 5678', 'DL 8C AA 9012')) END as status;

-- Verify drivers (should be 3)
SELECT 'Drivers check:' as verification,
       CASE WHEN (SELECT COUNT(*) FROM drivers WHERE name IN ('Ramesh Singh', 'Suresh Yadav', 'Mahesh Kumar')) = 3
            THEN 'ALL PRESENT (' || (SELECT COUNT(*) FROM drivers) || ' total)'
            ELSE 'MISSING - Expected 3, Found ' || (SELECT COUNT(*) FROM drivers WHERE name IN ('Ramesh Singh', 'Suresh Yadav', 'Mahesh Kumar')) END as status;

-- Verify lorry receipts (should be 5)
SELECT 'Lorry Receipts check:' as verification,
       CASE WHEN (SELECT COUNT(*) FROM lorry_receipts WHERE lr_number IN ('LR001', 'LR002', 'LR003', 'LR004', 'LR005')) = 5
            THEN 'ALL PRESENT (' || (SELECT COUNT(*) FROM lorry_receipts) || ' total)'
            ELSE 'MISSING - Expected 5, Found ' || (SELECT COUNT(*) FROM lorry_receipts WHERE lr_number IN ('LR001', 'LR002', 'LR003', 'LR004', 'LR005')) END as status;

-- Overall summary
SELECT 'SEEDER SUMMARY:' as verification, 
       'Users: ' || (SELECT COUNT(*) FROM users) || 
       ', Companies: ' || (SELECT COUNT(*) FROM companies) ||
       ', Trucks: ' || (SELECT COUNT(*) FROM trucks) ||
       ', Drivers: ' || (SELECT COUNT(*) FROM drivers) ||
       ', Lorry Receipts: ' || (SELECT COUNT(*) FROM lorry_receipts) as status;
*/
