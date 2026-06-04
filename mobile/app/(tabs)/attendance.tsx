import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, ActivityIndicator, Platform, Alert, Modal, FlatList } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalAuthToken } from '@/constants/auth';
import { apiFetchWithFallback, getApiErrorMessage, readApiJson } from '@/constants/api';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { roleProfiles } from '@/constants/mineops';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';

type Palette = typeof Colors.dark;

type AttendanceRecord = {
  id: string;
  shiftId: string;
  date: string;
  name: string;
  checkIn: string;
  checkOut: string;
  status: 'Present' | 'Late' | 'Absent';
  duration: string;
};

type ShiftRecord = {
  id: string;
  start_time?: string;
  end_time?: string;
  location?: string;
};

type ApiListResponse<T> = {
  status?: string;
  data?: T[];
  error?: string;
  message?: string;
};

const formatAttendanceTime = (value: unknown) => {
  if (!value) {
    return '-';
  }

  const rawValue = String(value);
  const parsed = new Date(rawValue);

  if (Number.isNaN(parsed.getTime())) {
    return rawValue;
  }

  return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getDuration = (checkIn: unknown, checkOut: unknown) => {
  if (!checkIn) {
    return '-';
  }

  if (!checkOut) {
    return 'In Progress';
  }

  const start = new Date(String(checkIn)).getTime();
  const end = new Date(String(checkOut)).getTime();

  if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
    return '-';
  }

  const totalMinutes = Math.round((end - start) / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
};

const normalizeStatus = (status: unknown): AttendanceRecord['status'] => {
  const normalized = typeof status === 'string' ? status.toLowerCase() : '';

  if (normalized === 'late') {
    return 'Late';
  }

  if (normalized === 'absent') {
    return 'Absent';
  }

  return 'Present';
};

const isToday = (value: string) => {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return false;
  }

  const today = new Date();
  return parsed.toDateString() === today.toDateString();
};

const mapAttendanceRecord = (item: any): AttendanceRecord => {
  const checkInRaw = item.check_in_time ?? item.check_in;
  const checkOutRaw = item.check_out_time ?? item.check_out;

  return {
    id: String(item.id ?? `${item.user_id ?? 'attendance'}-${item.shift_id ?? 'shift'}`),
    shiftId: String(item.shift_id ?? ''),
    date: String(item.date ?? ''),
    name: item.user_name || item.name || 'Worker',
    checkIn: formatAttendanceTime(checkInRaw),
    checkOut: formatAttendanceTime(checkOutRaw),
    status: normalizeStatus(item.status),
    duration: item.duration || getDuration(checkInRaw, checkOutRaw),
  };
};


