const express = require('express');
const router = express.Router();
const db = require('../db');



// GET all users
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error('SELECT users error:', err);
    res.status(500).json({ error: 'Failed to fetch users from database' });
  }
});

// GET single user by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('SELECT single user error:', err);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

//Instert User
router.post('/', async (req, res) => {
  try {
    const { name, email, course, campus, residence_area, phone, role } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Missing required fields: name, email' });
    }

    const sql = `
      INSERT INTO users (name, email, course, campus, residence_area, phone, role)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      name,
      email,
      course || '',
      campus || 'strathmore',
      residence_area || '',
      phone || '',
      role || 'student'
    ];

    const [result] = await db.query(sql, values);

    res.status(201).json({
      message: 'User inserted successfully into database',
      user_id: result.insertId
    });
  } catch (err) {
    console.error('INSERT user error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'A user with this email already exists' });
    }
    res.status(500).json({ error: 'Failed to insert user into database' });
  }
});

// POST login / authenticate user
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required to sign in' });
    }

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No account found with this email address' });
    }

    res.json({
      message: 'Signed in successfully!',
      user: rows[0]
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed due to a database error' });
  }
});

// Update a user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, course, campus, residence_area, phone, role } = req.body;

    const sql = `
      UPDATE users
      SET
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        course = COALESCE(?, course),
        campus = COALESCE(?, campus),
        residence_area = COALESCE(?, residence_area),
        phone = COALESCE(?, phone),
        role = COALESCE(?, role)
      WHERE id = ?
    `;

    const values = [
      name !== undefined ? name : null,
      email !== undefined ? email : null,
      course !== undefined ? course : null,
      campus !== undefined ? campus : null,
      residence_area !== undefined ? residence_area : null,
      phone !== undefined ? phone : null,
      role !== undefined ? role : null,
      id
    ];

    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated successfully in database' });
  } catch (err) {
    console.error('UPDATE user error:', err);
    res.status(500).json({ error: 'Failed to update user in database' });
  }
});

// Delete a user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully from database' });
  } catch (err) {
    console.error('DELETE user error:', err);
    res.status(500).json({ error: 'Failed to delete user from database' });
  }
});

module.exports = router;
