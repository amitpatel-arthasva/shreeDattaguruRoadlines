# Node.js Bundle for Shree Dattagu Roadlines

This directory contains a portable Node.js installation bundled with the Shree Dattagu Roadlines application.

## Contents

- `node.exe` - Node.js runtime
- `npm.cmd` - Node Package Manager
- `npx.cmd` - Node Package Execute utility
- `install-puppeteer.bat` - Script to install Puppeteer and Chrome
- Various Node.js support files and modules

## Usage

### To install Puppeteer and Chrome for PDF generation:

1. Double-click `install-puppeteer.bat`
2. Wait for the installation to complete (may take several minutes)
3. Chrome browser will be downloaded (~150MB)
4. Puppeteer package will be installed (~5MB)

### Portable Installation

This entire directory can be copied to other Windows machines to provide:
- Node.js runtime environment
- PDF generation capabilities via Puppeteer
- Bundled Chrome browser for PDF rendering

### Requirements

- Windows operating system
- Internet connection (for initial Puppeteer/Chrome download)
- ~200MB free disk space (after Puppeteer/Chrome installation)

### Troubleshooting

If installation fails:
1. Check your internet connection
2. Ensure you have write permissions to this directory
3. Try running `install-puppeteer.bat` as Administrator
4. Check Windows Defender/Antivirus isn't blocking downloads

The installation creates a completion marker at:
`%APPDATA%\ShreedattaguruRoadlines\puppeteer-setup-complete.json`

## Technical Details

- Node.js Version: See `node.exe --version`
- Portable: No system registry changes
- Self-contained: All dependencies included
- Safe: Won't interfere with existing Node.js installations
