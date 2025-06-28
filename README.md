# Shree Dattagu Roadlines - Desktop Application

A comprehensive desktop application for managing roadlines business operations including quotations, lorry receipts, company management, and more.

## Project Structure

```
├── package.json                    # Main Electron app package
├── electron/                       # Electron main process
│   ├── main.js                    # Main Electron process
│   ├── preload.js                 # Preload script for security
│   └── menu.js                    # Application menu
├── src/                           # React frontend
│   ├── components/                # Reusable UI components
│   ├── pages/                     # Page components
│   ├── services/                  # API and external services
│   │   └── apiService.js         # Main API service
│   ├── contexts/                  # React contexts for state management
│   │   └── AppContext.jsx        # Main application context
│   └── utils/                     # Utility functions
│       └── helpers.js            # Common helper functions
├── database/                      # SQLite database layer
│   ├── config/
│   │   └── database.js           # SQLite connection config
│   ├── migrations/               # Database migrations
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_companies.sql
│   │   ├── 003_create_quotations.sql
│   │   └── 004_create_lorry_receipts.sql
│   ├── models/                   # SQLite models/queries
│   │   ├── User.js
│   │   ├── Company.js
│   │   ├── Quotation.js
│   │   └── LorryReceipt.js
│   └── seeders/                  # Initial data
│       └── initial_data.sql
├── api/                          # Local API layer
│   ├── controllers/
│   │   ├── UserController.js
│   │   └── CompanyController.js
│   ├── routes/
│   │   ├── users.js
│   │   └── companies.js
│   └── middleware/
│       └── errorHandler.js
├── assets/                       # Static assets
│   └── images/
├── build/                        # Build output (Vite)
└── dist/                         # Distribution files (Electron Builder)
```

## Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```
   
   **Note:** Chrome will be automatically set up during installation.

2. **Development Mode**
   ```bash
   npm run electron-dev
   ```
   This will start both the Vite dev server and Electron app.

3. **Build for Production**
   ```bash
   npm run dist
   ```
   This will bundle Chrome with the installer, so end users don't need to install it separately.

## Building Distribution

### What gets bundled:
- ✅ **Chrome Browser**: Automatically bundled with the installer
- ✅ **All Dependencies**: No need for users to run npm install
- ✅ **SQLite Database**: Portable database included
- ✅ **Assets & Templates**: All resources included

### Installer Features:
- 📁 **Installation Directory Choice**: Users can choose where to install
- 🖥️ **Desktop Shortcut**: Automatically created
- 📋 **Start Menu Entry**: Added to Windows Start Menu
- 🔄 **Auto-updater Ready**: Configured for future updates

## Troubleshooting

### PDF Generation Issues
If you encounter "Could not find Chrome" errors:

1. **For Development:** Run `npm run setup-chrome`
2. **For Production:** Chrome is bundled automatically - no action needed
3. **Manual Fix:** Set the `PUPPETEER_EXECUTABLE_PATH` environment variable

### Native Module Issues
If you encounter rebuild errors during installation:
```bash
npm run rebuild-safe
```

## Scripts

- `npm run dev` - Start Vite development server
- `npm run build` - Build React app for production
- `npm run electron` - Start Electron app (production mode)
- `npm run electron-dev` - Start in development mode
- `npm run electron-build` - Build Electron app
- `npm run dist` - Create distribution package
