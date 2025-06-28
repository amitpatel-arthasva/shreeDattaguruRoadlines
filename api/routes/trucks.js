const express = require('express');
const TruckController = require('../controllers/TruckController');
const router = express.Router();

// Truck CRUD operations
router.get('/', TruckController.getAllTrucks);
router.get('/search', TruckController.searchTrucks);
router.get('/:id', TruckController.getTruckById);
router.post('/', TruckController.createTruck);
router.put('/:id', TruckController.updateTruck);
router.delete('/:id', TruckController.deleteTruck);

module.exports = router;
