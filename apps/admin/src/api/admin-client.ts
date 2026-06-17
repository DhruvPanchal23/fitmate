import axios from 'axios';

// The backend port is 3000, under prefix '/api'
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear storage and trigger redirect to login if unauthorized
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      if (!window.location.pathname.includes('/login') && window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export const adminClient = {
  // --- Setup & Auth ---
  setup: async (email: string, passwordHash: string, fullName: string) => {
    const response = await instance.post('/admin/setup', { email, passwordHash, fullName });
    return response.data;
  },

  login: async (email: string, password?: string) => {
    const response = await instance.post('/admin/login', { email, password });
    if (response.data && response.data.token) {
      localStorage.setItem('admin_token', response.data.token);
      localStorage.setItem('admin_user', JSON.stringify(response.data.admin));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  },

  getCurrentUser: () => {
    const userJson = localStorage.getItem('admin_user');
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch {
      return null;
    }
  },

  getProfile: async () => {
    const response = await instance.get('/admin/profile');
    return response.data;
  },

  // --- Dashboard Metrics ---
  getDashboardMetrics: async () => {
    const response = await instance.get('/admin/dashboard');
    return response.data;
  },

  // --- User Management ---
  getUsers: async (q: string = '') => {
    const response = await instance.get(`/admin/users`, { params: { q } });
    return response.data;
  },

  suspendUser: async (id: string) => {
    const response = await instance.post(`/admin/users/${id}/suspend`);
    return response.data;
  },

  banUser: async (id: string) => {
    const response = await instance.post(`/admin/users/${id}/ban`);
    return response.data;
  },

  restoreUser: async (id: string) => {
    const response = await instance.post(`/admin/users/${id}/restore`);
    return response.data;
  },

  resetUserProfile: async (id: string) => {
    const response = await instance.post(`/admin/users/${id}/reset-profile`);
    return response.data;
  },

  impersonateUser: async (id: string) => {
    const response = await instance.post(`/admin/users/${id}/impersonate`);
    return response.data;
  },

  // --- Food Catalog CMS ---
  getFoods: async (q: string = '') => {
    const response = await instance.get(`/admin/foods`, { params: { q } });
    return response.data;
  },

  createFood: async (foodData: any) => {
    const response = await instance.post('/admin/foods', foodData);
    return response.data;
  },

  updateFood: async (id: string, foodData: any) => {
    const response = await instance.put(`/admin/foods/${id}`, foodData);
    return response.data;
  },

  deleteFood: async (id: string) => {
    const response = await instance.delete(`/admin/foods/${id}`);
    return response.data;
  },

  approveFood: async (id: string) => {
    const response = await instance.post(`/admin/foods/${id}/approve`);
    return response.data;
  },

  rejectFood: async (id: string) => {
    const response = await instance.post(`/admin/foods/${id}/reject`);
    return response.data;
  },

  mergeFoods: async (sourceId: string, targetId: string) => {
    const response = await instance.post('/admin/foods/merge', { sourceId, targetId });
    return response.data;
  },

  bulkImportFoods: async (foods: any[]) => {
    const response = await instance.post('/admin/foods/import', { foods });
    return response.data;
  },

  bulkExportFoods: async () => {
    const response = await instance.get('/admin/foods/export');
    return response.data;
  },

  // --- Prompt Management ---
  getPrompts: async () => {
    const response = await instance.get('/admin/prompts');
    return response.data;
  },

  createPromptTemplate: async (key: string, description: string) => {
    const response = await instance.post('/admin/prompts', { key, description });
    return response.data;
  },

  addPromptVersion: async (key: string, content: string) => {
    const response = await instance.post(`/admin/prompts/${key}/versions`, { content });
    return response.data;
  },

  activatePromptVersion: async (key: string, versionId: string) => {
    const response = await instance.post(`/admin/prompts/${key}/activate`, { versionId });
    return response.data;
  },

  previewPrompt: async (key: string, versionId: string) => {
    const response = await instance.get(`/admin/prompts/${key}/preview`, { params: { versionId } });
    return response.data;
  },

  // --- Feature Flags ---
  getFeatureFlags: async () => {
    const response = await instance.get('/admin/flags');
    return response.data;
  },

  createFeatureFlag: async (flagData: any) => {
    const response = await instance.post('/admin/flags', flagData);
    return response.data;
  },

  updateFeatureFlag: async (key: string, flagData: any) => {
    const response = await instance.put(`/admin/flags/${key}`, flagData);
    return response.data;
  },

  // --- Remote Configs ---
  getRemoteConfigs: async () => {
    const response = await instance.get('/admin/configs');
    return response.data;
  },

  createRemoteConfig: async (configData: any) => {
    const response = await instance.post('/admin/configs', configData);
    return response.data;
  },

  updateRemoteConfig: async (key: string, configData: any) => {
    const response = await instance.put(`/admin/configs/${key}`, configData);
    return response.data;
  },

  // --- Announcements ---
  getAnnouncements: async () => {
    const response = await instance.get('/admin/announcements');
    return response.data;
  },

  createAnnouncement: async (announcementData: any) => {
    const response = await instance.post('/admin/announcements', announcementData);
    return response.data;
  },

  // --- Audit Logs ---
  getAuditLogs: async () => {
    const response = await instance.get('/admin/audits');
    return response.data;
  },

  // --- Production Hardening & System Operations ---
  getSystemHealth: async () => {
    const response = await instance.get('/admin/system/health');
    return response.data;
  },

  getJobs: async () => {
    const response = await instance.get('/admin/jobs');
    return response.data;
  },

  runJob: async (name: string) => {
    const response = await instance.post(`/admin/jobs/${name}/run`);
    return response.data;
  },

  getCacheStats: async () => {
    const response = await instance.get('/admin/cache/stats');
    return response.data;
  },

  getUserSessions: async (userId?: string) => {
    const response = await instance.get('/admin/sessions', { params: { userId } });
    return response.data;
  },

  revokeUserSession: async (id: string, userId: string) => {
    const response = await instance.delete(`/admin/sessions/${id}`, { params: { userId } });
    return response.data;
  },

  getErrors: async () => {
    const response = await instance.get('/admin/errors');
    return response.data;
  },

  getBackups: async () => {
    const response = await instance.get('/admin/backups');
    return response.data;
  },

  createBackup: async (type: string) => {
    const response = await instance.post('/admin/backups', { type });
    return response.data;
  },

  restoreBackup: async (filename: string) => {
    const response = await instance.post('/admin/backups/restore', { filename });
    return response.data;
  },
};