export default function AttendanceScreen() {
  useProtectedRoute(['worker', 'supervisor', 'admin', 'authority']);

  const colorScheme = useColorScheme() ?? 'dark';
  const palette = Colors[colorScheme];
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();
  const roleValue = Array.isArray(params.role) ? params.role[0] : params.role;
  const selectedRole = roleProfiles.find((role) => role.key === roleValue) ?? roleProfiles[0];

  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const selectedDate = date.toISOString().split('T')[0];

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<'checkin' | 'checkout' | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!globalAuthToken) {
        setLoading(false);
        return;
      }
      try {
        const [attRes, shiftRes] = await Promise.all([
          apiFetchWithFallback('/api/attendance', {
            headers: { Authorization: `Bearer ${globalAuthToken}` },
          }),
          apiFetchWithFallback('/api/shifts', {
            headers: { Authorization: `Bearer ${globalAuthToken}` },
          }),
        ]);
        const attData = await readApiJson<ApiListResponse<any>>(attRes);
        if (attRes.ok && attData?.status === 'success') {
          setAttendance((attData.data || []).map(mapAttendanceRecord));
        }
        const shiftData = await readApiJson<ApiListResponse<ShiftRecord>>(shiftRes);
        if (shiftRes.ok && shiftData?.status === 'success') {
          setShifts(shiftData.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch attendance', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredAttendance = attendance.filter((item) => {
    if (!item.date) return true;
    // Compare date strings (YYYY-MM-DD)
    const recordDate = new Date(item.date).toISOString().split('T')[0];
    return recordDate === selectedDate;
  });

  const stats = {
    present: filteredAttendance.filter((item) => item.status === 'Present' || item.status === 'Late').length,
    late: filteredAttendance.filter((item) => item.status === 'Late').length,
    absent: filteredAttendance.filter((item) => item.status === 'Absent').length,
    total: filteredAttendance.length,
  };

  const handleCheckAction = async (type: 'checkin' | 'checkout') => {
    if (!globalAuthToken || actionLoading) return;

    setActionLoading(type);
    try {
      const activeAttendance = attendance.find((record) => record.shiftId && record.checkOut === '-' && isToday(record.date));

      if (type === 'checkout' && !activeAttendance) {
        Alert.alert('No Active Check-In', 'Please check in before checking out.');
        setActionLoading(null);
        return;
      }

      if (type === 'checkin' && activeAttendance) {
        Alert.alert('Already Checked In', 'Please check out from your active shift before checking in again.');
        setActionLoading(null);
        return;
      }

      if (type === 'checkin' && !selectedShiftId) {
        Alert.alert('No Shift Selected', 'Please select a shift to check in for.');
        setActionLoading(null);
        return;
      }

      if (type === 'checkout' && activeAttendance) {
        const checkInTime = new Date(String(activeAttendance.checkIn));
        if (checkInTime instanceof Date && !isNaN(checkInTime.getTime())) {
          const now = new Date();
          if (now <= checkInTime) {
            Alert.alert('Invalid Check-Out', 'Check-out time must be after check-in time.');
            setActionLoading(null);
            return;
          }
        }
      }

      const shiftId = type === 'checkout' ? activeAttendance?.shiftId : selectedShiftId;

      if (!shiftId) {
        Alert.alert('No Assigned Shift', 'No assigned shifts are available for this action.');
        setActionLoading(null);
        return;
      }

      const res = await apiFetchWithFallback(`/api/attendance/${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${globalAuthToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ shift_id: shiftId })
      });
      const data = await readApiJson<{ status?: string; error?: string; message?: string }>(res);

      if (res.ok && data?.status === 'success') {
        Alert.alert('Success', `Successfully ${type === 'checkin' ? 'checked in' : 'checked out'}!`);
        setSelectedShiftId(null);
        const refreshRes = await apiFetchWithFallback('/api/attendance', {
          headers: { Authorization: `Bearer ${globalAuthToken}` },
        });
        const refreshData = await readApiJson<ApiListResponse<any>>(refreshRes);
        if (refreshRes.ok && refreshData?.status === 'success') {
          setAttendance((refreshData.data || []).map(mapAttendanceRecord));
        }
      } else {
        Alert.alert(
          'Attendance Error',
          getApiErrorMessage(data, `Failed to ${type === 'checkin' ? 'check in' : 'check out'}.`)
        );
      }
    } catch (error) {
      Alert.alert(
        'Connection Error',
        error instanceof Error ? error.message : 'Unable to reach the server.'
      );
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={palette.tint} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView
        style={{ backgroundColor: palette.background }}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: palette.background }]}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.topRow, { borderBottomColor: palette.border }]}>
          <Pressable
            onPress={() => router.replace({ pathname: '/dashboard/[role]', params: { role: selectedRole.key } })}
            accessibilityLabel="Back to dashboard"
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: palette.surfaceElevated, borderColor: palette.border },
              pressed && styles.pressed,
            ]}>
            <MaterialIcons name="arrow-back" size={20} color={palette.text} />
          </Pressable>

          <View style={styles.topMeta}>
            <ThemedText type="subtitle" style={styles.brand}>
              MineOps
            </ThemedText>
            <ThemedText style={{ color: palette.muted, fontSize: 13, lineHeight: 18 }}>
              {selectedRole.label} dashboard
            </ThemedText>
          </View>
        </View>

        <View style={styles.headerBlock}>
          <ThemedText type="title">Attendance Tracking</ThemedText>
          <ThemedText style={{ color: palette.muted, fontSize: 15, lineHeight: 22, marginTop: 10 }}>
            Check-in/Check-out and attendance records
          </ThemedText>
        </View>

        <View style={styles.fieldGroup}>
          <ThemedText style={styles.label}>Select Date</ThemedText>
          <Pressable
            onPress={() => setShowPicker(true)}
            style={[styles.dateRow, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
            <MaterialIcons name="event" size={18} color={palette.tint} />
            <ThemedText style={{ color: palette.text, fontSize: 15 }}>{selectedDate}</ThemedText>
          </Pressable>
          {showPicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                setShowPicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}
        </View>

        <View style={styles.statsGrid}>
          {[
            { label: 'Total Staff', value: String(stats.total), tone: '#60a5fa', bg: '#60a5fa22' },
            { label: 'Present', value: String(stats.present), tone: palette.success, bg: palette.success + '22' },
            { label: 'Late', value: String(stats.late), tone: palette.warning, bg: palette.warning + '22' },
            { label: 'Absent', value: String(stats.absent), tone: palette.danger, bg: palette.danger + '22' },
          ].map((item) => (
            <View key={item.label} style={[styles.statCard, { backgroundColor: item.bg, borderColor: palette.border }]}>
              <ThemedText style={{ color: palette.muted, fontSize: 12, marginBottom: 4 }}>{item.label}</ThemedText>
              <ThemedText type="title" style={{ fontSize: 28, lineHeight: 32, color: item.tone }}>
                {item.value}
              </ThemedText>
            </View>
          ))}
        </View>

        {selectedRole.key === 'worker' ? (
          <>
            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>Select Shift</ThemedText>
              <Pressable
                onPress={() => setShowShiftModal(true)}
                style={[styles.dateRow, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
                <MaterialIcons name="work" size={18} color={palette.tint} />
                {selectedShiftId ? (
                  (() => {
                    const shift = shifts.find((s) => s.id === selectedShiftId);
                    return (
                      <ThemedText style={{ color: palette.text, fontSize: 15, flex: 1 }} numberOfLines={1}>
                        {shift?.location || 'Shift'} {shift?.start_time ? `(${new Date(shift.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${shift.end_time ? new Date(shift.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''})` : ''}
                      </ThemedText>
                    );
                  })()
                ) : (
                  <ThemedText style={{ color: palette.muted, fontSize: 15, flex: 1 }}>Tap to select a shift...</ThemedText>
                )}
                <MaterialIcons name="arrow-drop-down" size={22} color={palette.muted} />
              </Pressable>
            </View>

            <Modal visible={showShiftModal} transparent animationType="fade" onRequestClose={() => setShowShiftModal(false)}>
              <Pressable style={styles.modalOverlay} onPress={() => setShowShiftModal(false)}>
                <View style={[styles.modalContent, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
                  <ThemedText type="subtitle" style={{ marginBottom: 12, paddingHorizontal: 4 }}>Select a Shift</ThemedText>
                  {shifts.length === 0 ? (
                    <ThemedText style={{ color: palette.muted, padding: 16, textAlign: 'center' }}>No assigned shifts available</ThemedText>
                  ) : (
                    <FlatList
                      data={shifts}
                      keyExtractor={(item) => item.id}
                      renderItem={({ item }) => {
                        const selected = selectedShiftId === item.id;
                        return (
                          <Pressable
                            onPress={() => {
                              setSelectedShiftId(item.id);
                              setShowShiftModal(false);
                            }}
                            style={[
                              styles.shiftOption,
                              {
                                backgroundColor: selected ? palette.tint + '22' : 'transparent',
                                borderColor: selected ? palette.tint : 'transparent',
                              },
                            ]}>
                            <View style={{ flex: 1 }}>
                              <ThemedText style={{ fontSize: 15, fontWeight: '700' }}>{item.location || 'Unknown Location'}</ThemedText>
                              {item.start_time ? (
                                <ThemedText style={{ color: palette.muted, fontSize: 13, marginTop: 2 }}>
                                  {new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  {item.end_time ? ` - ${new Date(item.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                                </ThemedText>
                              ) : null}
                            </View>
                            {selected ? <MaterialIcons name="check-circle" size={22} color={palette.tint} /> : null}
                          </Pressable>
                        );
                      }}
                    />
                  )}
                </View>
              </Pressable>
            </Modal>

            <View style={styles.checkRow}>
              <Pressable
                disabled={actionLoading !== null}
                onPress={() => handleCheckAction('checkin')}
                style={({ pressed }) => [
                  styles.checkButton,
                  { backgroundColor: palette.success + '22', borderColor: palette.success },
                  pressed && styles.pressed,
                ]}>
                <View style={[styles.checkIconWrap, { backgroundColor: palette.success + '26' }]}>
                  <MaterialIcons name="login" size={18} color={palette.success} />
                </View>
                <View style={styles.checkTextBlock}>
                  <ThemedText style={{ color: palette.success, fontSize: 14, fontWeight: '900' }}>
                    {actionLoading === 'checkin' ? 'Checking in...' : 'Check In'}
                  </ThemedText>
                  <ThemedText style={{ color: palette.muted, fontSize: 12, lineHeight: 17 }}>
                    Start assigned shift attendance
                  </ThemedText>
                </View>
              </Pressable>

              <Pressable
                disabled={actionLoading !== null}
                onPress={() => handleCheckAction('checkout')}
                style={({ pressed }) => [
                  styles.checkButton,
                  { backgroundColor: palette.danger + '22', borderColor: palette.danger },
                  pressed && styles.pressed,
                ]}>
                <View style={[styles.checkIconWrap, { backgroundColor: palette.danger + '26' }]}>
                  <MaterialIcons name="logout" size={18} color={palette.danger} />
                </View>
                <View style={styles.checkTextBlock}>
                  <ThemedText style={{ color: palette.danger, fontSize: 14, fontWeight: '900' }}>
                    {actionLoading === 'checkout' ? 'Checking out...' : 'Check Out'}
                  </ThemedText>
                  <ThemedText style={{ color: palette.muted, fontSize: 12, lineHeight: 17 }}>
                    Finish the active shift safely
                  </ThemedText>
                </View>
              </Pressable>
            </View>
          </>
        ) : null}

        <View style={styles.recordList}>
          {filteredAttendance.map((person) => (
            <View key={person.id} style={[styles.recordCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
              <View style={styles.recordHeading}>
                <View style={styles.recordHeadingText}>
                  <ThemedText style={styles.recordName}>{person.name}</ThemedText>
                  <ThemedText style={{ color: palette.muted, fontSize: 12, marginTop: 4 }}>
                    Check in {person.checkIn} - Check out {person.checkOut}
                  </ThemedText>
                </View>
                <View style={[styles.statusPill, { backgroundColor: statusBackground(person.status, palette) }]}>
                  <ThemedText style={{ color: statusText(person.status, palette), fontSize: 11, fontWeight: '800' }}>
                    {person.status.toUpperCase()}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.recordMetaRow}>
                <View style={styles.metaItem}>
                  <ThemedText style={{ color: palette.muted, fontSize: 12 }}>Duration</ThemedText>
                  <ThemedText style={{ color: palette.text, fontWeight: '800' }}>{person.duration}</ThemedText>
                </View>
                <View style={styles.metaItem}>
                  <ThemedText style={{ color: palette.muted, fontSize: 12 }}>Zone</ThemedText>
                  <ThemedText style={{ color: palette.text, fontWeight: '800' }}>—</ThemedText>
                </View>
              </View>
            </View>
          ))}
        </View>

        {filteredAttendance.length === 0 ? (
          <View style={{ marginTop: 18, borderWidth: 1, borderRadius: 22, padding: 28, alignItems: 'center', justifyContent: 'center', borderColor: palette.border, backgroundColor: palette.surfaceElevated }}>
            <MaterialIcons name="event-busy" size={32} color={palette.muted} />
            <ThemedText style={{ color: palette.muted, marginTop: 10, fontSize: 14 }}>No attendance records for {selectedDate}</ThemedText>
          </View>
        ) : null}

        <View style={[styles.summaryCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
          <ThemedText type="subtitle">Daily Summary</ThemedText>
          <View style={styles.summaryGrid}>
            {[
              { label: 'Average Check In Time', value: filteredAttendance.length > 0 ? filteredAttendance[0].checkIn : '-' },
              { label: 'Average Check Out Time', value: filteredAttendance.find(a => a.checkOut !== '-')?.checkOut || '-' },
              {
                label: 'Attendance Rate',
                value: stats.total > 0 ? `${Math.round((stats.present / stats.total) * 100)}%` : '0%',
                tone: palette.success
              },
            ].map((item) => (
              <View key={item.label} style={[styles.summaryItem, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                <ThemedText style={{ color: palette.muted, fontSize: 12, lineHeight: 18 }}>{item.label}</ThemedText>
                <ThemedText style={{ color: item.tone ?? palette.text, fontSize: 24, fontWeight: '800', marginTop: 8 }}>
                  {item.value}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function statusBackground(status: AttendanceRecord['status'], palette: Palette) {
  switch (status) {
    case 'Present':
      return palette.success + '22';
    case 'Late':
      return palette.warning + '22';
    default:
      return palette.danger + '22';
  }
}

function statusText(status: AttendanceRecord['status'], palette: Palette) {
  switch (status) {
    case 'Present':
      return palette.success;
    case 'Late':
      return palette.warning;
    default:
      return palette.danger;
  }
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 120 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
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
  headerBlock: { marginBottom: 8 },
  fieldGroup: { gap: 8, marginTop: 8 },
  label: { fontSize: 12, fontWeight: '700' },
  dateRow: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dateInput: {
    flex: 1,
    fontSize: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  statCard: {
    width: '47.5%',
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
  },
  checkRow: {
    gap: 10,
    marginTop: 16,
  },
  checkButton: {
    minHeight: 64,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  checkIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkTextBlock: {
    flex: 1,
    gap: 2,
  },
  recordList: {
    gap: 12,
    marginTop: 18,
  },
  recordCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 14,
  },
  recordHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  recordHeadingText: {
    flex: 1,
  },
  recordName: {
    fontSize: 15,
    fontWeight: '800',
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  recordMetaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 12,
    marginTop: 18,
  },
  summaryGrid: {
    gap: 12,
  },
  summaryItem: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 32,
  },
  modalContent: {
    width: '100%',
    maxHeight: '60%',
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
  },
  shiftOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    marginVertical: 4,
    borderWidth: 1,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
});
