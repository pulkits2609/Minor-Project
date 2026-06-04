import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useLocalSearchParams } from 'expo-router';
import { type ComponentProps } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { roleProfiles, type MineOpsTone } from '@/constants/mineops';
import { useColorScheme } from '@/hooks/use-color-scheme';

type IconName = ComponentProps<typeof MaterialIcons>['name'];
type Palette = typeof Colors.dark;
type WorkflowKey = 'incidents' | 'attendance' | 'monitoring' | 'tasks' | 'alerts';

type WorkflowStat = {
  label: string;
  value: string;
  detail: string;
  tone: MineOpsTone;
  icon: IconName;
};

type WorkflowStep = {
  title: string;
  detail: string;
};

type WorkflowTemplate = {
  title: string;
  summary: string;
  icon: IconName;
  tone: MineOpsTone;
  helper: string;
  primaryLabel: string;
};

type WorkflowConfig = {
  title: string;
  summary: string;
  icon: IconName;
  tone: MineOpsTone;
  helper: string;
  primaryLabel: string;
  stats: WorkflowStat[];
  steps: WorkflowStep[];
  notes: string[];
};

const WORKFLOW_CONFIGS: Record<WorkflowKey, WorkflowConfig> = {
  incidents: {
    title: 'Report Incident',
    summary: 'Capture a hazard or near miss and route it to the right team without leaving the field flow.',
    icon: 'report-problem',
    tone: 'danger',
    helper: 'Fast reporting for hazards, injuries, and equipment faults.',
    primaryLabel: 'Open incident form',
    stats: [
      { label: 'Priority', value: 'High', detail: 'Escalate immediately', tone: 'danger', icon: 'warning' },
      { label: 'Evidence', value: 'Ready', detail: 'Photo and witness capture', tone: 'neutral', icon: 'photo-camera' },
      { label: 'Routing', value: 'Live', detail: 'Supervisor + safety review', tone: 'success', icon: 'groups' },
    ],
    steps: [
      { title: 'Select the zone', detail: 'Start with the location, severity, and incident type.' },
      { title: 'Describe the event', detail: 'Add a short report and attach any supporting evidence.' },
      { title: 'Notify response', detail: 'Send the report to the people responsible for follow-up.' },
    ],
    notes: [
      'Use this for hazards, injuries, and near misses.',
      'Keep the description short and clear so it is easy to triage.',
    ],
  },
  attendance: {
    title: 'Check Attendance',
    summary: 'Review shift coverage, check-ins, and missed sign-ins before the next round starts.',
    icon: 'schedule',
    tone: 'warning',
    helper: 'Shift status and attendance controls.',
    primaryLabel: 'Open attendance board',
    stats: [
      { label: 'Present', value: '28', detail: 'Shift coverage active', tone: 'success', icon: 'check-circle' },
      { label: 'Late', value: '03', detail: 'Needs follow-up', tone: 'warning', icon: 'schedule' },
      { label: 'Absent', value: '01', detail: 'Unconfirmed on site', tone: 'danger', icon: 'person-off' },
    ],
    steps: [
      { title: 'Review the roster', detail: 'Check the current shift against the assigned crew list.' },
      { title: 'Open check-in data', detail: 'Inspect arrivals, departures, and late sign-ins.' },
      { title: 'Resolve gaps', detail: 'Follow up on missing or late entries before escalation.' },
    ],
    notes: [
      'Attendance controls are best used at the start and end of each shift.',
      'Use the dashboard list to verify coverage before assigning new work.',
    ],
  },
  monitoring: {
    title: 'Live Monitoring',
    summary: 'Watch gas, temperature, and zone status in one place and react to high-risk changes quickly.',
    icon: 'sensors',
    tone: 'danger',
    helper: 'Real-time gas, temperature, and hazard visibility.',
    primaryLabel: 'Open live monitoring',
    stats: [
      { label: 'Gas', value: '73 ppm', detail: 'Critical threshold reached', tone: 'danger', icon: 'warning' },
      { label: 'Temp', value: '47°C', detail: 'Rising trend detected', tone: 'warning', icon: 'thermostat' },
      { label: 'Zones', value: '04', detail: '1 active warning zone', tone: 'success', icon: 'place' },
    ],
    steps: [
      { title: 'Inspect live readings', detail: 'Check the current sensor values before taking action.' },
      { title: 'Review the zone map', detail: 'Look for hotspots and abnormal readings across the site.' },
      { title: 'Escalate as needed', detail: 'Notify the right team if a zone moves into a warning state.' },
    ],
    notes: [
      'Monitoring pages should stay open during active shift supervision.',
      'Use the latest readings to decide whether to pause or continue work.',
    ],
  },
  tasks: {
    title: 'Open Tasks',
    summary: 'See the backlog, find the most urgent work, and move the queue forward without losing context.',
    icon: 'assignment',
    tone: 'success',
    helper: 'Work queue, priorities, and assignment flow.',
    primaryLabel: 'Open task board',
    stats: [
      { label: 'Open', value: '18', detail: 'Ready for assignment', tone: 'warning', icon: 'assignment' },
      { label: 'Active', value: '07', detail: 'Currently in progress', tone: 'success', icon: 'trending-up' },
      { label: 'Done', value: '12', detail: 'Completed this shift', tone: 'neutral', icon: 'check-circle' },
    ],
    steps: [
      { title: 'Scan the backlog', detail: 'Sort tasks by priority, zone, and due date.' },
      { title: 'Open the next item', detail: 'Review the task description and ownership details.' },
      { title: 'Mark progress', detail: 'Update status once the task is underway or complete.' },
    ],
    notes: [
      'The task board is the fastest place to check what needs action next.',
      'Higher roles can use this flow to keep work moving across the team.',
    ],
  },
  alerts: {
    title: 'Alert Feed',
    summary: 'Review the latest safety, maintenance, and coordination notices in a single feed.',
    icon: 'notifications',
    tone: 'warning',
    helper: 'Safety, maintenance, and operational notifications.',
    primaryLabel: 'Open alert feed',
    stats: [
      { label: 'Critical', value: '04', detail: 'Needs immediate attention', tone: 'danger', icon: 'warning' },
      { label: 'Warnings', value: '08', detail: 'Review before escalation', tone: 'warning', icon: 'notifications-active' },
      { label: 'Info', value: '12', detail: 'Background updates only', tone: 'neutral', icon: 'info' },
    ],
    steps: [
      { title: 'Sort by severity', detail: 'Start with the most urgent messages first.' },
      { title: 'Acknowledge alerts', detail: 'Mark items as seen before handing them off.' },
      { title: 'Escalate important items', detail: 'Push critical updates to the right supervisor or safety officer.' },
    ],
    notes: [
      'Alerts help keep the dashboard calm while still surfacing urgent updates.',
      'Use the feed to stay aligned with site changes and safety notices.',
    ],
  },
};

