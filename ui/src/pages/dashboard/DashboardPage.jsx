import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../../services/authService'
import { useDashboard, useNotifications } from '../../hooks/useSensor'
import Sidebar from '../../components/dashboard/Sidebar'
import SensorChart from '../../components/dashboard/SensorChart'
import '../../styles/dashboard.css'

function getStatusLabel(status) {
  if (status === 'ok')   return 'Normal'
  if (status === 'warn') return 'Rendah'
  if (status === 'dry')  return 'Kering'
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
  if (loading) return (
    <div className="stats-grid">
      {[1,2,3,4].map(i => (
        <div key={i} className="stat-card">
          <Skeleton h={10} w="50%" style={{ marginBottom: 12 }}/>
          <Skeleton h={28} w="60%" style={{ marginBottom: 10 }}/>
          <Skeleton h={2}  w="100%" style={{ marginBottom: 8 }}/>
          <Skeleton h={10} w="40%"/>
        </div>
      ))}
    </div>
  )
  if (!data) return null

  const cards = [
    {
      label:    'Kelembaban Tanah',
      value:    data.avgMoisture,
      unit:     '%',
      bar:      data.avgMoisture,
      barColor: data.avgMoisture < 30 ? '#C0392B' : data.avgMoisture > 70 ? '#2980B9' : '#2D5A1E',
      status:   data.avgMoisture < 30 ? 'Kering' : data.avgMoisture > 70 ? 'Basah' : 'Normal',
      statusOk: data.avgMoisture >= 30 && data.avgMoisture <= 70,
    },
    {
      label:    'Suhu Udara',
      value:    data.avgTemperature,
      unit:     '°C',
      bar:      Math.min((data.avgTemperature / 40) * 100, 100),
      barColor: data.avgTemperature > 30 ? '#BA7517' : '#2D5A1E',
      status:   data.avgTemperature > 30 ? 'Panas' : 'Normal',
      statusOk: data.avgTemperature <= 30,
    },
    {
      label:    'Sensor Aktif',
      value:    `${data.activeSensors}/1`,
      unit:     '',
      bar:      data.activeSensors >= 1 ? 100 : 0,
      barColor: data.activeSensors === 4 ? '#2D5A1E' : '#C0392B',
      status:   data.activeSensors >= 1 ? 'Online' : 'Offline',
      statusOk: data.activeSensors >= 1,
    },
    (() => {
      const m = data.avgMoisture
      const kondisi = m <= 29 ? 'Kering'
                    : m <= 44 ? 'Rendah'
                    : m <= 70 ? 'Normal'
                    : 'Basah'
      const color   = m <= 29 ? '#C0392B'
                    : m <= 44 ? '#E67E22'
                    : m <= 70 ? '#1E8449'
                    : '#2E86C1'
      const desc    = m <= 29 ? 'Butuh air'
                    : m <= 44 ? 'Mendekati batas'
                    : m <= 70 ? 'Optimal'
                    : 'Sangat lembab'
      return {
        label:    'Kondisi Tanah',
        value:    kondisi,
        unit:     '',
        bar:      m,
        barColor: color,
        status:   desc,
        statusOk: m > 44 && m <= 70,
      }
    })(),
  ]

  return (
    <div className="stats-grid">
      {cards.map((c, i) => (
        <div key={i} className="stat-card" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 10 }}>
            {c.label}
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4, marginBottom: 12 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 32, fontWeight: 600, color: 'var(--text-dark)', lineHeight: 1 }}>
              {c.value}
            </span>
            {c.unit && (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: 'var(--text-muted)', marginBottom: 2 }}>
                {c.unit}
              </span>
            )}
          </div>
          <div style={{ height: 3, background: 'rgba(92,51,23,0.08)', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ width: `${Math.max(Number(c.bar) || 0, 2)}%`, height: '100%', background: c.barColor, borderRadius: 2, transition: 'width 1.2s ease' }}/>
          </div>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: c.statusOk ? '#1E8449' : c.barColor, letterSpacing: '0.3px', textAlign: 'center' }}>
            {c.status}
          </p>
        </div>
      ))}
    </div>
  )
}

