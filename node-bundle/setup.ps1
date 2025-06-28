Write-Host "Installing Puppeteer and downloading Chrome..." -ForegroundColor Green
Set-Location $PSScriptRoot
& npm install --production --no-optional
& npx puppeteer browsers install chrome
Write-Host "Setup complete!" -ForegroundColor Green
Read-Host "Press Enter to continue..."
