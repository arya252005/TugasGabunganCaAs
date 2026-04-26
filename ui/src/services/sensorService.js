import { API_CONFIG } from '../config/api.config'
import http from './http'
import { DUMMY_SENSORS, DUMMY_HISTORY, DUMMY_SUMMARY } from '../types/dummy.data'

const USE_DUMMY = API_CONFIG.USE_DUMMY

const delay = (ms = 500) => new Promise(r => setTimeout(r, ms))

export const sensorService = {

  getDashboardSummary: async () => {
    if (USE_DUMMY) { await delay(); return DUMMY_SUMMARY }
    return http.get(API_CONFIG.ENDPOINTS.DASHBOARD_SUMMARY)
  },

  getLatestSensors: async () => {
    if (USE_DUMMY) { await delay(); return DUMMY_SENSORS }
    return http.get(API_CONFIG.ENDPOINTS.SENSOR_LATEST)
  },

  getSensorHistory: async (sensorId = null, hours = 24) => {
    if (USE_DUMMY) { await delay(300); return DUMMY_HISTORY }
    const params = new URLSearchParams({ hours })
    if (sensorId) params.set('sensorId', sensorId)
    return http.get(`${API_CONFIG.ENDPOINTS.SENSOR_HISTORY}?${params}`)
  },

  getNotifications: async () => {
    if (USE_DUMMY) { await delay(300); return DUMMY_SUMMARY.notifications }
    return http.get('/notification')
  },

  markNotificationRead: async (id) => {
    if (USE_DUMMY) { await delay(200); return { success: true } }
    return http.patch(`/notification/${id}/read`)
  },
}

export default sensorService

import { DUMMY_RIWAYAT, DUMMY_RIWAYAT_STATS, DUMMY_SENSOR_LIST } from '../types/dummy.data'

export const riwayatService = {
  getHistory: async (params = {}) => {
    if (USE_DUMMY) {
      await delay(500)
      //TODO: Filter dummy
      let filtered = [...DUMMY_RIWAYAT.data]
      if (params.sensorId) filtered = filtered.filter(d => d.sensorId === params.sensorId)
      if (params.kondisi)  filtered = filtered.filter(d => d.kondisi  === params.kondisi)
      return { ...DUMMY_RIWAYAT, data: filtered, total: filtered.length }
    }
    const q = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => { if (v) q.set(k, v) })
    return http.get(`/riwayat?${q}`)
  },

  getStats: async (sensorId = null, days = 7) => {
    if (USE_DUMMY) { await delay(300); return DUMMY_RIWAYAT_STATS }
    const q = new URLSearchParams({ days })
    if (sensorId) q.set('sensorId', sensorId)
    return http.get(`/riwayat/stats?${q}`)
  },

  getSensorList: async () => {
    if (USE_DUMMY) { await delay(200); return DUMMY_SENSOR_LIST }
    return http.get('/riwayat/sensors')
  },
}

import { DUMMY_NOTIFICATIONS_PAGE } from '../types/dummy.data'

export const notifikasiService = {
  getAll: async (params = {}) => {
    if (USE_DUMMY) {
      await delay(400)
      //TODO: Filter dummy
      let data = [...DUMMY_NOTIFICATIONS_PAGE.data]
      if (params.isRead === 'false') data = data.filter(n => !n.isRead)
      if (params.isRead === 'true')  data = data.filter(n => n.isRead)
      return { ...DUMMY_NOTIFICATIONS_PAGE, data, total: data.length }
    }
    const q = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') q.set(k, v) })
    return http.get(`/notification?${q}`)
  },

  markRead: async (id) => {
    if (USE_DUMMY) { await delay(200); return { success: true } }
    return http.patch(`/notification/${id}/read`)
  },

  markAllRead: async () => {
    if (USE_DUMMY) { await delay(300); return { success: true } }
    return http.patch('/notification/read-all')
  },

  getSummary: async () => {
    if (USE_DUMMY) {
      await delay(200)
      return {
        unreadCount: DUMMY_NOTIFICATIONS_PAGE.unreadCount,
        latest: DUMMY_NOTIFICATIONS_PAGE.data.filter(n => !n.isRead).slice(0, 5),
      }
    }
    return http.get('/notification/summary')
  },
}