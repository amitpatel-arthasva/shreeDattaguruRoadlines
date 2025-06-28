import { app, BrowserWindow, Menu, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';
import { createMenu } from './menu.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import process from 'process';
import { spawn } from 'child_process';
import { generateLorryReceiptPrintPdf } from './pdfService.js';
import chromeManager from './chromeManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let dbManager;

// Initialize database
async function initializeDatabase() {
  try {
    const DatabaseManager = await import('../database/config/database.js');
    dbManager = DatabaseManager.default;
    
    // Set up default database path in user documents
    const documentsPath = app.getPath('documents');
    const appDataPath = path.join(documentsPath, 'ShreedattaguruRoadlines');
    
    // Create app data directory if it doesn't exist
    if (!fs.existsSync(appDataPath)) {
      fs.mkdirSync(appDataPath, { recursive: true });
    }
    
    // Set database path
    dbManager.dbPath = path.join(appDataPath, 'roadlines.db');
    
    await dbManager.initialize();
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    dialog.showErrorBox('Database Error', 'Failed to initialize database: ' + error.message);
  }
}

function createWindow() {
  const preloadPath = path.join(__dirname, 'preload.cjs');
  console.log('Preload script path:', preloadPath);
  console.log('Preload script exists:', fs.existsSync(preloadPath));
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: preloadPath
    },
    show: false
  });

  // Load the app
  let startUrl;
  if (isDev) {
    startUrl = 'http://localhost:5173';
  } else {
    // In production, load from the built files
    // Use process.resourcesPath to get the correct path in packaged app
    const buildPath = path.join(process.resourcesPath, 'app.asar', 'build', 'index.html');
    console.log('Production build path:', buildPath);
    console.log('Build path exists:', fs.existsSync(buildPath));
    startUrl = `file://${buildPath}`;
  }
  
  console.log('Loading URL:', startUrl);
  console.log('isDev:', isDev);
  console.log('__dirname:', __dirname);
  console.log('process.resourcesPath:', process.resourcesPath);
  
  mainWindow.loadURL(startUrl);

  // Debug: Check if preload script loads
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page finished loading');
    
    // Check if electronAPI was exposed
    mainWindow.webContents.executeJavaScript(`
      console.log('Checking electronAPI from main process:');
      console.log('window.electronAPI:', window.electronAPI);
      window.electronAPI ? 'electronAPI is available' : 'electronAPI is NOT available';
    `).then(result => {
      console.log('electronAPI check result:', result);
    }).catch(err => {
      console.error('Error checking electronAPI:', err);
    });
  });

  mainWindow.webContents.on('dom-ready', () => {
    console.log('DOM ready');
  });

  // Add error handling for page load
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Page failed to load:', {
      errorCode,
      errorDescription,
      validatedURL
    });
    
    // If in production and the page fails to load, try alternative path
    if (!isDev && errorCode !== -3) { // -3 is usually a navigation error
      console.log('Trying alternative path...');
      const altPath = path.join(process.resourcesPath, 'app.asar', 'build', 'index.html');
      console.log('Alternative path:', altPath);
      mainWindow.loadURL(`file://${altPath}`);
    }
  });

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Set up menu
  const menu = createMenu();
  Menu.setApplicationMenu(menu);
}

// IPC handlers - Register immediately when module loads
ipcMain.handle('db-query', async (event, sql, params) => {
  try {
    if (!dbManager) {
      throw new Error('Database not initialized');
    }
    return dbManager.query(sql, params);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
});

// Bcrypt handlers for password hashing
ipcMain.handle('bcrypt-hash', async (event, password, saltRounds) => {
  try {
    console.log('Bcrypt hash handler called with saltRounds:', saltRounds);
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    console.error('Bcrypt hash error:', error);
    throw error;
  }
});

ipcMain.handle('bcrypt-compare', async (event, password, hash) => {
  try {
    console.log('Bcrypt compare handler called');
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Bcrypt compare error:', error);
    throw error;
  }
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

ipcMain.handle('select-database-folder', async (event, shouldMigrate = true) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select folder for database storage'
  });
  
  if (!result.canceled && result.filePaths.length > 0) {
    const selectedPath = result.filePaths[0];
    const newDbPath = path.join(selectedPath, 'roadlines.db');
    
    try {
      let migrated = false;
      
      // If migration is requested and we have an existing database
      if (shouldMigrate && dbManager && dbManager.dbPath && fs.existsSync(dbManager.dbPath)) {
        const currentDbPath = dbManager.dbPath;
        
        // Only migrate if it's a different location
        if (currentDbPath !== newDbPath) {
          // Close current database connection
          dbManager.close();
          
          // Copy the existing database to the new location
          try {
            await fs.promises.copyFile(currentDbPath, newDbPath);
            migrated = true;
            console.log(`Database migrated from ${currentDbPath} to ${newDbPath}`);
          } catch (copyError) {
            console.error('Error copying database:', copyError);
            // If copy fails, create a new database at the new location
            dbManager.dbPath = newDbPath;
            await dbManager.initialize();
            return { 
              success: true, 
              path: selectedPath, 
              migrated: false, 
              message: 'New database created (migration failed: ' + copyError.message + ')' 
            };
          }
        }
      }
      
      // Update database path and reinitialize
      if (dbManager) {
        dbManager.dbPath = newDbPath;
        await dbManager.initialize();
      }
      
      return { 
        success: true, 
        path: selectedPath, 
        migrated: migrated,
        message: migrated ? 'Database migrated successfully' : 'Database location updated'
      };
    } catch (error) {
      console.error('Error updating database location:', error);
      return { 
        success: false, 
        message: 'Error updating database location: ' + error.message 
      };
    }
  }
  
  return { success: false, message: 'No folder selected' };
});

