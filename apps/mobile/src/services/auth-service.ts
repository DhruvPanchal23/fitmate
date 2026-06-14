import { apiClient } from './api-client';
import { tokenStorage } from './token-storage';

export const authService = {
  login: async (email: string, password: string): Promise<any> => {
    const res = await apiClient.post<any>('/auth/login', { email, password });
    if (res && res.token) {
      await tokenStorage.setToken(res.token);
    }
    return res;
  },

  register: async (fullName: string, email: string, password: string): Promise<any> => {
    return apiClient.post('/auth/register', { fullName, email, password });
  },

  forgotPassword: async (email: string): Promise<any> => {
    return apiClient.post('/auth/forgot-password', { email });
  },

  logout: async () => {
    await tokenStorage.clearToken();
  }
};
