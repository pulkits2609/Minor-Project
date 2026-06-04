import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { roleProfiles } from '@/constants/mineops';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { globalAuthToken } from '@/constants/auth';
import { apiFetchWithFallback, readApiJson } from '@/constants/api';

type Palette = typeof Colors.dark;

type ReportItem = {
  id: string;
  title: string;
  type: string;
  date: string;
  status: 'ready' | 'generating' | 'failed';
};

const FALLBACK_REPORTS: ReportItem[] = [
  { id: 'r1', title: 'Monthly Safety Compliance Report', type: 'Safety', date: 'Jun 2026', status: 'ready' },
  { id: 'r2', title: 'Incident Summary - Q2 2026', type: 'Incidents', date: 'Apr-Jun 2026', status: 'ready' },
  { id: 'r3', title: 'Productivity & Efficiency Analysis', type: 'Operations', date: 'May 2026', status: 'ready' },
  { id: 'r4', title: 'Worker Attendance Overview', type: 'HR', date: 'Last 30 days', status: 'ready' },
  { id: 'r5', title: 'Risk Assessment & Hazard Report', type: 'Safety', date: 'Weekly', status: 'generating' },
];

export default function ReportsScreen() {
  useProtectedRoute(['admin', 'authority']);

  const colorScheme = useColorScheme() ?? 'dark';
  const palette = Colors[colorScheme];
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();
  const roleValue = Array.isArray(params.role) ? params.role[0] : params.role;
  const selectedRole = roleProfiles.find((role) => role.key === roleValue) ?? roleProfiles[0];

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      if (!globalAuthToken) {
        setReports(FALLBACK_REPORTS);
        setLoading(false);
        return;
      }
      try {
        const res = await apiFetchWithFallback('/api/dashboard', {
          headers: { Authorization: `Bearer ${globalAuthToken}` },
        });
        if (res.ok) {
          const data = await readApiJson<{ status?: string; data?: { reports?: any[] } }>(res);
          if (data?.status === 'success' && data.data?.reports && data.data.reports.length > 0) {
            setReports(data.data.reports.map((r: any, i: number) => ({
              id: r.id || `r-${i}`,
              title: r.title || `Report #${i + 1}`,
              type: r.type || 'General',
              date: r.date || 'N/A',
              status: 'ready' as const,
            })));
          } else {
            setReports(FALLBACK_REPORTS);
          }
        } else {
          setReports(FALLBACK_REPORTS);
        }
      } catch {
        setReports(FALLBACK_REPORTS);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  const handleDownload = (report: ReportItem) => {
    Alert.alert('Download Report', `${report.title} will be downloaded as PDF.`);
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
            <ThemedText type="subtitle" style={styles.brand}>MineOps</ThemedText>
            <ThemedText style={{ color: palette.muted, fontSize: 13, lineHeight: 18 }}>{selectedRole.label} reports</ThemedText>
          </View>
        </View>

        <View style={styles.headerBlock}>
          <ThemedText type="title">Reports Center</ThemedText>
          <ThemedText style={{ color: palette.muted, fontSize: 15, lineHeight: 22, marginTop: 10 }}>
            Generate and export operational summaries
          </ThemedText>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: 'Total Reports', value: String(reports.length), tone: '#60a5fa' },
            { label: 'Available', value: String(reports.filter((r) => r.status === 'ready').length), tone: palette.success },
          ].map((stat) => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
              <ThemedText style={{ color: palette.muted, fontSize: 12, marginBottom: 4 }}>{stat.label}</ThemedText>
              <ThemedText type="title" style={{ fontSize: 24, lineHeight: 28, color: stat.tone }}>{stat.value}</ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Available Reports</ThemedText>
        </View>

        <View style={styles.reportList}>
          {reports.map((report) => (
            <View key={report.id} style={[styles.reportCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
              <View style={styles.reportIcon}>
                <MaterialIcons name="description" size={22} color={palette.tint} />
              </View>
              <View style={styles.reportBody}>
                <ThemedText style={{ fontWeight: '800', fontSize: 15 }}>{report.title}</ThemedText>
                <View style={styles.reportMeta}>
                  <View style={[styles.typeBadge, { backgroundColor: palette.surfaceMuted, borderColor: palette.border }]}>
                    <ThemedText style={{ color: palette.muted, fontSize: 11, fontWeight: '700' }}>{report.type}</ThemedText>
                  </View>
                  <ThemedText style={{ color: palette.muted, fontSize: 12 }}>{report.date}</ThemedText>
                </View>
              </View>
              {report.status === 'ready' ? (
                <Pressable
                  onPress={() => handleDownload(report)}
                  style={({ pressed }) => [styles.downloadBtn, { backgroundColor: palette.surface, borderColor: palette.border }, pressed && styles.pressed]}>
                  <MaterialIcons name="download" size={18} color={palette.text} />
                </Pressable>
              ) : (
                <ActivityIndicator size="small" color={palette.muted} />
              )}
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
  backButton: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  topMeta: { alignItems: 'flex-end', flex: 1 },
  brand: { marginBottom: 2 },
  headerBlock: { marginBottom: 8 },
  sectionHeader: { marginTop: 24, marginBottom: 10, gap: 4 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 8 },
  statCard: { flex: 1, borderRadius: 22, borderWidth: 1, padding: 16 },
  reportList: { gap: 12 },
  reportCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 18, padding: 14, gap: 14 },
  reportIcon: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.03)', alignItems: 'center', justifyContent: 'center' },
  reportBody: { flex: 1, gap: 6 },
  reportMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  typeBadge: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
  downloadBtn: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
});