ipcMain.handle('get-database-path', () => {
  return dbManager ? path.dirname(dbManager.dbPath) : null;
});

ipcMain.handle('get-version', () => {
  return app.getVersion();
});

// Navigation handlers
ipcMain.handle('navigate-back', () => {
  if (mainWindow && mainWindow.webContents.canGoBack()) {
    mainWindow.webContents.goBack();
    return true;
  }
  return false;
});

ipcMain.handle('navigate-forward', () => {
  if (mainWindow && mainWindow.webContents.canGoForward()) {
    mainWindow.webContents.goForward();
    return true;
  }
  return false;
});

ipcMain.handle('can-go-back', () => {
  return mainWindow ? mainWindow.webContents.canGoBack() : false;
});

ipcMain.handle('can-go-forward', () => {
  return mainWindow ? mainWindow.webContents.canGoForward() : false;
});

// PDF generation handler for lorry receipt print layout
ipcMain.handle('generate-lorry-receipt-print-pdf', async (event, options) => {
  try {
    // Ensure Chrome is available before proceeding
    const chromeAvailable = await chromeManager.ensureChrome();
    if (!chromeAvailable) {
      throw new Error('Chrome browser is required for PDF generation. Please install Chrome from the settings menu.');
    }

    const { data, filename } = options;
    
    if (!data) {
      throw new Error('Lorry receipt data is required');
    }

    // Generate PDF
    const pdfBuffer = await generateLorryReceiptPrintPdf(data, { filename });

    // Show save dialog
    const saveResult = await dialog.showSaveDialog(mainWindow, {
      title: 'Save Lorry Receipt PDF',
      defaultPath: filename || 'LorryReceipt.pdf',
      filters: [
        { name: 'PDF Files', extensions: ['pdf'] }
      ]
    });

    if (saveResult.canceled) {
      return { success: false, message: 'User cancelled save operation' };
    }

    // Save the PDF file
    await fs.promises.writeFile(saveResult.filePath, pdfBuffer);

    // Ask user if they want to open the file
    const openResult = await dialog.showMessageBox(mainWindow, {
      type: 'question',
      buttons: ['Open PDF', 'Close'],
      defaultId: 0,
      title: 'PDF Generated Successfully',
      message: 'Lorry Receipt PDF has been generated successfully.',
      detail: `File saved to: ${saveResult.filePath}\n\nWould you like to open the PDF now?`
    });

    if (openResult.response === 0) {
      // Open the PDF with default application
      await shell.openPath(saveResult.filePath);
    }

    return { success: true, filePath: saveResult.filePath };
  } catch (error) {
    console.error('Error generating lorry receipt print PDF:', error);
    return { success: false, message: error.message };
  }
});

