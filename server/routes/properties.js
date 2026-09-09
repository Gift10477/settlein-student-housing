const express = require('express');
const router = express.Router();
const db = require('../db');

// 1. SELECT (Read all properties)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM properties ORDER BY created_at DESC');
    const formatted = rows.map((p) => {
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
      return {
        ...p,
        price: Number(p.price) || 0,
        verified: Boolean(p.verified),
        amenities: amenitiesArr,
      };
    });
    res.json(formatted);
  } catch (err) {
    console.error('SELECT Error:', err);
    res.status(500).json({ error: 'Failed to fetch properties from database' });
  }
});


// 2. INSERT (Create a new property)

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
      image
    } = req.body;

    const id = `prop-${Date.now()}`;
    const defaultImg = image || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&q=80';

    const sql = `
      INSERT INTO properties (
        id, title, type, price, location, campus, distance,
        verified, image, description, landlord, phone, whatsapp,
        vacant_units, amenities
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const amenitiesStr = Array.isArray(amenities)
      ? amenities.join(', ')
      : (typeof amenities === 'string' ? amenities : '');

    const values = [
      id,
      title,
      type || 'Bedsitter',
      Number(price) || 0,
      location,
      campus || 'strathmore',
      distance || 'Near Campus',
      true,
      defaultImg,
      description || '',
      landlord || 'Independent Landlord',
      phone || '',
      whatsapp || phone || '',
      Number(vacant_units) || 1,
      amenitiesStr
    ];

    await db.query(sql, values);

    res.status(201).json({
      message: 'Property inserted successfully into database',
      id: id
    });
  } catch (err) {
    console.error('INSERT Error:', err);
    res.status(500).json({ error: 'Failed to insert property into database', details: err.message });
  }
});

// 3. UPDATE (Update an existing property)
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
      title,
      type,
      price ? Number(price) : null,
      location,
      campus,
      vacant_units ? Number(vacant_units) : null,
      description,
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

module.exports = router;
