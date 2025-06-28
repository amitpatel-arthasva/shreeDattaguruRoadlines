import db from '../config/database.js';

class Company {  static create(companyData) {
    const {
      name, address, city, state, pin_code, gstin, pan
    } = companyData;
    
    const sql = `
      INSERT INTO companies (
        name, address, city, state, pin_code, gstin, pan
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    return db.query(sql, [
      name, address, city, state, pin_code, gstin, pan
    ]);
  }

  static findById(id) {
    const sql = 'SELECT * FROM companies WHERE id = ?';
    const companies = db.query(sql, [id]);
    return companies[0] || null;
  }
  static getAll() {
    const sql = 'SELECT id, name, city, state, pin_code, gstin, pan, address, created_at, updated_at FROM companies WHERE is_active = 1 ORDER BY name';
    return db.query(sql);
  }

  static getAllForList() {
    // Optimized for list views - showing only essential fields to prevent width issues
    const sql = 'SELECT id, name, city, state, gstin, pan FROM companies WHERE is_active = 1 ORDER BY name';
    return db.query(sql);
  }

  static update(id, companyData) {
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(companyData)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) return null;
    
    values.push(id);
    const sql = `UPDATE companies SET ${fields.join(', ')} WHERE id = ?`;
    return db.query(sql, values);
  }

  static delete(id) {
    const sql = 'UPDATE companies SET is_active = 0 WHERE id = ?';
    return db.query(sql, [id]);
  }

  static search(searchTerm) {
    const term = `%${searchTerm}%`;
    const sql = `
      SELECT * FROM companies 
      WHERE is_active = 1 AND (name LIKE ? OR address LIKE ? OR gstin LIKE ? OR pan LIKE ?)
      ORDER BY name
    `;
    return db.query(sql, [term, term, term, term]);
  }

  static getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total_companies,
        COUNT(CASE WHEN gstin IS NOT NULL AND gstin != '' THEN 1 END) as companies_with_gstin,
        COUNT(CASE WHEN pan IS NOT NULL AND pan != '' THEN 1 END) as companies_with_pan
      FROM companies
    `;
    const stats = db.query(sql);
    return stats[0] || {};
  }
}

export default Company;
