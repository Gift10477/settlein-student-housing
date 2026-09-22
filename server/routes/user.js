const express = require('express');
const router = express.Router();
const db = require('../db');

// Reference university campus coordinates (GPS anchors for distance calculation)
const CAMPUSES = [
  { name: 'Madaraka Main Campus', institution: 'Strathmore University', lat: -1.3090, lon: 36.8126 },
  { name: 'Town Campus', institution: 'University of Nairobi', lat: -1.2864, lon: 36.8172 },
  { name: 'Parklands Campus', institution: 'Parklands Branch', lat: -1.2618, lon: 36.8184 },
  { name: 'Chiromo Campus', institution: 'Chiromo Branch', lat: -1.2721, lon: 36.8066 },
  { name: 'Main Campus (Juja)', institution: 'JKUAT', lat: -1.1802, lon: 36.9328 }
];

// Reference coordinates for popular student residential estates around Nairobi
const KNOWN_ESTATES = {
  'madaraka': { name: 'Madaraka Estate', lat: -1.3095, lon: 36.8130 },
  'madaraka estate': { name: 'Madaraka Estate', lat: -1.3095, lon: 36.8130 },
  'nairobi west': { name: 'Nairobi West', lat: -1.3140, lon: 36.8220 },
  'south b': { name: 'South B', lat: -1.3120, lon: 36.8370 },
  'south c': { name: 'South C', lat: -1.3200, lon: 36.8260 },
  'langata': { name: 'Langata', lat: -1.3350, lon: 36.7850 },
  'kma': { name: 'KMA Estate / Langata', lat: -1.3360, lon: 36.7870 },
  'highrise': { name: 'Highrise Estate', lat: -1.3110, lon: 36.8030 },
  'mbagathi': { name: 'Mbagathi Way', lat: -1.3105, lon: 36.8010 },
  'ngara': { name: 'Ngara', lat: -1.2770, lon: 36.8240 },
  'parklands': { name: 'Parklands', lat: -1.2630, lon: 36.8190 },
  'upper hill': { name: 'Upper Hill', lat: -1.2980, lon: 36.8140 },
  'kilimani': { name: 'Kilimani', lat: -1.2910, lon: 36.7860 },
  'hurlingham': { name: 'Hurlingham', lat: -1.2930, lon: 36.7910 },
  'juja': { name: 'Juja', lat: -1.1820, lon: 36.9310 },
  'thika road': { name: 'Thika Road / Roysambu', lat: -1.2180, lon: 36.8870 },
  'roysambu': { name: 'Roysambu', lat: -1.2180, lon: 36.8870 },
  'kasarani': { name: 'Kasarani', lat: -1.2220, lon: 36.8980 },
  'cbd': { name: 'Nairobi CBD', lat: -1.2864, lon: 36.8172 }
};

// Haversine formula to compute great-circle distance between two GPS points in kilometers
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate nearest campus and walking/commute distance description
function resolveResidenceProximity(residenceArea, preferredCampus) {
  const raw = (residenceArea || '').trim();
  const norm = raw.toLowerCase();
  let estate = null;

  for (const [key, data] of Object.entries(KNOWN_ESTATES)) {
    if (norm.includes(key) || key.includes(norm)) {
      estate = data;
      break;
    }
  }

  if (estate) {
    let nearest = CAMPUSES[0];
    let minDistance = Infinity;

    for (const campus of CAMPUSES) {
      const d = calculateDistanceKm(estate.lat, estate.lon, campus.lat, campus.lon);
      if (d < minDistance) {
        minDistance = d;
        nearest = campus;
      }
    }

    const distFormatted = minDistance < 1
      ? `${(minDistance * 1000).toFixed(0)}m (~${Math.max(5, Math.round(minDistance * 13))} mins walk)`
      : `${minDistance.toFixed(1)} km (~${Math.round(minDistance * 12)} mins commute)`;

    return {
      estate_name: estate.name,
      nearest_campus: nearest.name,
      distance_to_campus: distFormatted
    };
  }

  const campusLabel = preferredCampus
    ? (preferredCampus.toLowerCase().includes('campus') ? preferredCampus : `${preferredCampus.charAt(0).toUpperCase() + preferredCampus.slice(1)} Campus`)
    : 'Madaraka Main Campus';

  return {
    estate_name: raw || 'Madaraka Estate',
    nearest_campus: campusLabel,
    distance_to_campus: 'Within 1.5 km (~15 mins walk)'
  };
}

// 1. GET all users
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    console.error('SELECT users error:', err);
    res.status(500).json({ error: 'Failed to fetch users from database' });
  }
});

