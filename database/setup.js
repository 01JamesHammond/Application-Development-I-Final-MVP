const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '..');
if (!fs.existsSync(path.join(dbDir, 'inventory.db'))) {
  // ensure database directory exists (database/ already exists by structure)
  // file will be created when connecting
}

const dbPath = path.join(dbDir, 'inventory.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
    process.exit(1);
  }
  console.log('Connected to SQLite database at', dbPath);
});

// Use the exact table definitions you provided
db.serialize(() => {
  db.run(`
    CREATE TABLE devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      type TEXT,
      serialNumber TEXT UNIQUE,
      status TEXT,
      location TEXT,
      purchaseDate TEXT,
      notes TEXT
    )
  `, (err) => {
    if (err) {
      console.error('Error creating devices table:', err.message);
    } else {
      console.log('Devices table created');
    }
  });

  db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      department TEXT,
      role TEXT
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Users table created');
    }
  });

  db.run(`
    CREATE TABLE assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deviceId INTEGER,
      userId INTEGER,
      assignedAt TEXT,
      returnedAt TEXT,
      FOREIGN KEY (deviceId) REFERENCES devices(id),
      FOREIGN KEY (userId) REFERENCES users(id)
    )
  `, (err) => {
    if (err) {
      console.error('Error creating assignments table:', err.message);
    } else {
      console.log('Assignments table created');
    }
  });
});

db.close((err) => {
  if (err) {
    console.error('Error closing database:', err.message);
  } else {
    console.log('Database connection closed');
  }
});
