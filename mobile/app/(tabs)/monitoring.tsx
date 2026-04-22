import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { roleProfiles } from '@/constants/mineops';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';

type Palette = typeof Colors.dark;
type ZoneStatus = 'normal' | 'warning' | 'critical';

type Zone = {
  zone: string;
  gasLevel: number;
  temp: number;
  status: ZoneStatus;
};

type Sensor = {
  name: string;
  zone: string;
  value: string;
  status: ZoneStatus | 'info';
};

const ZONES: Zone[] = [
  { zone: 'Zone A', gasLevel: 35, temp: 42, status: 'normal' },
  { zone: 'Zone B', gasLevel: 52, temp: 45, status: 'warning' },
  { zone: 'Zone C', gasLevel: 73, temp: 47, status: 'critical' },
  { zone: 'Zone D', gasLevel: 28, temp: 40, status: 'normal' },
];

const SENSORS: Sensor[] = [
  { name: 'Humidity Sensor', zone: 'Zone A', value: '65%', status: 'normal' },
  { name: 'Vibration Monitor', zone: 'Zone B', value: '2.3 Hz', status: 'normal' },
  { name: 'Gas Detector', zone: 'Zone C', value: '73 ppm', status: 'critical' },
  { name: 'Temp Sensor', zone: 'Zone D', value: '40°C', status: 'normal' },
];

