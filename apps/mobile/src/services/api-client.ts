import axios from 'axios';
import { CONFIG } from '../config';
import { tokenStorage } from './token-storage';

const instance = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  async (config) => {
    const token = await tokenStorage.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const apiClient = {
  get: async <T>(endpoint: string): Promise<T> => {
    const response = await instance.get<T>(endpoint);
    return response.data;
  },

  post: async <T>(endpoint: string, data?: any): Promise<T> => {
    const response = await instance.post<T>(endpoint, data);
    return response.data;
  },

  delete: async <T>(endpoint: string, data?: any): Promise<T> => {
    const response = await instance.delete<T>(endpoint, { data });
    return response.data;
  },

  patch: async <T>(endpoint: string, data?: any): Promise<T> => {
    const response = await instance.patch<T>(endpoint, data);
    return response.data;
  },
};
export default apiClient;
