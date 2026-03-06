const nodemailer = require('nodemailer');

let transporter;

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
      <h2>New Incident Created</h2>
      <p><strong>Ticket Number:</strong> ${incident.ticket_number}</p>
      <p><strong>Title:</strong> ${incident.title}</p>
      <p><strong>Description:</strong> ${incident.description}</p>
      <p><strong>Type:</strong> ${incident.incident_type}</p>
      <p><strong>Location:</strong> ${incident.location}</p>
      <p><strong>Priority:</strong> ${incident.priority}</p>
      <p><strong>Created By:</strong> ${createdBy.username}</p>
      ${assignedTo ? `<p><strong>Assigned To:</strong> ${assignedTo.username}</p>` : ''}
      <p><strong>Status:</strong> ${incident.status}</p>
      <hr>
      <p>Please log in to the ticketing system to view full details.</p>
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
      <h2>Incident Closed</h2>
      <p><strong>Ticket Number:</strong> ${incident.ticket_number}</p>
      <p><strong>Title:</strong> ${incident.title}</p>
      <p><strong>Resolution Notes:</strong> ${incident.resolution_notes || 'No notes provided'}</p>
      <p><strong>Closed By:</strong> ${closedBy.username}</p>
      <p><strong>Closed At:</strong> ${new Date(incident.closed_at).toLocaleString()}</p>
      <hr>
      <p>The incident has been successfully resolved and closed.</p>
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
      <h2>Incident Assigned to You</h2>
      <p><strong>Ticket Number:</strong> ${incident.ticket_number}</p>
      <p><strong>Title:</strong> ${incident.title}</p>
      <p><strong>Description:</strong> ${incident.description}</p>
      <p><strong>Type:</strong> ${incident.incident_type}</p>
      <p><strong>Location:</strong> ${incident.location}</p>
      <p><strong>Priority:</strong> ${incident.priority}</p>
      <p><strong>Assigned By:</strong> ${assignedBy.username}</p>
      <hr>
      <p>Please log in to the system to review and work on this incident.</p>
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

    const htmlContent = `
      <h2>Incident Status Updated</h2>
      <p><strong>Ticket Number:</strong> ${incident.ticket_number}</p>
      <p><strong>Title:</strong> ${incident.title}</p>
      <p><strong>Previous Status:</strong> ${incident.previous_status || 'N/A'}</p>
      <p><strong>Current Status:</strong> ${newStatus}</p>
      <p><strong>Updated By:</strong> ${updatedBy.username}</p>
      <p><strong>Updated At:</strong> ${new Date().toLocaleString()}</p>
      <hr>
      <p>Please log in to the system for more details.</p>
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
      <h2>New Comment on Incident</h2>
      <p><strong>Ticket Number:</strong> ${incident.ticket_number}</p>
      <p><strong>Title:</strong> ${incident.title}</p>
      <p><strong>Status:</strong> ${incident.status}</p>
      <hr>
      <h3>Comment from ${commenter.username}:</h3>
      <p>${comment}</p>
      <hr>
      <p>Please log in to the ticketing system to view full details and respond.</p>
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

module.exports = {
  initializeEmailService,
  sendIncidentCreationEmail,
  sendIncidentClosureEmail,
  sendAssignmentEmail,
  sendStatusUpdateEmail,
  sendCommentNotificationEmail,
  getTransporter: () => transporter
};
