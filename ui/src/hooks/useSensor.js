import { useState, useEffect, useCallback } from 'react'
import sensorService from '../services/sensorService'
import { API_CONFIG } from '../config/api.config'

export function useDashboard() {
  const [data,       setData]       = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      const res = await sensorService.getDashboardSummary()
      setData(res)
      setLastUpdate(new Date())
    } catch (err) {
      setError(err.message || 'Gagal mengambil data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, API_CONFIG.REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchData])

  return { data, loading, error, lastUpdate, refetch: fetchData }
}

export function useSensors() {
  const [sensors, setSensors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetchSensors = useCallback(async () => {
    try {
      setError(null)
      const res = await sensorService.getLatestSensors()
      const list = Array.isArray(res) ? res : (res?.data ?? [])
      setSensors(list)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSensors()
    const interval = setInterval(fetchSensors, API_CONFIG.REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [fetchSensors])

  return { sensors, loading, error, refetch: fetchSensors }
}

export function useSensorHistory(sensorId = null, hours = 24) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetchHistory = useCallback(async () => {
    try {
      setError(null)
      const res = await sensorService.getSensorHistory(sensorId, hours)
      const list = Array.isArray(res) ? res : (res?.data ?? [])
      setHistory(list)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [sensorId, hours])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  return { history, loading, error, refetch: fetchHistory }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)

  const fetchNotif = useCallback(async () => {
    try {
      setError(null)
      const res = await sensorService.getNotifications()
      const list = Array.isArray(res) ? res : (res?.data ?? res?.notifications ?? [])
      setNotifications(list)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const markAsRead = async (id) => {
    await sensorService.markNotificationRead(id)
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    )
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  useEffect(() => { fetchNotif() }, [fetchNotif])

  return { notifications, loading, error, unreadCount, markAsRead, refetch: fetchNotif }
}