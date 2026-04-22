import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { roleProfiles } from '@/constants/mineops';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';

type Palette = typeof Colors.dark;
type LogType = 'auth' | 'incident' | 'user' | 'alert' | 'system';
type LogStatus = 'success' | 'pending';

type LogRow = {
  id: number;
  time: string;
  user: string;
  action: string;
  type: LogType;
  status: LogStatus;
};

const LOGS: LogRow[] = [
  { id: 1, time: '14:32', user: 'R. Das', action: 'Login', type: 'auth', status: 'success' },
  { id: 2, time: '14:35', user: 'R. Das', action: 'Incident Report Created', type: 'incident', status: 'success' },
  { id: 3, time: '14:45', user: 'System', action: 'Emergency Alert Triggered', type: 'alert', status: 'success' },
  { id: 4, time: '15:00', user: 'M. Khan', action: 'Role Change Request', type: 'user', status: 'pending' },
  { id: 5, time: '15:15', user: 'Safety Officer', action: 'Incident Approved', type: 'incident', status: 'success' },
  { id: 6, time: '16:00', user: 'Admin', action: 'User Suspended', type: 'user', status: 'success' },
  { id: 7, time: '16:30', user: 'System', action: 'Database Backup', type: 'system', status: 'success' },
];

const FILTERS: ('all' | LogType)[] = ['all', 'auth', 'incident', 'user', 'alert', 'system'];

