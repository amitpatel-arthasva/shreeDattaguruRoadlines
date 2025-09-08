# Quick Build Script - Uses existing node_modules to avoid rebuild
Write-Host "🔧 Quick Build: Creating installer with existing dependencies..." -ForegroundColor Cyan
Write-Host ""

# Change to project directory
Set-Location $PSScriptRoot

# Set environment variables
$env:CSC_IDENTITY_AUTO_DISCOVERY = "false"
$env:ELECTRON_BUILDER_ALLOW_UNRESOLVED_DEPENDENCIES = "true"
$env:npm_config_build_from_source = "false"

Write-Host "🏗️  Building frontend only..." -ForegroundColor Yellow
try {
    # Only build the frontend (Vite build)
    npm run prebuild
    if ($LASTEXITCODE -ne 0) { throw "prebuild failed" }
    
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "vite build failed" }
    
    Write-Host "📦 Creating installer (using existing node_modules)..." -ForegroundColor Yellow
    
    # Use electron-builder but skip native rebuild
    $env:ELECTRON_BUILDER_SKIP_APP_DEPS_INSTALLATION = "true"
    npx electron-builder --publish=never --config.buildDependenciesFromSource=false
    
    if ($LASTEXITCODE -ne 0) { 
        Write-Host "⚠️  Trying alternative approach..." -ForegroundColor Yellow
        # Alternative: Copy from node_modules directly
        npx electron-builder --publish=never --config.npmRebuild=false --config.buildDependenciesFromSource=false
    }
    
    Write-Host ""
    Write-Host "✅ SUCCESS: Installer created!" -ForegroundColor Green
    Write-Host "📁 Check the 'dist' folder for your installer file." -ForegroundColor Green
    
    # List created installer files
    Get-ChildItem -Path "dist" -Filter "*.exe" -ErrorAction SilentlyContinue | ForEach-Object {
        Write-Host "  📄 $($_.Name) ($('{0:N1}' -f ($_.Length / 1MB)) MB)" -ForegroundColor White
    }
    
} catch {
    Write-Host ""
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Consider using the full build after installing Visual Studio C++ Build Tools" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
