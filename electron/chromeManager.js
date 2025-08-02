import fs from 'fs';
import path from 'path';
import process from 'process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ChromeManager {
  constructor() {
    this.isElectron = typeof window !== 'undefined' && window.process && window.process.type;
    this.chromePath = null;
    this.initialized = false;
  }

  /**
   * Get the path to the bundled Chrome executable
   */
  getBundledChromePath() {
    try {
      // Determine if we're in a packaged app or development
      const isDev = process.env.NODE_ENV === 'development' || !process.resourcesPath;
      
      let basePath;
      if (isDev) {
        // In development, look in project root
        const projectRoot = path.resolve(__dirname, '..');
        basePath = path.join(projectRoot, 'chrome-bundle');
      } else {
        // In packaged app, look in resources directory (extraResources)
        basePath = path.join(process.resourcesPath, 'chrome-bundle');
      }
      
      console.log('Looking for Chrome bundle at:', basePath);

      if (!fs.existsSync(basePath)) {
        console.log('Chrome bundle directory not found');
        return null;
      }

      // Look for Chrome executable in the bundle
      const chromeDir = path.join(basePath, 'chrome');
      
      if (!fs.existsSync(chromeDir)) {
        console.log('Chrome directory not found in bundle');
        return null;
      }

      // Find the Chrome version directory
      const versionDirs = fs.readdirSync(chromeDir).filter(dir => {
        const fullPath = path.join(chromeDir, dir);
        return fs.statSync(fullPath).isDirectory();
      });

      if (versionDirs.length === 0) {
        console.log('No Chrome version directories found');
        return null;
      }

      // Use the first (and likely only) version directory
      const versionDir = versionDirs[0];
      const chromeWinDir = path.join(chromeDir, versionDir, 'chrome-win64');
      const chromeExecutablePath = path.join(chromeWinDir, 'chrome.exe');

      console.log('Checking for Chrome executable at:', chromeExecutablePath);

      if (fs.existsSync(chromeExecutablePath)) {
        console.log('Found bundled Chrome at:', chromeExecutablePath);
        return chromeExecutablePath;
      } else {
        console.log('Chrome executable not found at expected path');
        return null;
      }
    } catch (error) {
      console.error('Error finding bundled Chrome:', error);
      return null;
    }
  }

  /**
   * Initialize Chrome manager and find available Chrome installation
   */
  async initialize() {
    if (this.initialized) {
      return this.chromePath;
    }

    console.log('Initializing Chrome Manager...');

    // First, try to use bundled Chrome
    this.chromePath = this.getBundledChromePath();

    if (this.chromePath) {
      console.log('Using bundled Chrome:', this.chromePath);
      this.initialized = true;
      return this.chromePath;
    }

    // If no bundled Chrome found, try system Chrome (fallback)
    const systemPaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Google\\Chrome\\Application\\chrome.exe') : null
    ].filter(Boolean);

    for (const chromePath of systemPaths) {
      if (fs.existsSync(chromePath)) {
        console.log('Using system Chrome:', chromePath);
        this.chromePath = chromePath;
        this.initialized = true;
        return this.chromePath;
      }
    }

    console.log('No Chrome installation found');
    this.initialized = true;
    return null;
  }

  /**
   * Get Chrome executable path
   */
  async getChromePath() {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.chromePath;
  }

  /**
   * Check if Chrome is available
   */
  async isChromeAvailable() {
    const chromePath = await this.getChromePath();
    return chromePath !== null;
  }

  /**
   * Get Chrome launch arguments for puppeteer
   */
  getChromeArgs() {
    return [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=site-per-process',
      '--disable-background-timer-throttling',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows'
    ];
  }

  /**
   * Get puppeteer launch options
   */
  async getPuppeteerOptions() {
    const chromePath = await this.getChromePath();
    
    if (!chromePath) {
      throw new Error('Chrome browser is required for PDF generation. Please install Chrome from the settings menu.');
    }

    return {
      executablePath: chromePath,
      args: this.getChromeArgs(),
      headless: 'new',
      ignoreDefaultArgs: ['--disable-extensions'],
      timeout: 30000
    };
  }

  /**
   * Ensure Chrome is available (legacy compatibility method)
   */
  async ensureChrome() {
    try {
      await this.initialize();
      return await this.isChromeAvailable();
    } catch (error) {
      console.error('Error ensuring Chrome:', error);
      return false;
    }
  }

  /**
   * Get Chrome executable path (legacy compatibility method)
   */
  getChromeExecutablePath() {
    return this.chromePath;
  }
}

// Export singleton instance
const chromeManager = new ChromeManager();
export default chromeManager;
