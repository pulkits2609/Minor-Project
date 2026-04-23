import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalAuthToken } from '@/constants/auth';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { roleProfiles } from '@/constants/mineops';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';

type Palette = typeof Colors.dark;

type AttendanceRecord = {
  id: number;
  name: string;
  checkIn: string;
  checkOut: string;
  status: 'Present' | 'Late' | 'Absent';
  duration: string;
};



export default function AttendanceScreen() {
  useProtectedRoute(['worker', 'supervisor', 'admin', 'authority']);

  const colorScheme = useColorScheme() ?? 'dark';
  const palette = Colors[colorScheme];
  const params = useLocalSearchParams<{ role?: string }>();
  const roleValue = Array.isArray(params.role) ? params.role[0] : params.role;
  const selectedRole = roleProfiles.find((role) => role.key === roleValue) ?? roleProfiles[0];

  const [selectedDate, setSelectedDate] = useState('2026-04-19');

  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!globalAuthToken) return;
      try {
        const res = await fetch('https://api.pulkitworks.info:5000/api/attendance', {
          headers: { Authorization: `Bearer ${globalAuthToken}` },
        });
        const data = await res.json();
        
        if (data.status === 'success') {
          // data.data should be the list of attendance records from the backend
          const rawAttendance = data.data || [];
          const mapped = rawAttendance.map((item: any) => ({
            id: item.id,
            name: item.user_name || item.name || 'Worker',
            checkIn: item.check_in_time || item.check_in || '—',
            checkOut: item.check_out_time || item.check_out || '—',
            status: (item.status?.charAt(0).toUpperCase() + item.status?.slice(1)) || 'Present',
            duration: item.duration || '—'
          }));
          setAttendance(mapped);
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
          <View style={[styles.dateRow, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
            <MaterialIcons name="event" size={18} color={palette.tint} />
            <TextInput
              value={selectedDate}
              onChangeText={setSelectedDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={palette.muted}
              style={[styles.dateInput, { color: palette.text }]}
            />
          </View>
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
              style={({ pressed }) => [
                styles.checkButton,
                { backgroundColor: palette.success + '22', borderColor: palette.success },
                pressed && styles.pressed,
              ]}>
              <MaterialIcons name="login" size={18} color={palette.success} />
              <ThemedText style={{ color: palette.success, fontSize: 13, fontWeight: '800' }}>Check In</ThemedText>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.checkButton,
                { backgroundColor: palette.danger + '22', borderColor: palette.danger },
                pressed && styles.pressed,
              ]}>
              <MaterialIcons name="logout" size={18} color={palette.danger} />
              <ThemedText style={{ color: palette.danger, fontSize: 13, fontWeight: '800' }}>Check Out</ThemedText>
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
                    Check in {person.checkIn} • Check out {person.checkOut}
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
              { label: 'Average Check In Time', value: attendance.length > 0 ? attendance[0].checkIn : '—' },
              { label: 'Average Check Out Time', value: attendance.find(a => a.checkOut !== '—')?.checkOut || '—' },
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
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexDirection: 'row',
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