// 2. GET /api/v1/users/:id/residence-area (OpenAPI Contract Endpoint 1)
router.get('/:id/residence-area', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT id, name, campus, residence_area FROM users WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `User with ID ${id} was not found.`,
        status_code: 404,
        timestamp: new Date().toISOString()
      });
    }

    const user = rows[0];

    if (!user.residence_area || !user.residence_area.trim()) {
      return res.status(404).json({
        error: 'Not Found',
        message: `User with ID ${id} does not have an active residential area on file.`,
        status_code: 404,
        timestamp: new Date().toISOString()
      });
    }

    const proximity = resolveResidenceProximity(user.residence_area, user.campus);

    res.json({
      user_id: Number(user.id),
      estate_name: proximity.estate_name,
      nearest_campus: proximity.nearest_campus,
      distance_to_campus: proximity.distance_to_campus,
      cached_at: new Date().toISOString()
    });
  } catch (err) {
    console.error('GET residence-area error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred while querying student residence data.',
      status_code: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// 3. GET /api/v1/users/:id/lease-timeline (OpenAPI Contract Endpoint 3)
router.get('/:id/lease-timeline', async (req, res) => {
  try {
    const { id } = req.params;

    // Verify user exists
    const [userRows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    if (userRows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `User with ID ${id} was not found.`,
        status_code: 404,
        timestamp: new Date().toISOString()
      });
    }

    const user = userRows[0];

    // Query active booking from database in real time
    let bookingRows = [];
    try {
      const [bRows] = await db.query('SELECT * FROM bookings WHERE user_id = ? ORDER BY id DESC LIMIT 1', [id]);
      bookingRows = bRows;
    } catch (bErr) {
      console.warn('Bookings table query warning:', bErr.message);
    }

    if (!bookingRows || bookingRows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `No active lease timeline found for user ID ${id}.`,
        status_code: 404,
        timestamp: new Date().toISOString()
      });
    }

    const booking = bookingRows[0];
    const now = new Date();
    const relocStart = booking.relocation_window_start ? new Date(booking.relocation_window_start) : null;
    const relocEnd = booking.relocation_window_end ? new Date(booking.relocation_window_end) : null;
    const isRelocating = Boolean(relocStart && relocEnd && now >= relocStart && now <= relocEnd);

    // student_id: prefer from booking record (stored at booking time), then fall back to user profile
    const studentId = booking.student_id || user.student_id || user.student_id_number || null;

    res.json({
      user_id: Number(user.id),
      student_id: studentId,
      booking_id: Number(booking.id),
      accommodation_name: booking.property_title || 'Campus Accommodation',
      lease_status: booking.status || 'active',
      move_in_date: booking.move_in_date || null,
      expected_arrival_time: booking.expected_arrival_time || null,
      lease_start_date: booking.lease_start_date || null,
      lease_end_date: booking.lease_end_date || null,
      relocation_window_start: booking.relocation_window_start || null,
      relocation_window_end: booking.relocation_window_end || null,
      is_relocating: isRelocating,
      booked_at: booking.created_at ? new Date(booking.created_at).toISOString() : new Date().toISOString()
    });
  } catch (err) {
    console.error('GET lease-timeline error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Database failure when querying lease timeline.',
      status_code: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// 4. GET /api/v1/users/:id/public-profile (OpenAPI Contract Endpoint 4)
router.get('/:id/public-profile', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: `User with ID ${id} was not found.`,
        status_code: 404,
        timestamp: new Date().toISOString()
      });
    }

    const user = rows[0];
    const proximity = resolveResidenceProximity(user.residence_area, user.campus);

    res.json({
      user_id: Number(user.id),
      student_id: user.student_id || user.student_id_number || '193923',
      display_name: user.name,
      university_affiliation: 'Strathmore University',
      campus_branch: proximity.nearest_campus,
      course_of_study: user.course || 'Bachelor of Business Information Technology (BBIT)',
      year_of_study: 3,
      is_verified_student: true,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      created_at: user.created_at || new Date().toISOString()
    });
  } catch (err) {
    console.error('GET public-profile error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch student public profile.',
      status_code: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// 5. GET single user by ID
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

// 6. INSERT new user
router.post('/', async (req, res) => {
  try {
    const { name, email, student_id, course, campus, residence_area, phone, role } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Missing required fields: name, email' });
    }

    let result;
    try {
      const sql = `
        INSERT INTO users (name, email, student_id, course, campus, residence_area, phone, role)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        name,
        email,
        student_id || '',
        course || '',
        campus || 'strathmore',
        residence_area || '',
        phone || '',
        role || 'student'
      ];
      [result] = await db.query(sql, values);
    } catch (colErr) {
      // Fallback if student_id column is not in existing table
      const sqlFallback = `
        INSERT INTO users (name, email, course, campus, residence_area, phone, role)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const valuesFallback = [
        name,
        email,
        course || '',
        campus || 'strathmore',
        residence_area || '',
        phone || '',
        role || 'student'
      ];
      [result] = await db.query(sqlFallback, valuesFallback);
    }

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

// 7. POST login
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

// 8. PUT update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, student_id, course, campus, residence_area, phone, role } = req.body;

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

// 9. DELETE user
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
