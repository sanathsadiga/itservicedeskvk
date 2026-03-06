# Complete Setup and Deployment Guide

## Project Structure

```
incident tracking/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── config/
│   │   └── database.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── incidents.js
│   │   ├── users.js
│   │   ├── types.js
│   │   └── locations.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── services/
│   │   ├── emailService.js
│   │   └── auditService.js
│   ├── utils/
│   │   ├── tokenUtils.js
│   │   └── helpers.js
│   ├── database/
│   │   ├── schema.sql
│   │   └── seed.sql
│   └── tests/
│       └── api.test.js
│
└── frontend/
    ├── package.json
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── index.js
    │   ├── App.js
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Dashboard.js
    │   │   ├── CreateIncident.js
    │   │   ├── IncidentDetail.js
    │   │   └── UserManagement.js
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   └── ProtectedRoute.js
    │   ├── services/
    │   │   └── api.js
    │   ├── store/
    │   │   └── authStore.js
    │   └── styles/
    │       ├── Global.css
    │       ├── Auth.css
    │       ├── Navbar.css
    │       ├── Dashboard.css
    │       ├── CreateIncident.css
    │       ├── IncidentDetail.css
    │       └── Admin.css
    └── .env.example
```

## Backend Setup

### 1. Install Backend Dependencies

Navigate to the backend directory and install packages:

```bash
cd "incident tracking"
npm install
```

### 2. Configure Backend Environment

Create `.env` file from template:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_db_password
MYSQL_DATABASE=incident_tracking

JWT_SECRET=your_very_long_secure_random_key_min_32_chars
JWT_EXPIRY=24h

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_specific_password
SMTP_FROM=incident-system@yourcompany.com

NODE_ENV=development
PORT=5000

API_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

LOG_LEVEL=info
```

### 3. Setup MySQL Database

#### Option A: Using Command Line

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE incident_tracking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Import schema
mysql -u root -p incident_tracking < database/schema.sql

# Import seed data
mysql -u root -p incident_tracking < database/seed.sql
```

#### Option B: Using MySQL Client

```bash
mysql -u root -p

# In MySQL prompt:
CREATE DATABASE incident_tracking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE incident_tracking;
SOURCE database/schema.sql;
SOURCE database/seed.sql;
EXIT;
```

### 4. Start Backend Server

Development mode with auto-reload:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

Backend runs on `http://localhost:5000`

## Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Configure Frontend Environment

Create `.env` file:

```bash
cp .env.example .env
```

Default `.env` content:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_DEBUG=false
```

### 4. Start Frontend Development Server

```bash
npm start
```

Frontend runs on `http://localhost:3000`

## Complete Application Startup

### Terminal 1: Backend

```bash
cd "incident tracking"
npm install
npm run dev
```

### Terminal 2: Frontend

```bash
cd "incident tracking/frontend"
npm install
npm start
```

Application will be available at: `http://localhost:3000`

## Testing the System

### 1. Create Admin User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@company.com",
    "password": "AdminPassword123!",
    "role": "admin"
  }'
```

### 2. Login in Frontend

- Navigate to `http://localhost:3000/login`
- Use admin credentials
- You should see the dashboard

### 3. Create Test Incident

- Click "Create Incident"
- Fill in the form
- Submit
- Email notification should be sent (check email service logs)

### 4. Close Incident

- Open incident details
- Add resolution notes in sidebar
- Click "Close Incident"
- Email notification sent to all involved parties

## Production Deployment

### Backend Deployment

1. Set environment variables:

```bash
export NODE_ENV=production
export JWT_SECRET="your_very_secure_random_key"
export MYSQL_PASSWORD="secure_password"
```

2. Install dependencies:

```bash
npm install --production
```

3. Run migrations and start:

```bash
npm start
```

### Frontend Deployment

1. Build for production:

```bash
npm run build
```

2. Deploy `build/` folder to:
   - AWS S3 + CloudFront
   - Vercel
   - Netlify
   - Traditional web server (Apache/Nginx)

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        root /var/www/incident-frontend/build;
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5000/api/;
    }
}
```

## Database Backup and Restore

### Backup

```bash
mysqldump -u root -p incident_tracking > backup-$(date +%Y%m%d).sql
```

### Restore

```bash
mysql -u root -p incident_tracking < backup-20260305.sql
```

## Security Checklist

Before Production:

- [ ] Change JWT_SECRET to strong random value
- [ ] Update SMTP credentials
- [ ] Configure HTTPS/SSL
- [ ] Set secure MySQL password
- [ ] Enable firewall rules
- [ ] Configure CORS properly
- [ ] Setup rate limiting
- [ ] Enable logging and monitoring
- [ ] Configure backups
- [ ] Test email notifications
- [ ] Review audit logs
- [ ] Change default admin password
- [ ] Set up monitoring alerts

## Troubleshooting

### Database Connection Error

```bash
# Check MySQL is running
mysql -u root -p -e "SELECT 1;"

# Check database exists
mysql -u root -p -e "SHOW DATABASES;"

# Check user permissions
mysql -u root -p -e "SHOW GRANTS FOR 'root'@'localhost';"
```

### Port Already in Use

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Email Not Sending

1. Check SMTP credentials in `.env`
2. Verify email account has app password enabled
3. Check firewall allows outbound SMTP
4. Review email logs in database:

```sql
SELECT * FROM email_logs WHERE status = 'failed' ORDER BY sent_at DESC;
```

### API Connection Issues

1. Verify backend is running on port 5000
2. Check REACT_APP_API_URL in frontend `.env`
3. Check browser console for CORS errors
4. Verify backend CORS configuration in `server.js`

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

## Quick Commands

```bash
# Backend
cd "incident tracking"
npm install          # Install dependencies
npm run dev          # Start development server
npm test             # Run tests
npm start            # Start production server

# Frontend
cd frontend
npm install          # Install dependencies
npm start            # Start development server
npm run build        # Build for production
npm test             # Run tests

# Database
mysql -u root -p incident_tracking < database/schema.sql
mysqldump -u root -p incident_tracking > backup.sql
```

## System Features

- User authentication with JWT tokens
- Role-based access control (Admin, Engineer, Viewer)
- Create and manage incidents
- Assign incidents to team members
- Track incident status and priority
- Add comments and resolution notes
- Automated email notifications
- Comprehensive audit logging
- User management dashboard
- Email delivery tracking
- SQL injection prevention
- Secure password hashing
- Rate limiting
- Input validation and sanitization

## Support

For issues:

1. Check logs in backend console
2. Check browser console (Frontend DevTools)
3. Review database audit logs
4. Check email logs for delivery issues
5. Verify environment variables are set correctly
