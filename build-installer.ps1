# PowerShell Build Script for Shree Dattagu Roadlines
Write-Host "🔧 Building Shree Dattagu Roadlines Installer..." -ForegroundColor Cyan
Write-Host ""

# Change to project directory
Set-Location $PSScriptRoot

# Set environment variable to disable code signing
$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"

Write-Host "📦 Preparing build environment..." -ForegroundColor Yellow
try {
    npm install
    if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
    
    Write-Host "🏗️  Building the application..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "npm run build failed" }
    
    Write-Host "📦 Creating installer..." -ForegroundColor Yellow
    npm run dist
    if ($LASTEXITCODE -ne 0) { throw "npm run dist failed" }
    
    Write-Host ""
    Write-Host "✅ SUCCESS: Installer created successfully!" -ForegroundColor Green
    Write-Host "📁 Check the 'dist' folder for your installer file." -ForegroundColor Green
    Write-Host ""
    
    # List created installer files
    Get-ChildItem -Path "dist" -Filter "*.exe" | ForEach-Object {
        Write-Host "  📄 $($_.Name)" -ForegroundColor White
    }
    
} catch {
    Write-Host ""
    Write-Host "❌ ERROR: Build failed - $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please check the error messages above." -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
