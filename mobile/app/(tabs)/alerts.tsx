import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useLocalSearchParams } from 'expo-router';
import { useState , useEffect} from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { roleProfiles } from '@/constants/mineops';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';


import { globalAuthToken } from '@/constants/auth';


type AlertType = 'critical' | 'warning' | 'alert' | 'info';

type AlertItem = {
  id: string | number;
  type: AlertType;
  title: string;
  message: string;
  zone: string;
  time: string;
  action: string;
};

const FILTERS: ('all' | AlertType)[] = ['all', 'critical', 'warning', 'alert', 'info'];

export default function AlertsScreen() {
  useProtectedRoute(['worker', 'supervisor', 'safety', 'authority']);

  const colorScheme = useColorScheme() ?? 'dark';
  const palette = Colors[colorScheme];
  const params = useLocalSearchParams<{ role?: string }>();
  const roleValue = Array.isArray(params.role) ? params.role[0] : params.role;
  const selectedRole = roleProfiles.find((role) => role.key === roleValue) ?? roleProfiles[0];

  const [filterType, setFilterType] = useState<'all' | AlertType>('all');
  const [dismissedAlerts, setDismissedAlerts] = useState<(string | number)[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);


  useEffect(() => {
    async function fetchAlerts() {
      if (!globalAuthToken) return;
      try {
        const res = await fetch('https://api.pulkitworks.info:5000/incidents/alerts', {
          headers: { Authorization: `Bearer ${globalAuthToken}` },
        });

        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          // Fallback to dashboard if alerts route is not registered
          const dashRes = await fetch('https://api.pulkitworks.info:5000/api/dashboard', {
            headers: { Authorization: `Bearer ${globalAuthToken}` },
          });
          const dashData = await dashRes.json();
          setAlerts(dashData.data.alerts || []);
          return;
        }

        const data = await res.json();
        if (data.status === 'success') {
          // Dashboard returns alerts in different keys depending on role
          const alertData = data.data.alerts || data.data.system_alerts || [];
          if (alertData.length > 0) {
            setAlerts(alertData);
          }
        }
      } catch (err) {
        console.error('Failed to fetch alerts', err);
      }
    }
    fetchAlerts();
  }, []);

  const filteredAlerts = alerts.filter((alert) => {
    const matchesType = filterType === 'all' || alert.type === filterType;
    return matchesType && !dismissedAlerts.includes(alert.id);
  });

  const alertCounts = {
    critical: alerts.filter((item) => item.type === 'critical').length,
    warning: alerts.filter((item) => item.type === 'warning').length,
    alert: alerts.filter((item) => item.type === 'alert').length,
    info: alerts.filter((item) => item.type === 'info').length,
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
          <ThemedText type="title">Alerts & Notifications</ThemedText>
          <ThemedText style={{ color: palette.muted, fontSize: 15, lineHeight: 22, marginTop: 10 }}>
            System alerts and important notifications
          </ThemedText>
        </View>

        <View style={styles.statsGrid}>
          {[
            { label: 'Critical', value: String(alertCounts.critical), tone: palette.danger, bg: palette.danger + '22' },
            { label: 'Warnings', value: String(alertCounts.warning), tone: palette.warning, bg: palette.warning + '22' },
            { label: 'Alerts', value: String(alertCounts.alert), tone: '#eab308', bg: '#eab30822' },
            { label: 'Info', value: String(alertCounts.info), tone: '#60a5fa', bg: '#60a5fa22' },
          ].map((item) => (
            <View key={item.label} style={[styles.statCard, { backgroundColor: item.bg, borderColor: palette.border }]}>
              <ThemedText style={{ color: palette.muted, fontSize: 12, marginBottom: 4 }}>{item.label}</ThemedText>
              <ThemedText type="title" style={{ fontSize: 28, lineHeight: 32, color: item.tone }}>
                {item.value}
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.filterRow}>
          {FILTERS.map((type) => (
            <Pressable
              key={type}
              onPress={() => setFilterType(type)}
              style={({ pressed }) => [
                styles.filterChip,
                {
                  backgroundColor: filterType === type ? palette.tint : palette.surfaceElevated,
                  borderColor: filterType === type ? palette.tint : palette.border,
                },
                pressed && styles.pressed,
              ]}>
              <ThemedText
                style={{
                  color: filterType === type ? '#111111' : palette.text,
                  fontSize: 12,
                  fontWeight: '800',
                }}>
                {type.replace('-', ' ').toUpperCase()}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <View style={styles.alertList}>
          {filteredAlerts.map((alert) => (
            <View
              key={alert.id}
              style={[
                styles.alertCard,
                {
                  backgroundColor:
                    alert.type === 'critical'
                      ? palette.danger + '15'
                      : alert.type === 'warning'
                        ? palette.warning + '15'
                        : alert.type === 'alert'
                          ? '#eab30818'
                          : '#60a5fa18',
                  borderColor:
                    alert.type === 'critical'
                      ? palette.danger
                      : alert.type === 'warning'
                        ? palette.warning
                        : alert.type === 'alert'
                          ? '#eab308'
                          : '#60a5fa',
                },
              ]}>
              <View style={styles.alertBody}>
                <View style={styles.alertHeading}>
                  <View
                    style={[
                      styles.alertIcon,
                      {
                        backgroundColor:
                          alert.type === 'critical'
                            ? palette.danger + '25'
                            : alert.type === 'warning'
                              ? palette.warning + '25'
                              : alert.type === 'alert'
                                ? '#eab30825'
                                : '#60a5fa25',
                      },
                    ]}>
                    <MaterialIcons
                      name={alert.type === 'critical' ? 'warning' : alert.type === 'info' ? 'info' : 'notifications'}
                      size={18}
                      color={
                        alert.type === 'critical'
                          ? palette.danger
                          : alert.type === 'warning'
                            ? palette.warning
                            : alert.type === 'alert'
                              ? '#eab308'
                              : '#60a5fa'
                      }
                    />
                  </View>
                  <View style={styles.alertTextBlock}>
                    <ThemedText style={styles.alertTitle}>{alert.title}</ThemedText>
                    <ThemedText style={{ color: palette.muted, fontSize: 13, lineHeight: 19 }}>
                      {alert.message}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.alertMeta}>
                  <ThemedText style={{ color: palette.muted, fontSize: 12 }}>
                    Zone: <ThemedText style={{ color: palette.text, fontWeight: '800' }}>{alert.zone}</ThemedText>
                  </ThemedText>
                  <ThemedText style={{ color: palette.muted, fontSize: 12 }}>{alert.time}</ThemedText>
                </View>
              </View>

              <View style={styles.alertActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.actionButton,
                    { backgroundColor: palette.surfaceElevated, borderColor: palette.border },
                    pressed && styles.pressed,
                  ]}>
                  <ThemedText style={{ color: palette.text, fontSize: 12, fontWeight: '800' }}>{alert.action}</ThemedText>
                </Pressable>

                <Pressable
                  onPress={() => setDismissedAlerts((current) => [...current, alert.id])}
                  style={({ pressed }) => [styles.dismissButton, { backgroundColor: palette.surfaceElevated }, pressed && styles.pressed]}>
                  <MaterialIcons name="close" size={16} color={palette.muted} />
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {filteredAlerts.length === 0 ? (
          <View style={[styles.emptyState, { borderColor: palette.border, backgroundColor: palette.surfaceElevated }]}>
            <MaterialIcons name="notifications-none" size={28} color={palette.muted} />
            <ThemedText style={{ color: palette.muted, marginTop: 8 }}>No alerts to display</ThemedText>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
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
  },
  statCard: {
    width: '48%',
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  filterChip: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  alertList: {
    gap: 12,
    marginTop: 16,
  },
  alertCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 14,
  },
  alertBody: {
    gap: 10,
  },
  alertHeading: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  alertTextBlock: {
    flex: 1,
    gap: 4,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  alertMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  alertActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  dismissButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    marginTop: 18,
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
});