export default function LogsScreen() {
  useProtectedRoute(['admin', 'authority']);

  const colorScheme = useColorScheme() ?? 'dark';
  const palette = Colors[colorScheme];
  const params = useLocalSearchParams<{ role?: string }>();
  const roleValue = Array.isArray(params.role) ? params.role[0] : params.role;
  const selectedRole = roleProfiles.find((role) => role.key === roleValue) ?? roleProfiles[0];

  const [filterType, setFilterType] = useState<'all' | LogType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = useMemo(() => {
    return LOGS.filter((log) => {
      const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) || log.user.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || log.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [filterType, searchTerm]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView
        style={{ backgroundColor: palette.background }}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: palette.background }]}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.topRow, { borderBottomColor: palette.border }]}>
          <Link href={{ pathname: '/dashboard/[role]', params: { role: selectedRole.key } }} asChild>
            <Pressable style={({ pressed }) => [styles.backButton, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }, pressed && styles.pressed]}>
              <MaterialIcons name="arrow-back" size={18} color={palette.text} />
            </Pressable>
          </Link>

          <View style={styles.topMeta}>
            <ThemedText type="subtitle" style={styles.brand}>MineOps</ThemedText>
            <ThemedText style={{ color: palette.muted, fontSize: 13, lineHeight: 18 }}>{selectedRole.label} admin</ThemedText>
          </View>
        </View>

        <View style={styles.headerBlock}>
          <ThemedText type="title">System Logs</ThemedText>
          <ThemedText style={{ color: palette.muted, fontSize: 15, lineHeight: 22, marginTop: 10 }}>Audit trail and activity logs</ThemedText>
        </View>

        <View style={styles.searchSection}>
          <View style={[styles.searchRow, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
            <MaterialIcons name="search" size={18} color={palette.muted} />
            <TextInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Search logs..."
              placeholderTextColor={palette.muted}
              style={[styles.searchInput, { color: palette.text }]}
            />
          </View>

          <View style={styles.filterWrap}>
            {FILTERS.map((type) => {
              const selected = filterType === type;
              return (
                <Pressable
                  key={type}
                  onPress={() => setFilterType(type)}
                  style={({ pressed }) => [
                    styles.filterChip,
                    {
                      backgroundColor: selected ? palette.tint : palette.surfaceElevated,
                      borderColor: selected ? palette.tint : palette.border,
                    },
                    pressed && styles.pressed,
                  ]}>
                  <ThemedText style={{ color: selected ? '#111111' : palette.text, fontSize: 11, fontWeight: '800' }}>{type.toUpperCase()}</ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.listBlock}>
          {filteredLogs.map((log) => (
            <View key={log.id} style={[styles.logCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
              <View style={styles.logHeader}>
                <ThemedText style={styles.logTime}>{log.time}</ThemedText>
                <View style={[styles.typePill, { backgroundColor: typeBackground(log.type, palette) }]}>
                  <ThemedText style={{ color: typeText(log.type, palette), fontSize: 11, fontWeight: '800' }}>{log.type.toUpperCase()}</ThemedText>
                </View>
              </View>
              <ThemedText style={{ color: palette.text, fontSize: 14, fontWeight: '800', marginTop: 8 }}>{log.action}</ThemedText>
              <ThemedText style={{ color: palette.muted, fontSize: 12, lineHeight: 18, marginTop: 4 }}>{log.user}</ThemedText>

              <View style={styles.logFooter}>
                <View style={[styles.statusPill, { backgroundColor: statusBackground(log.status, palette) }]}>
                  <ThemedText style={{ color: statusText(log.status, palette), fontSize: 11, fontWeight: '800' }}>{log.status.toUpperCase()}</ThemedText>
                </View>
                <Pressable style={({ pressed }) => [styles.detailButton, { backgroundColor: palette.surface, borderColor: palette.border }, pressed && styles.pressed]}>
                  <ThemedText style={{ color: palette.text, fontSize: 12, fontWeight: '800' }}>View</ThemedText>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.paginationRow}>
          <ThemedText style={{ color: palette.muted, fontSize: 13 }}>Showing {filteredLogs.length} of {LOGS.length} logs</ThemedText>
          <View style={styles.pageButtons}>
            <Pressable style={({ pressed }) => [styles.pageButton, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }, pressed && styles.pressed]}>
              <ThemedText style={{ color: palette.text, fontSize: 12, fontWeight: '800' }}>Previous</ThemedText>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.pageButton, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }, pressed && styles.pressed]}>
              <ThemedText style={{ color: palette.text, fontSize: 12, fontWeight: '800' }}>Next</ThemedText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function typeBackground(type: LogType, palette: Palette) {
  switch (type) {
    case 'auth':
      return '#3b82f622';
    case 'incident':
      return palette.danger + '22';
    case 'user':
      return '#a855f722';
    case 'alert':
      return palette.tint + '22';
    default:
      return palette.success + '22';
  }
}

function typeText(type: LogType, palette: Palette) {
  switch (type) {
    case 'auth':
      return '#60a5fa';
    case 'incident':
      return palette.danger;
    case 'user':
      return '#d8b4fe';
    case 'alert':
      return palette.tint;
    default:
      return palette.success;
  }
}

function statusBackground(status: LogStatus, palette: Palette) {
  return status === 'success' ? palette.success + '22' : palette.warning + '22';
}

function statusText(status: LogStatus, palette: Palette) {
  return status === 'success' ? palette.success : palette.warning;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 120 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  backButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  topMeta: { alignItems: 'flex-end', flex: 1 },
  brand: { marginBottom: 2 },
  headerBlock: { marginBottom: 14 },
  searchSection: { gap: 12, marginTop: 16 },
  searchRow: { minHeight: 50, borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchInput: { flex: 1, fontSize: 15 },
  filterWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  filterChip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  listBlock: { gap: 12, marginTop: 18 },
  logCard: { borderWidth: 1, borderRadius: 22, padding: 16, gap: 8 },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  logTime: { fontSize: 12, fontWeight: '800', color: '#94a3b8', fontFamily: 'monospace' },
  typePill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  logFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  statusPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  detailButton: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  paginationRow: { gap: 12, marginTop: 18 },
  pageButtons: { flexDirection: 'row', gap: 10 },
  pageButton: { flex: 1, borderWidth: 1, borderRadius: 14, alignItems: 'center', justifyContent: 'center', minHeight: 46 },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
});