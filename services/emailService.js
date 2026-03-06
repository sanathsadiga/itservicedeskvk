const nodemailer = require('nodemailer');

let transporter;

// Email template styles
const emailStyles = `
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .email-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .email-header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .email-content {
      padding: 30px;
    }
    .email-section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #667eea;
      margin-bottom: 15px;
      border-bottom: 2px solid #f0f0f0;
      padding-bottom: 10px;
    }
    .info-row {
      display: flex;
      margin-bottom: 10px;
      padding: 8px 0;
    }
    .info-label {
      font-weight: 600;
      color: #666;
      width: 140px;
      flex-shrink: 0;
    }
    .info-value {
      color: #333;
      word-break: break-word;
    }
    .ticket-number {
      background-color: #f0f0f0;
      padding: 2px 8px;
      border-radius: 4px;
      font-family: monospace;
      font-weight: 600;
      color: #667eea;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-open {
      background-color: #e3f2fd;
      color: #1976d2;
    }
    .status-in-progress {
      background-color: #fff3e0;
      color: #f57c00;
    }
    .status-closed {
      background-color: #e8f5e9;
      color: #388e3c;
    }
    .priority-critical {
      background-color: #fce4ec;
      color: #c2185b;
    }
    .priority-high {
      background-color: #ffebee;
      color: #d32f2f;
    }
    .priority-medium {
      background-color: #fff3e0;
      color: #f57c00;
    }
    .priority-low {
      background-color: #e8f5e9;
      color: #388e3c;
    }
    .comment-box {
      background-color: #f9f9f9;
      border-left: 4px solid #667eea;
      padding: 15px;
      margin: 15px 0;
      border-radius: 4px;
    }
    .comment-author {
      font-weight: 600;
      color: #667eea;
      margin-bottom: 10px;
      font-size: 14px;
    }
    .comment-text {
      color: #333;
      white-space: pre-wrap;
      word-break: break-word;
    }
    .mention-highlight {
      background-color: #fff59d;
      padding: 0 4px;
      border-radius: 2px;
      font-weight: 600;
      color: #f57f17;
    }
    .divider {
      border-top: 1px solid #e0e0e0;
      margin: 20px 0;
    }
    .action-button {
      display: inline-block;
      padding: 12px 24px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 600;
      margin: 20px 0;
    }
    .action-button:hover {
      opacity: 0.9;
    }
    .email-footer {
      background-color: #f5f5f5;
      padding: 20px;
      text-align: center;
      color: #999;
      font-size: 12px;
      border-top: 1px solid #e0e0e0;
    }
    .footer-link {
      color: #667eea;
      text-decoration: none;
    }
    ul {
      list-style: none;
      padding: 0;
      margin: 10px 0;
    }
    li {
      padding: 8px 0;
      padding-left: 20px;
      position: relative;
    }
    li:before {
      content: "→";
      position: absolute;
      left: 0;
      color: #667eea;
      font-weight: bold;
    }
  </style>
`;

const initializeEmailService = async () => {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });

  try {
    await transporter.verify();
    console.log('Email service configured successfully');
  } catch (error) {
    console.error('Email service configuration failed:', error.message);
  }
};

