import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { roleProfiles } from '@/constants/mineops';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { apiFetchWithFallback, readApiJson } from '@/constants/api';


import { globalAuthToken, loadAuthState } from '@/constants/auth';


type AlertType = 'critical' | 'warning' | 'alert' | 'info';

type AlertItem = {
  id: string | number;
  type: AlertType;
  title: string;
  message: string;
  zone: string;
  time: string;
  action: string;
  isRead: boolean;
};

const FALLBACK_ALERTS: AlertItem[] = [
  { id: 'fb-1', type: 'critical', title: 'Gas Level Critical - Zone C', message: 'Methane levels exceed safe threshold in Zone C. Immediate evacuation required.', zone: 'Zone C', time: '2 min ago', action: 'Review', isRead: false },
  { id: 'fb-2', type: 'warning', title: 'Temperature Rising - Zone B', message: 'Temperature trending above 45�C in Zone B. Monitor closely.', zone: 'Zone B', time: '15 min ago', action: 'Review', isRead: false },
  { id: 'fb-3', type: 'alert', title: 'Shift Change Pending', message: 'Afternoon shift workers arriving at Zone A gate.', zone: 'Site wide', time: '30 min ago', action: 'Review', isRead: false },
  { id: 'fb-4', type: 'info', title: 'System Maintenance', message: 'Scheduled maintenance on ventilation system at 2 AM.', zone: 'All zones', time: '1 hour ago', action: 'Read', isRead: false },
];

const FILTERS: ('all' | AlertType)[] = ['all', 'critical', 'warning', 'alert', 'info'];

function normalizeAlertType(alert: any): AlertType {
  const severity = String(alert.severity || '').toLowerCase();
  const type = String(alert.type || '').toLowerCase();

  if (severity === 'critical' || type === 'critical') return 'critical';
  if (severity === 'high' || severity === 'warning' || type === 'warning') return 'warning';
  if (type === 'emergency' || type === 'alert') return 'alert';
  return 'info';
}

function extractZone(alert: any) {
  const directZone = alert.zone || alert.location;
  if (typeof directZone === 'string' && directZone.trim()) {
    return directZone.trim();
  }

  const message = String(alert.message || '');
  const zoneMatch = message.match(/\bZone\s+[A-Za-z0-9-]+/i);
  if (zoneMatch) {
    return zoneMatch[0].replace(/\bzone\b/i, 'Zone');
  }

  return 'Site wide';
}

function deriveAlertTitle(alert: any) {
  if (alert.title) {
    return alert.title;
  }

  const zone = extractZone(alert);
  const type = String(alert.type || '').toLowerCase();

  if (type === 'emergency' || String(alert.message || '').toLowerCase().includes('incident reported')) {
    return `Incident alert - ${zone}`;
  }

  return '';
}

export default function AlertsScreen() {
  useProtectedRoute(['worker', 'supervisor', 'safety', 'authority']);

  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'dark';
  const palette = Colors[colorScheme];
  const params = useLocalSearchParams<{ role?: string }>();
  const roleValue = Array.isArray(params.role) ? params.role[0] : params.role;
  const selectedRole = roleProfiles.find((role) => role.key === roleValue) ?? roleProfiles[0];

  const [filterType, setFilterType] = useState<'all' | AlertType>('all');
  const [dismissedAlerts, setDismissedAlerts] = useState<(string | number)[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function fetchAlerts() {
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
        const res = await apiFetchWithFallback('/api/alerts', {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data = await readApiJson<{ status?: string; data?: any[] }>(res);
          if (data?.status === 'success' && data.data && data.data.length > 0) {
            const rawAlerts = (data.data || []).filter((alert: any) => !alert.is_read);
            const mappedAlerts = rawAlerts.map((a: any) => {
              const msg = a.message || '';
              const derivedTitle = a.title || (msg.length > 40 ? msg.substring(0, 40) + '…' : msg) || 'System Alert';
              return {
                id: a.id,
                title: deriveAlertTitle(a) || derivedTitle,
                message: msg,
                type: normalizeAlertType(a),
                zone: extractZone(a),
                time: a.created_at ? new Date(a.created_at).toLocaleString() : new Date().toLocaleTimeString(),
                action: a.action || (a.is_read ? 'Read' : 'Review'),
                isRead: Boolean(a.is_read),
              };
            });
            setAlerts(mappedAlerts);
            return;
          }
        }
      } catch {
        console.warn('Failed to fetch alerts');
      }
      setAlerts(FALLBACK_ALERTS);
      setLoading(false);
    }
    fetchAlerts();
  }, []);

  const markAlertRead = async (alertId: string | number) => {
    let authToken = globalAuthToken;
    if (!authToken) {
      const { token } = await loadAuthState();
      authToken = token;
    }

    if (!authToken) {
      return;
    }

    try {
      await apiFetchWithFallback('/api/alerts/read', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ alert_id: alertId }),
      });
    } catch (error) {
      console.warn('Failed to mark alert as read', error);
    }
  };

  const clearAlert = async (alertId: string | number) => {
    setDismissedAlerts((current) => (current.includes(alertId) ? current : [...current, alertId]));
    setAlerts((current) => current.filter((item) => item.id !== alertId));
    await markAlertRead(alertId);
  };

  const handleReviewAlert = async (alert: AlertItem) => {
    await clearAlert(alert.id);
    router.push({ pathname: '/incidents/review', params: { role: selectedRole.key } });
  };

  const filteredAlerts = alerts.filter((alert) => {
    const matchesType = filterType === 'all' || alert.type === filterType;
    return matchesType && !dismissedAlerts.includes(alert.id);
  });

  const alertCounts = {
    critical: filteredAlerts.filter((item) => item.type === 'critical').length,
    warning: filteredAlerts.filter((item) => item.type === 'warning').length,
    alert: filteredAlerts.filter((item) => item.type === 'alert').length,
    info: filteredAlerts.filter((item) => item.type === 'info').length,
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: palette.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={palette.tint} />
      </View>
    );
  }

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
                  onPress={() => handleReviewAlert(alert)}
                  style={({ pressed }) => [
                    styles.actionButton,
                    { backgroundColor: palette.surfaceElevated, borderColor: palette.border },
                    pressed && styles.pressed,
                  ]}>
                  <ThemedText style={{ color: palette.text, fontSize: 12, fontWeight: '800' }}>{alert.action}</ThemedText>
                </Pressable>

                <Pressable
                  onPress={() => clearAlert(alert.id)}
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
    width: 48,
    height: 48,
    borderRadius: 16,
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
    borderRadius: 16,
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
    borderRadius: 16,
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
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  dismissButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
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
