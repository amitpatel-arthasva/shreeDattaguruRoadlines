import { Menu, app, BrowserWindow } from 'electron';

export function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New Quotation',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            // Handle new quotation
          }
        },
        {
          label: 'New Lorry Receipt',
          accelerator: 'CmdOrCtrl+Shift+N',
          click: () => {
            // Handle new lorry receipt
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Navigate',
      submenu: [
        {
          label: 'Back',
          accelerator: 'Alt+Left',
          click: () => {
            const focusedWindow = BrowserWindow.getFocusedWindow();
            if (focusedWindow && focusedWindow.webContents.canGoBack()) {
              focusedWindow.webContents.goBack();
            }
          }
        },
        {
          label: 'Forward',
          accelerator: 'Alt+Right',
          click: () => {
            const focusedWindow = BrowserWindow.getFocusedWindow();
            if (focusedWindow && focusedWindow.webContents.canGoForward()) {
              focusedWindow.webContents.goForward();
            }
          }
        },
        { type: 'separator' },
      ]
    },    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'About',
          click: () => {
            // Handle about dialog
          }
        }
      ]
    }
  ];

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }
  return Menu.buildFromTemplate(template);
}
