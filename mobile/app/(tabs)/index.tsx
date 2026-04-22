import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { roleProfiles } from '@/constants/mineops';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect, useState } from 'react';

import { loadAuthState } from '@/constants/auth';

export default function LandingScreen() {
  const colorScheme = useColorScheme() ?? 'dark';
  const palette = Colors[colorScheme];
  const accent = palette.tint;
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  const { noredirect } = useLocalSearchParams();

  useEffect(() => {
    async function checkAuth() {
      const { token, role } = await loadAuthState();
      if (token && role && noredirect !== 'true') {
        // Automatically route them to their dashboard
        router.replace({ pathname: '/dashboard/[role]', params: { role } });
      } else {
        setIsReady(true);
      }
    }
    checkAuth();
  }, [router]);

  if (!isReady) return null;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: palette.background }]} edges={['top']}>
      <ScrollView
        style={{ backgroundColor: palette.background }}
        contentContainerStyle={[styles.scrollContent, { backgroundColor: palette.background }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.navbar}>
          <View>
            <ThemedText type="subtitle" style={styles.brand}>
              MineOps
            </ThemedText>
            <ThemedText style={{ color: palette.muted, fontSize: 12 }}>
              Safety First
            </ThemedText>
          </View>

          <View style={styles.navActions}>
            <Link href="/login" asChild>
              <Pressable style={({ pressed }) => [styles.navLogin, { backgroundColor: accent }, pressed && styles.pressed]}>
                <ThemedText lightColor="#111111" darkColor="#111111" style={{ fontSize: 13, fontWeight: '800' }}>
                  Sign In
                </ThemedText>
              </Pressable>
            </Link>
          </View>
        </View>

        <View style={[styles.heroCard, { backgroundColor: palette.surfaceElevated, borderColor: palette.border }]}>
          <View
            style={[
              styles.heroGlow,
              { backgroundColor: accent, opacity: colorScheme === 'dark' ? 0.18 : 0.1 },
            ]}
          />
          <View style={[styles.heroAccent, { backgroundColor: accent }]} />
          <ThemedText type="title">Coal Mine Safety & Productivity System</ThemedText>
          <ThemedText style={[styles.heroCopy, { color: palette.muted }]}>
            Real-time monitoring, incident reporting, and role-based control for safer and smarter mining operations.
          </ThemedText>

          <View style={styles.heroActions}>
            <Link href="/login" asChild>
              <Pressable style={({ pressed }) => [styles.primaryButton, { backgroundColor: accent, opacity: pressed ? 0.88 : 1 }]}>
                <MaterialIcons name="login" size={18} color="#111111" />
                <ThemedText lightColor="#111111" darkColor="#111111" style={styles.primaryButtonText}>
                  Access Dashboard
                </ThemedText>
              </Pressable>
            </Link>

            <View style={styles.secondaryActionRow}>
              <Link href="/register" asChild>
                <Pressable style={({ pressed }) => [styles.secondaryButton, { borderColor: palette.border, backgroundColor: palette.surface }, pressed && styles.pressed]}>
                  <ThemedText style={{ fontSize: 14, fontWeight: '700' }}>Create Account</ThemedText>
                </Pressable>
              </Link>

              <Link href={{ pathname: '/login', params: { demo: 'true' } }} asChild>
                <Pressable style={({ pressed }) => [styles.secondaryButton, { borderColor: palette.border, backgroundColor: palette.surface }, pressed && styles.pressed]}>
                  <ThemedText style={{ fontSize: 14, fontWeight: '700' }}>Try Demo</ThemedText>
                </Pressable>
              </Link>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Quick access</ThemedText>
          <ThemedText style={{ color: palette.muted, fontSize: 13, lineHeight: 18 }}>
            Tap a role to open the matching login path.
          </ThemedText>
        </View>

        <View style={styles.roleGrid}>
          {roleProfiles.map((role) => (
            <Link key={role.key} href={{ pathname: '/login', params: { role: role.key } }} asChild>
              <Pressable
                style={({ pressed }) => [
                  styles.roleCard,
                  { backgroundColor: palette.surface, borderColor: palette.border },
                  pressed && styles.pressed,
                ]}>
                <View style={[styles.roleIcon, { backgroundColor: palette.surfaceMuted, borderColor: palette.border }]}>
                  <MaterialIcons name={role.icon} size={22} color={accent} />
                </View>
                <ThemedText style={styles.roleTitle}>{role.label}</ThemedText>
                <ThemedText style={{ color: palette.muted, fontSize: 13, lineHeight: 19 }}>
                  {role.highlight}
                </ThemedText>
              </Pressable>
            </Link>
          ))}
        </View>

        <View style={[styles.footerCard, { backgroundColor: palette.surfaceMuted, borderColor: palette.border }]}>
          <ThemedText style={styles.footerTitle}>MineOps mobile entry point</ThemedText>
          <ThemedText style={{ color: palette.muted, fontSize: 13, lineHeight: 19 }}>
            The app now opens like the web version: a landing page first, login next, and dashboards only after sign-in.
          </ThemedText>
        </View>
      </ScrollView>
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
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginTop: 10,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  navLogin: {
    height: 38,
    borderRadius: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 32,
    padding: 24,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -50,
    right: -20,
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  heroAccent: {
    width: 48,
    height: 6,
    borderRadius: 999,
    marginBottom: 20,
  },
  heroCopy: {
    marginTop: 14,
    marginBottom: 24,
    fontSize: 15,
    lineHeight: 24,
  },
  heroActions: {
    gap: 12,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    marginTop: 32,
    marginBottom: 16,
    gap: 4,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  roleCard: {
    width: '48%',
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    gap: 12,
    minHeight: 160,
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  footerCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    gap: 8,
    marginTop: 32,
  },
  footerTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.85,
  },
});