// PDF generation handler for invoice
ipcMain.handle('generate-invoice-pdf', async (event, invoiceData) => {
  try {
    // Ensure Chrome is available before proceeding
    const chromeAvailable = await chromeManager.ensureChrome();
    if (!chromeAvailable) {
      throw new Error('Chrome browser is required for PDF generation. Please install Chrome from the settings menu.');
    }

    if (!invoiceData) {
      throw new Error('Invoice data is required');
    }

    // Import the PDF service and template
    const { generatePdfFromTemplate } = await import('./pdfService.js');
    const invoiceTemplate = await import('./invoiceTemplate.js');

    // Generate PDF buffer using invoice template
    const pdfBuffer = await generatePdfFromTemplate(
      invoiceTemplate.default,
      invoiceData,
      {
        filename: `Invoice-${invoiceData.invoiceNumber}`,
        pdfOptions: {
          format: 'A4',
          printBackground: true,
          margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
        }
      }
    );

    // Extract filename from invoice data
    const defaultFilename = `Invoice-${invoiceData.invoiceNumber || invoiceData.id || 'Unknown'}.pdf`;

    // Show save dialog
    const saveResult = await dialog.showSaveDialog(mainWindow, {
      title: 'Save Invoice PDF',
      defaultPath: defaultFilename,
      filters: [
        { name: 'PDF Files', extensions: ['pdf'] }
      ]
    });

    if (saveResult.canceled) {
      return { success: false, message: 'User cancelled save operation' };
    }

    // Save the PDF file
    await fs.promises.writeFile(saveResult.filePath, pdfBuffer);

    // Ask user if they want to open the file
    const openResult = await dialog.showMessageBox(mainWindow, {
      type: 'question',
      buttons: ['Open PDF', 'Close'],
      defaultId: 0,
      title: 'PDF Generated Successfully',
      message: 'Invoice PDF has been generated successfully.',
      detail: `File saved to: ${saveResult.filePath}\n\nWould you like to open the PDF now?`
    });

    if (openResult.response === 0) {
      // Open the PDF with default application
      await shell.openPath(saveResult.filePath);
    }

    return { success: true, filePath: saveResult.filePath };
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    return { success: false, message: error.message };
  }
});

// PDF generation handlers
ipcMain.handle('generatePdfFromHtml', async (event, htmlContent, options = {}) => {
  try {
    // Ensure Chrome is available before proceeding
    const chromeAvailable = await chromeManager.ensureChrome();
    if (!chromeAvailable) {
      throw new Error('Chrome browser is required for PDF generation. Please install Chrome from the settings menu.');
    }

    if (!mainWindow) {
      throw new Error('Main window not available');
    }

    // Create a temporary HTML file
    const tempHtmlPath = path.join(app.getPath('temp'), `temp_${Date.now()}.html`);
    await fs.promises.writeFile(tempHtmlPath, htmlContent, 'utf8');

    // Load the HTML in a hidden window
    const pdfWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    try {
      // Load the HTML file
      await pdfWindow.loadFile(tempHtmlPath);

      // Generate PDF
      const pdfBuffer = await pdfWindow.webContents.printToPDF({
        format: 'A4',
        landscape: false,
        printBackground: true,
        margin: { 
          top: '1cm', 
          right: '1cm', 
          bottom: '1cm', 
          left: '1cm' 
        },
        ...options
      });

      return pdfBuffer;
    } finally {
      // Clean up
      pdfWindow.close();
      try {
        await fs.promises.unlink(tempHtmlPath);
      } catch (error) {
        console.warn('Error deleting temp HTML file:', error);
      }
    }
  } catch (error) {
    console.error('Error generating PDF from HTML:', error);
    throw error;
  }
});

ipcMain.handle('generatePdfFromUrl', async (event, url, options = {}) => {
  try {
    // Ensure Chrome is available before proceeding
    const chromeAvailable = await chromeManager.ensureChrome();
    if (!chromeAvailable) {
      throw new Error('Chrome browser is required for PDF generation. Please install Chrome from the settings menu.');
    }

    if (!mainWindow) {
      throw new Error('Main window not available');
    }

    // Create a hidden window for PDF generation
    const pdfWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    try {
      // Load the URL
      await pdfWindow.loadURL(url);

      // Generate PDF
      const pdfBuffer = await pdfWindow.webContents.printToPDF({
        format: 'A4',
        landscape: false,
        printBackground: true,
        margin: { 
          top: '1cm', 
          right: '1cm', 
          bottom: '1cm', 
          left: '1cm' 
        },
        ...options
      });

      return pdfBuffer;
    } finally {
      // Clean up
      pdfWindow.close();
    }
  } catch (error) {
    console.error('Error generating PDF from URL:', error);
    throw error;
  }
});

// Chrome download handler for PDF generation
ipcMain.handle('download-chrome', async () => {
  try {
    console.log('Chrome download requested via IPC');
    
    const result = await chromeManager.downloadWithProgress((progress) => {
      // Send progress updates to renderer
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('chrome-download-progress', progress);
      }
    });
    
    console.log('Chrome download result:', result);
    return { success: result };
  } catch (error) {
    console.error('Chrome download failed:', error);
    return { success: false, error: error.message };
  }
});

