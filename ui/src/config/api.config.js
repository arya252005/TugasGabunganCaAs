export const API_CONFIG = {
  BASE_URL:         import.meta.env.VITE_API_URL || 'http://localhost:3000',
  USE_DUMMY:        import.meta.env.VITE_USE_DUMMY === 'true',
  REFRESH_INTERVAL: parseInt(import.meta.env.VITE_REFRESH_INTERVAL) || 30000,

  ENDPOINTS: {
    LOGIN:             '/auth/login',
    REGISTER:          '/auth/register',
    PROFILE:           '/auth/profile',
    SENSOR_LATEST:     '/sensor/latest',
    SENSOR_HISTORY:    '/sensor/history',
    SENSOR_BY_ID:      '/sensor/:id',
    DASHBOARD_SUMMARY: '/dashboard/summary',
    SENSOR_PUSH:       '/sensor/data',
    SENSOR_BATCH:      '/sensor/batch',
  },
}

export default API_CONFIG