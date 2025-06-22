import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache for base64 encoded images to avoid repeated file reads and encoding
const imageCache = new Map();

/**
 * Convert an image file to base64 data URL
 * @param {string} imagePath - Path to the image file relative to assets/images
 * @returns {string} - Base64 data URL or empty string if file not found
 */
const getImageAsBase64 = (imagePath) => {
  // Check cache first
  if (imageCache.has(imagePath)) {
    return imageCache.get(imagePath);
  }
  
  try {
    const fullPath = path.join(__dirname, '..', 'assets', 'images', imagePath);
    
    if (!fs.existsSync(fullPath)) {
      console.warn(`Image not found: ${fullPath}`);
      imageCache.set(imagePath, ''); // Cache empty result
      return '';
    }
    
    const imageBuffer = fs.readFileSync(fullPath);
    const extension = path.extname(imagePath).toLowerCase();
    
    // Determine MIME type based on extension
    let mimeType = 'image/jpeg'; // default
    switch (extension) {
      case '.png':
        mimeType = 'image/png';
        break;
      case '.jpg':
      case '.jpeg':
        mimeType = 'image/jpeg';
        break;
      case '.gif':
        mimeType = 'image/gif';
        break;
      case '.webp':
        mimeType = 'image/webp';
        break;
      case '.svg':
        mimeType = 'image/svg+xml';
        break;
    }
    
    const base64String = imageBuffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64String}`;
    
    // Cache the result
    imageCache.set(imagePath, dataUrl);
    return dataUrl;
  } catch (error) {
    console.error(`Error converting image to base64: ${imagePath}`, error);
    imageCache.set(imagePath, ''); // Cache empty result
    return '';
  }
};

// Cache for logos to avoid repeated object creation
let logosCache = null;

/**
 * Get bill header image as base64 data URL
 * @returns {string} - Base64 data URL for billHeader.png
 */
const getBillHeaderAsBase64 = () => {
  return getImageAsBase64('billHeader.png');
};

/**
 * Get all logo images as base64 data URLs
 * @returns {Object} - Object with logo names as keys and base64 data URLs as values
 */
const getLogosAsBase64 = () => {
  if (logosCache === null) {
    logosCache = {
      invoiceHeader: getImageAsBase64('invoice_header.jpg'),
      lorryReceiptHeader: getImageAsBase64('LR_header.jpg'),
      footer: getImageAsBase64('footer.jpg'),
      billHeader: getImageAsBase64('billHeader.png'),
    };
  }
  return logosCache;
};

/**
 * Clear the image cache (useful for development or when images change)
 */
const clearImageCache = () => {
  imageCache.clear();
  logosCache = null;
};

export {
  getImageAsBase64,
  getBillHeaderAsBase64,
  getLogosAsBase64,
  clearImageCache
};
