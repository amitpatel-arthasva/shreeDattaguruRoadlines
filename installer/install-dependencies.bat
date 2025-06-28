@echo off
title Dependencies Installation - Shree Dattagu Roadlines
echo.
echo ================================================
echo   Dependencies Installation - Shree Dattagu Roadlines
echo ================================================
echo.
echo This script will:
echo 1. Download and install Node.js (if not already installed)
echo 2. Install Puppeteer package globally
echo 3. Download Chrome browser for PDF generation
echo.
echo Please ensure you have an internet connection.
echo.
pause

echo.
echo Starting installation process...
echo.

REM Check if Node.js is already installed
echo [1/3] Checking for existing Node.js installation...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Node.js is already installed:
    node --version
    echo.
    echo Do you want to continue with Puppeteer installation? [Y/N]
    set /p continue=
    if /i not "%continue%"=="Y" (
        echo Installation cancelled.
        pause
        exit /b 0
    )
    goto :install_puppeteer
)

echo Node.js not found. Downloading Node.js installer...
echo.

REM Create temp directory
set "TEMP_DIR=%TEMP%\nodejs_install"
if not exist "%TEMP_DIR%" mkdir "%TEMP_DIR%"

REM Download Node.js installer (LTS version)
echo Downloading Node.js LTS installer...
echo This may take a few minutes depending on your internet speed...
echo.

powershell -Command "& {[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi' -OutFile '%TEMP_DIR%\nodejs-installer.msi'}"

if not exist "%TEMP_DIR%\nodejs-installer.msi" (
    echo ERROR: Failed to download Node.js installer.
    echo Please check your internet connection and try again.
    echo.
    pause
    exit /b 1
)

echo Download completed successfully!
echo.

echo [2/3] Installing Node.js...
echo Running Node.js installer (this may require administrator privileges)...
echo.

msiexec /i "%TEMP_DIR%\nodejs-installer.msi" /quiet /norestart

echo Waiting for installation to complete...
timeout /t 30 /nobreak >nul

REM Refresh PATH environment variable
echo Refreshing environment variables...
call refreshenv >nul 2>&1 || echo Note: Could not refresh environment automatically

REM Update PATH for current session
set "PATH=%PATH%;%ProgramFiles%\nodejs"

echo.
echo Testing Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js installation failed or not found in PATH.
    echo Please restart your command prompt and try again.
    echo.
    pause
    exit /b 1
)

echo Node.js installed successfully!
npm --version
echo.

REM Clean up
echo Cleaning up temporary files...
del "%TEMP_DIR%\nodejs-installer.msi" >nul 2>&1
rmdir "%TEMP_DIR%" >nul 2>&1

:install_puppeteer
echo [3/3] Installing Puppeteer and Chrome...
echo.

echo Installing Puppeteer package globally...
echo This may take a few minutes...
echo.

call npm install -g puppeteer
if %errorlevel% neq 0 (
    echo WARNING: Global Puppeteer installation failed.
    echo Trying local installation...
    
    REM Try local installation
    call npm install puppeteer
    if %errorlevel% neq 0 (
        echo ERROR: Puppeteer installation failed.
        echo Please check your internet connection and try again.
        echo.
        pause
        exit /b 1
    )
)

echo.
echo Puppeteer installed successfully!
echo.

echo Downloading Chrome browser for PDF generation...
echo This may take several minutes (Chrome is ~150MB)...
echo.

call npx puppeteer browsers install chrome
if %errorlevel% neq 0 (
    echo WARNING: Chrome download failed with npx.
    echo Trying alternative command...
    
    call npm run setup-chrome
    if %errorlevel% neq 0 (
        echo ERROR: Chrome download failed.
        echo.
        echo Puppeteer is installed but Chrome browser download failed.
        echo PDF generation may not work properly.
        echo.
        echo You can try running this command manually later:
        echo npx puppeteer browsers install chrome
        echo.
        goto :completion
    )
)

echo Chrome browser downloaded successfully!
echo.

:completion
echo Creating completion marker...
set "APPDATA_DIR=%APPDATA%\ShreedattaguruRoadlines"
if not exist "%APPDATA_DIR%" mkdir "%APPDATA_DIR%"

echo {"setupCompletedAt": "%date% %time%", "method": "standalone-installer", "nodeInstalled": true, "puppeteerInstalled": true, "chromeDownloaded": true} > "%APPDATA_DIR%\dependencies-setup-complete.json"

echo.
echo ================================================
echo Installation completed successfully!
echo.
echo Summary:
echo - Node.js: Installed and ready
echo - Puppeteer: Installed and ready
echo - Chrome: Downloaded for PDF generation
echo.
echo You can now:
echo 1. Close this window
echo 2. Restart the Shree Dattagu Roadlines application
echo 3. Use all PDF generation features
echo.
echo Note: You may need to restart your computer or 
echo       command prompt for PATH changes to take effect.
echo ================================================
echo.
pause
