import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import process from 'process';

console.log('📦 Post-install: Setting up development environment...');

try {
  // Only rebuild native modules that need it and skip problematic ones
  console.log('🔧 Rebuilding native modules safely...');
  
  // Try to rebuild only bcrypt which is essential, skip better-sqlite3 if it's already working
  try {
    execSync('electron-rebuild --force --only=bcrypt', { stdio: 'inherit' });
    console.log('✅ bcrypt rebuilt successfully');
  } catch {
    console.log('⚠️  bcrypt rebuild failed, but continuing...');
  }
  
  // Install Chrome for PDF generation
  console.log('🔧 Post-install: Installing Chrome for PDF generation...');
  
  const appDataPath = process.env.APPDATA || process.env.HOME;
  const appName = 'ShreedattaguruRoadlines';
  const appDataDir = path.join(appDataPath, appName);

  // Create app data directory if it doesn't exist
  if (!fs.existsSync(appDataDir)) {
    fs.mkdirSync(appDataDir, { recursive: true });
  }

  const chromeCacheDir = path.join(appDataDir, '.cache', 'puppeteer');

  try {
    console.log('📥 Installing Chrome using Puppeteer...');
    
    // Install Chrome using puppeteer with proper Windows support
    execSync('npx puppeteer browsers install chrome', { 
      stdio: 'inherit',
      shell: true, // Important for Windows
      env: {
        ...process.env,
        PUPPETEER_CACHE_DIR: chromeCacheDir
      }
    });
    
    console.log('✅ Chrome installed successfully!');
    
    // Create a completion marker
    const completionMarker = {
      installedAt: new Date().toISOString(),
      chromeCacheDir: chromeCacheDir,
      version: '1.0.0',
      installedBy: 'npm-postinstall'
    };
    
    fs.writeFileSync(
      path.join(appDataDir, 'chrome-install-complete.json'),
      JSON.stringify(completionMarker, null, 2)
    );
    
  } catch (error) {
    console.error('❌ Chrome installation failed:', error.message);
    console.log('⚠️  Chrome installation failed. Users can install Chrome manually from the settings menu.');
    
    // Create an error marker so the app knows to prompt for manual installation
    const errorMarker = {
      errorAt: new Date().toISOString(),
      error: error.message,
      needsManualInstall: true
    };
    
    fs.writeFileSync(
      path.join(appDataDir, 'chrome-install-error.json'),
      JSON.stringify(errorMarker, null, 2)
    );
  }
  
} catch {
  console.log('⚠️  Some post-install steps failed, but the app should still work');
  console.log('💡 If you encounter issues, try running: npm run setup');
}

console.log('🎉 Post-install complete!');
