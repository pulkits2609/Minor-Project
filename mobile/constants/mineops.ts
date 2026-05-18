import type { ComponentProps } from 'react';
import type MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type MineOpsRoleKey = 'worker' | 'supervisor' | 'safety' | 'admin' | 'authority';

export type MineOpsTone = 'danger' | 'warning' | 'success' | 'neutral';
export type MineOpsIconName = ComponentProps<typeof MaterialIcons>['name'];

export type MineOpsRoleProfile = {
  key: MineOpsRoleKey;
  label: string;
  icon: MineOpsIconName;
  summary: string;
  highlight: string;
  actions: string[];
};

export type MineOpsMetric = {
  label: string;
  value: string;
  detail: string;
  tone: MineOpsTone;
  icon: MineOpsIconName;
};

export type MineOpsAlert = {
  title: string;
  detail: string;
  tone: MineOpsTone;
  icon: MineOpsIconName;
};

export type MineOpsAction = {
  key: string;
  title: string;
  detail: string;
  icon: MineOpsIconName;
};

export type MineOpsModule = {
  key: string;
  title: string;
  detail: string;
  icon: MineOpsIconName;
  actions: string[];
};

export const roleProfiles: MineOpsRoleProfile[] = [
  {
    key: 'worker',
    label: 'Worker',
    icon: 'engineering',
    summary: 'Report incidents, track attendance, and stay aligned with active tasks.',
    highlight: 'Frontline visibility',
    actions: ['Report incident', 'Check attendance', 'Open tasks'],
  },
  {
    key: 'supervisor',
    label: 'Supervisor',
    icon: 'groups',
    summary: 'Assign work, review crew status, and handle escalations in real time.',
    highlight: 'Crew coordination',
    actions: ['Assign tasks', 'Review team', 'Escalate incidents'],
  },
  {
    key: 'safety',
    label: 'Safety Officer',
    icon: 'security',
    summary: 'Monitor hazards, inspect live alerts, and clear unsafe conditions.',
    highlight: 'Hazard response',
    actions: ['Review alerts', 'Clear hazard', 'Audit incident'],
  },
  {
    key: 'admin',
    label: 'Administrator',
    icon: 'admin-panel-settings',
    summary: 'Manage users, roles, logs, and system settings from one control point.',
    highlight: 'System control',
    actions: ['Manage users', 'Set roles', 'Review logs'],
  },
  {
    key: 'authority',
    label: 'Authority',
    icon: 'account-balance',
    summary: 'Inspect compliance, review analytics, and make cross-site decisions.',
    highlight: 'Strategic oversight',
    actions: ['Inspect compliance', 'View analytics', 'Issue directives'],
  },
];

export const homeMetrics: MineOpsMetric[] = [
  {
    label: 'Critical alerts',
    value: '04',
    detail: '2 require immediate action',
    tone: 'danger',
    icon: 'warning',
  },
  {
    label: 'Active crews',
    value: '12',
    detail: '92% attendance coverage',
    tone: 'success',
    icon: 'groups',
  },
  {
    label: 'Open tasks',
    value: '18',
    detail: '6 are high priority',
    tone: 'warning',
    icon: 'task-alt',
  },
  {
    label: 'Compliance',
    value: '91%',
    detail: 'Audit-ready this shift',
    tone: 'neutral',
    icon: 'check-circle',
  },
];

export const quickActions: MineOpsAction[] = [
  {
    key: 'incidents',
    title: 'Report incident',
    detail: 'Capture severity, location, and witnesses.',
    icon: 'report',
  },
  {
    key: 'attendance',
    title: 'Check attendance',
    detail: 'Review current shift coverage and check-ins.',
    icon: 'schedule',
  },
  {
    key: 'monitoring',
    title: 'Live monitoring',
    detail: 'Open sensors, hazards, and live readings.',
    icon: 'insights',
  },
  {
    key: 'tasks',
    title: 'Open tasks',
    detail: 'See assignments waiting for execution.',
    icon: 'assignment',
  },
];

