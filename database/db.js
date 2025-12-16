const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

class DatabaseAdapter {
  constructor() {
    this.isPostgres = !!process.env.DATABASE_URL;

    if (this.isPostgres) {
      console.log('Using PostgreSQL database');
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      });
      this.initializeTables();
    } else {
      console.log('Using SQLite database');
      const dbPath = process.env.DATABASE_PATH || path.resolve(__dirname, 'tickets.db');
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error opening database:', err.message);
        } else {
          console.log('Connected to SQLite database');
          this.db.run('PRAGMA foreign_keys = ON');
          this.initializeTables();
        }
      });
    }
  }

  // Convert ? placeholders to $1, $2 for Postgres
  _convertSql(sql) {
    if (!this.isPostgres) return sql;
    let i = 1;
    return sql.replace(/\?/g, () => `$${i++}`);
  }

  async query(sql, params = []) {
    if (this.isPostgres) {
      const pgSql = this._convertSql(sql);
      return this.pool.query(pgSql, params);
    } else {
      return new Promise((resolve, reject) => {
        // This generic query isn't used much, we use wrappers
        this.db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve({ rows });
        });
      });
    }
  }

  // Wrapper for all() - returns array of rows
  all(sql, params, callback) {
    if (this.isPostgres) {
      this.query(sql, params)
        .then(res => callback(null, res.rows))
        .catch(err => callback(err));
    } else {
      this.db.all(sql, params, callback);
    }
  }

  // Wrapper for get() - returns single row
  get(sql, params, callback) {
    if (this.isPostgres) {
      this.query(sql, params)
        .then(res => callback(null, res.rows[0]))
        .catch(err => callback(err));
    } else {
      this.db.get(sql, params, callback);
    }
  }

  // Wrapper for run() - executes and returns context (lastID)
  run(sql, params, callback) {
    if (this.isPostgres) {
      // Auto-append RETURNING id for INSERTs if not present
      // This allows us to get lastID without changing every route
      let pgSql = this._convertSql(sql);
      const isInsert = /^\s*INSERT\s+INTO/i.test(pgSql);

      if (isInsert && !/RETURNING\s+id/i.test(pgSql)) {
        pgSql += ' RETURNING id';
      }

      this.pool.query(pgSql, params)
        .then(res => {
          const context = {};
          if (isInsert && res.rows && res.rows[0]) {
            context.lastID = res.rows[0].id;
          }
          context.changes = res.rowCount;
          if (callback) callback.call(context, null);
        })
        .catch(err => {
          if (callback) callback(err);
        });
    } else {
      this.db.run(sql, params, callback);
    }
  }

  initializeTables() {
    const usersTable = this.isPostgres
      ? `CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              )`
      : `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'user',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
              )`;

    const eventsTable = this.isPostgres
      ? `CREATE TABLE IF NOT EXISTS events (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                date TEXT NOT NULL,
                location TEXT NOT NULL,
                price DECIMAL NOT NULL,
                stock INTEGER NOT NULL,
                image_url TEXT,
                admin_id INTEGER REFERENCES users(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
              )`
      : `CREATE TABLE IF NOT EXISTS events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                date TEXT NOT NULL,
                location TEXT NOT NULL,
                price REAL NOT NULL,
                stock INTEGER NOT NULL,
                image_url TEXT,
                admin_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (admin_id) REFERENCES users(id)
              )`;

    const ticketsTable = this.isPostgres
      ? `CREATE TABLE IF NOT EXISTS tickets (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                event_id INTEGER REFERENCES events(id),
                barcode TEXT UNIQUE NOT NULL,
                quantity INTEGER DEFAULT 1,
                total_price DECIMAL NOT NULL,
                status TEXT DEFAULT 'unused',
                purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                used_at TIMESTAMP
              )`
      : `CREATE TABLE IF NOT EXISTS tickets (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                event_id INTEGER NOT NULL,
                barcode TEXT UNIQUE NOT NULL,
                quantity INTEGER DEFAULT 1,
                total_price REAL NOT NULL,
                status TEXT DEFAULT 'unused',
                purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                used_at DATETIME,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (event_id) REFERENCES events(id)
              )`;

    if (this.isPostgres) {
      this.query(usersTable)
        .then(() => this.query(eventsTable))
        .then(() => this.query(ticketsTable))
        .then(() => console.log('PostgreSQL tables initialized'))
        .catch(err => console.error('Error initializing tables:', err));
    } else {
      this.db.serialize(() => {
        this.db.run(usersTable);
        this.db.run(eventsTable);
        this.db.run(ticketsTable);
        console.log('SQLite tables initialized');
      });
    }
  }

  close() {
    if (this.isPostgres) this.pool.end();
    else this.db.close();
  }
}

module.exports = new DatabaseAdapter();
