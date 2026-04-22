import AsyncStorage from '@react-native-async-storage/async-storage';

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
  globalUserRole = role;
  if (role) {
    await AsyncStorage.setItem('mineops_role', role);
  } else {
    await AsyncStorage.removeItem('mineops_role');
  }
};

export const loadAuthState = async () => {
  try {
    const token = await AsyncStorage.getItem('mineops_token');
    const role = await AsyncStorage.getItem('mineops_role');
    globalAuthToken = token;
    globalUserRole = role;
    return { token, role };
  } catch (error) {
    return { token: null, role: null };
  }
};
