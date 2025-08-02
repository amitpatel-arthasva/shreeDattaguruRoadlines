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
INSERT INTO lorry_receipts (
	cn_number, lr_date, from_location, to_location,
	consignor_id, consignee_id, truck_id, driver_id, truck_number,
	nos, particulars, freight, hamali, aoc, door_delivery,
	collection, st_charge, extra_loading, actual_weight, chargeable_weight,
	payment_type, delivery_at, total, remarks
)
SELECT 
	'TPR-001', '2024-12-01', 'Tarapur', 'Mumbai',
	1, 2, 1, 1, 'MH 12 AB 1234',
	'["50", "25"]', '["Cotton Bales", "Textile Materials"]', 
	15000.00, 500.00, 200.00, 300.00,
	100.00, 750.00, 0.00, 2.5, 2.5,
	'paid', 'Mumbai Warehouse', 16850.00, 'Handle with care'
WHERE NOT EXISTS (SELECT 1 FROM lorry_receipts WHERE cn_number = 'TPR-001')
  AND EXISTS (SELECT 1 FROM companies WHERE id = 1)
  AND EXISTS (SELECT 1 FROM companies WHERE id = 2)
  AND EXISTS (SELECT 1 FROM trucks WHERE id = 1)
  AND EXISTS (SELECT 1 FROM drivers WHERE id = 1);

-- BWD-001: Textiles shipment from Bhiwandi to Bangalore
INSERT INTO lorry_receipts (
	cn_number, lr_date, from_location, to_location,
	consignor_id, consignee_id, truck_id, driver_id, truck_number,
	nos, particulars, freight, hamali, aoc, door_delivery,
	collection, st_charge, extra_loading, actual_weight, chargeable_weight,
	payment_type, delivery_at, total, remarks
)
SELECT 
	'BWD-001', '2024-12-02', 'Bhiwandi', 'Bangalore',
	3, 5, 2, 2, 'GJ 01 AA 5678',
	'["100"]', '["Electronic Components"]', 
	12000.00, 400.00, 150.00, 250.00,
	0.00, 600.00, 200.00, 1.8, 2.0,
	'toBeBill', 'RST Warehouse', 13600.00, 'Fragile items'
WHERE NOT EXISTS (SELECT 1 FROM lorry_receipts WHERE cn_number = 'BWD-001')
  AND EXISTS (SELECT 1 FROM companies WHERE id = 3)
  AND EXISTS (SELECT 1 FROM companies WHERE id = 5)
  AND EXISTS (SELECT 1 FROM trucks WHERE id = 2)
  AND EXISTS (SELECT 1 FROM drivers WHERE id = 2);

-- TPR-002: Raw materials shipment from Tarapur to Surat
INSERT INTO lorry_receipts (
	cn_number, lr_date, from_location, to_location,
	consignor_id, consignee_id, truck_id, driver_id, truck_number,
	nos, particulars, freight, hamali, aoc, door_delivery,
	collection, st_charge, extra_loading, actual_weight, chargeable_weight,
	payment_type, delivery_at, total, remarks
)
SELECT 
	'TPR-002', '2024-12-03', 'Tarapur', 'Surat',
	4, 6, 3, 3, 'DL 8C AA 9012',
	'["75", "25", "10"]', '["Raw Materials", "Chemicals", "Dyes"]', 
	18000.00, 600.00, 300.00, 400.00,
	150.00, 900.00, 500.00, 3.2, 3.5,
	'toPay', 'Global Textiles Factory', 20950.00, 'Chemical items - handle carefully'
WHERE NOT EXISTS (SELECT 1 FROM lorry_receipts WHERE cn_number = 'TPR-002')
  AND EXISTS (SELECT 1 FROM companies WHERE id = 4)
  AND EXISTS (SELECT 1 FROM companies WHERE id = 6)
  AND EXISTS (SELECT 1 FROM trucks WHERE id = 3)
  AND EXISTS (SELECT 1 FROM drivers WHERE id = 3);

