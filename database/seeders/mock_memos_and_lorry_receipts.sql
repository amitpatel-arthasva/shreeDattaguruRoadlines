-- Mock data for memos with new fields and lorry_receipts linked to memos

INSERT INTO memos (
  memo_number, memo_date, company_id, to_company, from_company, subject, content, priority, status, memo_type, reference_number, remarks,
  lorry_no, driver_name, ac_no, address, lorry_hire, advance, hamali, balance, payable_at, broker
) VALUES
('MEMO-202501-0101', '2025-08-10', 1, 'ABC Industries Ltd.', 'Shree Dattaguru Roadlines', 'Dispatch Memo', 'Dispatch for electronics', 'high', 'completed', 'external', 'REF-2025-0101', 'Urgent dispatch',
'MH 12 AB 1234', 'Ramesh Singh', 'AC123456', '123 Industrial Area, Mumbai', 15000, 5000, 300, 9700, 'Mumbai', 'Broker A'),
('MEMO-202501-0102', '2025-08-10', 2, 'XYZ Manufacturing Pvt. Ltd.', 'Shree Dattaguru Roadlines', 'Delivery Memo', 'Delivery for textiles', 'medium', 'pending', 'external', 'REF-2025-0102', 'Textile delivery',
'GJ 01 AA 5678', 'Suresh Yadav', 'AC654321', '456 Manufacturing Hub, Delhi', 12000, 4000, 250, 7750, 'Delhi', 'Broker B');

-- Mock lorry_receipts linked to memos
INSERT INTO lorry_receipts (
  cn_number, lr_date, from_location, to_location, consignor_id, consignee_id, truck_id, driver_id, truck_number, nos, particulars, freight, hamali, aoc, door_delivery, collection, st_charge, extra_loading, actual_weight, chargeable_weight, payment_type, delivery_at, total, remarks, memo_id
) VALUES
('TPR-0101', '2025-08-10', 'Tarapur', 'Mumbai', 1, 2, 1, 1, 'MH 12 AB 1234', '["50"]', '["Electronics"]', 15000, 300, 200, 100, 100, 50, 0, 2.5, 2.5, 'paid', 'Mumbai Warehouse', 15750, 'Handle with care', 1),
('BWD-0102', '2025-08-10', 'Bhiwandi', 'Delhi', 2, 3, 2, 2, 'GJ 01 AA 5678', '["100"]', '["Textiles"]', 12000, 250, 150, 80, 80, 40, 0, 1.8, 2.0, 'toPay', 'Delhi Warehouse', 12370, 'Fragile items', 2);
