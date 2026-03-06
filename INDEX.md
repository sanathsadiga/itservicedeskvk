# IT Incident Ticketing System - Complete Documentation

A professional, secure incident ticketing system for IT teams to manage, track, and resolve support tickets with automated email notifications and comprehensive audit logging.

## Tech Stack

- **Frontend**: React 18, React Router, Zustand, Axios
- **Backend**: Node.js, Express.js, JWT Authentication
- **Database**: MySQL with prepared statements
- **Email**: Nodemailer with multiple SMTP support
- **Security**: Helmet.js, CORS, bcryptjs, input validation
- **Testing**: Jest, Supertest

## Quick Start

### Prerequisites
- Node.js 14+
- MySQL 5.7+
- npm or yarn

### Backend Setup (5 minutes)

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MySQL and SMTP credentials

# Setup database
mysql -u root -p incident_tracking < database/schema.sql
mysql -u root -p incident_tracking < database/seed.sql

# Start server
npm run dev
# Backend running on http://localhost:5000
```

### Frontend Setup (5 minutes)

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Default API URL: http://localhost:5000/api

# Start development server
npm start
# Frontend running on http://localhost:3000
```

## Key Features

### User Management
- Register and login with secure JWT authentication
- Role-based access control (Admin, Engineer, Viewer)
- User activation/deactivation
- Role assignment and modification

### Incident Management
- Create incidents with title, description, type, location, priority
- Assign incidents to team members
- Track incident status (Open, In Progress, Resolved, Closed)
- Add resolution notes when closing
- Support for comments and updates

### Notifications
- Automatic email on incident creation
- Assignment notifications to assigned users
- Closure confirmation emails
- Status update notifications
- Email delivery tracking and logging

### Admin Dashboard
- User management interface
- List all users with role selection
- Activate/deactivate user accounts
- Manage incident types and locations

### Security
- JWT token-based authentication
- Password hashing with bcryptjs (10 rounds)
- SQL injection prevention with prepared statements
- Input validation and sanitization
- CORS and CSRF protection
- Rate limiting on auth endpoints
- Comprehensive audit logging
- HTTPS ready

### Audit & Logging
- Track all user actions
- Log incident creation, assignment, status changes
- Record user role modifications
- Store IP addresses with audit logs
- Email delivery tracking
- Detailed error logging

## Project Structure

```
incident-tracking/
├── Backend (Node.js/Express)
│   ├── server.js                Main server file
│   ├── config/database.js       MySQL connection pool
│   ├── routes/                  API endpoints
│   ├── middleware/              Auth and error handling
│   ├── services/                Email and audit services
│   ├── utils/                   Helper functions
│   ├── database/                SQL schemas
│   └── tests/                   Unit tests
│
└── Frontend (React)
    ├── src/
    │   ├── pages/               Main pages
    │   ├── components/          Reusable components
    │   ├── services/            API client
    │   ├── store/               State management
    │   └── styles/              CSS stylesheets
    └── public/                  Static assets
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Incidents
- `POST /api/incidents/create` - Create incident
- `GET /api/incidents/list` - List incidents (with filters)
- `GET /api/incidents/:id` - Get incident details
- `PUT /api/incidents/:id/assign` - Assign incident
- `PUT /api/incidents/:id/status` - Update status
- `PUT /api/incidents/:id/close` - Close incident
- `POST /api/incidents/:id/comment` - Add comment

### Users (Admin)
- `GET /api/users/list` - List all users
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id/role` - Update user role
- `PUT /api/users/:id/deactivate` - Deactivate user

### Types & Locations (Admin)
- `GET /api/types` - List incident types
- `POST /api/types/create` - Create incident type
- `GET /api/locations` - List locations
- `POST /api/locations/create` - Create location

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

## Database Schema

### Core Tables
- **users** - User accounts with roles
- **incidents** - Incident records with full tracking
- **incident_types** - Software, Hardware, Network, Security, Database, System, Access
- **locations** - Office locations, buildings, floors
- **incident_comments** - Comments on incidents
- **email_logs** - Email delivery tracking
- **audit_logs** - Comprehensive action logging

