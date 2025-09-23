import puppeteerCore from 'puppeteer-core';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import process from 'process';
import lorryReceiptPrintTemplate from './lorryReceiptPrintTemplate.js';
import lorryReceiptTermsHtml from './lorryReceiptTermsHtml.js';
import memoPrintTemplate from './memoPrintTemplate.js';
/**
 * Generate a PDF for a Memo using the memo print template (exact form layout)
 * @param {Object} memoData - Memo data
 * @param {Object} options - PDF generation options
 * @returns {Promise<Buffer>} - PDF buffer
 */
const generateMemoPrintPdf = async (memoData, options = {}) => {
  try {
    if (!memoData || typeof memoData !== 'object') {
      throw new Error('Memo data is missing or invalid');
    }
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
import chromeManager from './chromeManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const writeFileAsync = promisify(fs.writeFile);

// Browser instance pool for reuse
let browserInstance = null;
let browserUseCount = 0;
const MAX_BROWSER_USES = 50; // Restart browser after 50 uses to prevent memory leaks

/**
 * Get or create a shared browser instance
 * @returns {Promise<Browser>} - Puppeteer browser instance
 */
const getBrowserInstance = async () => {
  if (!browserInstance || !browserInstance.isConnected() || browserUseCount >= MAX_BROWSER_USES) {
    if (browserInstance) {
      try {
        await browserInstance.close();
      } catch (error) {
        console.warn('Error closing browser instance:', error);
      }
    }
    
    try {
      // Get puppeteer launch options from chrome manager
      const launchOptions = await chromeManager.getPuppeteerOptions();
      
      browserInstance = await puppeteerCore.launch(launchOptions);
      browserUseCount = 0;
    } catch (error) {
      console.error('Error launching browser:', error);
      if (error.message.includes('Could not find Chrome') || error.message.includes('Chrome browser is required')) {
        throw new Error('Chrome browser is required for PDF generation. Please install Chrome from the settings menu.');
      }
      throw error;
    }
  }
  
  browserUseCount++;
  return browserInstance;
};

/**
 * Clean up browser instance
 */
const closeBrowserInstance = async () => {
  if (browserInstance) {
    try {
      // Force close all pages first
      const pages = await browserInstance.pages();
      await Promise.all(pages.map(page => page.close().catch(console.warn)));
      
      // Close the browser
      await browserInstance.close();
      browserInstance = null;
      browserUseCount = 0;
    } catch (error) {
      console.warn('Error closing browser instance:', error);
      // Force set to null even if close fails
      browserInstance = null;
      browserUseCount = 0;
    }
  }
};

/**
 * Generate a PDF from HTML content
 * @param {string} htmlContent - The HTML content to convert to PDF
 * @param {Object} options - PDF generation options
 * @param {string} options.filename - The name of the PDF file (without extension)
 * @param {string} options.outputPath - The directory to save the PDF (optional)
 * @param {Object} options.pdfOptions - Puppeteer PDF options (optional)
 * @returns {Promise<Buffer>} - PDF buffer
 */
const generatePdfFromHtml = async (htmlContent, options = {}) => {
  const {
    filename = 'document',
    outputPath = null,
    pdfOptions = {}
  } = options;

  let browser = null;
  let page = null;
  
  try {
    // Use shared browser instance
    browser = await getBrowserInstance();

    // Create a new page
    page = await browser.newPage();
    
    // Optimize page settings for PDF generation
    await page.setDefaultNavigationTimeout(30000);
    await page.setDefaultTimeout(30000);
    
    // Set content to the page with optimized wait options
    await page.setContent(htmlContent, {
      waitUntil: 'domcontentloaded' // Changed from networkidle0 for better performance
    });

    // Generate PDF with optimized settings
    const defaultPdfOptions = {
      format: 'A4',
      printBackground: true,
      margin: { top: '0.1mm', right: '0.1mm', bottom: '0.1mm', left: '0.1mm' },
      preferCSSPageSize: true // Improve performance
    };

    const pdf = await page.pdf({
      ...defaultPdfOptions,
      ...pdfOptions
    });

    // If outputPath is provided, save the PDF to the filesystem
    if (outputPath) {
      const pdfPath = path.posix.join(outputPath, `${filename}.pdf`);
      await writeFileAsync(pdfPath, pdf);
    }

    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  } finally {
    // Only close the page, not the browser
    if (page) {
      try {
        await page.close();
      } catch (error) {
        console.warn('Error closing page:', error);
      }
    }
  }
};

/**
 * Generate a PDF from a URL
 * @param {string} url - The URL to convert to PDF
 * @param {Object} options - PDF generation options
 * @returns {Promise<Buffer>} - PDF buffer
 */
const generatePdfFromUrl = async (url, options = {}) => {
  let browser = null;
  let page = null;
  
  try {
    // Use shared browser instance
    browser = await getBrowserInstance();

    // Create a new page
    page = await browser.newPage();
    
    // Optimize page settings
    await page.setDefaultNavigationTimeout(30000);
    await page.setDefaultTimeout(30000);
    
    // Navigate to the URL with optimized wait options
    await page.goto(url, {
      waitUntil: 'domcontentloaded' // Changed from networkidle0 for better performance
    });

    // Generate PDF with the same options as generatePdfFromHtml
    return await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0.1mm', right: '0.1mm', bottom: '0.1mm', left: '0.1mm' },
      preferCSSPageSize: true,
      ...options.pdfOptions
    });
  } catch (error) {
    console.error('Error generating PDF from URL:', error);
    throw error;
  } finally {
    // Only close the page, not the browser
    if (page) {
      try {
        await page.close();
      } catch (error) {
        console.warn('Error closing page:', error);
      }
    }
  }
};

/**
 * Generate a PDF from a template with data
 * @param {Function} templateFn - Function that takes data and returns HTML
 * @param {Object} data - Data to be passed to the template
 * @param {Object} options - PDF generation options
 * @returns {Promise<Buffer>} - PDF buffer
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
 * @returns {Promise<Buffer>} - PDF buffer
 */
const generateLorryReceiptPrintPdf = async (lorryReceiptData, options = {}) => {
  try {
    // Validate that lorryReceiptData exists
    if (!lorryReceiptData || typeof lorryReceiptData !== 'object') {
      throw new Error('Lorry receipt data is missing or invalid');
    }
    
  // Generate HTML content using the print template
  const mainHtml = lorryReceiptPrintTemplate(lorryReceiptData);
  // Add Terms & Conditions as a second page with a page break
  const termsHtml = lorryReceiptTermsHtml();
  // Remove </body></html> from mainHtml if present, then append page break and terms
  const mainHtmlClean = mainHtml.replace(/<\/body>\s*<\/html>\s*$/i, '');
  const htmlContent = `${mainHtmlClean}
  <div style="page-break-before: always;"></div>
  ${termsHtml}
  </body></html>`;
    
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

export {
  generatePdfFromHtml,
  generatePdfFromUrl,
  generatePdfFromTemplate,
  generateLorryReceiptPrintPdf,
  generateMemoPrintPdf,
  closeBrowserInstance
};

// Default export for the lorry receipt PDF function
export default generateLorryReceiptPrintPdf; 