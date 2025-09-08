import dbManager from '../database/config/database.js';
import process from 'process';

console.log('🔄 Running database migrations...');

try {
  await dbManager.initialize();
  console.log('✅ Migrations completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}
