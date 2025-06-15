-- Insert default admin user (only if not exists)
-- Password: 'admin' - hashed with bcrypt
INSERT OR IGNORE INTO users (name, email, phonenumber, password_hash, role, created_at, updated_at) 
VALUES ('Administrator', 'admin@test.com', '1234567890', '$2b$10$tONrrbnmLaoI7bnqy67Hne.LhH87vS8lRDVui3hPMT8uFYB8NPh/e', 'admin', datetime('now'), datetime('now'));

-- Insert sample companies (only if not exists)
INSERT INTO companies (name, address, gstin, pan)
SELECT 'ABC Transport Ltd.', '123 Transport Nagar, Mumbai, Maharashtra - 400001', '27ABCDE1234F1Z5', 'ABCDE1234F'
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE name = 'ABC Transport Ltd.');

INSERT INTO companies (name, address, gstin, pan)
SELECT 'XYZ Logistics Pvt. Ltd.', '456 Logistics Hub, Delhi - 110001', '07XYZAB1234C1Z8', 'XYZAB1234C'
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE name = 'XYZ Logistics Pvt. Ltd.');

INSERT INTO companies (name, address, gstin, pan)
SELECT 'PQR Cargo Services', '789 Cargo Complex, Ahmedabad, Gujarat - 380001', '24PQRST1234G1Z9', 'PQRST1234G'
WHERE NOT EXISTS (SELECT 1 FROM companies WHERE name = 'PQR Cargo Services');

-- Insert sample trucks (only if not exists)
INSERT INTO trucks (truck_number, truck_type, capacity_ton, owner_name)
SELECT 'MH 12 AB 1234', 'Open', 10.0, 'Rajesh Kumar'
WHERE NOT EXISTS (SELECT 1 FROM trucks WHERE truck_number = 'MH 12 AB 1234');

INSERT INTO trucks (truck_number, truck_type, capacity_ton, owner_name)
SELECT 'GJ 01 AA 5678', 'Closed', 15.0, 'Amit Patel'
WHERE NOT EXISTS (SELECT 1 FROM trucks WHERE truck_number = 'GJ 01 AA 5678');

INSERT INTO trucks (truck_number, truck_type, capacity_ton, owner_name)
SELECT 'DL 8C AA 9012', 'Container', 20.0, 'Priya Sharma'
WHERE NOT EXISTS (SELECT 1 FROM trucks WHERE truck_number = 'DL 8C AA 9012');

-- Insert sample drivers (only if not exists)
INSERT INTO drivers (name, phone, license_number, address)
SELECT 'Ramesh Singh', '9876543210', 'DL1234567890', 'Driver Colony, Mumbai'
WHERE NOT EXISTS (SELECT 1 FROM drivers WHERE name = 'Ramesh Singh');

INSERT INTO drivers (name, phone, license_number, address)
SELECT 'Suresh Yadav', '9876543211', 'GJ1234567891', 'Transport Nagar, Ahmedabad'
WHERE NOT EXISTS (SELECT 1 FROM drivers WHERE name = 'Suresh Yadav');

INSERT INTO drivers (name, phone, license_number, address)
SELECT 'Mahesh Kumar', '9876543212', 'DL1234567892', 'Logistics Hub, Delhi'
WHERE NOT EXISTS (SELECT 1 FROM drivers WHERE name = 'Mahesh Kumar');