-- BWD-002: High-value electronics from Bhiwandi to Chennai
INSERT INTO lorry_receipts (
	cn_number, lr_date, from_location, to_location,
	consignor_id, consignee_id, truck_id, driver_id, truck_number,
	nos, particulars, freight, hamali, aoc, door_delivery,
	collection, st_charge, extra_loading, actual_weight, chargeable_weight,
	payment_type, delivery_at, total, remarks
)
SELECT 
	'BWD-002', '2024-12-04', 'Bhiwandi', 'Delhi',
	1, 2, 4, 4, 'KA 05 BC 3456',
	'["20", "15"]', '["Servers", "Networking Equipment"]', 
	25000.00, 800.00, 400.00, 500.00,
	200.00, 1250.00, 300.00, 1.5, 1.5,
	'paid', 'Tech Hub Data Center', 28450.00, 'High-value electronic equipment'
WHERE NOT EXISTS (SELECT 1 FROM lorry_receipts WHERE cn_number = 'BWD-002')
  AND EXISTS (SELECT 1 FROM companies WHERE id = 1)
  AND EXISTS (SELECT 1 FROM companies WHERE id = 2)
  AND EXISTS (SELECT 1 FROM trucks WHERE id = 4)
  AND EXISTS (SELECT 1 FROM drivers WHERE id = 4);

-- TPR-003: Pharmaceutical products from Tarapur to Ahmedabad
INSERT INTO lorry_receipts (
	cn_number, lr_date, from_location, to_location,
	consignor_id, consignee_id, truck_id, driver_id, truck_number,
	nos, particulars, freight, hamali, aoc, door_delivery,
	collection, st_charge, extra_loading, actual_weight, chargeable_weight,
	payment_type, delivery_at, total, remarks
)
SELECT 
	'TPR-003', '2024-12-05', 'Tarapur', 'Ahmedabad',
	1, 3, 1, 1, 'MH 12 AB 1234',
	'["25"]', '["Pharmaceutical Products"]', 
	22000.00, 400.00, 250.00, 500.00,
	100.00, 1100.00, 0.00, 0.52, 0.6,
	'paid', 'Cold Storage Facility', 24350.00, 'Temperature controlled - Keep refrigerated'
WHERE NOT EXISTS (SELECT 1 FROM lorry_receipts WHERE cn_number = 'TPR-003')
  AND EXISTS (SELECT 1 FROM companies WHERE id = 1)
  AND EXISTS (SELECT 1 FROM companies WHERE id = 3)
  AND EXISTS (SELECT 1 FROM trucks WHERE id = 1)
  AND EXISTS (SELECT 1 FROM drivers WHERE id = 1);

-- Insert sample quotations
-- QUO-2024001: Electronics transport quotation
INSERT INTO quotations (
    quotation_number, quotation_date, company_id, from_location, to_location,
    load_type, trip_type, material_details, rate_per_ton, rate_type,
    applicable_gst, total_freight_with_gst, pay_by, driver_cash_required,
    payment_remark, validity_days, expiry_date, demurrage_rate_per_day,
    demurrage_remark, terms_conditions, status, created_by
)
SELECT 
    'QUO-2024001', '2024-12-01', 1, 'Tarapur', 'Mumbai',
    'Full Load', 'One Way', 
    '[{"materialName": "Electronics", "quantity": "500", "unit": "Units", "description": "Electronic components and devices"}]',
    15000.00, 'Per Ton', '18%', 17700.00, 'Consignee', 5000.00,
    'Payment within 30 days of delivery', 30, '2025-01-01', 1000.00,
    'Demurrage charges apply after 24 hours of unloading', 
    '1. Goods are transported at owner risk. 2. Insurance is not included. 3. Delivery subject to availability of transport',
    'Active', 1
