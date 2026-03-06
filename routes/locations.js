const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authorizeRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [locations] = await connection.execute(
      'SELECT * FROM locations WHERE is_active = TRUE ORDER BY location_name'
    );
    connection.release();

    res.status(200).json({
      locations
    });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/create', authorizeRole(['admin']), [
  body('location_name').isLength({ min: 3 }).trim().escape(),
  body('building').trim().escape().optional(),
  body('floor').isInt().optional()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { location_name, building, floor } = req.body;

    const connection = await pool.getConnection();

    const [existing] = await connection.execute(
      'SELECT id FROM locations WHERE location_name = ?',
      [location_name]
    );

    if (existing.length > 0) {
      connection.release();
      return res.status(409).json({ message: 'Location already exists' });
    }

    const [result] = await connection.execute(
      'INSERT INTO locations (location_name, building, floor) VALUES (?, ?, ?)',
      [location_name, building || null, floor || null]
    );

    connection.release();

    res.status(201).json({
      message: 'Location created',
      location_id: result.insertId
    });
  } catch (error) {
    console.error('Create location error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
