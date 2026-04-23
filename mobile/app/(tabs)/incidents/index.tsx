import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useLocalSearchParams } from 'expo-router';
import { useMemo, useState , useEffect} from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';

import { roleProfiles } from '@/constants/mineops';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';


import { globalAuthToken } from '@/constants/auth';

type Palette = typeof Colors.dark;
type FilterStatus = 'all' | 'pending-verification' | 'assigned' | 'escalated' | 'resolved';

type IncidentItem = {
  id: string | number;
  code: string;
  title: string;
  status: string;
  severity: string;
  zone: string;
  date: string;
  reporter: string;
};

export default function IncidentsScreen() {
  useProtectedRoute(['worker', 'supervisor', 'safety', 'authority']);

  const colorScheme = useColorScheme() ?? 'dark';
  const palette = Colors[colorScheme];
  const params = useLocalSearchParams<{ role?: string }>();
  const roleValue = Array.isArray(params.role) ? params.role[0] : params.role;
  const selectedRole = roleProfiles.find((role) => role.key === roleValue) ?? roleProfiles[0];

  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [incidents, setIncidents] = useState<IncidentItem[]>([]);


  useEffect(() => {
    async function fetchIncidents() {
      if (!globalAuthToken) return;
      try {
        const res = await fetch('https://api.pulkitworks.info:5000/api/incidents', {
          headers: { Authorization: `Bearer ${globalAuthToken}` },
        });

        const contentType = res.headers.get('content-type');
        if (!res.ok || !contentType || !contentType.includes('application/json')) {
          console.warn('Incidents endpoint not available');
          return;
        }

        const data = await res.json();
        if (data.status === 'success') {
          const mappedIncidents = (data.data || []).map((t: any) => ({
            id: t.id,
            code: String(t.id).substring(0, 8).toUpperCase(),
            title: t.description ? t.description.split('.')[0] : 'No Title',
            status: t.status || 'pending-verification',
            severity: (t.severity || 'medium').toLowerCase(),
            zone: t.location || 'Unknown',
            date: t.created_at ? new Date(t.created_at).toLocaleDateString() : 'N/A',
            reporter: t.reporter || 'Unknown',
          }));
          setIncidents(mappedIncidents);
        }
      } catch (err) {
        console.error('Failed to fetch incidents', err);
      }
    }
    fetchIncidents();
  }, []);

  const filteredIncidents = useMemo(() => {
    return incidents.filter((incident) => {
      const matchesSearch =
        incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        incident.zone.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || incident.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [filterStatus, searchTerm, incidents]);

  const canReport = selectedRole.key === 'worker' || selectedRole.key === 'supervisor';

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
          <ThemedText type="title">Incidents</ThemedText>
          <ThemedText style={{ color: palette.muted, fontSize: 15, lineHeight: 22, marginTop: 10 }}>
            Manage and track safety incidents
          </ThemedText>
        </View>

        {canReport ? (
          <Link href={{ pathname: '/incidents/report', params: { role: selectedRole.key } }} asChild>
            <Pressable
              style={({ pressed }) => [
                styles.reportButton,
                { backgroundColor: palette.tint },
                pressed && styles.pressed,
              ]}>
              <MaterialIcons name="report" size={18} color="#111111" />
              <ThemedText style={styles.reportButtonText}>Report Incident</ThemedText>
            </Pressable>
          </Link>
        ) : null}

        <View style={styles.searchSection}>
          <View style={[styles.searchRow, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
            <MaterialIcons name="search" size={18} color={palette.muted} />
            <TextInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Search incidents..."
              placeholderTextColor={palette.muted}
              style={[styles.searchInput, { color: palette.text }]}
            />
          </View>

          <View style={styles.filterGrid}>
            {['all', 'pending-verification', 'assigned', 'escalated', 'resolved'].map((status) => {
              const selected = filterStatus === status;
              return (
                <Pressable
                  key={status}
                  onPress={() => setFilterStatus(status as FilterStatus)}
                  style={({ pressed }) => [
                    styles.filterChip,
                    {
                      backgroundColor: selected ? palette.tint : palette.surface,
                      borderColor: selected ? palette.tint : palette.border,
                    },
                    pressed && styles.pressed,
                  ]}>
                  <ThemedText
                    style={{
                      color: selected ? '#111111' : palette.text,
                      fontSize: 11,
                      fontWeight: '800',
                      letterSpacing: 0.4,
                    }}>
                    {status.replace('-', ' ').toUpperCase()}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.statsGrid}>
          {[
            { label: 'Total', value: String(incidents.length), tone: '#60a5fa', bg: '#60a5fa22' },
            { label: 'Critical', value: String(incidents.filter((item) => item.severity === 'critical').length), tone: palette.danger, bg: palette.danger + '22' },
            { label: 'Open', value: String(incidents.filter((item) => item.status !== 'resolved').length), tone: palette.warning, bg: palette.warning + '22' },
            { label: 'Resolved', value: String(incidents.filter((item) => item.status === 'resolved').length), tone: palette.success, bg: palette.success + '22' },
          ].map((item) => (
            <View key={item.label} style={[styles.statCard, { backgroundColor: item.bg, borderColor: palette.border }]}>
              <ThemedText style={{ color: palette.muted, fontSize: 12, marginBottom: 4 }}>{item.label}</ThemedText>
              <ThemedText type="title" style={{ fontSize: 28, lineHeight: 32, color: item.tone }}>
                {item.value}
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={styles.listBlock}>
          {filteredIncidents.map((incident) => (
            <View key={incident.id} style={[styles.incidentCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderText}>
                  <ThemedText style={styles.incidentCode}>{incident.code}</ThemedText>
                  <ThemedText style={styles.incidentTitle}>{incident.title}</ThemedText>
                </View>
                <View style={[styles.statusPill, { backgroundColor: statusBackground(incident.status, palette) }]}>
                  <ThemedText style={{ color: statusText(incident.status, palette), fontSize: 11, fontWeight: '800' }}>
                    {incident.status.replace('-', ' ').toUpperCase()}
                  </ThemedText>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <ThemedText style={{ color: palette.muted, fontSize: 11 }}>Zone</ThemedText>
                  <ThemedText style={{ color: palette.text, fontWeight: '800' }}>{incident.zone}</ThemedText>
                </View>
                <View style={styles.metaItem}>
                  <ThemedText style={{ color: palette.muted, fontSize: 11 }}>Date</ThemedText>
                  <ThemedText style={{ color: palette.text, fontWeight: '800' }}>{incident.date}</ThemedText>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={[styles.severityPill, { backgroundColor: severityBackground(incident.severity, palette) }]}>
                  <ThemedText style={{ color: severityText(incident.severity, palette), fontSize: 11, fontWeight: '800' }}>
                    {incident.severity.toUpperCase()}
                  </ThemedText>
                </View>

                <Link href={{ pathname: '/incidents/[id]', params: { id: String(incident.id), role: selectedRole.key } }} asChild>
                  <Pressable
                    style={({ pressed }) => [
                      styles.detailButton,
                      { backgroundColor: palette.surface, borderColor: palette.border },
                      pressed && styles.pressed,
                    ]}>
                    <ThemedText style={{ color: palette.text, fontSize: 12, fontWeight: '800' }}>View details</ThemedText>
                  </Pressable>
                </Link>
              </View>

              <ThemedText style={{ color: palette.muted, fontSize: 12, marginTop: 8 }}>
                Reporter: {incident.reporter}
              </ThemedText>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function statusBackground(status: string, palette: Palette) {
  switch (status) {
    case 'resolved':
      return palette.success + '22';
    case 'escalated':
      return palette.danger + '22';
    case 'assigned':
      return '#3b82f622';
    default:
      return palette.warning + '22';
  }
}

function statusText(status: string, palette: Palette) {
  switch (status) {
    case 'resolved':
      return palette.success;
    case 'escalated':
      return palette.danger;
    case 'assigned':
      return '#60a5fa';
    default:
      return palette.warning;
  }
}

function severityBackground(severity: string, palette: Palette) {
  switch (severity) {
    case 'critical':
      return palette.danger + '22';
    case 'high':
      return '#f9731622';
    case 'medium':
      return '#facc1522';
    default:
      return palette.success + '22';
  }
}

function severityText(severity: string, palette: Palette) {
  switch (severity) {
    case 'critical':
      return palette.danger;
    case 'high':
      return '#fb923c';
    case 'medium':
      return '#facc15';
    default:
      return palette.success;
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
  headerBlock: { marginBottom: 14 },
  reportButton: {
    minHeight: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  reportButtonText: {
    color: '#111111',
    fontSize: 14,
    fontWeight: '800',
  },
  searchSection: {
    gap: 12,
    marginTop: 16,
  },
  searchRow: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChip: {
    minHeight: 40,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  listBlock: {
    gap: 12,
    marginTop: 18,
  },
  incidentCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardHeaderText: {
    flex: 1,
    gap: 4,
  },
  incidentCode: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#f97316',
  },
  incidentTitle: {
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 22,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
  },
  metaItem: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  cardFooter: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  severityPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  detailButton: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
});