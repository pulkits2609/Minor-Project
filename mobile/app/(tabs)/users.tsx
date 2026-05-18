import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useLocalSearchParams } from 'expo-router';
import { useMemo, useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { roleProfiles } from '@/constants/mineops';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';


import { globalAuthToken } from '@/constants/auth';

type UserStatus = 'Active' | 'Suspended';
type UserRole = 'Worker' | 'Supervisor' | 'Safety Officer' | 'Administrator';

type UserRow = {
  id: string | number;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  lastActive: string;
};

const ROLE_FILTERS: ('all' | UserRole)[] = ['all', 'Worker', 'Supervisor', 'Safety Officer', 'Administrator'];

export default function UsersScreen() {
  useProtectedRoute(['admin', 'authority']);

  const colorScheme = useColorScheme() ?? 'dark';
  const palette = Colors[colorScheme];
  const params = useLocalSearchParams<{ role?: string }>();
  const roleValue = Array.isArray(params.role) ? params.role[0] : params.role;
  const selectedRole = roleProfiles.find((role) => role.key === roleValue) ?? roleProfiles[0];

  const [showCreate, setShowCreate] = useState(false);
  const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [users, setUsers] = useState<UserRow[]>([]);


  useEffect(() => {
    async function fetchUsers() {
      if (!globalAuthToken) return;
      try {
        const res = await fetch('https://api.pulkitworks.info/api/users/workers', {
          headers: { Authorization: `Bearer ${globalAuthToken}` },
        });

        const contentType = res.headers.get('content-type');
        if (!res.ok || !contentType || !contentType.includes('application/json')) {
          console.warn('Users endpoint not available, using local data');
          return;
        }

        const data = await res.json();
        if (data.status === 'success') {
          const mappedUsers = data.data.map((u: any) => ({
            id: u.id,
            name: u.name || 'Unknown',
            email: u.email || '',
            role: u.role || 'worker',
            status: u.status || 'Active',
            lastActive: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A',
          }));
          setUsers(mappedUsers);
        }
      } catch (err) {
        console.error('Failed to fetch users', err);
      }
    }
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return filterRole === 'all' ? users : users.filter((user) => user.role === filterRole.toLowerCase() || user.role === filterRole);
  }, [filterRole, users]);

  const canCreate = selectedRole.key === 'admin' || selectedRole.key === 'authority';

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
            <ThemedText type="subtitle" style={styles.brand}>MineOps</ThemedText>
            <ThemedText style={{ color: palette.muted, fontSize: 13, lineHeight: 18 }}>{selectedRole.label} admin</ThemedText>
          </View>
        </View>

        <View style={styles.headerBlock}>
          <ThemedText type="title">User Management</ThemedText>
          <ThemedText style={{ color: palette.muted, fontSize: 15, lineHeight: 22, marginTop: 10 }}>
            Manage system users and permissions
          </ThemedText>
        </View>

        {canCreate ? (
          <Pressable
            onPress={() => setShowCreate((previous) => !previous)}
            style={({ pressed }) => [styles.primaryButton, { backgroundColor: palette.tint }, pressed && styles.pressed]}>
            <MaterialIcons name="person-add" size={18} color="#111111" />
            <ThemedText style={styles.primaryButtonText}>Create User</ThemedText>
          </Pressable>
        ) : null}

        {showCreate && canCreate ? (
          <View style={[styles.formCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
            <ThemedText type="subtitle">Add New User</ThemedText>
            <View style={styles.formStack}>
              <TextInput value={fullName} onChangeText={setFullName} placeholder="Full Name" placeholderTextColor={palette.muted} style={[styles.input, { backgroundColor: palette.surface, borderColor: palette.border, color: palette.text }]} />
              <TextInput value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={palette.muted} keyboardType="email-address" style={[styles.input, { backgroundColor: palette.surface, borderColor: palette.border, color: palette.text }]} />
              <TextInput value={employeeId} onChangeText={setEmployeeId} placeholder="Employee ID" placeholderTextColor={palette.muted} style={[styles.input, { backgroundColor: palette.surface, borderColor: palette.border, color: palette.text }]} />
              <View style={styles.roleChips}>
                {['Worker', 'Supervisor', 'Safety Officer', 'Administrator'].map((item) => (
                  <View key={item} style={[styles.roleChip, { backgroundColor: palette.surface, borderColor: palette.border }]}>
                    <ThemedText style={{ color: palette.text, fontSize: 12, fontWeight: '800' }}>{item}</ThemedText>
                  </View>
                ))}
              </View>
              <Pressable style={({ pressed }) => [styles.secondaryButton, { backgroundColor: palette.surface, borderColor: palette.border }, pressed && styles.pressed]}>
                <ThemedText style={{ color: palette.text, fontSize: 14, fontWeight: '800' }}>Create User</ThemedText>
              </Pressable>
            </View>
          </View>
        ) : null}

        <View style={styles.filterWrap}>
          {ROLE_FILTERS.map((item) => {
            const selected = filterRole === item;
            return (
              <Pressable
                key={item}
                onPress={() => setFilterRole(item)}
                style={({ pressed }) => [
                  styles.filterChip,
                  {
                    backgroundColor: selected ? palette.tint : palette.surfaceElevated,
                    borderColor: selected ? palette.tint : palette.border,
                  },
                  pressed && styles.pressed,
                ]}>
                <ThemedText style={{ color: selected ? '#111111' : palette.text, fontSize: 12, fontWeight: '800' }}>
                  {item === 'all' ? 'All' : item}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.listBlock}>
          {filteredUsers.map((user) => (
            <View key={user.id} style={[styles.userCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
              <View style={styles.userHeading}>
                <View>
                  <ThemedText style={styles.userName}>{user.name}</ThemedText>
                  <ThemedText style={{ color: palette.muted, fontSize: 12, lineHeight: 18, marginTop: 4 }}>{user.email}</ThemedText>
                </View>
                <View style={[styles.statusPill, { backgroundColor: user.status === 'Active' ? palette.success + '22' : palette.danger + '22' }]}>
                  <ThemedText style={{ color: user.status === 'Active' ? palette.success : palette.danger, fontSize: 11, fontWeight: '800' }}>
                    {user.status.toUpperCase()}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.userMetaRow}>
                <View style={styles.metaItem}>
                  <ThemedText style={{ color: palette.muted, fontSize: 12 }}>Role</ThemedText>
                  <ThemedText style={{ color: palette.text, fontWeight: '800' }}>{user.role}</ThemedText>
                </View>
                <View style={styles.metaItem}>
                  <ThemedText style={{ color: palette.muted, fontSize: 12 }}>Last Active</ThemedText>
                  <ThemedText style={{ color: palette.text, fontWeight: '800' }}>{user.lastActive}</ThemedText>
                </View>
              </View>

              {canCreate ? (
                <View style={styles.userActions}>
                  <Pressable style={({ pressed }) => [styles.iconButton, { backgroundColor: palette.surface, borderColor: palette.border }, pressed && styles.pressed]}>
                    <MaterialIcons name="edit" size={16} color={palette.text} />
                  </Pressable>
                  <Pressable style={({ pressed }) => [styles.iconButton, { backgroundColor: palette.surface, borderColor: palette.border }, pressed && styles.pressed]}>
                    <MaterialIcons name="delete" size={16} color={palette.danger} />
                  </Pressable>
                </View>
              ) : null}
            </View>
          ))}
        </View>

        <View style={styles.statsGrid}>
          {[
            { label: 'Total Users', value: String(users.length), tone: '#60a5fa', bg: '#60a5fa22' },
            { label: 'Active Users', value: String(users.filter((user) => user.status === 'Active').length), tone: palette.success, bg: palette.success + '22' },
            { label: 'Suspended', value: String(users.filter((user) => user.status === 'Suspended').length), tone: palette.danger, bg: palette.danger + '22' },
            { label: 'Updated', value: 'Today', tone: palette.text, bg: palette.surfaceElevated },
          ].map((item) => (
            <View key={item.label} style={[styles.statCard, { backgroundColor: item.bg, borderColor: palette.border }]}>
              <ThemedText style={{ color: palette.muted, fontSize: 12, marginBottom: 4 }}>{item.label}</ThemedText>
              <ThemedText type="title" style={{ fontSize: 24, lineHeight: 28, color: item.tone }}>{item.value}</ThemedText>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 120 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  backButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  topMeta: { alignItems: 'flex-end', flex: 1 },
  brand: { marginBottom: 2 },
  headerBlock: { marginBottom: 14 },
  primaryButton: { minHeight: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  primaryButtonText: { color: '#111111', fontSize: 14, fontWeight: '800' },
  formCard: { borderWidth: 1, borderRadius: 22, padding: 16, gap: 12, marginTop: 16 },
  formStack: { gap: 10 },
  input: { minHeight: 48, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, fontSize: 14 },
  roleChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  roleChip: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, borderWidth: 1 },
  secondaryButton: { minHeight: 48, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  filterWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  filterChip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  listBlock: { gap: 12, marginTop: 18 },
  userCard: { borderWidth: 1, borderRadius: 22, padding: 16, gap: 14 },
  userHeading: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  userName: { fontSize: 16, fontWeight: '800' },
  statusPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  userMetaRow: { flexDirection: 'row', gap: 12 },
  metaItem: { flex: 1, borderRadius: 16, padding: 12, backgroundColor: 'rgba(255,255,255,0.02)' },
  userActions: { flexDirection: 'row', gap: 10 },
  iconButton: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginTop: 16 },
  statCard: { width: '48%', borderRadius: 22, borderWidth: 1, padding: 16 },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
});