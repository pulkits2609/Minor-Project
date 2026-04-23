import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View, ActivityIndicator, Alert, Modal, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { globalAuthToken } from '@/constants/auth';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { roleProfiles } from '@/constants/mineops';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';

type Palette = typeof Colors.dark;

type ShiftRecord = {
  id: string;
  start_time: string;
  end_time: string;
  location: string;
  created_by: string;
};

type Worker = {
  id: string;
  name: string;
  email: string;
};

export default function ShiftsScreen() {
  useProtectedRoute(['worker', 'supervisor', 'admin', 'authority']);

  const colorScheme = useColorScheme() ?? 'dark';
  const palette = Colors[colorScheme];
  const params = useLocalSearchParams<{ role?: string }>();
  const roleValue = Array.isArray(params.role) ? params.role[0] : params.role;
  const selectedRole = roleProfiles.find((role) => role.key === roleValue) ?? roleProfiles[0];

  const isSupervisor = ['supervisor', 'admin', 'authority'].includes(selectedRole.key);

  const [shifts, setShifts] = useState<ShiftRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create Shift State
  const [isCreating, setIsCreating] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [newLocation, setNewLocation] = useState('');

  // Assign Worker State
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);

  const fetchShifts = async () => {
    if (!globalAuthToken) return;
    setLoading(true);
    try {
      const res = await fetch('https://api.pulkitworks.info:5000/api/shifts', {
        headers: { Authorization: `Bearer ${globalAuthToken}` },
      });

      const contentType = res.headers.get('content-type');
      if (!res.ok || !contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Shifts API error:', text);
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      if (data.status === 'success') {
        setShifts(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch shifts', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async () => {
    if (!globalAuthToken) return;
    try {
      const res = await fetch('https://api.pulkitworks.info:5000/api/users/workers', {
        headers: { Authorization: `Bearer ${globalAuthToken}` },
      });
      const data = await res.json();
      if (data.status === 'success') {
        setWorkers(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch workers', err);
    }
  };

  useEffect(() => {
    fetchShifts();
    if (isSupervisor) {
      fetchWorkers();
    }
  }, []);

  const handleCreateShift = async () => {
    if (!newLocation) {
      Alert.alert('Missing Fields', 'Please enter a location for the shift.');
      return;
    }

    // Helper to format Date to "YYYY-MM-DD HH:MM:SS"
    const formatTimestamp = (date: Date) => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      const y = date.getFullYear();
      const m = pad(date.getMonth() + 1);
      const d = pad(date.getDate());
      const h = pad(date.getHours());
      const mm = pad(date.getMinutes());
      return `${y}-${m}-${d} ${h}:${mm}:00`;
    };

    try {
      const res = await fetch('https://api.pulkitworks.info:5000/api/shifts', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${globalAuthToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          start_time: formatTimestamp(startDate),
          end_time: formatTimestamp(endDate),
          location: newLocation
        })
      });
      
      const data = await res.json();
      if (data.status === 'success') {
        Alert.alert('Success', 'Shift created successfully!');
        setIsCreating(false);
        setNewLocation('');
        setStartDate(new Date());
        setEndDate(new Date());
        fetchShifts();
      } else {
        Alert.alert('Error', data.error || data.message || 'Failed to create shift');
      }
    } catch (err) {
      Alert.alert('Error', 'Network request failed');
    }
  };

  const handleAssignWorker = async (userId: string) => {
    if (!selectedShiftId) return;
    try {
      const res = await fetch(`https://api.pulkitworks.info:5000/api/shifts/${selectedShiftId}/assign`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${globalAuthToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user_ids: [userId] })
      });
      
      const data = await res.json();
      if (data.status === 'success') {
        Alert.alert('Success', 'Worker assigned to shift!');
        setAssignModalVisible(false);
      } else {
        Alert.alert('Error', data.error || 'Failed to assign worker');
      }
    } catch (err) {
      Alert.alert('Error', 'Network request failed');
    }
  };

  if (loading && shifts.length === 0) {
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
        
        {/* Top Header */}
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
            <ThemedText type="subtitle" style={styles.brand}>MineOps</ThemedText>
            <ThemedText style={{ color: palette.muted, fontSize: 13, lineHeight: 18 }}>Shift Management</ThemedText>
          </View>
        </View>

        {/* Supervisor Create Button */}
        {isSupervisor && !isCreating && (
          <Pressable
            onPress={() => setIsCreating(true)}
            style={({ pressed }) => [
              styles.createButton,
              { backgroundColor: palette.tint },
              pressed && styles.pressed,
            ]}>
            <MaterialIcons name="add" size={20} color="#111111" />
            <ThemedText lightColor="#111111" darkColor="#111111" style={{ fontWeight: '800' }}>Create New Shift</ThemedText>
          </Pressable>
        )}

        {/* Create Form */}
        {isCreating && (
          <View style={[styles.formCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
            <ThemedText type="subtitle" style={{ marginBottom: 16 }}>New Shift Details</ThemedText>
            
            <View style={styles.inputGroup}>
              <ThemedText style={{ color: palette.muted, fontSize: 12, marginBottom: 6 }}>Start Time</ThemedText>
              <Pressable 
                onPress={() => setShowStartPicker(true)}
                style={[styles.input, { backgroundColor: palette.surface, borderColor: palette.border, justifyContent: 'center' }]}>
                <ThemedText>{startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</ThemedText>
              </Pressable>
              {showStartPicker && (
                <DateTimePicker
                  value={startDate}
                  mode="time"
                  is24Hour={false}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                    setShowStartPicker(false);
                    if (selectedDate) setStartDate(selectedDate);
                  }}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={{ color: palette.muted, fontSize: 12, marginBottom: 6 }}>End Time</ThemedText>
              <Pressable 
                onPress={() => setShowEndPicker(true)}
                style={[styles.input, { backgroundColor: palette.surface, borderColor: palette.border, justifyContent: 'center' }]}>
                <ThemedText>{endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</ThemedText>
              </Pressable>
              {showEndPicker && (
                <DateTimePicker
                  value={endDate}
                  mode="time"
                  is24Hour={false}
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                    setShowEndPicker(false);
                    if (selectedDate) setEndDate(selectedDate);
                  }}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={{ color: palette.muted, fontSize: 12, marginBottom: 6 }}>Zone / Location</ThemedText>
              <TextInput
                value={newLocation}
                onChangeText={setNewLocation}
                style={[styles.input, { backgroundColor: palette.surface, borderColor: palette.border, color: palette.text }]}
                placeholderTextColor={palette.muted}
                placeholder="Zone Alpha"
              />
            </View>

            <View style={styles.formActions}>
              <Pressable
                onPress={() => setIsCreating(false)}
                style={({ pressed }) => [styles.cancelBtn, { borderColor: palette.border }, pressed && styles.pressed]}>
                <ThemedText style={{ color: palette.text }}>Cancel</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleCreateShift}
                style={({ pressed }) => [styles.submitBtn, { backgroundColor: palette.tint }, pressed && styles.pressed]}>
                <ThemedText lightColor="#111111" darkColor="#111111" style={{ fontWeight: '800' }}>Save Shift</ThemedText>
              </Pressable>
            </View>
          </View>
        )}

        {/* Shift List */}
        <ThemedText type="subtitle" style={{ marginTop: 24, marginBottom: 16 }}>
          {isSupervisor ? 'Active Shifts' : 'My Schedule'}
        </ThemedText>

        {shifts.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
            <MaterialIcons name="event-busy" size={48} color={palette.muted} style={{ marginBottom: 12 }} />
            <ThemedText style={{ color: palette.muted }}>No shifts found.</ThemedText>
          </View>
        ) : (
          shifts.map((shift) => (
            <View key={shift.id} style={[styles.shiftCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
              <View style={styles.shiftHeader}>
                <View style={styles.shiftIcon}>
                  <MaterialIcons name="schedule" size={20} color={palette.tint} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ fontWeight: '800', fontSize: 16 }}>{shift.location || 'Unassigned Zone'}</ThemedText>
                  <ThemedText style={{ color: palette.muted, fontSize: 13, marginTop: 2 }}>
                    {shift.start_time} - {shift.end_time}
                  </ThemedText>
                </View>
                <View style={[styles.badge, { backgroundColor: palette.tint + '22' }]}>
                  <ThemedText style={{ color: palette.tint, fontSize: 10, fontWeight: '800' }}>ACTIVE</ThemedText>
                </View>
              </View>

              {isSupervisor && (
                <View style={[styles.shiftFooter, { borderTopColor: palette.border }]}>
                  <ThemedText style={{ color: palette.muted, fontSize: 12, flex: 1 }}>
                    ID: {shift.id.substring(0,8)}...
                  </ThemedText>
                  <Pressable 
                    onPress={() => {
                      setSelectedShiftId(shift.id);
                      setAssignModalVisible(true);
                    }}
                    style={({ pressed }) => [styles.assignBtn, { backgroundColor: palette.surface, borderColor: palette.border }, pressed && styles.pressed]}>
                    <MaterialIcons name="person-add" size={14} color={palette.text} />
                    <ThemedText style={{ color: palette.text, fontSize: 12, fontWeight: '700' }}>Assign</ThemedText>
                  </Pressable>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Assignment Modal */}
      <Modal
        visible={assignModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAssignModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: palette.background, borderColor: palette.border }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">Assign Worker</ThemedText>
              <Pressable onPress={() => setAssignModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={palette.text} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalScroll}>
              {workers.length === 0 ? (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <ThemedText style={{ color: palette.muted }}>No workers found to assign.</ThemedText>
                </View>
              ) : (
                workers.map(w => (
                  <Pressable
                    key={w.id}
                    onPress={() => handleAssignWorker(w.id)}
                    style={({ pressed }) => [
                      styles.workerRow,
                      { borderBottomColor: palette.border },
                      pressed && { backgroundColor: palette.surfaceElevated }
                    ]}
                  >
                    <View style={[styles.workerAvatar, { backgroundColor: palette.surface }]}>
                      <ThemedText style={{ color: palette.tint, fontWeight: '800' }}>{w.name.charAt(0)}</ThemedText>
                    </View>
                    <View>
                      <ThemedText style={{ fontWeight: '600' }}>{w.name}</ThemedText>
                      <ThemedText style={{ color: palette.muted, fontSize: 12 }}>{w.email}</ThemedText>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color={palette.muted} style={{ marginLeft: 'auto' }} />
                  </Pressable>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

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
  brand: { marginBottom: 2 },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  formCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 12,
  },
  submitBtn: {
    flex: 1,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  shiftCard: {
    borderWidth: 1,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
  },
  shiftHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 14,
  },
  shiftIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  shiftFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  assignBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }]
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '70%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalScroll: {
    flex: 1,
  },
  workerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 16,
  },
  workerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