WHERE NOT EXISTS (SELECT 1 FROM quotations WHERE quotation_number = 'QUO-2024001')
  AND EXISTS (SELECT 1 FROM companies WHERE id = 1);

-- QUO-2024002: Textile materials quotation
INSERT INTO quotations (
    quotation_number, quotation_date, company_id, from_location, to_location,
    load_type, trip_type, material_details, rate_per_ton, rate_type,
    applicable_gst, total_freight_with_gst, pay_by, driver_cash_required,
    payment_remark, validity_days, expiry_date, demurrage_rate_per_day,
    demurrage_remark, terms_conditions, status, created_by
)
SELECT 
    'QUO-2024002', '2024-12-02', 2, 'Bhiwandi', 'Bangalore',
    'Part Load', 'Round Trip', 
    '[{"materialName": "Cotton Bales", "quantity": "100", "unit": "Bales", "description": "Raw cotton bales"}, {"materialName": "Textile Rolls", "quantity": "50", "unit": "Rolls", "description": "Finished textile rolls"}]',
    12000.00, 'Per Ton', '18%', 14160.00, 'Consignor', 3000.00,
    'Advance payment required', 15, '2024-12-17', 800.00,
    'Demurrage charges apply after 12 hours of unloading', 
    '1. Goods are transported at owner risk. 2. Insurance is not included. 3. Delivery subject to availability of transport. 4. Advance payment required',
    'Active', 1
WHERE NOT EXISTS (SELECT 1 FROM quotations WHERE quotation_number = 'QUO-2024002')
  AND EXISTS (SELECT 1 FROM companies WHERE id = 2);

-- QUO-2024003: Chemical materials quotation
INSERT INTO quotations (
    quotation_number, quotation_date, company_id, from_location, to_location,
    load_type, trip_type, material_details, rate_per_ton, rate_type,
    applicable_gst, total_freight_with_gst, pay_by, driver_cash_required,
    payment_remark, validity_days, expiry_date, demurrage_rate_per_day,
    demurrage_remark, terms_conditions, status, created_by
)
SELECT 
    'QUO-2024003', '2024-12-03', 3, 'Tarapur', 'Surat',
    'Full Load', 'One Way', 
    '[{"materialName": "Chemical Dyes", "quantity": "200", "unit": "Kg", "description": "Industrial chemical dyes"}, {"materialName": "Raw Materials", "quantity": "500", "unit": "Kg", "description": "Raw chemical materials"}]',
    18000.00, 'Per Ton', '18%', 21240.00, 'Consignee', 7000.00,
    'Payment on delivery', 45, '2025-01-17', 1200.00,
    'Demurrage charges apply after 48 hours of unloading', 
    '1. Goods are transported at owner risk. 2. Insurance is not included. 3. Delivery subject to availability of transport. 4. Chemical handling charges extra',
    'Active', 1
WHERE NOT EXISTS (SELECT 1 FROM quotations WHERE quotation_number = 'QUO-2024003')
  AND EXISTS (SELECT 1 FROM companies WHERE id = 3);

-- QUO-2024004: Pharmaceutical products quotation
INSERT INTO quotations (
    quotation_number, quotation_date, company_id, from_location, to_location,
    load_type, trip_type, material_details, rate_per_ton, rate_type,
    applicable_gst, total_freight_with_gst, pay_by, driver_cash_required,
    payment_remark, validity_days, expiry_date, demurrage_rate_per_day,
    demurrage_remark, terms_conditions, status, created_by
)
SELECT 
    'QUO-2024004', '2024-12-04', 4, 'Bhiwandi', 'Ahmedabad',
    'Part Load', 'One Way', 
    '[{"materialName": "Pharmaceutical Products", "quantity": "100", "unit": "Boxes", "description": "Temperature controlled pharmaceutical products"}]',
    25000.00, 'Per Ton', '18%', 29500.00, 'Consignee', 10000.00,
    'Payment within 15 days of delivery', 20, '2024-12-24', 1500.00,
    'Demurrage charges apply after 6 hours of unloading', 
    '1. Goods are transported at owner risk. 2. Insurance is not included. 3. Delivery subject to availability of transport. 4. Temperature controlled transport required. 5. Special handling charges apply',
    'Active', 1
