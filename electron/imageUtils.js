import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize BASE_PATH with a function to avoid top-level await
let BASE_PATH = path.join(__dirname, '..');

// Function to initialize electron app path
const initializeElectronPath = async () => {
  try {
    const { app } = await import('electron');
    if (app && app.getAppPath) {
      BASE_PATH = app.getAppPath();
    }
  } catch {
    // Electron not available, use file-based path
    BASE_PATH = path.join(__dirname, '..');
  }
};

// Initialize immediately but don't block
initializeElectronPath().catch(() => {
  // Fallback to file-based path if electron initialization fails
  BASE_PATH = path.join(__dirname, '..');
});

// Cache for base64 encoded images to avoid repeated file reads and encoding
const imageCache = new Map();

/**
 * Convert an image file to base64 data URL
 * @param {string} imagePath - Path to the image file relative to project root
 * @returns {string} - Base64 data URL or empty string if file not found
 */
const getImageAsBase64 = (imagePath) => {
  // Check cache first
  if (imageCache.has(imagePath)) {
    return imageCache.get(imagePath);
  }
  
  try {    // Try multiple possible paths for the image
    const possiblePaths = [
      // Production build path
      path.join(BASE_PATH, 'build', 'assets', imagePath),
      // Development assets path (direct)
      path.join(BASE_PATH, 'assets', imagePath),
      // Development src/assets/images path
      path.join(BASE_PATH, 'src', 'assets', 'images', imagePath),
      // Legacy path (assets/images)
      path.join(BASE_PATH, 'assets', 'images', imagePath)
    ];
    
    let fullPath = null;
    
    // Try each possible path
    for (const tryPath of possiblePaths) {
      if (fs.existsSync(tryPath)) {
        fullPath = tryPath;
        break;
      }
    }
      // If not found by exact name, try to find with hash in build directory (production)
    if (!fullPath) {
      const buildAssetsDir = path.join(BASE_PATH, 'build', 'assets');
      if (fs.existsSync(buildAssetsDir)) {
        const files = fs.readdirSync(buildAssetsDir);
        const baseName = path.parse(imagePath).name; // Get filename without extension
        const hashedFile = files.find(file => file.startsWith(baseName + '-') && file.includes('.'));
        if (hashedFile) {
          fullPath = path.join(buildAssetsDir, hashedFile);
        }
      }
    }
    
    if (!fullPath) {
      console.warn(`Image not found: ${imagePath}. Tried paths:`, possiblePaths);
      imageCache.set(imagePath, ''); // Cache empty result
      return '';
    }    
    const imageBuffer = fs.readFileSync(fullPath);
    const extension = path.extname(fullPath).toLowerCase();
    
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
    
    const base64String = imageBuffer.toString('base64');    const dataUrl = `data:${mimeType};base64,${base64String}`;
    
    console.log(`Successfully loaded image: ${imagePath} from ${fullPath}`);
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
  return getImageAsBase64('billHeader4.png');
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