import { getBillHeaderAsBase64, getImageAsBase64 } from './src/services/imageUtils.js';

console.log('Testing imageUtils...');

// Test the billHeader function
const billHeaderBase64 = getBillHeaderAsBase64();
console.log('Bill header image loaded:', !!billHeaderBase64);
console.log('Bill header starts with data:image:', billHeaderBase64.startsWith('data:image:'));

if (billHeaderBase64) {
  console.log('Bill header data URL length:', billHeaderBase64.length);
  console.log('Bill header preview:', billHeaderBase64.substring(0, 100) + '...');
} else {
  console.log('❌ Bill header image could not be loaded');
}

// Test the generic function directly
const directTest = getImageAsBase64('billHeader.png');
console.log('\nDirect test - Image loaded:', !!directTest);
console.log('Direct test - Same as getBillHeaderAsBase64:', directTest === billHeaderBase64);
