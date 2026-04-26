import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import { useDashboard, useNotifications } from '../../hooks/useDashboard'
import Sidebar from '../../components/dashboard/Sidebar'
import SensorChart from '../../components/dashboard/SensorChart'
import '../../styles/dashboard.css'

function getStatusLabel(status) {
  if (status === 'ok')   return '✓ Normal'
  if (status === 'warn') return '⚠ Rendah'
  if (status === 'dry')  return '✗ Kering'
  return status
}

function getRecommendationText(rec) {
  if (rec === 'siram_sekarang') return 'Siram sekarang!'
  if (rec === 'siram_nanti')    return 'Siram dalam 2–3 jam'
  return 'Kondisi optimal'
}

function getRecommendationColor(rec) {
  if (rec === 'siram_sekarang') return '#C0392B'
  if (rec === 'siram_nanti')    return '#D68910'
  return 'var(--green-dark)'
}

function Skeleton({ w = '100%', h = 20, radius = 6 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: 'linear-gradient(90deg, rgba(107,58,31,0.08) 25%, rgba(107,58,31,0.14) 50%, rgba(107,58,31,0.08) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }}/>
  )
}

function StatCards({ data, loading }) {
  const stats = data ? [
    { label: 'Kelembaban Rata-rata', value: `${data.avgMoisture}%`,    trend: '↓ 8%',   trendType: 'warn',  iconColor: 'green', icon: '💧' },
    { label: 'Suhu Rata-rata',       value: `${data.avgTemperature}°C`,trend: '↑ 2°C',  trendType: 'warn',  iconColor: 'brown', icon: '🌡️' },
    { label: 'Sensor Aktif',         value: `${data.activeSensors}/4`, trend: 'Normal', trendType: 'up',    iconColor: 'blue',  icon: '📡' },
    { label: 'Perlu Disiram',        value: `${data.sensorsNeedWater}`,trend: 'Segera', trendType: 'down',  iconColor: 'red',   icon: '🚿' },
  ] : []

  return (
    <div className="stats-grid">
      {loading
        ? [1,2,3,4].map(i => (
            <div key={i} className="stat-card">
              <Skeleton h={40} w={40} radius={10}/>
              <div style={{ marginTop: 12 }}><Skeleton h={28} w="60%"/></div>
              <div style={{ marginTop: 6 }}><Skeleton h={12} w="80%"/></div>
            </div>
          ))
        : stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-card-header">
                <div className={`stat-icon-wrap ${s.iconColor}`}>
                  <span style={{ fontSize: 18 }}>{s.icon}</span>
                </div>
                <span className={`stat-trend ${s.trendType}`}>{s.trend}</span>
              </div>
              <p className="stat-value">{s.value}</p>
              <p className="stat-label">{s.label}</p>
            </div>
          ))
      }
    </div>
  )
}

function PredictionPanel({ prediction, notifications, loading, onMarkRead }) {
  const moisture   = prediction?.moistureLevel ?? 0
  const rec        = prediction?.recommendation ?? 'optimal'
  const circumference = 2 * Math.PI * 45
  const offset     = circumference - (moisture / 100) * circumference

  const notifIcon = { danger: '💧', warning: '⚠️', info: '✅' }
  const notifType = { danger: 'green', warning: 'warn', info: 'brown' }

  return (
    <div className="panel" style={{ animationDelay: '0.3s' }}>
      <div className="panel-header">
        <div>
          <h3>Prediksi Penyiraman</h3>
          <p>Berbasis model {prediction?.modelUsed || 'ML'}</p>
        </div>
        <span className="panel-badge">
          {prediction ? `${prediction.confidence}% akurat` : 'ML Active'}
        </span>
      </div>
      <div className="panel-body">

        <div className="prediction-main">
          {loading ? (
            <Skeleton w={120} h={120} radius={60}/>
          ) : (
            <>
              <div className="prediction-ring">
                <svg viewBox="0 0 100 100" width="120" height="120">
                  <circle cx="50" cy="50" r="45" fill="none"
                    stroke="rgba(107,58,31,0.1)" strokeWidth="8"/>
                  <circle cx="50" cy="50" r="45" fill="none"
                    stroke={getRecommendationColor(rec)}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s ease' }}
                  />
                </svg>
                <div className="prediction-ring-text">
                  <p>{moisture}%</p>
                  <span>LEMBAB</span>
                </div>
              </div>
              <span className="prediction-status"
                style={{ color: getRecommendationColor(rec), background: getRecommendationColor(rec) + '15' }}>
                {getRecommendationText(rec)}
              </span>
              {prediction?.nextWateringTime && (
                <p style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 8 }}>
                  Waktu siram berikutnya: <strong>{prediction.nextWateringTime}</strong>
                </p>
              )}
            </>
          )}
        </div>

        <div className="notif-list">
          {loading
            ? [1,2,3].map(i => (
                <div key={i} className="notif-item">
                  <Skeleton w={34} h={34} radius={8}/>
                  <div style={{ flex: 1 }}>
                    <Skeleton h={13} w="90%"/>
                    <div style={{ marginTop: 4 }}><Skeleton h={10} w="40%"/></div>
                  </div>
                </div>
              ))
            : notifications.map((n) => (
                <div key={n.id} className="notif-item"
                  style={{ opacity: n.isRead ? 0.6 : 1, cursor: !n.isRead ? 'pointer' : 'default' }}
                  onClick={() => !n.isRead && onMarkRead(n.id)}>
                  <div className={`notif-icon ${notifType[n.type] || 'brown'}`}>
                    <span style={{ fontSize: 16 }}>{notifIcon[n.type] || '📢'}</span>
                  </div>
                  <div className="notif-text">
                    <p>{n.message}</p>
                    <span>{new Date(n.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {!n.isRead && (
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#E74C3C', flexShrink: 0, marginTop: 4 }}/>
                  )}
                </div>
              ))
          }
        </div>
      </div>
    </div>
  )
}

