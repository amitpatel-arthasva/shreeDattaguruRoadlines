import db from '../config/database.js';

class Quotation {
  static create(quotationData) {
    const {
      quotation_number, company_id, quotation_date, from_location, to_location,
      material_description, vehicle_type, rate_per_ton, minimum_guarantee_weight,
      validity_days, terms_conditions, created_by
    } = quotationData;
    
    const sql = `
      INSERT INTO quotations (
        quotation_number, company_id, quotation_date, from_location, to_location,
        material_description, vehicle_type, rate_per_ton, minimum_guarantee_weight,
        validity_days, terms_conditions, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    return db.query(sql, [
      quotation_number, company_id, quotation_date, from_location, to_location,
      material_description, vehicle_type, rate_per_ton, minimum_guarantee_weight,
      validity_days, terms_conditions, created_by
    ]);
  }

  static findById(id) {
    const sql = `
      SELECT q.*, c.company_name, c.contact_person, c.phone, c.email,
             u.full_name as created_by_name
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
      SELECT q.*, c.company_name, c.contact_person, c.phone, c.email,
             u.full_name as created_by_name
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
      SELECT q.*, c.company_name, c.contact_person,
             u.full_name as created_by_name
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

    sql += ' ORDER BY q.quotation_date DESC, q.created_at DESC';

    return db.query(sql, params);
  }

  static update(id, quotationData) {
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(quotationData)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) return null;
    
    values.push(id);
    const sql = `UPDATE quotations SET ${fields.join(', ')} WHERE id = ?`;
    return db.query(sql, values);
  }

  static delete(id) {
    const sql = 'DELETE FROM quotations WHERE id = ?';
    return db.query(sql, [id]);
  }

  static updateStatus(id, status) {
    const sql = 'UPDATE quotations SET status = ? WHERE id = ?';
    return db.query(sql, [status, id]);
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

  static getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total_quotations,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_quotations,
        COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_quotations,
        COUNT(CASE WHEN status = 'accepted' THEN 1 END) as accepted_quotations,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_quotations
      FROM quotations
    `;
    const stats = db.query(sql);
    return stats[0] || {};
  }
}

export default Quotation;
