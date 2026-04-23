import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { roleProfiles } from '@/constants/mineops';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { setGlobalAuthToken, setGlobalUserRole } from '@/constants/auth';


export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'dark';
  const palette = Colors[colorScheme];
  const params = useLocalSearchParams<{ role?: string; demo?: string }>();
  const initialRole = useMemo(() => {
    const roleValue = Array.isArray(params.role) ? params.role[0] : params.role;
    return roleProfiles.find((role) => role.key === roleValue)?.key ?? 'worker';
  }, [params.role]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState(initialRole);
  const [isLoading, setIsLoading] = useState(false);

  const navigateToDashboard = (role: string) => {
    router.push({ pathname: '/dashboard/[role]', params: { role } });
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Fields', 'Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://api.pulkitworks.info:5000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Login Failed', data.error || 'Invalid credentials');
        return;
      }

      const userRole = data.user?.role || selectedRole;
      await setGlobalAuthToken(data.access_token);
      await setGlobalUserRole(userRole);
      navigateToDashboard(userRole);
    } catch {
      Alert.alert('Network Error', 'Could not connect to the server.');
    } finally {
      setIsLoading(false);
    }
  };

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
                Coal Mine Safety Login
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
            <ThemedText type="title">Mine Safety Login</ThemedText>
            <ThemedText style={{ color: palette.muted, fontSize: 15, lineHeight: 22, marginTop: 10 }}>
              Sign in with your employee ID or email. Access level is assigned by backend policy after authentication.
            </ThemedText>

            <View style={styles.roleRow}>
              {roleProfiles.map((role) => {
                const active = selectedRole === role.key;
                return (
                  <Pressable
                    key={role.key}
                    onPress={() => setSelectedRole(role.key)}
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
                      style={{ fontSize: 12, fontWeight: '800' }}>
                      {role.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>Email / Employee ID</ThemedText>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email or employee ID"
                placeholderTextColor={palette.muted}
                autoCapitalize="none"
                keyboardType="email-address"
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
              <ThemedText style={styles.label}>Password</ThemedText>
              <TextInput
                value={password}
                onChangeText={setPassword}
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

            <View style={[styles.noteCard, { backgroundColor: palette.surfaceMuted, borderColor: palette.border }]}>
              <MaterialIcons name="info-outline" size={16} color={palette.tint} />
              <ThemedText style={{ color: palette.muted, fontSize: 12, lineHeight: 18, flex: 1 }}>
                Assigned role is resolved by policy after authentication. UI cannot elevate privileges.
              </ThemedText>
            </View>

            <Pressable
              onPress={handleLogin}
              disabled={isLoading}
              style={({ pressed }) => [styles.primaryButton, { backgroundColor: isLoading ? palette.muted : palette.tint }, pressed && styles.pressed]}>
              <ThemedText lightColor="#111111" darkColor="#111111" style={styles.primaryButtonText}>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </ThemedText>
            </Pressable>
          </View>

          <View style={styles.linkRow}>
            <ThemedText style={{ color: palette.muted, fontSize: 13 }}>Don&apos;t have an account?</ThemedText>
            <Link href="/register" asChild>
              <Pressable>
                <ThemedText style={{ color: palette.tint, fontSize: 13, fontWeight: '800' }}>Create Account</ThemedText>
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
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
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
  demoSection: {
    marginTop: 18,
    gap: 12,
  },
  demoToggle: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  demoList: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 12,
    gap: 10,
  },
  demoItem: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  demoAvatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoText: {
    flex: 1,
    gap: 2,
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
