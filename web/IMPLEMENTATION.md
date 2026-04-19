# Coal Mine Safety System - Complete Implementation

This is a comprehensive Next.js application for managing coal mine safety, incidents, and personnel tracking with role-based access control (RBAC).

## 🎯 Key Features

### 1. **Authentication & Authorization**

- **Login Page** (`/login`) - Secure authentication with demo mode access
- **Registration Page** (`/register`) - User account creation with role request workflow
- **Role-Based Access Control (RBAC)** - 5 user roles with distinct permissions
  - **Worker** - Basic worker portal with incident reporting and task management
  - **Supervisor** - Team management and task assignment
  - **Safety Officer** - Safety monitoring and incident verification
  - **Administrator** - System administration and user management
  - **Authority** - Full system oversight and global control

### 2. **Dashboard Pages** (Role-Specific)

#### Worker Dashboard (`/dashboard/worker`)

- Real-time critical alerts
- Quick action cards (Report Incident, Check-in/out, View Tasks, Alerts)
- Current status and attendance display
- Daily tasks list with priority indicators
- Recent alerts feed

#### Supervisor Dashboard (`/dashboard/supervisor`)

- Team overview with member status
- Team incident list with severity indicators
- Task management Kanban board (Pending/In Progress/Completed)
- Quick statistics (team size, active tasks, incidents, attendance)
- Team member performance monitoring

#### Safety Officer Dashboard (`/dashboard/safety`)

- Real-time monitoring gauges (Gas Level, Temperature, Hazard Level)
- Temperature trend visualization
- Zone status indicators (4 zones with color coding)
- Sensor readings and data
- Incident review queue with status tracking

#### Administrator Dashboard (`/dashboard/admin`)

- User management interface with create/edit functionality
- Role-based access control configuration
- Security settings (MFA, Session timeout, Audit export)
- System logs viewer
- System health monitoring

#### Authority Dashboard (`/dashboard/authority`)

- Central command center for all mines
- Global statistics (mines online, critical alerts, investigations)
- Productivity and incident trend charts
- Compliance tracking (91% compliance)
- Zone risk assessment heatmap
- Global alerts panel
- Mine operations table with detailed controls
- Global override panel for system-wide decisions

### 3. **Core Features**

#### Incident Management

- **Report Incident** (`/incidents/report`) - Form to report safety incidents
- **Incidents List** (`/incidents`) - Complete incident tracking with filters
- **Incident Details** (`/incidents/[id]`) - Full incident timeline and details
- **Incident Review** (`/incidents/review`) - Safety officer verification workflow

#### Task Management

- **Tasks Page** (`/tasks`) - Task list with status filtering
- **Task Cards** - Priority indicators, assignees, and due dates
- **Kanban Board** - Visual task management

#### Monitoring & Alerts

- **Alerts Page** (`/alerts`) - Real-time system alerts and notifications
- **Monitoring Page** (`/monitoring`) - Real-time safety sensor data
- **Safety Gauges** - Gas level, temperature, humidity, vibration monitoring
- **Hazard Indicators** - Zone-specific risk assessment

#### Attendance Tracking

- **Attendance Page** (`/attendance`) - Check-in/out management
- **Daily attendance table** with status indicators
- **Attendance rate calculations**
- **Duration tracking** per shift

#### Reporting & Analytics

- **Reports Page** (`/reports`) - Comprehensive reporting system
- **Analytics Dashboard** (`/analytics`) - Advanced data analysis and trends
- **KPI Cards** - Key performance indicators
- **Trend Charts** - Incident and productivity trends
- **Incident Breakdown** - Severity distribution and risk analysis

#### System Administration

- **Users Page** (`/users`) - User management with role assignment
- **Team Page** (`/team`) - Team member management
- **Roles Page** (`/roles`) - Role definition and permission matrix
- **Logs Page** (`/logs`) - Audit trail and activity logs
- **Settings Page** (`/settings`) - Account and system preferences

## 📁 Project Structure

