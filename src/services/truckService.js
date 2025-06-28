import apiService from './apiService.js';

class TruckService {  // Get all trucks with filtering and pagination
  async getTrucks(params = {}) {
    try {
      const { page = 1, limit = 10, search, activeOnly = true } = params;
      console.log('Getting trucks, activeOnly parameter:', activeOnly); // Avoid unused parameter warning
      
      let sql = `
        SELECT * FROM trucks 
        WHERE is_active = 1
      `;
      const queryParams = [];
      
      // Add search filters
      if (search) {
        sql += ` AND (
          truck_number LIKE ? OR 
          truck_type LIKE ? OR 
          owner_name LIKE ?
        )`;
        const searchTerm = `%${search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
      }
      
      sql += ` ORDER BY truck_number`;
      
      // Get total count for pagination
      let countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
      const countResult = await apiService.query(countSql, queryParams);
      const total = countResult[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);
      
      // Add pagination
      const offset = (page - 1) * limit;
      sql += ` LIMIT ? OFFSET ?`;
      queryParams.push(limit, offset);
      
      const trucks = await apiService.query(sql, queryParams);
      
      return {
        success: true,
        data: {
          trucks,
          totalPages,
          currentPage: page,
          total
        }
      };
    } catch (error) {
      console.error('Error in getTrucks:', error);
      throw error;
    }
  }

  // Get truck by ID
  async getTruckById(id) {
    try {
      const sql = 'SELECT * FROM trucks WHERE id = ?';
      const result = await apiService.query(sql, [id]);
      
      if (result.length === 0) {
        throw new Error('Truck not found');
      }
      
      return {
        success: true,
        data: {
          truck: result[0]
        }
      };
    } catch (error) {
      console.error('Error in getTruckById:', error);
      throw error;
    }
  }
  // Create new truck
  async createTruck(truckData) {
    try {
      const {
        truck_number, truck_type, capacity_ton, owner_name
      } = truckData;
      
      const sql = `
        INSERT INTO trucks (truck_number, truck_type, capacity_ton, owner_name) 
        VALUES (?, ?, ?, ?)
      `;
      
      const result = await apiService.query(sql, [
        truck_number, truck_type, capacity_ton, owner_name
      ]);
      
      return {
        success: true,
        data: {
          id: result.lastInsertRowid
        }
      };
    } catch (error) {
      console.error('Error in createTruck:', error);
      throw error;
    }
  }

  // Update truck
  async updateTruck(id, truckData) {
    try {
      const fields = [];
      const values = [];
      
      for (const [key, value] of Object.entries(truckData)) {
        if (value !== undefined) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }
      
      if (fields.length === 0) {
        throw new Error('No data to update');
      }
      
      values.push(id);
      const sql = `UPDATE trucks SET ${fields.join(', ')} WHERE id = ?`;
      
      await apiService.query(sql, values);
      
      return {
        success: true,
        message: 'Truck updated successfully'
      };
    } catch (error) {
      console.error('Error in updateTruck:', error);
      throw error;
    }
  }
  // Search trucks
  async searchTrucks(searchTerm) {
    try {
      const term = `%${searchTerm}%`;
      const sql = `
        SELECT * FROM trucks 
        WHERE is_active = 1 AND (truck_number LIKE ? OR truck_type LIKE ? OR owner_name LIKE ?)
        ORDER BY truck_number
      `;
      
      const trucks = await apiService.query(sql, [term, term, term]);
      
      return {
        success: true,
        data: {
          trucks
        }
      };
    } catch (error) {
      console.error('Error in searchTrucks:', error);
      throw error;
    }
  }
  // Delete truck (soft delete using is_active column)
  async deleteTruck(id) {
    try {
      const sql = 'UPDATE trucks SET is_active = 0 WHERE id = ?';
      const result = await apiService.query(sql, [id]);
      
      if (result.changes === 0) {
        throw new Error('Truck not found');
      }
      
      return {
        success: true,
        message: 'Truck deactivated successfully'
      };
    } catch (error) {
      console.error('Error in deleteTruck:', error);
      throw error;
    }
  }
}

export default new TruckService();
