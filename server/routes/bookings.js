const express = require('express');
const router = express.Router();
const db = require('../db');

// Ensure bookings table exists in MySQL database
async function initBookingsTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        student_id VARCHAR(100) DEFAULT '',
        property_id VARCHAR(100) NOT NULL,
        property_title VARCHAR(255) DEFAULT '',
        status VARCHAR(50) DEFAULT 'active',
        move_in_date VARCHAR(100),
        expected_arrival_time VARCHAR(50),
        lease_start_date VARCHAR(50),
        lease_end_date VARCHAR(50),
        relocation_window_start VARCHAR(100),
        relocation_window_end VARCHAR(100),
        lease_duration VARCHAR(50) DEFAULT '1 Semester (4 months)',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // Migration: add student_id column if table was created before this change
    await db.query(`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS student_id VARCHAR(100) DEFAULT ''`);
  } catch (err) {
    // ALTER TABLE error is acceptable if DB engine doesn't support IF NOT EXISTS
    if (!err.message.includes('Duplicate column')) {
      console.error('Error initializing bookings table:', err.message);
    }
  }
}

initBookingsTable();

// 1. GET all bookings
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM bookings ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error('SELECT bookings error:', err);
    res.status(500).json({ error: 'Failed to fetch bookings from database' });
  }
});

// 2. GET bookings by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM bookings WHERE user_id = ? ORDER BY id DESC', [req.params.userId]);
    res.json(rows);
  } catch (err) {
    console.error('SELECT user bookings error:', err);
    res.status(500).json({ error: 'Failed to fetch user bookings' });
  }
});

// 3. POST new booking (Real-time direct booking)
router.post('/', async (req, res) => {
  try {
    const {
      user_id,
      student_id,
      property_id,
      property_title,
      move_in_date,
      expected_arrival_time,
      lease_duration = '1 Semester (4 months)',
      notes
    } = req.body;

    if (!user_id || !property_id) {
      return res.status(400).json({ error: 'Missing required booking fields: user_id, property_id' });
    }

    const arrivalDate = move_in_date ? new Date(move_in_date) : new Date();
    const arrivalTime = expected_arrival_time || '10:00 AM';
    const moveInIso = arrivalDate.toISOString();
    const leaseStartDate = arrivalDate.toISOString().split('T')[0];

    // Calculate lease end date based on duration
    const endDate = new Date(arrivalDate);
    if (lease_duration.includes('1 Semester') || lease_duration.includes('4')) {
      endDate.setMonth(endDate.getMonth() + 4);
    } else if (lease_duration.includes('2 Semester') || lease_duration.includes('8')) {
      endDate.setMonth(endDate.getMonth() + 8);
    } else if (lease_duration.includes('Year') || lease_duration.includes('12')) {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 4);
    }
    const leaseEndDate = endDate.toISOString().split('T')[0];

    // Relocation window (1 day before to 2 days after move-in)
    const relocStart = new Date(arrivalDate);
    relocStart.setDate(relocStart.getDate() - 1);
    const relocEnd = new Date(arrivalDate);
    relocEnd.setDate(relocEnd.getDate() + 2);

    const now = new Date();

    const sql = `
      INSERT INTO bookings (
        user_id, student_id, property_id, property_title, status, move_in_date,
        expected_arrival_time, lease_start_date, lease_end_date,
        relocation_window_start, relocation_window_end, lease_duration, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      Number(user_id),
      student_id || '',
      String(property_id),
      property_title || 'Campus Accommodation',
      'active',
      moveInIso,
      arrivalTime,
      leaseStartDate,
      leaseEndDate,
      relocStart.toISOString(),
      relocEnd.toISOString(),
      lease_duration,
      notes || '',
      now
    ];

    const [result] = await db.query(sql, values);

    res.status(201).json({
      message: 'Booking confirmed and recorded in database in real time!',
      booking_id: result.insertId,
      booking: {
        booking_id: result.insertId,
        user_id: Number(user_id),
        student_id: student_id || '',
        property_id: String(property_id),
        accommodation_name: property_title || 'Campus Accommodation',
        status: 'active',
        move_in_date: moveInIso,
        expected_arrival_time: arrivalTime,
        lease_start_date: leaseStartDate,
        lease_end_date: leaseEndDate,
        relocation_window_start: relocStart.toISOString(),
        relocation_window_end: relocEnd.toISOString(),
        booked_at: now.toISOString()
      }
    });
  } catch (err) {
    console.error('INSERT booking error:', err);
    res.status(500).json({ error: 'Failed to create booking in database', details: err.message });
  }
});

module.exports = router;
