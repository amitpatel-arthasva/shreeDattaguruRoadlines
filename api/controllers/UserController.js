import User from '../../database/models/User.js';
import bcrypt from 'bcrypt';

class UserController {
  static async getAll(req, res) {
    try {
      const users = await User.getAll();
      res.json({ success: true, data: users });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findById(id);
      
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  static async create(req, res) {
    try {
      const { name, email, phonenumber, password, role = 'user' } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          error: 'User with this email already exists' 
        });
      }
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const result = User.create({
        name,
        email,
        phonenumber,
        password_hash: hashedPassword,
        role
      });
      
      res.status(201).json({ 
        success: true, 
        data: { id: result.lastInsertRowid, name, email, phonenumber, role } 
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;      // Hash password if provided
      if (updateData.password) {
        updateData.password_hash = await bcrypt.hash(updateData.password, 10);
        delete updateData.password;
      }
      
      const result = await User.update(id, updateData);
      
      if (result.changes === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      res.json({ success: true, message: 'User updated successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await User.delete(id);
      
      if (result.changes === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  static async authenticate(req, res) {
    try {
      const { email, password } = req.body;
      
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }
      const isValid = await bcrypt.compare(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ success: false, error: 'Invalid credentials' });
      }
      // Remove password hash from response
      delete user.password_hash;
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export default UserController;
