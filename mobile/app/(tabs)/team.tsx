import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { roleProfiles } from '@/constants/mineops';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';

import { useEffect, useState } from 'react';
import { globalAuthToken } from '@/constants/auth';

type Palette = typeof Colors.dark;
type MemberStatus = 'Active' | 'Break' | 'Delayed' | 'Off';
type AttendanceStatus = 'Present' | 'Late' | 'Absent';

type TeamMember = {
  id: string | number;
  name: string;
  status: MemberStatus;
  shift: string;
  zone: string;
  tasks: number;
  attendance: AttendanceStatus;
};

export default function TeamScreen() {
  useProtectedRoute(['supervisor', 'admin', 'authority']);

  const colorScheme = useColorScheme() ?? 'dark';
  const palette = Colors[colorScheme];
  const params = useLocalSearchParams<{ role?: string }>();
  const roleValue = Array.isArray(params.role) ? params.role[0] : params.role;
  const selectedRole = roleProfiles.find((role) => role.key === roleValue) ?? roleProfiles[0];

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    async function fetchTeam() {
      if (!globalAuthToken) return;
      try {
        const res = await fetch('https://api.pulkitworks.info/api/users/workers', {
          headers: { Authorization: `Bearer ${globalAuthToken}` },
        });
        const data = await res.json();
        if (data.status === 'success') {
          const mappedTeam = data.data.map((t: any) => ({
            id: t.id,
            name: t.name || 'Unknown User',
            role: t.role || 'worker',
            status: t.status || 'Active',
            avatar: t.avatar,
            shift: t.shift || 'General Shift',
            zone: t.zone || 'Unassigned',
            tasks: t.tasks !== undefined ? t.tasks : 0,
            attendance: t.attendance || 'Present'
          }));
          setTeamMembers(mappedTeam);
        }
      } catch (err) {
        console.error('Failed to fetch team members', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTeam();
  }, []);

  const stats = {
    size: teamMembers.length,
    active: teamMembers.filter((member) => member.status === 'Active').length,
    break: teamMembers.filter((member) => member.status === 'Break').length,
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
          <ThemedText type="title">Team Management</ThemedText>
          <ThemedText style={{ color: palette.muted, fontSize: 15, lineHeight: 22, marginTop: 10 }}>
            Monitor and manage team members
          </ThemedText>
        </View>

        <View style={styles.statsGrid}>
          {[
            { label: 'Team Size', value: String(stats.size), tone: '#60a5fa', bg: '#60a5fa22' },
            { label: 'Currently Active', value: String(stats.active), tone: palette.success, bg: palette.success + '22' },
            { label: 'On Break', value: String(stats.break), tone: palette.warning, bg: palette.warning + '22' },
            { label: 'Attendance Rate', value: '80%', tone: palette.success, bg: palette.success + '22' },
          ].map((item) => (
            <View key={item.label} style={[styles.statCard, { backgroundColor: item.bg, borderColor: palette.border }]}>
              <ThemedText style={{ color: palette.muted, fontSize: 12, marginBottom: 4 }}>{item.label}</ThemedText>
              <ThemedText type="title" style={{ fontSize: 28, lineHeight: 32, color: item.tone }}>
                {item.value}
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.memberList}>
          {teamMembers.map((member) => (
            <View key={member.id} style={[styles.memberCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
              <View style={styles.memberHeading}>
                <View>
                  <ThemedText style={styles.memberName}>{member.name}</ThemedText>
                  <ThemedText style={{ color: palette.muted, fontSize: 12, marginTop: 4 }}>
                    Shift {member.shift} • {member.zone}
                  </ThemedText>
                </View>
                <View style={[styles.statusPill, { backgroundColor: statusBackground(member.status, palette) }]}>
                  <ThemedText style={{ color: statusText(member.status, palette), fontSize: 11, fontWeight: '800' }}>
                    {member.status.toUpperCase()}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.memberMetaRow}>
                <MetaBox label="Tasks" value={String(member.tasks)} palette={palette} />
                <MetaBox label="Attendance" value={member.attendance} palette={palette} />
              </View>

              <Pressable
                onPress={() => {
                  const { router } = require('expo-router');
                  router.push({
                    pathname: '/team/[id]',
                    params: {
                      id: member.id,
                      name: member.name,
                      role: member.role,
                      status: member.status,
                      shift: member.shift,
                      zone: member.zone,
                      tasks: member.tasks,
                      attendance: member.attendance,
                      avatar: member.avatar || ''
                    }
                  });
                }}
                style={({ pressed }) => [
                  styles.memberButton,
                  { backgroundColor: palette.tint + '22', borderColor: palette.tint },
                  pressed && styles.pressed,
                ]}>
                <ThemedText style={{ color: palette.tint, fontSize: 12, fontWeight: '800' }}>View</ThemedText>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetaBox({ label, value, palette }: { label: string; value: string; palette: Palette }) {
  return (
    <View style={[styles.metaBox, { backgroundColor: palette.surface, borderColor: palette.border }]}>
      <ThemedText style={{ color: palette.muted, fontSize: 12 }}>{label}</ThemedText>
      <ThemedText style={{ color: palette.text, fontSize: 13, fontWeight: '800', marginTop: 4 }}>{value}</ThemedText>
    </View>
  );
}

function statusBackground(status: MemberStatus, palette: Palette) {
  switch (status) {
    case 'Active':
      return palette.success + '22';
    case 'Break':
      return palette.warning + '22';
    case 'Delayed':
      return palette.danger + '22';
    default:
      return palette.surfaceMuted;
  }
}

function statusText(status: MemberStatus, palette: Palette) {
  switch (status) {
    case 'Active':
      return palette.success;
    case 'Break':
      return palette.warning;
    case 'Delayed':
      return palette.danger;
    default:
      return palette.muted;
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
  memberList: {
    gap: 12,
    marginTop: 18,
  },
  memberCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 14,
  },
  memberHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '800',
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  memberMetaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaBox: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
  },
  memberButton: {
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
});
