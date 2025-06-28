import db from '../config/database.js';

class Driver {
  static create(driverData) {
    const {
      name, phone, license_number, address
    } = driverData;
    
    const sql = `
      INSERT INTO drivers (
        name, phone, license_number, address
      ) VALUES (?, ?, ?, ?)
    `;
    
    return db.query(sql, [
      name, phone, license_number, address
    ]);
  }

  static findById(id) {
    const sql = 'SELECT * FROM drivers WHERE id = ?';
    const drivers = db.query(sql, [id]);
    return drivers[0] || null;
  }

  static getAll(activeOnly = true) {
    const sql = activeOnly 
      ? 'SELECT * FROM drivers WHERE is_active = 1 ORDER BY name'
      : 'SELECT * FROM drivers ORDER BY name';
    return db.query(sql);
  }

  static update(id, driverData) {
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(driverData)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) return null;
    
    values.push(id);
    const sql = `UPDATE drivers SET ${fields.join(', ')} WHERE id = ?`;
    return db.query(sql, values);
  }

  static delete(id) {
    // Use soft delete by setting is_active to 0
    const sql = 'UPDATE drivers SET is_active = 0 WHERE id = ?';
    return db.query(sql, [id]);
  }

  static activate(id) {
    const sql = 'UPDATE drivers SET is_active = 1 WHERE id = ?';
    return db.query(sql, [id]);
  }

  static deactivate(id) {
    const sql = 'UPDATE drivers SET is_active = 0 WHERE id = ?';
    return db.query(sql, [id]);
  }

  static search(searchTerm) {
    const term = `%${searchTerm}%`;
    const sql = `
      SELECT * FROM drivers 
      WHERE (name LIKE ? OR phone LIKE ? OR license_number LIKE ?)
      AND is_active = 1
      ORDER BY name
    `;
    return db.query(sql, [term, term, term]);
  }

  static getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total_drivers,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_drivers,
        COUNT(CASE WHEN is_active = 0 THEN 1 END) as inactive_drivers
      FROM drivers
    `;
    const stats = db.query(sql);
    return stats[0] || {};
  }
}

export default Driver;
