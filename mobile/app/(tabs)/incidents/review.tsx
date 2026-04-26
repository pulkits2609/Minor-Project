import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { roleProfiles } from '@/constants/mineops';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { globalAuthToken } from '@/constants/auth';
import { useEffect } from 'react';
import { API_BASE_URL } from '@/constants/api';

type Palette = typeof Colors.dark;
type ReviewStatus = 'pending-verification' | 'assigned' | 'resolved';

export default function IncidentReviewScreen() {
  useProtectedRoute(['supervisor', 'safety', 'authority']);

  const colorScheme = useColorScheme() ?? 'dark';
  const palette = Colors[colorScheme];
  const params = useLocalSearchParams<{ role?: string }>();
  const roleValue = Array.isArray(params.role) ? params.role[0] : params.role;
  const selectedRole = roleProfiles.find((role) => role.key === roleValue) ?? roleProfiles[0];

  const [filterStatus, setFilterStatus] = useState<ReviewStatus>('pending-verification');
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [incidents, setIncidents] = useState<any[]>([]);

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    if (!globalAuthToken) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/incidents`, {
        headers: { Authorization: `Bearer ${globalAuthToken}` },
      });
      const data = await res.json();
      if (data.status === 'success') {
        setIncidents(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch incidents', err);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    if (!globalAuthToken) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/incidents/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${globalAuthToken}`,
        },
        body: JSON.stringify({ status, notes: verificationNotes }),
      });
      const data = await res.json();
      if (data.status === 'success') {
        Alert.alert('Success', `Incident status updated to ${status}`);
        fetchIncidents();
        setVerificationNotes('');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const filteredIncidents = incidents.filter((incident) => incident.status === filterStatus);
  const current =
    selectedIncident !== null
      ? incidents.find((incident) => incident.id === selectedIncident)
      : filteredIncidents[0];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView
        style={{ backgroundColor: palette.background }}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: palette.background }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerBar}>
          <Link href={{ pathname: '/dashboard/[role]', params: { role: selectedRole.key } }} asChild>
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
              {selectedRole.label} workflow
            </ThemedText>
          </View>
        </View>

        <View style={styles.titleBlock}>
          <ThemedText type="title">Incident Review &amp; Verification</ThemedText>
          <ThemedText style={{ color: palette.muted, fontSize: 15, lineHeight: 22, marginTop: 10 }}>
            Review and verify reported incidents
          </ThemedText>
        </View>

        <View style={styles.filterRow}>
          {['pending-verification', 'assigned', 'resolved'].map((status) => {
            const selected = filterStatus === status;
            return (
              <Pressable
                key={status}
                onPress={() => {
                  setFilterStatus(status as ReviewStatus);
                  setSelectedIncident(null);
                  setVerificationNotes('');
                }}
                style={({ pressed }) => [
                  styles.filterChip,
                  {
                    backgroundColor: selected ? palette.tint : palette.surface,
                    borderColor: selected ? palette.tint : palette.border,
                  },
                  pressed && styles.pressed,
                ]}>
                <ThemedText
                  style={{
                    color: selected ? '#111111' : palette.text,
                    fontSize: 11,
                    fontWeight: '800',
                    letterSpacing: 0.4,
                  }}>
                  {status.replace('-', ' ').toUpperCase()}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.statsGrid}>
          {[
            {
              label: 'Pending',
              value: String(incidents.filter((item) => item.status === 'pending-verification').length),
              tone: palette.warning,
              bg: palette.warning + '22',
            },
            {
              label: 'Assigned',
              value: String(incidents.filter((item) => item.status === 'assigned').length),
              tone: '#60a5fa',
              bg: '#3b82f622',
            },
            {
              label: 'Resolved',
              value: String(incidents.filter((item) => item.status === 'resolved').length),
              tone: palette.success,
              bg: palette.success + '22',
            },
          ].map((item) => (
            <View key={item.label} style={[styles.statCard, { backgroundColor: item.bg, borderColor: palette.border }]}>
              <ThemedText style={{ color: palette.muted, fontSize: 12, marginBottom: 4 }}>{item.label}</ThemedText>
              <ThemedText type="title" style={{ fontSize: 28, lineHeight: 32, color: item.tone }}>
                {item.value}
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.listBlock}>
          {filteredIncidents.map((incident) => {
            const selected = selectedIncident === incident.id;
            return (
              <Pressable
                key={incident.id}
                onPress={() => setSelectedIncident(incident.id)}
                style={({ pressed }) => [
                  styles.reviewCard,
                  {
                    backgroundColor: selected ? palette.surfaceElevated : palette.surface,
                    borderColor: selected ? palette.tint : palette.border,
                  },
                  pressed && styles.pressed,
                ]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderText}>
                    <ThemedText style={styles.incidentCode}>INC-{String(incident.id).substring(0,8).toUpperCase()}</ThemedText>
                    <ThemedText style={styles.incidentTitle}>{incident.description ? incident.description.split('.')[0] : 'No Description'}</ThemedText>
                  </View>
                  <View style={[styles.severityPill, { backgroundColor: severityBackground(incident.severity, palette) }]}>
                    <ThemedText style={{ color: severityText(incident.severity, palette), fontSize: 11, fontWeight: '800' }}>
                      {(incident.severity || 'MEDIUM').toUpperCase()}
                    </ThemedText>
                  </View>
                </View>

                <ThemedText style={{ color: palette.muted, fontSize: 12, lineHeight: 18, marginTop: 6 }}>
                  {incident.location || 'Unknown'} • {new Date(incident.created_at).toLocaleDateString()}
                </ThemedText>
                <ThemedText style={{ color: palette.muted, fontSize: 12, lineHeight: 18, marginTop: 4 }}>
                  {incident.reporter || 'Unknown'}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        {current ? (
          <View style={[styles.detailCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
            <View style={styles.detailHeader}>
              <View>
                <ThemedText style={{ color: palette.muted, fontSize: 12, marginBottom: 4 }}>INC-{String(current.id).substring(0,8).toUpperCase()}</ThemedText>
                <ThemedText type="subtitle">{current.description ? current.description.split('.')[0] : 'No Description'}</ThemedText>
              </View>
              <View style={[styles.severityPill, { backgroundColor: severityBackground(current.severity, palette) }]}>
                <ThemedText style={{ color: severityText(current.severity, palette), fontSize: 11, fontWeight: '800' }}>
                  {(current.severity || 'MEDIUM').toUpperCase()}
                </ThemedText>
              </View>
            </View>

            <View style={styles.detailGrid}>
              <View style={styles.detailItem}>
                <ThemedText style={{ color: palette.muted, fontSize: 12 }}>Zone</ThemedText>
                <ThemedText style={{ color: palette.text, fontWeight: '800' }}>{current.location || 'Unknown'}</ThemedText>
              </View>
              <View style={styles.detailItem}>
                <ThemedText style={{ color: palette.muted, fontSize: 12 }}>Date &amp; Time</ThemedText>
                <ThemedText style={{ color: palette.text, fontWeight: '800' }}>{new Date(current.created_at).toLocaleString()}</ThemedText>
              </View>
              <View style={styles.detailItem}>
                <ThemedText style={{ color: palette.muted, fontSize: 12 }}>Reporter</ThemedText>
                <ThemedText style={{ color: palette.text, fontWeight: '800' }}>{current.reporter || 'Unknown'}</ThemedText>
              </View>
            </View>

            <View>
              <ThemedText style={styles.sectionTitle}>Description</ThemedText>
              <ThemedText style={{ color: palette.text, fontSize: 14, lineHeight: 22, marginTop: 8 }}>
                {current.description}
              </ThemedText>
            </View>

            {current.status === 'pending-verification' ? (
              <View style={styles.sectionGap}>
                <ThemedText style={styles.sectionTitle}>Verification Required</ThemedText>
                <TextInput
                  value={verificationNotes}
                  onChangeText={setVerificationNotes}
                  placeholder="Verification notes..."
                  placeholderTextColor={palette.muted}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  style={[
                    styles.notesInput,
                    {
                      backgroundColor: palette.surface,
                      borderColor: palette.border,
                      color: palette.text,
                    },
                  ]}
                />
                <View style={styles.actionGrid}>
                  <Pressable
                    onPress={() => handleUpdateStatus(current.id, 'assigned')}
                    style={({ pressed }) => [
                      styles.actionButton,
                      { backgroundColor: palette.success + '22', borderColor: palette.success },
                      pressed && styles.pressed,
                    ]}>
                    <ThemedText style={{ color: palette.success, fontSize: 13, fontWeight: '800' }}>Approve</ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={() => handleUpdateStatus(current.id, 'resolved')}
                    style={({ pressed }) => [
                      styles.actionButton,
                      { backgroundColor: palette.danger + '22', borderColor: palette.danger },
                      pressed && styles.pressed,
                    ]}>
                    <ThemedText style={{ color: palette.danger, fontSize: 13, fontWeight: '800' }}>Reject</ThemedText>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.sectionGap}>
                <ThemedText style={styles.sectionTitle}>Current Status</ThemedText>
                <View style={[styles.statusPanel, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                  <View style={[styles.statusPill, { backgroundColor: statusBackground(current.status, palette) }]}>
                    <ThemedText style={{ color: statusText(current.status, palette), fontSize: 11, fontWeight: '800' }}>
                      {current.status.replace('-', ' ').toUpperCase()}
                    </ThemedText>
                  </View>
                  <ThemedText style={{ color: palette.muted, fontSize: 13, lineHeight: 19, marginTop: 10 }}>
                    {current.status === 'assigned'
                      ? 'Assigned to Safety Officer for investigation'
                      : 'This incident has been resolved'}
                  </ThemedText>
                </View>
              </View>
            )}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
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

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 120 },
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
    marginTop: 10,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  filterChip: {
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  statCard: {
    width: '48%',
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
  },
  listBlock: {
    gap: 12,
    marginTop: 18,
  },
  reviewCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardHeaderText: {
    flex: 1,
    gap: 4,
  },
  incidentCode: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#f97316',
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  severityPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  detailCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 14,
    marginTop: 18,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailGrid: {
    gap: 12,
  },
  detailItem: {
    borderRadius: 16,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  sectionGap: {
    gap: 10,
  },
  notesInput: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPanel: {
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
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
});