const express = require('express');
const CompanyController = require('../controllers/CompanyController');
const router = express.Router();

// Company operations
router.get('/', CompanyController.getAll);
router.get('/search', CompanyController.search);
router.get('/stats', CompanyController.getStats);
router.get('/:id', CompanyController.getById);
router.post('/', CompanyController.create);
router.put('/:id', CompanyController.update);
router.delete('/:id', CompanyController.delete);
router.patch('/:id/activate', CompanyController.activate);
router.patch('/:id/deactivate', CompanyController.deactivate);

module.exports = router;
