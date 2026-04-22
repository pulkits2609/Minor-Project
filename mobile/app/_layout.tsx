import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect, useState } from 'react';
import { loadAuthState } from '@/constants/auth';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      await loadAuthState();
      setIsReady(true);
    }
    init();
  }, []);

  const colorScheme = useColorScheme() ?? 'dark';
  const navigationTheme =
    colorScheme === 'dark'
      ? {
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            primary: Colors.dark.tint,
            background: Colors.dark.background,
            card: Colors.dark.surfaceElevated,
            text: Colors.dark.text,
            border: Colors.dark.border,
            notification: Colors.dark.danger,
          },
        }
      : {
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            primary: Colors.light.tint,
            background: Colors.light.background,
            card: Colors.light.surfaceElevated,
            text: Colors.light.text,
            border: Colors.light.border,
            notification: Colors.light.danger,
          },
        };

  if (!isReady) return null;

  return (
    <ThemeProvider value={navigationTheme}>
      <Stack
        screenOptions={{
          contentStyle: { backgroundColor: navigationTheme.colors.background },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
