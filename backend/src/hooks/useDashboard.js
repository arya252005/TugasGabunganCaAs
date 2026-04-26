import { useState, useEffect, useCallback } from 'react'
import dashboardService from '../services/dashboardService'

export function useDashboard() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const summary = await dashboardService.getSummary()
      setData(summary)
    } catch (err) {
      setError(err.message || 'Gagal mengambil data dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()

    //TODO: Auto refresh: 30s
    const interval = setInterval(fetchData, 30_000)
    return () => clearInterval(interval)
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export function useSensors() {
  const [sensors, setSensors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const fetchSensors = useCallback(async () => {
    try {
      setLoading(true)
      const data = await dashboardService.getLatestSensors()
      setSensors(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSensors()
    const interval = setInterval(fetchSensors, 30_000)
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
      setLoading(true)
      const data = await dashboardService.getSensorHistory(sensorId, hours)
      setHistory(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [sensorId, hours])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return { history, loading, error, refetch: fetchHistory }
}

export function usePrediction() {
  const [prediction, setPrediction] = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  const fetchPrediction = useCallback(async () => {
    try {
      setLoading(true)
      const data = await dashboardService.getLatestPrediction()
      setPrediction(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPrediction()
    //TODO: refresh predict: 1m
    const interval = setInterval(fetchPrediction, 60_000) 
    return () => clearInterval(interval)
  }, [fetchPrediction])

  return { prediction, loading, error, refetch: fetchPrediction }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState(null)

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true)
      const data = await dashboardService.getNotifications()
      setNotifications(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const markAsRead = async (id) => {
    await dashboardService.markNotificationRead(id)
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    )
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  return { notifications, loading, error, unreadCount, markAsRead, refetch: fetchNotifications }
}