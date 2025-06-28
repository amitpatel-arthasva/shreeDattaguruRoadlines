# Shree Dattagu Roadlines - Installer Setup

This document explains the installer setup process that bundles Node.js and enables Puppeteer to work during installation.

## Overview

The installer now includes:
- **Minimal Node.js Bundle** (~50MB): Portable Node.js installation for Windows x64
- **Automatic Puppeteer Setup**: Downloads Chrome browser during installation
- **Offline Fallback**: Works even without internet (with limited PDF functionality)

## Building the Installer

### Prerequisites
- Windows 10/11 
- PowerShell 5.0+ (for automatic extraction)
- Internet connection (for downloading Node.js bundle)

### Build Process

1. **Prepare the installer with Node.js bundle:**
   ```powershell
   npm run prepare-installer
   ```

2. **Build the complete installer:**
   ```powershell
   npm run dist
   ```

3. **Build for development/testing:**
   ```powershell
   npm run electron-build
   ```

## What Happens During Installation

### Automatic Installation Steps:
1. **Extract Application Files** - Main app files to Program Files
2. **Check Node.js** - Detects if Node.js is already installed system-wide
3. **Install Bundled Node.js** - If not found, uses the bundled portable version
4. **Setup Puppeteer** - Installs Puppeteer package using bundled/system Node.js
5. **Download Chrome** - Downloads Chrome browser for PDF generation
6. **Create Shortcuts** - Desktop and Start Menu shortcuts
7. **Register Application** - Windows Add/Remove Programs entry

### Fallback Options:
- If internet fails during installation, PDF generation can be set up later
- Offline setup script available for completely offline installations
- Manual Chrome installation option in application settings

## Files Created

### During Build:
- `node-bundle/` - Portable Node.js installation (Windows x64)
- `installer-info.json` - Build information and requirements
- `build/offline-setup.bat` - Offline installation fallback

### During Installation:
- `%PROGRAMFILES%/Shree Dattagu Roadlines/` - Application files
- `%PROGRAMFILES%/Shree Dattagu Roadlines/nodejs/` - Bundled Node.js (if needed)
- `%APPDATA%/ShreedattaguruRoadlines/` - User data and Chrome cache
- Registry entries for uninstallation

## Troubleshooting

### Installation Issues:
- **Chrome download fails**: Run the application and use Settings > Setup PDF Generation
- **Node.js bundle missing**: Re-run `npm run prepare-installer`
- **Permission errors**: Run installer as Administrator

### Manual Setup:
If automatic setup fails, users can:
1. Open the application
2. Go to Settings > System Settings
3. Click "Setup PDF Generation"
4. Follow the manual setup wizard

## Technical Details

### Node.js Bundle:
- **Version**: 20.18.1 LTS
- **Architecture**: Windows x64
- **Size**: ~50MB
- **Location**: Downloaded from nodejs.org during build

### Puppeteer Integration:
- **Version**: 24.10.2
- **Chrome Version**: Latest stable
- **Cache Location**: `%APPDATA%/ShreedattaguruRoadlines/.cache/puppeteer`

### Installer Technology:
- **Framework**: Electron Builder with NSIS
- **Type**: Windows NSIS installer
- **Admin Rights**: Required for Program Files installation
- **Uninstaller**: Automatic creation and registration

## Build Scripts Reference

| Script | Purpose |
|--------|---------|
| `npm run bundle-nodejs` | Download and prepare Node.js bundle |
| `npm run prepare-installer` | Complete installer preparation |
| `npm run dist` | Build final installer package |
| `npm run electron-build` | Development build with installer |

## File Size Expectations

- **Node.js Bundle**: ~50MB
- **Application**: ~200MB
- **Chrome Download**: ~120MB (during installation)
- **Total Installation**: ~370MB

## Support

For installation issues:
- Check Windows Event Viewer for detailed error logs
- Run installer from Command Prompt to see detailed output
- Use offline-setup.bat for internet connectivity issues
