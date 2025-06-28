import { execSync } from 'child_process';
import path from 'path';
import process from 'process';
import fs from 'fs';

console.log('🔧 Post-install: Installing Chrome for PDF generation...');

try {
  // Get the app installation directory
  const appPath = process.cwd();
  
  // Set up Chrome cache directory in user's AppData
  const userDataPath = process.env.APPDATA || process.env.HOME;
  const appName = 'ShreedattaguruRoadlines';
  const chromeCacheDir = path.join(userDataPath, appName, '.cache', 'puppeteer');
  
  // Create the cache directory
  if (!fs.existsSync(chromeCacheDir)) {
    fs.mkdirSync(chromeCacheDir, { recursive: true });
  }
  
  console.log('📥 Installing Chrome using Puppeteer...');
  console.log('Chrome will be installed to:', chromeCacheDir);
  
  // Install Chrome using puppeteer with Windows support
  execSync('npx puppeteer browsers install chrome', {
    stdio: 'inherit',
    shell: true, // Important for Windows
    cwd: appPath,
    env: {
      ...process.env,
      PUPPETEER_CACHE_DIR: chromeCacheDir
    },
    timeout: 600000 // 10 minute timeout
  });
  
  console.log('✅ Chrome installed successfully!');
  
  // Create completion marker
  const completionMarker = {
    installedAt: new Date().toISOString(),
    chromeCacheDir: chromeCacheDir,
    version: '1.0.0',
    installedBy: 'installer-postinstall'
  };
  
  const appDataDir = path.join(userDataPath, appName);
  if (!fs.existsSync(appDataDir)) {
    fs.mkdirSync(appDataDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(appDataDir, 'chrome-install-complete.json'),
    JSON.stringify(completionMarker, null, 2)
  );
  
  console.log('🎉 Chrome installation completed successfully!');
  
} catch (error) {
  console.error('❌ Chrome installation failed:', error.message);
  console.log('⚠️  PDF generation may not work until Chrome is installed manually.');
  console.log('💡 Users can install Chrome from the Settings menu in the application.');
  
  // Create error marker
  const userDataPath = process.env.APPDATA || process.env.HOME;
  const appName = 'ShreedattaguruRoadlines';
  const appDataDir = path.join(userDataPath, appName);
  
  if (!fs.existsSync(appDataDir)) {
    fs.mkdirSync(appDataDir, { recursive: true });
  }
  
  const errorMarker = {
    errorAt: new Date().toISOString(),
    error: error.message,
    needsManualInstall: true
  };
  
  fs.writeFileSync(
    path.join(appDataDir, 'chrome-install-error.json'),
    JSON.stringify(errorMarker, null, 2)
  );
  
  // Don't fail the installer, just log the error
  process.exit(0);
}
