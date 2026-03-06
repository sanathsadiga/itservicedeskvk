const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authorizeRole } = require('../middleware/auth');
const { hashPassword } = require('../utils/tokenUtils');

const router = express.Router();

router.get('/list', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      'SELECT id, username, email, role, is_active, created_at FROM users WHERE is_active = TRUE ORDER BY username'
    );
    connection.release();

    res.status(200).json({
      users
    });
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:userId', authorizeRole(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;

    const connection = await pool.getConnection();
    const [users] = await connection.execute(
      'SELECT id, username, email, role, is_active, created_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'User not found' });
    }

    connection.release();

    res.status(200).json({
      user: users[0]
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:userId/deactivate', authorizeRole(['admin']), async (req, res) => {
  try {
    const { userId } = req.params;

    const connection = await pool.getConnection();
    await connection.execute(
      'UPDATE users SET is_active = FALSE WHERE id = ?',
      [userId]
    );
    connection.release();

    res.status(200).json({
      message: 'User deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:userId/role', authorizeRole(['admin']), [
  body('role').isIn(['admin', 'engineer', 'viewer'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { userId } = req.params;
    const { role } = req.body;

    const connection = await pool.getConnection();
    await connection.execute(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, userId]
    );
    connection.release();

    res.status(200).json({
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
