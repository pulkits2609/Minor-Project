import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useLocalSearchParams } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { INCIDENT_DETAIL } from '@/constants/incidents';
import { roleProfiles } from '@/constants/mineops';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';

type Palette = typeof Colors.dark;

export default function IncidentDetailScreen() {
  useProtectedRoute(); // any authenticated role

  const colorScheme = useColorScheme() ?? 'dark';
  const palette = Colors[colorScheme];
  const params = useLocalSearchParams<{ role?: string; id?: string }>();
  const roleValue = Array.isArray(params.role) ? params.role[0] : params.role;
  const selectedRole = roleProfiles.find((role) => role.key === roleValue) ?? roleProfiles[0];

  const incident = INCIDENT_DETAIL;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView
        style={{ backgroundColor: palette.background }}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: palette.background }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerBar}>
          <Link href={{ pathname: '/incidents', params: { role: selectedRole.key } }} asChild>
            <Pressable
              style={({ pressed }) => [
                styles.backButton,
                { backgroundColor: palette.surfaceElevated, borderColor: palette.border },
                pressed && styles.pressed,
              ]}>
              <MaterialIcons name="arrow-back" size={18} color={palette.text} />
            </Pressable>
          </Link>

          <View style={styles.topMeta}>
            <ThemedText type="subtitle" style={styles.brand}>
              MineOps
            </ThemedText>
            <ThemedText style={{ color: palette.muted, fontSize: 13, lineHeight: 18 }}>
              {selectedRole.label} incidents
            </ThemedText>
          </View>
        </View>

        <View style={styles.titleBlock}>
          <ThemedText style={styles.incidentCode}>{incident.code}</ThemedText>
          <View style={styles.titleRow}>
            <ThemedText type="title" style={styles.pageTitle}>
              {incident.title}
            </ThemedText>
            <View style={[styles.severityPill, { backgroundColor: severityBackground(incident.severity, palette) }]}>
              <ThemedText style={{ color: severityText(incident.severity, palette), fontSize: 11, fontWeight: '800' }}>
                {incident.severity.toUpperCase()}
              </ThemedText>
            </View>
          </View>
        </View>

        {incident.severity === 'critical' ? (
          <View style={[styles.alertCard, { backgroundColor: palette.danger + '22', borderColor: palette.danger }]}>
            <MaterialIcons name="warning" size={20} color={palette.danger} />
            <View style={styles.alertBody}>
              <ThemedText style={{ color: palette.danger, fontSize: 15, fontWeight: '800' }}>
                Critical Incident - Immediate Action Required
              </ThemedText>
              <ThemedText style={{ color: palette.muted, fontSize: 13, lineHeight: 19, marginTop: 4 }}>
                This is a critical safety incident. Personnel in the affected zone must be alerted immediately.
              </ThemedText>
            </View>
          </View>
        ) : null}

        <View style={[styles.card, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
          <ThemedText type="subtitle">Incident Description</ThemedText>
          <ThemedText style={{ color: palette.text, fontSize: 15, lineHeight: 24, marginTop: 10 }}>
            {incident.description}
          </ThemedText>
        </View>

        <View style={[styles.card, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
          <ThemedText type="subtitle">Incident Timeline</ThemedText>
          <View style={styles.timelineList}>
            {incident.timeline.map((event, index) => (
              <View key={`${event.time}-${event.action}`} style={styles.timelineRow}>
                <View style={styles.timelineRail}>
                  <View style={[styles.timelineDot, { backgroundColor: timelineTone(event.status, palette) }]} />
                  {index < incident.timeline.length - 1 ? (
                    <View style={[styles.timelineLine, { backgroundColor: palette.border }]} />
                  ) : null}
                </View>
                <View style={styles.timelineContent}>
                  <ThemedText style={{ color: palette.text, fontSize: 14, fontWeight: '800' }}>
                    {event.action}
                  </ThemedText>
                  <ThemedText style={{ color: palette.muted, fontSize: 12, lineHeight: 18, marginTop: 4 }}>
                    {event.actor} • {event.time}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.detailGrid}>
          <View style={[styles.detailCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
            <ThemedText style={{ color: palette.muted, fontSize: 12, marginBottom: 4 }}>Zone</ThemedText>
            <ThemedText style={{ color: palette.text, fontSize: 15, fontWeight: '800' }}>{incident.zone}</ThemedText>
          </View>

          <View style={[styles.detailCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
            <ThemedText style={{ color: palette.muted, fontSize: 12, marginBottom: 4 }}>Date &amp; Time</ThemedText>
            <ThemedText style={{ color: palette.text, fontSize: 15, fontWeight: '800' }}>
              {incident.date} at {incident.time}
            </ThemedText>
          </View>

          <View style={[styles.detailCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
            <ThemedText style={{ color: palette.muted, fontSize: 12, marginBottom: 4 }}>Status</ThemedText>
            <View style={[styles.statusPill, { backgroundColor: statusBackground(incident.status, palette) }]}>
              <ThemedText style={{ color: statusText(incident.status, palette), fontSize: 11, fontWeight: '800' }}>
                {incident.status.replace('-', ' ').toUpperCase()}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
          <ThemedText type="subtitle">Reporter</ThemedText>
          <View style={styles.personRow}>
            <View style={[styles.avatar, { backgroundColor: palette.tint }]}>
              <ThemedText style={styles.avatarText}>{incident.reporter.name.charAt(0)}</ThemedText>
            </View>
            <View>
              <ThemedText style={{ color: palette.text, fontSize: 15, fontWeight: '800' }}>{incident.reporter.name}</ThemedText>
              <ThemedText style={{ color: palette.muted, fontSize: 12, lineHeight: 18 }}>{incident.reporter.role}</ThemedText>
            </View>
          </View>
        </View>

        {incident.assignedTo ? (
          <View style={[styles.card, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
            <ThemedText type="subtitle">Assigned To</ThemedText>
            <View style={styles.personRow}>
              <View style={[styles.avatar, { backgroundColor: '#3b82f6' }]}>
                <ThemedText style={styles.avatarText}>{incident.assignedTo.name.charAt(0)}</ThemedText>
              </View>
              <View>
                <ThemedText style={{ color: palette.text, fontSize: 15, fontWeight: '800' }}>{incident.assignedTo.name}</ThemedText>
                <ThemedText style={{ color: palette.muted, fontSize: 12, lineHeight: 18 }}>{incident.assignedTo.id}</ThemedText>
              </View>
            </View>
          </View>
        ) : null}

        {(selectedRole.key === 'safety' || selectedRole.key === 'admin' || selectedRole.key === 'authority') ? (
          <View style={[styles.card, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
            <ThemedText type="subtitle">Actions</ThemedText>
            <View style={styles.actionStack}>
              <ActionButton
                label="Approve"
                tone={palette.success}
                background={palette.success + '22'}
                onPress={() => Alert.alert('Approve', 'This is a demo action.')}
              />
              <ActionButton
                label="Request Review"
                tone="#60a5fa"
                background="#3b82f622"
                onPress={() => Alert.alert('Request Review', 'This incident has been sent back for review.')}
              />
              <ActionButton
                label="Escalate"
                tone={palette.tint}
                background={palette.tint + '22'}
                onPress={() => Alert.alert('Escalate', 'This incident has been escalated.')}
              />
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function timelineTone(status: string, palette: Palette) {
  switch (status) {
    case 'created':
      return '#3b82f6';
    case 'alert':
      return palette.danger;
    case 'action':
      return palette.tint;
    default:
      return palette.warning;
  }
}

function statusBackground(status: string, palette: Palette) {
  switch (status) {
    case 'resolved':
      return palette.success + '22';
    case 'assigned':
      return '#3b82f622';
    default:
      return palette.warning + '22';
  }
}

function statusText(status: string, palette: Palette) {
  switch (status) {
    case 'resolved':
      return palette.success;
    case 'assigned':
      return '#60a5fa';
    default:
      return palette.warning;
  }
}

function severityBackground(severity: string, palette: Palette) {
  switch (severity) {
    case 'critical':
      return palette.danger + '22';
    case 'high':
      return '#f9731622';
    default:
      return '#facc1522';
  }
}

function severityText(severity: string, palette: Palette) {
  switch (severity) {
    case 'critical':
      return palette.danger;
    case 'high':
      return '#fb923c';
    default:
      return '#facc15';
  }
}

function ActionButton({
  label,
  tone,
  background,
  onPress,
}: {
  label: string;
  tone: string;
  background: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.actionButton, { backgroundColor: background, borderColor: tone }, pressed && styles.pressed]}>
      <ThemedText style={{ color: tone, fontSize: 13, fontWeight: '800' }}>{label}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 120, gap: 14 },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  topMeta: {
    alignItems: 'flex-end',
    flex: 1,
  },
  brand: { marginBottom: 2 },
  titleBlock: {
    gap: 8,
  },
  incidentCode: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#f97316',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  pageTitle: {
    flex: 1,
  },
  severityPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  alertCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  alertBody: {
    flex: 1,
  },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 10,
  },
  timelineList: {
    gap: 14,
    marginTop: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineRail: {
    width: 18,
    alignItems: 'center',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    borderRadius: 999,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 2,
  },
  detailGrid: {
    gap: 12,
  },
  detailCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  statusPill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '900',
  },
  actionStack: {
    gap: 10,
  },
  actionButton: {
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
});