const EXTRA_WORKFLOW_TEMPLATES: Record<string, WorkflowTemplate> = {
  team: {
    title: 'Team Overview',
    summary: 'Crew coverage, assignments, and shift coordination in one place.',
    icon: 'groups',
    tone: 'neutral',
    helper: 'Supervisor controls for crew visibility.',
    primaryLabel: 'Open team board',
  },
  users: {
    title: 'User Management',
    summary: 'Manage system users and permissions.',
    icon: 'person',
    tone: 'neutral',
    helper: 'Manage identities, access, and role assignments.',
    primaryLabel: 'Open user management',
  },
  roles: {
    title: 'Role Management',
    summary: 'Define and manage user roles and permissions.',
    icon: 'security',
    tone: 'warning',
    helper: 'Define access and approval boundaries.',
    primaryLabel: 'Open role management',
  },
  logs: {
    title: 'System Logs',
    summary: 'Audit trail and activity logs.',
    icon: 'history',
    tone: 'neutral',
    helper: 'Review the event trail and export history.',
    primaryLabel: 'Open system logs',
  },
  analytics: {
    title: 'Analytics Dashboard',
    summary: 'Trends across productivity, safety, and compliance for the authority role.',
    icon: 'bar-chart',
    tone: 'success',
    helper: 'Trend views and KPI snapshots.',
    primaryLabel: 'Open analytics',
  },
  reports: {
    title: 'Reports Center',
    summary: 'Generate and export operational summaries for management and authority review.',
    icon: 'description',
    tone: 'neutral',
    helper: 'Exports and structured summaries.',
    primaryLabel: 'Open reports',
  },
  'incident-review': {
    title: 'Incident Review',
    summary: 'Inspect open incidents and assign follow-up actions before closure.',
    icon: 'assignment',
    tone: 'danger',
    helper: 'Safety queue for incident triage.',
    primaryLabel: 'Open review queue',
  },
};

