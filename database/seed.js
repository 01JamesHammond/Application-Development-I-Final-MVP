const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'inventory.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open database for seeding:', err.message);
    process.exit(1);
  }
  console.log('Opened database for seeding at', dbPath);
});

// Insert sample data consistent with your schema
db.serialize(() => {
  // Users
  db.run(`
    INSERT OR IGNORE INTO users (name, email, department, role)
    VALUES
      ('Alice Johnson', 'alice.johnson@example.com', 'Engineering', 'Engineer'),
      ('Bob Martinez', 'bob.martinez@example.com', 'IT', 'Technician'),
      ('Carol Lee', 'carol.lee@example.com', 'Administration', 'Manager')
  `, function(err) {
    if (err) {
      console.error('Error inserting users:', err.message);
    } else {
      console.log('Inserted sample users');
    }
  });

  // Devices
  db.run(`
    INSERT OR IGNORE INTO devices (name, type, serialNumber, status, location, purchaseDate, notes)
    VALUES
      ('Oscilloscope A', 'Oscilloscope', 'SN-OSC-1001', 'available', 'Lab 1', '2023-06-12', 'Calibrated 2024-01-05'),
      ('Data Logger X', 'Logger', 'SN-DL-2002', 'in-use', 'Lab 2', '2022-11-03', 'Requires new battery'),
      ('Biopac Amp', 'Amplifier', 'SN-BA-3003', 'maintenance', 'Storage', '2021-09-20', 'Under maintenance')
  `, function(err) {
    if (err) {
      console.error('Error inserting devices:', err.message);
    } else {
      console.log('Inserted sample devices');
    }
  });

  // Assignments
  // Note: these rely on users and devices existing. Use user ids and device ids 1..n as created above.
  db.run(`
    INSERT OR IGNORE INTO assignments (deviceId, userId, assignedAt, returnedAt)
    VALUES
      (2, 1, '2025-11-20T09:30:00Z', NULL),
      (1, 3, '2025-10-05T14:00:00Z', '2025-10-10T16:00:00Z')
  `, function(err) {
    if (err) {
      console.error('Error inserting assignments:', err.message);
    } else {
      console.log('Inserted sample assignments');
    }
  });
});

db.close((err) => {
  if (err) {
    console.error('Error closing database after seed:', err.message);
  } else {
    console.log('Seeding complete and database closed');
  }
});
