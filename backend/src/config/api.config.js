const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const API_CONFIG = {
  BASE_URL,
  TIMEOUT: 10000,
  ENDPOINTS: {
    LOGIN:    '/auth/login',
    REGISTER: '/auth/register',
    PROFILE:  '/auth/profile',
    SENSOR_LATEST:  '/sensor/latest',       
    SENSOR_HISTORY: '/sensor/history',      
    SENSOR_BY_ID:   '/sensor/:id',          
    PREDICTION_LATEST: '/prediction/latest', 
    PREDICTION_HISTORY:'/prediction/history',
    NOTIFICATIONS:     '/notification',      
    NOTIFICATION_READ: '/notification/:id/read',
    DASHBOARD_SUMMARY: '/dashboard/summary',  
  }
}

export default API_CONFIG

// VITE_API_URL = clouds