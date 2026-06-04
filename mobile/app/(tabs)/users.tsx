import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState, useEffect } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { roleProfiles } from '@/constants/mineops';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';


import { globalAuthToken, loadAuthState } from '@/constants/auth';
import { apiFetchWithFallback, getApiErrorMessage, readApiJson } from '@/constants/api';
import { toApiRole } from '@/constants/roles';

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
const CREATE_ROLES: UserRole[] = ['Worker', 'Supervisor', 'Safety Officer', 'Administrator'];
const ROLE_LABEL_TO_API: Record<UserRole, string> = {
  Worker: 'worker',
  Supervisor: 'supervisor',
  'Safety Officer': 'safety_officer',
  Administrator: 'admin',
};
const API_ROLE_TO_LABEL: Record<string, UserRole> = {
  worker: 'Worker',
  supervisor: 'Supervisor',
  safety_officer: 'Safety Officer',
  admin: 'Administrator',
};
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function UsersScreen() {
  useProtectedRoute(['admin', 'authority']);

  const colorScheme = useColorScheme() ?? 'dark';
  const palette = Colors[colorScheme];
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();
  const roleValue = Array.isArray(params.role) ? params.role[0] : params.role;
  const selectedRole = roleProfiles.find((role) => role.key === roleValue) ?? roleProfiles[0];

  const [showCreate, setShowCreate] = useState(false);
  const [filterRole, setFilterRole] = useState<'all' | UserRole>('all');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('Worker');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingUser, setIsCreatingUser] = useState(false);


  useEffect(() => {
    async function fetchUsers() {
      let authToken = globalAuthToken;
      if (!authToken) {
        const { token } = await loadAuthState();
        authToken = token;
      }

      if (!authToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await apiFetchWithFallback('/api/users/workers', {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const contentType = res.headers.get('content-type');
        if (!res.ok || !contentType || !contentType.includes('application/json')) {
          console.warn('Users endpoint not available, using local data');
          return;
        }

        const data = await readApiJson<{ status?: string; data?: any[] }>(res);
        if (data?.status === 'success') {
          const mappedUsers = (data.data || []).map((u: any) => ({
            id: u.id,
            name: u.name || 'Unknown',
            email: u.email || '',
            role: API_ROLE_TO_LABEL[u.role] || 'Worker',
            status: u.status || 'Active',
            lastActive: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A',
          }));
          setUsers(mappedUsers);
        }
      } catch (err) {
        console.error('Failed to fetch users', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return filterRole === 'all' ? users : users.filter((user) => {
      return user.role === filterRole;
    });
  }, [filterRole, users]);

  const canCreate = selectedRole.key === 'admin' || selectedRole.key === 'authority';

  const resetCreateForm = () => {
    setFullName('');
    setEmail('');
    setEmployeeId('');
    setTemporaryPassword('');
    setNewUserRole('Worker');
  };

  const handleCreateUser = async () => {
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const password = temporaryPassword.trim() || employeeId.trim();
    const apiRole = toApiRole(ROLE_LABEL_TO_API[newUserRole]) || ROLE_LABEL_TO_API[newUserRole];

    if (!trimmedName || !trimmedEmail || !password) {
      Alert.alert('Missing Fields', 'Please enter name, email, and a temporary password or employee ID.');
      return;
    }

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Temporary password must be at least 6 characters.');
      return;
    }

    try {
      setIsCreatingUser(true);
      const res = await apiFetchWithFallback('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          email: trimmedEmail,
          password,
          role: apiRole,
        }),
      });
      const data = await readApiJson<{ message?: string; user_id?: string; error?: string }>(res);

      if (!res.ok) {
        Alert.alert('Create User Failed', getApiErrorMessage(data, 'Unable to create user.'));
        return;
      }

      const newUser: UserRow = {
        id: data?.user_id || `${trimmedEmail}-${Date.now()}`,
        name: trimmedName,
        email: trimmedEmail,
        role: newUserRole,
        status: 'Active',
        lastActive: 'Today',
      };

      setUsers((current) => [newUser, ...current.filter((user) => user.email !== trimmedEmail)]);
      resetCreateForm();
      setShowCreate(false);
      Alert.alert('Success', 'User created successfully.');
    } catch (error) {
      Alert.alert('Create User Failed', error instanceof Error ? error.message : 'Network request failed.');
    } finally {
      setIsCreatingUser(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView
        style={{ backgroundColor: palette.background }}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: palette.background }]}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.topRow, { borderBottomColor: palette.border }]}>
          <Pressable
            onPress={() => router.replace({ pathname: '/dashboard/[role]', params: { role: selectedRole.key } })}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: palette.surfaceElevated, borderColor: palette.border },
              pressed && styles.pressed,
            ]}>
            <MaterialIcons name="arrow-back" size={18} color={palette.text} />
          </Pressable>

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
              <TextInput value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={palette.muted} autoCapitalize="none" keyboardType="email-address" style={[styles.input, { backgroundColor: palette.surface, borderColor: palette.border, color: palette.text }]} />
              <TextInput value={employeeId} onChangeText={setEmployeeId} placeholder="Employee ID" placeholderTextColor={palette.muted} style={[styles.input, { backgroundColor: palette.surface, borderColor: palette.border, color: palette.text }]} />
              <TextInput value={temporaryPassword} onChangeText={setTemporaryPassword} placeholder="Temporary Password" placeholderTextColor={palette.muted} secureTextEntry style={[styles.input, { backgroundColor: palette.surface, borderColor: palette.border, color: palette.text }]} />
              <View style={styles.roleChips}>
                {CREATE_ROLES.map((item) => {
                  const selected = newUserRole === item;
                  return (
                    <Pressable
                      key={item}
                      onPress={() => setNewUserRole(item)}
                      style={({ pressed }) => [
                        styles.roleChip,
                        {
                          backgroundColor: selected ? palette.tint : palette.surface,
                          borderColor: selected ? palette.tint : palette.border,
                        },
                        pressed && styles.pressed,
                      ]}>
                      <ThemedText style={{ color: selected ? '#111111' : palette.text, fontSize: 12, fontWeight: '800' }}>{item}</ThemedText>
                    </Pressable>
                  );
                })}
              </View>
              <Pressable
                onPress={handleCreateUser}
                disabled={isCreatingUser}
                style={({ pressed }) => [styles.secondaryButton, { backgroundColor: palette.surface, borderColor: palette.border }, pressed && styles.pressed]}>
                <ThemedText style={{ color: palette.text, fontSize: 14, fontWeight: '800' }}>
                  {isCreatingUser ? 'Creating...' : 'Create User'}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        ) : null}

        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ThemedText style={{ color: palette.muted, fontSize: 14 }}>Loading users...</ThemedText>
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
