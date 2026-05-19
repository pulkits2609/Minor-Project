import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View, ActivityIndicator, Platform, Alert } from 'react-native';
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
  const params = useLocalSearchParams<{ role?: string }>();
  const roleValue = Array.isArray(params.role) ? params.role[0] : params.role;
  const selectedRole = roleProfiles.find((role) => role.key === roleValue) ?? roleProfiles[0];

  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const selectedDate = date.toISOString().split('T')[0];

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<'checkin' | 'checkout' | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!globalAuthToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await apiFetchWithFallback('/api/attendance', {
          headers: { Authorization: `Bearer ${globalAuthToken}` },
        });
        const data = await readApiJson<ApiListResponse<any>>(res);

        if (res.ok && data?.status === 'success') {
          setAttendance((data.data || []).map(mapAttendanceRecord));
        }

      } catch (err) {
        console.error('Failed to fetch attendance', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const stats = {
    present: attendance.filter((item) => item.status === 'Present' || item.status === 'Late').length,
    late: attendance.filter((item) => item.status === 'Late').length,
    absent: attendance.filter((item) => item.status === 'Absent').length,
    total: attendance.length,
  };

  const handleCheckAction = async (type: 'checkin' | 'checkout') => {
    if (!globalAuthToken || actionLoading) return;

    setActionLoading(type);
    try {
      const shiftRes = await apiFetchWithFallback('/api/shifts', {
        headers: { Authorization: `Bearer ${globalAuthToken}` },
      });
      const shiftData = await readApiJson<ApiListResponse<ShiftRecord>>(shiftRes);

      if (!shiftRes.ok || shiftData?.status !== 'success') {
        Alert.alert(
          'Shift Error',
          getApiErrorMessage(
            shiftData,
            shiftRes.status >= 500
              ? 'Unable to load shifts. Please sign in again if your session has expired.'
              : 'Unable to load shifts.'
          )
        );
        return;
      }

      const assignedShifts = shiftData.data || [];
      const activeAttendance = attendance.find((record) => record.shiftId && record.checkOut === '-' && isToday(record.date));

      if (type === 'checkout' && !activeAttendance) {
        Alert.alert('No Active Check-In', 'Please check in before checking out.');
        return;
      }

      if (type === 'checkin' && activeAttendance) {
        Alert.alert('Already Checked In', 'Please check out from your active shift before checking in again.');
        return;
      }

      const selectedShiftId = type === 'checkout' ? activeAttendance?.shiftId : assignedShifts[0]?.id;

      if (!selectedShiftId) {
        Alert.alert('No Assigned Shift', 'No assigned shifts are available for this action.');
        return;
      }

      const res = await apiFetchWithFallback(`/api/attendance/${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${globalAuthToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ shift_id: selectedShiftId })
      });
      const data = await readApiJson<{ status?: string; error?: string; message?: string }>(res);

      if (res.ok && data?.status === 'success') {
        Alert.alert('Success', `Successfully ${type === 'checkin' ? 'checked in' : 'checked out'}!`);
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
                <MaterialIcons name="login" size={16} color={palette.success} />
              </View>
              <ThemedText style={{ color: palette.success, fontSize: 13, fontWeight: '800' }}>
                {actionLoading === 'checkin' ? 'Checking In...' : 'Check In'}
              </ThemedText>
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
                <MaterialIcons name="logout" size={16} color={palette.danger} />
              </View>
              <ThemedText style={{ color: palette.danger, fontSize: 13, fontWeight: '800' }}>
                {actionLoading === 'checkout' ? 'Checking Out...' : 'Check Out'}
              </ThemedText>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.recordList}>
          {attendance.map((person) => (
            <View key={person.id} style={[styles.recordCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
              <View style={styles.recordHeading}>
                <View>
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

        <View style={[styles.summaryCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
          <ThemedText type="subtitle">Daily Summary</ThemedText>
          <View style={styles.summaryGrid}>
            {[
              { label: 'Average Check In Time', value: attendance.length > 0 ? attendance[0].checkIn : '-' },
              { label: 'Average Check Out Time', value: attendance.find(a => a.checkOut !== '-')?.checkOut || '-' },
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
    width: '48%',
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
  },
  checkRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  checkButton: {
    flex: 1,
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  checkIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
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
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
});
