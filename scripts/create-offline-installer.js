import fs from 'fs';
import path from 'path';
import process from 'process';

console.log('🔧 Creating offline installer fallback...');

// Create a simple batch script that can setup the application without internet
const offlineSetupScript = `@echo off
title Shree Dattagu Roadlines - Offline Setup
echo.
echo ================================================
echo   Shree Dattagu Roadlines - Offline Setup
echo ================================================
echo.

echo Checking installation...

REM Check if Node.js bundle exists
if not exist "%~dp0nodejs\\node.exe" (
    echo ERROR: Node.js bundle not found!
    echo Please ensure you have the complete installation package.
    pause
    exit /b 1
)

echo Node.js bundle found: OK
echo.

REM Set up environment
set "NODEJS_PATH=%~dp0nodejs"
set "PATH=%NODEJS_PATH%;%PATH%"

echo Setting up application...

REM Create app data directory
set "APPDATA_DIR=%APPDATA%\\ShreedattaguruRoadlines"
if not exist "%APPDATA_DIR%" mkdir "%APPDATA_DIR%"

REM Try to install puppeteer locally
echo Installing PDF generation components...
cd /d "%~dp0"

call "%NODEJS_PATH%\\npm.cmd" install puppeteer --production --no-optional --offline --prefer-offline 2>nul
if %errorlevel% equ 0 (
    echo Puppeteer installed successfully
) else (
    echo Warning: Puppeteer installation failed - trying with cache...
    call "%NODEJS_PATH%\\npm.cmd" install puppeteer --production --no-optional --cache-min 999999 2>nul
)

REM Try to install Chrome (will fail without internet, but that's OK)
echo Attempting to download Chrome browser...
call "%NODEJS_PATH%\\npx.cmd" puppeteer browsers install chrome 2>nul
if %errorlevel% equ 0 (
    echo Chrome downloaded successfully
) else (
    echo Warning: Chrome download failed - PDF generation may not work
    echo You can download Chrome later from the Settings menu
)

REM Create a completion marker
echo {"setupCompletedAt": "%date% %time%", "offlineSetup": true} > "%APPDATA_DIR%\\setup-complete.json"

echo.
echo ================================================
echo Setup completed!
echo.
echo You can now run Shree Dattagu Roadlines
echo ================================================
echo.
pause
`;

const offlineSetupPath = path.join(process.cwd(), 'build', 'offline-setup.bat');

// Ensure build directory exists
const buildDir = path.dirname(offlineSetupPath);
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

fs.writeFileSync(offlineSetupPath, offlineSetupScript);

console.log('✅ Offline installer fallback created!');
console.log(`📁 Location: ${offlineSetupPath}`);
console.log('💡 This script can run even without internet connection');
