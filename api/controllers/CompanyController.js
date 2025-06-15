import Company from '../../database/models/Company.js';

class CompanyController {
  static async getAll(req, res) {
    try {
      const { active_only = 'true' } = req.query;
      const companies = Company.getAll(active_only === 'true');
      res.json({ success: true, data: companies });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const company = Company.findById(id);
      
      if (!company) {
        return res.status(404).json({ success: false, error: 'Company not found' });
      }
      
      res.json({ success: true, data: company });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const companyData = req.body;
      const result = Company.create(companyData);
      
      res.status(201).json({ 
        success: true, 
        data: { id: result.lastInsertRowid, ...companyData } 
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const result = Company.update(id, updateData);
      
      if (result.changes === 0) {
        return res.status(404).json({ success: false, error: 'Company not found' });
      }
      
      res.json({ success: true, message: 'Company updated successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      const result = Company.delete(id);
      
      if (result.changes === 0) {
        return res.status(404).json({ success: false, error: 'Company not found' });
      }
      
      res.json({ success: true, message: 'Company deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async search(req, res) {
    try {
      const { q: searchTerm } = req.query;
      
      if (!searchTerm) {
        return res.status(400).json({ success: false, error: 'Search term is required' });
      }
      
      const companies = Company.search(searchTerm);
      res.json({ success: true, data: companies });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getStats(req, res) {
    try {
      const stats = Company.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async activate(req, res) {
    try {
      const { id } = req.params;
      const result = Company.activate(id);
      
      if (result.changes === 0) {
        return res.status(404).json({ success: false, error: 'Company not found' });
      }
      
      res.json({ success: true, message: 'Company activated successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async deactivate(req, res) {
    try {
      const { id } = req.params;
      const result = Company.deactivate(id);
      
      if (result.changes === 0) {
        return res.status(404).json({ success: false, error: 'Company not found' });
      }
      
      res.json({ success: true, message: 'Company deactivated successfully' });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export default CompanyController;
