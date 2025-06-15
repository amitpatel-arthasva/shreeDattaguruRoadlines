import Truck from '../../database/models/Truck.js';

class TruckController {
  static async getAllTrucks(req, res) {
    try {
      const trucks = Truck.getAll();
      res.json({ success: true, data: trucks });
    } catch (error) {
      console.error('Error fetching trucks:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getTruckById(req, res) {
    try {
      const { id } = req.params;
      const truck = Truck.findById(id);
      
      if (!truck) {
        return res.status(404).json({ success: false, error: 'Truck not found' });
      }
      
      res.json({ success: true, data: truck });
    } catch (error) {
      console.error('Error fetching truck:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async createTruck(req, res) {
    try {
      const truckData = req.body;
      
      // Check if truck number already exists
      const existing = Truck.findByTruckNumber(truckData.truck_number);
      if (existing) {
        return res.status(400).json({ 
          success: false, 
          error: 'Truck with this number already exists' 
        });
      }
      
      const result = Truck.create(truckData);
      res.status(201).json({ 
        success: true, 
        data: { id: result.lastInsertRowid, ...truckData } 
      });
    } catch (error) {
      console.error('Error creating truck:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async updateTruck(req, res) {
    try {
      const { id } = req.params;
      const truckData = req.body;
      
      const result = Truck.update(id, truckData);
      
      if (result.changes === 0) {
        return res.status(404).json({ success: false, error: 'Truck not found' });
      }
      
      res.json({ success: true, message: 'Truck updated successfully' });
    } catch (error) {
      console.error('Error updating truck:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async deleteTruck(req, res) {
    try {
      const { id } = req.params;
      const result = Truck.delete(id);
      
      if (result.changes === 0) {
        return res.status(404).json({ success: false, error: 'Truck not found' });
      }
      
      res.json({ success: true, message: 'Truck deleted successfully' });
    } catch (error) {
      console.error('Error deleting truck:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async searchTrucks(req, res) {
    try {
      const { q } = req.query;
      const trucks = Truck.search(q || '');
      res.json({ success: true, data: trucks });
    } catch (error) {
      console.error('Error searching trucks:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getTruckStats(req, res) {
    try {
      const stats = Truck.getStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error('Error fetching truck stats:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export default TruckController;
