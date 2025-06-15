import db from '../config/database.js';

class LorryReceipt {
  static create(lrData) {
    const {
      lr_number, lr_date, from_location, to_location,
      consignor_id, consignee_id, truck_id, driver_id, truck_number,
      particulars, quantity, unit, freight, hamali, aoc, door_delivery,
      collection, service_charge, extra_loading, actual_weight, charged_weight,
      payment_type, service_tax_payable_by, goods_risk, invoice_number,
      challan_number, delivery_at, remarks
    } = lrData;
    
    const sql = `
      INSERT INTO lorry_receipts (
        lr_number, lr_date, from_location, to_location,
        consignor_id, consignee_id, truck_id, driver_id, truck_number,
        particulars, quantity, unit, freight, hamali, aoc, door_delivery,
        collection, service_charge, extra_loading, actual_weight, charged_weight,
        payment_type, service_tax_payable_by, goods_risk, invoice_number,
        challan_number, delivery_at, remarks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    return db.query(sql, [
      lr_number, lr_date, from_location, to_location,
      consignor_id, consignee_id, truck_id, driver_id, truck_number,
      particulars, quantity, unit || 'Bags', freight, hamali || 0, aoc || 0, door_delivery || 0,
      collection || 0, service_charge || 20, extra_loading || 0, actual_weight, charged_weight,
      payment_type, service_tax_payable_by, goods_risk || 'Owner', invoice_number,
      challan_number, delivery_at, remarks
    ]);
  }
  static findById(id) {
    const sql = `
      SELECT lr.*, 
             cons_or.name as consignor_name, cons_or.address as consignor_address,
             cons_ee.name as consignee_name, cons_ee.address as consignee_address,
             t.truck_number as truck_reg_number, t.truck_type, t.capacity_ton,
             d.name as driver_name, d.phone as driver_phone, d.license_number
      FROM lorry_receipts lr
      LEFT JOIN companies cons_or ON lr.consignor_id = cons_or.id
      LEFT JOIN companies cons_ee ON lr.consignee_id = cons_ee.id
      LEFT JOIN trucks t ON lr.truck_id = t.id
      LEFT JOIN drivers d ON lr.driver_id = d.id
      WHERE lr.id = ?
    `;
    const receipts = db.query(sql, [id]);
    return receipts[0] || null;
  }
  static findByNumber(lr_number) {
    const sql = `
      SELECT lr.*, 
             cons_or.name as consignor_name, cons_or.address as consignor_address,
             cons_ee.name as consignee_name, cons_ee.address as consignee_address,
             t.truck_number as truck_reg_number, t.truck_type, t.capacity_ton,
             d.name as driver_name, d.phone as driver_phone, d.license_number
      FROM lorry_receipts lr
      LEFT JOIN companies cons_or ON lr.consignor_id = cons_or.id
      LEFT JOIN companies cons_ee ON lr.consignee_id = cons_ee.id
      LEFT JOIN trucks t ON lr.truck_id = t.id
      LEFT JOIN drivers d ON lr.driver_id = d.id
      WHERE lr.lr_number = ?
    `;
    const receipts = db.query(sql, [lr_number]);
    return receipts[0] || null;
  }
  static getAll(filters = {}) {
    let sql = `
      SELECT lr.*, 
             cons_or.name as consignor_name, cons_or.address as consignor_address,
             cons_ee.name as consignee_name, cons_ee.address as consignee_address,
             t.truck_number as truck_reg_number, t.truck_type, t.capacity_ton,
             d.name as driver_name, d.phone as driver_phone, d.license_number
      FROM lorry_receipts lr
      LEFT JOIN companies cons_or ON lr.consignor_id = cons_or.id
      LEFT JOIN companies cons_ee ON lr.consignee_id = cons_ee.id
      LEFT JOIN trucks t ON lr.truck_id = t.id
      LEFT JOIN drivers d ON lr.driver_id = d.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.consignor_id) {
      sql += ' AND lr.consignor_id = ?';
      params.push(filters.consignor_id);
    }

    if (filters.consignee_id) {
      sql += ' AND lr.consignee_id = ?';
      params.push(filters.consignee_id);
    }

    if (filters.from_date) {
      sql += ' AND lr.lr_date >= ?';
      params.push(filters.from_date);
    }

    if (filters.to_date) {
      sql += ' AND lr.lr_date <= ?';
      params.push(filters.to_date);
    }

    if (filters.payment_type) {
      sql += ' AND lr.payment_type = ?';
      params.push(filters.payment_type);
    }

    if (filters.from_location) {
      sql += ' AND lr.from_location LIKE ?';
      params.push(`%${filters.from_location}%`);
    }

    if (filters.to_location) {
      sql += ' AND lr.to_location LIKE ?';
      params.push(`%${filters.to_location}%`);
    }

    sql += ' ORDER BY lr.lr_date DESC, lr.id DESC';

    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }

    return db.query(sql, params);
  }

  static update(id, lrData) {
    const fields = [];
    const params = [];

    // Add fields to update
    Object.keys(lrData).forEach(key => {
      if (lrData[key] !== undefined && key !== 'id') {
        fields.push(`${key} = ?`);
        params.push(lrData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    params.push(id);
    const sql = `UPDATE lorry_receipts SET ${fields.join(', ')} WHERE id = ?`;
    
    return db.query(sql, params);
  }

  static delete(id) {
    const sql = 'DELETE FROM lorry_receipts WHERE id = ?';
    return db.query(sql, [id]);
  }

  static getNextLRNumber() {
    const sql = `
      SELECT lr_number 
      FROM lorry_receipts 
      WHERE lr_number LIKE 'LR-%' 
      ORDER BY CAST(SUBSTR(lr_number, 4) AS INTEGER) DESC 
      LIMIT 1
    `;
    const result = db.query(sql);
    
    if (result.length === 0) {
      return 'LR-1001';
    }
    
    const lastNumber = result[0].lr_number;
    const numberPart = parseInt(lastNumber.split('-')[1]);
    return `LR-${numberPart + 1}`;
  }

  static getTotalsByDateRange(fromDate, toDate) {
    const sql = `
      SELECT 
        COUNT(*) as total_receipts,
        SUM(freight) as total_freight,
        SUM(hamali) as total_hamali,
        SUM(aoc) as total_aoc,
        SUM(door_delivery) as total_door_delivery,
        SUM(collection) as total_collection,
        SUM(service_charge) as total_service_charge,
        SUM(extra_loading) as total_extra_loading,
        SUM(actual_weight) as total_actual_weight,
        SUM(charged_weight) as total_charged_weight
      FROM lorry_receipts 
      WHERE lr_date BETWEEN ? AND ?
    `;
    const result = db.query(sql, [fromDate, toDate]);
    return result[0] || {};
  }

  static getFreightSummary() {
    const sql = `
      SELECT 
        payment_type,
        COUNT(*) as count,
        SUM(freight + hamali + aoc + door_delivery + collection + service_charge + extra_loading) as total_amount
      FROM lorry_receipts 
      GROUP BY payment_type
    `;
    return db.query(sql);
  }
}

export default LorryReceipt;
