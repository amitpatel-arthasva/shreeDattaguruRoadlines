// Test script to verify the lorry receipt template with billHeader image
import lorryReceiptPrintTemplate from './src/templates/lorryReceiptPrintTemplate.js';
import fs from 'fs';

// Sample test data
const testData = {
  lr_number: "TEST-001",
  lr_date: "2025-06-20",
  consignor_name: "Test Consignor",
  consignor_address: "123 Test Street",
  consignor_city: "Mumbai",
  consignee_name: "Test Consignee",
  consignee_address: "456 Delivery Avenue",
  consignee_city: "Delhi",
  truck_number: "MH12AB1234",
  nos: '["10"]',
  particulars: '["Test Goods"]',
  freight: 1000,
  hamali: 50,
  st_charge: 20,
  actual_weight: 500,
  chargeable_weight: 500,
  delivery_at: "Delhi",
  remarks: "Test remarks"
};

console.log('Testing lorry receipt template with billHeader image...');

try {
  const html = lorryReceiptPrintTemplate(testData);
  
  // Check if the HTML contains the billHeader image
  if (html.includes('data:image/png;base64,')) {
    console.log('✅ SUCCESS: Template contains billHeader.png as base64 image');
  } else if (html.includes('data:image/svg+xml')) {
    console.log('⚠️  FALLBACK: Template is using fallback SVG (billHeader.png not found)');
  } else {
    console.log('❌ ERROR: No image found in template');
  }
  
  // Save a test HTML file to verify visually
  fs.writeFileSync('./test_lorry_receipt.html', html);
  console.log('✅ Test HTML file saved as test_lorry_receipt.html');
  
  console.log('Template generation completed successfully!');
} catch (error) {
  console.error('❌ ERROR generating template:', error.message);
}
