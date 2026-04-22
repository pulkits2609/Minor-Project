import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { roleProfiles } from '@/constants/mineops';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';

type Palette = typeof Colors.dark;
type SettingsTab = 'account' | 'security' | 'notifications';

const SETTINGS_TABS = [
  { id: 'account', label: 'Account', icon: 'person' },
  { id: 'security', label: 'Security', icon: 'lock' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications' },
] as const;

export default function SettingsScreen() {
  useProtectedRoute(); // any logged in user can view their settings

  const colorScheme = useColorScheme() ?? 'dark';
  const palette = Colors[colorScheme];
  const params = useLocalSearchParams<{ role?: string }>();
  const roleValue = Array.isArray(params.role) ? params.role[0] : params.role;
  const selectedRole = roleProfiles.find((role) => role.key === roleValue) ?? roleProfiles[0];

  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [email, setEmail] = useState('user@coalmine.com');
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [twoFactor, setTwoFactor] = useState(true);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView
        style={{ backgroundColor: palette.background }}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: palette.background }]}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.topRow, { borderBottomColor: palette.border }]}>
          <Link href={{ pathname: '/dashboard/[role]', params: { role: selectedRole.key } }} asChild>
            <Pressable
              style={({ pressed }) => [styles.backButton, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }, pressed && styles.pressed]}>
              <MaterialIcons name="arrow-back" size={18} color={palette.text} />
            </Pressable>
          </Link>

          <View style={styles.topMeta}>
            <ThemedText type="subtitle" style={styles.brand}>MineOps</ThemedText>
            <ThemedText style={{ color: palette.muted, fontSize: 13, lineHeight: 18 }}>{selectedRole.label} settings</ThemedText>
          </View>
        </View>

        <View style={styles.headerBlock}>
          <ThemedText type="title">Settings</ThemedText>
          <ThemedText style={{ color: palette.muted, fontSize: 15, lineHeight: 22, marginTop: 10 }}>
            Manage your account and preferences
          </ThemedText>
        </View>

        <View style={styles.tabRow}>
          {SETTINGS_TABS.map((tab) => {
            const selected = activeTab === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setActiveTab(tab.id as SettingsTab)}
                style={({ pressed }) => [
                  styles.tabButton,
                  {
                    backgroundColor: selected ? palette.tint : palette.surfaceElevated,
                    borderColor: selected ? palette.tint : palette.border,
                  },
                  pressed && styles.pressed,
                ]}>
                <MaterialIcons name={tab.icon} size={16} color={selected ? '#111111' : palette.text} />
                <ThemedText style={{ color: selected ? '#111111' : palette.text, fontSize: 12, fontWeight: '800' }}>{tab.label}</ThemedText>
              </Pressable>
            );
          })}
        </View>

        {activeTab === 'account' ? (
          <View style={[styles.panel, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
            <ThemedText type="subtitle">Profile Information</ThemedText>
            <View style={styles.formStack}>
              <View>
                <ThemedText style={styles.fieldLabel}>Full Name</ThemedText>
                <TextInput defaultValue="Rahul Das" placeholderTextColor={palette.muted} style={[styles.input, { backgroundColor: palette.surface, borderColor: palette.border, color: palette.text }]} />
              </View>
              <View>
                <ThemedText style={styles.fieldLabel}>Email</ThemedText>
                <TextInput value={email} onChangeText={setEmail} keyboardType="email-address" placeholderTextColor={palette.muted} style={[styles.input, { backgroundColor: palette.surface, borderColor: palette.border, color: palette.text }]} />
              </View>
              <View>
                <ThemedText style={styles.fieldLabel}>Employee ID</ThemedText>
                <TextInput editable={false} defaultValue="EMP-001" style={[styles.input, styles.disabledInput, { backgroundColor: palette.surface, borderColor: palette.border, color: palette.muted }]} />
              </View>
              <View>
                <ThemedText style={styles.fieldLabel}>Role</ThemedText>
                <TextInput editable={false} defaultValue={selectedRole.label} style={[styles.input, styles.disabledInput, { backgroundColor: palette.surface, borderColor: palette.border, color: palette.muted }]} />
              </View>
              <Pressable style={({ pressed }) => [styles.primaryButton, { backgroundColor: palette.tint }, pressed && styles.pressed]}>
                <ThemedText style={styles.primaryButtonText}>Save Changes</ThemedText>
              </Pressable>
            </View>
          </View>
        ) : null}

        {activeTab === 'security' ? (
          <View style={[styles.panel, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
            <ThemedText type="subtitle">Security Settings</ThemedText>
            <View style={styles.settingList}>
              <SettingRow
                title="Two-Factor Authentication"
                description="Add an extra layer of security"
                right={<Switch value={twoFactor} onValueChange={setTwoFactor} trackColor={{ false: palette.border, true: palette.success }} thumbColor={twoFactor ? '#111111' : '#f4f3f4'} />}
                palette={palette}
              />
              <SettingRow
                title="Password"
                description="Change your password"
                right={<Pressable style={({ pressed }) => [styles.secondaryButton, { backgroundColor: palette.surface, borderColor: palette.border }, pressed && styles.pressed]}><ThemedText style={{ color: palette.text, fontSize: 12, fontWeight: '800' }}>Change</ThemedText></Pressable>}
                palette={palette}
              />
              <View style={styles.dangerZone}>
                <ThemedText style={{ color: palette.danger, fontSize: 14, fontWeight: '800', marginBottom: 4 }}>Danger Zone</ThemedText>
                <Pressable style={({ pressed }) => [styles.logoutButton, { backgroundColor: palette.danger + '22', borderColor: palette.danger }, pressed && styles.pressed]}>
                  <ThemedText style={{ color: palette.danger, fontSize: 12, fontWeight: '800' }}>Logout All Sessions</ThemedText>
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}

        {activeTab === 'notifications' ? (
          <View style={[styles.panel, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
            <ThemedText type="subtitle">Notification Preferences</ThemedText>
            <View style={styles.settingList}>
              {[
                { label: 'Critical Alerts', desc: 'Immediate notification for critical safety alerts', value: notifications, setter: setNotifications },
                { label: 'Incident Reports', desc: 'Notifications when incidents are reported', value: emailAlerts, setter: setEmailAlerts },
                { label: 'Task Updates', desc: 'Updates on assigned tasks', value: true },
                { label: 'System Maintenance', desc: 'Scheduled maintenance notifications', value: true },
                { label: 'Weekly Reports', desc: 'Weekly summary reports', value: true },
                { label: 'Email Notifications', desc: 'Receive notifications via email', value: emailAlerts, setter: setEmailAlerts },
              ].map((item) => (
                <SettingRow
                  key={item.label}
                  title={item.label}
                  description={item.desc}
                  right={<Switch value={item.value} onValueChange={item.setter ?? (() => undefined)} trackColor={{ false: palette.border, true: palette.tint }} thumbColor={item.value ? '#111111' : '#f4f3f4'} />}
                  palette={palette}
                />
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingRow({
  title,
  description,
  right,
  palette,
}: {
  title: string;
  description: string;
  right: React.ReactNode;
  palette: Palette;
}) {
  return (
    <View style={[styles.settingRow, { backgroundColor: palette.surface, borderColor: palette.border }]}>
      <View style={styles.settingText}>
        <ThemedText style={{ color: palette.text, fontSize: 14, fontWeight: '800' }}>{title}</ThemedText>
        <ThemedText style={{ color: palette.muted, fontSize: 12, lineHeight: 18, marginTop: 4 }}>{description}</ThemedText>
      </View>
      <View>{right}</View>
    </View>
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
  tabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tabButton: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  panel: { borderWidth: 1, borderRadius: 22, padding: 16, gap: 12, marginTop: 18 },
  formStack: { gap: 10 },
  fieldLabel: { color: '#94a3b8', fontSize: 12, fontWeight: '700', marginBottom: 6 },
  input: { minHeight: 48, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, fontSize: 14 },
  disabledInput: { opacity: 0.7 },
  primaryButton: { minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: '#111111', fontSize: 14, fontWeight: '800' },
  secondaryButton: { minHeight: 42, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  settingList: { gap: 10 },
  settingRow: { borderWidth: 1, borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  settingText: { flex: 1 },
  dangerZone: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#7f1d1d', paddingTop: 14, marginTop: 4 },
  logoutButton: { minHeight: 44, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
});