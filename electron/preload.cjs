const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script loaded (CommonJS version)');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  query: (sql, params) => {
    return ipcRenderer.invoke('db-query', sql, params);
  },
    // Database path management
  selectDatabaseFolder: (shouldMigrate = true) => {
    console.log('electronAPI.selectDatabaseFolder called with migration:', shouldMigrate);
    return ipcRenderer.invoke('select-database-folder', shouldMigrate);
  },
  getDatabasePath: () => {
    console.log('electronAPI.getDatabasePath called');
    return ipcRenderer.invoke('get-database-path');
  },
  
  // App operations
  getVersion: () => ipcRenderer.invoke('get-version'),    // File operations
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
    // PDF operations
  generateLorryReceiptPrintPdf: (options) => {
    console.log('electronAPI.generateLorryReceiptPrintPdf called with:', options);
    return ipcRenderer.invoke('generate-lorry-receipt-print-pdf', options);
  },
  generateInvoicePdf: (invoiceData) => {
    console.log('electronAPI.generateInvoicePdf called with:', invoiceData);
    return ipcRenderer.invoke('generate-invoice-pdf', invoiceData);
  },
  generatePdfFromHtml: (htmlContent, options) => {
    console.log('electronAPI.generatePdfFromHtml called');
    return ipcRenderer.invoke('generatePdfFromHtml', htmlContent, options);
  },
  generatePdfFromUrl: (url, options) => {
    console.log('electronAPI.generatePdfFromUrl called');
    return ipcRenderer.invoke('generatePdfFromUrl', url, options);
  },
  
  // Navigation operations
  navigateBack: () => ipcRenderer.invoke('navigate-back'),
  navigateForward: () => ipcRenderer.invoke('navigate-forward'),
  canGoBack: () => ipcRenderer.invoke('can-go-back'),
  canGoForward: () => ipcRenderer.invoke('can-go-forward'),
  
  // Window operations
  closeWindow: () => ipcRenderer.invoke('close-window'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),  
  // Bcrypt operations for password hashing (via IPC)
  bcrypt: {
    hash: (password, saltRounds) => ipcRenderer.invoke('bcrypt-hash', password, saltRounds),
    compare: (password, hash) => ipcRenderer.invoke('bcrypt-compare', password, hash)
  },
  
  // Chrome download for PDF generation
  downloadChrome: () => {
    return ipcRenderer.invoke('download-chrome');
  },
  
  // Installation scripts
  runDependenciesInstall: () => {
    return ipcRenderer.invoke('run-dependencies-install');
  },
  
  // Listen for Chrome download progress
  onChromeDownloadProgress: (callback) => {
    ipcRenderer.on('chrome-download-progress', (event, progress) => {
      callback(progress);
    });
    
    return () => {
      ipcRenderer.removeAllListeners('chrome-download-progress');
    };
  }
});

console.log('electronAPI exposed to main world');
