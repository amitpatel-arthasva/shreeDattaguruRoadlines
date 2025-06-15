import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';
import { createMenu } from './menu.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

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
  const startUrl = isDev 
    ? 'http://localhost:5173' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  console.log('Loading URL:', startUrl);
  console.log('isDev:', isDev);
  
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

app.whenReady().then(async () => {
  await initializeDatabase();
  createWindow();
});

app.on('window-all-closed', () => {
  if (dbManager) {
    dbManager.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (dbManager) {
    dbManager.close();
  }
});