function NotifDropdown({ notifications, unreadCount, onMarkRead, onMarkAll }) {
  const notifIcon  = { danger: '💧', warning: '⚠️', info: '✅' }
  const notifColor = { danger: '#FDEDEC', warning: '#FEF9EC', info: 'var(--green-mist)' }
  const notifText  = { danger: '#C0392B', warning: '#92650A', info: '#3B6D11' }

  return (
    <div style={{
      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
      width: 340, background: '#FFFDF8',
      border: '1px solid rgba(107,58,31,0.12)',
      borderRadius: 12, boxShadow: '0 8px 32px rgba(59,31,10,0.14)',
      zIndex: 200, overflow: 'hidden',
    }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(107,58,31,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--brown-dark)' }}>Notifikasi</p>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
            {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua sudah dibaca'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={onMarkAll} style={{ fontSize: 11, color: 'var(--green-mid)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans' }}>
            Tandai semua dibaca
          </button>
        )}
      </div>

      <div style={{ maxHeight: 320, overflowY: 'auto' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
            Tidak ada notifikasi
          </div>
        ) : notifications.map(n => (
          <div
            key={n.id}
            onClick={() => !n.isRead && onMarkRead(n.id)}
            style={{
              padding: '10px 16px',
              borderBottom: '1px solid rgba(107,58,31,0.05)',
              display: 'flex', gap: 10, alignItems: 'flex-start',
              background: n.isRead ? 'transparent' : 'rgba(107,58,31,0.02)',
              cursor: n.isRead ? 'default' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            <div style={{ width: 30, height: 30, borderRadius: 6, background: notifColor[n.type], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>
              {notifIcon[n.type]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, color: notifText[n.type] || 'var(--text-dark)', fontWeight: n.isRead ? 400 : 500, lineHeight: 1.4 }}>
                {n.message}
              </p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3 }}>
                {new Date(n.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {!n.isRead && (
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E74C3C', flexShrink: 0, marginTop: 4 }}/>
            )}
          </div>
        ))}
      </div>

      <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(107,58,31,0.08)', textAlign: 'center' }}>
        <button style={{ fontSize: 11, color: 'var(--green-mid)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans' }}>
          Lihat semua notifikasi
        </button>
      </div>
    </div>
  )
}

function PredictionPanel({ prediction, loading }) {
  const moisture      = prediction?.moistureLevel ?? 0
  const rec           = prediction?.recommendation ?? 'optimal'
  const circumference = 2 * Math.PI * 45
  const offset        = circumference - (moisture / 100) * circumference
  const recColor      = getRecommendationColor(rec)

  return (
    <div className="panel" style={{ animationDelay: '0.3s' }}>
      <div className="panel-header">
        <div>
          <h3>Prediksi Penyiraman</h3>

        </div>
      </div>
      <div className="panel-body">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <Skeleton w={100} h={100} radius={50} style={{ margin: '0 auto 12px' }}/>
            <Skeleton h={14} w="60%" style={{ margin: '0 auto 8px' }}/>
            <Skeleton h={12} w="80%" style={{ margin: '0 auto' }}/>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', padding: '12px 0 16px' }}>
              <div className="prediction-ring" style={{ margin: '0 auto 12px' }}>
                <svg viewBox="0 0 100 100" width="100" height="100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(107,58,31,0.1)" strokeWidth="8"/>
                  <circle cx="50" cy="50" r="45" fill="none"
                    stroke={recColor} strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s ease' }}
                  />
                </svg>
                <div className="prediction-ring-text">
                  <p>{moisture}%</p>
                </div>
              </div>
              <span className={`prediction-status ${rec === 'siram_sekarang' ? 'pred-danger' : rec === 'siram_nanti' ? 'pred-warn' : 'pred-ok'}`}>
                {getRecommendationText(rec)}
              </span>
            </div>

            <div style={{ background: 'var(--brown-cream)', borderRadius: 8, padding: '12px 14px', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.8px', marginBottom: 6 }}>
                REKOMENDASI WAKTU SIRAM
              </p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 600, color: recColor, letterSpacing: '0.5px' }}>
                {prediction?.nextWateringTime || '—'}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function SensorTable({ sensors, loading }) {
  return (
    <div className="panel" style={{ marginTop: '12px', animationDelay: '0.35s' }}>
      <div className="panel-header">
        <div>
          <h3>Sensor</h3>
          <p>data terakhir</p>          
        </div>
        <span className="panel-badge panel-badge-live">Live</span>
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
              : sensors.map(s => (
                  <tr key={s.sensorId}>
                    <td className="sensor-id">{s.sensorId}</td>
                    <td>{s.lokasi}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 80, height: 6, background: 'rgba(92,51,23,0.08)', borderRadius: 3, overflow: 'hidden', flexShrink: 0 }}>
                          <div style={{
                            width: `${s.moisture}%`,
                            height: '100%',
                            borderRadius: 3,
                            background: s.moisture <= 29 ? '#C0392B'
                                      : s.moisture <= 44 ? '#E67E22'
                                      : s.moisture <= 70 ? '#27AE60'
                                      : '#2E86C1',
                            transition: 'width 0.8s ease',
                          }}/>
                        </div>
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: 12,
                          fontWeight: 500,
                          color: s.moisture <= 29 ? '#C0392B'
                               : s.moisture <= 44 ? '#E67E22'
                               : 'var(--text-dark)',
                        }}>{s.moisture}%</span>
                      </div>
                    </td>
                    <td style={{ color: s.temp > 30 ? '#D68910' : 'var(--text-dark)' }}>{s.temp}°C</td>
                    <td><span className={`sensor-pill ${s.status}`}>{getStatusLabel(s.status)}</span></td>
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
  const [showNotif, setShowNotif] = useState(false)
  const navigate = useNavigate()
  const user = authService.getUser()
  const { data, loading, error, refetch } = useDashboard()
  const { notifications, unreadCount, markAsRead } = useNotifications()

  if (!authService.isAuthenticated()) {
    navigate('/auth')
    return null
  }

  const roleClass = 'admin'

  const markAll = () => {
    notifications.filter(n => !n.isRead).forEach(n => markAsRead(n.id))
  }

  return (
    <div className="dash-layout">
      <Sidebar />

      <div className="dash-main">
        <header className="topbar">
          <div className="topbar-title">
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, color: 'var(--brown-dark)', fontWeight: 600 }}>
              Dashboard
            </h2>
          </div>
          <div className="topbar-right">
            <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 4, background: 'rgba(107,58,31,0.08)', color: 'var(--brown-mid)' }}>
              Admin
            </span>

            <div style={{ position: 'relative' }}>
              <button
                className="notif-btn"
                onClick={() => setShowNotif(v => !v)}
                title="Notifikasi"
              >
                <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
                  <path d="M9 2a5 5 0 00-5 5v3l-1.5 2.5h13L14 10V7a5 5 0 00-5-5z" stroke="#6B3A1F" strokeWidth="1.4"/>
                  <path d="M7 14.5a2 2 0 004 0" stroke="#6B3A1F" strokeWidth="1.4"/>
                </svg>
                {unreadCount > 0 && <span className="notif-dot"/>}
              </button>

              {showNotif && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 199 }}
                    onClick={() => setShowNotif(false)}
                  />
                  <NotifDropdown
                    notifications={notifications}
                    unreadCount={unreadCount}
                    onMarkRead={(id) => { markAsRead(id) }}
                    onMarkAll={() => { markAll(); }}
                  />
                </>
              )}
            </div>

            <button className="btn-refresh" onClick={refetch}
              style={{ padding: '6px 12px', background: 'var(--brown-cream)', border: '1px solid rgba(107,58,31,0.15)', borderRadius: 8, fontSize: 12, color: 'var(--text-mid)', cursor: 'pointer', fontFamily: 'DM Sans' }}>
              ↻ Refresh
            </button>
          </div>
        </header>

        {error && (
          <div style={{ background: '#FEF2F2', borderBottom: '1px solid #FECACA', padding: '10px 2rem', fontSize: 13, color: '#991B1B' }}>
            {error} — <button onClick={refetch} style={{ background: 'none', border: 'none', color: '#991B1B', cursor: 'pointer', textDecoration: 'underline' }}>Coba lagi</button>
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
              loading={loading}
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