```
app/
├── page.tsx                          # Landing page with demo access
├── layout.tsx                        # Root layout
├── globals.css                       # Global styles
│
├── login/
│   └── page.tsx                      # Login page with demo accounts
│
├── register/
│   └── page.tsx                      # Registration/account creation
│
├── dashboard/
│   ├── worker/page.tsx              # Worker dashboard
│   ├── supervisor/page.tsx          # Supervisor dashboard
│   ├── safety/page.tsx              # Safety officer dashboard
│   ├── admin/page.tsx               # Admin dashboard
│   └── authority/page.tsx           # Authority/Mine ops dashboard
│
├── incidents/
│   ├── page.tsx                      # Incidents list
│   ├── report/page.tsx              # Report incident form
│   ├── review/page.tsx              # Incident review/verification
│   └── [id]/page.tsx                # Incident detail view
│
├── tasks/
│   └── page.tsx                      # Tasks management
│
├── alerts/
│   └── page.tsx                      # Alerts and notifications
│
├── attendance/
│   └── page.tsx                      # Attendance tracking
│
├── reports/
│   └── page.tsx                      # Reports and analytics
│
├── monitoring/
│   └── page.tsx                      # Real-time monitoring
│
├── analytics/
│   └── page.tsx                      # Analytics dashboard
│
├── users/
│   └── page.tsx                      # User management
│
├── team/
│   └── page.tsx                      # Team management
│
├── roles/
│   └── page.tsx                      # Role management
│
├── logs/
│   └── page.tsx                      # System logs
│
└── settings/
    └── page.tsx                      # User settings
```

## 🎨 Components

### Layout Components

- **DashboardLayout** - Wraps all dashboard pages with sidebar and navbar
- **Sidebar** - Role-aware navigation menu
- **Navbar** - Dashboard header with user info and notifications

## 🔐 Security Features

### RBAC Implementation

- **Role Hierarchy**: Worker → Supervisor → Safety Officer → Administrator → Authority
- **Permission Matrix**: Granular control over each feature per role
- **No Privilege Escalation**: Users cannot elevate their role from UI
- **Backend-Authorized**: All role assignments determined by backend policy

### Security Indicators

- Two-Factor Authentication (configurable)
- Session timeout (15 minutes)
- Daily audit exports
- MFA enforcement
- Activity logging

## 🎬 Demo Mode

Access demo accounts directly from the login page:

- **Worker** - worker@coalmine.com
- **Supervisor** - supervisor@coalmine.com
- **Safety Officer** - safety@coalmine.com
- **Administrator** - admin@coalmine.com
- **Authority** - authority@coalmine.com

All demo accounts use the same password for easy access.

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

### Build

```bash
npm run build
npm start
```

## 📊 Data Features

### Real-Time Monitoring

- Gas level sensors (methane detection)
- Temperature monitoring
- Humidity levels
- Vibration sensors
- Hazard indicators with color coding (Green/Yellow/Red)

### Incident Tracking

- Severity levels: Critical, High, Medium, Low
- Status tracking: Pending, Assigned, Escalated, Resolved
- Complete timeline of actions
- Reporter and assignment tracking
- Zone-specific incident management

### Analytics

- Incident trends over time
- Productivity index tracking
- Safety compliance monitoring
- Zone risk assessment
- Performance KPIs

## 🎯 Use Cases

### Worker

1. Report a safety incident
2. Check in/out at start/end of shift
3. View assigned tasks
4. Monitor alerts and notifications
5. Update task status

### Supervisor

1. Manage team members
2. Assign and monitor tasks
3. Review team incidents
4. Monitor attendance
5. Track hazards in assigned zones

### Safety Officer

1. Monitor real-time sensor data
2. Review and verify reported incidents
3. Assess hazard levels
4. Approve or reject incident reports
5. Generate safety reports

### Administrator

1. Manage user accounts
2. Assign roles and permissions
3. View audit logs
4. Configure system settings
5. Manage MFA and security

### Authority

1. Full system visibility across all mines
2. Override any system decision
3. View predictive analytics
4. Generate comprehensive reports
5. Global alert management

## 🔧 Technology Stack

- **Framework**: Next.js 16.2.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Styling**: Lucide React (icons)
- **Authentication**: Custom RBAC
- **State Management**: React hooks

## 📝 Notes

- All demo data is simulated and stored in component state
- No backend API integration yet (ready for API implementation)
- Role switching is demo-only via URL parameters
- Responsive design for desktop and tablet
- Dark theme aligned with mining safety industry standards

## 🔄 Navigation Pattern

Navigate between roles using the `?role=` query parameter:

- `/dashboard/worker?role=worker`
- `/dashboard/supervisor?role=supervisor`
- `/dashboard/safety?role=safety`
- `/dashboard/admin?role=admin`
- `/dashboard/authority?role=authority`

All pages automatically adjust their content based on the current role.

## 📦 Future Enhancements

- Backend API integration
- Real sensor data integration
- Real-time WebSocket updates
- Database implementation
- Export to PDF/CSV
- Email notifications
- Mobile app (React Native)
- Advanced geolocation tracking
- Predictive analytics with ML
