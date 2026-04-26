import { API_CONFIG } from '../config/api.config'

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token')

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const controller = new AbortController()
  const timeout    = setTimeout(() => controller.abort(), 10000)

  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      ...options, headers, signal: controller.signal,
    })
    clearTimeout(timeout)

    if (res.status === 401) {
      if (token) {
        //TODO: Token avail but ignored → expired/invalid
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/auth'
        return
      }
      //TODO: no token → throw normal error
      throw new Error('Sesi tidak ditemukan. Silakan login kembali.')
    }

    let data
    try { data = await res.json() }
    catch { data = {} }

    if (!res.ok) {
      const err    = new Error(data?.message || `Request gagal (${res.status})`)
      err.status   = res.status
      err.response = { data, status: res.status }
      throw err
    }

    return data

  } catch (err) {
    clearTimeout(timeout)
    if (err.name === 'AbortError') {
      throw new Error('Request timeout. connect backend pls port 3000.')
    }
    throw err
  }
}

export const http = {
  get:   (url)       => request(url, { method: 'GET' }),
  post:  (url, body) => request(url, { method: 'POST',  body: JSON.stringify(body) }),
  patch: (url, body) => request(url, { method: 'PATCH', body: JSON.stringify(body) }),
}

export default http