import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { roleProfiles } from '@/constants/mineops';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { globalAuthToken } from '@/constants/auth';

type Palette = typeof Colors.dark;

type IncidentFormState = {
  type: string;
  title: string;
  description: string;
  zone: string;
  severity: string;
};

const INCIDENT_TYPES = [
  'Safety Hazard',
  'Equipment Malfunction',
  'Near Miss',
  'Injury',
  'Environmental Issue',
  'Other',
];

const ZONES = ['Zone A', 'Zone B', 'Zone C', 'Zone D'];
const SEVERITIES = ['Low', 'Medium', 'High', 'Critical'];

export default function IncidentReportScreen() {
  useProtectedRoute(['worker', 'supervisor', 'safety']);

  const colorScheme = useColorScheme() ?? 'dark';
  const palette = Colors[colorScheme];
  const accent = palette.tint;
  const params = useLocalSearchParams<{ role?: string }>();
  const roleValue = Array.isArray(params.role) ? params.role[0] : params.role;
  const selectedRole = roleProfiles.find((role) => role.key === roleValue) ?? roleProfiles[0];

  const [submitted, setSubmitted] = useState(false);
  const [reference, setReference] = useState('');
  const [formState, setFormState] = useState<IncidentFormState>({
    type: 'Safety Hazard',
    title: '',
    description: '',
    zone: 'Zone A',
    severity: 'Medium',
  });

  const updateField = <Key extends keyof IncidentFormState>(field: Key, value: IncidentFormState[Key]) => {
    setFormState((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!globalAuthToken) {
      Alert.alert('Session Expired', 'Please login again to submit an incident.');
      return;
    }
    if (!formState.title.trim() || !formState.description.trim()) {
      Alert.alert('Missing Fields', 'Incident title and detailed description are required.');
      return;
    }

    try {
      const res = await fetch('https://api.pulkitworks.info:5000/incidents/smp/hazard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${globalAuthToken}`,
        },
        body: JSON.stringify({
          location: formState.zone,
          severity: formState.severity,
          description: formState.description.trim(),
          hazard_description: `${formState.type}: ${formState.title.trim()}. ${formState.description.trim()}`,
        }),
      });

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Incident API error:', text);
        Alert.alert('Error', 'Server returned an invalid response.');
        return;
      }

      const data = await res.json();
      
      if (!res.ok) {
        Alert.alert('Error', data.error || data.message || 'Failed to submit incident');
        return;
      }

      if (data.status === 'success') {
        setReference(data.reference);
        setSubmitted(true);
      } else {
        Alert.alert('Error', data.message || data.error || 'Failed to submit incident');
      }
    } catch (err) {
      console.error('Failed to submit incident', err);
      Alert.alert('Network Error', 'Could not connect to the server.');
    }
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
              {selectedRole.label} workflow
            </ThemedText>
          </View>
        </View>

        {submitted ? (
          <View style={[styles.successCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
            <View style={[styles.successIcon, { backgroundColor: palette.surfaceMuted }]}>
              <MaterialIcons name="check-circle" size={24} color={palette.success} />
            </View>
            <ThemedText type="title">Incident Reported</ThemedText>
            <ThemedText style={{ color: palette.muted, fontSize: 15, lineHeight: 22, marginTop: 10 }}>
              Your incident report has been submitted. Reference:{' '}
              <ThemedText style={{ color: palette.text, fontWeight: '800' }}>{reference}</ThemedText>
            </ThemedText>
            <Pressable
              onPress={() => setSubmitted(false)}
              style={({ pressed }) => [
                styles.secondaryButton,
                { backgroundColor: palette.surface, borderColor: palette.border },
                pressed && styles.pressed,
              ]}>
              <ThemedText style={{ fontSize: 14, fontWeight: '800' }}>Submit another report</ThemedText>
            </Pressable>
          </View>
        ) : (
          <View style={[styles.formCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
            <View style={styles.headerBlock}>
              <ThemedText type="title">Report Incident</ThemedText>
              <ThemedText style={{ color: palette.muted, fontSize: 15, lineHeight: 22, marginTop: 10 }}>
                Report a safety concern or hazard immediately
              </ThemedText>
            </View>

            <FieldGroup label="Incident Type *" palette={palette}>
              <View style={styles.chipGrid}>
                {INCIDENT_TYPES.map((option) => {
                  const selected = formState.type === option;
                  return (
                    <Pressable
                      key={option}
                      onPress={() => updateField('type', option)}
                      style={({ pressed }) => [
                        styles.chip,
                        {
                          backgroundColor: selected ? accent : palette.surface,
                          borderColor: selected ? accent : palette.border,
                        },
                        pressed && styles.pressed,
                      ]}>
                      <ThemedText
                        style={{
                          color: selected ? '#111111' : palette.text,
                          fontSize: 13,
                          fontWeight: '800',
                        }}>
                        {option}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            </FieldGroup>

            <FieldGroup label="Incident Title *" palette={palette}>
              <TextInput
                value={formState.title}
                onChangeText={(value) => updateField('title', value)}
                placeholder="Brief description of the incident"
                placeholderTextColor={palette.muted}
                style={[
                  styles.textInput,
                  {
                    backgroundColor: palette.surface,
                    borderColor: palette.border,
                    color: palette.text,
                  },
                ]}
              />
            </FieldGroup>

            <FieldGroup label="Detailed Description *" palette={palette}>
              <TextInput
                value={formState.description}
                onChangeText={(value) => updateField('description', value)}
                placeholder="Provide detailed information about the incident..."
                placeholderTextColor={palette.muted}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                style={[
                  styles.textArea,
                  {
                    backgroundColor: palette.surface,
                    borderColor: palette.border,
                    color: palette.text,
                  },
                ]}
              />
            </FieldGroup>

            <View style={styles.twoColumnRow}>
              <FieldGroup label="Zone *" palette={palette} style={styles.halfColumn}>
                <View style={styles.chipGrid}>
                  {ZONES.map((option) => {
                    const selected = formState.zone === option;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => updateField('zone', option)}
                        style={({ pressed }) => [
                          styles.chip,
                          styles.smallChip,
                          {
                            backgroundColor: selected ? accent : palette.surface,
                            borderColor: selected ? accent : palette.border,
                          },
                          pressed && styles.pressed,
                        ]}>
                        <ThemedText
                          style={{
                            color: selected ? '#111111' : palette.text,
                            fontSize: 13,
                            fontWeight: '800',
                          }}>
                          {option}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              </FieldGroup>

              <FieldGroup label="Severity *" palette={palette} style={styles.halfColumn}>
                <View style={styles.chipGrid}>
                  {SEVERITIES.map((option) => {
                    const selected = formState.severity === option;
                    return (
                      <Pressable
                        key={option}
                        onPress={() => updateField('severity', option)}
                        style={({ pressed }) => [
                          styles.chip,
                          styles.smallChip,
                          {
                            backgroundColor: selected ? accent : palette.surface,
                            borderColor: selected ? accent : palette.border,
                          },
                          pressed && styles.pressed,
                        ]}>
                        <ThemedText
                          style={{
                            color: selected ? '#111111' : palette.text,
                            fontSize: 13,
                            fontWeight: '800',
                          }}>
                          {option}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              </FieldGroup>
            </View>

            <View style={styles.footerRow}>
              <Pressable
                onPress={handleSubmit}
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: accent },
                  pressed && styles.pressed,
                ]}>
                <ThemedText lightColor="#111111" darkColor="#111111" style={styles.primaryButtonText}>
                  Submit Incident Report
                </ThemedText>
              </Pressable>

              <Link href={{ pathname: '/dashboard/[role]', params: { role: selectedRole.key } }} asChild>
                <Pressable
                  style={({ pressed }) => [
                    styles.secondaryButton,
                    { backgroundColor: palette.surface, borderColor: palette.border },
                    pressed && styles.pressed,
                  ]}>
                  <ThemedText style={{ fontSize: 14, fontWeight: '800' }}>Cancel</ThemedText>
                </Pressable>
              </Link>
            </View>

            <ThemedText style={{ color: palette.muted, fontSize: 12, lineHeight: 18, textAlign: 'center' }}>
              Your report is confidential and will be reviewed by the safety team.
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function FieldGroup({
  label,
  palette,
  children,
  style,
}: {
  label: string;
  palette: Palette;
  children: React.ReactNode;
  style?: object;
}) {
  return (
    <View style={[styles.fieldGroup, style]}>
      <ThemedText style={styles.fieldLabel}>{label}</ThemedText>
      {children}
    </View>
  );
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
  formCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 20,
    gap: 18,
  },
  successCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 24,
    gap: 16,
    alignItems: 'center',
  },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldGroup: {
    gap: 10,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallChip: {
    flexGrow: 1,
    minWidth: '46%',
  },
  textInput: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  textArea: {
    minHeight: 130,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 14,
    fontSize: 15,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  halfColumn: {
    flex: 1,
    minWidth: '100%',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  primaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
});
