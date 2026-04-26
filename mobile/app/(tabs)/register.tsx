import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { toApiRole } from '@/constants/roles';
import { API_BASE_URL } from '@/constants/api';

const roleOptions = ['worker', 'supervisor', 'safety', 'admin', 'authority'] as const;

type RequestedRole = (typeof roleOptions)[number];

export default function RegisterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'dark';
  const palette = Colors[colorScheme];
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    employeeId: '',
    email: '',
    requestedRole: 'worker' as RequestedRole,
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!isSubmitted) {
      return;
    }

    const timeoutId = setTimeout(() => {
      router.replace('/login');
    }, 2500);

    return () => clearTimeout(timeoutId);
  }, [isSubmitted, router]);

  const updateField = (key: keyof typeof formData, value: string) => {
    setFormData((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleSubmit = async () => {
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Passwords do not match', 'Please confirm the same password before submitting.');
      return;
    }

    if (!formData.fullName || !formData.email || !formData.password) {
      Alert.alert('Missing Fields', 'Please fill out all required fields.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          employee_id: formData.employeeId,
          password: formData.password,
          role: toApiRole(formData.requestedRole),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Registration Failed', data.error || 'An error occurred during registration.');
        return;
      }

      setIsSubmitted(true);
    } catch (error: any) {
      console.error('Registration Network Error:', error);
      Alert.alert(
        'Network Error',
        `Could not connect to the server. Details: ${error.message || 'Unknown error'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
        <View style={styles.successShell}>
          <View style={[styles.successCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
            <View style={[styles.successIcon, { backgroundColor: palette.surfaceMuted, borderColor: palette.border }]}>
              <MaterialIcons name="check-circle" size={34} color={palette.success} />
            </View>
            <ThemedText type="subtitle" style={styles.successTitle}>
              Registration Request Submitted
            </ThemedText>
            <ThemedText style={{ color: palette.muted, fontSize: 14, lineHeight: 22, textAlign: 'center' }}>
              Your account request has been submitted for approval. An administrator will review your request and assign a role accordingly.
            </ThemedText>
            <ThemedText style={{ color: palette.muted, fontSize: 12, marginTop: 8 }}>
              Redirecting to login...
            </ThemedText>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={{ backgroundColor: palette.background }}
          contentContainerStyle={[styles.scrollContent, { backgroundColor: palette.background }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.topRow}>
            <View>
              <ThemedText type="subtitle">MineOps</ThemedText>
              <ThemedText style={{ color: palette.muted, fontSize: 13, lineHeight: 18 }}>
                Create Your Account
              </ThemedText>
            </View>

            <Link href={{ pathname: '/', params: { noredirect: 'true' } }} asChild>
              <Pressable style={({ pressed }) => [styles.backButton, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }, pressed && styles.pressed]}>
                <MaterialIcons name="home" size={18} color={palette.text} />
              </Pressable>
            </Link>
          </View>

          <View style={[styles.card, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
            <View style={[styles.heroAccent, { backgroundColor: palette.tint }]} />
            <ThemedText type="title">User Registration</ThemedText>
            <ThemedText style={{ color: palette.muted, fontSize: 15, lineHeight: 22, marginTop: 10 }}>
              Account request workflow with admin approval.
            </ThemedText>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>Full Name</ThemedText>
              <TextInput
                value={formData.fullName}
                onChangeText={(value) => updateField('fullName', value)}
                placeholder="Enter your full name"
                placeholderTextColor={palette.muted}
                style={[
                  styles.input,
                  {
                    backgroundColor: palette.surface,
                    borderColor: palette.border,
                    color: palette.text,
                  },
                ]}
              />
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>Employee ID</ThemedText>
              <TextInput
                value={formData.employeeId}
                onChangeText={(value) => updateField('employeeId', value)}
                placeholder="Enter your employee ID"
                placeholderTextColor={palette.muted}
                style={[
                  styles.input,
                  {
                    backgroundColor: palette.surface,
                    borderColor: palette.border,
                    color: palette.text,
                  },
                ]}
              />
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>Email</ThemedText>
              <TextInput
                value={formData.email}
                onChangeText={(value) => updateField('email', value)}
                placeholder="Enter your email"
                placeholderTextColor={palette.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[
                  styles.input,
                  {
                    backgroundColor: palette.surface,
                    borderColor: palette.border,
                    color: palette.text,
                  },
                ]}
              />
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>Requested Role</ThemedText>
              <View style={styles.roleRow}>
                {roleOptions.map((role) => {
                  const active = formData.requestedRole === role;
                  return (
                    <Pressable
                      key={role}
                      onPress={() => updateField('requestedRole', role)}
                      style={[
                        styles.roleChip,
                        {
                          backgroundColor: active ? palette.tint : palette.surface,
                          borderColor: active ? palette.tint : palette.border,
                        },
                      ]}>
                      <ThemedText
                        lightColor={active ? '#111111' : palette.text}
                        darkColor={active ? '#111111' : palette.text}
                        style={{ fontSize: 12, fontWeight: '800', textTransform: 'capitalize' }}>
                        {role}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
              <ThemedText style={{ color: palette.muted, fontSize: 12, lineHeight: 18 }}>
                Final role assignment is made by Admin/Authority policy.
              </ThemedText>
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>Create Password</ThemedText>
              <TextInput
                value={formData.password}
                onChangeText={(value) => updateField('password', value)}
                placeholder="Enter secure password"
                placeholderTextColor={palette.muted}
                secureTextEntry
                style={[
                  styles.input,
                  {
                    backgroundColor: palette.surface,
                    borderColor: palette.border,
                    color: palette.text,
                  },
                ]}
              />
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>Confirm Password</ThemedText>
              <TextInput
                value={formData.confirmPassword}
                onChangeText={(value) => updateField('confirmPassword', value)}
                placeholder="Confirm your password"
                placeholderTextColor={palette.muted}
                secureTextEntry
                style={[
                  styles.input,
                  {
                    backgroundColor: palette.surface,
                    borderColor: palette.border,
                    color: palette.text,
                  },
                ]}
              />
            </View>

            <Pressable
              onPress={handleSubmit}
              disabled={isLoading}
              style={({ pressed }) => [styles.primaryButton, { backgroundColor: isLoading ? palette.muted : palette.tint }, pressed && styles.pressed]}>
              <ThemedText lightColor="#111111" darkColor="#111111" style={styles.primaryButtonText}>
                {isLoading ? 'Submitting...' : 'Submit Registration Request'}
              </ThemedText>
            </Pressable>

            <View style={[styles.noteCard, { backgroundColor: palette.surfaceMuted, borderColor: palette.border }]}>
              <MaterialIcons name="info-outline" size={16} color={palette.tint} />
              <ThemedText style={{ color: palette.muted, fontSize: 12, lineHeight: 18, flex: 1 }}>
                Your final role will be assigned by the system administrator after approval.
              </ThemedText>
            </View>
          </View>

          <View style={styles.linkRow}>
            <ThemedText style={{ color: palette.muted, fontSize: 13 }}>Already have an account?</ThemedText>
            <Link href="/login" asChild>
              <Pressable>
                <ThemedText style={{ color: palette.tint, fontSize: 13, fontWeight: '800' }}>Sign In</ThemedText>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  successShell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  successCard: {
    width: '100%',
    maxWidth: 480,
    borderRadius: 28,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
    gap: 14,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    textAlign: 'center',
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
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  card: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 22,
    gap: 16,
  },
  heroAccent: {
    width: 42,
    height: 6,
    borderRadius: 999,
  },
  fieldGroup: {
    gap: 8,
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
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  primaryButton: {
    minHeight: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    flexWrap: 'wrap',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
});
