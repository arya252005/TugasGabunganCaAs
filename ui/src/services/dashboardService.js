import http from '../../../backend/src/services/http'
import { API_CONFIG } from '../../../backend/src/config/api.config'
import {
  DUMMY_SUMMARY,
  DUMMY_SENSORS,
  DUMMY_HISTORY,
} from '../types/dummy.data'

const USE_DUMMY = API_CONFIG.USE_DUMMY

const delay = (ms = 500) => new Promise(r => setTimeout(r, ms))

export const dashboardService = {

  getSummary: async () => {
    if (USE_DUMMY) {
      await delay()
      return DUMMY_SUMMARY
    }
    return http.get(API_CONFIG.ENDPOINTS.DASHBOARD_SUMMARY)
  },

  getLatestSensors: async () => {
    if (USE_DUMMY) {
      await delay()
      return DUMMY_SENSORS
    }
    return http.get(API_CONFIG.ENDPOINTS.SENSOR_LATEST)
  },

  getSensorHistory: async (sensorId = null, hours = 24) => {
    if (USE_DUMMY) {
      await delay(300)
      return DUMMY_HISTORY
    }
    const params = new URLSearchParams({ hours })
    if (sensorId) params.set('sensorId', sensorId)
    return http.get(`${API_CONFIG.ENDPOINTS.SENSOR_HISTORY}?${params}`)
  },

  getLatestPrediction: async () => {
    if (USE_DUMMY) {
      await delay()
      return DUMMY_SUMMARY.prediction
    }
    return http.get('/prediction/latest')
  },

  getNotifications: async () => {
    if (USE_DUMMY) {
      await delay(300)
      return DUMMY_SUMMARY.notifications
    }
    return http.get('/notification')
  },

  markNotificationRead: async (id) => {
    if (USE_DUMMY) {
      await delay(200)
      return { success: true }
    }
    return http.patch(`/notification/${id}/read`)
  },
}
