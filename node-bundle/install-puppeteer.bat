@echo off
title Puppeteer & Chrome Installation - Shree Dattagu Roadlines
color 0A
echo.
echo ================================================
echo   Puppeteer & Chrome Installation
echo   Shree Dattagu Roadlines
echo ================================================
echo.

echo Starting Puppeteer and Chrome installation...
echo This may take several minutes depending on your internet speed.
echo.

REM Get the directory where this script is located (should be the node-bundle directory)
set "NODE_DIR=%~dp0"

REM Remove trailing backslash if present
if "%NODE_DIR:~-1%"=="\" set "NODE_DIR=%NODE_DIR:~0,-1%"

echo Using Node.js from: %NODE_DIR%
echo.

REM Test Node.js
echo Testing Node.js...
"%NODE_DIR%\node.exe" --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found or not working!
    echo Please ensure node.exe is in the same directory as this script.
    pause
    exit /b 1
)

echo Node.js version:
"%NODE_DIR%\node.exe" --version
echo.

REM Test npm
echo Testing npm...
"%NODE_DIR%\npm.cmd" --version
if %errorlevel% neq 0 (
    echo ERROR: npm not found or not working!
    echo Please ensure npm.cmd is in the same directory as this script.
    pause
    exit /b 1
)

echo npm version:
"%NODE_DIR%\npm.cmd" --version
echo.

echo Installing Puppeteer package...
echo This will download and install Puppeteer (~5MB)
echo.

REM Install Puppeteer using the bundled npm
"%NODE_DIR%\npm.cmd" install puppeteer --no-save --production
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Puppeteer installation failed!
    echo Please check your internet connection and try again.
    echo.
    pause
    exit /b 1
)

echo.
echo Puppeteer installed successfully!
echo.

echo Downloading Chrome browser...
echo This will download Chrome (~150MB) - please be patient...
echo.
echo *** IMPORTANT: Keep this window open until download completes! ***
echo *** The download progress will be shown below: ***
echo.

REM Download Chrome using the bundled npx and puppeteer
"%NODE_DIR%\npx.cmd" puppeteer browsers install chrome
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Chrome download failed!
    echo Please check your internet connection and try again.
    echo.
    echo You can retry this installation later if needed.
    pause
    exit /b 1
)

echo.
echo Creating completion marker...
set "APPDATA_DIR=%APPDATA%\ShreedattaguruRoadlines"
if not exist "%APPDATA_DIR%" mkdir "%APPDATA_DIR%"

echo {"setupCompletedAt": "%date% %time%", "method": "node-bundle", "puppeteerInstalled": true, "chromeDownloaded": true} > "%APPDATA_DIR%\puppeteer-setup-complete.json"

echo.
echo ================================================
echo *** INSTALLATION COMPLETED SUCCESSFULLY! ***
echo.
echo Puppeteer and Chrome are now ready for PDF generation.
echo You can now use the main application for PDF features.
echo.
echo This node-bundle directory contains:
echo - Node.js runtime
echo - npm package manager  
echo - Puppeteer package
echo - Chrome browser (for PDF generation)
echo.
echo You can copy this entire directory to other machines
echo if they need the same PDF generation capabilities.
echo ================================================
echo.
echo Press any key to close this window and return to the application...
pause >nul
