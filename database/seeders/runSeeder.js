import db from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeeder() {
  try {
    console.log('Initializing database...');
    await db.initialize();
    
    console.log('Reading seeder file...');
    const seederPath = path.join(__dirname, 'initial_data.sql');
    const seeder = fs.readFileSync(seederPath, 'utf8');
    
    console.log('Running seeder...');
    await db.query(seeder);
    
    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

runSeeder(); 