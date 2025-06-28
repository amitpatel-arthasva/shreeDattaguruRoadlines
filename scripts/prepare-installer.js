import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import process from 'process';

console.log('🔧 Preparing installer with Node.js bundle...');

async function prepareInstaller() {
  try {
    // Step 1: Bundle Node.js
    console.log('📦 Creating Node.js bundle...');
    execSync('npm run bundle-nodejs', { stdio: 'inherit' });

    // Step 2: Verify the bundle exists
    const bundlePath = path.join(process.cwd(), 'node-bundle');
    if (!fs.existsSync(bundlePath)) {
      throw new Error('Node.js bundle was not created successfully');
    }

    // Step 3: Verify required files in bundle
    const requiredFiles = ['node.exe', 'npm', 'npm.cmd', 'npx', 'npx.cmd'];
    const missingFiles = requiredFiles.filter(file => {
      const filePath = path.join(bundlePath, file);
      return !fs.existsSync(filePath);
    });

    if (missingFiles.length > 0) {
      console.warn(`⚠️  Some Node.js files might be missing: ${missingFiles.join(', ')}`);
    }

    // Step 4: Create offline installer fallback
    console.log('📄 Creating offline installer fallback...');
    execSync('node scripts/create-offline-installer.js', { stdio: 'inherit' });

    // Step 5: Create installer info file
    const installerInfo = {
      createdAt: new Date().toISOString(),
      nodeVersion: '20.18.1',
      bundleSize: getBundleSize(bundlePath),
      requiredDuringInstall: [
        'node.exe',
        'npm',
        'npx'
      ],
      installSteps: [
        'Extract application files',
        'Install bundled Node.js (if not present)',
        'Run npm install puppeteer',
        'Download Chrome browser via Puppeteer',
        'Create shortcuts',
        'Register uninstaller'
      ]
    };

    fs.writeFileSync(
      path.join(process.cwd(), 'installer-info.json'),
      JSON.stringify(installerInfo, null, 2)
    );

    console.log('✅ Installer preparation complete!');
    console.log(`📁 Node.js bundle: ${bundlePath}`);
    console.log(`📄 Bundle size: ${installerInfo.bundleSize} MB`);
    console.log('💡 Ready to build installer with: npm run dist');

  } catch (error) {
    console.error('❌ Installer preparation failed:', error.message);
    process.exit(1);
  }
}

function getBundleSize(bundlePath) {
  try {
    const totalSize = getFolderSize(bundlePath);
    return Math.round(totalSize / (1024 * 1024) * 100) / 100; // MB
  } catch {
    return 'Unknown';
  }
}

function getFolderSize(folderPath) {
  let totalSize = 0;
  
  const files = fs.readdirSync(folderPath);
  
  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      totalSize += getFolderSize(filePath);
    } else {
      totalSize += stats.size;
    }
  }
  
  return totalSize;
}

// Run the preparation
prepareInstaller().catch(console.error);
