const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { fileURLToPath } = require('url');

class DatabaseManager {
  constructor() {
    this.db = null;
    const documentsPath = path.join(os.homedir(), 'OneDrive', 'Documents');
    this.dbPath = path.join(documentsPath, 'ShreedattaguruRoadlines', 'roadlines.db');
  }

  async initialize() {
    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Close existing connection if any
      if (this.db) {
        this.db.close();
      }

      // Initialize database
      this.db = new Database(this.dbPath);
      this.db.pragma('journal_mode = WAL');
      
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

  async runSeeders() {
    const seedersDir = path.join(__dirname, '../seeders');
    if (!fs.existsSync(seedersDir)) {
      console.log('No seeders directory found');
      return;
    }

    const seederFiles = fs.readdirSync(seedersDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    for (const file of seederFiles) {
      const seederPath = path.join(seedersDir, file);
      const seeder = fs.readFileSync(seederPath, 'utf8');
      
      try {
        this.db.exec(seeder);
        console.log(`Seeder ${file} executed successfully`);
      } catch (error) {
        console.log(`Seeder ${file} skipped (may already exist):`, error.message);
      }
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

module.exports = new DatabaseManager();
