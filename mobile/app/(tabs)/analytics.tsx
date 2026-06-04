import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { roleProfiles } from '@/constants/mineops';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { globalAuthToken } from '@/constants/auth';
import { apiFetchWithFallback, readApiJson } from '@/constants/api';

type Palette = typeof Colors.dark;

type KpiCard = {
  label: string;
  value: string;
  detail: string;
  tone: 'success' | 'warning' | 'danger' | 'neutral';
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
};

type TrendData = {
  label: string;
  value: string;
  change: string;
  direction: 'up' | 'down';
};

const FALLBACK_KPIS: KpiCard[] = [
  { label: 'Total Incidents', value: '47', detail: 'This quarter', tone: 'warning', icon: 'report' },
  { label: 'Efficiency Rate', value: '80%', detail: 'Overall productivity', tone: 'success', icon: 'trending-up' },
  { label: 'Risk Level', value: 'MEDIUM', detail: 'Current assessment', tone: 'warning', icon: 'security' },
  { label: 'Active Workers', value: '128', detail: 'Across all zones', tone: 'neutral', icon: 'groups' },
];

const FALLBACK_TRENDS: TrendData[] = [
  { label: 'Incident Frequency', value: '12', change: '-8%', direction: 'down' },
  { label: 'Avg Response Time', value: '4.2 min', change: '-12%', direction: 'down' },
  { label: 'Safety Compliance', value: '94%', change: '+3%', direction: 'up' },
  { label: 'Shift Coverage', value: '87%', change: '+5%', direction: 'up' },
];

export default function AnalyticsScreen() {
  useProtectedRoute(['admin', 'authority']);

  const colorScheme = useColorScheme() ?? 'dark';
  const palette = Colors[colorScheme];
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();
  const roleValue = Array.isArray(params.role) ? params.role[0] : params.role;
  const selectedRole = roleProfiles.find((role) => role.key === roleValue) ?? roleProfiles[0];

  const [kpis, setKpis] = useState<KpiCard[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!globalAuthToken) {
        setKpis(FALLBACK_KPIS);
        setTrends(FALLBACK_TRENDS);
        setLoading(false);
        return;
      }
      try {
        const res = await apiFetchWithFallback('/api/dashboard', {
          headers: { Authorization: `Bearer ${globalAuthToken}` },
        });
        if (res.ok) {
          const data = await readApiJson<{ status?: string; data?: any }>(res);
          if (data?.status === 'success' && data.data?.analytics) {
            const a = data.data.analytics;
            setKpis([
              { label: 'Total Incidents', value: String(a.incident_frequency || 0), detail: 'This quarter', tone: 'warning', icon: 'report' },
              { label: 'Efficiency Rate', value: a.efficiency || 'N/A', detail: 'Overall productivity', tone: 'success', icon: 'trending-up' },
              { label: 'Risk Level', value: (a.risk_levels || 'low').toUpperCase(), detail: 'Current assessment', tone: a.risk_levels === 'high' ? 'danger' : 'warning', icon: 'security' },
              { label: 'Active Workers', value: '128', detail: 'Across all zones', tone: 'neutral', icon: 'groups' },
            ]);
            setTrends(FALLBACK_TRENDS);
          } else {
            setKpis(FALLBACK_KPIS);
            setTrends(FALLBACK_TRENDS);
          }
        } else {
          setKpis(FALLBACK_KPIS);
          setTrends(FALLBACK_TRENDS);
        }
      } catch {
        setKpis(FALLBACK_KPIS);
        setTrends(FALLBACK_TRENDS);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

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
            <ThemedText type="subtitle" style={styles.brand}>MineOps</ThemedText>
            <ThemedText style={{ color: palette.muted, fontSize: 13, lineHeight: 18 }}>{selectedRole.label} analytics</ThemedText>
          </View>
        </View>

        <View style={styles.headerBlock}>
          <ThemedText type="title">Analytics Dashboard</ThemedText>
          <ThemedText style={{ color: palette.muted, fontSize: 15, lineHeight: 22, marginTop: 10 }}>
            Trends across productivity, safety, and compliance
          </ThemedText>
        </View>

        <View style={styles.kpiGrid}>
          {kpis.map((kpi) => (
            <View key={kpi.label} style={[styles.kpiCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
              <View style={styles.kpiHeader}>
                <ThemedText style={{ color: palette.muted, fontSize: 12, fontWeight: '700' }}>{kpi.label}</ThemedText>
                <View style={[styles.kpiIcon, { backgroundColor: palette.surfaceMuted }]}>
                  <MaterialIcons name={kpi.icon} size={18} color={toneColor(kpi.tone, palette)} />
                </View>
              </View>
              <ThemedText type="title" style={[styles.kpiValue, { color: toneColor(kpi.tone, palette) }]}>
                {kpi.value}
              </ThemedText>
              <ThemedText style={{ color: palette.muted, fontSize: 13, lineHeight: 19 }}>{kpi.detail}</ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Trend Analysis</ThemedText>
          <ThemedText style={{ color: palette.muted, fontSize: 13, lineHeight: 18 }}>Period-over-period comparisons</ThemedText>
        </View>

        <View style={styles.trendList}>
          {trends.map((trend) => (
            <View key={trend.label} style={[styles.trendCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
              <View style={styles.trendBody}>
                <ThemedText style={{ fontWeight: '800', fontSize: 15 }}>{trend.label}</ThemedText>
                <ThemedText style={{ color: palette.muted, fontSize: 13, marginTop: 2 }}>{trend.value}</ThemedText>
              </View>
              <View style={[styles.trendBadge, { backgroundColor: trend.direction === 'up' ? palette.success + '22' : palette.success + '22' }]}>
                <MaterialIcons name={trend.direction === 'up' ? 'trending-up' : 'trending-down'} size={14} color={trend.direction === 'up' ? palette.success : palette.danger} />
                <ThemedText style={{ color: trend.direction === 'up' ? palette.success : palette.danger, fontSize: 12, fontWeight: '800' }}>
                  {trend.change}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function toneColor(tone: 'success' | 'warning' | 'danger' | 'neutral', palette: Palette) {
  switch (tone) {
    case 'danger': return palette.danger;
    case 'warning': return palette.warning;
    case 'success': return palette.success;
    default: return palette.muted;
  }
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 120 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, paddingBottom: 14, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  backButton: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  topMeta: { alignItems: 'flex-end', flex: 1 },
  brand: { marginBottom: 2 },
  headerBlock: { marginBottom: 8 },
  sectionHeader: { marginTop: 24, marginBottom: 10, gap: 4 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  kpiCard: { width: '48%', borderRadius: 22, borderWidth: 1, padding: 16, gap: 8 },
  kpiHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  kpiIcon: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  kpiValue: { fontSize: 28, lineHeight: 32, marginTop: 4 },
  trendList: { gap: 12, marginTop: 8 },
  trendCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 18, padding: 16, gap: 12 },
  trendBody: { flex: 1 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
});
