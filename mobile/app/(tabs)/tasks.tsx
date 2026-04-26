import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { roleProfiles } from '@/constants/mineops';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';


import { globalAuthToken } from '@/constants/auth';

type Palette = typeof Colors.dark;
type TaskStatus = 'pending' | 'in-progress' | 'completed';
type TaskPriority = 'high' | 'medium' | 'low';

type TaskItem = {
  id: string | number;
  title: string;
  description: string;
  assignedTo: string;
  zone: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
};

const FILTERS: ('all' | TaskStatus)[] = ['all', 'pending', 'in-progress', 'completed'];

export default function TasksScreen() {
  useProtectedRoute(['worker', 'supervisor', 'admin', 'authority']);

  const colorScheme = useColorScheme() ?? 'dark';
  const palette = Colors[colorScheme];
  const params = useLocalSearchParams<{ role?: string }>();
  const roleValue = Array.isArray(params.role) ? params.role[0] : params.role;
  const selectedRole = roleProfiles.find((role) => role.key === roleValue) ?? roleProfiles[0];

  const [filterStatus, setFilterStatus] = useState<'all' | TaskStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Task Modal State
  const [isCreating, setIsCreating] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium');
  const [selectedWorkerId, setSelectedWorkerId] = useState('');
  const [workers, setWorkers] = useState<{ id: string, name: string }[]>([]);


  useEffect(() => {
    async function fetchTasks() {
      if (!globalAuthToken) return;
      try {
        const res = await fetch('https://api.pulkitworks.info/api/tasks', {
          headers: { Authorization: `Bearer ${globalAuthToken}` },
        });

        const contentType = res.headers.get('content-type');
        if (res.ok && contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.status === 'success') {
            const rawTasks = data.data || [];
            const mappedTasks = rawTasks.map((t: any) => ({
              id: t.id,
              title: t.task_name || t.title || 'Untitled Task',
              description: t.description || '',
              assignedTo: t.assigned_to || 'Unassigned',
              zone: t.location || 'Site Wide',
              dueDate: t.due_date || 'N/A',
              priority: (t.priority || 'medium').toLowerCase(),
              status: (t.status || 'assigned').replace('_', ' '),
            }));
            setTasks(mappedTasks);
          }
        }
      } catch (err) {
        console.error('Failed to fetch tasks', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchTasks();
  }, []);

  const fetchWorkers = async () => {
    if (!globalAuthToken) return;
    try {
      const res = await fetch('https://api.pulkitworks.info/api/users/workers', {
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

  const handleCreateTask = async () => {
    if (!newTaskTitle || !selectedWorkerId) {
      Alert.alert('Missing Fields', 'Please enter a title and select a worker.');
      return;
    }

    try {
      const res = await fetch('https://api.pulkitworks.info/api/tasks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${globalAuthToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          task_name: newTaskTitle,
          description: newTaskDesc,
          priority: newTaskPriority,
          assigned_to: selectedWorkerId
        })
      });

      const data = await res.json();
      if (data.status === 'success') {
        Alert.alert('Success', 'Task assigned successfully!');
        setIsCreating(false);
        setNewTaskTitle('');
        setNewTaskDesc('');
        setSelectedWorkerId('');
        // Re-fetch tasks
        const refreshRes = await fetch('https://api.pulkitworks.info/api/tasks', {
          headers: { Authorization: `Bearer ${globalAuthToken}` },
        });
        const refreshData = await refreshRes.json();
        if (refreshData.status === 'success') {
          setTasks(refreshData.data.map((t: any) => ({
            id: t.id,
            title: t.task_name || t.title || 'Untitled Task',
            description: t.description || '',
            assignedTo: t.assigned_to || 'Unassigned',
            zone: t.location || 'Site Wide',
            dueDate: t.due_date || 'N/A',
            priority: (t.priority || 'medium').toLowerCase(),
            status: (t.status || 'assigned').replace('_', ' '),
          })));
        }
      } else {
        Alert.alert('Error', data.error || 'Failed to create task');
      }
    } catch (err) {
      Alert.alert('Error', 'Connection failed');
    }
  };

  const handleUpdateStatus = async (taskId: string | number, currentStatus: string) => {
    if (!globalAuthToken) return;

    let nextStatus = '';
    if (currentStatus === 'assigned') nextStatus = 'in_progress';
    else if (currentStatus === 'in progress') nextStatus = 'completed';
    else return;

    try {
      const res = await fetch('https://api.pulkitworks.info/api/tasks/status', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${globalAuthToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          task_id: taskId,
          status: nextStatus
        })
      });

      const data = await res.json();
      if (res.ok) {
        // Optimistically update the UI or re-fetch
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: nextStatus.replace('_', ' ') as any } : t));
        Alert.alert('Success', `Task marked as ${nextStatus.replace('_', ' ')}`);
      } else {
        Alert.alert('Error', data.error || 'Failed to update task');
      }
    } catch (err) {
      Alert.alert('Error', 'Connection failed');
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
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
          <ThemedText type="title">Tasks</ThemedText>
          <ThemedText style={{ color: palette.muted, fontSize: 15, lineHeight: 22, marginTop: 10 }}>
            Manage and track work assignments
          </ThemedText>
        </View>

        <View style={styles.statsGrid}>
          {[
            { label: 'Total Tasks', value: String(tasks.length), tone: '#60a5fa', bg: '#60a5fa22' },
            { label: 'In Progress', value: String(tasks.filter((task) => task.status === 'in-progress').length), tone: palette.warning, bg: palette.warning + '22' },
            { label: 'Pending', value: String(tasks.filter((task) => task.status === 'pending').length), tone: '#eab308', bg: '#eab30822' },
            { label: 'Completed', value: String(tasks.filter((task) => task.status === 'completed').length), tone: palette.success, bg: palette.success + '22' },
          ].map((item) => (
            <View key={item.label} style={[styles.statCard, { backgroundColor: item.bg, borderColor: palette.border }]}>
              <ThemedText style={{ color: palette.muted, fontSize: 12, marginBottom: 4 }}>{item.label}</ThemedText>
              <ThemedText type="title" style={{ fontSize: 28, lineHeight: 32, color: item.tone }}>
                {item.value}
              </ThemedText>
            </View>
          ))}
        </View>

        <View style={[styles.searchBox, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
          <MaterialIcons name="search" size={18} color={palette.muted} />
          <TextInput
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholder="Search tasks..."
            placeholderTextColor={palette.muted}
            style={[styles.searchInput, { color: palette.text }]}
          />
        </View>

        <View style={styles.filterRow}>
          {FILTERS.map((status) => (
            <Pressable
              key={status}
              onPress={() => setFilterStatus(status)}
              style={({ pressed }) => [
                styles.filterChip,
                {
                  backgroundColor: filterStatus === status ? palette.tint : palette.surfaceElevated,
                  borderColor: filterStatus === status ? palette.tint : palette.border,
                },
                pressed && styles.pressed,
              ]}>
              <ThemedText
                style={{
                  color: filterStatus === status ? '#111111' : palette.text,
                  fontSize: 12,
                  fontWeight: '800',
                }}>
                {status.replace('-', ' ').toUpperCase()}
              </ThemedText>
            </Pressable>
          ))}

          {(selectedRole.key === 'supervisor' || selectedRole.key === 'admin' || selectedRole.key === 'authority') ? (
            <Pressable
              onPress={() => {
                setIsCreating(true);
                fetchWorkers();
              }}
              style={({ pressed }) => [
                styles.assignButton,
                { backgroundColor: palette.tint },
                pressed && styles.pressed,
              ]}>
              <MaterialIcons name="add" size={18} color="#111111" />
              <ThemedText lightColor="#111111" darkColor="#111111" style={{ fontSize: 12, fontWeight: '800' }}>
                Assign Task
              </ThemedText>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.taskList}>
          {filteredTasks.map((task) => (
            <View key={task.id} style={[styles.taskCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
              <View style={styles.taskCardTop}>
                <View style={styles.taskStatusIcon}>
                  <MaterialIcons
                    name={task.status === 'completed' ? 'check-circle' : 'radio-button-unchecked'}
                    size={22}
                    color={task.status === 'completed' ? palette.success : palette.muted}
                  />
                </View>
                <View style={[styles.priorityPill, { backgroundColor: priorityBackground(task.priority, palette) }]}>
                  <ThemedText style={{ color: priorityText(task.priority, palette), fontSize: 11, fontWeight: '800' }}>
                    {task.priority.toUpperCase()}
                  </ThemedText>
                </View>
              </View>

              <ThemedText style={styles.taskTitle}>{task.title}</ThemedText>
              <ThemedText style={{ color: palette.muted, fontSize: 13, lineHeight: 19 }}>{task.description}</ThemedText>

              <View style={styles.taskMetaGrid}>
                <MetaRow label="Zone" value={task.zone} palette={palette} />
                <MetaRow label="Assigned" value={task.assignedTo} palette={palette} />
                <MetaRow label="Due" value={task.dueDate} palette={palette} />
              </View>

              <Pressable
                onPress={() => handleUpdateStatus(task.id, task.status)}
                style={({ pressed }) => [
                  styles.taskButton,
                  {
                    backgroundColor: task.status === 'completed' ? palette.surface : palette.tint + '22',
                    borderColor: task.status === 'completed' ? palette.border : palette.tint,
                  },
                  pressed && styles.pressed,
                ]}>
                <ThemedText
                  style={{
                    color: task.status === 'completed' ? palette.muted : palette.tint,
                    fontSize: 12,
                    fontWeight: '800',
                  }}>
                  {task.status === 'assigned' ? 'Start Task' :
                    task.status === 'in-progress' ? 'Complete Task' : 'Completed'}
                </ThemedText>
              </Pressable>
            </View>
          ))}
        </View>
        <Modal
          visible={isCreating}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setIsCreating(false)}>
          <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.7)' }]}>
            <View style={[styles.modalContent, { backgroundColor: palette.background, borderColor: palette.border }]}>
              <View style={styles.modalHeader}>
                <ThemedText type="subtitle">Assign New Task</ThemedText>
                <Pressable onPress={() => setIsCreating(false)}>
                  <MaterialIcons name="close" size={24} color={palette.text} />
                </Pressable>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>Task Title *</ThemedText>
                  <TextInput
                    value={newTaskTitle}
                    onChangeText={setNewTaskTitle}
                    placeholder="E.g. Inspect Conveyor Belt"
                    placeholderTextColor={palette.muted}
                    style={[styles.input, { backgroundColor: palette.surface, borderColor: palette.border, color: palette.text }]}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>Description</ThemedText>
                  <TextInput
                    value={newTaskDesc}
                    onChangeText={setNewTaskDesc}
                    placeholder="Details about the task..."
                    placeholderTextColor={palette.muted}
                    multiline
                    numberOfLines={3}
                    style={[styles.input, { backgroundColor: palette.surface, borderColor: palette.border, color: palette.text, minHeight: 80, textAlignVertical: 'top', paddingTop: 12 }]}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>Priority</ThemedText>
                  <View style={styles.priorityRow}>
                    {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => (
                      <Pressable
                        key={p}
                        onPress={() => setNewTaskPriority(p)}
                        style={[
                          styles.priorityOption,
                          {
                            backgroundColor: newTaskPriority === p ? palette.tint : palette.surface,
                            borderColor: palette.border
                          }
                        ]}>
                        <ThemedText style={{ color: newTaskPriority === p ? '#111111' : palette.text, fontSize: 12, fontWeight: '800', textTransform: 'uppercase' }}>{p}</ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>Assign To *</ThemedText>
                  <View style={styles.workerList}>
                    {workers.length === 0 ? (
                      <ThemedText style={{ color: palette.muted, fontSize: 13, textAlign: 'center', padding: 20 }}>No workers available</ThemedText>
                    ) : (
                      workers.map((w) => (
                        <Pressable
                          key={w.id}
                          onPress={() => setSelectedWorkerId(w.id)}
                          style={[
                            styles.workerOption,
                            {
                              backgroundColor: selectedWorkerId === w.id ? palette.tint + '22' : palette.surface,
                              borderColor: selectedWorkerId === w.id ? palette.tint : palette.border
                            }
                          ]}>
                          <ThemedText style={{ color: selectedWorkerId === w.id ? palette.tint : palette.text, fontWeight: selectedWorkerId === w.id ? '800' : '400' }}>{w.name}</ThemedText>
                          {selectedWorkerId === w.id && <MaterialIcons name="check" size={18} color={palette.tint} />}
                        </Pressable>
                      ))
                    )}
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <Pressable
                  onPress={handleCreateTask}
                  style={({ pressed }) => [
                    styles.primaryButton,
                    { backgroundColor: palette.tint, width: '100%' },
                    pressed && styles.pressed,
                  ]}>
                  <ThemedText lightColor="#111111" darkColor="#111111" style={{ fontWeight: '800' }}>Create Task</ThemedText>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetaRow({ label, value, palette }: { label: string; value: string; palette: Palette }) {
  return (
    <View style={styles.metaRow}>
      <ThemedText style={{ color: palette.muted, fontSize: 12 }}>{label}</ThemedText>
      <ThemedText style={{ color: palette.text, fontSize: 12, fontWeight: '800' }}>{value}</ThemedText>
    </View>
  );
}

function priorityBackground(priority: TaskPriority, palette: Palette) {
  switch (priority) {
    case 'high':
      return palette.danger + '22';
    case 'medium':
      return palette.warning + '22';
    default:
      return palette.success + '22';
  }
}

function priorityText(priority: TaskPriority, palette: Palette) {
  switch (priority) {
    case 'high':
      return palette.danger;
    case 'medium':
      return palette.warning;
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
  searchBox: {
    marginTop: 16,
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
    alignItems: 'center',
  },
  filterChip: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  assignButton: {
    minHeight: 40,
    borderRadius: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  taskList: {
    gap: 12,
    marginTop: 16,
  },
  taskCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  taskCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  taskStatusIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  priorityPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  taskMetaGrid: {
    gap: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  taskButton: {
    minHeight: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 28,
    borderWidth: 1,
    padding: 24,
    gap: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalBody: {
    gap: 16,
  },
  modalFooter: {
    marginTop: 10,
  },
  inputGroup: {
    gap: 8,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityOption: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  workerList: {
    gap: 8,
  },
  workerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
});
