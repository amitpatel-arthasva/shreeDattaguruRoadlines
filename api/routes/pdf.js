import express from 'express';
import { generateLorryReceiptPrintPdf } from '../../src/services/pdfService.js';

const router = express.Router();

/**
 * Generate PDF for a Lorry Receipt
 * POST /api/generate-lorry-receipt-pdf
 */
router.post('/generate-lorry-receipt-pdf', async (req, res) => {
  try {
    const { data, filename } = req.body;

    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Lorry receipt data is required'
      });
    }    // Generate PDF buffer
    const pdfBuffer = await generateLorryReceiptPrintPdf(data);

    // Set response headers for PDF download
    const pdfFilename = filename || `LorryReceipt_${data.lr_number || 'Unknown'}.pdf`;
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${pdfFilename}"`,
      'Content-Length': pdfBuffer.length
    });

    // Send the PDF buffer
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating lorry receipt PDF:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Generate PDF for a Lorry Receipt using print template (exact form layout)
 * POST /api/generate-lorry-receipt-print-pdf
 */
router.post('/generate-lorry-receipt-print-pdf', async (req, res) => {
  try {    const { data, filename } = req.body;    if (!data) {
      return res.status(400).json({
        success: false,
        error: 'Lorry receipt data is required'
      });
    }

    // Generate PDF buffer using print template
    const pdfBuffer = await generateLorryReceiptPrintPdf(data);
      // Simple and direct filename extraction
    let receiptNumber = null;
    
    // Try different possible field names in order of preference
    if (data.lorryReceiptNumber) {
      receiptNumber = data.lorryReceiptNumber;
    } else if (data.cn_number) {
      receiptNumber = data.cn_number;
    } else if (data.lr_number) {
      receiptNumber = data.lr_number;
    } else if (data.cnNumber) {
      receiptNumber = data.cnNumber;
    } else if (data.lrNumber) {
      receiptNumber = data.lrNumber;
    } else if (data.receipt_number) {
      receiptNumber = data.receipt_number;
    } else if (data.receiptNumber) {
      receiptNumber = data.receiptNumber;
    } else if (data.number) {
      receiptNumber = data.number;
    } else if (data.id) {
      receiptNumber = 'ID-' + data.id;
    } else {
      receiptNumber = 'Unknown';
    }
    
    // Clean the receipt number (remove spaces, special characters)
    const cleanReceiptNumber = String(receiptNumber).replace(/[^a-zA-Z0-9-_]/g, '-');
    
    // Build filename parts separately
    const filenameParts = ['LorryReceipt', 'Print', cleanReceiptNumber];
    const generatedFilename = filenameParts.join('_') + '.pdf';
    
    // Set response headers for PDF download
    const pdfFilename = filename || generatedFilename;
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${pdfFilename}"`,
      'Content-Length': pdfBuffer.length
    });

    // Send the PDF buffer
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating lorry receipt print PDF:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
