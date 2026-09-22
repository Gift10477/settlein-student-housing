const express = require('express');
const router = express.Router();
const db = require('../db');

const studyAmenityColumns = {
  wifi_rating: 'DECIMAL(2,1) NULL',
  wifi_speed_mbps: 'INT NULL',
  has_dedicated_desk: 'TINYINT(1) NULL',
  has_backup_generator: 'TINYINT(1) NULL',
  quiet_hours_start: 'VARCHAR(5) NULL',
  quiet_hours_end: 'VARCHAR(5) NULL',
  quiet_hours_policy_enforced: 'TINYINT(1) NULL',
  max_study_guests: 'INT NULL',
  last_inspected_at: 'TIMESTAMP NULL'
};

async function initializeStudyAmenities() {
  try {
    const [columns] = await db.query(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'properties'`
    );
    const existingColumns = new Set(columns.map((column) => column.COLUMN_NAME));

    for (const [columnName, definition] of Object.entries(studyAmenityColumns)) {
      if (!existingColumns.has(columnName)) {
        await db.query(`ALTER TABLE properties ADD COLUMN ${columnName} ${definition}`);
      }
    }

    await db.query(`
      UPDATE properties
      SET
        wifi_rating = COALESCE(wifi_rating, 4.5),
        wifi_speed_mbps = COALESCE(wifi_speed_mbps, 50),
        has_dedicated_desk = COALESCE(has_dedicated_desk, 1),
        has_backup_generator = COALESCE(has_backup_generator, 1),
        quiet_hours_start = COALESCE(quiet_hours_start, '22:00'),
        quiet_hours_end = COALESCE(quiet_hours_end, '06:00'),
        quiet_hours_policy_enforced = COALESCE(quiet_hours_policy_enforced, 1),
        max_study_guests = COALESCE(max_study_guests, 4),
        last_inspected_at = COALESCE(last_inspected_at, CURRENT_TIMESTAMP)
    `);
  } catch (err) {
    console.error('Study amenities migration error:', err);
  }
}

initializeStudyAmenities();

// Helper to format property row
function formatProperty(p) {
  let amenitiesArr = [];
  if (Array.isArray(p.amenities)) {
    amenitiesArr = p.amenities;
  } else if (typeof p.amenities === 'string') {
    try {
      amenitiesArr = JSON.parse(p.amenities);
    } catch {
      amenitiesArr = p.amenities.split(',').map((a) => a.trim()).filter(Boolean);
    }
  }

  let imagesArr = [];
  if (Array.isArray(p.images)) {
    imagesArr = p.images;
  } else if (typeof p.images === 'string' && p.images.trim()) {
    try {
      imagesArr = JSON.parse(p.images);
    } catch {
      imagesArr = [p.images];
    }
  } else if (p.image) {
    imagesArr = [p.image];
  }

  let reviewsArr = [];
  if (Array.isArray(p.reviews)) {
    reviewsArr = p.reviews;
  } else if (typeof p.reviews === 'string' && p.reviews.trim()) {
    try {
      reviewsArr = JSON.parse(p.reviews);
    } catch {
      reviewsArr = [];
    }
  }

  return {
    ...p,
    price: Number(p.price) || 0,
    vacant_units: p.vacant_units !== undefined ? Number(p.vacant_units) : 1,
    verified: Boolean(p.verified),
    amenities: amenitiesArr,
    images: imagesArr,
    reviews: reviewsArr,
  };
}

function formatStudyAmenities(p) {
  return {
    accommodation_id: p.id,
    accommodation_name: p.title,
    wifi_rating: p.wifi_rating === null ? null : Number(p.wifi_rating),
    wifi_speed_mbps: p.wifi_speed_mbps === null ? null : Number(p.wifi_speed_mbps),
    has_dedicated_desk: Boolean(p.has_dedicated_desk),
    has_backup_generator: Boolean(p.has_backup_generator),
    quiet_hours: {
      starts_at: p.quiet_hours_start,
      ends_at: p.quiet_hours_end,
      policy_enforced: Boolean(p.quiet_hours_policy_enforced)
    },
    max_study_guests: p.max_study_guests === null ? null : Number(p.max_study_guests),
    last_inspected_at: p.last_inspected_at
  };
}

// 1. SELECT (Read all properties)
router.get('/', async (req, res) => {
  try {
    const { campus, type, maxPrice, minPrice, search } = req.query;
    let query = 'SELECT * FROM properties WHERE 1=1';
    const params = [];

    if (campus && campus !== 'all') {
      query += ' AND campus = ?';
      params.push(campus);
    }
    if (type && type !== 'all') {
      query += ' AND LOWER(type) LIKE ?';
      params.push(`%${type.toLowerCase()}%`);
    }
    if (maxPrice) {
      query += ' AND price <= ?';
      params.push(Number(maxPrice));
    }
    if (minPrice) {
      query += ' AND price >= ?';
      params.push(Number(minPrice));
    }
    if (search) {
      query += ' AND (LOWER(title) LIKE ? OR LOWER(location) LIKE ? OR LOWER(type) LIKE ?)';
      const s = `%${search.toLowerCase()}%`;
      params.push(s, s, s);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await db.query(query, params);
    res.json(rows.map(formatProperty));
  } catch (err) {
    console.error('SELECT Error:', err);
    res.status(500).json({ error: 'Failed to fetch properties from database' });
  }
});

// 2. GET study amenities for a property
router.get('/:id/study-amenities', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM properties WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Property not found',
        status_code: 404,
        timestamp: new Date().toISOString()
      });
    }

    res.json(formatStudyAmenities(rows[0]));
  } catch (err) {
    console.error('SELECT property study amenities error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to fetch property study amenities',
      status_code: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// 2. SELECT single property by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM properties WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(formatProperty(rows[0]));
  } catch (err) {
    console.error('SELECT single property error:', err);
    res.status(500).json({ error: 'Failed to fetch property details' });
  }
});

// 3. INSERT (Create a new property)
router.post('/', async (req, res) => {
  try {
    const {
      title,
      type,
      price,
      location,
      campus,
      distance,
      description,
      landlord,
      phone,
      whatsapp,
      vacant_units,
      amenities,
      image,
      images,
      latitude,
      longitude,
      security_deposit,
      booking_fee,
      water_included,
      wifi_included,
      garbage_included,
      gender_policy,
      furnishing_status,
      wifi_rating,
      wifi_speed_mbps,
      has_dedicated_desk,
      has_backup_generator,
      quiet_hours_start,
      quiet_hours_end,
      quiet_hours_policy_enforced,
      max_study_guests,
      last_inspected_at
    } = req.body;

    const id = `prop-${Date.now()}`;
    const defaultImg = image || (images && images[0]) || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80';

    const sql = `
      INSERT INTO properties (
        id, title, type, price, location, campus, distance,
        verified, image, description, landlord, phone, whatsapp,
        vacant_units, amenities, wifi_rating, wifi_speed_mbps,
        has_dedicated_desk, has_backup_generator, quiet_hours_start,
        quiet_hours_end, quiet_hours_policy_enforced, max_study_guests,
        last_inspected_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const amenitiesStr = Array.isArray(amenities)
      ? amenities.join(', ')
      : (typeof amenities === 'string' ? amenities : '');

    const values = [
      id,
      title,
      type || 'Bedsitter',
      Number(price) || 0,
      location || 'Nairobi',
      campus || 'strathmore',
      distance || 'Near Campus',
      true,
      defaultImg,
      description || '',
      landlord || 'Independent Landlord',
      phone || '',
      whatsapp || phone || '',
      Number(vacant_units) || 1,
      amenitiesStr,
      wifi_rating !== undefined ? Number(wifi_rating) : 4.5,
      wifi_speed_mbps !== undefined ? Number(wifi_speed_mbps) : 50,
      has_dedicated_desk !== undefined ? Boolean(has_dedicated_desk) : true,
      has_backup_generator !== undefined ? Boolean(has_backup_generator) : true,
      quiet_hours_start || '22:00',
      quiet_hours_end || '06:00',
      quiet_hours_policy_enforced !== undefined ? Boolean(quiet_hours_policy_enforced) : true,
      max_study_guests !== undefined ? Number(max_study_guests) : 4,
      last_inspected_at || new Date()
    ];

    await db.query(sql, values);

    res.status(201).json({
      message: 'Property inserted successfully into database',
      id: id,
      property: {
        id,
        title,
        type: type || 'Bedsitter',
        price: Number(price) || 0,
        location: location || 'Nairobi',
        campus: campus || 'strathmore',
        distance: distance || 'Near Campus',
        verified: true,
        image: defaultImg,
        description: description || '',
        landlord: landlord || 'Independent Landlord',
        phone: phone || '',
        whatsapp: whatsapp || phone || '',
        vacant_units: Number(vacant_units) || 1,
        amenities: Array.isArray(amenities) ? amenities : amenitiesStr.split(',').map(a => a.trim()).filter(Boolean),
        wifi_rating: wifi_rating !== undefined ? Number(wifi_rating) : 4.5,
        wifi_speed_mbps: wifi_speed_mbps !== undefined ? Number(wifi_speed_mbps) : 50,
        has_dedicated_desk: has_dedicated_desk !== undefined ? Boolean(has_dedicated_desk) : true,
        has_backup_generator: has_backup_generator !== undefined ? Boolean(has_backup_generator) : true,
        quiet_hours_start: quiet_hours_start || '22:00',
        quiet_hours_end: quiet_hours_end || '06:00',
        quiet_hours_policy_enforced: quiet_hours_policy_enforced !== undefined ? Boolean(quiet_hours_policy_enforced) : true,
        max_study_guests: max_study_guests !== undefined ? Number(max_study_guests) : 4,
        last_inspected_at: last_inspected_at || new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('INSERT Error:', err);
    res.status(500).json({ error: 'Failed to insert property into database', details: err.message });
  }
});

// 4. UPDATE (Update an existing property)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      type,
      price,
      location,
      campus,
      vacant_units,
      description
    } = req.body;

    const sql = `
      UPDATE properties
      SET
        title = COALESCE(?, title),
        type = COALESCE(?, type),
        price = COALESCE(?, price),
        location = COALESCE(?, location),
        campus = COALESCE(?, campus),
        vacant_units = COALESCE(?, vacant_units),
        description = COALESCE(?, description)
      WHERE id = ?
    `;

    const values = [
      title !== undefined ? title : null,
      type !== undefined ? type : null,
      price !== undefined ? Number(price) : null,
      location !== undefined ? location : null,
      campus !== undefined ? campus : null,
      vacant_units !== undefined ? Number(vacant_units) : null,
      description !== undefined ? description : null,
      id
    ];

    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({ message: 'Property updated successfully in database' });
  } catch (err) {
    console.error('UPDATE Error:', err);
    res.status(500).json({ error: 'Failed to update property in database' });
  }
});

// 5. DELETE (Delete a property)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query('DELETE FROM properties WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json({ message: 'Property deleted successfully from database' });
  } catch (err) {
    console.error('DELETE Error:', err);
    res.status(500).json({ error: 'Failed to delete property from database' });
  }
});

module.exports = router;
