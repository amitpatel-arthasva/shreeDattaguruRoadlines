import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class DatabaseManager {
  constructor() {
    this.db = null;
  // Use user data directory in production, project root in development
    if (process.env.NODE_ENV === 'production') {
      const userDataPath = process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Application Support' : process.env.HOME + "/.local/share");
      this.dbPath = path.join(userDataPath, 'ShreeDattaguruRoadlines', 'roadlines.db');
    } else {
      this.dbPath = path.join(__dirname, '../../roadlines.db');
    }
  }
  async initialize() {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      console.log('Database path:', this.dbPath); // Debug log

      // Initialize database
      this.db = new Database(this.dbPath);
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('foreign_keys = ON'); // Enable foreign key constraints
      
      // Run migrations
      await this.runMigrations();
      
      // Run seeders
      await this.runSeeders();
      
    console.log('Database initialized successfully at:', this.dbPath);
    console.log('SQLite DB Path:', path.resolve(this.dbPath)); // Debug log to confirm database file path

      // Ensure quotations table has all required columns from migration file, with correct types/order
      try {
        const columns = this.db.prepare('PRAGMA table_info(quotations);').all();
        const columnNames = columns.map(col => col.name);
        // Columns and types as per migration file
        const requiredColumns = [
          { name: 'quotation_number', type: 'TEXT NOT NULL DEFAULT ""' },
          { name: 'quotation_date', type: 'TEXT NOT NULL DEFAULT ""' },
          { name: 'company_id', type: 'INTEGER NOT NULL DEFAULT 0' },
          { name: 'to_user', type: 'TEXT NOT NULL DEFAULT ""' },
          { name: 'destination', type: 'TEXT NOT NULL DEFAULT ""' },
          { name: 'freight_upto_8mt', type: 'TEXT NOT NULL DEFAULT ""' },
          { name: 'created_at', type: 'TEXT DEFAULT CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'TEXT DEFAULT CURRENT_TIMESTAMP' },
          { name: 'q_company_name', type: 'TEXT NOT NULL DEFAULT ""' },
          { name: 'company_location', type: 'TEXT NOT NULL DEFAULT ""' },
          { name: 'destinations_json', type: 'TEXT NOT NULL DEFAULT ""' }
        ];
        for (const col of requiredColumns) {
          if (!columnNames.includes(col.name)) {
            this.db.exec(`ALTER TABLE quotations ADD COLUMN ${col.name} ${col.type}`);
            console.log(`Added missing column ${col.name} to quotations table`);
          }
        }
      } catch (err) {
        console.error('Error ensuring quotations table schema:', err);
      }
      // Only drop and recreate quotations table if running in production/exe, not in VS Code/dev
      try {
        const columns = this.db.prepare('PRAGMA table_info(quotations);').all();
        const columnNames = columns.map(col => col.name);
        const isProduction = process.env.NODE_ENV === 'production' || process.env.IS_ELECTRON === 'true' || !!process.env.ELECTRON_RUN_AS_NODE;
        if (!columnNames.includes('id') && isProduction) {
          console.warn('Quotations table missing id column. Dropping and recreating table (production only).');
          this.db.exec('DROP TABLE IF EXISTS quotations;');
          // Migration SQL for quotations table
          this.db.exec(`CREATE TABLE IF NOT EXISTS quotations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            quotation_number TEXT NOT NULL,
            quotation_date TEXT NOT NULL,
            company_id INTEGER NOT NULL,
            q_company_name TEXT NOT NULL,
            company_location TEXT NOT NULL,
            to_user TEXT NOT NULL,
            destinations_json TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (company_id) REFERENCES companies(id)
          );`);
          console.log('Quotations table recreated with correct schema.');
        }
      } catch (err) {
        console.error('Error ensuring quotations table primary key:', err);
      }
  // ...existing code...
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  async runMigrations() {
    // Use correct migrations path for production and development
    let migrationsDir;
    if (process.env.NODE_ENV === 'production') {
      // In production, migrations should be bundled with the app
      migrationsDir = path.join(process.resourcesPath || __dirname, 'database', 'migrations');
      if (!fs.existsSync(migrationsDir)) {
        migrationsDir = path.join(__dirname, '../migrations'); // fallback for dev/test
      }
    } else {
      migrationsDir = path.join(__dirname, '../migrations');
    }
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
      // Debug log: print SQL and params before executing
      console.log('Executing SQL:', sql);
      console.log('With params:', params);
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        const stmt = this.db.prepare(sql);
        return stmt.all(params);
      } else {
        const stmt = this.db.prepare(sql);
        const result = stmt.run(params);
        console.log('Non-SELECT DB result:', JSON.stringify(result, null, 2));
        // Always return a consistent object for non-SELECT queries
        return {
          success: typeof result.changes === 'number' ? result.changes > 0 : true,
          changes: result.changes,
          lastInsertRowid: result.lastInsertRowid
        };
      }
    } catch (error) {
      console.error('Database query error:', error);
      return { success: false, error: error.message };
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