## Configuration

### Backend Environment Variables
```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=password
MYSQL_DATABASE=incident_tracking

JWT_SECRET=your_very_secure_key_min_32_chars
JWT_EXPIRY=24h

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=app_password
SMTP_FROM=system@company.com

NODE_ENV=development
PORT=5000
```

### Frontend Environment Variables
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_DEBUG=false
```

## User Roles

### Admin
- Full system access
- User management
- Manage incident types and locations
- View all incidents
- Assign any incident

### Engineer
- Create incidents
- View own incidents
- Update assigned incidents
- Close incidents
- Add comments

### Viewer
- Read-only access
- View own incidents
- Add comments
- Cannot create or modify

## Testing

### Backend Tests
```bash
npm test
```

### Manual Testing with cURL
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"user","email":"user@test.com","password":"Pass123!!"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Pass123!!"}'

# Create incident
curl -X POST http://localhost:5000/api/incidents/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title":"Server Down","description":"Database server not responding","incident_type_id":5,"location_id":1,"priority":"critical"}'
```

## Production Deployment

### Backend
```bash
# Build and start
NODE_ENV=production npm start

# Or use process manager
pm2 start server.js --name "incident-api"
```

### Frontend
```bash
# Build static files
npm run build

# Deploy build/ folder to:
# - AWS S3 + CloudFront
# - Vercel
# - Netlify
# - Traditional web server
```

### Security Checklist
- [ ] Set strong JWT_SECRET
- [ ] Configure HTTPS/SSL
- [ ] Update database password
- [ ] Configure email credentials
- [ ] Set NODE_ENV=production
- [ ] Enable database backups
- [ ] Configure firewall rules
- [ ] Set up monitoring/alerting
- [ ] Review CORS settings
- [ ] Test email notifications
- [ ] Review audit logs

## Troubleshooting

### Database Connection Error
```bash
# Check MySQL is running
mysql -u root -p -e "SELECT 1;"

# Verify database
mysql -u root -p -e "SHOW DATABASES;"
```

### Email Not Sending
1. Verify SMTP credentials
2. Enable app password for Gmail
3. Check firewall allows outbound SMTP
4. Review email logs in database

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## Documentation

- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) - Complete API reference
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Detailed deployment instructions
- [QUICKSTART.md](./QUICKSTART.md) - Quick reference guide
- [FEATURES.md](./FEATURES.md) - Feature overview

## Database Backup

```bash
# Backup
mysqldump -u root -p incident_tracking > backup-$(date +%Y%m%d).sql

# Restore
mysql -u root -p incident_tracking < backup-20260305.sql
```

## Performance Features

- Connection pooling for database efficiency
- Rate limiting to prevent abuse
- Pagination for large datasets
- Indexed queries for fast lookups
- Async/await for non-blocking operations
- Compressed responses ready

## Security Features

- Secure password storage with bcryptjs
- JWT token expiration (24 hours)
- CORS with configurable origins
- Helmet.js for HTTP header security
- SQL injection prevention
- Input validation and sanitization
- Rate limiting on authentication
- Comprehensive audit logging
- Email verification ready

## Support & Help

1. Check logs:
   - Backend: Terminal console
   - Frontend: Browser DevTools (F12)
   
2. Review documentation:
   - API_DOCUMENTATION.md
   - DEPLOYMENT_GUIDE.md
   - FEATURES.md

3. Check database:
   - `SELECT * FROM audit_logs`
   - `SELECT * FROM email_logs`

4. Common issues:
   - Database connection: Verify MySQL credentials
   - Email: Check SMTP configuration
   - API: Verify backend is running
   - Frontend: Check REACT_APP_API_URL

## License

MIT License - Use freely in personal and commercial projects

## Version

1.0.0 - Initial Release (March 2026)

---

**Built with:** Node.js, Express, React, MySQL, and modern web security practices.

For questions or issues, review the documentation or check application logs.
