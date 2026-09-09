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

//update a user
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
      name,
      email,
      course,
      campus,
      residence_area,
      phone,
      role,
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

module.exports = router;
