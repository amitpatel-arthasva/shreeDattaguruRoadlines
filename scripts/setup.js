#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import process from 'process';

console.log('🚀 Setting up Shree Dattagu Roadlines...');

// Check if Chrome is already installed for Puppeteer
const puppeteerCacheDir = path.join(process.env.HOME || process.env.USERPROFILE, '.cache', 'puppeteer');
const chromeExists = fs.existsSync(puppeteerCacheDir);

if (!chromeExists) {
  console.log('📥 Installing Chrome for PDF generation...');
  try {
    execSync('npx puppeteer browsers install chrome', { stdio: 'inherit' });
    console.log('✅ Chrome installed successfully!');
  } catch (error) {
    console.error('❌ Failed to install Chrome:', error.message);
    console.log('💡 You can install it manually later with: npx puppeteer browsers install chrome');
  }
} else {
  console.log('✅ Chrome already installed!');
}

console.log('🎉 Setup complete! You can now run: npm run electron-dev');
