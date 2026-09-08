const express = require('express');
const router = express.Router();
const db = require('../db');

// SELECT - Get all properties
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM properties');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch properties' });
    }
});

// INSERT - Add a property
router.post('/', async (req, res) => {
    try {
        const {
            id,
            title,
            type,
            price,
            location,
            campus,
            distance,
            verified,
            image,
            description,
            landlord,
            phone,
            whatsapp,
            latitude,
            longitude,
            security_deposit,
            booking_fee,
            water_included,
            wifi_included,
            garbage_included,
            gender_policy,
            furnishing_status,
            video_url,
            vacant_units
        } = req.body;

        const sql = `
            INSERT INTO properties (
                id, title, type, price, location, campus, distance,
                verified, image, description, landlord, phone, whatsapp,
                latitude, longitude, security_deposit, booking_fee,
                water_included, wifi_included, garbage_included,
                gender_policy, furnishing_status, video_url, vacant_units
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            id, title, type, price, location, campus, distance,
            verified, image, description, landlord, phone, whatsapp,
            latitude, longitude, security_deposit, booking_fee,
            water_included, wifi_included, garbage_included,
            gender_policy, furnishing_status, video_url, vacant_units
        ];

        const [result] = await db.query(sql, values);

        res.status(201).json({
            message: 'Property inserted successfully',
            id: result.insertId || id
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to insert property' });
    }
});

// UPDATE - Update a property
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title,
            type,
            price,
            location,
            campus,
            distance,
            verified,
            description,
            landlord,
            phone,
            whatsapp,
            vacant_units
        } = req.body;

        const sql = `
            UPDATE properties
            SET
                title = ?,
                type = ?,
                price = ?,
                location = ?,
                campus = ?,
                distance = ?,
                verified = ?,
                description = ?,
                landlord = ?,
                phone = ?,
                whatsapp = ?,
                vacant_units = ?
            WHERE id = ?
        `;

        const values = [
            title,
            type,
            price,
            location,
            campus,
            distance,
            verified,
            description,
            landlord,
            phone,
            whatsapp,
            vacant_units,
            id
        ];

        const [result] = await db.query(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Property not found' });
        }

        res.json({
            message: 'Property updated successfully'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update property' });
    }
});

module.exports = router;