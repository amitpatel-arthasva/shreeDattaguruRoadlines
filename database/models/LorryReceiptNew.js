import db from '../config/database.js';

class LorryReceipt {
  static create(receiptData) {
    const {
      lr_number, lr_date, from_location, to_location,
      consignor_id, consignee_id, truck_number, freight,
      hamali, aoc, door_delivery,detention, collection, service_charge,
      extra_loading, actual_weight, charged_weight, payment_type,
      goods_risk, truck_id, driver_id, delivery_at, remarks
    } = receiptData;
    
    const sql = `
      INSERT INTO lorry_receipts (
        lr_number, lr_date, from_location, to_location,
        consignor_id, consignee_id, truck_number, freight,
        hamali, aoc, door_delivery,detention, collection, service_charge,
        extra_loading, actual_weight, charged_weight, payment_type,
        goods_risk, truck_id, driver_id, delivery_at, remarks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    return db.query(sql, [
      lr_number, lr_date, from_location, to_location,
      consignor_id, consignee_id, truck_number, freight,
      hamali, aoc, door_delivery,detention, collection, service_charge,
      extra_loading, actual_weight, charged_weight, payment_type,
      goods_risk, truck_id, driver_id, delivery_at, remarks
    ]);
  }

  static findById(id) {
    const sql = `
      SELECT 
        lr.*,
        c1.name as consignor_name,
        c1.address as consignor_address,
        c2.name as consignee_name,
        c2.address as consignee_address,
        t.truck_number as truck_full_number,
        t.truck_type,
        d.name as driver_name,
        d.phone as driver_phone
      FROM lorry_receipts lr
      LEFT JOIN companies c1 ON lr.consignor_id = c1.id
      LEFT JOIN companies c2 ON lr.consignee_id = c2.id
      LEFT JOIN trucks t ON lr.truck_id = t.id
      LEFT JOIN drivers d ON lr.driver_id = d.id
      WHERE lr.id = ?
    `;
    const receipts = db.query(sql, [id]);
    return receipts[0] || null;
  }

  static findByLRNumber(lr_number) {
    const sql = `
      SELECT 
        lr.*,
        c1.name as consignor_name,
        c2.name as consignee_name,
        t.truck_number as truck_full_number,
        d.name as driver_name
      FROM lorry_receipts lr
      LEFT JOIN companies c1 ON lr.consignor_id = c1.id
      LEFT JOIN companies c2 ON lr.consignee_id = c2.id
      LEFT JOIN trucks t ON lr.truck_id = t.id
      LEFT JOIN drivers d ON lr.driver_id = d.id
      WHERE lr.lr_number = ?
    `;
    const receipts = db.query(sql, [lr_number]);
    return receipts[0] || null;
  }

  static getAll(limit = 100) {
    const sql = `
      SELECT 
        lr.*,
        c1.name as consignor_name,
        c2.name as consignee_name,
        t.truck_number as truck_full_number,
        d.name as driver_name
      FROM lorry_receipts lr
      LEFT JOIN companies c1 ON lr.consignor_id = c1.id
      LEFT JOIN companies c2 ON lr.consignee_id = c2.id
      LEFT JOIN trucks t ON lr.truck_id = t.id
      LEFT JOIN drivers d ON lr.driver_id = d.id
      ORDER BY lr.created_at DESC
      LIMIT ?
    `;
    return db.query(sql, [limit]);
  }

  static getNextLRNumber() {
    const year = new Date().getFullYear();
    const sql = `
      SELECT lr_number FROM lorry_receipts 
      WHERE lr_number LIKE 'LR${year}%' 
      ORDER BY lr_number DESC 
      LIMIT 1
    `;
    const result = db.query(sql);
    
    if (result.length === 0) {
      return `LR${year}001`;
    }
    
    const lastNumber = result[0].lr_number;
    const numberPart = parseInt(lastNumber.substring(6)) + 1;
    return `LR${year}${numberPart.toString().padStart(3, '0')}`;
  }

  static update(id, receiptData) {
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(receiptData)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) return null;
    
    values.push(id);
    const sql = `UPDATE lorry_receipts SET ${fields.join(', ')} WHERE id = ?`;
    return db.query(sql, values);
  }

  static delete(id) {
    const sql = 'DELETE FROM lorry_receipts WHERE id = ?';
    return db.query(sql, [id]);
  }

  static search(searchTerm) {
    const term = `%${searchTerm}%`;
    const sql = `
      SELECT 
        lr.*,
        c1.name as consignor_name,
        c2.name as consignee_name,
        t.truck_number as truck_full_number,
        d.name as driver_name
      FROM lorry_receipts lr
      LEFT JOIN companies c1 ON lr.consignor_id = c1.id
      LEFT JOIN companies c2 ON lr.consignee_id = c2.id
      LEFT JOIN trucks t ON lr.truck_id = t.id
      LEFT JOIN drivers d ON lr.driver_id = d.id
      WHERE (lr.lr_number LIKE ? OR lr.from_location LIKE ? OR lr.to_location LIKE ? 
             OR c1.name LIKE ? OR c2.name LIKE ? OR t.truck_number LIKE ?)
      ORDER BY lr.created_at DESC
    `;
    return db.query(sql, [term, term, term, term, term, term]);
  }

  static getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total_receipts,
        SUM(freight) as total_freight,
        AVG(freight) as avg_freight,
        COUNT(CASE WHEN payment_type = 'Paid' THEN 1 END) as paid_receipts,
        COUNT(CASE WHEN payment_type = 'To Pay' THEN 1 END) as to_pay_receipts
      FROM lorry_receipts
    `;
    const stats = db.query(sql);
    return stats[0] || {};
  }
}

export default LorryReceipt;
