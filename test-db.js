import sqlite3 from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path
const dbPath = path.join(__dirname, 'data', 'transport.db');

console.log('Testing database connection...');
console.log('Database path:', dbPath);

try {
  // Open database
  const db = sqlite3(dbPath);
  console.log('✅ Database connection successful!');

  // Test basic queries
  console.log('\n--- Testing Basic Queries ---');
  
  // Check if tables exist
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Tables in database:', tables.map(t => t.name));

  // Check users
  const users = db.prepare('SELECT COUNT(*) as count FROM users').get();
  console.log('Users count:', users.count);

  // Check companies
  const companies = db.prepare('SELECT COUNT(*) as count FROM companies').get();
  console.log('Companies count:', companies.count);

  // Check trucks
  const trucks = db.prepare('SELECT COUNT(*) as count FROM trucks').get();
  console.log('Trucks count:', trucks.count);

  // Check drivers
  const drivers = db.prepare('SELECT COUNT(*) as count FROM drivers').get();
  console.log('Drivers count:', drivers.count);

  // Check lorry receipts
  const lorryReceipts = db.prepare('SELECT COUNT(*) as count FROM lorry_receipts').get();
  console.log('Lorry receipts count:', lorryReceipts.count);

  // Check quotations
  const quotations = db.prepare('SELECT COUNT(*) as count FROM quotations').get();
  console.log('Quotations count:', quotations.count);

  // Show some sample data
  console.log('\n--- Sample Data ---');
  
  if (users.count > 0) {
    const sampleUser = db.prepare('SELECT id, name, email, role FROM users LIMIT 1').get();
    console.log('Sample user:', sampleUser);
  }

  if (companies.count > 0) {
    const sampleCompany = db.prepare('SELECT id, company_name, gst_number FROM companies LIMIT 1').get();
    console.log('Sample company:', sampleCompany);
  }

  if (quotations.count > 0) {
    const sampleQuotation = db.prepare('SELECT id, quotation_number, company_id, from_location, to_location FROM quotations LIMIT 1').get();
    console.log('Sample quotation:', sampleQuotation);
  }

  db.close();
  console.log('\n✅ Database test completed successfully!');

} catch (error) {
  console.error('❌ Database test failed:', error.message);
  process.exit(1);
} 