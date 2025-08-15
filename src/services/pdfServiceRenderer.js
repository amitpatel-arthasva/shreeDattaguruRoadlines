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
// Generate PDF for a Memo using the print template (exact form layout)
// @param {Object} memoData - Memo data
// @param {string} filename - Optional filename for the PDF
// @returns {Promise<void>} - Downloads the PDF file
const downloadMemoPrintPdf = async (memoData, filename) => {
  try {
    if (!memoData) {
      throw new Error('Memo data is required');
    }
    let memoNumber = memoData.memo_number || memoData.memoNumber || memoData.id || 'Unknown';
    const cleanMemoNumber = String(memoNumber).replace(/[^a-zA-Z0-9-_]/g, '-');
    const currentDate = new Date().toISOString().split('T')[0];
    const filenameParts = ['Memo', 'Print', cleanMemoNumber, currentDate];
    const generatedFilename = filenameParts.join('_') + '.pdf';
    const pdfFilename = filename || generatedFilename;
    if (isElectron()) {
      const result = await window.electronAPI.generateMemoPrintPdf({
        data: memoData,
        filename: pdfFilename
      });
      return result;
    } else {
      const response = await fetch('/api/generate-memo-print-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: memoData,
          filename: pdfFilename
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = pdfFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return { success: true, filename: pdfFilename };
    }
  } catch (error) {
    console.error('Error downloading memo print PDF:', error);
    return { success: false, error: error.message };
  }
};

// Generate PDF for a Lorry Receipt using the print template (exact form layout)
// @param {Object} lorryReceiptData - Lorry receipt data
// @param {string} filename - Optional filename for the PDF
// @returns {Promise<void>} - Downloads the PDF file
const downloadLorryReceiptPrintPdf = async (lorryReceiptData, filename) => {
  try {
    if (!lorryReceiptData) {
      throw new Error('Lorry receipt data is required');
    }
    let receiptNumber = null;
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
    const cleanReceiptNumber = String(receiptNumber).replace(/[^a-zA-Z0-9-_]/g, '-');
    const currentDate = new Date().toISOString().split('T')[0];
    const filenameParts = ['LorryReceipt', 'Print', cleanReceiptNumber, currentDate];
    const generatedFilename = filenameParts.join('_') + '.pdf';
    const pdfFilename = filename || generatedFilename;
    if (isElectron()) {
      const result = await window.electronAPI.generateLorryReceiptPrintPdf({
        data: lorryReceiptData,
        filename: pdfFilename
      });
      return result;
    } else {
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
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = pdfFilename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      return { success: true, filename: pdfFilename };
    }
  } catch (error) {
    console.error('Error downloading lorry receipt print PDF:', error);
    return { success: false, error: error.message };
  }
};

export { downloadLorryReceiptPrintPdf, downloadMemoPrintPdf };
export default {
  downloadLorryReceiptPrintPdf,
  downloadMemoPrintPdf
};
