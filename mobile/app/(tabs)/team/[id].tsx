import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Palette = typeof Colors.dark;

export default function MemberProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'dark';
  const palette = Colors[colorScheme];
  
  const params = useLocalSearchParams<{ 
    id: string; 
    name: string; 
    role: string; 
    status: string; 
    shift: string; 
    zone: string; 
    tasks: string; 
    attendance: string; 
    avatar?: string 
  }>();

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return palette.success;
      case 'on leave':
      case 'break':
        return palette.warning;
      case 'delayed':
        return palette.danger;
      default:
        return palette.muted;
    }
  };

  const statusColor = getStatusColor(params.status || '');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView
        style={{ backgroundColor: palette.background }}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: palette.background }]}
        showsVerticalScrollIndicator={false}>
        
        {/* Top Nav */}
        <View style={[styles.topRow, { borderBottomColor: palette.border }]}>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: palette.surfaceElevated, borderColor: palette.border },
              pressed && styles.pressed,
            ]}>
            <MaterialIcons name="arrow-back" size={18} color={palette.text} />
          </Pressable>
          <View style={styles.topMeta}>
            <ThemedText type="subtitle" style={{ color: palette.text }}>Member Profile</ThemedText>
          </View>
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
          <View style={styles.avatarContainer}>
            {params.avatar ? (
              <Image source={{ uri: params.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: palette.surface }]}>
                <ThemedText style={{ fontSize: 32, color: palette.tint, fontWeight: '800' }}>
                  {(params.name || 'U').charAt(0).toUpperCase()}
                </ThemedText>
              </View>
            )}
            <View style={[styles.statusIndicator, { backgroundColor: statusColor, borderColor: palette.surfaceElevated }]} />
          </View>
          
          <ThemedText type="title" style={{ marginTop: 16, marginBottom: 4 }}>{params.name}</ThemedText>
          <ThemedText style={{ color: palette.tint, fontWeight: '700', textTransform: 'uppercase', fontSize: 13, letterSpacing: 1 }}>
            {params.role}
          </ThemedText>
        </View>

        {/* Detail Grids */}
        <ThemedText type="subtitle" style={{ marginTop: 24, marginBottom: 12 }}>Current Status</ThemedText>
        <View style={styles.statsGrid}>
          <DetailBox label="Shift" value={params.shift || 'N/A'} icon="schedule" palette={palette} />
          <DetailBox label="Zone" value={params.zone || 'N/A'} icon="place" palette={palette} />
          <DetailBox label="Tasks" value={params.tasks || '0'} icon="assignment" palette={palette} />
          <DetailBox label="Attendance" value={params.attendance || 'N/A'} icon="how-to-reg" palette={palette} />
        </View>

        <ThemedText type="subtitle" style={{ marginTop: 24, marginBottom: 12 }}>Contact Information</ThemedText>
        <View style={[styles.infoList, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
          <InfoRow label="Email" value={(params.name || '').toLowerCase().replace(' ', '.') + '@mineops.inc'} icon="email" palette={palette} />
          <View style={[styles.divider, { backgroundColor: palette.border }]} />
          <InfoRow label="Phone" value="+1 (555) 019-2831" icon="phone" palette={palette} />
          <View style={[styles.divider, { backgroundColor: palette.border }]} />
          <InfoRow label="Emergency ID" value={`EMP-${params.id?.padStart(4, '0') || '0000'}`} icon="badge" palette={palette} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function DetailBox({ label, value, icon, palette }: { label: string; value: string; icon: any; palette: Palette }) {
  return (
    <View style={[styles.detailBox, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
      <View style={styles.detailIcon}>
        <MaterialIcons name={icon} size={20} color={palette.tint} />
      </View>
      <View>
        <ThemedText style={{ color: palette.muted, fontSize: 12, marginBottom: 2 }}>{label}</ThemedText>
        <ThemedText style={{ color: palette.text, fontSize: 14, fontWeight: '800' }}>{value}</ThemedText>
      </View>
    </View>
  );
}

function InfoRow({ label, value, icon, palette }: { label: string; value: string; icon: any; palette: Palette }) {
  return (
    <View style={styles.infoRow}>
      <View style={[styles.infoIcon, { backgroundColor: palette.surface }]}>
        <MaterialIcons name={icon} size={16} color={palette.muted} />
      </View>
      <View style={styles.infoContent}>
        <ThemedText style={{ color: palette.muted, fontSize: 12 }}>{label}</ThemedText>
        <ThemedText style={{ color: palette.text, fontSize: 14, fontWeight: '600' }}>{value}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 120 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
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
  profileCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    width: 90,
    height: 90,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailBox: {
    width: '48%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoList: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
    gap: 2,
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: 12,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
});