// Run dependencies installation script
ipcMain.handle('run-dependencies-install', async () => {
  try {
    console.log('Dependencies installation requested via IPC');
    
    // Find the installation script in node-bundle
    let scriptPath;
    
    if (isDev) {
      // In development, look in the project root
      scriptPath = path.join(process.cwd(), 'node-bundle', 'install-puppeteer.bat');
    } else {
      // In production, look in the extraResources folder
      scriptPath = path.join(process.resourcesPath, 'node-bundle', 'install-puppeteer.bat');
    }
    
    console.log('Looking for dependencies install script at:', scriptPath);
    
    if (!fs.existsSync(scriptPath)) {
      // Debug information
      console.log('Script not found. Debug info:');
      console.log('process.resourcesPath:', process.resourcesPath);
      console.log('app.getAppPath():', app.getAppPath());
      console.log('isDev:', isDev);
      
      try {
        console.log('Contents of resources:', fs.readdirSync(process.resourcesPath));
        const nodeBundleDir = path.join(process.resourcesPath, 'node-bundle');
        if (fs.existsSync(nodeBundleDir)) {
          console.log('Contents of node-bundle dir:', fs.readdirSync(nodeBundleDir));
        } else {
          console.log('node-bundle directory does not exist at:', nodeBundleDir);
        }
      } catch (e) {
        console.log('Error reading directories:', e.message);
      }
      
      throw new Error(`Installation script not found at: ${scriptPath}`);
    }

    return new Promise((resolve) => {
      // Use 'start' command to open a new visible command prompt window
      // The /wait flag makes the start command wait for the batch file to complete
      spawn('cmd', ['/c', 'start', `"Puppeteer Installation"`, `"${scriptPath}"`], {
        detached: false,
        stdio: 'ignore'
      });
      
      // Give it a moment to start, then resolve
      setTimeout(() => {
        resolve({ success: true, message: 'Dependencies installation script started in new window' });
      }, 1000);
    });
    
  } catch (error) {
    console.error('Dependencies installation failed:', error);
    return { success: false, error: error.message };
  }
});

app.whenReady().then(async () => {
  await initializeDatabase();
  createWindow();
});

app.on('window-all-closed', async () => {
  try {
    // Clean up database connection
    if (dbManager) {
      dbManager.close();
    }
    
    // Clean up browser instance
    const { closeBrowserInstance } = await import('./pdfService.js');
    await closeBrowserInstance();
    
    // Force quit on all platforms for built app
    app.quit();
  } catch (error) {
    console.error('Error during window-all-closed cleanup:', error);
    // Force quit even if cleanup fails
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', async () => {
  try {
    // Clean up database connection
    if (dbManager) {
      dbManager.close();
    }
    
    // Clean up browser instance
    const { closeBrowserInstance } = await import('./pdfService.js');
    await closeBrowserInstance();
  } catch (error) {
    console.error('Error during before-quit cleanup:', error);
  }
});

// Add proper cleanup for all processes
app.on('will-quit', async (event) => {
  event.preventDefault(); // Prevent immediate quit
  
  try {
    // Set a timeout to force quit after 5 seconds
    const forceQuitTimer = setTimeout(() => {
      console.log('Force quitting after timeout');
      process.exit(0);
    }, 5000);

    // Close database connection
    if (dbManager) {
      dbManager.close();
    }
    
    // Close browser instance from pdfService
    const { closeBrowserInstance } = await import('./pdfService.js');
    await closeBrowserInstance();
    
    console.log('All processes cleaned up successfully');
    clearTimeout(forceQuitTimer);
    app.exit(0); // Force exit
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
});

// Handle process termination signals
process.on('SIGINT', async () => {
  console.log('Received SIGINT, cleaning up...');
  try {
    if (dbManager) {
      dbManager.close();
    }
    const { closeBrowserInstance } = await import('./pdfService.js');
    await closeBrowserInstance();
  } catch (error) {
    console.error('Error during SIGINT cleanup:', error);
  } finally {
    process.exit(0);
  }
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, cleaning up...');
  try {
    if (dbManager) {
      dbManager.close();
    }
    const { closeBrowserInstance } = await import('./pdfService.js');
    await closeBrowserInstance();
  } catch (error) {
    console.error('Error during SIGTERM cleanup:', error);
  } finally {
    process.exit(0);
  }
});

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
