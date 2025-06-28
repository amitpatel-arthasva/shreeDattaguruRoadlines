@echo off
title Puppeteer Installation - Shree Dattagu Roadlines
echo.
echo ================================================
echo   Puppeteer Installation - Shree Dattagu Roadlines
echo ================================================
echo.

echo Starting Puppeteer and Chrome installation...
echo.

REM Check if Node.js is available
echo Checking for Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found!
    echo.
    echo Please install Node.js first using the Node.js installation button.
    echo.
    pause
    exit /b 1
)

echo Node.js found:
node --version
echo.

REM Check if npm is available
echo Checking for npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm not found!
    echo.
    echo Please ensure Node.js is properly installed.
    echo.
    pause
    exit /b 1
)

echo npm found:
npm --version
echo.

REM Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"

REM Remove trailing backslash from SCRIPT_DIR if present
if "%SCRIPT_DIR:~-1%"=="\" set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

REM Check if we're in a packaged app (resources folder structure)
if exist "%SCRIPT_DIR%\..\app.asar" (
    REM We're in a packaged app - go to parent directory (resources)
    set "RESOURCES_DIR=%SCRIPT_DIR%\.."
    for %%i in ("%RESOURCES_DIR%") do set "APP_DIR=%%~fi"
    echo Detected packaged app environment
) else (
    REM We're in development - go to project root
    for %%i in ("%SCRIPT_DIR%\..") do set "APP_DIR=%%~fi"
    echo Detected development environment
)

echo Changing to application directory: %APP_DIR%
cd /d "%APP_DIR%"

echo.
echo Installing Puppeteer package...
echo This may take a few minutes...
echo.

call npm install puppeteer --production --no-optional
if %errorlevel% neq 0 (
    echo.
    echo WARNING: Puppeteer installation failed with npm.
    echo Trying alternative installation method...
    echo.
    
    REM Try with bundled npm if available
    if exist "node-bundle\npm.cmd" (
        echo Using bundled npm...
        call node-bundle\npm.cmd install puppeteer --production --no-optional
    ) else (
        echo ERROR: Alternative installation method also failed.
        echo.
        echo Please check your internet connection and try again.
        echo.
        pause
        exit /b 1
    )
)

echo.
echo Puppeteer installed successfully!
echo.
echo Downloading Chrome browser...
echo This may take several minutes depending on your internet speed...
echo.

call npx puppeteer browsers install chrome
if %errorlevel% neq 0 (
    echo.
    echo WARNING: Chrome download failed with npx.
    echo Trying alternative method...
    echo.
    
    REM Try with bundled npx if available
    if exist "node-bundle\npx.cmd" (
        echo Using bundled npx...
        call node-bundle\npx.cmd puppeteer browsers install chrome
    ) else (
        echo ERROR: Chrome download failed.
        echo.
        echo Puppeteer is installed but Chrome browser download failed.
        echo PDF generation may not work properly.
        echo.
        echo You can try downloading Chrome manually later from the application settings.
        echo.
        pause
        exit /b 1
    )
)

echo.
echo Creating completion marker...
set "APPDATA_DIR=%APPDATA%\ShreedattaguruRoadlines"
if not exist "%APPDATA_DIR%" mkdir "%APPDATA_DIR%"

echo {"setupCompletedAt": "%date% %time%", "method": "manual-script", "puppeteerInstalled": true, "chromeDownloaded": true} > "%APPDATA_DIR%\puppeteer-setup-complete.json"

echo.
echo ================================================
echo Puppeteer and Chrome installation completed!
echo.
echo PDF generation is now ready to use.
echo You can close this window and use the application.
echo ================================================
echo.
pause