export default function MonitoringScreen() {
  useProtectedRoute(['safety', 'admin', 'authority']);

  const colorScheme = useColorScheme() ?? 'dark';
  const palette = Colors[colorScheme];
  const params = useLocalSearchParams<{ role?: string }>();
  const roleValue = Array.isArray(params.role) ? params.role[0] : params.role;
  const selectedRole = roleProfiles.find((role) => role.key === roleValue) ?? roleProfiles[0];
  const { width } = useWindowDimensions();
  const isCompact = width < 700;

  const metricCardWidth = isCompact ? '48%' : '23%';
  const zoneCardWidth = isCompact ? '100%' : '48%';
  const sensorCardWidth = isCompact ? '48%' : '23%';

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
              {selectedRole.label} workflow
            </ThemedText>
          </View>
        </View>

        <View style={styles.headerBlock}>
          <ThemedText type="title">Safety Monitoring</ThemedText>
          <ThemedText style={{ color: palette.muted, fontSize: 15, lineHeight: 22, marginTop: 10 }}>
            Real-time monitoring and hazard detection
          </ThemedText>
        </View>

        <View style={styles.metricGrid}>
          {[
            { label: 'Avg Gas Level', value: '47 ppm', tone: 'warning' as const, icon: 'gas-meter' as const },
            { label: 'Avg Temperature', value: '43.5°C', tone: 'danger' as const, icon: 'thermostat' as const },
            { label: 'Critical Zones', value: '1', tone: 'danger' as const, icon: 'warning' as const },
            { label: 'System Status', value: 'Warning', tone: 'warning' as const, icon: 'sensors' as const },
          ].map((metric) => (
            <View
              key={metric.label}
              style={[
                styles.metricCard,
                { width: metricCardWidth, backgroundColor: palette.surfaceElevated, borderColor: palette.border },
              ]}>
              <View style={styles.metricHeader}>
                <ThemedText style={{ color: palette.muted, fontSize: 12, fontWeight: '700' }}>
                  {metric.label}
                </ThemedText>
                <View style={[styles.metricIcon, { backgroundColor: palette.surfaceMuted }]}>
                  <MaterialIcons name={metric.icon} size={18} color={toneColor(metric.tone, palette)} />
                </View>
              </View>
              <ThemedText type="title" style={styles.metricValue}>
                {metric.value}
              </ThemedText>
            </View>
          ))}
        </View>

        <SectionHeader title="Zone monitoring" subtitle="Live gas and temperature readings by zone." palette={palette} />
        <View style={styles.zoneGrid}>
          {ZONES.map((zone) => (
            <View
              key={zone.zone}
              style={[
                styles.zoneCard,
                { width: zoneCardWidth, borderColor: palette.border, backgroundColor: zoneSurface(zone.status, palette) },
              ]}>
              <View style={styles.zoneCardHeader}>
                <ThemedText type="subtitle" style={styles.zoneTitle}>
                  {zone.zone}
                </ThemedText>
                <View style={[styles.statusPill, { backgroundColor: statusBackground(zone.status, palette) }]}>
                  <ThemedText style={{ color: statusText(zone.status, palette), fontSize: 11, fontWeight: '800' }}>
                    {zone.status.toUpperCase()}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.indicatorBlock}>
                <View style={styles.indicatorHeader}>
                  <ThemedText style={styles.indicatorLabel}>Gas Level (Methane)</ThemedText>
                  <ThemedText style={{ color: palette.tint, fontSize: 18, fontWeight: '800' }}>
                    {zone.gasLevel} ppm
                  </ThemedText>
                </View>
                <View style={[styles.barTrack, { backgroundColor: palette.surfaceMuted }]}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${Math.min(zone.gasLevel, 100)}%`,
                        backgroundColor: toneColor(zone.status, palette),
                      },
                    ]}
                  />
                </View>
                <ThemedText style={styles.hintText}>Normal: &lt;30 | Warning: 30-60 | Critical: &gt;60</ThemedText>
              </View>

              <View style={styles.indicatorBlock}>
                <View style={styles.indicatorHeader}>
                  <ThemedText style={styles.indicatorLabel}>Temperature</ThemedText>
                  <ThemedText style={{ color: palette.tint, fontSize: 18, fontWeight: '800' }}>
                    {zone.temp}°C
                  </ThemedText>
                </View>
                <View style={[styles.barTrack, { backgroundColor: palette.surfaceMuted }]}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${Math.min((zone.temp / 50) * 100, 100)}%`,
                        backgroundColor: palette.accent,
                      },
                    ]}
                  />
                </View>
                <ThemedText style={styles.hintText}>Normal: &lt;40 | Elevated: 40-45 | High: &gt;45</ThemedText>
              </View>
            </View>
          ))}
        </View>

        <SectionHeader title="Sensor details" subtitle="Active sensors and current readings." palette={palette} />
        <View style={styles.sensorGrid}>
          {SENSORS.map((sensor) => (
            <View
              key={sensor.name}
              style={[
                styles.sensorCard,
                { width: sensorCardWidth, backgroundColor: palette.surfaceElevated, borderColor: palette.border },
              ]}>
              <ThemedText style={styles.sensorName}>{sensor.name}</ThemedText>
              <ThemedText style={{ color: palette.muted, fontSize: 12, marginTop: 4 }}>
                {sensor.zone}
              </ThemedText>
              <ThemedText style={styles.sensorValue}>{sensor.value}</ThemedText>
              <View style={[styles.statusPill, { backgroundColor: statusBackground(sensor.status, palette) }]}>
                <ThemedText style={{ color: statusText(sensor.status, palette), fontSize: 11, fontWeight: '800' }}>
                  {sensor.status.toUpperCase()}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title, subtitle, palette }: { title: string; subtitle: string; palette: Palette }) {
  return (
    <View style={styles.sectionHeader}>
      <ThemedText type="subtitle">{title}</ThemedText>
      <ThemedText style={{ color: palette.muted, fontSize: 13, lineHeight: 18 }}>{subtitle}</ThemedText>
    </View>
  );
}

function toneColor(tone: ZoneStatus, palette: Palette) {
  switch (tone) {
    case 'critical':
      return palette.danger;
    case 'warning':
      return palette.warning;
    default:
      return palette.success;
  }
}

function zoneSurface(status: ZoneStatus, palette: Palette) {
  if (status === 'critical') {
    return palette.surfaceElevated;
  }
  if (status === 'warning') {
    return palette.surfaceElevated;
  }
  return palette.surfaceElevated;
}

function statusBackground(status: ZoneStatus | 'info', palette: Palette) {
  switch (status) {
    case 'critical':
      return palette.danger + '22';
    case 'warning':
      return palette.warning + '22';
    case 'normal':
      return palette.success + '22';
    default:
      return palette.surfaceMuted;
  }
}

function statusText(status: ZoneStatus | 'info', palette: Palette) {
  switch (status) {
    case 'critical':
      return palette.danger;
    case 'warning':
      return palette.warning;
    case 'normal':
      return palette.success;
    default:
      return palette.muted;
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120,
  },
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
  brand: {
    marginBottom: 2,
  },
  headerBlock: {
    marginBottom: 8,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 8,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: 30,
    lineHeight: 32,
    marginTop: 4,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 10,
    gap: 4,
  },
  zoneGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  zoneCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    gap: 14,
  },
  zoneCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  zoneTitle: {
    fontSize: 18,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  indicatorBlock: {
    gap: 8,
  },
  indicatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  indicatorLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  barTrack: {
    height: 12,
    borderRadius: 999,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
  },
  hintText: {
    color: Colors.dark.muted,
    fontSize: 11,
    lineHeight: 16,
  },
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  sensorCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 8,
  },
  sensorName: {
    fontSize: 15,
    fontWeight: '800',
  },
  sensorValue: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
    marginTop: 4,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
});
