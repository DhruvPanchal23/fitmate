export const CONFIG = {
  API_BASE_URL: process.env.EXPO_PUBLIC_BACKEND_URL || 'http://localhost:3000/api',
  APP_NAME: 'FitMate',
  APP_VERSION: '1.0.0-beta',
  IS_DEV: __DEV__,
  SUPPORT_EMAIL: 'support@fitmateai.com',
  DEFAULT_GOALS: {
    calories: 2200,
    protein: 150,
    carbs: 200,
    fat: 70,
    water: 2500,
  },
} as const;
