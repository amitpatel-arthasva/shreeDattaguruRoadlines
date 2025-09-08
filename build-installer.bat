@echo off
echo Building Shree Dattagu Roadlines Installer...
echo.

REM Change to project directory
cd /d "%~dp0"

REM Set environment variable to disable code signing
set CSC_IDENTITY_AUTO_DISCOVERY=false

echo Preparing build environment...
call npm install

echo Building the application...
call npm run build

echo Creating installer...
call npm run dist

echo.
if %errorlevel% equ 0 (
    echo ✅ SUCCESS: Installer created successfully!
    echo 📁 Check the 'dist' folder for your installer file.
    echo.
    dir dist\*.exe /b 2>nul
) else (
    echo ❌ ERROR: Build failed with error code %errorlevel%
)

echo.
pause
