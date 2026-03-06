# Quick Start Guide

## Initial Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your settings:
- Update MySQL credentials
- Set a strong JWT_SECRET
- Configure SMTP for email (Gmail, Office 365, etc.)

### 3. Setup MySQL Database

If using MySQL locally:
```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE incident_tracking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Exit MySQL
exit
```

Then import the schema:
```bash
mysql -u root -p incident_tracking < database/schema.sql
mysql -u root -p incident_tracking < database/seed.sql
```

### 4. Start the Server
```bash
npm run dev
```

Server runs on `http://localhost:5000`

### 5. Create Your First Admin User

Using curl:
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

Copy the returned token for authenticated requests.

---

## Common Workflows

### Create and Assign an Incident

1. **Login and get token**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@company.com",
       "password": "AdminPassword123!"
     }'
   ```

2. **Get incident types and locations**
   ```bash
   curl http://localhost:5000/api/types \
     -H "Authorization: Bearer YOUR_TOKEN"

   curl http://localhost:5000/api/locations \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

3. **Create incident**
   ```bash
   curl -X POST http://localhost:5000/api/incidents/create \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "title": "Printer not responding",
       "description": "Office printer on Floor 2 is not responding to print jobs",
       "incident_type_id": 2,
       "location_id": 2,
       "assigned_to": 2,
       "priority": "high"
     }'
   ```

4. **View incident**
   ```bash
   curl http://localhost:5000/api/incidents/1 \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

5. **Update status**
   ```bash
   curl -X PUT http://localhost:5000/api/incidents/1/status \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "status": "in_progress"
     }'
   ```

6. **Close incident with notes**
   ```bash
   curl -X PUT http://localhost:5000/api/incidents/1/close \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "resolution_notes": "Printer driver updated. Issue resolved."
     }'
   ```

---

## Email Configuration

### Gmail SMTP Setup

1. Enable 2-Step Verification in your Google Account
2. Generate App Password:
   - Go to Google Account settings
   - Security
   - App passwords
   - Select Mail and Windows Computer
   - Copy the generated password

3. Update `.env`:
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=<app_password>
   SMTP_FROM=incident-system@yourcompany.com
   ```

### Office 365 SMTP Setup

```
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your_email@company.com
SMTP_PASSWORD=<your_password>
SMTP_FROM=incident-system@company.com
```

---

## Database Backup

### Export Database
```bash
mysqldump -u root -p incident_tracking > backup.sql
```

### Restore Database
```bash
mysql -u root -p incident_tracking < backup.sql
```

---

## Monitoring

### Check Audit Logs
Query the database directly:
```sql
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 20;
```

### Monitor Email Delivery
```sql
SELECT * FROM email_logs ORDER BY sent_at DESC LIMIT 20;
```

### View Error Logs
Email failures are logged:
```sql
SELECT * FROM email_logs WHERE status = 'failed';
```

---

## Troubleshooting

### Port 5000 Already in Use
```bash
# Change PORT in .env
PORT=5001

# Or kill the process using port 5000
lsof -ti:5000 | xargs kill -9
```

### MySQL Connection Failed
- Verify MySQL is running: `mysql -u root -p`
- Check credentials in `.env`
- Verify database exists: `SHOW DATABASES;`

### Emails Not Sending
- Check `email_logs` table for failures
- Verify SMTP credentials
- Allow less secure apps (Gmail)
- Check firewall/network rules

### Invalid Token Errors
- Ensure token is included in Authorization header
- Token format: `Bearer <token>`
- Tokens expire after 24 hours, login again

---

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use strong JWT_SECRET (minimum 32 characters)
3. Configure HTTPS/SSL
4. Use environment-specific database
5. Set up log aggregation
6. Enable database backups
7. Configure monitoring/alerting
8. Review and implement security headers
9. Set up rate limiting appropriately
10. Use reverse proxy (nginx)

---

## Testing

Run tests:
```bash
npm test
```

---

## Support

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
