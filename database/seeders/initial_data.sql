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

-- Insert sample quotations (updated for new minimal structure)
INSERT INTO quotations (
  quotation_number, quotation_date, company_id, to_user, from_location, to_location, freight_upto_8mt, destinations_json
)
SELECT 
  'QUO-2024001', '2024-12-01', 1, 'ABC Industries Ltd.', 'Tarapur', 'Mumbai', 15000.00,
  '[{"to":"Mumbai","rate":15000},{"to":"Pune","rate":15500}]'
WHERE NOT EXISTS (SELECT 1 FROM quotations WHERE quotation_number = 'QUO-2024001')
  AND EXISTS (SELECT 1 FROM companies WHERE id = 1);

INSERT INTO quotations (
  quotation_number, quotation_date, company_id, to_user, from_location, to_location, freight_upto_8mt, destinations_json
)
SELECT 
  'QUO-2024002', '2024-12-02', 2, 'XYZ Manufacturing Pvt. Ltd.', 'Bhiwandi', 'Bangalore', 12000.00,
  '[{"to":"Bangalore","rate":12000},{"to":"Chennai","rate":12500}]'
WHERE NOT EXISTS (SELECT 1 FROM quotations WHERE quotation_number = 'QUO-2024002')
  AND EXISTS (SELECT 1 FROM companies WHERE id = 2);

INSERT INTO quotations (
  quotation_number, quotation_date, company_id, to_user, from_location, to_location, freight_upto_8mt, destinations_json
)
SELECT 
  'QUO-2024003', '2024-12-03', 3, 'PQR Traders', 'Tarapur', 'Surat', 18000.00,
  '[{"to":"Surat","rate":18000},{"to":"Vadodara","rate":18500}]'
WHERE NOT EXISTS (SELECT 1 FROM quotations WHERE quotation_number = 'QUO-2024003')
  AND EXISTS (SELECT 1 FROM companies WHERE id = 3);

INSERT INTO quotations (
  quotation_number, quotation_date, company_id, to_user, from_location, to_location, freight_upto_8mt, destinations_json
)
SELECT 
  'QUO-2024004', '2024-12-04', 4, 'LMN Enterprises', 'Bhiwandi', 'Ahmedabad', 25000.00,
  '[{"to":"Ahmedabad","rate":25000},{"to":"Rajkot","rate":25500}]'
WHERE NOT EXISTS (SELECT 1 FROM quotations WHERE quotation_number = 'QUO-2024004')
  AND EXISTS (SELECT 1 FROM companies WHERE id = 4);

INSERT INTO quotations (
  quotation_number, quotation_date, company_id, to_user, from_location, to_location, freight_upto_8mt, destinations_json
)
SELECT 
  'QUO-2024005', '2024-12-05', 5, 'RST Corporation', 'Pune', 'Delhi', 30000.00,
  '[{"to":"Delhi","rate":30000},{"to":"Noida","rate":30500}]'
WHERE NOT EXISTS (SELECT 1 FROM quotations WHERE quotation_number = 'QUO-2024005')
  AND EXISTS (SELECT 1 FROM companies WHERE id = 5);

INSERT INTO quotations (
  quotation_number, quotation_date, company_id, to_user, from_location, to_location, freight_upto_8mt, destinations_json
)
SELECT 
  'QUO-2024006', '2024-12-06', 6, 'Global Textiles Inc.', 'Surat', 'Mumbai', 14000.00,
  '[{"to":"Mumbai","rate":14000},{"to":"Nagpur","rate":14500}]'
WHERE NOT EXISTS (SELECT 1 FROM quotations WHERE quotation_number = 'QUO-2024006')
  AND EXISTS (SELECT 1 FROM companies WHERE id = 6);
-- ...existing code...

-- Insert sample memos
INSERT INTO memos (memo_number, memo_date, company_id, to_company, from_company, subject, content, priority, status, memo_type, reference_number, remarks)
SELECT 'MEMO-202501-0001', '2025-01-15', 1, 'ABC Industries Ltd.', 'Shree Dattaguru Roadlines', 'Updated Transportation Schedule', 
'Dear Sir/Madam,

This is to inform you about the updated transportation schedule for the upcoming week. Due to increased demand and route optimization, we have revised our delivery schedules.