WHERE NOT EXISTS (SELECT 1 FROM quotations WHERE quotation_number = 'QUO-2024004')
  AND EXISTS (SELECT 1 FROM companies WHERE id = 4);

-- QUO-2024005: Machinery transport quotation
INSERT INTO quotations (
    quotation_number, quotation_date, company_id, from_location, to_location,
    load_type, trip_type, material_details, rate_per_ton, rate_type,
    applicable_gst, total_freight_with_gst, pay_by, driver_cash_required,
    payment_remark, validity_days, expiry_date, demurrage_rate_per_day,
    demurrage_remark, terms_conditions, status, created_by
)
SELECT 
    'QUO-2024005', '2024-12-05', 5, 'Pune', 'Delhi',
    'Full Load', 'One Way', 
    '[{"materialName": "Industrial Machinery", "quantity": "5", "unit": "Units", "description": "Heavy industrial machinery and equipment"}]',
    30000.00, 'Per Trip', '18%', 35400.00, 'Consignor', 15000.00,
    'Advance payment of 50% required', 60, '2025-02-03', 2000.00,
    'Demurrage charges apply after 24 hours of unloading', 
    '1. Goods are transported at owner risk. 2. Insurance is not included. 3. Delivery subject to availability of transport. 4. Heavy machinery handling charges extra. 5. Advance payment of 50% required',
    'Active', 1
WHERE NOT EXISTS (SELECT 1 FROM quotations WHERE quotation_number = 'QUO-2024005')
  AND EXISTS (SELECT 1 FROM companies WHERE id = 5);

-- QUO-2024006: Textile finished goods quotation
INSERT INTO quotations (
    quotation_number, quotation_date, company_id, from_location, to_location,
    load_type, trip_type, material_details, rate_per_ton, rate_type,
    applicable_gst, total_freight_with_gst, pay_by, driver_cash_required,
    payment_remark, validity_days, expiry_date, demurrage_rate_per_day,
    demurrage_remark, terms_conditions, status, created_by
)
SELECT 
    'QUO-2024006', '2024-12-06', 6, 'Surat', 'Mumbai',
    'Full Load', 'Round Trip', 
    '[{"materialName": "Finished Textiles", "quantity": "1000", "unit": "Meters", "description": "Finished textile products"}, {"materialName": "Garments", "quantity": "500", "unit": "Pieces", "description": "Ready-made garments"}]',
    14000.00, 'Per Ton', '18%', 16520.00, 'Consignee', 4000.00,
    'Payment on delivery', 30, '2025-01-05', 900.00,
    'Demurrage charges apply after 12 hours of unloading', 
    '1. Goods are transported at owner risk. 2. Insurance is not included. 3. Delivery subject to availability of transport. 4. Handle with care - finished goods',
    'Active', 1
WHERE NOT EXISTS (SELECT 1 FROM quotations WHERE quotation_number = 'QUO-2024006')
  AND EXISTS (SELECT 1 FROM companies WHERE id = 6);

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

-- Overall summary
SELECT 'SEEDER SUMMARY:' as verification, 
	   'Users: ' || (SELECT COUNT(*) FROM users) || 
	   ', Companies: ' || (SELECT COUNT(*) FROM companies) ||
	   ', Trucks: ' || (SELECT COUNT(*) FROM trucks) ||
	   ', Drivers: ' || (SELECT COUNT(*) FROM drivers) ||
	   ', Lorry Receipts: ' || (SELECT COUNT(*) FROM lorry_receipts) ||
	   ', Quotations: ' || (SELECT COUNT(*) FROM quotations) as status;
*/
