# IT Incident Ticketing System

A secure, enterprise-grade incident ticketing system designed for IT teams to create, manage, and track incidents with email notifications.

## Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin, Engineer, Viewer)
  - Secure password hashing with bcryptjs

- **Incident Management**
  - Create incidents with detailed descriptions
  - Assign incidents to team members
  - Track incident status (Open, In Progress, Resolved, Closed)
  - Set priority levels (Low, Medium, High, Critical)
  - Add comments and resolution notes
  - Support for multiple incident types (Software, Hardware, Network, Security, etc.)
  - Location tracking for incidents

- **Email Notifications**
  - Automated emails on incident creation
  - Assignment notifications
  - Closure confirmation emails
  - Status update notifications
  - Email delivery logging and tracking

- **Security Features**
  - Helmet.js for HTTP header security
  - CORS protection
  - Rate limiting on authentication endpoints
  - Input validation and sanitization
  - SQL injection prevention with prepared statements
  - Audit logging for all actions

- **Database**
  - MySQL-based persistent storage
  - Complete audit trail
  - Email delivery logs
  - Referential integrity with foreign keys

## Tech Stack

- **Backend:** Node.js with Express.js
- **Database:** MySQL
- **Authentication:** JWT with jwt-simple
- **Password Security:** bcryptjs
- **Email Service:** Nodemailer
- **Security:** Helmet.js, CORS, Express Validator
- **Rate Limiting:** Express Rate Limit

## Installation

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Create Environment File**
   ```bash
   cp .env.example .env
   ```

3. **Configure Environment Variables**
   Edit `.env` with your configuration:
   - MySQL credentials
   - JWT secret key
   - SMTP email configuration
   - API and Frontend URLs

4. **Setup MySQL Database**
   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p incident_tracking < database/seed.sql
   ```

   Or connect to MySQL and run the SQL scripts manually.

5. **Create Admin User**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "admin",
       "email": "admin@company.com",
       "password": "SecurePassword123!",
       "role": "admin"
     }'
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on port 5000 (or the port specified in your .env file).

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Incidents
- `POST /api/incidents/create` - Create new incident
- `GET /api/incidents/list` - List incidents (with filters)
- `GET /api/incidents/:incidentId` - Get incident details
- `PUT /api/incidents/:incidentId/assign` - Assign incident
- `PUT /api/incidents/:incidentId/status` - Update incident status
- `PUT /api/incidents/:incidentId/close` - Close incident with resolution notes
- `POST /api/incidents/:incidentId/comment` - Add comment to incident

### Users (Admin Only)
- `GET /api/users/list` - List all users
- `GET /api/users/:userId` - Get user details
- `PUT /api/users/:userId/role` - Update user role
- `PUT /api/users/:userId/deactivate` - Deactivate user

### Incident Types (Admin Only)
- `GET /api/types` - List incident types
- `POST /api/types/create` - Create new incident type

### Locations (Admin Only)
- `GET /api/locations` - List locations
- `POST /api/locations/create` - Create new location

## Database Schema

The system uses the following main tables:
- **users** - User accounts and roles
- **incidents** - Incident records
- **incident_types** - Classification of incidents
- **locations** - Physical locations
- **incident_comments** - Comments on incidents
- **email_logs** - Email delivery tracking
- **audit_logs** - Comprehensive audit trail

## Security Considerations

1. Always use HTTPS in production
2. Change JWT_SECRET in production to a strong random value
3. Use environment variables for sensitive data
4. Keep MySQL user passwords secure
5. Implement proper backup strategy
6. Monitor audit logs regularly
7. Use strong passwords for all accounts
8. Consider IP whitelisting for sensitive endpoints

## Email Configuration

The system uses Nodemailer for email delivery. Supported configurations:

- **Gmail SMTP**
  ```
  SMTP_HOST=smtp.gmail.com
  SMTP_PORT=587
  SMTP_USER=your_email@gmail.com
  SMTP_PASSWORD=your_app_password
  ```

- **Other SMTP Servers**
  Update `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASSWORD` accordingly.

## Troubleshooting

### Database Connection Error
- Verify MySQL is running
- Check database credentials in .env
- Ensure database exists

### Email Not Sending
- Verify SMTP credentials in .env
- Check firewall/network rules
- Review email logs in database
- Enable "Less secure app access" for Gmail accounts

### Port Already in Use
- Change PORT in .env file
- Or kill process using the port

## Support

For issues or questions, contact the IT team or review audit logs for error details.

## License

MIT
