import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizeRoleForApp } from '@/constants/roles';

export let globalAuthToken: string | null = null;
export let globalUserRole: string | null = null;

export const setGlobalAuthToken = async (token: string | null) => {
  globalAuthToken = token;
  if (token) {
    await AsyncStorage.setItem('mineops_token', token);
  } else {
    await AsyncStorage.removeItem('mineops_token');
  }
};

export const setGlobalUserRole = async (role: string | null) => {
  const normalizedRole = normalizeRoleForApp(role);
  globalUserRole = normalizedRole;
  if (normalizedRole) {
    await AsyncStorage.setItem('mineops_role', normalizedRole);
  } else {
    await AsyncStorage.removeItem('mineops_role');
  }
};

export const loadAuthState = async () => {
  try {
    const token = await AsyncStorage.getItem('mineops_token');
    const storedRole = await AsyncStorage.getItem('mineops_role');
    const role = normalizeRoleForApp(storedRole);
    globalAuthToken = token;
    globalUserRole = role;
    return { token, role };
  } catch (error) {
    return { token: null, role: null };
  }
};
