import db from '../config/database.js';

class User {  static create(userData) {
    const { name, email, phonenumber, password_hash, role } = userData;
    const sql = `
      INSERT INTO users (name, email, phonenumber, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `;
    return db.query(sql, [name, email, phonenumber, password_hash, role]);
  }

  static findById(id) {
    const sql = 'SELECT * FROM users WHERE id = ?';
    const users = db.query(sql, [id]);
    return users[0] || null;
  }

  static findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const users = db.query(sql, [email]);
    return users[0] || null;
  }
  static async getAll() {
  const sql = 'SELECT id, name, email, phonenumber, role, created_at FROM users ORDER BY created_at DESC';
  return await db.query(sql);
  }

  static async update(id, userData) {
  const fields = [];
  const values = [];
    
    for (const [key, value] of Object.entries(userData)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) return null;
    
    values.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    return await db.query(sql, values);
  }
  static async delete(id) {
  const sql = 'DELETE FROM users WHERE id = ?';
  return await db.query(sql, [id]);
  }
}

export default User;
