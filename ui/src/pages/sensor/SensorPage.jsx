import { useState, useMemo } from 'react'
import { useSensors, useSensorHistory } from '../../hooks/useSensor'
import { API_CONFIG } from '../../config/api.config'
import Sidebar from '../../components/dashboard/Sidebar'
import '../../styles/dashboard.css'
import './sensor.css'

function getMoistureColor(v) {
  if (v <= 29) return '#E24B4A'
  if (v <= 44) return '#BA7517'
  return '#3B6D11'
}

function formatTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit',
  })
}

const STATUS_MAP = {
  ok:   { label: 'Normal', cls: 'ok' },
  warn: { label: 'Rendah', cls: 'warn' },
  dry:  { label: 'Kering', cls: 'dry' },
}

function Skel({ w = '100%', h = 16, style = {} }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: 4, ...style }} />
}

function StatusPill({ status }) {
  const s = STATUS_MAP[status] || STATUS_MAP.ok
  return <span className={`sensor-pill ${s.cls}`}>{s.label}</span>
}

function SensorCard({ sensor, selected, onClick, loading }) {
  if (loading) {
    return (
      <div className="sensor-card">
        <div className="sensor-card-top">
          <div>
            <Skel w={40} h={11} style={{ marginBottom: 5 }} />
            <Skel w={120} h={13} />
          </div>
          <Skel w={50} h={20} style={{ borderRadius: 4 }} />
        </div>
        <div className="sensor-card-body">
          <div className="sensor-metrics">
            {[1, 2, 3, 4].map(i => (
              <div key={i}>
                <Skel h={10} w={60} style={{ marginBottom: 4 }} />
                <Skel h={22} w={80} />
              </div>
            ))}
          </div>
          <Skel h={6} style={{ borderRadius: 3, marginBottom: 6 }} />
        </div>
      </div>
    )
  }

  const mc = getMoistureColor(sensor.moisture)

  return (
    <div
      className={`sensor-card ${selected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="sensor-card-top">
        <div>
          <div className="sensor-card-id">{sensor.sensorId}</div>
          <div className="sensor-card-lokasi">{sensor.lokasi}</div>
        </div>
        <StatusPill status={sensor.status} />
      </div>

      <div className="sensor-card-body">
        <div className="sensor-metrics">
          <div className="metric-item">
            <div className="metric-label">Kelembaban Tanah</div>
            <div className="metric-value" style={{ color: mc }}>
              {sensor.moisture}<span className="metric-unit">%</span>
            </div>
          </div>
          <div className="metric-item">
            <div className="metric-label">Suhu Udara</div>
            <div className="metric-value" style={{ color: sensor.temp > 30 ? '#BA7517' : 'var(--brown-dark)' }}>
              {sensor.temp}<span className="metric-unit">°C</span>
            </div>
          </div>
          <div className="metric-item">
            <div className="metric-label">Kelembaban Udara</div>
            <div className="metric-value">
              {sensor.hum}<span className="metric-unit">%</span>
            </div>
          </div>
          <div className="metric-item">
            <div className="metric-label">Raw Soil</div>
            <div className="metric-value" style={{ fontSize: 16 }}>{sensor.soil}</div>
          </div>
        </div>

        <div className="moisture-bar-wrap">
          <div
            className="moisture-bar-fill"
            style={{ width: `${sensor.moisture}%`, background: mc }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
          <span className="moisture-pct">Kelembaban: {sensor.moisture}%</span>
          <span style={{ fontSize: 10, color: sensor.label === 1 ? '#C0392B' : '#3B6D11', fontWeight: 500 }}>
            {sensor.label === 1 ? 'Perlu disiram' : 'Tidak perlu disiram'}
          </span>
        </div>
      </div>

      <div className="sensor-card-footer">
        <span className="sensor-timestamp">{formatTime(sensor.createdAt)}</span>
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          Kondisi: <strong style={{ color: mc }}>{sensor.kondisi}</strong>
        </span>
      </div>
    </div>
  )
}

function MiniChart({ history, loading }) {
  const W = 600, H = 140
  const PAD = { t: 10, r: 10, b: 24, l: 36 }
  const iW = W - PAD.l - PAD.r
  const iH = H - PAD.t - PAD.b

  const toX = (i) => PAD.l + (i / Math.max(history.length - 1, 1)) * iW
  const toY = (v) => PAD.t + iH - (v / 100) * iH

  if (loading) return <Skel h={140} style={{ borderRadius: 8 }} />

  if (!history.length) {
    return (
      <div style={{ height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
        Belum ada data historis
      </div>
    )
  }

  const mPath = history.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(d.kelembaban)}`).join(' ')
  const hPath = history.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(i)},${toY(d.kelembabanUdara)}`).join(' ')
  const mArea = `${mPath} L${toX(history.length - 1)},${PAD.t + iH} L${PAD.l},${PAD.t + iH} Z`

  const step = Math.max(1, Math.floor(history.length / 8))
  const xLabels = history.filter((_, i) => i % step === 0)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 140 }}>
      <defs>
        <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B6D11" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#3B6D11" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[0, 25, 50, 75, 100].map(v => (
        <g key={v}>
          <line x1={PAD.l} y1={toY(v)} x2={W - PAD.r} y2={toY(v)} stroke="rgba(107,58,31,0.07)" strokeWidth="0.5" />
          <text x={PAD.l - 4} y={toY(v) + 4} textAnchor="end" fontSize="9" fill="rgba(107,58,31,0.4)">{v}%</text>
        </g>
      ))}

      <path d={mArea} fill="url(#cGrad)" />
      <path d={hPath} stroke="#378ADD" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
      <path d={mPath} stroke="#3B6D11" strokeWidth="2" fill="none" strokeLinejoin="round" />

      {history.map((d, i) => (
        <circle key={i} cx={toX(i)} cy={toY(d.kelembaban)} r="2.5" fill="#3B6D11" stroke="#FFFDF8" strokeWidth="1.2" />
      ))}

      {xLabels.map((d) => {
        const idx = history.indexOf(d)
        return (
          <text key={idx} x={toX(idx)} y={H - 4} textAnchor="middle" fontSize="9" fill="rgba(107,58,31,0.45)">
            {d.time}
          </text>
        )
      })}
    </svg>
  )
}

function SensorDetail({ sensor, onClose }) {
  const [hours, setHours] = useState(24)
  const { history, loading: histLoading } = useSensorHistory(sensor.sensorId, hours)
  const mc = getMoistureColor(sensor.moisture)

  return (
    <div className="sensor-detail">
      <div className="detail-header">
        <div>
          <h3>
            {sensor.lokasi}
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'DM Sans', fontWeight: 400, marginLeft: 6 }}>
              ({sensor.sensorId})
            </span>
          </h3>
          <p>Update terakhir: {formatTime(sensor.createdAt)}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatusPill status={sensor.status} />
          <button
            onClick={onClose}
            style={{ background: 'none', border: '1px solid rgba(107,58,31,0.14)', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', color: 'var(--text-light)', fontFamily: 'DM Sans' }}
          >
            Tutup
          </button>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-metric">
          <div className="detail-metric-label">Kelembaban Tanah</div>
          <div>
            <span className="detail-metric-value" style={{ color: mc }}>{sensor.moisture}</span>
            <span className="detail-metric-unit">%</span>
          </div>
          <div className="detail-metric-sub">
            {sensor.kondisi?.toUpperCase()} — {sensor.label === 1 ? 'Perlu siram' : 'Tidak perlu siram'}
          </div>
        </div>
        <div className="detail-metric">
          <div className="detail-metric-label">Suhu Udara</div>
          <div>
            <span className="detail-metric-value" style={{ color: sensor.temp > 30 ? '#BA7517' : 'var(--brown-dark)' }}>{sensor.temp}</span>
            <span className="detail-metric-unit">°C</span>
          </div>
          <div className="detail-metric-sub">{sensor.temp > 30 ? 'Di atas normal' : 'Normal'}</div>
        </div>
        <div className="detail-metric">
          <div className="detail-metric-label">Kelembaban Udara</div>
          <div>
            <span className="detail-metric-value">{sensor.hum}</span>
            <span className="detail-metric-unit">%</span>
          </div>
        </div>
        <div className="detail-metric">
          <div className="detail-metric-label">Raw Soil ADC</div>
          <div>
            <span className="detail-metric-value" style={{ fontSize: 22 }}>{sensor.soil}</span>
          </div>
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-section-header">
          <div>
            <h4>Grafik historis</h4>
            <p>Hijau = kelembaban tanah &nbsp;|&nbsp; Biru = kelembaban udara</p>
          </div>
          <div className="chart-hours-tabs">
            {[6, 12, 24].map(h => (
              <button
                key={h}
                className={`hours-tab ${hours === h ? 'active' : ''}`}
                onClick={() => setHours(h)}
              >
                {h}j
              </button>
            ))}
          </div>
        </div>
        <MiniChart history={history} loading={histLoading} />
      </div>

      <div className="history-section">
        <h4>Data mentah ({history.length} titik)</h4>
        <table className="history-table">
          <thead>
            <tr>
              <th>Waktu</th>
              <th>Tanah %</th>
              <th>Udara %</th>
              <th>Suhu °C</th>
              <th>Raw Soil</th>
            </tr>
          </thead>
          <tbody>
            {history.slice(-10).reverse().map((h, i) => (
              <tr key={i}>
                <td>{h.time || '—'}</td>
                <td style={{ color: getMoistureColor(h.kelembaban), fontWeight: 500 }}>{h.kelembaban}%</td>
                <td>{h.kelembabanUdara}%</td>
                <td style={{ color: h.suhu > 30 ? '#BA7517' : 'var(--text-dark)' }}>{h.suhu}°C</td>
                <td style={{ color: 'var(--text-muted)' }}>{h.soil ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function SensorPage() {
  const [filter,   setFilter]   = useState('all')
  const [selected, setSelected] = useState(null)
  const { sensors, loading, error, refetch } = useSensors()

  const isDummy = API_CONFIG.USE_DUMMY

  const filtered = useMemo(() => {
    if (filter === 'all')  return sensors
    if (filter === 'dry')  return sensors.filter(s => s.status === 'dry')
    if (filter === 'warn') return sensors.filter(s => s.status === 'warn')
    if (filter === 'ok')   return sensors.filter(s => s.status === 'ok')
    return sensors
  }, [sensors, filter])

  const selectedSensor = sensors.find(s => s.sensorId === selected)

  const counts = useMemo(() => ({
    all:  sensors.length,
    dry:  sensors.filter(s => s.status === 'dry').length,
    warn: sensors.filter(s => s.status === 'warn').length,
    ok:   sensors.filter(s => s.status === 'ok').length,
  }), [sensors])

  return (
    <div className="dash-layout">
      <Sidebar />

      <div className="dash-main">
        <div className="sensor-page">
          <div className="page-header">
            <div>
              <h2>Data Sensor</h2>
            </div>
            <div className="header-actions">
              <span className={`mode-badge ${isDummy ? 'dummy' : 'live'}`}>
                <span className={`mode-dot ${isDummy ? '' : 'live'}`} />
                {isDummy ? 'Mode Dummy' : 'Cloud Realtime'}
              </span>
              <button
                onClick={refetch}
                style={{ padding: '6px 12px', border: '1px solid rgba(107,58,31,0.14)', borderRadius: 6, background: '#FFFDF8', fontSize: 12, cursor: 'pointer', fontFamily: 'DM Sans', color: 'var(--text-light)' }}
              >
                ↻ Refresh
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: '#FDEDEC', border: '1px solid rgba(192,57,43,0.15)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#C0392B', marginBottom: 16 }}>
              ! {error} —{' '}
              <button onClick={refetch} style={{ background: 'none', border: 'none', color: '#C0392B', cursor: 'pointer', textDecoration: 'underline', fontSize: 12 }}>
                Coba lagi
              </button>
            </div>
          )}

          <div className="filter-bar">
            {[
              { key: 'all',  label: `Semua (${counts.all})` },
              { key: 'dry',  label: `Kering (${counts.dry})` },
              { key: 'warn', label: `Rendah (${counts.warn})` },
              { key: 'ok',   label: `Normal (${counts.ok})` },
            ].map(f => (
              <button
                key={f.key}
                className={`filter-btn ${filter === f.key ? 'active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="sensor-cards-grid">
            {loading ? (
              [1, 2, 3, 4].map(i => <SensorCard key={i} loading />)
            ) : filtered.length === 0 ? (
              <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                <p>Tidak ada sensor di filter ini</p>
              </div>
            ) : (
              filtered.map(s => (
                <SensorCard
                  key={s.sensorId}
                  sensor={s}
                  selected={selected === s.sensorId}
                  onClick={() => setSelected(selected === s.sensorId ? null : s.sensorId)}
                />
              ))
            )}
          </div>

          {selectedSensor && (
            <SensorDetail
              sensor={selectedSensor}
              onClose={() => setSelected(null)}
            />
          )}
        </div>
      </div>
    </div>
  )
}