const sendIncidentCreationEmail = async (incident, createdBy, assignedTo = null) => {
  try {
    const recipients = [createdBy.email];
    if (assignedTo) {
      recipients.push(assignedTo.email);
    }

    const subject = `[INCIDENT CREATED] Ticket ${incident.ticket_number}: ${incident.title}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        ${emailStyles}
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h1>New Incident Created</h1>
          </div>
          <div class="email-content">
            <div class="email-section">
              <div class="info-row">
                <span class="info-label">Ticket:</span>
                <span class="info-value"><span class="ticket-number">${incident.ticket_number}</span></span>
              </div>
              <div class="info-row">
                <span class="info-label">Title:</span>
                <span class="info-value">${incident.title}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Description:</span>
                <span class="info-value">${incident.description}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Type:</span>
                <span class="info-value">${incident.incident_type}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Location:</span>
                <span class="info-value">${incident.location}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Priority:</span>
                <span class="info-value"><span class="status-badge priority-${incident.priority}">${incident.priority}</span></span>
              </div>
              <div class="info-row">
                <span class="info-label">Created By:</span>
                <span class="info-value">${createdBy.username}</span>
              </div>
              ${assignedTo ? `<div class="info-row">
                <span class="info-label">Assigned To:</span>
                <span class="info-value">${assignedTo.username}</span>
              </div>` : ''}
              <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value"><span class="status-badge status-open">${incident.status}</span></span>
              </div>
            </div>
            <div class="divider"></div>
            <p>Please log in to the ticketing system to view full details and take action.</p>
          </div>
          <div class="email-footer">
            <p>IT Incident Ticketing System | Do not reply to this email</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: recipients.join(','),
      subject: subject,
      html: htmlContent
    });

    return true;
  } catch (error) {
    console.error('Failed to send incident creation email:', error.message);
    return false;
  }
};

const sendIncidentClosureEmail = async (incident, closedBy, assignedTo = null) => {
  try {
    const recipients = [closedBy.email];
    if (assignedTo) {
      recipients.push(assignedTo.email);
    }

    const subject = `[INCIDENT CLOSED] Ticket ${incident.ticket_number}: ${incident.title}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        ${emailStyles}
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h1>Incident Closed</h1>
          </div>
          <div class="email-content">
            <div class="email-section">
              <div class="info-row">
                <span class="info-label">Ticket:</span>
                <span class="info-value"><span class="ticket-number">${incident.ticket_number}</span></span>
              </div>
              <div class="info-row">
                <span class="info-label">Title:</span>
                <span class="info-value">${incident.title}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value"><span class="status-badge status-closed">Closed</span></span>
              </div>
            </div>
            <div class="divider"></div>
            <div class="email-section">
              <div class="section-title">Resolution Notes</div>
              <div class="comment-box">
                <p class="comment-text">${incident.resolution_notes || 'No resolution notes provided'}</p>
              </div>
            </div>
            <div class="email-section">
              <div class="info-row">
                <span class="info-label">Closed By:</span>
                <span class="info-value">${closedBy.username}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Closed At:</span>
                <span class="info-value">${new Date(incident.closed_at).toLocaleString()}</span>
              </div>
            </div>
            <div class="divider"></div>
            <p>The incident has been successfully resolved and closed.</p>
          </div>
          <div class="email-footer">
            <p>IT Incident Ticketing System | Do not reply to this email</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: recipients.join(','),
      subject: subject,
      html: htmlContent
    });

    return true;
  } catch (error) {
    console.error('Failed to send incident closure email:', error.message);
    return false;
  }
};

const sendAssignmentEmail = async (incident, assignedTo, assignedBy) => {
  try {
    const subject = `[ASSIGNED] Ticket ${incident.ticket_number}: ${incident.title}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        ${emailStyles}
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h1>Incident Assigned to You</h1>
          </div>
          <div class="email-content">
            <p>Hi <strong>${assignedTo.username}</strong>,</p>
            <p>You have been assigned to a new incident. Please review the details below:</p>
            <div class="email-section">
              <div class="info-row">
                <span class="info-label">Ticket:</span>
                <span class="info-value"><span class="ticket-number">${incident.ticket_number}</span></span>
              </div>
              <div class="info-row">
                <span class="info-label">Title:</span>
                <span class="info-value">${incident.title}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Description:</span>
                <span class="info-value">${incident.description}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Type:</span>
                <span class="info-value">${incident.incident_type}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Location:</span>
                <span class="info-value">${incident.location}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Priority:</span>
                <span class="info-value"><span class="status-badge priority-${incident.priority}">${incident.priority}</span></span>
              </div>
              <div class="info-row">
                <span class="info-label">Assigned By:</span>
                <span class="info-value">${assignedBy.username}</span>
              </div>
            </div>
            <div class="divider"></div>
            <p>Please log in to the system to review and work on this incident.</p>
          </div>
          <div class="email-footer">
            <p>IT Incident Ticketing System | Do not reply to this email</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: assignedTo.email,
      subject: subject,
      html: htmlContent
    });

    return true;
  } catch (error) {
    console.error('Failed to send assignment email:', error.message);
    return false;
  }
};

const sendStatusUpdateEmail = async (incident, updatedBy, recipients, newStatus) => {
  try {
    const subject = `[STATUS UPDATE] Ticket ${incident.ticket_number}: ${incident.title}`;

    const statusClass = `status-${newStatus.replace('_', '-')}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        ${emailStyles}
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h1>Incident Status Updated</h1>
          </div>
          <div class="email-content">
            <div class="email-section">
              <div class="info-row">
                <span class="info-label">Ticket:</span>
                <span class="info-value"><span class="ticket-number">${incident.ticket_number}</span></span>
              </div>
              <div class="info-row">
                <span class="info-label">Title:</span>
                <span class="info-value">${incident.title}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Current Status:</span>
                <span class="info-value"><span class="status-badge ${statusClass}">${newStatus}</span></span>
              </div>
              <div class="info-row">
                <span class="info-label">Updated By:</span>
                <span class="info-value">${updatedBy.username}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Updated At:</span>
                <span class="info-value">${new Date().toLocaleString()}</span>
              </div>
            </div>
            <div class="divider"></div>
            <p>Please log in to the system for more details.</p>
          </div>
          <div class="email-footer">
            <p>IT Incident Ticketing System | Do not reply to this email</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: recipients.join(','),
      subject: subject,
      html: htmlContent
    });

    return true;
  } catch (error) {
    console.error('Failed to send status update email:', error.message);
    return false;
  }
};

