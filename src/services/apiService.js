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
        { id: 1, company_name: "ABC Transport Ltd.", contact_person: "Rajesh Kumar", phone: "02012345678", mobile: "9876543210", email: "rajesh@abctransport.com" },
        { id: 2, company_name: "XYZ Logistics Pvt. Ltd.", contact_person: "Priya Sharma", phone: "01123456789", mobile: "9876543211", email: "priya@xyzlogistics.com" },
        { id: 3, company_name: "PQR Cargo Services", contact_person: "Amit Patel", phone: "07912345678", mobile: "9876543212", email: "amit@pqrcargo.com" }
      ],
      lorryReceipts: []
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
      SELECT q.*, c.company_name, c.contact_person
      FROM quotations q
      LEFT JOIN companies c ON q.company_id = c.id
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

    sql += ' ORDER BY q.quotation_date DESC, q.created_at DESC';
    return await this.query(sql, params);
  }

  async createQuotation(quotationData) {
    const {
      quotation_number, company_id, quotation_date, from_location, to_location,
      material_description, vehicle_type, rate_per_ton, minimum_guarantee_weight,
      validity_days, terms_conditions, created_by
    } = quotationData;
    
    return await this.query(
      `INSERT INTO quotations (
        quotation_number, company_id, quotation_date, from_location, to_location,
        material_description, vehicle_type, rate_per_ton, minimum_guarantee_weight,
        validity_days, terms_conditions, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        quotation_number, company_id, quotation_date, from_location, to_location,
        material_description, vehicle_type, rate_per_ton, minimum_guarantee_weight,
        validity_days, terms_conditions, created_by
      ]
    );
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
