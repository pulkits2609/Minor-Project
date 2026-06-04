import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { roleProfiles } from '@/constants/mineops';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { globalAuthToken, loadAuthState } from '@/constants/auth';
import { apiFetchWithFallback, getApiErrorMessage, readApiJson } from '@/constants/api';

type Palette = typeof Colors.dark;
type ReviewStatus = 'pending-verification' | 'reviewed' | 'assigned' | 'resolved' | 'rejected';

type Worker = {
  id: string;
  name: string;
  email?: string;
};

const REVIEW_STATUSES: ReviewStatus[] = ['pending-verification', 'reviewed', 'assigned', 'resolved', 'rejected'];
const PRIORITIES = ['low', 'medium', 'high', 'critical'];

export default function IncidentReviewScreen() {
  useProtectedRoute(['supervisor', 'safety', 'authority']);

  const colorScheme = useColorScheme() ?? 'dark';
  const palette = Colors[colorScheme];
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();
  const roleValue = Array.isArray(params.role) ? params.role[0] : params.role;
  const selectedRole = roleProfiles.find((role) => role.key === roleValue) ?? roleProfiles[0];

  const [filterStatus, setFilterStatus] = useState<ReviewStatus>('pending-verification');
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [incidents, setIncidents] = useState<any[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [taskName, setTaskName] = useState('');
  const [taskPriority, setTaskPriority] = useState('high');
  const [isReviewing, setIsReviewing] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

  const getAuthToken = useCallback(async () => {
    let authToken = globalAuthToken;
    if (!authToken) {
      const { token } = await loadAuthState();
      authToken = token;
    }
    return authToken;
  }, []);

  const fetchIncidents = useCallback(async () => {
    const authToken = await getAuthToken();
    if (!authToken) return;

    try {
      const res = await apiFetchWithFallback('/api/incidents', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await readApiJson<{ status?: string; data?: any[] }>(res);
      if (data?.status === 'success') {
        setIncidents(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch incidents', err);
    }
  }, [getAuthToken]);

  const fetchWorkers = useCallback(async () => {
    const authToken = await getAuthToken();
    if (!authToken) return;

    try {
      const res = await apiFetchWithFallback('/api/users/workers', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await readApiJson<{ status?: string; data?: Worker[] }>(res);
      if (res.ok && data?.status === 'success') {
        setWorkers(data.data || []);
      }
    } catch (error) {
      console.warn('Failed to fetch workers for incident assignment', error);
    }
  }, [getAuthToken]);

  useEffect(() => {
    fetchIncidents();
    fetchWorkers();
  }, [fetchIncidents, fetchWorkers]);

  const handleReviewIncident = async (id: string, approved: boolean) => {
    const authToken = await getAuthToken();
    if (!authToken) {
      Alert.alert('Session Expired', 'Please login again to review incidents.');
      return;
    }

    try {
      setIsReviewing(true);
      const res = await apiFetchWithFallback(`/api/incidents/${id}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ approved }),
      });
      const data = await readApiJson<{ status?: string; data?: any; error?: string; message?: string }>(res);
      if (!res.ok) {
        Alert.alert('Review Failed', getApiErrorMessage(data, 'Failed to review incident'));
        return;
      }

      if (data?.status === 'success' && data.data) {
        setIncidents((current) => current.map((incident) => incident.id === id ? { ...incident, ...data.data } : incident));
        setFilterStatus(approved ? 'reviewed' : 'rejected');
        setVerificationNotes('');
        if (!approved) {
          setSelectedIncident(null);
        }
        Alert.alert('Success', approved ? 'Incident approved for assignment.' : 'Incident rejected.');
      } else {
        Alert.alert('Review Failed', getApiErrorMessage(data, 'Failed to review incident'));
      }
    } catch (error) {
      console.warn('Failed to review incident', error);
      Alert.alert('Review Failed', 'Network request failed');
    } finally {
      setIsReviewing(false);
    }
  };

  const openAssignModal = () => {
    if (!current) return;
    setSelectedWorkerId('');
    setTaskName(current.description ? current.description.split('.')[0] : `Incident response - ${current.location || 'Unknown zone'}`);
    setTaskPriority(current.severity === 'critical' ? 'critical' : current.severity === 'high' ? 'high' : 'medium');
    setAssignModalVisible(true);
  };

  const handleAssignWorker = async () => {
    if (!current) return;
    if (!selectedWorkerId) {
      Alert.alert('Worker Required', 'Select a worker before assigning this incident.');
      return;
    }

    const authToken = await getAuthToken();
    if (!authToken) {
      Alert.alert('Session Expired', 'Please login again to assign incidents.');
      return;
    }

    try {
      setIsAssigning(true);
      const res = await apiFetchWithFallback(`/api/incidents/${current.id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          worker_id: selectedWorkerId,
          task_name: taskName.trim() || undefined,
          description: verificationNotes.trim() || current.description,
          priority: taskPriority,
        }),
      });
      const data = await readApiJson<{ status?: string; data?: { incident_id?: string; task_id?: string }; error?: string; message?: string }>(res);
      if (!res.ok) {
        Alert.alert('Assignment Failed', getApiErrorMessage(data, 'Failed to assign worker'));
        return;
      }

      if (data?.status === 'success') {
        setIncidents((items) => items.map((incident) => incident.id === current.id ? { ...incident, status: 'assigned' } : incident));
        setFilterStatus('assigned');
        setAssignModalVisible(false);
        setSelectedIncident(null);
        setVerificationNotes('');
        Alert.alert('Success', 'Worker assigned and task created.');
        fetchIncidents();
      } else {
        Alert.alert('Assignment Failed', getApiErrorMessage(data, 'Failed to assign worker'));
      }
    } catch (error) {
      console.warn('Failed to assign worker from incident', error);
      Alert.alert('Assignment Failed', 'Network request failed');
    } finally {
      setIsAssigning(false);
    }
  };

  const filteredIncidents = incidents.filter((incident) => incident.status === filterStatus);
  const current = selectedIncident !== null
    ? incidents.find((incident) => incident.id === selectedIncident)
    : null;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView
        style={{ backgroundColor: palette.background }}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: palette.background }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerBar}>
          <Pressable
            onPress={() => router.replace({ pathname: '/dashboard/[role]', params: { role: selectedRole.key } })}
            accessibilityLabel="Back to dashboard"
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: palette.surfaceElevated, borderColor: palette.border },
              pressed && styles.pressed,
            ]}>
            <MaterialIcons name="arrow-back" size={18} color={palette.text} />
          </Pressable>

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
            Approve incidents, assign workers, and track automatic resolution.
          </ThemedText>
        </View>

        <View style={styles.filterRow}>
          {REVIEW_STATUSES.map((status) => {
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
                  {formatStatus(status)}
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
              label: 'Reviewed',
              value: String(incidents.filter((item) => item.status === 'reviewed').length),
              tone: '#38bdf8',
              bg: '#38bdf822',
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
          {filteredIncidents.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
              <MaterialIcons name="assignment-late" size={24} color={palette.muted} />
              <ThemedText style={{ color: palette.muted, fontSize: 13, lineHeight: 19, textAlign: 'center' }}>
                No incidents in {formatStatus(filterStatus).toLowerCase()}.
              </ThemedText>
            </View>
          ) : null}

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
                    <ThemedText style={styles.incidentCode}>INC-{String(incident.id).substring(0, 8).toUpperCase()}</ThemedText>
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
                <ThemedText style={{ color: palette.muted, fontSize: 12, marginBottom: 4 }}>INC-{String(current.id).substring(0, 8).toUpperCase()}</ThemedText>
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
                <ThemedText style={{ color: palette.muted, fontSize: 13, lineHeight: 19 }}>
                  Approving moves this incident into the worker assignment queue. Rejecting closes it as not actionable.
                </ThemedText>
                <View style={styles.actionGrid}>
                  <Pressable
                    disabled={isReviewing}
                    onPress={() => handleReviewIncident(current.id, true)}
                    style={({ pressed }) => [
                      styles.actionButton,
                      { backgroundColor: palette.success + '22', borderColor: palette.success },
                      pressed && styles.pressed,
                    ]}>
                    <ThemedText style={{ color: palette.success, fontSize: 13, fontWeight: '800' }}>
                      {isReviewing ? 'Approving...' : 'Approve'}
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    disabled={isReviewing}
                    onPress={() => handleReviewIncident(current.id, false)}
                    style={({ pressed }) => [
                      styles.actionButton,
                      { backgroundColor: palette.danger + '22', borderColor: palette.danger },
                      pressed && styles.pressed,
                    ]}>
                    <ThemedText style={{ color: palette.danger, fontSize: 13, fontWeight: '800' }}>
                      {isReviewing ? 'Rejecting...' : 'Reject'}
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            ) : current.status === 'reviewed' ? (
              <View style={styles.sectionGap}>
                <ThemedText style={styles.sectionTitle}>Assignment Required</ThemedText>
                <View style={[styles.statusPanel, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                  <View style={[styles.statusPill, { backgroundColor: statusBackground(current.status, palette) }]}>
                    <ThemedText style={{ color: statusText(current.status, palette), fontSize: 11, fontWeight: '800' }}>
                      REVIEWED
                    </ThemedText>
                  </View>
                  <ThemedText style={{ color: palette.muted, fontSize: 13, lineHeight: 19, marginTop: 10 }}>
                    Assign a worker to create a linked task. Completing that task will resolve the incident automatically.
                  </ThemedText>
                  <Pressable
                    onPress={openAssignModal}
                    style={({ pressed }) => [
                      styles.primaryAction,
                      { backgroundColor: palette.tint },
                      pressed && styles.pressed,
                    ]}>
                    <MaterialIcons name="person-add" size={18} color="#111111" />
                    <ThemedText lightColor="#111111" darkColor="#111111" style={{ fontSize: 13, fontWeight: '900' }}>
                      Assign Worker
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.sectionGap}>
                <ThemedText style={styles.sectionTitle}>Current Status</ThemedText>
                <View style={[styles.statusPanel, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                  <View style={[styles.statusPill, { backgroundColor: statusBackground(current.status, palette) }]}>
                    <ThemedText style={{ color: statusText(current.status, palette), fontSize: 11, fontWeight: '800' }}>
                      {formatStatus(current.status)}
                    </ThemedText>
                  </View>
                  <ThemedText style={{ color: palette.muted, fontSize: 13, lineHeight: 19, marginTop: 10 }}>
                    {current.status === 'assigned'
                      ? 'A linked task has been created for a worker.'
                      : current.status === 'rejected'
                        ? 'This incident was rejected during safety review.'
                        : 'This incident has been resolved.'}
                  </ThemedText>
                </View>
              </View>
            )}
          </View>
        ) : null}
      </ScrollView>

      <Modal
        visible={assignModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAssignModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: palette.background, borderColor: palette.border }]}>
            <View style={styles.modalHeader}>
              <View>
                <ThemedText type="subtitle">Assign Worker</ThemedText>
                <ThemedText style={{ color: palette.muted, fontSize: 12, lineHeight: 18, marginTop: 4 }}>
                  Create a linked task for this incident.
                </ThemedText>
              </View>
              <Pressable
                onPress={() => setAssignModalVisible(false)}
                accessibilityLabel="Close assignment form"
                style={({ pressed }) => [styles.closeButton, { backgroundColor: palette.surfaceElevated }, pressed && styles.pressed]}>
                <MaterialIcons name="close" size={18} color={palette.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalBody}>
              <View style={styles.sectionGap}>
                <ThemedText style={styles.sectionTitle}>Worker</ThemedText>
                <View style={styles.workerList}>
                  {workers.length === 0 ? (
                    <View style={[styles.emptyState, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
                      <ThemedText style={{ color: palette.muted, fontSize: 13 }}>No workers available.</ThemedText>
                    </View>
                  ) : null}
                  {workers.map((worker) => {
                    const selected = selectedWorkerId === worker.id;
                    return (
                      <Pressable
                        key={worker.id}
                        onPress={() => setSelectedWorkerId(worker.id)}
                        style={({ pressed }) => [
                          styles.workerOption,
                          {
                            backgroundColor: selected ? palette.tint + '22' : palette.surfaceElevated,
                            borderColor: selected ? palette.tint : palette.border,
                          },
                          pressed && styles.pressed,
                        ]}>
                        <View style={[styles.workerAvatar, { backgroundColor: selected ? palette.tint : palette.surface }]}>
                          <ThemedText lightColor="#111111" darkColor={selected ? '#111111' : palette.text} style={{ fontWeight: '900' }}>
                            {(worker.name || 'W').charAt(0).toUpperCase()}
                          </ThemedText>
                        </View>
                        <View style={{ flex: 1 }}>
                          <ThemedText style={{ fontSize: 14, fontWeight: '800' }}>{worker.name || 'Worker'}</ThemedText>
                          <ThemedText style={{ color: palette.muted, fontSize: 12, marginTop: 2 }}>{worker.email || worker.id}</ThemedText>
                        </View>
                        {selected ? <MaterialIcons name="check-circle" size={18} color={palette.tint} /> : null}
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.sectionGap}>
                <ThemedText style={styles.sectionTitle}>Task Name</ThemedText>
                <TextInput
                  value={taskName}
                  onChangeText={setTaskName}
                  placeholder="Task name"
                  placeholderTextColor={palette.muted}
                  style={[styles.textInput, { backgroundColor: palette.surface, borderColor: palette.border, color: palette.text }]}
                />
              </View>

              <View style={styles.sectionGap}>
                <ThemedText style={styles.sectionTitle}>Priority</ThemedText>
                <View style={styles.priorityRow}>
                  {PRIORITIES.map((priority) => {
                    const selected = taskPriority === priority;
                    return (
                      <Pressable
                        key={priority}
                        onPress={() => setTaskPriority(priority)}
                        style={({ pressed }) => [
                          styles.priorityChip,
                          {
                            backgroundColor: selected ? palette.tint : palette.surfaceElevated,
                            borderColor: selected ? palette.tint : palette.border,
                          },
                          pressed && styles.pressed,
                        ]}>
                        <ThemedText style={{ color: selected ? '#111111' : palette.text, fontSize: 12, fontWeight: '800' }}>
                          {priority.toUpperCase()}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.sectionGap}>
                <ThemedText style={styles.sectionTitle}>Assignment Notes</ThemedText>
                <TextInput
                  value={verificationNotes}
                  onChangeText={setVerificationNotes}
                  placeholder="Optional task details..."
                  placeholderTextColor={palette.muted}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  style={[styles.notesInput, { backgroundColor: palette.surface, borderColor: palette.border, color: palette.text }]}
                />
              </View>

              <Pressable
                disabled={isAssigning}
                onPress={handleAssignWorker}
                style={({ pressed }) => [
                  styles.submitAssignment,
                  { backgroundColor: isAssigning ? palette.muted : palette.tint },
                  pressed && styles.pressed,
                ]}>
                <ThemedText lightColor="#111111" darkColor="#111111" style={{ fontWeight: '900' }}>
                  {isAssigning ? 'Assigning...' : 'Create Task & Assign'}
                </ThemedText>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
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

function formatStatus(status: string) {
  return status.replace(/-/g, ' ').toUpperCase();
}

function statusBackground(status: string, palette: Palette) {
  switch (status) {
    case 'resolved':
      return palette.success + '22';
    case 'assigned':
      return '#3b82f622';
    case 'reviewed':
      return '#38bdf822';
    case 'rejected':
      return palette.danger + '22';
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
    case 'reviewed':
      return '#38bdf8';
    case 'rejected':
      return palette.danger;
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
    width: 48,
    height: 48,
    borderRadius: 16,
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
  emptyState: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    gap: 8,
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
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryAction: {
    minHeight: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
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
  textInput: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.62)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    maxHeight: '86%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 14,
  },
  modalBody: {
    gap: 16,
    paddingBottom: 20,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerList: {
    gap: 10,
  },
  workerOption: {
    minHeight: 58,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  workerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  priorityChip: {
    minHeight: 44,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitAssignment: {
    minHeight: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
});
