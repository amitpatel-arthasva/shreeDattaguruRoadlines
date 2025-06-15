import db from '../config/database.js';

class Truck {
  static create(truckData) {
    const {
      truck_number, truck_type, capacity_ton, owner_name
    } = truckData;
    
    const sql = `
      INSERT INTO trucks (
        truck_number, truck_type, capacity_ton, owner_name
      ) VALUES (?, ?, ?, ?)
    `;
    
    return db.query(sql, [
      truck_number, truck_type, capacity_ton, owner_name
    ]);
  }

  static findById(id) {
    const sql = 'SELECT * FROM trucks WHERE id = ?';
    const trucks = db.query(sql, [id]);
    return trucks[0] || null;
  }

  static findByTruckNumber(truck_number) {
    const sql = 'SELECT * FROM trucks WHERE truck_number = ?';
    const trucks = db.query(sql, [truck_number]);
    return trucks[0] || null;
  }

  static getAll() {
    const sql = 'SELECT * FROM trucks ORDER BY truck_number';
    return db.query(sql);
  }

  static update(id, truckData) {
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(truckData)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) return null;
    
    values.push(id);
    const sql = `UPDATE trucks SET ${fields.join(', ')} WHERE id = ?`;
    return db.query(sql, values);
  }

  static delete(id) {
    const sql = 'DELETE FROM trucks WHERE id = ?';
    return db.query(sql, [id]);
  }

  static search(searchTerm) {
    const term = `%${searchTerm}%`;
    const sql = `
      SELECT * FROM trucks 
      WHERE (truck_number LIKE ? OR truck_type LIKE ? OR owner_name LIKE ?)
      ORDER BY truck_number
    `;
    return db.query(sql, [term, term, term]);
  }

  static getStats() {
    const sql = `
      SELECT 
        COUNT(*) as total_trucks,
        COUNT(CASE WHEN capacity_ton > 0 THEN 1 END) as trucks_with_capacity,
        AVG(capacity_ton) as avg_capacity
      FROM trucks
    `;
    const stats = db.query(sql);
    return stats[0] || {};
  }
}

export default Truck;
