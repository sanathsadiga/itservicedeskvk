# Admin Dashboard Features

## Overview

The Admin Dashboard is a comprehensive management interface exclusive to users with the `admin` role. It provides system-wide visibility and control over incidents, users, and system health.

## Access

- **URL**: `/admin`
- **Navigation**: Admin users will see an "Admin" button in the navbar
- **Restricted**: Only users with role = `admin` can access this page

## Features

### 1. Overview Tab

#### Statistics Cards
- **Total Incidents**: Count of all incidents in the system
- **Open Incidents**: Number of incidents with status = "open"
- **Closed Incidents**: Number of incidents with status = "closed"
- **Critical Priority**: Count of incidents with priority = "critical"
- **Total Users**: Count of all registered users
- **Active Users**: Count of users with is_active = 1

#### Status Distribution Chart
- Visual breakdown of incidents by status (open, in_progress, closed)
- Shows percentage and count for each status
- Color-coded bar chart

#### Priority Distribution Chart
- Breakdown of incidents by priority level (low, medium, high, critical)
- Displays count for each priority

### 2. All Incidents Tab

#### Features
- **View All Incidents**: Lists every incident in the system (not filtered by user)
- **Real-time Status Updates**: Change incident status directly from the table
- **Quick Assignment**: Assign incidents to any user with a dropdown
- **Filtering**:
  - Filter by Status (all, open, in_progress, closed)
  - Filter by Priority (all, low, medium, high, critical)

#### Columns
- Ticket Number (unique identifier)
- Title
- Status (editable dropdown)
- Priority (color-coded badge)
- Type (incident type)
- Created By (username)
- Assigned To (editable dropdown)
- Action button to view full details

### 3. Users Tab

#### Features
- **View All Users**: List of all registered users with details
- **User Information**:
  - Username
  - Email
  - Role (admin, engineer, viewer)
  - Status (active/inactive)
  - Created Date

#### Columns
- Username
- Email
- Role (color-coded badge)
- Status (active/inactive badge)
- Created At
- Edit button (for future enhancements)

### 4. Incident Details Modal

When viewing an incident from the All Incidents tab:

#### Incident Metadata
- Ticket Number
- Title
- Status (editable)
- Priority
- Type
- Location
- Created By
- Assigned To (editable)
- Full Description

#### Comments Section
- **Add Comments**: Admins can add comments to any ticket
- **Email Notifications**: When an admin comments on a ticket:
  - The ticket creator receives an email notification
  - The assigned person (if any) receives an email notification
  - Email includes the comment text and ticket details
- **Comment Management**: View all comments on the ticket

## Email Notifications

### When Admin Comments on a Ticket
- **Recipients**: 
  - Ticket creator (if not the commenter)
  - Assigned person (if any and not the commenter)
- **Subject**: `[COMMENT ADDED] Ticket {NUMBER}: {TITLE}`
- **Content**: 
  - Ticket details
  - Commenter name
  - Full comment text
  - Link to view details

## UI/UX Details

### Color Scheme
- **Blue (#2196F3)**: Primary actions, open status
- **Orange (#FF9800)**: In-progress status
- **Green (#4CAF50)**: Closed status, active users
- **Purple (#9C27B0)**: Critical priority
- **Red (#F44336)**: Admin role

### Responsive Design
- Grid layout that adapts to different screen sizes
- Mobile-friendly table views with adjusted column widths
- Modal dialogs work on all screen sizes

## Performance Notes

- Dashboard loads all incidents in one query (limit: 1000)
- Stats are calculated client-side for instant updates
- Filtering happens in browser for zero-latency responses
- Status and assignment changes are instant with database updates

## Security

- Admin-only access (enforced by ProtectedRoute + role check)
- All data operations go through authenticated API endpoints
- Comment emails are only sent to relevant parties (creator and assignee)
