// API service for communicating with the Electron backend
class ApiService {
  constructor() {
    this.isElectron = window.electronAPI !== undefined;

    this.mockData = {
      companies: [
        { id: 1, name: "ABC Industries Ltd.", company_name: "ABC Industries Ltd.", address: "123 Industrial Area, Phase 1", city: "Mumbai", state: "Maharashtra", pin_code: "400001", gstin: "27ABCIN1234F1Z5", pan: "ABCIN1234F" },
        { id: 2, name: "XYZ Manufacturing Pvt. Ltd.", company_name: "XYZ Manufacturing Pvt. Ltd.", address: "456 Manufacturing Hub, Sector 10", city: "Delhi", state: "Delhi", pin_code: "110001", gstin: "07XYZMA1234C1Z8", pan: "XYZMA1234C" },
        { id: 3, name: "PQR Traders", company_name: "PQR Traders", address: "789 Trade Center, Main Road", city: "Ahmedabad", state: "Gujarat", pin_code: "380001", gstin: "24PQRTR1234G1Z9", pan: "PQRTR1234G" },
        { id: 4, name: "LMN Enterprises", company_name: "LMN Enterprises", address: "321 Business Park", city: "Pune", state: "Maharashtra", pin_code: "411001", gstin: "27LMNEN1234H1Z7", pan: "LMNEN1234H" },
        { id: 5, name: "RST Corporation", company_name: "RST Corporation", address: "654 Corporate Plaza", city: "Bangalore", state: "Karnataka", pin_code: "560001", gstin: "29RSTCO1234K1Z3", pan: "RSTCO1234K" },
        { id: 6, name: "Global Textiles Inc.", company_name: "Global Textiles Inc.", address: "987 Textile Zone", city: "Surat", state: "Gujarat", pin_code: "395001", gstin: "24GLTEX1234M1Z1", pan: "GLTEX1234M" }
      ],
      lorryReceipts: [],
      quotations: [
        {
          id: 1,
          quotation_number: "QUO-2024001",
          quotation_date: "2024-12-01",
          company_id: 1,
          company_name: "ABC Industries Ltd.",
          company_location: "Mumbai",
          to_user: "ABC Industries Ltd.",
          destinations_json: '[{"destination":"Mumbai","freight":15000},{"destination":"Pune","freight":15500}]',
          created_at: "2025-08-10T09:40:50.000Z",
          updated_at: "2025-08-10T09:40:50.000Z"
        },
        {
          id: 2,
          quotation_number: "QUO-2024002",
          quotation_date: "2024-12-02",
          company_id: 2,
          company_name: "XYZ Manufacturing Pvt. Ltd.",
          company_location: "Delhi",
          to_user: "XYZ Manufacturing Pvt. Ltd.",
          destinations_json: '[{"destination":"Bangalore","freight":12000},{"destination":"Chennai","freight":12500}]',
          created_at: "2025-08-10T09:40:50.000Z",
          updated_at: "2025-08-10T09:40:50.000Z"
        }
        // Add more sample quotations as needed
      ],
      memos: [] // <-- Add this line to initialize memos
    };
    const savedLRs = localStorage.getItem('lorryReceipts');
    if (savedLRs) {
      try {
        this.mockData.lorryReceipts = JSON.parse(savedLRs);
      } catch (e) {
        // ignore parse error
      }
    }
  }

  // Database operations through Electron or browser fallback
  async query(sql, params = []) {
    if (this.isElectron) {
      const result = await window.electronAPI.query(sql, params);
      // For SELECT queries, unwrap the .data property for backward compatibility
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        if (result && result.success && Array.isArray(result.data)) {
          return result.data;
        } else if (Array.isArray(result)) {
          return result;
        } else {
          return [];
        }
      }
      return result;
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
        // params: [quotationNumber, quotationDate, companyId, toUser, fromLocation, toLocation, freightUpto8mt, destinationsJson, createdAt, updatedAt]
        const newQuotation = {
          id: id,
          quotation_number: params[0],
          quotation_date: params[1],
          company_id: params[2],
          to_user: params[3],
          from_location: params[4],
          to_location: params[5],
          freight_upto_8mt: params[6],
          destinations_json: params[7],
          created_at: params[8],
          updated_at: params[9]
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
            company_id, from_location, to_location,
            validity_days, expiry_date, demurrage_rate_per_day, demurrage_remark,
            terms_conditions
          ] = params;
          
          this.mockData.quotations[quotationIndex] = {
            ...this.mockData.quotations[quotationIndex],
            company_id, from_location, to_location, trip_type,
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
      
  // ...existing code...
      
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

      pay_by, driver_cash_required,
      validity_days, expiry_date, demurrage_rate_per_day,
      demurrage_remark, terms_conditions, status, created_by
    } = quotationData;
    
    return await this.query(
      `INSERT INTO quotations (
        quotation_number, quotation_date, company_id, from_location, to_location,

        pay_by, driver_cash_required,
        validity_days, expiry_date, demurrage_rate_per_day,
        demurrage_remark, terms_conditions, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        quotation_number, quotation_date, company_id, from_location, to_location,
        trip_type,
        pay_by, driver_cash_required,
        validity_days, expiry_date, demurrage_rate_per_day,
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
