import { useState, useCallback } from 'react'
import { authService } from '../services/authService'

export function useAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const login = useCallback(async (credentials) => {
    clearMessages()
    setLoading(true)
    try {
      const data = await authService.login(credentials)
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      return { ok: true, data }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login gagal. Periksa email dan kata sandi Anda.'
      setError(msg)
      return { ok: false }
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (payload) => {
    clearMessages()
    setLoading(true)
    try {
      const data = await authService.register(payload)
      setSuccess('Akun berhasil dibuat! Silakan masuk.')
      return { ok: true, data }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Pendaftaran gagal. Coba lagi.'
      setError(Array.isArray(msg) ? msg.join(', ') : msg)
      return { ok: false }
    } finally {
      setLoading(false)
    }
  }, [])

  return { login, register, loading, error, success, clearMessages }
}