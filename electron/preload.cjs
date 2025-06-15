const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script loaded (CommonJS version)');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  query: (sql, params) => {
    console.log('electronAPI.query called with:', sql);
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
  getVersion: () => ipcRenderer.invoke('get-version'),
  
  // File operations
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  // Window operations
  closeWindow: () => ipcRenderer.invoke('close-window'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  
  // Bcrypt operations for password hashing (via IPC)
  bcrypt: {
    hash: (password, saltRounds) => ipcRenderer.invoke('bcrypt-hash', password, saltRounds),
    compare: (password, hash) => ipcRenderer.invoke('bcrypt-compare', password, hash)
  }
});

console.log('electronAPI exposed to main world');
