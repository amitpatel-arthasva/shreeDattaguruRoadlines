const express = require('express');
const UserController = require('../controllers/UserController');
const router = express.Router();

// Authentication
router.post('/auth/login', UserController.authenticate);

// User CRUD operations
router.get('/', UserController.getAll);
router.get('/:id', UserController.getById);
router.post('/', UserController.create);
router.put('/:id', UserController.update);
router.delete('/:id', UserController.delete);

module.exports = router;
