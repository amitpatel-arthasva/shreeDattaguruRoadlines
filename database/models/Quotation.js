import db from '../config/database.js';

class Quotation {
  static create(quotationData) {
    const {
      quotation_number, quotation_date, company_id, from_location, to_location,
      load_type, trip_type, material_details, rate_per_ton, rate_type,
      applicable_gst, total_freight_with_gst, pay_by, driver_cash_required,
      payment_remark, validity_days, expiry_date, demurrage_rate_per_day,
      demurrage_remark, terms_conditions, status, created_by
    } = quotationData;
    
    const sql = `
      INSERT INTO quotations (
        quotation_number, quotation_date, company_id, from_location, to_location,
        load_type, trip_type, material_details, rate_per_ton, rate_type,
        applicable_gst, total_freight_with_gst, pay_by, driver_cash_required,
        payment_remark, validity_days, expiry_date, demurrage_rate_per_day,
        demurrage_remark, terms_conditions, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    return db.query(sql, [
      quotation_number, quotation_date, company_id, from_location, to_location,
      load_type, trip_type, material_details, rate_per_ton, rate_type,
      applicable_gst, total_freight_with_gst, pay_by, driver_cash_required,
      payment_remark, validity_days, expiry_date, demurrage_rate_per_day,
      demurrage_remark, terms_conditions, status, created_by
    ]);
  }

  static findById(id) {
    const sql = `
      SELECT q.*, 
             c.name as company_name, c.address as company_address, 
             c.city as company_city, c.state as company_state,
             c.pin_code as company_pin_code, c.gstin as company_gstin,
             c.pan as company_pan,
             u.name as created_by_name
      FROM quotations q
      LEFT JOIN companies c ON q.company_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      WHERE q.id = ?
    `;
    const quotations = db.query(sql, [id]);
    return quotations[0] || null;
  }

  static findByNumber(quotation_number) {
    const sql = `
      SELECT q.*, 
             c.name as company_name, c.address as company_address,
             c.city as company_city, c.state as company_state,
             c.pin_code as company_pin_code, c.gstin as company_gstin,
             c.pan as company_pan,
             u.name as created_by_name
      FROM quotations q
      LEFT JOIN companies c ON q.company_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      WHERE q.quotation_number = ?
    `;
    const quotations = db.query(sql, [quotation_number]);
    return quotations[0] || null;
  }

  static getAll(filters = {}) {
    let sql = `
      SELECT q.*, 
             c.name as company_name, c.address as company_address,
             c.city as company_city, c.state as company_state,
             c.pin_code as company_pin_code, c.gstin as company_gstin,
             c.pan as company_pan,
             u.name as created_by_name
      FROM quotations q
      LEFT JOIN companies c ON q.company_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.company_id) {
      sql += ' AND q.company_id = ?';
      params.push(filters.company_id);
    }

    if (filters.status) {
      sql += ' AND q.status = ?';
      params.push(filters.status);
    }

    if (filters.from_date) {
      sql += ' AND q.quotation_date >= ?';
      params.push(filters.from_date);
    }

    if (filters.to_date) {
      sql += ' AND q.quotation_date <= ?';
      params.push(filters.to_date);
    }

    if (filters.from_location) {
      sql += ' AND q.from_location LIKE ?';
      params.push(`%${filters.from_location}%`);
    }

    if (filters.to_location) {
      sql += ' AND q.to_location LIKE ?';
      params.push(`%${filters.to_location}%`);
    }

    if (filters.company_name) {
      sql += ' AND c.name LIKE ?';
      params.push(`%${filters.company_name}%`);
    }

    sql += ' ORDER BY q.quotation_date DESC, q.created_at DESC';

    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }

    if (filters.offset) {
      sql += ' OFFSET ?';
      params.push(filters.offset);
    }

    return db.query(sql, params);
  }

  static update(id, quotationData) {
    const fields = [];
    const params = [];

    // Add fields to update
    Object.keys(quotationData).forEach(key => {
      if (quotationData[key] !== undefined && key !== 'id') {
        fields.push(`${key} = ?`);
        params.push(quotationData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    params.push(id);
    const sql = `UPDATE quotations SET ${fields.join(', ')} WHERE id = ?`;
    
    return db.query(sql, params);
  }

  static delete(id) {
    const sql = 'DELETE FROM quotations WHERE id = ?';
    return db.query(sql, [id]);
  }

  static search(searchTerm, limit = 50) {
    const term = `%${searchTerm}%`;
    const sql = `
      SELECT q.*, 
             c.name as company_name, c.address as company_address,
             c.city as company_city, c.state as company_state,
             c.pin_code as company_pin_code, c.gstin as company_gstin,
             c.pan as company_pan,
             u.name as created_by_name
      FROM quotations q
      LEFT JOIN companies c ON q.company_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      WHERE (q.quotation_number LIKE ? OR q.from_location LIKE ? OR q.to_location LIKE ? 
             OR c.name LIKE ? OR c.gstin LIKE ?)
      ORDER BY q.quotation_date DESC, q.created_at DESC
      LIMIT ?
    `;
    return db.query(sql, [term, term, term, term, term, limit]);
  }

  static getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total_quotations,
        COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_quotations,
        COUNT(CASE WHEN status = 'Expired' THEN 1 END) as expired_quotations,
        COUNT(CASE WHEN status = 'Accepted' THEN 1 END) as accepted_quotations,
        COUNT(CASE WHEN status = 'Rejected' THEN 1 END) as rejected_quotations,
        AVG(total_freight_with_gst) as avg_freight,
        SUM(total_freight_with_gst) as total_freight_value
      FROM quotations
    `;
    const stats = db.query(sql);
    return stats[0] || {};
  }

  static getExpiringQuotations(days = 7) {
    const sql = `
      SELECT q.*, 
             c.name as company_name, c.address as company_address,
             c.city as company_city, c.state as company_state,
             c.pin_code as company_pin_code, c.gstin as company_gstin,
             c.pan as company_pan,
             u.name as created_by_name
      FROM quotations q
      LEFT JOIN companies c ON q.company_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      WHERE q.expiry_date IS NOT NULL 
        AND q.expiry_date <= date('now', '+' || ? || ' days')
        AND q.status = 'Active'
      ORDER BY q.expiry_date ASC
    `;
    return db.query(sql, [days]);
  }

  static generateQuotationNumber() {
    const prefix = 'QUO';
    const year = new Date().getFullYear();
    const sql = `
      SELECT quotation_number 
      FROM quotations 
      WHERE quotation_number LIKE '${prefix}${year}%' 
      ORDER BY quotation_number DESC 
      LIMIT 1
    `;
    
    const result = db.query(sql);
    if (result.length === 0) {
      return `${prefix}${year}001`;
    }
    
    const lastNumber = result[0].quotation_number;
    const sequence = parseInt(lastNumber.slice(-3)) + 1;
    return `${prefix}${year}${sequence.toString().padStart(3, '0')}`;
  }

  static updateExpiredStatus() {
    const sql = `
      UPDATE quotations 
      SET status = 'Expired' 
      WHERE expiry_date IS NOT NULL 
        AND expiry_date < date('now') 
        AND status = 'Active'
    `;
    return db.query(sql);
  }
}

export default Quotation;
