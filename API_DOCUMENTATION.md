# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints (except `/auth/login` and `/auth/register`) require JWT token in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Request body:
```json
{
  "username": "john_doe",
  "email": "john@company.com",
  "password": "SecurePassword123!",
  "role": "engineer"
}
```

Response (201):
```json
{
  "message": "User registered successfully",
  "userId": 1,
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Login
**POST** `/auth/login`

Request body:
```json
{
  "email": "john@company.com",
  "password": "SecurePassword123!"
}
```

Response (200):
```json
{
  "message": "Login successful",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@company.com",
    "role": "engineer"
  }
}
```

---

## Incident Endpoints

### Create Incident
**POST** `/incidents/create`

Request body:
```json
{
  "title": "Database server down",
  "description": "Production database server is not responding to connection requests",
  "incident_type_id": 5,
  "location_id": 4,
  "assigned_to": 2,
  "priority": "critical"
}
```

Response (201):
```json
{
  "message": "Incident created successfully",
  "incident": {
    "id": 1,
    "ticket_number": "TKT-1234567890-5678",
    "title": "Database server down",
    "status": "open",
    "created_at": "2026-03-05T10:30:00.000Z"
  }
}
```

### List Incidents
**GET** `/incidents/list`

Query parameters:
- `status`: Filter by status (open, in_progress, resolved, closed)
- `priority`: Filter by priority (low, medium, high, critical)
- `limit`: Number of results (default: 50)
- `offset`: Pagination offset (default: 0)

Response (200):
```json
{
  "incidents": [
    {
      "id": 1,
      "ticket_number": "TKT-1234567890-5678",
      "title": "Database server down",
      "description": "Production database server...",
      "incident_type": "Database",
      "location": "Server Room",
      "status": "open",
      "priority": "critical",
      "assigned_to_name": "jane_smith",
      "created_by_name": "john_doe",
      "created_at": "2026-03-05T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

### Get Incident Details
**GET** `/incidents/:incidentId`

Response (200):
```json
{
  "incident": {
    "id": 1,
    "ticket_number": "TKT-1234567890-5678",
    "title": "Database server down",
    "description": "Production database server is not responding...",
    "incident_type": "Database",
    "location": "Server Room",
    "status": "open",
    "priority": "critical",
    "resolution_notes": null,
    "assigned_to_name": "jane_smith",
    "created_by_name": "john_doe",
    "created_at": "2026-03-05T10:30:00.000Z"
  },
  "comments": [
    {
      "id": 1,
      "comment": "Investigation in progress",
      "username": "jane_smith",
      "created_at": "2026-03-05T11:00:00.000Z"
    }
  ]
}
```

### Assign Incident
**PUT** `/incidents/:incidentId/assign`

Request body:
```json
{
  "assigned_to": 2
}
```

Response (200):
```json
{
  "message": "Incident assigned successfully",
  "incident": {
    "id": 1,
    "ticket_number": "TKT-1234567890-5678",
    "assigned_to_name": "jane_smith"
  }
}
```

### Update Incident Status
**PUT** `/incidents/:incidentId/status`

Request body:
```json
{
  "status": "in_progress"
}
```

Valid status values: `open`, `in_progress`, `resolved`, `closed`

Response (200):
```json
{
  "message": "Status updated successfully",
  "incident": {
    "id": 1,
    "status": "in_progress"
  }
}
```

### Close Incident
**PUT** `/incidents/:incidentId/close`

Request body:
```json
{
  "resolution_notes": "Database server restarted successfully. All systems operational."
}
```

Response (200):
```json
{
  "message": "Incident closed successfully",
  "incident": {
    "id": 1,
    "ticket_number": "TKT-1234567890-5678",
    "status": "closed",
    "resolution_notes": "Database server restarted successfully...",
    "closed_at": "2026-03-05T14:30:00.000Z"
  }
}
```

### Add Comment
**POST** `/incidents/:incidentId/comment`

Request body:
```json
{
  "comment": "Waiting for network team to check switch configuration"
}
```

Response (201):
```json
{
  "message": "Comment added successfully",
  "comment_id": 5
}
```

---

## User Management Endpoints (Admin Only)

### List All Users
**GET** `/users/list`

Response (200):
```json
{
  "users": [
    {
      "id": 1,
      "username": "john_doe",
      "email": "john@company.com",
      "role": "engineer",
      "is_active": true,
      "created_at": "2026-03-01T08:00:00.000Z"
    }
  ]
}
```

### Get User Details
**GET** `/users/:userId`

Response (200):
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@company.com",
    "role": "engineer",
    "is_active": true,
    "created_at": "2026-03-01T08:00:00.000Z"
  }
}
```

### Update User Role
**PUT** `/users/:userId/role`

Request body:
```json
{
  "role": "admin"
}
```

Valid roles: `admin`, `engineer`, `viewer`

Response (200):
```json
{
  "message": "User role updated successfully"
}
```

### Deactivate User
**PUT** `/users/:userId/deactivate`

Response (200):
```json
{
  "message": "User deactivated successfully"
}
```

---

## Incident Type Endpoints (Admin Only)

### List Incident Types
**GET** `/types`

Response (200):
```json
{
  "types": [
    {
      "id": 1,
      "type_name": "Software",
      "description": "Software application or system issues",
      "is_active": true
    }
  ]
}
```

### Create Incident Type
**POST** `/types/create`

Request body:
```json
{
  "type_name": "Virtualization",
  "description": "Virtual machine and hypervisor issues"
}
```

Response (201):
```json
{
  "message": "Incident type created",
  "type_id": 9
}
```

---

## Location Endpoints (Admin Only)

### List Locations
**GET** `/locations`

Response (200):
```json
{
  "locations": [
    {
      "id": 1,
      "location_name": "Office Main",
      "building": "Building A",
      "floor": 1,
      "is_active": true
    }
  ]
}
```

### Create Location
**POST** `/locations/create`

Request body:
```json
{
  "location_name": "Branch Office",
  "building": "Building C",
  "floor": 1
}
```

Response (201):
```json
{
  "message": "Location created",
  "location_id": 6
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "errors": [
    {
      "msg": "Invalid email format",
      "param": "email"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "message": "Invalid email or password"
}
```

### 403 Forbidden
```json
{
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "message": "Incident not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error"
}
```

---

## Rate Limiting

- Authentication endpoints: 5 requests per 15 minutes per IP
- All other endpoints: 100 requests per 15 minutes per IP

---

## User Roles

### Admin
- Full access to all endpoints
- Can create/edit/delete users
- Can manage incident types and locations
- Can view audit logs

### Engineer
- Can create incidents
- Can view/update incidents assigned to them
- Can view incidents they created
- Can add comments

### Viewer
- Read-only access
- Can view incidents assigned to them
- Can view incidents they created
- Cannot modify incidents
