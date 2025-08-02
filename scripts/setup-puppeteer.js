import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import process from 'process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.dirname(__dirname);
const puppeteerCacheDir = path.join(projectRoot, 'puppeteer-cache');

/**
 * Setup Puppeteer with Chromium in a custom cache directory
 */
async function setupPuppeteer() {
  console.log('Setting up Puppeteer with bundled Chromium...');
  
  try {
    // Ensure the puppeteer-cache directory exists
    if (!fs.existsSync(puppeteerCacheDir)) {
      fs.mkdirSync(puppeteerCacheDir, { recursive: true });
      console.log(`Created puppeteer cache directory: ${puppeteerCacheDir}`);
    }

    // Set environment variables for Puppeteer
    process.env.PUPPETEER_CACHE_DIR = puppeteerCacheDir;
    process.env.PUPPETEER_SKIP_DOWNLOAD = 'false';

    console.log('Environment variables set:');
    console.log(`PUPPETEER_CACHE_DIR: ${process.env.PUPPETEER_CACHE_DIR}`);
    console.log(`PUPPETEER_SKIP_DOWNLOAD: ${process.env.PUPPETEER_SKIP_DOWNLOAD}`);

    // Install Chromium using Puppeteer's browser installer
    console.log('Installing Chromium...');
    try {
      execSync('npx puppeteer browsers install chrome', {
        stdio: 'inherit',
        env: {
          ...process.env,
          PUPPETEER_CACHE_DIR: puppeteerCacheDir,
          PUPPETEER_SKIP_DOWNLOAD: 'false'
        }
      });
      console.log('✅ Chromium installed successfully!');
    } catch (installError) {
      console.warn('Puppeteer browsers install failed:', installError.message);
      console.warn('Trying alternative method...');
      
      // Alternative: Force re-install Puppeteer to download Chromium
      execSync('npm rebuild puppeteer', {
        stdio: 'inherit',
        env: {
          ...process.env,
          PUPPETEER_CACHE_DIR: puppeteerCacheDir,
          PUPPETEER_SKIP_DOWNLOAD: 'false'
        }
      });
      console.log('✅ Chromium installed via puppeteer rebuild!');
    }

    // Verify installation
    const chromiumDirs = fs.readdirSync(puppeteerCacheDir);
    if (chromiumDirs.length > 0) {
      console.log('✅ Chromium directories found in cache:');
      chromiumDirs.forEach(dir => {
        console.log(`  - ${dir}`);
      });
      
      // Create a manifest file for the bundled Chromium
      const manifestPath = path.join(puppeteerCacheDir, 'chrome-manifest.json');
      const manifest = {
        version: '1.0.0',
        chromiumPath: puppeteerCacheDir,
        installedAt: new Date().toISOString(),
        directories: chromiumDirs
      };
      
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      console.log(`✅ Created manifest file: ${manifestPath}`);
    } else {
      throw new Error('No Chromium directories found after installation');
    }

  } catch (error) {
    console.error('❌ Error setting up Puppeteer:', error.message);
    throw error;
  }
}

// Run the setup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupPuppeteer()
    .then(() => {
      console.log('🎉 Puppeteer setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Puppeteer setup failed:', error);
      process.exit(1);
    });
}

export default setupPuppeteer;
