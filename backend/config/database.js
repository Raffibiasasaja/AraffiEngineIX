const mongoose = require('mongoose');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

/**
 * Database connection configuration
 * Supports both MongoDB and SQLite based on environment variables
 */
class Database {
  constructor() {
    this.type = process.env.DATABASE_TYPE || 'sqlite';
    this.db = null;
  }

  /**
   * Initialize database connection
   * @returns {Promise<void>}
   */
  async connect() {
    try {
      if (this.type === 'mongodb') {
        await this.connectMongoDB();
      } else {
        await this.connectSQLite();
      }
      console.log(`✅ Database connected successfully (${this.type})`);
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Connect to MongoDB
   * @returns {Promise<void>}
   */
  async connectMongoDB() {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bakso-kangen';
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
  }

  /**
   * Connect to SQLite
   * @returns {Promise<void>}
   */
  async connectSQLite() {
    return new Promise((resolve, reject) => {
      const dbPath = process.env.SQLITE_PATH || './database/bakso-kangen.db';
      const dbDir = path.dirname(dbPath);
      
      // Ensure database directory exists
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          this.initializeTables()
            .then(() => resolve())
            .catch(reject);
        }
      });
    });
  }

  /**
   * Initialize SQLite tables
   * @returns {Promise<void>}
   */
  async initializeTables() {
    return new Promise((resolve, reject) => {
      const queries = [
        `CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL CHECK(role IN ('customer', 'admin', 'owner')),
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS menu_items (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          price INTEGER NOT NULL,
          available BOOLEAN DEFAULT 1,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        
        `CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          tableNumber TEXT NOT NULL,
          menu TEXT NOT NULL,
          note TEXT,
          status TEXT NOT NULL DEFAULT 'Pending' CHECK(status IN ('Pending', 'In Progress', 'Completed')),
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,

        `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`,
        `CREATE INDEX IF NOT EXISTS idx_orders_timestamp ON orders(timestamp)`,
        `CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)`,
        `CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(available)`
      ];

      let completed = 0;
      queries.forEach((query, index) => {
        this.db.run(query, (err) => {
          if (err) {
            reject(err);
          } else {
            completed++;
            if (completed === queries.length) {
              resolve();
            }
          }
        });
      });
    });
  }

  /**
   * Get database instance
   * @returns {Object} Database instance
   */
  getInstance() {
    if (this.type === 'mongodb') {
      return mongoose;
    }
    return this.db;
  }

  /**
   * Close database connection
   * @returns {Promise<void>}
   */
  async close() {
    if (this.type === 'mongodb') {
      await mongoose.connection.close();
    } else if (this.db) {
      return new Promise((resolve) => {
        this.db.close((err) => {
          if (err) {
            console.error('Error closing SQLite database:', err);
          }
          resolve();
        });
      });
    }
    console.log('📔 Database connection closed');
  }
}

module.exports = new Database();