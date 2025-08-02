import apiService from './apiService.js';

class CompanyService {  // Get all companies with filtering and pagination
  async getCompanies(params = {}) {
    try {
      const { page = 1, limit = 10, search, activeOnly = true } = params;
      
      let sql = `
        SELECT * FROM companies 
        WHERE is_active = 1
      `;
      const queryParams = [];
      
      // Add search filters
      if (search) {
        sql += ` AND (
          name LIKE ? OR 
          city LIKE ? OR 
          state LIKE ? OR
          gstin LIKE ? OR 
          pan LIKE ?
        )`;
        const searchTerm = `%${search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
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
      
      const companies = await apiService.query(sql, queryParams);
      
      return {
        success: true,
        data: {
          companies,
          totalPages,
          currentPage: page,
          total
        }
      };
    } catch (error) {
      console.error('Error in getCompanies:', error);
      throw error;
    }
  }

  // Get companies optimized for list views (to prevent width issues)
  async getCompaniesForList() {
    try {
      const sql = 'SELECT id, name, city, state, gstin, pan FROM companies WHERE is_active = 1 ORDER BY name';
      
      const companies = await apiService.query(sql);
      return {
        success: true,
        data: {
          companies
        }
      };
    } catch (error) {
      console.error('Error in getCompaniesForList:', error);
      throw error;
    }
  }

  // Get company by ID
  async getCompanyById(id) {
    try {
      const sql = 'SELECT * FROM companies WHERE id = ?';
      const result = await apiService.query(sql, [id]);
      
      if (result.length === 0) {
        throw new Error('Company not found');
      }
      
      return {
        success: true,
        data: {
          company: result[0]
        }
      };
    } catch (error) {
      console.error('Error in getCompanyById:', error);
      throw error;
    }
  }  // Create new company
  async createCompany(companyData) {
    try {
      const {
        name, address, city, state, pin_code, gstin, pan
      } = companyData;
      
      const sql = `
        INSERT INTO companies (name, address, city, state, pin_code, gstin, pan) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const result = await apiService.query(sql, [name, address, city, state, pin_code, gstin, pan]);
      
      return {
        success: true,
        data: {
          id: result.lastInsertRowid
        }
      };
    } catch (error) {
      console.error('Error in createCompany:', error);
      throw error;
    }
  }
  // Update company
  async updateCompany(id, companyData) {
    try {
      const fields = [];
      const values = [];
      
      for (const [key, value] of Object.entries(companyData)) {
        if (value !== undefined) {
          fields.push(`${key} = ?`);
          values.push(value);
        }
      }
      
      if (fields.length === 0) {
        throw new Error('No data to update');
      }
      
      values.push(id);
      const sql = `UPDATE companies SET ${fields.join(', ')} WHERE id = ?`;
      
      await apiService.query(sql, values);
      
      return {
        success: true,
        message: 'Company updated successfully'
      };
    } catch (error) {
      console.error('Error in updateCompany:', error);
      throw error;
    }
  }  // Search companies
  async searchCompanies(searchTerm) {
    try {
      const term = `%${searchTerm}%`;
      const sql = `
        SELECT * FROM companies 
        WHERE is_active = 1 AND (name LIKE ? OR address LIKE ? OR gstin LIKE ?)
        ORDER BY name
      `;
      
      const companies = await apiService.query(sql, [term, term, term]);
      
      return {
        success: true,
        data: {
          companies
        }
      };
    } catch (error) {
      console.error('Error in searchCompanies:', error);
      throw error;
    }
  }
  // Delete company (soft delete using is_active column)
  async deleteCompany(id) {
    try {
      const sql = 'UPDATE companies SET is_active = 0 WHERE id = ?';
      const result = await apiService.query(sql, [id]);
      
      if (result.changes === 0) {
        throw new Error('Company not found');
      }
      
      return {
        success: true,
        message: 'Company deactivated successfully'
      };
    } catch (error) {
      console.error('Error in deleteCompany:', error);
      throw error;
    }
  }
}

export default new CompanyService();
