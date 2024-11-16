const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes

// 1. CRUD for Students
app.post('/students', (req, res) => {
  const { ra, name, photo } = req.body;
  db.run(
    `INSERT INTO students (ra, name, photo) VALUES (?, ?, ?)`,
    [ra, name, photo],
    function (err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json({ id: this.lastID });
    }
  );
});

app.get('/students', (req, res) => {
  db.all(`SELECT * FROM students`, [], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.put('/students/:id', (req, res) => {
  const { id } = req.params;
  const { ra, name, photo } = req.body;
  db.run(
    `UPDATE students SET ra = ?, name = ?, photo = ? WHERE id = ?`,
    [ra, name, photo, id],
    function (err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json({ updated: this.changes });
    }
  );
});

app.delete('/students/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM students WHERE id = ?`, id, function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ deleted: this.changes });
  });
});

// 2. Manage Lunch Permissions
app.post('/lunch_permissions', (req, res) => {
  const { student_id, release_date, quantity } = req.body;
  db.run(
    `INSERT INTO lunch_permissions (student_id, release_date, quantity) VALUES (?, ?, ?)`,
    [student_id, release_date, quantity],
    function (err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json({ id: this.lastID });
    }
  );
});

app.get('/lunch_permissions', (req, res) => {
  const { date } = req.query;
  const query = date
    ? `SELECT lp.*, s.name, s.photo FROM lunch_permissions lp 
       JOIN students s ON lp.student_id = s.id WHERE lp.release_date = ?`
    : `SELECT lp.*, s.name, s.photo FROM lunch_permissions lp 
       JOIN students s ON lp.student_id = s.id`;
  db.all(query, date ? [date] : [], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.put('/lunch_permissions/:id', (req, res) => {
  const { id } = req.params;
  const { student_id, release_date, quantity } = req.body;
  db.run(
    `UPDATE lunch_permissions SET student_id = ?, release_date = ?, quantity = ? WHERE id = ?`,
    [student_id, release_date, quantity, id],
    function (err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      res.json({ updated: this.changes });
    }
  );
});

app.delete('/lunch_permissions/:id', (req, res) => {
  const { id } = req.params;
  db.run(`DELETE FROM lunch_permissions WHERE id = ?`, id, function (err) {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json({ deleted: this.changes });
  });
});

// 3. Mark Lunch as Delivered
app.post('/deliveries', (req, res) => {
  const { permission_id } = req.body;
  db.run(
    `UPDATE lunch_permissions SET delivered = 1 WHERE id = ? AND delivered = 0`,
    [permission_id],
    function (err) {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(400).json({ error: 'Lunch already delivered or not found' });
      }
      res.json({ delivered: true });
    }
  );
});

app.get('/deliveries', (req, res) => {
  const { date } = req.query;
  const query = date
    ? `SELECT lp.*, s.name, s.photo FROM lunch_permissions lp 
       JOIN students s ON lp.student_id = s.id WHERE lp.delivered = 1 AND lp.release_date = ?`
    : `SELECT lp.*, s.name, s.photo FROM lunch_permissions lp 
       JOIN students s ON lp.student_id = s.id WHERE lp.delivered = 1`;
  db.all(query, date ? [date] : [], (err, rows) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