function buildGenericWorkflowConfig(template: WorkflowTemplate): WorkflowConfig {
  return {
    title: template.title,
    summary: template.summary,
    icon: template.icon,
    tone: template.tone,
    helper: template.helper,
    primaryLabel: template.primaryLabel,
    stats: [
      { label: 'Status', value: 'Live', detail: template.helper, tone: template.tone, icon: template.icon },
      { label: 'Scope', value: 'Mobile', detail: 'Role-specific workflow', tone: 'neutral', icon: 'dashboard' },
      { label: 'Next step', value: 'Ready', detail: template.primaryLabel, tone: 'success', icon: 'check-circle' },
    ],
    steps: [
      { title: 'Open the module', detail: `Review ${template.title.toLowerCase()} from the mobile menu.` },
      { title: 'Work the queue', detail: template.summary },
      { title: 'Finish the flow', detail: 'Complete the action and return to the dashboard.' },
    ],
    notes: [
      template.helper,
      'This module mirrors the web navigation in a compact mobile view.',
    ],
  };
}

function getWorkflowConfig(action?: string): WorkflowConfig {
  if (!action) {
    return WORKFLOW_CONFIGS.tasks;
  }

  if (action in WORKFLOW_CONFIGS) {
    return WORKFLOW_CONFIGS[action as WorkflowKey];
  }

  const extraTemplate = EXTRA_WORKFLOW_TEMPLATES[action];
  if (extraTemplate) {
    return buildGenericWorkflowConfig(extraTemplate);
  }

  return WORKFLOW_CONFIGS.tasks;
}

