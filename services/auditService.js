const pool = require('../config/database');

const logAudit = async (userId, action, resourceType, resourceId, oldValues, newValues, ipAddress) => {
  try {
    const query = `
      INSERT INTO audit_logs (user_id, action, resource_type, resource_id, old_values, new_values, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const connection = await pool.getConnection();
    await connection.execute(query, [
      userId,
      action,
      resourceType,
      resourceId,
      JSON.stringify(oldValues),
      JSON.stringify(newValues),
      ipAddress
    ]);
    connection.release();

    return true;
  } catch (error) {
    console.error('Failed to log audit:', error.message);
    return false;
  }
};

const logEmailAttempt = async (incidentId, recipientEmail, emailType, subject, status, errorMessage = null) => {
  try {
    const query = `
      INSERT INTO email_logs (incident_id, recipient_email, email_type, subject, status, error_message)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const connection = await pool.getConnection();
    await connection.execute(query, [
      incidentId,
      recipientEmail,
      emailType,
      subject,
      status,
      errorMessage
    ]);
    connection.release();

    return true;
  } catch (error) {
    console.error('Failed to log email:', error.message);
    return false;
  }
};

const getAuditLogs = async (filters = {}, limit = 100, offset = 0) => {
  try {
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];

    if (filters.userId) {
      query += ' AND user_id = ?';
      params.push(filters.userId);
    }

    if (filters.action) {
      query += ' AND action = ?';
      params.push(filters.action);
    }

    if (filters.resourceType) {
      query += ' AND resource_type = ?';
      params.push(filters.resourceType);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const connection = await pool.getConnection();
    const [logs] = await connection.execute(query, params);
    connection.release();

    return logs;
  } catch (error) {
    console.error('Failed to fetch audit logs:', error.message);
    return [];
  }
};

module.exports = {
  logAudit,
  logEmailAttempt,
  getAuditLogs
};
