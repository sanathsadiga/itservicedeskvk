# System Features Overview

## Frontend Pages

### 1. Authentication Pages

#### Login Page
- Email and password input fields
- Form validation
- Error messaging
- Link to register page
- Secure token storage

#### Register Page
- Username, email, password fields
- Password confirmation validation
- Minimum length requirements
- Email format validation
- Automatic admin/engineer role assignment

### 2. Dashboard Page
- List all incidents with filters
- Status filter (Open, In Progress, Resolved, Closed)
- Priority filter (Low, Medium, High, Critical)
- Sortable table with columns:
  - Ticket number
  - Title
  - Incident type
  - Current status (with color badges)
  - Priority (with color badges)
  - Assigned to
  - Location
  - Created date
  - View button
- Pagination support
- Create new incident button
- Welcome message with current user

### 3. Create Incident Page
- Title field (min 5 characters)
- Detailed description (min 10 characters)
- Dropdown for incident type selection
- Dropdown for location selection
- Priority selection (Low, Medium, High, Critical)
- Optional assignment to team member
- Form validation
- Cancel and Submit buttons
- Success/error notifications

### 4. Incident Detail Page
- Full incident information display
- Metadata section showing:
  - Type
  - Location
  - Created by
  - Assigned to
  - Creation date
  - Closure date (if closed)
- Status and priority badges
- Full description text
- Resolution notes (if available)
- Comments section with list of all comments
- Add comment form
- Sidebar actions:
  - Assign to user (if not closed)
  - Update status dropdown
  - Close incident with notes
- Role-based action visibility
- Access control (creator, assigned, admin only)

### 5. User Management Page (Admin Only)
- List all system users
- User table with:
  - Username
  - Email
  - Current role
  - Active/Inactive status
  - Account creation date
  - Action buttons
- Change user role dropdown
- Deactivate user button
- Admin-only access

### 6. Navigation Bar
- Application logo/title
- Dashboard link
- Users link (admin only)
- Current user display
- User role badge
- Logout button
- Sticky positioning

## Backend Features

### Authentication API
- User registration with role assignment
- Secure login with JWT tokens
- Password hashing with bcryptjs
- Token-based authorization
- Rate limiting on auth endpoints

### Incident Management API
- Create new incidents
- List incidents with filters and pagination
- Get incident details
- Assign incident to team members
- Update incident status
- Close incident with resolution notes
- Add comments to incidents
- Email notifications on all actions

### User Management API (Admin)
- List all users
- Get individual user details
- Update user roles
- Deactivate user accounts

### Incident Type Management (Admin)
- List all incident types
- Create new incident types

### Location Management (Admin)
- List all locations
- Create new locations

## Security Features

### Frontend
- Protected routes requiring authentication
- Token stored in localStorage
- Automatic token validation
- Role-based UI element visibility
- Input sanitization
- HTTPS ready (production)

### Backend
- JWT token authentication
- Password hashing with bcryptjs (10 rounds)
- SQL injection prevention with prepared statements
- Input validation with express-validator
- CORS protection with configurable origins
- Helmet.js for HTTP headers security
- Rate limiting on authentication endpoints
- Role-based access control
- Audit logging for all actions

### Database
- MySQL with utf8mb4 encoding
- Foreign key constraints
- Indexes on frequently queried fields
- Secure password storage
- Referential integrity

## Email Features

### Automated Notifications
- Incident creation email
- Assignment notification email
- Closure confirmation email
- Status update notifications
- Multiple recipient support

### Email Logging
- All email attempts logged
- Success/failure tracking
- Error message logging
- Email delivery history
- Retry capability

### Supported SMTP Providers
- Gmail (with app password)
- Office 365
- Custom SMTP servers
- Secure TLS/SSL connections

## Data Tracking

### Audit Logs
- User action tracking
- Incident creation and modification
- User assignment changes
- Status updates
- Comment additions
- User role changes
- IP address logging
- Timestamp for all actions
- Old and new values comparison

### Email Logs
- Email delivery tracking
- Recipient addresses
- Email type (creation, closure, etc.)
- Subject line
- Success/failure status
- Error messages
- Timestamp

## Database Schema

### Users Table
- User account information
- Role assignment (admin, engineer, viewer)
- Active/inactive status
- Audit timestamps

### Incidents Table
- Complete incident information
- Type and location references
- Status tracking
- Priority levels
- Assignment tracking
- Resolution notes
- Created/updated timestamps

### Incident Types Table
- Predefined types (Software, Hardware, Network, etc.)
- Type descriptions
- Active/inactive status

### Locations Table
- Building and floor information
- Active status
- Location descriptions

### Comments Table
- Incident comments
- Comment author tracking
- Timestamp

### Email Logs Table
- Email delivery tracking
- Recipient and type logging
- Status and error handling

### Audit Logs Table
- Comprehensive action logging
- User tracking
- Change tracking (old vs new)
- IP address logging

## UI/UX Features

### Design
- Clean, professional interface
- Consistent color scheme
- Responsive design (desktop, tablet, mobile)
- Intuitive navigation
- Clear visual hierarchy

### Color Coding
- Status badges with distinct colors
- Priority levels visually differentiated
- Consistent button colors
- Color-coded roles and states

### Form Features
- Real-time validation
- Clear error messages
- Success notifications
- Disabled states for pending actions
- Helpful placeholders

### Table Features
- Sortable columns
- Filterable data
- Pagination support
- Hover effects
- Action buttons
- Status indicators

### Notifications
- Toast notifications
- Error handling
- Success confirmations
- Loading states
- Empty state messages

## Performance Features

### Frontend
- React for fast UI rendering
- Zustand for lightweight state management
- Axios for efficient API calls
- CSS-in-JS for optimized styling
- Component lazy loading ready

### Backend
- Connection pooling for database
- Prepared statements to prevent SQL injection
- Rate limiting to prevent abuse
- Compression ready
- Async/await for non-blocking operations

### Database
- Indexed queries for fast lookups
- Foreign key constraints
- Optimized table structure
- Connection pool management

## Role-Based Features

### Admin
- Full access to all features
- User management page
- Create incident types
- Create locations
- View all incidents
- Assign any incident
- Update any incident status

### Engineer
- Create incidents
- View own incidents (created or assigned)
- Assign incidents they created
- Update status on assigned incidents
- Close incidents
- Add comments

### Viewer
- View incidents (created or assigned)
- Read-only access
- View incident details
- Add comments
- Cannot create or modify incidents
