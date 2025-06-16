import apiService from './apiService.js';

class LorryReceiptService {
  // Get all lorry receipts with filtering and pagination
  async getLorryReceipts(params = {}) {
    try {
      const { page = 1, limit = 10, consignorName, consigneeName, truckNumber } = params;        let sql = `
        SELECT lr.*, 
               cons_or.name as consignor_name, 
               cons_or.address as consignor_address,
               cons_or.city as consignor_city,
               cons_or.state as consignor_state,
               cons_or.gstin as consignor_gstin,
               cons_ee.name as consignee_name, 
               cons_ee.address as consignee_address,
               cons_ee.city as consignee_city,
               cons_ee.state as consignee_state,
               cons_ee.gstin as consignee_gstin,
               t.truck_number as truck_reg_number,
               t.truck_type, t.capacity_ton,
               d.name as driver_name, d.phone as driver_phone
        FROM lorry_receipts lr
        LEFT JOIN companies cons_or ON lr.consignor_id = cons_or.id
        LEFT JOIN companies cons_ee ON lr.consignee_id = cons_ee.id
        LEFT JOIN trucks t ON lr.truck_id = t.id
        LEFT JOIN drivers d ON lr.driver_id = d.id
        WHERE 1=1
      `;
      
      const queryParams = [];
        // Add search filters
      if (consignorName || consigneeName || truckNumber) {
        sql += ` AND (
          cons_or.name LIKE ? OR 
          cons_ee.name LIKE ? OR 
          lr.truck_number LIKE ? OR
          t.truck_number LIKE ?
        )`;
        const searchTerm = `%${consignorName || consigneeName || truckNumber}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }
      
      sql += ` ORDER BY lr.lr_date DESC, lr.created_at DESC`;
      
      // Add pagination
      const offset = (page - 1) * limit;
      sql += ` LIMIT ? OFFSET ?`;
      queryParams.push(limit, offset);
        // Get total count for pagination
      let countSql = `
        SELECT COUNT(*) as total
        FROM lorry_receipts lr
        LEFT JOIN companies cons_or ON lr.consignor_id = cons_or.id
        LEFT JOIN companies cons_ee ON lr.consignee_id = cons_ee.id
        LEFT JOIN trucks t ON lr.truck_id = t.id
        WHERE 1=1
      `;
      
      const countParams = [];
      if (consignorName || consigneeName || truckNumber) {
        countSql += ` AND (
          cons_or.name LIKE ? OR 
          cons_ee.name LIKE ? OR 
          lr.truck_number LIKE ? OR
          t.truck_number LIKE ?
        )`;
        const searchTerm = `%${consignorName || consigneeName || truckNumber}%`;
        countParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
      }
      
      const lorryReceipts = await apiService.query(sql, queryParams);
      const countResult = await apiService.query(countSql, countParams);
      const total = countResult[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);      // Transform data to match expected format
      const transformedReceipts = lorryReceipts.map(lr => ({
        _id: lr.id,
        lorryReceiptNumber: lr.lr_number,
        date: lr.lr_date,
        status: 'Created', // Default status since delivery_status doesn't exist yet
        consignor: {
          consignorName: lr.consignor_name,
          address: lr.consignor_address,
          city: lr.consignor_city,
          state: lr.consignor_state,
          gstin: lr.consignor_gstin
        },
        consignee: {
          consigneeName: lr.consignee_name,
          address: lr.consignee_address,
          city: lr.consignee_city,
          state: lr.consignee_state,
          gstin: lr.consignee_gstin
        },
        truckNumber: lr.truck_number || lr.truck_reg_number,
        driverName: lr.driver_name,
        driverPhone: lr.driver_phone,
        freight: lr.freight,
        particulars: lr.particulars,
        quantity: lr.quantity,
        unit: lr.unit,
        actualWeight: lr.actual_weight,
        chargedWeight: lr.charged_weight
      }));
      
      return {
        success: true,
        data: {
          lorryReceipts: transformedReceipts,
          totalPages,
          currentPage: page,
          total
        }
      };
    } catch (error) {
      console.error('Error in getLorryReceipts:', error);
      throw error;
    }
  }

  // Get lorry receipt by ID
  async getLorryReceiptById(id) {
    try {      const sql = `
        SELECT lr.*, 
               cons_or.name as consignor_name, 
               cons_or.address as consignor_address,
               cons_or.city as consignor_city,
               cons_or.state as consignor_state,
               cons_or.pin_code as consignor_pin_code,
               cons_or.gstin as consignor_gstin,
               cons_ee.name as consignee_name, 
               cons_ee.address as consignee_address,
               cons_ee.city as consignee_city,
               cons_ee.state as consignee_state,
               cons_ee.pin_code as consignee_pin_code,
               cons_ee.gstin as consignee_gstin,
               t.truck_number as truck_reg_number, t.truck_type, t.capacity_ton,
               d.name as driver_name, d.phone as driver_phone, d.license_number
        FROM lorry_receipts lr
        LEFT JOIN companies cons_or ON lr.consignor_id = cons_or.id
        LEFT JOIN companies cons_ee ON lr.consignee_id = cons_ee.id
        LEFT JOIN trucks t ON lr.truck_id = t.id
        LEFT JOIN drivers d ON lr.driver_id = d.id
        WHERE lr.id = ?
      `;
      
      const result = await apiService.query(sql, [id]);
      const lr = result[0];
      
      if (!lr) {
        throw new Error('Lorry receipt not found');
      }
        // Transform data to match expected format for the view modal
      const transformedReceipt = {
        _id: lr.id,
        lorryReceiptNumber: lr.lr_number,
        date: lr.lr_date,
        status: 'Created', // Default status since delivery_status doesn't exist yet
        fromLocation: lr.from_location,
        toLocation: lr.to_location,
          consignor: {
          consignorName: lr.consignor_name,
          address: lr.consignor_address,
          city: lr.consignor_city,
          state: lr.consignor_state,
          pinCode: lr.consignor_pin_code, // Using consignor pin code
          gstNumber: lr.consignor_gstin,
          contactNumber: null, // Not available in current schema
          email: null // Not available in current schema
        },
        consignee: {
          consigneeName: lr.consignee_name,
          address: lr.consignee_address,
          city: lr.consignee_city,
          state: lr.consignee_state,
          pinCode: lr.consignee_pin_code, // Using consignee pin code
          gstNumber: lr.consignee_gstin,
          contactNumber: null, // Not available in current schema
          email: null // Not available in current schema
        },
        
        truckDetails: {
          truckNumber: lr.truck_number || lr.truck_reg_number,
          vehicleType: lr.truck_type,
          loadType: lr.truck_type, // Using truck_type for now
          from: lr.from_location,
          driverName: lr.driver_name,
          driverMobile: lr.driver_phone,
          licenseNumber: lr.license_number,
          weightGuarantee: null // Not available in current schema
        },
        
        materialDetails: [{
          materialName: lr.particulars || 'General Goods',
          packagingType: lr.unit || 'Package',
          quantity: lr.quantity || 0,
          numberOfArticles: lr.quantity || 0,
          actualWeight: lr.actual_weight ? { value: lr.actual_weight, unit: 'Tons' } : null,
          chargedWeight: lr.charged_weight ? { value: lr.charged_weight, unit: 'Tons' } : null,
          freightRate: lr.freight ? { value: lr.freight, unit: 'per trip' } : null,
          hsnCode: null // Not available in current schema
        }],
        
        freightDetails: {
          freightType: lr.payment_type || 'TBB',
          freightPayBy: lr.service_tax_payable_by || 'Consignor',
          totalBasicFreight: lr.freight || 0,
          gstDetails: {
            applicableGST: 'N/A', // Not available in current schema
            gstAmount: 0 // Not calculated in current schema
          },
          subTotal: (lr.freight || 0) + (lr.hamali || 0) + (lr.aoc || 0) + (lr.door_delivery || 0) + (lr.collection || 0) + (lr.service_charge || 0) + (lr.extra_loading || 0),
          advanceDetails: {
            advanceReceived: 0, // Not available in current schema
            remainingFreight: (lr.freight || 0) + (lr.hamali || 0) + (lr.aoc || 0) + (lr.door_delivery || 0) + (lr.collection || 0) + (lr.service_charge || 0) + (lr.extra_loading || 0)
          },
          totalFreight: (lr.freight || 0) + (lr.hamali || 0) + (lr.aoc || 0) + (lr.door_delivery || 0) + (lr.collection || 0) + (lr.service_charge || 0) + (lr.extra_loading || 0),
          
          // Individual charges breakdown
          freight: lr.freight || 0,
          hamali: lr.hamali || 0,
          aoc: lr.aoc || 0,
          doorDelivery: lr.door_delivery || 0,
          collection: lr.collection || 0,
          serviceCharge: lr.service_charge || 0,
          extraLoading: lr.extra_loading || 0
        },
        
        invoiceAndEwayDetails: {
          invoiceDetails: lr.invoice_number ? [{
            invoiceNumber: lr.invoice_number,
            invoiceDate: lr.lr_date // Using LR date as invoice date for now
          }] : [],
          ewayBillDetails: {
            ewayBillNumber: lr.challan_number || null,
            ewayBillExpiryDate: null
          }
        },
        
        // Additional fields from database
        actualWeight: lr.actual_weight,
        chargedWeight: lr.charged_weight,
        particulars: lr.particulars,
        quantity: lr.quantity,
        unit: lr.unit,
        paymentType: lr.payment_type,
        goodsRisk: lr.goods_risk,
        deliveryAt: lr.delivery_at,        remarks: lr.remarks
      };
      
      return {
        success: true,
        data: {
          lorryReceipt: transformedReceipt
        }
      };
    } catch (error) {
      console.error('Error in getLorryReceiptById:', error);
      throw error;
    }
  }
  // Create new lorry receipt
  async createLorryReceipt(lrData) {
    try {
      // This will be implemented when the create functionality is needed
      console.log('Create LR data:', lrData); // Placeholder to avoid unused parameter warning
      throw new Error('Create functionality not implemented yet');
    } catch (error) {
      console.error('Error in createLorryReceipt:', error);
      throw error;
    }
  }

  // Update lorry receipt
  async updateLorryReceipt(id, lrData) {
    try {
      // This will be implemented when the edit functionality is needed
      console.log('Update LR:', id, lrData); // Placeholder to avoid unused parameter warning
      throw new Error('Update functionality not implemented yet');
    } catch (error) {
      console.error('Error in updateLorryReceipt:', error);
      throw error;
    }
  }

  // Delete lorry receipt
  async deleteLorryReceipt(id) {
    try {
      const sql = 'DELETE FROM lorry_receipts WHERE id = ?';
      await apiService.query(sql, [id]);
      
      return {
        success: true,
        message: 'Lorry receipt deleted successfully'
      };
    } catch (error) {
      console.error('Error in deleteLorryReceipt:', error);
      throw error;
    }
  }

  // Helper method to map delivery status to display status
  mapDeliveryStatus(deliveryStatus) {
    switch (deliveryStatus) {
      case 'pending':
        return 'Created';
      case 'in_transit':
        return 'In Transit';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Created';
    }
  }

  // Generate next LR number
  async generateNextLRNumber() {
    try {
      const sql = 'SELECT lr_number FROM lorry_receipts ORDER BY id DESC LIMIT 1';
      const result = await apiService.query(sql);
      
      if (result.length === 0) {
        return 'LR001';
      }
      
      const lastLRNumber = result[0].lr_number;
      const numberPart = parseInt(lastLRNumber.replace(/[^\d]/g, ''));
      const nextNumber = numberPart + 1;
      
      return `LR${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error('Error generating LR number:', error);
      return `LR${Date.now().toString().slice(-3)}`;
    }
  }
}

export default new LorryReceiptService();
