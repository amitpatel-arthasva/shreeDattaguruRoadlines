import LorryReceipt from '../database/models/LorryReceipt.js';

class LorryReceiptController {
  // Create a new lorry receipt
  static async create(req, res) {
    try {
      const lrData = req.body;
      
      // Validate required fields
      const requiredFields = ['lr_number', 'lr_date', 'from_location', 'to_location', 'consignor_id', 'consignee_id'];
      const missingFields = requiredFields.filter(field => !lrData[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      const result = LorryReceipt.create(lrData);
      
      res.status(201).json({
        success: true,
        message: 'Lorry receipt created successfully',
        data: { id: result.lastInsertRowid, ...lrData }
      });
    } catch (error) {
      console.error('Error creating lorry receipt:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create lorry receipt',
        error: error.message
      });
    }
  }

  // Get all lorry receipts with optional filtering
  static async getAll(req, res) {
    try {
      const filters = req.query;
      const receipts = LorryReceipt.getAll(filters);
      
      res.json({
        success: true,
        data: receipts,
        count: receipts.length
      });
    } catch (error) {
      console.error('Error fetching lorry receipts:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch lorry receipts',
        error: error.message
      });
    }
  }

  // Get a specific lorry receipt by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const receipt = LorryReceipt.findById(id);
      
      if (!receipt) {
        return res.status(404).json({
          success: false,
          message: 'Lorry receipt not found'
        });
      }
      
      res.json({
        success: true,
        data: receipt
      });
    } catch (error) {
      console.error('Error fetching lorry receipt:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch lorry receipt',
        error: error.message
      });
    }
  }

  // Get a specific lorry receipt by LR number
  static async getByNumber(req, res) {
    try {
      const { lr_number } = req.params;
      const receipt = LorryReceipt.findByNumber(lr_number);
      
      if (!receipt) {
        return res.status(404).json({
          success: false,
          message: 'Lorry receipt not found'
        });
      }
      
      res.json({
        success: true,
        data: receipt
      });
    } catch (error) {
      console.error('Error fetching lorry receipt:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch lorry receipt',
        error: error.message
      });
    }
  }

  // Update a lorry receipt
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Check if receipt exists
      const existingReceipt = LorryReceipt.findById(id);
      if (!existingReceipt) {
        return res.status(404).json({
          success: false,
          message: 'Lorry receipt not found'
        });
      }
      
      LorryReceipt.update(id, updateData);
      const updatedReceipt = LorryReceipt.findById(id);
      
      res.json({
        success: true,
        message: 'Lorry receipt updated successfully',
        data: updatedReceipt
      });
    } catch (error) {
      console.error('Error updating lorry receipt:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update lorry receipt',
        error: error.message
      });
    }
  }

  // Delete a lorry receipt
  static async delete(req, res) {
    try {
      const { id } = req.params;
      
      // Check if receipt exists
      const existingReceipt = LorryReceipt.findById(id);
      if (!existingReceipt) {
        return res.status(404).json({
          success: false,
          message: 'Lorry receipt not found'
        });
      }
      
      LorryReceipt.delete(id);
      
      res.json({
        success: true,
        message: 'Lorry receipt deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting lorry receipt:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete lorry receipt',
        error: error.message
      });
    }
  }

  // Get next LR number
  static async getNextLRNumber(req, res) {
    try {
      const nextNumber = LorryReceipt.getNextLRNumber();
      
      res.json({
        success: true,
        data: { lr_number: nextNumber }
      });
    } catch (error) {
      console.error('Error generating LR number:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate LR number',
        error: error.message
      });
    }
  }

  // Get totals by date range
  static async getTotalsByDateRange(req, res) {
    try {
      const { fromDate, toDate } = req.query;
      
      if (!fromDate || !toDate) {
        return res.status(400).json({
          success: false,
          message: 'fromDate and toDate are required'
        });
      }
      
      const totals = LorryReceipt.getTotalsByDateRange(fromDate, toDate);
      
      res.json({
        success: true,
        data: totals
      });
    } catch (error) {
      console.error('Error fetching totals:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch totals',
        error: error.message
      });
    }
  }

  // Get freight summary
  static async getFreightSummary(req, res) {
    try {
      const summary = LorryReceipt.getFreightSummary();
      
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Error fetching freight summary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch freight summary',
        error: error.message
      });
    }
  }
}

export default LorryReceiptController;