Effective from January 20th, 2025:
- Morning pickups: 8:00 AM - 10:00 AM
- Afternoon deliveries: 2:00 PM - 5:00 PM
- Express deliveries: Available on demand

Please coordinate with our dispatch team for any special requirements.

Thank you for your continued trust in our services.

Best regards,
Shree Dattaguru Roadlines Team', 'medium', 'completed', 'external', 'REF-2025-001', 'Schedule update memo sent to all major clients'
WHERE NOT EXISTS (SELECT 1 FROM memos WHERE memo_number = 'MEMO-202501-0001');

INSERT INTO memos (memo_number, memo_date, company_id, to_company, from_company, subject, content, priority, status, memo_type, reference_number, remarks)
SELECT 'MEMO-202501-0002', '2025-01-20', 2, 'XYZ Manufacturing Pvt. Ltd.', 'Shree Dattaguru Roadlines', 'Safety Protocol Update', 
'Dear Valued Partner,

We are implementing enhanced safety protocols for all transportation operations to ensure the highest standards of security for your consignments.

New Safety Measures:
1. GPS tracking for all vehicles
2. Regular driver training programs
3. Enhanced vehicle maintenance schedules
4. Emergency response protocols
5. Insurance coverage updates

These measures will be effective from February 1st, 2025.

We appreciate your cooperation in maintaining these safety standards.

Regards,
Safety Team
Shree Dattaguru Roadlines', 'high', 'pending', 'external', 'SAFETY-2025-002', 'Important safety update for manufacturing clients'
WHERE NOT EXISTS (SELECT 1 FROM memos WHERE memo_number = 'MEMO-202501-0002');

INSERT INTO memos (memo_number, memo_date, company_id, to_company, from_company, subject, content, priority, status, memo_type, reference_number, remarks)
SELECT 'MEMO-202501-0003', '2025-01-22', NULL, 'All Staff Members', 'Management', 'Monthly Team Meeting', 
'All Team Members,

Monthly team meeting is scheduled for this Friday at 4:00 PM in the conference room.

Agenda:
- Monthly performance review
- New client acquisitions
- Process improvements
- Safety protocol updates
- Upcoming holiday schedule

Please confirm your attendance by Thursday evening.

Best regards,
Management Team', 'medium', 'in_progress', 'internal', 'MEET-2025-003', 'Internal staff meeting memo'
WHERE NOT EXISTS (SELECT 1 FROM memos WHERE memo_number = 'MEMO-202501-0003');

INSERT INTO memos (memo_number, memo_date, company_id, to_company, from_company, subject, content, priority, status, memo_type, reference_number, remarks)
SELECT 'MEMO-202501-0004', '2025-01-25', 3, 'PQR Traders', 'Shree Dattaguru Roadlines', 'Service Rate Revision', 
'Dear Sir/Madam,

This memo serves to inform you about the revised transportation rates effective from February 15th, 2025.

Rate Changes:
- Local delivery: ₹50 per km (previously ₹45)
- Interstate delivery: ₹35 per km (previously ₹32)
- Express delivery: 25% surcharge on regular rates
- Bulk shipments: 15% discount for orders above 10 tons

These revisions are due to increased fuel costs and enhanced service quality.

For any queries, please contact our billing department.

Thank you for your understanding.

Best regards,
Billing Department
Shree Dattaguru Roadlines', 'high', 'completed', 'external', 'RATE-2025-004', 'Rate revision notification to traders'
WHERE NOT EXISTS (SELECT 1 FROM memos WHERE memo_number = 'MEMO-202501-0004');

INSERT INTO memos (memo_number, memo_date, company_id, to_company, from_company, subject, content, priority, status, memo_type, reference_number, remarks)
SELECT 'MEMO-202501-0005', '2025-01-28', NULL, 'IT Department', 'Operations Manager', 'System Maintenance Schedule', 
'IT Department,

Please schedule system maintenance for our logistics management system.

Maintenance Requirements:
- Database backup and optimization
- Server security updates
- Application performance tuning
- User access review
- Backup system testing

Preferred maintenance window: Sunday 2:00 AM - 6:00 AM

Please coordinate with operations team before scheduling.

Thanks,
Operations Manager', 'low', 'draft', 'internal', 'SYS-2025-005', 'Internal IT maintenance request'
WHERE NOT EXISTS (SELECT 1 FROM memos WHERE memo_number = 'MEMO-202501-0005');

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
