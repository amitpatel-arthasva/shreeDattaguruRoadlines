import apiService from './apiService.js';

class DriverService {  // Get all drivers with filtering and pagination
  async getDrivers(params = {}) {
    try {
      const { page = 1, limit = 10, search, activeOnly = true } = params;
      console.log('Getting drivers, activeOnly parameter:', activeOnly); // Avoid unused parameter warning
      
      let sql = `
        SELECT * FROM drivers 
        WHERE is_active = 1
      `;
      const queryParams = [];
      
      // Add search filters
      if (search) {
        sql += ` AND (
          name LIKE ? OR 
          phone LIKE ? OR 
          license_number LIKE ?
        )`;
        const searchTerm = `%${search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
      }
      
      sql += ` ORDER BY name`;
      
      // Get total count for pagination
      let countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
      const countResult = await apiService.query(countSql, queryParams);
      const total = countResult[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);
      
      // Add pagination
      const offset = (page - 1) * limit;
      sql += ` LIMIT ? OFFSET ?`;
      queryParams.push(limit, offset);
      
      const drivers = await apiService.query(sql, queryParams);
      
      return {
        success: true,
        data: {
          drivers,
          totalPages,
          currentPage: page,
          total
        }
      };
    } catch (error) {
      console.error('Error in getDrivers:', error);
      throw error;
    }
  }

  // Get driver by ID
  async getDriverById(id) {
    try {
      const sql = 'SELECT * FROM drivers WHERE id = ?';
      const result = await apiService.query(sql, [id]);
      
      if (result.length === 0) {
        throw new Error('Driver not found');
      }
      
      return {
        success: true,
        data: {
          driver: result[0]
        }
      };
    } catch (error) {
      console.error('Error in getDriverById:', error);
      throw error;
    }
  }
  // Create new driver
  async createDriver(driverData) {
    try {
      const {
        name, phone, license_number, address
      } = driverData;
      
      const sql = `
        INSERT INTO drivers (name, phone, license_number, address) 
        VALUES (?, ?, ?, ?)
      `;
      
      const result = await apiService.query(sql, [
        name, phone, license_number, address
      ]);
      
      return {
        success: true,
        data: {
          id: result.lastInsertRowid
        }
      };
    } catch (error) {
      console.error('Error in createDriver:', error);
      throw error;
    }
  }

  // Update driver
  async updateDriver(id, driverData) {
    try {
      const fields = [];
      const values = [];
      
      for (const [key, value] of Object.entries(driverData)) {
        if (value !== undefined) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }
      
      if (fields.length === 0) {
        throw new Error('No data to update');
      }
      
      values.push(id);
      const sql = `UPDATE drivers SET ${fields.join(', ')} WHERE id = ?`;
      
      await apiService.query(sql, values);
      
      return {
        success: true,
        message: 'Driver updated successfully'
      };
    } catch (error) {
      console.error('Error in updateDriver:', error);
      throw error;
    }
  }

  // Search drivers
  async searchDrivers(searchTerm) {
    try {
      const term = `%${searchTerm}%`;
      const sql = `
        SELECT * FROM drivers 
        WHERE (name LIKE ? OR phone LIKE ? OR license_number LIKE ?)
        AND is_active = 1
        ORDER BY name
      `;
      
      const drivers = await apiService.query(sql, [term, term, term]);
      
      return {
        success: true,
        data: {
          drivers
        }
      };
    } catch (error) {
      console.error('Error in searchDrivers:', error);
      throw error;
    }
  }
  // Delete driver (soft delete using is_active column)
  async deleteDriver(id) {
    try {
      await this.updateDriver(id, { is_active: 0 });
      return {
        success: true,
        message: 'Driver deactivated successfully'
      };
    } catch (error) {
      console.error('Error in deleteDriver:', error);
      throw error;
    }
  }
}

export default new DriverService();
