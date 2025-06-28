import fs from 'fs';
import path from 'path';
import https from 'https';
import { createWriteStream } from 'fs';
import process from 'process';
import yauzl from 'yauzl';

const NODE_VERSION = '20.18.1'; // LTS version
const ARCH = 'x64';
const NODE_FILENAME = `node-v${NODE_VERSION}-win-${ARCH}`;
const NODE_URL = `https://nodejs.org/dist/v${NODE_VERSION}/${NODE_FILENAME}.zip`;

console.log('📦 Bundling Node.js for Windows installer...');

async function downloadFile(url, destination) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirect
        return downloadFile(response.headers.location, destination)
          .then(resolve)
          .catch(reject);
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      const fileStream = createWriteStream(destination);
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
      
      fileStream.on('error', reject);
    }).on('error', reject);
  });
}

async function extractZip(zipPath, extractPath) {
  return new Promise((resolve, reject) => {
    yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
      if (err) {
        reject(err);
        return;
      }

      zipfile.readEntry();
      
      zipfile.on('entry', (entry) => {
        const entryPath = path.join(extractPath, entry.fileName);
        
        if (/\/$/.test(entry.fileName)) {
          // Directory entry
          fs.mkdirSync(entryPath, { recursive: true });
          zipfile.readEntry();
        } else {
          // File entry
          // Ensure directory exists
          fs.mkdirSync(path.dirname(entryPath), { recursive: true });
          
          zipfile.openReadStream(entry, (err, readStream) => {
            if (err) {
              reject(err);
              return;
            }
            
            const writeStream = createWriteStream(entryPath);
            readStream.pipe(writeStream);
            
            writeStream.on('finish', () => {
              zipfile.readEntry();
            });
            
            writeStream.on('error', reject);
          });
        }
      });
      
      zipfile.on('end', () => {
        resolve();
      });
      
      zipfile.on('error', reject);
    });
  });
}

async function bundleNodeJs() {
  const tempDir = path.join(process.cwd(), 'temp-node');
  const bundleDir = path.join(process.cwd(), 'node-bundle');
  const zipPath = path.join(tempDir, `${NODE_FILENAME}.zip`);

  try {
    // Create temp directory
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Clean existing bundle
    if (fs.existsSync(bundleDir)) {
      fs.rmSync(bundleDir, { recursive: true, force: true });
    }

    console.log(`📥 Downloading Node.js v${NODE_VERSION}...`);
    await downloadFile(NODE_URL, zipPath);

    console.log('📦 Extracting Node.js...');
    await extractZip(zipPath, tempDir);

    // Move extracted folder to bundle directory
    const extractedPath = path.join(tempDir, NODE_FILENAME);
    fs.renameSync(extractedPath, bundleDir);

    // Create a minimal package.json for the bundle
    const bundlePackageJson = {
      name: "shreeDattaguruRoadlines-node-bundle",
      version: "1.0.0",
      description: "Minimal Node.js bundle for Shree Dattagu Roadlines",
      dependencies: {
        "puppeteer": "^24.10.2"
      }
    };

    fs.writeFileSync(
      path.join(bundleDir, 'package.json'),
      JSON.stringify(bundlePackageJson, null, 2)
    );

    // Create setup script for the bundle
    const setupScript = `@echo off
echo Installing Puppeteer and downloading Chrome...
cd /d "%~dp0"
call npm install --production --no-optional
call npx puppeteer browsers install chrome
echo Setup complete!
pause
`;

    fs.writeFileSync(path.join(bundleDir, 'setup.bat'), setupScript);

    // Create a PowerShell version too
    const setupPs1 = `Write-Host "Installing Puppeteer and downloading Chrome..." -ForegroundColor Green
Set-Location $PSScriptRoot
& npm install --production --no-optional
& npx puppeteer browsers install chrome
Write-Host "Setup complete!" -ForegroundColor Green
Read-Host "Press Enter to continue..."
`;

    fs.writeFileSync(path.join(bundleDir, 'setup.ps1'), setupPs1);

    // Cleanup temp directory
    fs.rmSync(tempDir, { recursive: true, force: true });

    console.log('✅ Node.js bundle created successfully!');
    console.log(`📁 Bundle location: ${bundleDir}`);
    console.log('💡 Include this bundle in your installer and run setup.bat during installation');

  } catch (error) {
    console.error('❌ Failed to bundle Node.js:', error.message);
    // Cleanup on error
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    throw error;
  }
}

// Run the bundling process
bundleNodeJs().catch(console.error);
