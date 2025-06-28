@echo off
echo Installing Puppeteer and downloading Chrome...
cd /d "%~dp0"
call npm install --production --no-optional
call npx puppeteer browsers install chrome
echo Setup complete!
pause
