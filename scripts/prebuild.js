import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import process from 'process';

console.log('🔧 Pre-build: Setting up Chrome for bundling...');

const chromeDir = path.join(process.cwd(), 'chrome-bundle');

// Create chrome bundle directory
if (!fs.existsSync(chromeDir)) {
  fs.mkdirSync(chromeDir, { recursive: true });
}

try {
  // Download Chrome to a specific directory for bundling
  console.log('📥 Downloading Chrome for bundling...');
  
  // Set environment variables for consistent Chrome location
  const env = {
    ...process.env,
    PUPPETEER_CACHE_DIR: chromeDir,
    PUPPETEER_SKIP_DOWNLOAD: 'false'
  };
  
  execSync('npx puppeteer browsers install chrome', { 
    stdio: 'inherit',
    shell: true, // Important for Windows
    env: env,
    timeout: 600000 // 10 minute timeout for slow connections
  });
  
  console.log('✅ Chrome downloaded successfully for bundling!');
  
  // Debug: List all contents of chrome-bundle directory
  console.log('📋 Debugging: Contents of chrome-bundle directory:');
  try {
    listDirectoryContents(chromeDir, 0, 3); // List up to 3 levels deep
  } catch (debugError) {
    console.log('Error listing directory contents:', debugError.message);
  }
  
  // Verify Chrome was actually downloaded
  const chromeFound = findChromeExecutable(chromeDir);
  if (!chromeFound) {
    // Try to find it using the exact pattern from Puppeteer output
    console.log('🔍 Trying to find Chrome using expected Puppeteer path pattern...');
    const expectedPath = findChromeByPattern(chromeDir);
    if (expectedPath) {
      console.log('✅ Chrome found via pattern matching:', expectedPath);
      // Create manifest with found path
      const manifest = {
        bundledAt: new Date().toISOString(),
        chromeVersion: 'latest',
        chromePath: expectedPath,
        platform: process.platform,
        arch: process.arch
      };
      
      fs.writeFileSync(
        path.join(chromeDir, 'bundle-manifest.json'),
        JSON.stringify(manifest, null, 2)
      );
      
      console.log('🎉 Pre-build Chrome setup complete!');
      process.exit(0);
    } else {
      throw new Error('Chrome executable not found after download');
    }
  }
  
  console.log('✅ Chrome executable verified at:', chromeFound);
  
  // Create a manifest file to track what we bundled
  const manifest = {
    bundledAt: new Date().toISOString(),
    chromeVersion: 'latest',
    chromePath: chromeFound,
    platform: process.platform,
    arch: process.arch
  };
  
  fs.writeFileSync(
    path.join(chromeDir, 'bundle-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  
} catch (error) {
  console.error('❌ Failed to download Chrome for bundling:', error.message);
  console.log('⚠️  This will cause PDF generation to fail in the built app.');
  console.log('💡 Make sure you have a stable internet connection and try again.');
  
  // Don't fail the build, but warn the user
  process.exit(1);
}

// Function to list directory contents for debugging
function listDirectoryContents(dir, currentDepth = 0, maxDepth = 2) {
  if (currentDepth > maxDepth) return;
  
  try {
    const items = fs.readdirSync(dir);
    const indent = '  '.repeat(currentDepth);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          console.log(`${indent}📁 ${item}/`);
          listDirectoryContents(fullPath, currentDepth + 1, maxDepth);
        } else {
          console.log(`${indent}📄 ${item}`);
        }
      } catch {
        console.log(`${indent}❌ ${item} (access denied)`);
      }
    }
  } catch (error) {
    console.log(`Error reading directory ${dir}:`, error.message);
  }
}

// Function to find Chrome using expected Puppeteer patterns
function findChromeByPattern(baseDir) {
  const patterns = [
    // Windows patterns based on Puppeteer output
    'chrome/win64-*/chrome-win64/chrome.exe',
    'chrome/win32-*/chrome-win32/chrome.exe',
    // Linux patterns
    'chrome/linux-*/chrome-linux64/chrome',
    'chrome/linux-*/chrome-linux/chrome',
    // macOS patterns
    'chrome/mac-*/chrome-mac64/Chromium.app/Contents/MacOS/Chromium',
    'chrome/mac-*/chrome-mac/Chromium.app/Contents/MacOS/Chromium'
  ];
  
  for (const pattern of patterns) {
    console.log(`🔍 Checking pattern: ${pattern}`);
    
    // Split pattern to handle wildcards manually
    const parts = pattern.split('/');
    let currentPath = baseDir;
    let success = true;
    
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      
      if (part.includes('*')) {
        // Handle wildcard by finding matching directories
        try {
          const items = fs.readdirSync(currentPath);
          const prefix = part.split('*')[0];
          const suffix = part.split('*')[1] || '';
          
          const matches = items.filter(item => {
            const itemPath = path.join(currentPath, item);
            return fs.statSync(itemPath).isDirectory() && 
                   item.startsWith(prefix) && 
                   item.endsWith(suffix);
          });
          
          if (matches.length > 0) {
            currentPath = path.join(currentPath, matches[0]);
            console.log(`  ✅ Found wildcard match: ${matches[0]}`);
          } else {
            console.log(`  ❌ No wildcard match for: ${part}`);
            success = false;
            break;
          }
        } catch {
          success = false;
          break;
        }
      } else {
        // Regular path part
        currentPath = path.join(currentPath, part);
      }
    }
    
    if (success && fs.existsSync(currentPath)) {
      console.log(`✅ Found Chrome executable: ${currentPath}`);
      return currentPath;
    }
  }
  
  return null;
}

// Helper function to find Chrome executable
function findChromeExecutable(baseDir) {
  console.log('Searching for Chrome executable in:', baseDir);
  
  try {
    // Look for chrome.exe recursively in the directory
    const chromeExePath = findChromeRecursively(baseDir);
    
    if (chromeExePath) {
      console.log('Chrome executable found at:', chromeExePath);
      return chromeExePath;
    } else {
      console.log('No Chrome executable found in:', baseDir);
      return null;
    }
  } catch (error) {
    console.error('Error finding Chrome executable:', error.message);
    return null;
  }
}

// Recursive function to find Chrome executable
function findChromeRecursively(dir) {
  try {
    const files = fs.readdirSync(dir);
    
    // First check for chrome.exe in current directory
    for (const file of files) {
      if (file === 'chrome.exe' || file === 'chrome' || file === 'Chromium') {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isFile()) {
          return fullPath;
        }
      }
    }
    
    // Then search subdirectories
    for (const file of files) {
      const fullPath = path.join(dir, file);
      try {
        if (fs.statSync(fullPath).isDirectory()) {
          const result = findChromeRecursively(fullPath);
          if (result) {
            return result;
          }
        }
      } catch {
        // Skip files/directories we can't access
        continue;
      }
    }
  } catch {
    // Directory doesn't exist or is not accessible
  }
  
  return null;
}

console.log('🎉 Pre-build Chrome setup complete!');
