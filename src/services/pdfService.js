/**
 * Generate a PDF for a Memo using the memo print template (exact form layout)
 * @param {Object} memoData - Memo data
 * @param {Object} options - PDF generation options
 * @returns {Promise<Blob>} - PDF blob
 */
const generateMemoPrintPdf = async (memoData, options = {}) => {
  try {
    if (!memoData || typeof memoData !== 'object') {
      throw new Error('Memo data is missing or invalid');
    }
    // Import the template dynamically
    const { default: memoPrintTemplate } = await import('../templates/memoPrintTemplate.js');
    // Generate HTML content using the print template
    const htmlContent = memoPrintTemplate(memoData);
    // Extract memo number for filename
    let memoNumber = memoData.memo_number || memoData.memoNumber || memoData.id || 'Unknown';
    const cleanMemoNumber = String(memoNumber).replace(/[^a-zA-Z0-9-_]/g, '-');
    const finalFilename = 'Memo_' + cleanMemoNumber;
    // Set default PDF options for memo print
    const defaultOptions = {
      filename: finalFilename,
      pdfOptions: {
        format: 'A4',
        landscape: false,
        printBackground: true,
        margin: {
          top: '1cm',
          right: '1cm',
          bottom: '1cm',
          left: '1cm'
        },
        preferCSSPageSize: false
      },
      ...options
    };
    return generatePdfFromHtml(htmlContent, defaultOptions);
  } catch (error) {
    console.error('Error generating memo print PDF:', error);
    throw error;
  }
};
/**
 * PDF Service for generating PDFs in Electron environment
 * Uses Electron's built-in webContents.printToPDF instead of Puppeteer
 */

// Store browser instance for reuse
let browserInstance = null;

/**
 * Get or create a browser instance
 */
const getBrowserInstance = async () => {
  if (!browserInstance) {
    // In Electron, we'll use the main window's webContents
    browserInstance = window.electronAPI ? 'electron' : null;
  }
  return browserInstance;
};

/**
 * Close browser instance
 */
const closeBrowserInstance = async () => {
  browserInstance = null;
};

/**
 * Generate PDF from HTML content using Electron's webContents.printToPDF
 * @param {string} htmlContent - HTML content to convert to PDF
 * @param {Object} options - PDF generation options
 * @returns {Promise<Blob>} - PDF blob
 */
