import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect, useState } from 'react';
import { loadAuthState } from '@/constants/auth';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [expoPushToken, setExpoPushToken] = useState('');

  useEffect(() => {
    async function init() {
      await loadAuthState();
      if (Constants.executionEnvironment !== 'storeClient') {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          setExpoPushToken(token);
          // Backend is currently locked, but this is where we would normally call:
          // fetch('/auth/profile/token', { method: 'PUT', body: JSON.stringify({ token }) })
          console.log("Push Token Registered:", token);
        }
      }
      setIsReady(true);
    }
    init();
  }, []);

  async function registerForPushNotificationsAsync() {
    try {
      const Notifications = require('expo-notifications');
      
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          console.warn('Failed to get push token for push notification!');
          return;
        }
        
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
          console.warn('Project ID not found in app.json for push notifications');
          return;
        }

        const pushTokenString = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        return pushTokenString;
      } else {
        console.warn('Must use physical device for Push Notifications');
      }
    } catch (e) {
      console.warn('Push notifications registration failed:', e);
    }
  }

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
