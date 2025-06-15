import Driver from '../../database/models/Driver.js';

class DriverController {
  static async getAllDrivers(req, res) {
    try {
      const { activeOnly } = req.query;
      const drivers = Driver.getAll(activeOnly !== 'false');
      res.json({ success: true, data: drivers });
    } catch (error) {
      console.error('Error fetching drivers:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getDriverById(req, res) {
    try {
      const { id } = req.params;
      const driver = Driver.findById(id);
      
      if (!driver) {
        return res.status(404).json({ success: false, error: 'Driver not found' });
      }
      
      res.json({ success: true, data: driver });
    } catch (error) {
      console.error('Error fetching driver:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async createDriver(req, res) {
    try {
      const driverData = req.body;
      const result = Driver.create(driverData);
      res.status(201).json({ 
        success: true, 
        data: { id: result.lastInsertRowid, ...driverData } 
      });
    } catch (error) {
      console.error('Error creating driver:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async updateDriver(req, res) {
    try {
      const { id } = req.params;
      const driverData = req.body;
      
      const result = Driver.update(id, driverData);
      
      if (result.changes === 0) {
        return res.status(404).json({ success: false, error: 'Driver not found' });
      }
      
      res.json({ success: true, message: 'Driver updated successfully' });
    } catch (error) {
      console.error('Error updating driver:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async deleteDriver(req, res) {
    try {
      const { id } = req.params;
      const result = Driver.delete(id);
      
      if (result.changes === 0) {
        return res.status(404).json({ success: false, error: 'Driver not found' });
      }
      
      res.json({ success: true, message: 'Driver deleted successfully' });
    } catch (error) {
      console.error('Error deleting driver:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async activateDriver(req, res) {
    try {
      const { id } = req.params;
      const result = Driver.activate(id);
      
      if (result.changes === 0) {
        return res.status(404).json({ success: false, error: 'Driver not found' });
      }
      
      res.json({ success: true, message: 'Driver activated successfully' });
    } catch (error) {
      console.error('Error activating driver:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async deactivateDriver(req, res) {
    try {
      const { id } = req.params;
      const result = Driver.deactivate(id);
      
      if (result.changes === 0) {
        return res.status(404).json({ success: false, error: 'Driver not found' });
      }
      
      res.json({ success: true, message: 'Driver deactivated successfully' });
    } catch (error) {
      console.error('Error deactivating driver:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async searchDrivers(req, res) {
    try {
      const { q } = req.query;
      const drivers = Driver.search(q || '');
      res.json({ success: true, data: drivers });
    } catch (error) {
      console.error('Error searching drivers:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getDriverStats(req, res) {
    try {
      const stats = Driver.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Error fetching driver stats:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export default DriverController;
