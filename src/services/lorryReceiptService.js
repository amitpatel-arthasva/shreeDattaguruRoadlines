import apiService from './apiService.js';

class LorryReceiptService {
  // Get all lorry receipts with filtering and pagination
  async getLorryReceipts(params = {}) {
    try {
      const { page = 1, limit = 10, search } = params;

      let sql = `
        SELECT lr.*, 
               cons_or.name as consignor_name, 
               cons_or.address as consignor_address,
               cons_or.city as consignor_city,
               cons_or.state as consignor_state,
               cons_or.pin_code as consignor_pincode,
               cons_or.gstin as consignor_gstin,
               cons_or.pan as consignor_pan,
               cons_ee.name as consignee_name, 
               cons_ee.address as consignee_address,
               cons_ee.city as consignee_city,
               cons_ee.state as consignee_state,
               cons_ee.pin_code as consignee_pincode,
               cons_ee.gstin as consignee_gstin,
               cons_ee.pan as consignee_pan,
               t.truck_number as truck_reg_number,
               t.truck_type, t.capacity_ton, t.owner_name,
               d.name as driver_name, d.phone as driver_phone, d.license_number
        FROM lorry_receipts lr
        LEFT JOIN companies cons_or ON lr.consignor_id = cons_or.id
        LEFT JOIN companies cons_ee ON lr.consignee_id = cons_ee.id
        LEFT JOIN trucks t ON lr.truck_id = t.id
        LEFT JOIN drivers d ON lr.driver_id = d.id
        WHERE 1=1
      `;
      
      const queryParams = [];      // Add search filters
      if (search) {
        sql += ` AND (
          cons_or.name LIKE ? OR 
          cons_ee.name LIKE ? OR 
          lr.truck_number LIKE ? OR
          t.truck_number LIKE ? OR
          lr.cn_number LIKE ?
        )`;
        const searchTerm = `%${search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
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
      if (search) {
        countSql += ` AND (
          cons_or.name LIKE ? OR 
          cons_ee.name LIKE ? OR 
          lr.truck_number LIKE ? OR
          t.truck_number LIKE ? OR
          lr.cn_number LIKE ?
        )`;
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }
      
      const lorryReceipts = await apiService.query(sql, queryParams);
      const countResult = await apiService.query(countSql, countParams);
      const total = countResult[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);      // Transform data to match expected format
      const transformedReceipts = lorryReceipts.map(lr => {
        // Parse JSON fields safely
        let nosArray = [];
        let particularsArray = [];
        
        try {
          if (lr.nos && lr.nos !== 'null' && lr.nos.trim() !== '') {
            nosArray = JSON.parse(lr.nos);
          }
        } catch (error) {
          console.warn('Failed to parse nos JSON:', lr.nos, error);
          nosArray = [];
        }
        
        try {
          if (lr.particulars && lr.particulars !== 'null' && lr.particulars.trim() !== '') {
            particularsArray = JSON.parse(lr.particulars);
          }
        } catch (error) {
          console.warn('Failed to parse particulars JSON:', lr.particulars, error);
          particularsArray = [];
        }

        return {
          _id: lr.id,
          lorryReceiptNumber: lr.cn_number, // Using cn_number
          date: lr.lr_date,
          status: 'Created', // Default status
          consignor: {
            consignorName: lr.consignor_name,
            address: lr.consignor_address,
            city: lr.consignor_city,
            state: lr.consignor_state,
            pinCode: lr.consignor_pincode,
            gstin: lr.consignor_gstin,
            pan: lr.consignor_pan
          },
          consignee: {
            consigneeName: lr.consignee_name,
            address: lr.consignee_address,
            city: lr.consignee_city,
            state: lr.consignee_state,
            pinCode: lr.consignee_pincode,
            gstin: lr.consignee_gstin,
            pan: lr.consignee_pan
          },
          truckNumber: lr.truck_number || lr.truck_reg_number,
          driverName: lr.driver_name,
          driverPhone: lr.driver_phone,
          ewayBill: lr.eway_bill,
          fromLocation: lr.from_location,
          toLocation: lr.to_location,
          freight: lr.freight,
          total: lr.total,
          paymentType: lr.payment_type,
          // Store parsed arrays
          nos: nosArray,
          particulars: particularsArray
        };
      });
      
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
  }  // Get lorry receipt by ID
  async getLorryReceiptById(id) {
    try {
      
      const sql = `
        SELECT lr.*, 
               cons_or.name as consignor_name, 
               cons_or.address as consignor_address,
               cons_or.city as consignor_city,
               cons_or.state as consignor_state,
               cons_or.pin_code as consignor_pin_code,
               cons_or.gstin as consignor_gstin,
               cons_or.pan as consignor_pan,
               cons_ee.name as consignee_name, 
               cons_ee.address as consignee_address,
               cons_ee.city as consignee_city,
               cons_ee.state as consignee_state,
               cons_ee.pin_code as consignee_pin_code,
               cons_ee.gstin as consignee_gstin,
               cons_ee.pan as consignee_pan,
               t.truck_number as truck_reg_number, 
               t.truck_type, t.capacity_ton, t.owner_name,
               d.name as driver_name, d.phone as driver_phone, d.license_number, d.address as driver_address
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

      let nosArray = [];
      let particularsArray = [];
      
      try {
        if (lr.nos && lr.nos !== 'null' && lr.nos.trim() !== '') {
          nosArray = JSON.parse(lr.nos);
        }
      } catch (error) {
        console.warn('Failed to parse nos JSON:', lr.nos, error);
        nosArray = [];
      }
      
      try {
        if (lr.particulars && lr.particulars !== 'null' && lr.particulars.trim() !== '') {
          particularsArray = JSON.parse(lr.particulars);
        }
      } catch (error) {
        console.warn('Failed to parse particulars JSON:', lr.particulars, error);
        particularsArray = [];
      }

      // Transform data to match expected format for the view modal
      const transformedReceipt = {
        _id: lr.id,
        lorryReceiptNumber: lr.cn_number, // Using cn_number
        date: lr.lr_date,
        status: 'Created', // Default status
        fromLocation: lr.from_location,
        toLocation: lr.to_location,
        createdAt: lr.created_at,
        updatedAt: lr.updated_at,

        // Add the IDs needed for editing
        consignor_id: lr.consignor_id,
        consignee_id: lr.consignee_id,
        truck_id: lr.truck_id,
        driver_id: lr.driver_id,

        consignor: {
          consignorName: lr.consignor_name,
          address: lr.consignor_address,
          city: lr.consignor_city,
          state: lr.consignor_state,
          pinCode: lr.consignor_pin_code,
          gstNumber: lr.consignor_gstin,
          pan: lr.consignor_pan,
          contactNumber: null, // Not available in current schema
          email: null // Not available in current schema
        },
        consignee: {
          consigneeName: lr.consignee_name,
          address: lr.consignee_address,
          city: lr.consignee_city,
          state: lr.consignee_state,
          pinCode: lr.consignee_pin_code,
          gstNumber: lr.consignee_gstin,
          pan: lr.consignee_pan,
          contactNumber: null, // Not available in current schema
          email: null // Not available in current schema
        },
        
        truckDetails: {
          truckNumber: lr.truck_number || lr.truck_reg_number,
          vehicleType: lr.truck_type,
          loadType: lr.truck_type, // Using truck_type for now
          from: lr.from_location,
          to: lr.to_location,
          capacity: lr.capacity_ton,
          ownerName: lr.owner_name,
          driverName: lr.driver_name,
          driverMobile: lr.driver_phone,
          driverAddress: lr.driver_address,
          licenseNumber: lr.license_number
        },
        
        // Material details from JSON arrays
        materialDetails: nosArray.map((nos, index) => ({
          nos: nos,
          particulars: particularsArray[index] || '',
          actualWeight: lr.actual_weight ? { value: lr.actual_weight, unit: 'Tons' } : null,
          chargedWeight: lr.chargeable_weight ? { value: lr.chargeable_weight, unit: 'Tons' } : null
        })),
        
        freightDetails: {
          freight: lr.freight || 0,
          hamali: lr.hamali || 0,
          aoc: lr.aoc || 0,
          doorDelivery: lr.door_delivery || 0,
          detention: lr.detention || 0,
          collection: lr.collection || 0,
          stCharge: lr.st_charge || 0,
          extraLoading: lr.extra_loading || 0,
          total: lr.total || 0,
          paymentType: lr.payment_type
        },
        
        // Additional fields from database
        actualWeight: lr.actual_weight,
        chargeableWeight: lr.chargeable_weight,
        deliveryAt: lr.delivery_at,
        ewayBill: lr.eway_bill,
        remarks: lr.remarks,
        notes: lr.remarks, // Using remarks as notes for compatibility
        paymentType: lr.payment_type
      };
      
      
      return {
        success: true,
        data: transformedReceipt
      };
    } catch (error) {
      console.error('Error in getLorryReceiptById:', error);
      throw error;
    }  }

  // Create new lorry receipt
  async createLorryReceipt(lrData) {    try {
      
      // Generate CN number based on from location
      let cnPrefix = '';
      if (lrData.from_location) {
        const fromLocation = lrData.from_location.toLowerCase();
        if (fromLocation.includes('tarapur')) {
          cnPrefix = 'TPR';
        } else if (fromLocation.includes('bhiwandi')) {
          cnPrefix = 'BWD';
        } else {
          // Default prefix for other locations
          cnPrefix = 'LR';
        }
      } else {
        cnPrefix = 'LR';
      }
      
      // Get next CN number
      const cnResult = await this.getNextCnNumber(cnPrefix);
      if (!cnResult.success) {
        throw new Error('Failed to generate CN number');
      }
      
      const cnNumber = `${cnPrefix}-${String(cnResult.data.nextNumber).padStart(3, '0')}`;
      
        const sql = `
        INSERT INTO lorry_receipts (
          cn_number, truck_number, lr_date, to_location, from_location,
          consignor_id, consignee_id, truck_id, driver_id,
          nos, particulars,
          freight, hamali, aoc, door_delivery,detention, collection, st_charge, extra_loading,
          actual_weight, chargeable_weight,
          payment_type, delivery_at, eway_bill, total, remarks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;      const params = [
        cnNumber, // Auto-generated CN number
        lrData.truck_number,
        lrData.lr_date,
        lrData.to_location,
        lrData.from_location,
        lrData.consignor_id,
        lrData.consignee_id,
        lrData.truck_id || null,
        lrData.driver_id || null,
        lrData.nos, // Already JSON string
        lrData.particulars, // Already JSON string
        lrData.freight || 0,
        lrData.hamali || 0,
        lrData.aoc || 0,
        lrData.door_delivery || 0,
        lrData.detention || 0,
        lrData.collection || 0,
        lrData.st_charge || 0,
        lrData.extra_loading || 0,
        lrData.actual_weight || 0,
        lrData.chargeable_weight || 0,
        lrData.payment_type || 'paid',
        lrData.delivery_at,
        lrData.eway_bill || '',
        lrData.total || 0,
        lrData.remarks || ''
      ];

      const result = await apiService.query(sql, params);
      
      if (result && result.changes > 0) {
        // Get the created lorry receipt with company details
        const newLR = await this.getLorryReceiptById(result.lastInsertRowid);
        return {
          success: true,
          data: newLR.data,
          message: 'Lorry receipt created successfully'
        };
      } else {
        throw new Error('Failed to create lorry receipt');
      }
    } catch (error) {
      console.error('Error in createLorryReceipt:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update lorry receipt
  async updateLorryReceipt(id, lrData) {
    try {
      const sql = `
        UPDATE lorry_receipts SET
          truck_number = ?,
          lr_date = ?,
          to_location = ?,
          from_location = ?,
          consignor_id = ?,
          consignee_id = ?,
          truck_id = ?,
          driver_id = ?,
          nos = ?,
          particulars = ?,
          freight = ?,
          hamali = ?,
          aoc = ?,
          door_delivery = ?,
          detention=?,
          collection = ?,
          st_charge = ?,
          extra_loading = ?,
          actual_weight = ?,
          chargeable_weight = ?,
          payment_type = ?,
          delivery_at = ?,
          eway_bill = ?,
          total = ?,
          remarks = ?
        WHERE id = ?
      `;

      const params = [
        lrData.truck_number,
        lrData.date,
        lrData.to,
        lrData.from,
        lrData.consignor_id,
        lrData.consignee_id,
        lrData.truck_id || null,
        lrData.driver_id || null,
        lrData.nos, // Already JSON string
        lrData.particulars, // Already JSON string
        lrData.freight || 0,
        lrData.hamali || 0,
        lrData.aoc || 0,
        lrData.door_delivery || 0,
        lrData.detention || 0,
        lrData.collection || 0,
        lrData.st_charge || 0,
        lrData.extra_loading || 0,
        lrData.actual_weight || 0,
        lrData.chargeable_weight || 0,
        lrData.payment_type || 'paid',
        lrData.delivery_at,
        lrData.eway_bill || '',
        lrData.total || 0,
        lrData.remarks || '',
        id
      ];

      const result = await apiService.query(sql, params);
      
      if (result && result.changes > 0) {
        // Get the updated lorry receipt with company details
        const updatedLR = await this.getLorryReceiptById(id);
        return {
          success: true,
          data: updatedLR.data,
          message: 'Lorry receipt updated successfully'
        };
      } else {
        throw new Error('Failed to update lorry receipt');
      }
    } catch (error) {
      console.error('Error in updateLorryReceipt:', error);
      return {
        success: false,
        error: error.message
      };
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

  // Generate next CN number based on prefix (TPR or BWD)
  async getNextCnNumber(prefix) {
    try {
      const sql = 'SELECT cn_number FROM lorry_receipts WHERE cn_number LIKE ? ORDER BY id DESC LIMIT 1';
      const result = await apiService.query(sql, [`${prefix}-%`]);
      
      if (result.length === 0) {
        return { success: true, data: { nextNumber: 1 } };
      }
      
      const lastCnNumber = result[0].cn_number;
      const numberPart = parseInt(lastCnNumber.split('-')[1]);
      const nextNumber = numberPart + 1;
      
      return { success: true, data: { nextNumber } };
    } catch (error) {
      console.error('Error generating CN number:', error);
      return { success: false, error: 'Failed to generate CN number' };
    }
  }
}

export default new LorryReceiptService();
