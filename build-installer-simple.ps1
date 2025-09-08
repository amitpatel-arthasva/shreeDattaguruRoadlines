# PowerShell Build Script for Shree Dattagu Roadlines (Simplified)
Write-Host "🔧 Building Shree Dattagu Roadlines Installer (Simplified Build)..." -ForegroundColor Cyan
Write-Host ""

# Change to project directory
Set-Location $PSScriptRoot

# Set environment variable to disable code signing
$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
$env:ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES = "true"

Write-Host "🏗️  Building the application..." -ForegroundColor Yellow
try {
    # Build the frontend only
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "npm run build failed" }
    
    Write-Host "📦 Creating installer (skipping native rebuild)..." -ForegroundColor Yellow
    # Use electron-builder with skip-native-rebuild option
    npx electron-builder --publish=never --config.electronDist=node_modules/electron/dist --config.electronVersion=$(node -e "console.log(require('electron/package.json').version)")
    if ($LASTEXITCODE -ne 0) { throw "electron-builder failed" }
    
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
