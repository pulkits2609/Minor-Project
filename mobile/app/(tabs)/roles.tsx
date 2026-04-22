import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { roleProfiles } from '@/constants/mineops';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';

const ROLE_DETAILS = [
  { name: 'Worker', level: 1, permissions: ['Report Incidents', 'View Tasks', 'Check In/Out', 'View Alerts'] },
  { name: 'Supervisor', level: 2, permissions: ['Manage Team', 'Assign Tasks', 'Review Incidents', 'Monitor Alerts'] },
  { name: 'Safety Officer', level: 3, permissions: ['Safety Monitoring', 'Incident Review', 'Hazard Assessment', 'System Oversight'] },
  { name: 'Administrator', level: 4, permissions: ['User Management', 'System Configuration', 'Logs & Audit', 'Role Management'] },
  { name: 'Authority', level: 5, permissions: ['Full System Control', 'Global Override', 'All Permissions', 'Policy Override'] },
];

const MATRIX = [
  { feature: 'Report Incidents', perms: [true, true, true, true, true] },
  { feature: 'View Tasks', perms: [true, true, true, true, true] },
  { feature: 'Manage Team', perms: [false, true, true, true, true] },
  { feature: 'Review Incidents', perms: [false, true, true, true, true] },
  { feature: 'System Logs', perms: [false, false, false, true, true] },
  { feature: 'User Management', perms: [false, false, false, true, true] },
  { feature: 'Global Override', perms: [false, false, false, false, true] },
];

export default function RolesScreen() {
  useProtectedRoute(['admin']);

  const colorScheme = useColorScheme() ?? 'dark';
  const palette = Colors[colorScheme];
  const params = useLocalSearchParams<{ role?: string }>();
  const roleValue = Array.isArray(params.role) ? params.role[0] : params.role;
  const selectedRole = roleProfiles.find((role) => role.key === roleValue) ?? roleProfiles[0];
  const showMatrix = selectedRole.key !== 'admin';

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
          <ThemedText type="title">Role Management</ThemedText>
          <ThemedText style={{ color: palette.muted, fontSize: 15, lineHeight: 22, marginTop: 10 }}>
            Define and manage user roles and permissions
          </ThemedText>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
          <ThemedText type="subtitle">Role Hierarchy</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hierarchyRow}>
            {ROLE_DETAILS.map((item) => (
              <View key={item.name} style={[styles.hierarchyPill, { borderColor: palette.border, backgroundColor: palette.surface }]}>
                <ThemedText style={styles.hierarchyName}>{item.name}</ThemedText>
                <ThemedText style={{ color: palette.muted, fontSize: 11, marginTop: 2 }}>Level {item.level}</ThemedText>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.roleList}>
          {ROLE_DETAILS.map((roleItem) => (
            <View key={roleItem.name} style={[styles.roleCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
              <View style={styles.roleHeader}>
                <View>
                  <View style={styles.roleTitleRow}>
                    <MaterialIcons name="security" size={18} color={palette.tint} />
                    <ThemedText type="subtitle">{roleItem.name}</ThemedText>
                  </View>
                  <ThemedText style={{ color: palette.muted, fontSize: 12, marginTop: 4 }}>Level {roleItem.level}</ThemedText>
                </View>
              </View>

              <View style={styles.permissionList}>
                <ThemedText style={styles.permissionLabel}>Permissions:</ThemedText>
                {roleItem.permissions.map((permission) => (
                  <View key={permission} style={styles.permissionRow}>
                    <MaterialIcons name="check-circle" size={14} color={palette.success} />
                    <ThemedText style={{ color: palette.text, fontSize: 13, lineHeight: 19 }}>{permission}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {showMatrix ? (
          <View style={[styles.sectionCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
            <ThemedText type="subtitle">Permission Matrix</ThemedText>
            <View style={styles.matrixList}>
              {MATRIX.map((item) => (
                <View key={item.feature} style={[styles.matrixRow, { borderBottomColor: palette.border }]}>
                  <ThemedText style={styles.matrixFeature}>{item.feature}</ThemedText>
                  <View style={styles.matrixFlags}>
                    {item.perms.map((allowed, index) => (
                      <View key={index} style={[styles.matrixFlag, { backgroundColor: allowed ? palette.success + '22' : palette.surface }]}>
                        <ThemedText style={{ color: allowed ? palette.success : palette.muted, fontSize: 11, fontWeight: '800' }}>
                          {allowed ? '✓' : '✕'}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.matrixLegend}>
              {['Worker', 'Supervisor', 'Safety', 'Admin', 'Authority'].map((label) => (
                <ThemedText key={label} style={{ color: palette.muted, fontSize: 11, fontWeight: '700' }}>{label}</ThemedText>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 120 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  backButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  pressed: { opacity: 0.75 },
  topMeta: { alignItems: 'flex-end', flex: 1 },
  brand: { marginBottom: 2 },
  headerBlock: { marginBottom: 14 },
  sectionCard: { borderWidth: 1, borderRadius: 22, padding: 16, gap: 12, marginTop: 16 },
  hierarchyRow: { gap: 10, paddingTop: 2 },
  hierarchyPill: { minWidth: 130, borderWidth: 1, borderRadius: 18, padding: 14 },
  hierarchyName: { fontSize: 14, fontWeight: '800' },
  roleList: { gap: 12, marginTop: 18 },
  roleCard: { borderWidth: 1, borderRadius: 22, padding: 16, gap: 14 },
  roleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  roleTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  permissionList: { gap: 8 },
  permissionLabel: { color: '#94a3b8', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  permissionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  matrixList: { marginTop: 10 },
  matrixRow: { borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 12, gap: 10 },
  matrixFeature: { fontSize: 13, fontWeight: '800' },
  matrixFlags: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  matrixFlag: { flex: 1, minHeight: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  matrixLegend: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
});