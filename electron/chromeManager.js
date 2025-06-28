import puppeteer from 'puppeteer';
import path from 'path';
import { app } from 'electron';
import process from 'process';

class ChromeManager {
  constructor() {
    this.chromeReady = false;
    this.downloadPromise = null;
  }

  /**
   * Get Chrome path for the installed app
   */
  getChromePath() {
    const userDataPath = app.getPath('userData');
    const chromePath = path.join(userDataPath, '.cache', 'puppeteer');
    return chromePath;
  }

  /**
   * Check if Chrome is available
   */
  async isChromeAvailable() {
    let browser = null;
    try {
      // Create a timeout promise to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Chrome availability check timed out')), 10000);
      });

      // Try to launch with minimal options to test availability
      const launchPromise = puppeteer.launch({ 
        headless: 'new',
        args: [
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--disable-default-apps',
          '--disable-extensions'
        ],
        timeout: 5000 // 5 second timeout for launch
      });

      browser = await Promise.race([launchPromise, timeoutPromise]);
      return true;
    } catch (error) {
      console.log('Chrome availability check failed:', error.message);
      return false;
    } finally {
      // Always close the browser instance if it was created
      if (browser) {
        try {
          await browser.close();
        } catch (closeError) {
          console.warn('Error closing test browser instance:', closeError);
        }
      }
    }
  }

  /**
   * Check if bundled Chrome is available
   */
  async isBundledChromeAvailable() {
    try {
      const fs = await import('fs');
      const bundleManifestPath = path.join(app.getAppPath(), 'chrome-bundle', 'bundle-manifest.json');
      
      if (fs.existsSync(bundleManifestPath)) {
        console.log('Bundled Chrome manifest found');
        
        // Search for Chrome executable in the bundle
        const chromeBundlePath = path.join(app.getAppPath(), 'chrome-bundle', 'chrome');
        if (fs.existsSync(chromeBundlePath)) {
          // Look for chrome.exe in subdirectories
          const findChromeExe = (dir) => {
            try {
              const items = fs.readdirSync(dir);
              for (const item of items) {
                const itemPath = path.join(dir, item);
                const stat = fs.statSync(itemPath);
                
                if (stat.isDirectory()) {
                  // Recursively search subdirectories
                  const found = findChromeExe(itemPath);
                  if (found) return found;
                } else if (item === 'chrome.exe') {
                  return itemPath;
                }
              }
            } catch (error) {
              console.log('Error searching directory:', dir, error.message);
            }
            return null;
          };
          
          const bundledChromeExePath = findChromeExe(chromeBundlePath);
          
          // Also check for the bundle manifest
          const manifestPath = path.join(chromeBundlePath, 'bundle-manifest.json');
          if (fs.existsSync(manifestPath)) {
            try {
              const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
              if (manifest.chromePath && fs.existsSync(manifest.chromePath)) {
                console.log('Chrome found via bundle manifest:', manifest.chromePath);
                process.env.PUPPETEER_EXECUTABLE_PATH = manifest.chromePath;
                
                if (await this.isChromeAvailable()) {
                  console.log('Bundled Chrome from manifest is working');
                  return true;
                }
              }
            } catch (manifestError) {
              console.log('Error reading bundle manifest:', manifestError.message);
            }
          }
          
          if (bundledChromeExePath) {
            console.log('Bundled Chrome executable found:', bundledChromeExePath);
            
            // Set the executable path to use bundled Chrome
            process.env.PUPPETEER_EXECUTABLE_PATH = bundledChromeExePath;
            
            // Test if bundled Chrome works
            if (await this.isChromeAvailable()) {
              console.log('Bundled Chrome is working');
              return true;
            }
          } else {
            console.log('No Chrome executable found in bundle');
          }
        }
      }
      
      return false;
    } catch (error) {
      console.log('Error checking bundled Chrome:', error.message);
      return false;
    }
  }

  /**
   * Check if Chrome was installed during post-install
   */
  async isPostInstallChromeAvailable() {
    try {
      const fs = await import('fs');
      const appDataPath = app.getPath('userData');
      const completionMarkerPath = path.join(appDataPath, 'chrome-install-complete.json');
      
      if (fs.existsSync(completionMarkerPath)) {
        console.log('Post-install Chrome completion marker found');
        
        // Read the completion marker
        const completionData = JSON.parse(fs.readFileSync(completionMarkerPath, 'utf8'));
        const chromeCacheDir = completionData.chromeCacheDir;
        
        if (chromeCacheDir && fs.existsSync(chromeCacheDir)) {
          console.log('Post-install Chrome cache directory found:', chromeCacheDir);
          
          // Set the cache directory environment variable
          process.env.PUPPETEER_CACHE_DIR = chromeCacheDir;
          
          // Test if this works
          if (await this.isChromeAvailable()) {
            console.log('Post-install Chrome is working');
            return true;
          }
        }
      }
      
      return false;
    } catch (error) {
      console.log('Error checking post-install Chrome:', error.message);
      return false;
    }
  }

  /**
   * Download Chrome if not available
   */
  async ensureChrome() {
    if (this.chromeReady) {
      return true;
    }

    if (this.downloadPromise) {
      return this.downloadPromise;
    }

    this.downloadPromise = this._downloadChrome();
    return this.downloadPromise;
  }

  async _downloadChrome() {
    try {
      console.log('Checking Chrome availability...');
      
      if (await this.isChromeAvailable()) {
        console.log('Chrome already available');
        this.chromeReady = true;
        return true;
      }

      // Check for system Chrome first
      console.log('Searching for system Chrome...');
      if (await this.findSystemChrome()) {
        console.log('Using system Chrome');
        this.chromeReady = true;
        return true;
      }

      // Check for post-install Chrome
      console.log('Checking for post-install Chrome...');
      if (await this.isPostInstallChromeAvailable()) {
        console.log('Using post-install Chrome');
        this.chromeReady = true;
        return true;
      }

      // Check for bundled Chrome
      console.log('Checking for bundled Chrome...');
      if (await this.isBundledChromeAvailable()) {
        console.log('Using bundled Chrome');
        this.chromeReady = true;
        return true;
      }

      console.log('Downloading Chrome for PDF generation...');
      
      // Use puppeteer's browser installer with better error handling
      const { execSync } = await import('child_process');
      
      try {
        // First try the standard puppeteer browsers install
        console.log('Attempting to install Chrome via puppeteer browsers...');
        execSync('npx puppeteer browsers install chrome', { 
          stdio: 'inherit',
          cwd: app.getAppPath(),
          timeout: 300000 // 5 minute timeout
        });
        
        // Verify the download was successful
        if (await this.isChromeAvailable()) {
          this.chromeReady = true;
          console.log('Chrome downloaded and verified successfully');
          return true;
        } else {
          throw new Error('Chrome download completed but verification failed');
        }
      } catch (execError) {
        console.error('Standard Chrome download failed:', execError.message);
        
        // Try alternative approach using puppeteer's executable path
        try {
          console.log('Attempting alternative Chrome installation...');
          
          // Try to get the executable path from puppeteer
          const puppeteerExecutablePath = puppeteer.executablePath();
          if (puppeteerExecutablePath && puppeteerExecutablePath !== '') {
            console.log('Found puppeteer executable path:', puppeteerExecutablePath);
            
            // Set the executable path environment variable
            process.env.PUPPETEER_EXECUTABLE_PATH = puppeteerExecutablePath;
            
            // Test if this works
            if (await this.isChromeAvailable()) {
              this.chromeReady = true;
              console.log('Chrome found via puppeteer executable path');
              return true;
            }
          }
          
          // If still not working, try to install with different options
          console.log('Attempting Chrome installation with different options...');
          execSync('npx puppeteer install', { 
            stdio: 'inherit',
            cwd: app.getAppPath(),
            timeout: 300000
          });
          
          if (await this.isChromeAvailable()) {
            this.chromeReady = true;
            console.log('Chrome installed successfully with alternative method');
            return true;
          }
          
          throw new Error('All Chrome installation methods failed');
          
        } catch (altError) {
          console.error('Alternative Chrome installation failed:', altError.message);
          throw new Error(`Chrome download failed: ${execError.message}. Alternative method also failed: ${altError.message}`);
        }
      }

    } catch (error) {
      console.error('Failed to download Chrome:', error);
      this.chromeReady = false;
      return false;
    } finally {
      this.downloadPromise = null;
    }
  }

  /**
   * Show download progress to user
   */
  async downloadWithProgress(onProgress) {
    if (this.chromeReady) {
      return true;
    }

    try {
      onProgress?.({ status: 'checking', message: 'Checking Chrome availability...' });
      
      if (await this.isChromeAvailable()) {
        this.chromeReady = true;
        onProgress?.({ status: 'complete', message: 'Chrome ready' });
        return true;
      }

      onProgress?.({ status: 'downloading', message: 'Downloading Chrome browser...' });
      
      const success = await this.ensureChrome();
      
      if (success) {
        onProgress?.({ status: 'complete', message: 'Chrome download complete' });
      } else {
        onProgress?.({ status: 'error', message: 'Failed to download Chrome' });
      }
      
      return success;

    } catch (error) {
      onProgress?.({ status: 'error', message: `Error: ${error.message}` });
      return false;
    }
  }

  /**
   * Search for existing Chrome installations on the system
   */
  async findSystemChrome() {
    try {
      const fs = await import('fs');
      const { execSync } = await import('child_process');
      
      // Common Chrome installation paths on Windows
      const possiblePaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
        process.env.PROGRAMFILES + '\\Google\\Chrome\\Application\\chrome.exe',
        process.env['PROGRAMFILES(X86)'] + '\\Google\\Chrome\\Application\\chrome.exe'
      ];
      
      // Check each possible path
      for (const chromePath of possiblePaths) {
        if (chromePath && fs.existsSync(chromePath)) {
          console.log('Found system Chrome at:', chromePath);
          
          // Set the executable path
          process.env.PUPPETEER_EXECUTABLE_PATH = chromePath;
          
          // Test if this Chrome works
          if (await this.isChromeAvailable()) {
            console.log('System Chrome is working');
            return true;
          }
        }
      }
      
      // Try to find Chrome using where command (Windows)
      try {
        const chromePath = execSync('where chrome', { encoding: 'utf8' }).trim();
        if (chromePath && fs.existsSync(chromePath)) {
          console.log('Found Chrome via where command:', chromePath);
          process.env.PUPPETEER_EXECUTABLE_PATH = chromePath;
          
          if (await this.isChromeAvailable()) {
            console.log('System Chrome found via where command is working');
            return true;
          }
        }
      } catch (whereError) {
        console.log('where command failed:', whereError.message);
      }
      
      return false;
    } catch (error) {
      console.log('Error searching for system Chrome:', error.message);
      return false;
    }
  }
}

export default new ChromeManager();
