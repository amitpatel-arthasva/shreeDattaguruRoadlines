import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DatabaseManager {
  constructor() {
    this.db = null;
    this.dbPath = path.join(__dirname, '../../data/roadlines.db');
  }
  async initialize() {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Initialize database
      this.db = new Database(this.dbPath);
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('foreign_keys = ON'); // Enable foreign key constraints
      
      // Run migrations
      await this.runMigrations();
      
      // Run seeders
      await this.runSeeders();
      
      console.log('Database initialized successfully at:', this.dbPath);
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  async runMigrations() {
    const migrationsDir = path.join(__dirname, '../migrations');
    if (!fs.existsSync(migrationsDir)) {
      console.log('No migrations directory found');
      return;
    }

    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      const migrationPath = path.join(migrationsDir, file);
      const migration = fs.readFileSync(migrationPath, 'utf8');
      
      try {
        this.db.exec(migration);
        console.log(`Migration ${file} executed successfully`);
      } catch (error) {
        console.error(`Migration ${file} failed:`, error);
        throw error;
      }
    }
  }
  async runSeeders(force = false) {
    const seedersDir = path.join(__dirname, '../seeders');
    if (!fs.existsSync(seedersDir)) {
      console.log('No seeders directory found');
      return;
    }

    // Create seeders tracking table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS seeder_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        seeder_name VARCHAR(255) UNIQUE NOT NULL,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_run DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const seederFiles = fs.readdirSync(seedersDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of seederFiles) {
      const seederPath = path.join(seedersDir, file);
      const seeder = fs.readFileSync(seederPath, 'utf8');
      
      // Check if seeder was already executed
      const existing = this.db.prepare('SELECT id FROM seeder_history WHERE seeder_name = ?').get(file);
      
      if (existing && !force) {
        console.log(`Seeder ${file} already executed, re-running to check for missing data...`);
        // Update last_run timestamp
        this.db.prepare('UPDATE seeder_history SET last_run = CURRENT_TIMESTAMP WHERE seeder_name = ?').run(file);
      } else if (existing && force) {
        console.log(`Force re-running seeder ${file}...`);
        // Update last_run timestamp
        this.db.prepare('UPDATE seeder_history SET last_run = CURRENT_TIMESTAMP WHERE seeder_name = ?').run(file);
      } else {
        console.log(`Running seeder ${file} for the first time...`);
      }
      
      try {
        this.db.exec(seeder);
        
        // Mark seeder as executed (only if it's the first time)
        if (!existing) {
          this.db.prepare('INSERT INTO seeder_history (seeder_name) VALUES (?)').run(file);
        }
        
        console.log(`Seeder ${file} executed successfully`);
      } catch (error) {
        console.log(`Seeder ${file} failed:`, error.message);
        // Don't throw here to allow other seeders to run
      }
    }
  }

  // Method to force re-run all seeders
  async forceRunSeeders() {
    console.log('Force running all seeders...');
    return this.runSeeders(true);
  }

  // Method to reset seeder history (useful for development)
  async resetSeederHistory() {
    try {
      this.db.exec('DELETE FROM seeder_history');
      console.log('Seeder history reset successfully');
    } catch (error) {
      console.log('Failed to reset seeder history:', error.message);
    }
  }

  query(sql, params = []) {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        const stmt = this.db.prepare(sql);
        return stmt.all(params);
      } else {
        const stmt = this.db.prepare(sql);
        return stmt.run(params);
      }
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

export default new DatabaseManager();
