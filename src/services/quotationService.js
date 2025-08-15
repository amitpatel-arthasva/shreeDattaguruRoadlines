import apiService from './apiService.js';
import { generateQuotationPdf } from './pdfService.js';

class QuotationService {
  // Fill dummy quotation data for testing
  async fillDummyQuotation() {
    try {
      // Ensure dummy company exists and get its ID
      const companyName = 'Dummy Company';
      const companyLocation = 'Dummy Location';
      let companyId;
      const companies = await apiService.query('SELECT * FROM companies WHERE name = ?', [companyName]);
      if (companies && companies.length > 0) {
        companyId = companies[0].id;
      } else {
        const insertResult = await apiService.query(
          'INSERT INTO companies (name, address, city, is_active) VALUES (?, ?, ?, 1)',
          [companyName, companyLocation, companyLocation]
        );
        companyId = insertResult.lastInsertRowid;
      }
      const dummyData = {
        quotationNumber: 'DUMMY-001',
        quotationDate: new Date().toISOString().split('T')[0],
        quoteToCompany: {
          companyName,
          companyLocation
        },
        companyId,
        toUser: 'Dummy User',
        destinations: [
          { destination: 'Dummy Destination 1', freight: 100 },
          { destination: 'Dummy Destination 2', freight: 200 }
        ]
      };
      const result = await this.createQuotation(dummyData);
      if (result.success) {
        console.log('Dummy quotation created:', result.data);
        return { success: true, message: 'Dummy quotation created', data: result.data };
      } else {
        console.error('Failed to create dummy quotation:', result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error('Error in fillDummyQuotation:', err);
      return { success: false, error: err.message };
    }
  }
  // Update quotation by id
  async updateQuotation(quotationId, quotationData) {
    try {
      // Prepare destinations_json from quotationData.destinations (array of {destination, freight})
      let destinationsJson = '[]';
      if (Array.isArray(quotationData.destinations) && quotationData.destinations.length > 0) {
        destinationsJson = JSON.stringify(
          quotationData.destinations.map(d => ({
            destination: d.destination || d.to || '',
            freight: d.freight || d.rate || 0
          }))
        );
      }

      // Ensure companyId is set and update company details if needed
      let companyId = quotationData.companyId;
      let companyName = quotationData.companyName;
      let companyLocation = quotationData.location || '';
      let companyCity = quotationData.city || '';
      let companyAddress = quotationData.address || companyLocation || '';

      // Fetch the existing quotation for fallback values
      const existingQuotationResp = await this.getQuotationById(quotationId);
      const existingQuotation = (existingQuotationResp && existingQuotationResp.success && existingQuotationResp.data.quotation) ? existingQuotationResp.data.quotation : {};

      // If companyId is not provided, get it from the existing quotation
      if (!companyId) {
        companyId = existingQuotation.companyId;
      }

      // If still not found, try to find company by name
      if (!companyId && companyName) {
        const inputName = companyName.trim().toLowerCase();
        const companies = await apiService.query('SELECT * FROM companies');
        let foundCompany = null;
        for (const c of companies) {
          if ((c.name || '').trim().toLowerCase() === inputName) {
            foundCompany = c;
            break;
          }
        }
        if (foundCompany) {
          companyId = foundCompany.id;
          // If location/city/address changed, update company record
          const updateFields = [];
          const updateValues = [];
          if (companyLocation && companyLocation !== foundCompany.address) {
            updateFields.push('address = ?');
            updateValues.push(companyLocation);
          }
          if (companyCity && companyCity !== foundCompany.city) {
            updateFields.push('city = ?');
            updateValues.push(companyCity);
          }
          if (updateFields.length > 0) {
            await apiService.query(
              `UPDATE companies SET ${updateFields.join(', ')} WHERE id = ?`,
              [...updateValues, companyId]
            );
          }
        } else {
          // Create new company if not found
          const insertResult = await apiService.query(
            'INSERT INTO companies (name, address, city, is_active) VALUES (?, ?, ?, 1)',
            [companyName, companyLocation, companyCity]
          );
          companyId = insertResult.lastInsertRowid;
        }
      }
      if (!companyId) {
        throw new Error('Company ID could not be determined.');
      }

      // Ensure required fields are set, fallback to existing quotation
      const finalCompanyName = companyName || existingQuotation.companyName || '';
      const finalCompanyLocation = companyLocation || existingQuotation.location || '';
      const finalToUser = quotationData.toUser || existingQuotation.toUser || '';
      const finalQuotationNumber = quotationData.quotationNumber || existingQuotation.quotationNumber || '';
      const finalQuotationDate = quotationData.quotationDate || existingQuotation.quotationDate || new Date().toISOString().split('T')[0];

      const sql = `UPDATE quotations SET quotation_number = ?, quotation_date = ?, company_id = ?, q_company_name = ?, company_location = ?, to_user = ?, destinations_json = ?, updated_at = ? WHERE id = ?`;
      const values = [
        finalQuotationNumber,
        finalQuotationDate,
        companyId,
        finalCompanyName,
        finalCompanyLocation,
        finalToUser,
        destinationsJson,
        new Date().toISOString(),
        quotationId
      ];
      console.log('[updateQuotation] SQL:', sql);
      console.log('[updateQuotation] Values:', values);
      const result = await apiService.query(sql, values);
      console.log('[updateQuotation] SQL result:', result);
      if (result && result.changes > 0) {
        // Get the updated quotation with full details
        const updatedQuotation = await this.getQuotationById(quotationId);
        return {
          success: true,
          data: updatedQuotation.data.quotation,
          message: 'Quotation updated successfully',
          shouldRefresh: true
        };
      } else {
        return {
          success: false,
          error: 'No rows updated. Quotation not found or no changes.'
        };
      }
    } catch (error) {
      console.error('Error in updateQuotation:', error);
      return {
        success: false,
        error: error.message || 'Failed to update quotation'
      };
    }
  }
  // Get all quotations with pagination and filters
  async getQuotations(filters = {}) {
    try {
      const { page = 1, limit = 10, ...otherFilters } = filters;
      const offset = (page - 1) * limit;
      
      const sql = `
        SELECT q.*, 
               q.q_company_name as quotation_company_name,
               c.name as company_name, c.address as company_address,
               c.city as company_city, c.state as company_state,
               c.pin_code as company_pin_code, c.gstin as company_gstin,
               c.pan as company_pan
        FROM quotations q
        LEFT JOIN companies c ON q.company_id = c.id
        WHERE 1=1
      `;
      
      const params = [];
      let whereConditions = '';

      if (otherFilters.companyName) {
        whereConditions += ' AND c.name LIKE ?';
        params.push(`%${otherFilters.companyName}%`);
      }

      if (otherFilters.status) {
        whereConditions += ' AND q.status = ?';
        params.push(otherFilters.status);
      }

      if (otherFilters.fromDate) {
        whereConditions += ' AND q.quotation_date >= ?';
        params.push(otherFilters.fromDate);
      }

      if (otherFilters.toDate) {
        whereConditions += ' AND q.quotation_date <= ?';
        params.push(otherFilters.toDate);
      }

      // Get total count
      const countSql = `SELECT COUNT(*) as total FROM quotations q LEFT JOIN companies c ON q.company_id = c.id WHERE 1=1${whereConditions}`;
      const countResult = await apiService.query(countSql, params);
      const total = countResult[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);

      // Get paginated results
      const finalSql = sql + whereConditions + ' ORDER BY q.quotation_date DESC, q.created_at DESC LIMIT ? OFFSET ?';
      const finalParams = [...params, limit, offset];
      
      const quotations = await apiService.query(finalSql, finalParams);
      
      // Transform data to match frontend expectations
    const transformedQuotations = quotations.map(q => this.transformQuotationData(q));

      return {
        success: true,
        data: {
          quotations: transformedQuotations,
          totalPages,
          currentPage: page,
          total
        }
      };
    } catch (error) {
      console.error('Error in getQuotations:', error);
      throw error;
    }
  }

  // Get quotation by ID
  async getQuotationById(id) {
    try {
      const sql = `
        SELECT q.*, 
               q.q_company_name as quotation_company_name,
               q.company_location as quotation_company_location,
               c.name as company_name, c.address as company_address,
               c.city as company_city, c.state as company_state,
               c.pin_code as company_pin_code, c.gstin as company_gstin,
               c.pan as company_pan
        FROM quotations q
        LEFT JOIN companies c ON q.company_id = c.id
        WHERE q.id = ?
      `;
      
      const result = await apiService.query(sql, [id]);
      
      if (result.length === 0) {
        throw new Error('Quotation not found');
      }

      const quotation = result[0];
      const transformedQuotation = this.transformQuotationData(quotation);
      return {
        success: true,
        data: {
          quotation: transformedQuotation
        }
      };
    } catch (error) {
      console.error('Error in getQuotationById:', error);
      throw error;
    }
  }

  // Create new quotation
  async createQuotation(quotationData) {
    try {
      console.log('[createQuotation] Received data:', JSON.stringify(quotationData, null, 2));
      // Use provided quotation number or generate one
      let quotationNumber = (quotationData.quotationNumber && quotationData.quotationNumber.trim()) ? quotationData.quotationNumber.trim() : await this.generateQuotationNumber();

      // Company logic: check if company exists by name, create if not
      let companyName = quotationData.quoteToCompany?.companyName?.trim();
      let companyLocation = quotationData.quoteToCompany?.companyLocation?.trim();
      let companyId = quotationData.quoteToCompany?.companyId;
      if (!companyName) throw new Error('Company name is required');

      // Try to find company by name
      let company = null;
  const companies = await apiService.query('SELECT * FROM companies WHERE name = ?', [companyName]);
      if (companies && companies.length > 0) {
        company = companies[0];
        companyId = company.id;
        if (!companyLocation) companyLocation = company.address || company.city || '';
      } else {
        // Create new company
        const insertResult = await apiService.query(
          'INSERT INTO companies (name, address, city, is_active) VALUES (?, ?, ?, 1)',
          [companyName, companyLocation || '', companyLocation || '']
        );
        companyId = insertResult.lastInsertRowid;
      }

      // Prepare destinations_json from quotationData.destinations (array of {destination, freight})
      let destinationsJson = '[]';
      if (Array.isArray(quotationData.destinations) && quotationData.destinations.length > 0) {
        destinationsJson = JSON.stringify(
          quotationData.destinations.map(d => ({
            destination: d.destination || d.to || '',
            freight: d.freight || d.rate || 0
          }))
        );
      }

      // Insert into quotations table with new columns
      const sql = `
        INSERT INTO quotations (
          quotation_number, quotation_date, company_id, q_company_name, company_location, to_user, destinations_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const params = [
        quotationNumber,
        quotationData.quotationDate || new Date().toISOString().split('T')[0],
        companyId,
        companyName,
        companyLocation || '',
        quotationData.toUser || '',
        destinationsJson,
        new Date().toISOString(),
        new Date().toISOString()
      ];

      const result = await apiService.query(sql, params);

      console.log('[createQuotation] SQL:', sql);
      console.log('[createQuotation] Params:', params);
      console.log('[createQuotation] SQL result:', result);
      if (result && result.changes > 0) {
        // Get the created quotation with full details
        const newQuotation = await this.getQuotationById(result.lastInsertRowid);
        return {
          success: true,
          data: newQuotation.data.quotation,
          message: 'Quotation created successfully',
          shouldRefresh: true // Signal to frontend to refresh list
        };
      } else {
        throw new Error('Failed to create quotation');
      }
    } catch (error) {
      console.error('Error in createQuotation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Delete quotation
  async deleteQuotation(id) {
    try {
      const sql = 'DELETE FROM quotations WHERE id = ?';
      const result = await apiService.query(sql, [id]);
      
      if (result && result.changes > 0) {
        return {
          success: true,
          message: 'Quotation deleted successfully'
        };
      } else {
        throw new Error('Quotation not found or already deleted');
      }
    } catch (error) {
      console.error('Error in deleteQuotation:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate quotation PDF using the actual React view HTML for pixel-perfect match
  async generateQuotationPdf(quotationId) {
    try {
      const response = await this.getQuotationById(quotationId);
      if (!response.success) {
        throw new Error('Failed to fetch quotation data');
      }
      const quotation = response.data.quotation;
      // Always use the backend template for PDF generation (matches your sample)
      if (window.electronAPI && window.electronAPI.generateQuotationPdf) {
        return await window.electronAPI.generateQuotationPdf(quotation);
      } else {
        // Fallback to template-based PDF generation in browser
        return await generateQuotationPdf(quotation);
      }
    } catch (error) {
      console.error('Error in generateQuotationPdf:', error);
      throw error;
    }
  }

  // Generate quotation number
  async generateQuotationNumber() {
    try {
      const prefix = 'QUO';
      const year = new Date().getFullYear();
      const sql = `
        SELECT quotation_number 
        FROM quotations 
        WHERE quotation_number LIKE '${prefix}${year}%' 
        ORDER BY quotation_number DESC 
        LIMIT 1
      `;
      
      const result = await apiService.query(sql);
      if (result.length === 0) {
        return `${prefix}${year}001`;
      }
      
      const lastNumber = result[0].quotation_number;
      const sequence = parseInt(lastNumber.slice(-3)) + 1;
      return `${prefix}${year}${sequence.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error('Error in generateQuotationNumber:', error);
      // Fallback number generation
      const prefix = 'QUO';
      const year = new Date().getFullYear();
      const timestamp = Date.now().toString().slice(-3);
      return `${prefix}${year}${timestamp}`;
    }
  }

  // Get quotation statistics
  async getQuotationStats() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as total_quotations,
          COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_quotations,
          COUNT(CASE WHEN status = 'Expired' THEN 1 END) as expired_quotations,
          COUNT(CASE WHEN status = 'Accepted' THEN 1 END) as accepted_quotations,
          COUNT(CASE WHEN status = 'Rejected' THEN 1 END) as rejected_quotations,
          AVG(total_freight_with_gst) as avg_freight,
          SUM(total_freight_with_gst) as total_freight_value
        FROM quotations
      `;
      
      const result = await apiService.query(sql);
      return {
        success: true,
        data: result[0] || {}
      };
    } catch (error) {
      console.error('Error in getQuotationStats:', error);
      throw error;
    }
  }

  // Transform database data to frontend format
  transformQuotationData(dbQuotation) {
    // Only use fields present in the minimal quotations schema
    let destinations = [];
    if (dbQuotation.destinations_json) {
      try {
        destinations = JSON.parse(dbQuotation.destinations_json);
      } catch (e) {
        destinations = [];
      }
    }
    return {
      _id: dbQuotation.id,
      quotationNumber: dbQuotation.quotation_number,
      quotationDate: dbQuotation.quotation_date,
      createdAt: dbQuotation.created_at,
      updatedAt: dbQuotation.updated_at,
      // Ensure 'date' is always mapped to quotation_date for frontend
      date: dbQuotation.quotation_date || dbQuotation.date || dbQuotation.created_at,
      companyId: dbQuotation.company_id,
      companyName: dbQuotation.quotation_company_name || dbQuotation.company_name,
      location: dbQuotation.company_location || dbQuotation.from_location,
      toUser: dbQuotation.to_user,
      kindAtten: dbQuotation.to_user,
      destinations: destinations,
      freightUpto8mt: dbQuotation.freight_upto_8mt
    };
  }
}

export default new QuotationService(); 