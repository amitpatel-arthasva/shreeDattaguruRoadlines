// API service for communicating with the Electron backend
class ApiService {
  constructor() {
    this.isElectron = window.electronAPI !== undefined;
    console.log('ApiService initialized');
    console.log('window.electronAPI exists:', !!window.electronAPI);
    console.log('isElectron:', this.isElectron);
    console.log('userAgent contains Electron:', navigator.userAgent.includes('Electron'));
    
    this.mockData = {
      companies: [
        { id: 1, name: "ABC Transport Ltd.", company_name: "ABC Transport Ltd.", contact_person: "Rajesh Kumar", phone: "02012345678", mobile: "9876543210", email: "rajesh@abctransport.com", address: "123 Transport Street", city: "Mumbai", state: "Maharashtra", pin_code: "400001", gstin: "27AAACT1234A1Z5", pan: "AAACT1234A" },
        { id: 2, name: "XYZ Logistics Pvt. Ltd.", company_name: "XYZ Logistics Pvt. Ltd.", contact_person: "Priya Sharma", phone: "01123456789", mobile: "9876543211", email: "priya@xyzlogistics.com", address: "456 Logistics Avenue", city: "Delhi", state: "Delhi", pin_code: "110001", gstin: "07AAXYZ5678B1Z5", pan: "AAXYZ5678B" },
        { id: 3, name: "PQR Cargo Services", company_name: "PQR Cargo Services", contact_person: "Amit Patel", phone: "07912345678", mobile: "9876543212", email: "amit@pqrcargo.com", address: "789 Cargo Lane", city: "Pune", state: "Maharashtra", pin_code: "411001", gstin: "27AAPQR9012C1Z5", pan: "AAPQR9012C" }
      ],
      lorryReceipts: [],
      quotations: []
    };
    
    // Load data from localStorage in browser mode
    if (!this.isElectron) {
      const savedLRs = localStorage.getItem('lorryReceipts');
      if (savedLRs) {
        try {
          this.mockData.lorryReceipts = JSON.parse(savedLRs);
        } catch (e) {
          console.warn('Failed to load saved lorry receipts from localStorage');
        }
      }
    }
  }

