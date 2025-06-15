import db from '../config/database.js';

class Company {
  static create(companyData) {
    const {
      company_name, contact_person, phone, mobile, email,
      address, city, state, pincode, gstin, pan
    } = companyData;
    
    const sql = `
      INSERT INTO companies (
        company_name, contact_person, phone, mobile, email,
        address, city, state, pincode, gstin, pan
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    return db.query(sql, [
      company_name, contact_person, phone, mobile, email,
      address, city, state, pincode, gstin, pan
    ]);
  }

  static findById(id) {
    const sql = 'SELECT * FROM companies WHERE id = ?';
    const companies = db.query(sql, [id]);
    return companies[0] || null;
  }

  static getAll(activeOnly = true) {
    const sql = activeOnly 
      ? 'SELECT * FROM companies WHERE is_active = 1 ORDER BY company_name'
      : 'SELECT * FROM companies ORDER BY company_name';
    return db.query(sql);
  }

  static search(searchTerm) {
    const sql = `
      SELECT * FROM companies 
      WHERE (company_name LIKE ? OR contact_person LIKE ? OR phone LIKE ? OR mobile LIKE ?)
      AND is_active = 1
      ORDER BY company_name
    `;
    const term = `%${searchTerm}%`;
    return db.query(sql, [term, term, term, term]);
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
    const sql = 'DELETE FROM companies WHERE id = ?';
    return db.query(sql, [id]);
  }

  static activate(id) {
    const sql = 'UPDATE companies SET is_active = 1 WHERE id = ?';
    return db.query(sql, [id]);
  }

  static deactivate(id) {
    const sql = 'UPDATE companies SET is_active = 0 WHERE id = ?';
    return db.query(sql, [id]);
  }

  static getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total_companies,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_companies,
        COUNT(CASE WHEN is_active = 0 THEN 1 END) as inactive_companies
      FROM companies
    `;
    const stats = db.query(sql);
    return stats[0] || {};
  }
}

export default Company;
