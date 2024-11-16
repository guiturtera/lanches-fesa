const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./lunch_delivery.db', (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Database connected');

    // Create Students Table
    db.run(`
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ra TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        photo TEXT NOT NULL
      )
    `);

    // Create Lunch Permissions Table
    db.run(`
      CREATE TABLE IF NOT EXISTS lunch_permissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        release_date TEXT NOT NULL,
        quantity INTEGER NOT NULL CHECK(quantity <= 3),
        delivered INTEGER DEFAULT 0,
        UNIQUE(student_id, release_date),
        FOREIGN KEY(student_id) REFERENCES students(id)
      )
    `);
  }
});

module.exports = db;