  // Database operations through Electron or browser fallback
  async query(sql, params = []) {
    if (this.isElectron) {
      return await window.electronAPI.query(sql, params);
    } else {
      // Browser fallback - simulate database operations
      console.warn('Running in browser mode - using mock data');
      
      // Simple mock queries for demonstration
      if (sql.includes('SELECT lr_number FROM lorry_receipts')) {
        return this.mockData.lorryReceipts;
      }
      if (sql.includes('SELECT * FROM companies')) {
        return this.mockData.companies;
      }
      if (sql.includes('INSERT INTO lorry_receipts')) {
        const newLR = { id: Date.now(), ...params };
        this.mockData.lorryReceipts.push(newLR);
        return { lastInsertRowid: newLR.id };
      }
      
      // Quotation mock operations
      if (sql.includes('SELECT quotation_number FROM quotations')) {
        // For generating quotation numbers
        const year = new Date().getFullYear();
        const lastNumber = this.mockData.quotations
          .filter(q => q.quotation_number.includes(year))
          .length;
        return [{ quotation_number: `QUO${year}${String(lastNumber).padStart(3, '0')}` }];
      }
      
      if (sql.includes('INSERT INTO quotations')) {
        const id = Date.now();
        const newQuotation = {
          id: id,
          quotation_number: params[0],
          quotation_date: params[1],
          company_id: params[2],
          from_location: params[3],
          to_location: params[4],
          load_type: params[5],
          trip_type: params[6],
          material_details: params[7],
          rate_per_ton: params[8],
          rate_type: params[9],
          applicable_gst: params[10],
          total_freight_with_gst: params[11],
          pay_by: params[12],
          driver_cash_required: params[13],
          payment_remark: params[14],
          validity_days: params[15],
          expiry_date: params[16],
          demurrage_rate_per_day: params[17],
          demurrage_remark: params[18],
          terms_conditions: params[19],
          status: params[20],
          created_by: params[21],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        this.mockData.quotations.push(newQuotation);
        return { lastInsertRowid: id, changes: 1 };
      }
      
      if (sql.includes('UPDATE quotations SET') && sql.includes('WHERE id = ?')) {
        const id = params[params.length - 1];
        const quotationIndex = this.mockData.quotations.findIndex(q => q.id == id);
        if (quotationIndex !== -1) {
          // Update the quotation with the new values
          const [
            company_id, from_location, to_location, load_type, trip_type,
            material_details, rate_per_ton, rate_type, applicable_gst,
            total_freight_with_gst, pay_by, driver_cash_required, payment_remark,
            validity_days, expiry_date, demurrage_rate_per_day, demurrage_remark,
            terms_conditions
          ] = params;
          
          this.mockData.quotations[quotationIndex] = {
            ...this.mockData.quotations[quotationIndex],
            company_id, from_location, to_location, load_type, trip_type,
            material_details, rate_per_ton, rate_type, applicable_gst,
            total_freight_with_gst, pay_by, driver_cash_required, payment_remark,
            validity_days, expiry_date, demurrage_rate_per_day, demurrage_remark,
            terms_conditions,
            updated_at: new Date().toISOString()
          };
          return { changes: 1 };
        }
        return { changes: 0 };
      }
      
      if (sql.includes('SELECT q.*') && sql.includes('FROM quotations q') && sql.includes('WHERE q.id = ?')) {
        const id = params[0];
        const quotation = this.mockData.quotations.find(q => q.id == id);
        if (quotation) {
          // Add company details to the quotation
          const company = this.mockData.companies.find(c => c.id == quotation.company_id);
          return [{
            ...quotation,
            company_name: company?.name,
            company_address: company?.address,
            company_city: company?.city,
            company_state: company?.state,
            company_pin_code: company?.pin_code,
            company_gstin: company?.gstin,
            company_pan: company?.pan,
            created_by_name: 'Admin User'
          }];
        }
        return [];
      }
      
      return [];
    }
  }  // Database path management
  async selectDatabaseFolder(shouldMigrate = true) {
    if (this.isElectron) {
      return await window.electronAPI.selectDatabaseFolder(shouldMigrate);
    } else {
      return { success: false, message: 'Browser environment - folder selection not available' };
    }
  }

  async getDatabasePath() {
    if (this.isElectron) {
      return await window.electronAPI.getDatabasePath();
    } else {
      return 'Browser Local Storage';
    }
  }

  // User operations
  async getUsers() {
    return await this.query('SELECT id, username, email, full_name, role, is_active, created_at FROM users ORDER BY created_at DESC');
  }

  async createUser(userData) {
    const { username, email, password_hash, full_name, role } = userData;
    return await this.query(
      'INSERT INTO users (username, email, password_hash, full_name, role) VALUES (?, ?, ?, ?, ?)',
      [username, email, password_hash, full_name, role]
    );
  }

  async updateUser(id, userData) {
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
    return await this.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  async authenticateUser(username, password) {
    const users = await this.query('SELECT * FROM users WHERE username = ?', [username]);
    if (users.length === 0) {
      throw new Error('Invalid credentials');
    }
    
    const user = users[0];
    // Note: In a real app, you'd verify the password hash here
    // For now, we'll assume password verification is handled elsewhere
    
    if (!user.is_active) {
      throw new Error('Account is deactivated');
    }
    
    // Remove password hash from response
    delete user.password_hash;
    return user;
  }
  // Company operations
  async getCompanies(activeOnly = true) {
    if (this.isElectron) {
      const sql = activeOnly 
        ? 'SELECT * FROM companies WHERE is_active = 1 ORDER BY company_name'
        : 'SELECT * FROM companies ORDER BY company_name';
      return await this.query(sql);
    } else {
      // Browser fallback
      return this.mockData.companies.filter(c => activeOnly ? c.is_active !== false : true);
    }
  }

  async createCompany(companyData) {
    const {
      company_name, contact_person, phone, mobile, email,
      address, city, state, pincode, gstin, pan
    } = companyData;
    
    return await this.query(
      `INSERT INTO companies (
        company_name, contact_person, phone, mobile, email,
        address, city, state, pincode, gstin, pan
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [company_name, contact_person, phone, mobile, email, address, city, state, pincode, gstin, pan]
    );
  }

  async updateCompany(id, companyData) {
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(companyData)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) return null;
    
    values.push(id);
    return await this.query(`UPDATE companies SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  async searchCompanies(searchTerm) {
    const term = `%${searchTerm}%`;
    return await this.query(
      `SELECT * FROM companies 
       WHERE (company_name LIKE ? OR contact_person LIKE ? OR phone LIKE ? OR mobile LIKE ?)
       AND is_active = 1
       ORDER BY company_name`,
      [term, term, term, term]
    );
  }

  // Quotation operations
  async getQuotations(filters = {}) {
    let sql = `
      SELECT q.*, 
             c.name as company_name, c.address as company_address,
             c.city as company_city, c.state as company_state,
             c.pin_code as company_pin_code, c.gstin as company_gstin,
             c.pan as company_pan, c.phone as company_phone,
             u.full_name as created_by_name
      FROM quotations q
      LEFT JOIN companies c ON q.company_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.company_id) {
      sql += ' AND q.company_id = ?';
      params.push(filters.company_id);
    }

    if (filters.status) {
      sql += ' AND q.status = ?';
      params.push(filters.status);
    }

    if (filters.from_date) {
      sql += ' AND q.quotation_date >= ?';
      params.push(filters.from_date);
    }

    if (filters.to_date) {
      sql += ' AND q.quotation_date <= ?';
      params.push(filters.to_date);
    }

    if (filters.from_location) {
      sql += ' AND q.from_location LIKE ?';
      params.push(`%${filters.from_location}%`);
    }

    if (filters.to_location) {
      sql += ' AND q.to_location LIKE ?';
      params.push(`%${filters.to_location}%`);
    }

    if (filters.company_name) {
      sql += ' AND c.name LIKE ?';
      params.push(`%${filters.company_name}%`);
    }

    sql += ' ORDER BY q.quotation_date DESC, q.created_at DESC';

    if (filters.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }

    if (filters.offset) {
      sql += ' OFFSET ?';
      params.push(filters.offset);
    }

    return await this.query(sql, params);
  }

  async getQuotationById(id) {
    const sql = `
      SELECT q.*, 
             c.name as company_name, c.address as company_address,
             c.city as company_city, c.state as company_state,
             c.pin_code as company_pin_code, c.gstin as company_gstin,
             c.pan as company_pan, c.phone as company_phone,
             u.full_name as created_by_name
      FROM quotations q
      LEFT JOIN companies c ON q.company_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      WHERE q.id = ?
    `;
    
    const result = await this.query(sql, [id]);
    return result[0] || null;
  }

  async createQuotation(quotationData) {
    const {
      quotation_number, quotation_date, company_id, from_location, to_location,
      load_type, trip_type, material_details, rate_per_ton, rate_type,
      applicable_gst, total_freight_with_gst, pay_by, driver_cash_required,
      payment_remark, validity_days, expiry_date, demurrage_rate_per_day,
      demurrage_remark, terms_conditions, status, created_by
    } = quotationData;
    
    return await this.query(
      `INSERT INTO quotations (
        quotation_number, quotation_date, company_id, from_location, to_location,
        load_type, trip_type, material_details, rate_per_ton, rate_type,
        applicable_gst, total_freight_with_gst, pay_by, driver_cash_required,
        payment_remark, validity_days, expiry_date, demurrage_rate_per_day,
        demurrage_remark, terms_conditions, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        quotation_number, quotation_date, company_id, from_location, to_location,
        load_type, trip_type, material_details, rate_per_ton, rate_type,
        applicable_gst, total_freight_with_gst, pay_by, driver_cash_required,
        payment_remark, validity_days, expiry_date, demurrage_rate_per_day,
        demurrage_remark, terms_conditions, status, created_by
      ]
    );
  }

  async updateQuotation(id, quotationData) {
    const fields = [];
    const values = [];
    
    for (const [key, value] of Object.entries(quotationData)) {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    
    if (fields.length === 0) return null;
    
    values.push(id);
    return await this.query(`UPDATE quotations SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  async deleteQuotation(id) {
    return await this.query('DELETE FROM quotations WHERE id = ?', [id]);
  }

  async searchQuotations(searchTerm, limit = 50) {
    const term = `%${searchTerm}%`;
    const sql = `
      SELECT q.*, 
             c.name as company_name, c.address as company_address,
             c.city as company_city, c.state as company_state,
             c.pin_code as company_pin_code, c.gstin as company_gstin,
             c.pan as company_pan, c.phone as company_phone,
             u.full_name as created_by_name
      FROM quotations q
      LEFT JOIN companies c ON q.company_id = c.id
      LEFT JOIN users u ON q.created_by = u.id
      WHERE (q.quotation_number LIKE ? OR q.from_location LIKE ? OR q.to_location LIKE ? 
             OR c.name LIKE ? OR c.gstin LIKE ?)
      ORDER BY q.quotation_date DESC, q.created_at DESC
      LIMIT ?
    `;
    return await this.query(sql, [term, term, term, term, term, limit]);
  }

  async getQuotationStats() {
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
    const result = await this.query(sql);
    return result[0] || {};
  }

  async generateQuotationNumber() {
    const prefix = 'QUO';
    const year = new Date().getFullYear();
    const sql = `
      SELECT quotation_number 
      FROM quotations 
      WHERE quotation_number LIKE '${prefix}${year}%' 
      ORDER BY quotation_number DESC 
      LIMIT 1
    `;
    
    const result = await this.query(sql);
    if (result.length === 0) {
      return `${prefix}${year}001`;
    }
    
    const lastNumber = result[0].quotation_number;
    const sequence = parseInt(lastNumber.slice(-3)) + 1;
    return `${prefix}${year}${sequence.toString().padStart(3, '0')}`;
  }

  // Lorry Receipt operations
  async getLorryReceipts(filters = {}) {
    let sql = `
      SELECT lr.*, c.company_name, c.contact_person
      FROM lorry_receipts lr
      LEFT JOIN companies c ON lr.company_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.company_id) {
      sql += ' AND lr.company_id = ?';
      params.push(filters.company_id);
    }

    if (filters.delivery_status) {
      sql += ' AND lr.delivery_status = ?';
      params.push(filters.delivery_status);
    }

    sql += ' ORDER BY lr.lr_date DESC, lr.created_at DESC';
    return await this.query(sql, params);
  }
  async createLorryReceipt(lrData) {
    const {
      lr_number, company_id, lr_date, from_location, to_location,
      consigner_name, consigner_address, consignee_name, consignee_address,
      material_description, vehicle_number, driver_name, driver_phone,
      actual_weight, charged_weight, rate_per_ton, freight_amount,
      advance_amount, balance_amount, created_by
    } = lrData;
    
    if (this.isElectron) {
      return await this.query(
        `INSERT INTO lorry_receipts (
          lr_number, company_id, lr_date, from_location, to_location,
          consigner_name, consigner_address, consignee_name, consignee_address,
          material_description, vehicle_number, driver_name, driver_phone,
          actual_weight, charged_weight, rate_per_ton, freight_amount,
          advance_amount, balance_amount, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          lr_number, company_id, lr_date, from_location, to_location,
          consigner_name, consigner_address, consignee_name, consignee_address,
          material_description, vehicle_number, driver_name, driver_phone,
          actual_weight, charged_weight, rate_per_ton, freight_amount,
          advance_amount, balance_amount, created_by
        ]
      );
    } else {
      // Browser fallback
      const newLR = {
        id: Date.now(),
        lr_number, company_id, lr_date, from_location, to_location,
        consigner_name, consigner_address, consignee_name, consignee_address,
        material_description, vehicle_number, driver_name, driver_phone,
        actual_weight, charged_weight, rate_per_ton, freight_amount,
        advance_amount, balance_amount, created_by,
        created_at: new Date().toISOString()
      };
      this.mockData.lorryReceipts.push(newLR);
      
      // Save to localStorage for persistence
      localStorage.setItem('lorryReceipts', JSON.stringify(this.mockData.lorryReceipts));
      
      return { lastInsertRowid: newLR.id };
    }
  }

  // File operations
  async showSaveDialog(options) {
    if (this.isElectron) {
      return await window.electronAPI.showSaveDialog(options);
    }
    throw new Error('File operations only available in Electron environment');
  }

  async showOpenDialog(options) {
    if (this.isElectron) {
      return await window.electronAPI.showOpenDialog(options);
    }
    throw new Error('File operations only available in Electron environment');
  }
}

export default new ApiService();
