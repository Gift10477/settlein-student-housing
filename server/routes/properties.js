const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const db = require('../db');

const propertyOptionalColumns = {
  wifi_rating: 'DECIMAL(2,1) NULL',
  wifi_speed_mbps: 'INT NULL',
  has_dedicated_desk: 'TINYINT(1) NULL',
  has_backup_generator: 'TINYINT(1) NULL',
  quiet_hours_start: 'VARCHAR(5) NULL',
  quiet_hours_end: 'VARCHAR(5) NULL',
  quiet_hours_policy_enforced: 'TINYINT(1) NULL',
  max_study_guests: 'INT NULL',
  last_inspected_at: 'TIMESTAMP NULL',
  group_inquiries: 'TEXT NULL'
};

async function initializePropertyColumns() {
  try {
    const [columns] = await db.query(
      `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'properties'`
    );
    const existingColumns = new Set(columns.map((column) => column.COLUMN_NAME));

    for (const [columnName, definition] of Object.entries(propertyOptionalColumns)) {
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
    console.error('Property column migration error:', err);
  }
}

initializePropertyColumns();

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
    group_inquiries: parseGroupInquiries(p.group_inquiries, p.id),
  };
}

function parseGroupInquiries(value, propertyId) {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value !== 'string' || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (parseError) {
    console.error(`Invalid group_inquiries JSON for property ${propertyId}:`, parseError);
    return [];
  }
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

const ALLOWED_INQUIRY_CAMPUSES = [
  'Madaraka Main Campus',
  'Town Campus',
  'Parklands Campus'
];

const ALLOWED_INQUIRY_ROOM_TYPES = [
  '1-bedroom',
  '2-bedroom',
  '3-bedroom',
  '4-bedroom',
  'shared-apartment'
];

function inquiryValidationError(res, message) {
  return res.status(400).json({
    error: 'Bad Request',
    message,
    status_code: 400,
    timestamp: new Date().toISOString()
  });
}

function validInquiryDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}

function campusPattern(campus) {
  return {
    'Madaraka Main Campus': 'strathmore',
    'Town Campus': 'town',
    'Parklands Campus': 'parklands'
  }[campus];
}

function roomTypePattern(roomType) {
  return roomType === 'shared-apartment' ? '%shared%' : `%${roomType}%`;
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

// 2. POST a shared-housing inquiry against matched properties
router.post('/group-inquiries', async (req, res) => {
  const {
    group_id: groupId,
    initiator_student_id: initiatorStudentId,
    member_student_ids: memberStudentIds,
    target_campus: targetCampus,
    preferred_room_type: preferredRoomType,
    max_budget_per_person_kes: maxBudget,
    move_in_target_date: moveInTargetDate,
    notes
  } = req.body;

  if (typeof groupId !== 'string' || !groupId.trim()) {
    return inquiryValidationError(res, "Field 'group_id' is required.");
  }
  if (!Number.isInteger(initiatorStudentId) || initiatorStudentId < 1) {
    return inquiryValidationError(res, "Field 'initiator_student_id' must be a positive integer.");
  }
  if (!Array.isArray(memberStudentIds) || memberStudentIds.length < 2 || memberStudentIds.length > 10) {
    return inquiryValidationError(res, "Field 'member_student_ids' must contain between 2 and 10 students.");
  }
  if (
    memberStudentIds.some((studentId) => !Number.isInteger(studentId) || studentId < 1) ||
    new Set(memberStudentIds).size !== memberStudentIds.length
  ) {
    return inquiryValidationError(res, "Field 'member_student_ids' must contain unique positive integers.");
  }
  if (!memberStudentIds.includes(initiatorStudentId)) {
    return inquiryValidationError(res, "The initiator must be included in 'member_student_ids'.");
  }
  if (!ALLOWED_INQUIRY_CAMPUSES.includes(targetCampus)) {
    return inquiryValidationError(res, "Field 'target_campus' contains an unsupported campus.");
  }
  if (!ALLOWED_INQUIRY_ROOM_TYPES.includes(preferredRoomType)) {
    return inquiryValidationError(res, "Field 'preferred_room_type' contains an unsupported room type.");
  }
  if (!Number.isInteger(maxBudget) || maxBudget < 1000 || maxBudget > 200000) {
    return inquiryValidationError(res, "Field 'max_budget_per_person_kes' must be between 1000 and 200000.");
  }
  if (!validInquiryDate(moveInTargetDate)) {
    return inquiryValidationError(res, "Field 'move_in_target_date' must use YYYY-MM-DD format.");
  }
  if (notes !== undefined && (typeof notes !== 'string' || notes.length > 500)) {
    return inquiryValidationError(res, "Field 'notes' must be a string of no more than 500 characters.");
  }

  try {
    const [matches] = await db.query(
      `SELECT id, group_inquiries
       FROM properties
       WHERE campus = ?
         AND LOWER(type) LIKE LOWER(?)
         AND price <= ?
         AND vacant_units > 0
         AND verified = 1`,
      [campusPattern(targetCampus), roomTypePattern(preferredRoomType), maxBudget]
    );

    const inquiry = {
      inquiry_id: crypto.randomUUID(),
      group_id: groupId.trim(),
      initiator_student_id: initiatorStudentId,
      member_student_ids: memberStudentIds,
      target_campus: targetCampus,
      preferred_room_type: preferredRoomType,
      max_budget_per_person_kes: maxBudget,
      move_in_target_date: moveInTargetDate,
      notes: notes || null,
      status: 'submitted',
      created_at: new Date().toISOString()
    };

    for (const property of matches) {
      const inquiries = parseGroupInquiries(property.group_inquiries, property.id);
      inquiries.push(inquiry);
      await db.query(
        'UPDATE properties SET group_inquiries = ? WHERE id = ?',
        [JSON.stringify(inquiries), property.id]
      );
    }

    res.status(201).json({
      inquiry_id: inquiry.inquiry_id,
      group_id: inquiry.group_id,
      status: inquiry.status,
      matched_accommodations_count: matches.length,
      created_at: inquiry.created_at,
      message: 'Group accommodation inquiry recorded successfully.'
    });
  } catch (err) {
    console.error('Create group inquiry error:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to persist group inquiry to matched properties.',
      status_code: 500,
      timestamp: new Date().toISOString()
    });
  }
});

// 3. GET study amenities for a property
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

// 4. SELECT single property by ID
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

// 5. INSERT (Create a new property)
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

// 6. UPDATE (Update an existing property)
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

// 7. DELETE (Delete a property)
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
