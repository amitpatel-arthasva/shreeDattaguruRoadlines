import apiService from './apiService.js';
import { generateQuotationPdf } from './pdfService.js';

class QuotationService {
  // Get all quotations with pagination and filters
  async getQuotations(filters = {}) {
    try {
      const { page = 1, limit = 10, ...otherFilters } = filters;
      const offset = (page - 1) * limit;
      
      const sql = `
        SELECT q.*, 
               c.name as company_name, c.address as company_address,
               c.city as company_city, c.state as company_state,
               c.pin_code as company_pin_code, c.gstin as company_gstin,
               c.pan as company_pan,
               u.name as created_by_name
        FROM quotations q
        LEFT JOIN companies c ON q.company_id = c.id
        LEFT JOIN users u ON q.created_by = u.id
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
               c.name as company_name, c.address as company_address,
               c.city as company_city, c.state as company_state,
               c.pin_code as company_pin_code, c.gstin as company_gstin,
               c.pan as company_pan,
               u.name as created_by_name
        FROM quotations q
        LEFT JOIN companies c ON q.company_id = c.id
        LEFT JOIN users u ON q.created_by = u.id
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
      // Generate quotation number
      const quotationNumber = await this.generateQuotationNumber();
      
      // Calculate expiry date if validity_days is provided
      let expiryDate = null;
      if (quotationData.quotationValidity?.validUpTo?.type === 'Days') {
        const validityDays = quotationData.quotationValidity.validUpTo.value || 30;
        expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + validityDays);
        expiryDate = expiryDate.toISOString().split('T')[0];
      } else if (quotationData.quotationValidity?.validUpTo?.type === 'Date') {
        expiryDate = quotationData.quotationValidity.validUpTo.value;
      }

      // Prepare material details as JSON
      const materialDetails = quotationData.materialDetails ? 
        JSON.stringify(quotationData.materialDetails) : null;

      // Calculate total freight with GST
      const rateValue = parseFloat(quotationData.freightBreakup?.rate?.value || 0);
      const gstPercentage = parseFloat(quotationData.freightBreakup?.applicableGST?.replace('%', '') || 18);
      const totalFreightWithGst = rateValue * (1 + gstPercentage / 100);

      const sql = `
        INSERT INTO quotations (
          quotation_number, quotation_date, company_id, from_location, to_location,
          load_type, trip_type, material_details, rate_per_ton, rate_type,
          applicable_gst, total_freight_with_gst, pay_by, driver_cash_required,
          payment_remark, validity_days, expiry_date, demurrage_rate_per_day,
          demurrage_remark, terms_conditions, status, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        quotationNumber,
        quotationData.quotationDate || new Date().toISOString().split('T')[0],
        quotationData.quoteToCompany?.companyId,
        quotationData.tripDetails?.from,
        quotationData.tripDetails?.to,
        quotationData.tripDetails?.fullOrPartLoad || 'Full Load',
        quotationData.tripDetails?.tripType || 'One Way',
        materialDetails,
        rateValue,
        quotationData.freightBreakup?.rate?.type || 'Per Ton',
        quotationData.freightBreakup?.applicableGST || '18%',
        totalFreightWithGst,
        quotationData.paymentTerms?.payBy || 'Consignee',
        parseFloat(quotationData.paymentTerms?.driverCashRequired || 0),
        quotationData.paymentTerms?.paymentRemark,
        quotationData.quotationValidity?.validUpTo?.value || 30,
        expiryDate,
        parseFloat(quotationData.demurrageDetails?.demurrageRatePerDay || 0),
        quotationData.demurrageDetails?.demurrageRemark,
        quotationData.termsAndConditions,
        'Active',
        1 // created_by - assuming user ID 1 for now
      ];

      const result = await apiService.query(sql, params);
      
      if (result && result.changes > 0) {
        // Get the created quotation with full details
        const newQuotation = await this.getQuotationById(result.lastInsertRowid);
        return {
          success: true,
          data: newQuotation.data.quotation,
          message: 'Quotation created successfully'
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

  // Update quotation
  async updateQuotation(id, quotationData) {
    try {
      // Calculate expiry date if validity_days is provided
      let expiryDate = null;
      if (quotationData.quotationValidity?.validUpTo?.type === 'Days') {
        const validityDays = quotationData.quotationValidity.validUpTo.value || 30;
        expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + validityDays);
        expiryDate = expiryDate.toISOString().split('T')[0];
      } else if (quotationData.quotationValidity?.validUpTo?.type === 'Date') {
        expiryDate = quotationData.quotationValidity.validUpTo.value;
      }

      // Prepare material details as JSON
      const materialDetails = quotationData.materialDetails ? 
        JSON.stringify(quotationData.materialDetails) : null;

      // Calculate total freight with GST
      const rateValue = parseFloat(quotationData.freightBreakup?.rate?.value || 0);
      const gstPercentage = parseFloat(quotationData.freightBreakup?.applicableGST?.replace('%', '') || 18);
      const totalFreightWithGst = rateValue * (1 + gstPercentage / 100);

      const fields = [];
      const params = [];

      // Add fields to update
      Object.keys(quotationData).forEach(key => {
        if (quotationData[key] !== undefined && key !== 'id') {
          fields.push(`${key} = ?`);
          params.push(quotationData[key]);
        }
      });

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      params.push(id);
      const sql = `UPDATE quotations SET ${fields.join(', ')} WHERE id = ?`;
      
      const result = await apiService.query(sql, params);
      
      if (result && result.changes > 0) {
        // Get the updated quotation with full details
        const updatedQuotation = await this.getQuotationById(id);
        return {
          success: true,
          data: updatedQuotation.data.quotation,
          message: 'Quotation updated successfully'
        };
      } else {
        throw new Error('Failed to update quotation');
      }
    } catch (error) {
      console.error('Error in updateQuotation:', error);
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

  // Generate quotation PDF
  async generateQuotationPdf(quotationId) {
    try {
      const response = await this.getQuotationById(quotationId);
      if (!response.success) {
        throw new Error('Failed to fetch quotation data');
      }

      const quotation = response.data.quotation;
      return await generateQuotationPdf(quotation);
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
      throw error;
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
    // Parse material details from JSON
    let materialDetails = [];
    try {
      if (dbQuotation.material_details) {
        materialDetails = JSON.parse(dbQuotation.material_details);
      }
    } catch (error) {
      console.error('Error parsing material details:', error);
    }

    return {
      _id: dbQuotation.id,
      quotationNumber: dbQuotation.quotation_number,
      quotationDate: dbQuotation.quotation_date,
      createdAt: dbQuotation.created_at,
      updatedAt: dbQuotation.updated_at,
      
      // Company details
      quoteToCompany: {
        companyId: dbQuotation.company_id,
        companyName: dbQuotation.company_name,
        address: dbQuotation.company_address,
        city: dbQuotation.company_city,
        state: dbQuotation.company_state,
        pinCode: dbQuotation.company_pin_code,
        gstNumber: dbQuotation.company_gstin,
        panNumber: dbQuotation.company_pan
      },
      
      // Trip details
      tripDetails: {
        from: dbQuotation.from_location,
        to: dbQuotation.to_location,
        fullOrPartLoad: dbQuotation.load_type,
        tripType: dbQuotation.trip_type
      },
      
      // Material details
      materialDetails: materialDetails,
      
      // Freight breakup
      freightBreakup: {
        rate: {
          value: dbQuotation.rate_per_ton,
          type: dbQuotation.rate_type
        },
        applicableGST: dbQuotation.applicable_gst,
        totalFreightWithGst: dbQuotation.total_freight_with_gst
      },
      
      // Payment terms
      paymentTerms: {
        payBy: dbQuotation.pay_by,
        driverCashRequired: dbQuotation.driver_cash_required,
        paymentRemark: dbQuotation.payment_remark
      },
      
      // Quotation validity
      quotationValidity: {
        validUpTo: {
          type: dbQuotation.expiry_date ? 'Date' : 'Days',
          value: dbQuotation.expiry_date || dbQuotation.validity_days
        },
        expiryDate: dbQuotation.expiry_date
      },
      
      // Demurrage details
      demurrageDetails: {
        demurrageRatePerDay: dbQuotation.demurrage_rate_per_day,
        demurrageRemark: dbQuotation.demurrage_remark
      },
      
      // Terms and conditions
      termsAndConditions: dbQuotation.terms_conditions,
      
      // Status
      status: dbQuotation.status,
      
      // Created by
      createdBy: dbQuotation.created_by_name
    };
  }
}

export default new QuotationService(); 