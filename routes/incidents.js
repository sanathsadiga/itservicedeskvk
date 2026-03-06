const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authorizeRole } = require('../middleware/auth');
const { generateTicketNumber, getClientIp } = require('../utils/helpers');
const { sendIncidentCreationEmail, sendIncidentClosureEmail, sendAssignmentEmail, sendStatusUpdateEmail, sendCommentNotificationEmail } = require('../services/emailService');
const { logAudit, logEmailAttempt } = require('../services/auditService');

const router = express.Router();

router.post('/create', [
  body('title').isLength({ min: 5 }).trim().escape(),
  body('description').isLength({ min: 10 }).trim().escape(),
  body('incident_type_id').isInt(),
  body('location_id').isInt(),
  body('priority').isIn(['low', 'medium', 'high', 'critical']).optional()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, incident_type_id, location_id, assigned_to, priority } = req.body;
    const createdBy = req.user.userId;
    const ticket_number = generateTicketNumber();
    const clientIp = getClientIp(req);

    const connection = await pool.getConnection();

    const query = `
      INSERT INTO incidents 
      (ticket_number, title, description, incident_type_id, location_id, assigned_to, created_by, priority, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open')
    `;

    const [result] = await connection.execute(query, [
      ticket_number,
      title,
      description,
      incident_type_id,
      location_id,
      assigned_to || null,
      createdBy,
      priority || 'medium'
    ]);

    const incidentId = result.insertId;

    const [incidentData] = await connection.execute(`
      SELECT i.*, it.type_name as incident_type, l.location_name as location, 
             u1.username as created_by_name, u1.email as created_by_email,
             u2.username as assigned_to_name, u2.email as assigned_to_email
      FROM incidents i
      JOIN incident_types it ON i.incident_type_id = it.id
      JOIN locations l ON i.location_id = l.id
      JOIN users u1 ON i.created_by = u1.id
      LEFT JOIN users u2 ON i.assigned_to = u2.id
      WHERE i.id = ?
    `, [incidentId]);

    const incident = incidentData[0];

    await logAudit(createdBy, 'CREATE_INCIDENT', 'incident', incidentId, {}, {
      ticket_number,
      title,
      status: 'open'
    }, clientIp);

    const createdByUser = { username: incident.created_by_name, email: incident.created_by_email };
    const assignedToUser = assigned_to ? { username: incident.assigned_to_name, email: incident.assigned_to_email } : null;

    const emailSent = await sendIncidentCreationEmail(
      { ...incident, incident_type: incident.incident_type, location: incident.location },
      createdByUser,
      assignedToUser
    );

    await logEmailAttempt(incidentId, createdByUser.email, 'creation', `Incident Created: ${ticket_number}`, emailSent ? 'sent' : 'failed');
    if (assignedToUser) {
      await logEmailAttempt(incidentId, assignedToUser.email, 'creation', `Incident Created: ${ticket_number}`, emailSent ? 'sent' : 'failed');
    }

    connection.release();

    res.status(201).json({
      message: 'Incident created successfully',
      incident: {
        id: incidentId,
        ticket_number,
        title,
        status: 'open',
        created_at: new Date()
      }
    });
  } catch (error) {
    console.error('Create incident error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/list', async (req, res) => {
  try {
    const { status, priority } = req.query;
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;
    const userId = req.user.userId;
    const userRole = req.user.role;

    const connection = await pool.getConnection();

    let query = 'SELECT i.id, i.ticket_number, i.title, i.description, i.status, i.priority, ';
    query += 'i.incident_type_id, i.location_id, i.assigned_to, i.created_by, ';
    query += 'i.created_at, i.updated_at, i.closed_at, i.resolution_notes, ';
    query += 'it.type_name as incident_type, l.location_name as location, ';
    query += 'u1.username as created_by_name, u2.username as assigned_to_name ';
    query += 'FROM incidents i ';
    query += 'INNER JOIN incident_types it ON i.incident_type_id = it.id ';
    query += 'INNER JOIN locations l ON i.location_id = l.id ';
    query += 'INNER JOIN users u1 ON i.created_by = u1.id ';
    query += 'LEFT JOIN users u2 ON i.assigned_to = u2.id ';
    query += 'WHERE 1=1 ';

    if (userRole !== 'admin') {
      query += 'AND (i.created_by = ' + connection.escape(userId) + ' OR i.assigned_to = ' + connection.escape(userId) + ') ';
    }

    if (status) {
      query += 'AND i.status = ' + connection.escape(status) + ' ';
    }

    if (priority) {
      query += 'AND i.priority = ' + connection.escape(priority) + ' ';
    }

    query += 'ORDER BY i.created_at DESC ';
    query += 'LIMIT ' + connection.escape(limit) + ' OFFSET ' + connection.escape(offset);

    const [incidents] = await connection.query(query);
    connection.release();

    res.status(200).json({
      incidents: incidents || [],
      count: incidents ? incidents.length : 0
    });
  } catch (error) {
    console.error('List incidents error:', error.message);
    res.status(500).json({ message: 'Failed to fetch incidents' });
  }
});

router.get('/:incidentId', async (req, res) => {
  try {
    const { incidentId } = req.params;
    const userId = req.user.userId;

    const connection = await pool.getConnection();

    const [incident] = await connection.execute(`
      SELECT i.*, it.type_name as incident_type, l.location_name as location,
             u1.username as created_by_name, u1.email as created_by_email,
             u2.username as assigned_to_name, u2.email as assigned_to_email
      FROM incidents i
      JOIN incident_types it ON i.incident_type_id = it.id
      JOIN locations l ON i.location_id = l.id
      JOIN users u1 ON i.created_by = u1.id
      LEFT JOIN users u2 ON i.assigned_to = u2.id
      WHERE i.id = ?
    `, [incidentId]);

    if (incident.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Incident not found' });
    }

    const inc = incident[0];

    if (req.user.role !== 'admin' && inc.created_by !== userId && inc.assigned_to !== userId) {
      connection.release();
      return res.status(403).json({ message: 'Access denied' });
    }

    const [comments] = await connection.execute(`
      SELECT c.*, u.username from incident_comments c
      JOIN users u ON c.created_by = u.id
      WHERE c.incident_id = ?
      ORDER BY c.created_at DESC
    `, [incidentId]);

    connection.release();

    res.status(200).json({
      incident: inc,
      comments
    });
  } catch (error) {
    console.error('Get incident error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:incidentId/assign', [
  body('assigned_to').isInt()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { incidentId } = req.params;
    const { assigned_to } = req.body;
    const userId = req.user.userId;
    const clientIp = getClientIp(req);

    const connection = await pool.getConnection();

    const [incident] = await connection.execute(
      'SELECT * FROM incidents WHERE id = ?',
      [incidentId]
    );

    if (incident.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Incident not found' });
    }

    if (req.user.role !== 'admin' && incident[0].created_by !== userId) {
      connection.release();
      return res.status(403).json({ message: 'Only admins or creators can assign incidents' });
    }

    const [user] = await connection.execute(
      'SELECT * FROM users WHERE id = ?',
      [assigned_to]
    );

    if (user.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'User not found' });
    }

    await connection.execute(
      'UPDATE incidents SET assigned_to = ? WHERE id = ?',
      [assigned_to, incidentId]
    );

    const [updatedIncident] = await connection.execute(`
      SELECT i.*, it.type_name as incident_type, l.location_name as location,
             u1.username as created_by_name, u1.email as created_by_email,
             u2.username as assigned_to_name, u2.email as assigned_to_email
      FROM incidents i
      JOIN incident_types it ON i.incident_type_id = it.id
      JOIN locations l ON i.location_id = l.id
      JOIN users u1 ON i.created_by = u1.id
      LEFT JOIN users u2 ON i.assigned_to = u2.id
      WHERE i.id = ?
    `, [incidentId]);

    const inc = updatedIncident[0];
    const assignedByUser = { username: inc.created_by_name, email: inc.created_by_email };
    const assignedToUser = { username: inc.assigned_to_name, email: inc.assigned_to_email };

    await logAudit(userId, 'ASSIGN_INCIDENT', 'incident', incidentId, { assigned_to: incident[0].assigned_to }, { assigned_to }, clientIp);

    const emailSent = await sendAssignmentEmail(inc, assignedToUser, assignedByUser);
    await logEmailAttempt(incidentId, assignedToUser.email, 'assignment', `Incident Assigned: ${inc.ticket_number}`, emailSent ? 'sent' : 'failed');

    connection.release();

    res.status(200).json({
      message: 'Incident assigned successfully',
      incident: inc
    });
  } catch (error) {
    console.error('Assign incident error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:incidentId/close', [
  body('resolution_notes').trim().escape()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { incidentId } = req.params;
    const { resolution_notes } = req.body;
    const userId = req.user.userId;
    const clientIp = getClientIp(req);

    const connection = await pool.getConnection();

    const [incident] = await connection.execute(
      'SELECT * FROM incidents WHERE id = ?',
      [incidentId]
    );

    if (incident.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Incident not found' });
    }

    const inc = incident[0];

    if (req.user.role !== 'admin' && inc.assigned_to !== userId && inc.created_by !== userId) {
      connection.release();
      return res.status(403).json({ message: 'Only admins or assigned users can close incidents' });
    }

    await connection.execute(
      'UPDATE incidents SET status = ?, resolution_notes = ?, closed_at = NOW() WHERE id = ?',
      ['closed', resolution_notes || null, incidentId]
    );

    const [closedIncident] = await connection.execute(`
      SELECT i.*, it.type_name as incident_type, l.location_name as location,
             u1.username as created_by_name, u1.email as created_by_email,
             u2.username as assigned_to_name, u2.email as assigned_to_email
      FROM incidents i
      JOIN incident_types it ON i.incident_type_id = it.id
      JOIN locations l ON i.location_id = l.id
      JOIN users u1 ON i.created_by = u1.id
      LEFT JOIN users u2 ON i.assigned_to = u2.id
      WHERE i.id = ?
    `, [incidentId]);

    const closedInc = closedIncident[0];
    const closedByUser = { username: closedInc.assigned_to_name || closedInc.created_by_name, email: closedInc.assigned_to_email || closedInc.created_by_email };
    const createdByUser = { username: closedInc.created_by_name, email: closedInc.created_by_email };

    await logAudit(userId, 'CLOSE_INCIDENT', 'incident', incidentId, { status: inc.status }, { status: 'closed' }, clientIp);

    const recipients = [createdByUser.email];
    if (closedInc.assigned_to) {
      recipients.push(closedInc.assigned_to_email);
    }

    const emailSent = await sendIncidentClosureEmail(closedInc, closedByUser, closedInc.assigned_to ? { username: closedInc.assigned_to_name, email: closedInc.assigned_to_email } : null);

    for (const email of recipients) {
      await logEmailAttempt(incidentId, email, 'closure', `Incident Closed: ${closedInc.ticket_number}`, emailSent ? 'sent' : 'failed');
    }

    connection.release();

    res.status(200).json({
      message: 'Incident closed successfully',
      incident: closedInc
    });
  } catch (error) {
    console.error('Close incident error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:incidentId/status', [
  body('status').isIn(['open', 'in_progress', 'resolved', 'closed'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { incidentId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;
    const clientIp = getClientIp(req);

    const connection = await pool.getConnection();

    const [incident] = await connection.execute(
      'SELECT * FROM incidents WHERE id = ?',
      [incidentId]
    );

    if (incident.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Incident not found' });
    }

    const inc = incident[0];

    if (req.user.role !== 'admin' && inc.assigned_to !== userId) {
      connection.release();
      return res.status(403).json({ message: 'Only admins or assigned users can update status' });
    }

    await connection.execute(
      'UPDATE incidents SET status = ? WHERE id = ?',
      [status, incidentId]
    );

    const [updatedIncident] = await connection.execute(`
      SELECT i.*, u1.username as created_by_name, u1.email as created_by_email,
             u2.username as assigned_to_name, u2.email as assigned_to_email
      FROM incidents i
      JOIN users u1 ON i.created_by = u1.id
      LEFT JOIN users u2 ON i.assigned_to = u2.id
      WHERE i.id = ?
    `, [incidentId]);

    const updatedInc = updatedIncident[0];

    await logAudit(userId, 'UPDATE_INCIDENT_STATUS', 'incident', incidentId, { status: inc.status }, { status }, clientIp);

    const recipients = [updatedInc.created_by_email];
    if (updatedInc.assigned_to) {
      recipients.push(updatedInc.assigned_to_email);
    }

    const emailSent = await sendStatusUpdateEmail(
      updatedInc,
      { username: req.user.username || 'System', email: 'system@internal' },
      recipients,
      status
    );

    for (const email of recipients) {
      await logEmailAttempt(incidentId, email, 'status_update', `Status Update: ${updatedInc.ticket_number}`, emailSent ? 'sent' : 'failed');
    }

    connection.release();

    res.status(200).json({
      message: 'Status updated successfully',
      incident: updatedInc
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/:incidentId/comment', [
  body('comment').isLength({ min: 1 }).trim().escape()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { incidentId } = req.params;
    const { comment } = req.body;
    const userId = req.user.userId;
    const clientIp = getClientIp(req);

    const connection = await pool.getConnection();

    const [incident] = await connection.execute(
      'SELECT i.*, u.email as created_by_email, u.username as created_by_name FROM incidents i JOIN users u ON i.created_by = u.id WHERE i.id = ?',
      [incidentId]
    );

    if (incident.length === 0) {
      connection.release();
      return res.status(404).json({ message: 'Incident not found' });
    }

    const [commenterData] = await connection.execute(
      'SELECT username, email FROM users WHERE id = ?',
      [userId]
    );

    const [result] = await connection.execute(
      'INSERT INTO incident_comments (incident_id, created_by, comment) VALUES (?, ?, ?)',
      [incidentId, userId, comment]
    );

    const commenter = commenterData[0];
    const incidentData = incident[0];

    // Send email to incident creator if they're not the one commenting
    if (incidentData.created_by !== userId && incidentData.created_by_email) {
      const emailSent = await sendCommentNotificationEmail(
        incidentData,
        commenter,
        incidentData.created_by_email,
        comment
      );
      await logEmailAttempt(incidentId, incidentData.created_by_email, 'comment', `Comment Added on ${incidentData.ticket_number}`, emailSent ? 'sent' : 'failed');
    }

    // Send email to assigned person if they exist and are not the commenter
    if (incidentData.assigned_to && incidentData.assigned_to !== userId) {
      const [assigneeData] = await connection.execute(
        'SELECT email FROM users WHERE id = ?',
        [incidentData.assigned_to]
      );
      if (assigneeData[0]) {
        const emailSent = await sendCommentNotificationEmail(
          incidentData,
          commenter,
          assigneeData[0].email,
          comment
        );
        await logEmailAttempt(incidentId, assigneeData[0].email, 'comment', `Comment Added on ${incidentData.ticket_number}`, emailSent ? 'sent' : 'failed');
      }
    }

    await logAudit(userId, 'ADD_COMMENT', 'comment', result.insertId, {}, { comment }, clientIp);

    connection.release();

    res.status(201).json({
      message: 'Comment added successfully',
      comment_id: result.insertId
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
