import * as SecureStore from 'expo-secure-store';

export const tokenStorage = {
  getToken: async () => {
    try {
      return await SecureStore.getItemAsync('fitmate_auth_token');
    } catch {
      return null;
    }
  },
  setToken: async (token: string) => {
    try {
      await SecureStore.setItemAsync('fitmate_auth_token', token);
    } catch {}
  },
  clearToken: async () => {
    try {
      await SecureStore.deleteItemAsync('fitmate_auth_token');
    } catch {}
  }
};
export default tokenStorage;
