import express from 'express';
import LorryReceiptController from '../controllers/LorryReceiptController.js';

const router = express.Router();

// Create a new lorry receipt
router.post('/', LorryReceiptController.create);

// Get all lorry receipts with optional filtering
router.get('/', LorryReceiptController.getAll);

// Get next LR number
router.get('/next-number', LorryReceiptController.getNextLRNumber);

// Get totals by date range
router.get('/totals', LorryReceiptController.getTotalsByDateRange);

// Get freight summary
router.get('/freight-summary', LorryReceiptController.getFreightSummary);

// Get a specific lorry receipt by ID
router.get('/:id', LorryReceiptController.getById);

// Get a specific lorry receipt by LR number
router.get('/number/:lr_number', LorryReceiptController.getByNumber);

// Update a lorry receipt
router.put('/:id', LorryReceiptController.update);

// Delete a lorry receipt
router.delete('/:id', LorryReceiptController.delete);

export default router;
