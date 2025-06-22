import { getBillHeaderAsBase64 } from './electron/imageUtils.js';

console.log('Testing image loading...');

const result = getBillHeaderAsBase64();
console.log('Bill header image loaded:', result ? 'SUCCESS' : 'FAILED');
if (result) {
  console.log('Image data URL length:', result.length);
  console.log('Image data URL starts with:', result.substring(0, 50) + '...');
} else {
  console.log('No image data returned');
}
