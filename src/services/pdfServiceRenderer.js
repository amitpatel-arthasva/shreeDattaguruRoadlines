/**
 * PDF Service for Renderer Process
 * This service handles PDF generation requests from the React components
 * and communicates with the main process for PDF generation
 */

// Check if we're in the renderer process (Electron)
const isElectron = () => {
  return typeof window !== 'undefined' && window.electronAPI;
};

/**
 * Generate PDF for a Lorry Receipt using the print template (exact form layout)
 * @param {Object} lorryReceiptData - Lorry receipt data
 * @param {string} filename - Optional filename for the PDF
 * @returns {Promise<void>} - Downloads the PDF file
 */
export const downloadLorryReceiptPrintPdf = async (lorryReceiptData, filename) => {
  try {
    if (!lorryReceiptData) {
      throw new Error('Lorry receipt data is required');
    }
      // Simple and direct filename extraction
    let receiptNumber = null;
    
    // Try different possible field names in order of preference
    if (lorryReceiptData.lorryReceiptNumber) {
      receiptNumber = lorryReceiptData.lorryReceiptNumber;
    } else if (lorryReceiptData.cn_number) {
      receiptNumber = lorryReceiptData.cn_number;
    } else if (lorryReceiptData.lr_number) {
      receiptNumber = lorryReceiptData.lr_number;
    } else if (lorryReceiptData.cnNumber) {
      receiptNumber = lorryReceiptData.cnNumber;
    } else if (lorryReceiptData.lrNumber) {
      receiptNumber = lorryReceiptData.lrNumber;
    } else if (lorryReceiptData.receipt_number) {
      receiptNumber = lorryReceiptData.receipt_number;
    } else if (lorryReceiptData.receiptNumber) {
      receiptNumber = lorryReceiptData.receiptNumber;
    } else if (lorryReceiptData.number) {
      receiptNumber = lorryReceiptData.number;
    } else if (lorryReceiptData.id) {
      receiptNumber = 'ID-' + lorryReceiptData.id;
    } else {
      receiptNumber = 'Unknown';
    }
      // Clean the receipt number (remove spaces, special characters)
    const cleanReceiptNumber = String(receiptNumber).replace(/[^a-zA-Z0-9-_]/g, '-');
    
    // Get current date
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Build filename parts separately
    const filenameParts = ['LorryReceipt', 'Print', cleanReceiptNumber, currentDate];
    const generatedFilename = filenameParts.join('_') + '.pdf';
    
    // Use provided filename or generated one
    const pdfFilename = filename || generatedFilename;

    if (isElectron()) {
      // In Electron environment, use IPC to communicate with main process
      const result = await window.electronAPI.generateLorryReceiptPrintPdf({
        data: lorryReceiptData,
        filename: pdfFilename
      });
      
      // Return the result object so the caller can handle cancellation vs errors
      return result;
    } else {
      // In web environment, use direct API call
      const response = await fetch('/api/generate-lorry-receipt-print-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: lorryReceiptData,
          filename: pdfFilename
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      // Handle file download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = pdfFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);      return { success: true, filename: pdfFilename };
    }  } catch (error) {
    console.error('Error downloading lorry receipt print PDF:', error);
    return { success: false, error: error.message };
  }
};

export default {
  downloadLorryReceiptPrintPdf
};