export const liveAlerts: MineOpsAlert[] = [
  {
    title: 'Methane spike in Shaft B',
    detail: 'Critical alert • 4 min ago',
    tone: 'danger',
    icon: 'warning',
  },
  {
    title: 'Two workers missed check-in',
    detail: 'Attendance review • 12 min ago',
    tone: 'warning',
    icon: 'groups',
  },
  {
    title: 'Sensor calibration due at Zone 4',
    detail: 'Maintenance notice • 1 hr ago',
    tone: 'neutral',
    icon: 'settings',
  },
  {
    title: 'Compliance report exported',
    detail: 'Authority feed • 2 hr ago',
    tone: 'success',
    icon: 'description',
  },
];

export const hubModules: MineOpsModule[] = [
  {
    key: 'dashboard',
    title: 'Dashboard',
    detail: 'Role-specific KPI cards and live shift summaries.',
    icon: 'dashboard',
    actions: ['Review live KPIs', 'Open alert feed', 'Check shift summary'],
  },
  {
    key: 'alerts',
    title: 'Alerts',
    detail: 'Live hazard notices and operational notifications.',
    icon: 'notifications',
    actions: ['Filter severity', 'Acknowledge criticals', 'Escalate issues'],
  },
  {
    key: 'analytics',
    title: 'Analytics',
    detail: 'Trend views for productivity, safety, and compliance.',
    icon: 'bar-chart',
    actions: ['Compare trends', 'Export report', 'Inspect compliance'],
  },
  {
    key: 'attendance',
    title: 'Attendance',
    detail: 'Shift check-in tracking and coverage visibility.',
    icon: 'schedule',
    actions: ['Check-in status', 'Review coverage', 'Approve exceptions'],
  },
  {
    key: 'incidents',
    title: 'Incidents',
    detail: 'Submit reports, follow timelines, and close the loop.',
    icon: 'report',
    actions: ['Submit report', 'Review timeline', 'Assign ownership'],
  },
  {
    key: 'monitoring',
    title: 'Monitoring',
    detail: 'Live sensor readings, hazard maps, and thresholds.',
    icon: 'insights',
    actions: ['Inspect sensor data', 'Open hazard map', 'Calibrate devices'],
  },
  {
    key: 'reports',
    title: 'Reports',
    detail: 'Exportable summaries for management and authority review.',
    icon: 'description',
    actions: ['Generate summary', 'Export PDF', 'Share with authority'],
  },
  {
    key: 'roles',
    title: 'Roles',
    detail: 'Role hierarchy and permission control for the platform.',
    icon: 'security',
    actions: ['Review permissions', 'Assign role', 'Audit changes'],
  },
  {
    key: 'settings',
    title: 'Settings',
    detail: 'Preferences, security controls, and session settings.',
    icon: 'settings',
    actions: ['Update preferences', 'Control security', 'Manage sessions'],
  },
  {
    key: 'tasks',
    title: 'Tasks',
    detail: 'Priority assignments and work-in-progress tracking.',
    icon: 'task-alt',
    actions: ['Open backlog', 'Prioritize work', 'Mark complete'],
  },
  {
    key: 'team',
    title: 'Team',
    detail: 'Crew overview, assignments, and availability updates.',
    icon: 'groups',
    actions: ['Review crew', 'Assign shifts', 'Check availability'],
  },
  {
    key: 'users',
    title: 'Users',
    detail: 'User access, invitations, and activity records.',
    icon: 'person',
    actions: ['Invite user', 'Edit access', 'Review activity'],
  },
  {
    key: 'logs',
    title: 'Logs',
    detail: 'Audit trail and system events for review and export.',
    icon: 'history',
    actions: ['Review audit trail', 'Filter entries', 'Export logs'],
  },
];
