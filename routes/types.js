const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authorizeRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [types] = await connection.execute(
      'SELECT * FROM incident_types WHERE is_active = TRUE ORDER BY type_name'
    );
    connection.release();

    res.status(200).json({
      types
    });
  } catch (error) {
    console.error('Get types error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/create', authorizeRole(['admin']), [
  body('type_name').isLength({ min: 3 }).trim().escape(),
  body('description').trim().escape().optional()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { type_name, description } = req.body;

    const connection = await pool.getConnection();

    const [existing] = await connection.execute(
      'SELECT id FROM incident_types WHERE type_name = ?',
      [type_name]
    );

    if (existing.length > 0) {
      connection.release();
      return res.status(409).json({ message: 'Type already exists' });
    }

    const [result] = await connection.execute(
      'INSERT INTO incident_types (type_name, description) VALUES (?, ?)',
      [type_name, description || null]
    );

    connection.release();

    res.status(201).json({
      message: 'Incident type created',
      type_id: result.insertId
    });
  } catch (error) {
    console.error('Create type error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