export default function WorkflowScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const palette = Colors[colorScheme];
  const params = useLocalSearchParams<{ action?: string; role?: string }>();
  const actionValue = Array.isArray(params.action) ? params.action[0] : params.action;
  const roleValue = Array.isArray(params.role) ? params.role[0] : params.role;
  const selectedRole = roleProfiles.find((role) => role.key === roleValue) ?? roleProfiles[0];
  const workflow = getWorkflowConfig(actionValue);
  const accent = toneColor(workflow.tone, palette);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView
        style={{ backgroundColor: palette.background }}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: palette.background }]}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.topRow, { borderBottomColor: palette.border }]}>
          <View>
            <ThemedText type="subtitle">MineOps</ThemedText>
            <ThemedText style={{ color: palette.muted, fontSize: 13, lineHeight: 18 }}>
              {selectedRole.label} workflow
            </ThemedText>
          </View>

          <Link href={{ pathname: '/dashboard/[role]', params: { role: selectedRole.key } }} asChild>
            <Pressable style={({ pressed }) => [styles.backButton, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }, pressed && styles.pressed]}>
              <MaterialIcons name="arrow-back" size={18} color={palette.text} />
            </Pressable>
          </Link>
        </View>

        <View style={[styles.heroCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
          <View style={[styles.heroAccent, { backgroundColor: accent }]} />
          <View style={styles.heroHeader}>
            <View style={[styles.heroIcon, { backgroundColor: palette.surfaceMuted, borderColor: palette.border }]}>
              <MaterialIcons name={workflow.icon} size={22} color={accent} />
            </View>
            <View style={styles.heroTextBlock}>
              <ThemedText type="title">{workflow.title}</ThemedText>
              <ThemedText style={{ color: palette.muted, fontSize: 15, lineHeight: 22, marginTop: 10 }}>
                {workflow.summary}
              </ThemedText>
            </View>
          </View>

          <View style={[styles.roleBadge, { borderColor: palette.border, backgroundColor: palette.surface }]}>
            <MaterialIcons name="verified-user" size={16} color={accent} />
            <ThemedText style={{ color: palette.text, fontSize: 12, fontWeight: '800' }}>
              {selectedRole.label} access
            </ThemedText>
          </View>

          <ThemedText style={{ color: palette.muted, fontSize: 13, lineHeight: 19 }}>
            {workflow.helper}
          </ThemedText>
        </View>

        <SectionHeader title="Quick summary" subtitle="A compact view of the current workflow." palette={palette} />
        <View style={styles.metricGrid}>
          {workflow.stats.map((stat) => (
            <View key={stat.label} style={[styles.metricCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
              <View style={styles.metricHeader}>
                <View style={[styles.metricIcon, { backgroundColor: palette.surfaceMuted }]}>
                  <MaterialIcons name={stat.icon} size={18} color={toneColor(stat.tone, palette)} />
                </View>
                <ThemedText style={{ color: palette.muted, fontSize: 12, fontWeight: '700' }}>{stat.label}</ThemedText>
              </View>
              <ThemedText type="title" style={styles.metricValue}>
                {stat.value}
              </ThemedText>
              <ThemedText style={{ color: palette.muted, fontSize: 13, lineHeight: 19 }}>{stat.detail}</ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.footerRow}>
          <Pressable
            onPress={() => Alert.alert(workflow.title, 'This workflow screen is now wired and ready for deeper actions.')}
            style={({ pressed }) => [styles.primaryButton, { backgroundColor: accent }, pressed && styles.pressed]}>
            <ThemedText lightColor="#111111" darkColor="#111111" style={styles.primaryButtonText}>
              {workflow.primaryLabel}
            </ThemedText>
          </Pressable>

          <Link href={{ pathname: '/dashboard/[role]', params: { role: selectedRole.key } }} asChild>
            <Pressable
              style={({ pressed }) => [
                styles.secondaryButton,
                { backgroundColor: palette.surfaceElevated, borderColor: palette.border },
                pressed && styles.pressed,
              ]}>
              <ThemedText style={{ fontSize: 14, fontWeight: '800' }}>Back to dashboard</ThemedText>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title, subtitle, palette }: { title: string; subtitle: string; palette: Palette }) {
  return (
    <View style={styles.sectionHeader}>
      <ThemedText type="subtitle">{title}</ThemedText>
      <ThemedText style={{ color: palette.muted, fontSize: 13, lineHeight: 18 }}>{subtitle}</ThemedText>
    </View>
  );
}

function toneColor(tone: MineOpsTone, palette: Palette) {
  switch (tone) {
    case 'danger':
      return palette.danger;
    case 'warning':
      return palette.warning;
    case 'success':
      return palette.success;
    default:
      return palette.muted;
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 22,
    gap: 14,
  },
  heroAccent: {
    width: 48,
    height: 6,
    borderRadius: 999,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  heroTextBlock: {
    flex: 1,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 10,
    gap: 4,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 30,
    lineHeight: 32,
    marginTop: 4,
  },
  stepList: {
    gap: 12,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
  },
  stepIndex: {
    width: 34,
    height: 34,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepBody: {
    flex: 1,
    gap: 4,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginTop: 18,
  },
  noteBody: {
    flex: 1,
    gap: 6,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  primaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
});