const generatePdfFromHtml = async (htmlContent, options = {}) => {
  try {
    // Check if we're in Electron environment
    if (!window.electronAPI) {
      throw new Error('PDF generation is only available in Electron environment');
    }

    // Create a temporary HTML file with the content
    const tempHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>PDF Document</title>
          <style>
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `;

    // Use Electron's webContents.printToPDF
    const pdfBuffer = await window.electronAPI.generatePdfFromHtml(tempHtml, {
      format: 'A4',
      landscape: false,
      printBackground: true,
      margin: { 
        top: '1cm', 
        right: '1cm', 
        bottom: '1cm', 
        left: '1cm' 
      },
      ...options.pdfOptions
    });

    // Convert buffer to blob
    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    return blob;

  } catch (error) {
    console.error('Error generating PDF from HTML:', error);
    throw error;
  }
};

/**
 * Generate a PDF from a URL (simplified for Electron)
 * @param {string} url - URL to convert to PDF
 * @param {Object} options - PDF generation options
 * @returns {Promise<Blob>} - PDF blob
 */
const generatePdfFromUrl = async (url, options = {}) => {
  try {
    if (!window.electronAPI) {
      throw new Error('PDF generation is only available in Electron environment');
    }

    const pdfBuffer = await window.electronAPI.generatePdfFromUrl(url, {
      format: 'A4',
      landscape: false,
      printBackground: true,
      margin: { 
        top: '1cm', 
        right: '1cm', 
        bottom: '1cm', 
        left: '1cm' 
      },
      ...options.pdfOptions
    });

    const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
    return blob;

  } catch (error) {
    console.error('Error generating PDF from URL:', error);
    throw error;
  }
};

/**
 * Generate a PDF from a template with data
 * @param {Function} templateFn - Function that takes data and returns HTML
 * @param {Object} data - Data to be passed to the template
 * @param {Object} options - PDF generation options
 * @returns {Promise<Blob>} - PDF blob
 */
const generatePdfFromTemplate = async (templateFn, data, options = {}) => {
  try {
    // Validate that data exists and is an object
    if (!data || typeof data !== 'object') {
      throw new Error('Template data is missing or invalid');
    }
    
    // Generate HTML content with error handling
    let htmlContent;
    try {
      htmlContent = templateFn(data);
    } catch (templateError) {
      console.error('Error generating HTML from template:', templateError);
      throw new Error(`Template processing failed: ${templateError.message}`);
    }
    
    // Ensure htmlContent is valid
    if (!htmlContent || typeof htmlContent !== 'string') {
      throw new Error('Template function did not return valid HTML');
    }
    
    return generatePdfFromHtml(htmlContent, options);
  } catch (error) {
    console.error('PDF template generation error:', error);
    throw error;
  }
};

/**
 * Generate a PDF for a Lorry Receipt using the print template (exact form layout)
 * @param {Object} lorryReceiptData - Lorry receipt data
 * @param {Object} options - PDF generation options
 * @returns {Promise<Blob>} - PDF blob
 */
const generateLorryReceiptPrintPdf = async (lorryReceiptData, options = {}) => {
  try {
    // Validate that lorryReceiptData exists
    if (!lorryReceiptData || typeof lorryReceiptData !== 'object') {
      throw new Error('Lorry receipt data is missing or invalid');
    }
    
    // Import the template dynamically to avoid issues
    const { default: lorryReceiptPrintTemplate } = await import('../templates/lorryReceiptPrintTemplate.js');
    
    // Generate HTML content using the print template
    const htmlContent = lorryReceiptPrintTemplate(lorryReceiptData);
    
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
    
    // Build filename directly
    const finalFilename = 'LorryReceipt_' + cleanReceiptNumber;
    
    // Set default PDF options for lorry receipt print with portrait orientation and compact layout
    const defaultOptions = {
      filename: finalFilename,
      pdfOptions: {
        format: 'A4',
        landscape: false,  // Changed to portrait orientation
        printBackground: true,
        margin: { 
          top: '5mm', 
          right: '5mm', 
          bottom: '5mm', 
          left: '5mm' 
        },
        preferCSSPageSize: false
      },
      ...options
    };
    
    return generatePdfFromHtml(htmlContent, defaultOptions);
  } catch (error) {
    console.error('Error generating lorry receipt print PDF:', error);
    throw error;
  }
};

/**
 * Generate a PDF for a Quotation using the quotation template
 * @param {Object} quotationData - Quotation data
 * @param {Object} options - PDF generation options
 * @returns {Promise<Blob>} - PDF blob
 */
const generateQuotationPdf = async (quotationData, options = {}) => {
  try {
    // Validate that quotationData exists
    if (!quotationData || typeof quotationData !== 'object') {
      throw new Error('Quotation data is missing or invalid');
    }
    
    // Import the template dynamically to avoid issues
    const { default: quotationTemplate } = await import('../templates/quotationTemplate.js');
    
    // Generate HTML content using the quotation template
    const htmlContent = quotationTemplate(quotationData);
    
    // Extract quotation number for filename
    let quotationNumber = null;
    
    // Try different possible field names in order of preference
    if (quotationData.quotationNumber) {
      quotationNumber = quotationData.quotationNumber;
    } else if (quotationData.quotation_number) {
      quotationNumber = quotationData.quotation_number;
    } else if (quotationData.number) {
      quotationNumber = quotationData.number;
    } else if (quotationData.id) {
      quotationNumber = 'ID-' + quotationData.id;
    } else {
      quotationNumber = 'Unknown';
    }
    
    // Clean the quotation number (remove spaces, special characters)
    const cleanQuotationNumber = String(quotationNumber).replace(/[^a-zA-Z0-9-_]/g, '-');
    
    // Build filename directly
    const finalFilename = 'Quotation_' + cleanQuotationNumber;
    
    // Set default PDF options for quotation with portrait orientation
    const defaultOptions = {
      filename: finalFilename,
      pdfOptions: {
        format: 'A4',
        landscape: false,
        printBackground: true,
        margin: { 
          top: '1cm', 
          right: '1cm', 
          bottom: '1cm', 
          left: '1cm' 
        },
        preferCSSPageSize: false
      },
      ...options
    };
    
    return generatePdfFromHtml(htmlContent, defaultOptions);
  } catch (error) {
    console.error('Error generating quotation PDF:', error);
    throw error;
  }
};

export {
  generatePdfFromHtml,
  generatePdfFromUrl,
  generatePdfFromTemplate,
  generateLorryReceiptPrintPdf,
  generateQuotationPdf,
  generateMemoPrintPdf,
  closeBrowserInstance
};

// Default export for the lorry receipt PDF function
export default generateLorryReceiptPrintPdf;