const sendCommentNotificationEmail = async (incident, commenter, recipientEmail, comment) => {
  try {
    const subject = `[COMMENT ADDED] Ticket ${incident.ticket_number}: ${incident.title}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        ${emailStyles}
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h1>New Comment on Incident</h1>
          </div>
          <div class="email-content">
            <div class="email-section">
              <div class="info-row">
                <span class="info-label">Ticket:</span>
                <span class="info-value"><span class="ticket-number">${incident.ticket_number}</span></span>
              </div>
              <div class="info-row">
                <span class="info-label">Title:</span>
                <span class="info-value">${incident.title}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value"><span class="status-badge status-${incident.status}">${incident.status}</span></span>
              </div>
            </div>
            <div class="divider"></div>
            <div class="email-section">
              <div class="section-title">Comment from ${commenter.username}</div>
              <div class="comment-box">
                <div class="comment-author">${commenter.username}</div>
                <p class="comment-text">${comment}</p>
              </div>
            </div>
            <div class="divider"></div>
            <p>Please log in to the ticketing system to view full details and respond.</p>
          </div>
          <div class="email-footer">
            <p>IT Incident Ticketing System | Do not reply to this email</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: recipientEmail,
      subject,
      html: htmlContent
    });

    return true;
  } catch (error) {
    console.error('Failed to send comment notification email:', error.message);
    return false;
  }
};

const sendMentionNotificationEmail = async (incident, commenter, recipientEmail, mentionedUsername, comment) => {
  try {
    const subject = `[MENTION] You were mentioned in Ticket ${incident.ticket_number}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        ${emailStyles}
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <h1>You Were Mentioned</h1>
          </div>
          <div class="email-content">
            <p>Hi <strong>${mentionedUsername}</strong>,</p>
            <p><strong>${commenter.username}</strong> mentioned you in a comment on the following incident:</p>
            <div class="email-section">
              <div class="info-row">
                <span class="info-label">Ticket:</span>
                <span class="info-value"><span class="ticket-number">${incident.ticket_number}</span></span>
              </div>
              <div class="info-row">
                <span class="info-label">Title:</span>
                <span class="info-value">${incident.title}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="info-value"><span class="status-badge status-${incident.status}">${incident.status}</span></span>
              </div>
              <div class="info-row">
                <span class="info-label">Priority:</span>
                <span class="info-value"><span class="status-badge priority-${incident.priority}">${incident.priority}</span></span>
              </div>
            </div>
            <div class="divider"></div>
            <div class="email-section">
              <div class="section-title">Comment from ${commenter.username}</div>
              <div class="comment-box">
                <div class="comment-author"><span class="mention-highlight">@${mentionedUsername}</span> was mentioned in this comment:</div>
                <p class="comment-text">${comment}</p>
              </div>
            </div>
            <div class="divider"></div>
            <p>Please log in to the ticketing system to view full details and respond.</p>
          </div>
          <div class="email-footer">
            <p>IT Incident Ticketing System | Do not reply to this email</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: recipientEmail,
      subject,
      html: htmlContent
    });

    return true;
  } catch (error) {
    console.error('Failed to send mention notification email:', error.message);
    return false;
  }
};

module.exports = {
  initializeEmailService,
  sendIncidentCreationEmail,
  sendIncidentClosureEmail,
  sendAssignmentEmail,
  sendStatusUpdateEmail,
  sendCommentNotificationEmail,
  sendMentionNotificationEmail,
  getTransporter: () => transporter
};