function SensorTable({ sensors, loading }) {
  return (
    <div className="panel" style={{ marginTop: '1.25rem', animationDelay: '0.35s' }}>
      <div className="panel-header">
        <div>
          <h3>Riwayat Data Sensor</h3>
          <p>Update otomatis setiap 30 detik</p>
        </div>
        <span className="panel-badge">Live</span>
      </div>
      <div className="panel-body">
        <table className="sensor-table">
          <thead>
            <tr>
              <th>Sensor</th>
              <th>Lokasi</th>
              <th>Kelembaban</th>
              <th>Suhu</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? [1,2,3,4].map(i => (
                  <tr key={i}>
                    {[1,2,3,4,5].map(j => (
                      <td key={j}><Skeleton h={12} w="80%"/></td>
                    ))}
                  </tr>
                ))
              : sensors.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 500, color: 'var(--brown-mid)' }}>{s.id}</td>
                    <td>{s.lokasi}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="sensor-bar-wrap">
                          <div className={`sensor-bar ${s.status !== 'ok' ? s.status : ''}`}
                            style={{ width: `${s.kelembaban}%` }}/>
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-mid)' }}>{s.kelembaban}%</span>
                      </div>
                    </td>
                    <td style={{ color: s.suhu > 30 ? '#D68910' : 'var(--text-dark)' }}>{s.suhu}°C</td>
                    <td>
                      <span className={`sensor-pill ${s.status}`}>{getStatusLabel(s.status)}</span>
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [activeNav, setActiveNav] = useState('dashboard')
  const navigate = useNavigate()
  const user     = authService.getUser()

  const { data, loading, error, refetch }                    = useDashboard()
  const { notifications, unreadCount, markAsRead }           = useNotifications()

  if (!authService.isAuthenticated()) {
    navigate('/auth')
    return null
  }

  const roleClass = user?.role?.toLowerCase() || 'petani'
  const now = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  return (
    <div className="dash-layout">
      <Sidebar activeNav={activeNav} onNav={setActiveNav} />

      <div className="dash-main">
        <header className="topbar">
          <div className="topbar-title">
            {/* <h2>Selamat datang, {user?.name?.split(' ')[0] || 'Petani'} </h2> */}
            <p>{now}</p>
          </div>
          <div className="topbar-right">
            <span className={`badge-role ${roleClass}`}>{user?.role}</span>
            <button className="notif-btn" title="Notifikasi">
              <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                <path d="M9 2a5 5 0 00-5 5v3l-1.5 2.5h13L14 10V7a5 5 0 00-5-5z" stroke="#6B3A1F" strokeWidth="1.4"/>
                <path d="M7 14.5a2 2 0 004 0" stroke="#6B3A1F" strokeWidth="1.4"/>
              </svg>
              {unreadCount > 0 && <span className="notif-dot"/>}
            </button>
            <button className="btn-refresh" onClick={refetch} title="Refresh data"
              style={{ padding: '6px 12px', background: 'var(--brown-cream)', border: '1px solid rgba(107,58,31,0.15)', borderRadius: 8, fontSize: 12, color: 'var(--text-mid)', cursor: 'pointer' }}>
              ↻ Refresh
            </button>
          </div>
        </header>

        {error && (
          <div style={{ background: '#FEF2F2', borderBottom: '1px solid #FECACA', padding: '10px 2rem', fontSize: 13, color: '#991B1B' }}>
            ⚠ {error} — <button onClick={refetch} style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', textDecoration: 'underline' }}>Coba lagi</button>
          </div>
        )}

        <main className="dash-content">
          <StatCards data={data} loading={loading} />

          <div className="dash-grid">
            <div>
              <div className="panel">
                <div className="panel-header">
                  <div>
                    <h3>Grafik Kelembaban Tanah & Udara</h3>
                    <p>Data 24 jam terakhir</p>
                  </div>
                  <span className="panel-badge">Hari ini</span>
                </div>
                <div className="panel-body">
                  <div className="chart-wrap">
                    <SensorChart data={data?.chartHistory} loading={loading} />
                  </div>
                  <div className="chart-legend">
                    <div className="legend-item">
                      <div className="legend-dot" style={{ background: '#4A9B35' }}/>
                      Kelembaban Tanah
                    </div>
                    <div className="legend-item">
                      <div className="legend-dot" style={{ background: '#3498DB' }}/>
                      Kelembaban Udara
                    </div>
                  </div>
                </div>
              </div>

              <SensorTable sensors={data?.sensors || []} loading={loading} />
            </div>

            <PredictionPanel
              prediction={data?.prediction}
              notifications={notifications}
              loading={loading}
              onMarkRead={markAsRead}
            />
          </div>
        </main>
      </div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  )
}