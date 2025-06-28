@echo off
title Node.js Installation - Shree Dattagu Roadlines
echo.
echo ================================================
echo   Node.js Installation - Shree Dattagu Roadlines
echo ================================================
echo.

echo Starting Node.js installation...
echo.

REM Check if Node.js is already installed
echo Checking for existing Node.js installation...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Node.js is already installed:
    node --version
    echo.
    echo Do you want to continue with bundled Node.js setup? [Y/N]
    set /p continue=
    if /i not "%continue%"=="Y" (
        echo Installation cancelled.
        pause
        exit /b 0
    )
)

echo.
echo Setting up bundled Node.js...

REM Get the directory where this script is located
set "SCRIPT_DIR=%~dp0"

REM Remove trailing backslash from SCRIPT_DIR if present
if "%SCRIPT_DIR:~-1%"=="\" set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"

REM Check if we're in a packaged app (resources folder structure)
if exist "%SCRIPT_DIR%\..\app.asar" (
    REM We're in a packaged app - both installer and node-bundle are in resources
    set "RESOURCES_DIR=%SCRIPT_DIR%\.."
    set "BUNDLE_DIR=%RESOURCES_DIR%\node-bundle"
    echo Detected packaged app environment
) else (
    REM We're in development - node-bundle is at project root
    set "BUNDLE_DIR=%SCRIPT_DIR%\..\node-bundle"
    echo Detected development environment
)

REM Convert relative path to absolute path
for %%i in ("%BUNDLE_DIR%") do set "BUNDLE_DIR=%%~fi"

echo Looking for Node.js bundle at: %BUNDLE_DIR%

echo.
echo Debug Information:
echo - Script directory: %SCRIPT_DIR%
echo - Bundle directory: %BUNDLE_DIR%
echo - Bundle directory exists: 
if exist "%BUNDLE_DIR%" (echo YES) else (echo NO)
echo - Node.exe exists: 
if exist "%BUNDLE_DIR%\node.exe" (echo YES) else (echo NO)
echo.

if not exist "%BUNDLE_DIR%\node.exe" (
    echo ERROR: Node.js bundle not found!
    echo Expected location: %BUNDLE_DIR%\node.exe
    echo.
    echo Please ensure you have the complete installation package.
    echo.
    pause
    exit /b 1
)

echo Node.js bundle found: OK
echo.

REM Add bundled Node.js to system PATH (for current user)
echo Adding Node.js to system PATH...

REM Get current user PATH
for /f "skip=2 tokens=3*" %%a in ('reg query HKCU\Environment /v PATH 2^>nul') do set "CURRENT_PATH=%%b"

REM Check if bundle path is already in PATH
echo %CURRENT_PATH% | findstr /i "%BUNDLE_DIR%" >nul
if %errorlevel% neq 0 (
    echo Adding %BUNDLE_DIR% to PATH...
    setx PATH "%BUNDLE_DIR%;%CURRENT_PATH%"
    echo PATH updated successfully.
) else (
    echo Node.js bundle path already in PATH.
)

echo.
echo Refreshing environment...
set "PATH=%BUNDLE_DIR%;%PATH%"

echo.
echo Testing Node.js installation...
"%BUNDLE_DIR%\node.exe" --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js test failed!
    pause
    exit /b 1
)

echo.
echo Testing npm...
"%BUNDLE_DIR%\npm.cmd" --version
if %errorlevel% neq 0 (
    echo ERROR: npm test failed!
    pause
    exit /b 1
)

echo.
echo ================================================
echo Node.js installation completed successfully!
echo.
echo You can now:
echo 1. Close this window
echo 2. Run the Puppeteer installation
echo 3. Restart the application
echo ================================================
echo.
pause
