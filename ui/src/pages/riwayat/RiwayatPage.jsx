import { useState, useEffect, useCallback } from 'react'
import { riwayatService } from '../../services/sensorService'
import { API_CONFIG } from '../../config/api.config'
import Sidebar from '../../components/dashboard/Sidebar'
import '../../styles/dashboard.css'
import './riwayat.css'

function getMoistureColor(v) {
  if (v <= 29) return '#E24B4A'
  if (v <= 44) return '#BA7517'
  return '#3B6D11'
}

function formatDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function formatTimeShort(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const STATUS_PILL = {
  ok:   { label: 'Normal', cls: 'ok' },
  warn: { label: 'Rendah', cls: 'warn' },
  dry:  { label: 'Kering', cls: 'dry' },
}

function Skel({ w = '100%', h = 14, radius = 4 }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: radius }}/>
}

function TrendChart({ trend, loading }) {
  if (loading) return <Skel h={120} style={{ borderRadius: 8 }}/>
  if (!trend?.length) return (
    <div style={{ height: 120, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
      <span>tdk ada data tren</span>
    </div>
  )

  const W = 560, H = 120
  const PAD = { t: 16, r: 16, b: 28, l: 38 }
  const iW  = W - PAD.l - PAD.r
  const iH  = H - PAD.t - PAD.b

  const toX = i => PAD.l + (i / Math.max(trend.length - 1, 1)) * iW
  const toY = v => PAD.t + iH - (Math.max(0, Math.min(100, v)) / 100) * iH

  const smooth = (vals) => {
    if (vals.length < 2) return vals.length === 1 ? `M ${toX(0)} ${toY(vals[0])}` : ''
    let d = `M ${toX(0).toFixed(1)} ${toY(vals[0]).toFixed(1)}`
    for (let i = 1; i < vals.length; i++) {
      const cx = ((toX(i-1) + toX(i)) / 2).toFixed(1)
      d += ` C ${cx} ${toY(vals[i-1]).toFixed(1)}, ${cx} ${toY(vals[i]).toFixed(1)}, ${toX(i).toFixed(1)} ${toY(vals[i]).toFixed(1)}`
    }
    return d
  }

  const moistureVals = trend.map(d => d.avgMoisture)
  const mPath = smooth(moistureVals)
  const mArea = mPath ? `${mPath} L ${toX(trend.length-1).toFixed(1)} ${(PAD.t+iH).toFixed(1)} L ${PAD.l} ${(PAD.t+iH).toFixed(1)} Z` : ''

  const getColor = v => v <= 29 ? '#C0392B' : v <= 44 ? '#BA7517' : '#2D6A1F'
  const minV = Math.min(...moistureVals)
  const maxV = Math.max(...moistureVals)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 120 }}>
      <defs>
        <linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#2D6A1F" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="#2D6A1F" stopOpacity="0"/>
        </linearGradient>
        <clipPath id="tClip">
          <rect x={PAD.l} y={PAD.t} width={iW} height={iH}/>
        </clipPath>
      </defs>

      {[0, 29, 44, 100].map(v => (
        <g key={v}>
          <line x1={PAD.l} y1={toY(v)} x2={PAD.l+iW} y2={toY(v)}
            stroke={v === 29 ? 'rgba(192,57,43,0.2)' : v === 44 ? 'rgba(186,117,23,0.2)' : 'rgba(92,51,23,0.07)'}
            strokeWidth="0.8"
            strokeDasharray={v === 29 || v === 44 ? '4 3' : '0'}/>
          <text x={PAD.l-5} y={toY(v)+4} textAnchor="end" fontSize="9"
            fill={v === 29 ? 'rgba(192,57,43,0.5)' : v === 44 ? 'rgba(186,117,23,0.5)' : 'rgba(92,51,23,0.3)'}
            fontFamily="IBM Plex Mono, monospace">
            {v}%
          </text>
        </g>
      ))}

      {mArea && <path d={mArea} fill="url(#tGrad)" clipPath="url(#tClip)"/>}

      {mPath && <path d={mPath} stroke="#2D6A1F" strokeWidth="2.5" fill="none" strokeLinecap="round" clipPath="url(#tClip)"/>}

      {trend.map((d, i) => (
        <circle key={i} cx={toX(i)} cy={toY(d.avgMoisture)} r="3.5"
          fill={getColor(d.avgMoisture)} stroke="white" strokeWidth="1.5"/>
      ))}

      {trend.map((d, i) => {
        if (d.avgMoisture !== minV && d.avgMoisture !== maxV) return null
        const isAbove = d.avgMoisture > 50
        return (
          <text key={i} x={toX(i)} y={toY(d.avgMoisture) + (isAbove ? -8 : 14)}
            textAnchor="middle" fontSize="10" fontWeight="600"
            fill={getColor(d.avgMoisture)} fontFamily="IBM Plex Mono, monospace">
            {d.avgMoisture}%
          </text>
        )
      })}

      {trend.map((d, i) => (
        <text key={i} x={toX(i)} y={H-4} textAnchor="middle" fontSize="9"
          fill="rgba(92,51,23,0.4)" fontFamily="IBM Plex Mono, monospace">
          {d.date}
        </text>
      ))}

      {trend.map((d, i) => (
        d.count > 1 && (
          <text key={`c${i}`} x={toX(i)} y={toY(d.avgMoisture)-8}
            textAnchor="middle" fontSize="8" fill="rgba(92,51,23,0.3)"
            fontFamily="IBM Plex Mono, monospace">
            {d.count}x
          </text>
        )
      ))}

      <line x1={PAD.l} y1={PAD.t+iH} x2={PAD.l+iW} y2={PAD.t+iH}
        stroke="rgba(92,51,23,0.1)" strokeWidth="1"/>
    </svg>
  )
}

function StatsRow({ stats, loading }) {
  if (loading) return (
    <div className="riwayat-stats-row">
      {[1,2,3,4].map(i => <div key={i} className="riwayat-stat"><Skel h={10} w="60%" style={{marginBottom:6}}/><Skel h={22} w="50%"/></div>)}
    </div>
  )
  if (!stats) return null

  const items = [
    { label: 'Rata-rata kelembaban', value: `${stats.avg}%`,          color: getMoistureColor(stats.avg) },
    { label: 'Kelembaban terendah',  value: `${stats.min}%`,          color: '#E24B4A' },
    { label: 'Kelembaban tertinggi', value: `${stats.max}%`,          color: '#3B6D11' },
    { label: 'Total data',           value: `${stats.totalRecords}`,  color: 'var(--brown-dark)' },
  ]

  return (
    <div className="riwayat-stats-row">
      {items.map((s, i) => (
        <div key={i} className="riwayat-stat">
          <p className="riwayat-stat-label">{s.label}</p>
          <p className="riwayat-stat-value" style={{ color: s.color }}>{s.value}</p>
        </div>
      ))}
    </div>
  )
}

function FilterBar({ filters, setFilters, sensorList }) {
  return (
    <div className="riwayat-filter-bar">
      <select
        className="riwayat-select"
        value={filters.sensorId}
        onChange={e => setFilters(f => ({ ...f, sensorId: e.target.value, page: 1 }))}
      >
        <option value="">Semua sensor</option>
        {sensorList.map(s => (
          <option key={s.sensorId} value={s.sensorId}>
            {s.sensorId} — {s.lokasi}
          </option>
        ))}
      </select>

      <select
        className="riwayat-select"
        value={filters.kondisi}
        onChange={e => setFilters(f => ({ ...f, kondisi: e.target.value, page: 1 }))}
      >
        <option value="">Semua kondisi</option>
        <option value="kering">Kering</option>
        <option value="normal">Normal</option>
        <option value="basah">Basah</option>
      </select>

      <input
        type="date" className="riwayat-date"
        value={filters.startDate}
        onChange={e => setFilters(f => ({ ...f, startDate: e.target.value, page: 1 }))}
      />
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>s/d</span>
      <input
        type="date" className="riwayat-date"
        value={filters.endDate}
        onChange={e => setFilters(f => ({ ...f, endDate: e.target.value, page: 1 }))}
      />

      <button
        className="riwayat-reset-btn"
        onClick={() => setFilters({ sensorId: '', kondisi: '', startDate: '', endDate: '', page: 1 })}
      >
        Reset
      </button>
    </div>
  )
}

function RiwayatTable({ data, loading }) {
  if (loading) return (
    <table className="riwayat-table">
      <thead>
        <tr>
          {['Waktu','Sensor','Lokasi','Tanah %','Suhu','Udara %','Raw Soil','Kondisi','Status'].map(h => (
            <th key={h}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {[1,2,3,4,5].map(i => (
          <tr key={i}>
            {[1,2,3,4,5,6,7,8,9].map(j => (
              <td key={j}><Skel h={12} w="80%"/></td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )

  if (!data.length) return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: 13 }}>
      Tidak ada data dengan filter ini
    </div>
  )

  return (
    <table className="riwayat-table">
      <thead>
        <tr>
          <th>Waktu</th>
          <th>Sensor</th>
          <th>Lokasi</th>
          <th>Tanah %</th>
          <th>Suhu</th>
          <th>Udara %</th>
          <th>Raw Soil</th>
          <th>Kondisi</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {data.map(r => {
          const mc  = getMoistureColor(r.moisture)
          const pill = STATUS_PILL[r.status] || STATUS_PILL.ok
          return (
            <tr key={r.id}>
              <td className="riwayat-time">{formatDateTime(r.createdAt)}</td>
              <td style={{ fontWeight: 500, color: 'var(--green-mid)', fontSize: 12 }}>{r.sensorId}</td>
              <td>{r.lokasi}</td>
              <td>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 40, height: 4, background: 'rgba(107,58,31,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${r.moisture}%`, height: '100%', background: mc, borderRadius: 2 }}/>
                  </div>
                  <span style={{ color: mc, fontWeight: 500, fontSize: 12 }}>{r.moisture}%</span>
                </div>
              </td>
              <td style={{ color: r.temp > 30 ? '#BA7517' : 'var(--text-dark)' }}>{r.temp}°C</td>
              <td>{r.hum}%</td>
              <td style={{ color: 'var(--text-muted)', fontSize: 11 }}>{r.soil}</td>
              <td style={{ textTransform: 'capitalize', color: mc, fontSize: 12 }}>{r.kondisi}</td>
              <td><span className={`sensor-pill ${pill.cls}`}>{pill.label}</span></td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  return (
    <div className="riwayat-pagination">
      <button
        className="riwayat-page-btn"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        ← Sebelumnya
      </button>
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        Hal {page} dari {totalPages}
      </span>
      <button
        className="riwayat-page-btn"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Berikutnya →
      </button>
    </div>
  )
}

export default function RiwayatPage() {
  const [filters,    setFilters]    = useState({ sensorId: '', kondisi: '', startDate: '', endDate: '', page: 1 })
  const [history,    setHistory]    = useState({ data: [], total: 0, page: 1, totalPages: 1 })
  const [stats,      setStats]      = useState(null)
  const [sensorList, setSensorList] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [statsLoad,  setStatsLoad]  = useState(true)
  const [statsDays,  setStatsDays]  = useState(7)
  const [error,      setError]      = useState(null)

  const loadHistory = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await riwayatService.getHistory(filters)
      setHistory(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filters])

  const loadStats = useCallback(async () => {
    setStatsLoad(true)
    try {
      const res = await riwayatService.getStats(filters.sensorId || null, statsDays)
      setStats(res)
    } catch {} finally {
      setStatsLoad(false)
    }
  }, [filters.sensorId, statsDays])

  const loadSensors = async () => {
    try {
      const res = await riwayatService.getSensorList()
      setSensorList(res)
    } catch {}
  }

    useEffect(() => {
    loadHistory()
    const interval = setInterval(loadHistory, API_CONFIG.REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [loadHistory])

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, API_CONFIG.REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [loadStats])

  useEffect(() => { loadSensors() }, [])

  return (
    <div className="dash-layout">
      <Sidebar />
      <div className="dash-main">
        <div style={{ padding: '20px 24px' }}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: 'var(--brown-dark)', marginBottom: 3 }}>
              Riwayat Data Sensor
            </h2>
            {/* <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
              {history.total} data tersimpan dari semua sensor IoT
            </p> */}
            {/* <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {[
                { color: '#C0392B', label: 'Kering (≤29%) — perlu disiram segera' },
                { color: '#BA7517', label: 'Rendah (30–44%) — perhatikan' },
                { color: '#2D6A1F', label: 'Normal/Basah (≥45%) — aman' },
              ].map((g, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: g.color, flexShrink: 0 }}/>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{g.label}</span>
                </div>
              ))}
            </div> */}
          </div>

          {error && (
            <div style={{ background: '#FDEDEC', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#C0392B', marginBottom: 16 }}>
              ⚠ {error}
            </div>
          )}

          <div className="panel" style={{ marginBottom: 14 }}>
            <div className="panel-header">
              <div>
                <h3>Statistik & Tren</h3>
                <p>Kelembaban tanah rata-rata per hari</p>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[7, 14, 30].map(d => (
                  <button key={d}
                    onClick={() => setStatsDays(d)}
                    style={{
                      padding: '4px 10px', border: '1px solid rgba(107,58,31,0.14)',
                      borderRadius: 4, fontSize: 11, fontFamily: 'DM Sans',
                      background: statsDays === d ? 'var(--brown-mid)' : 'transparent',
                      color: statsDays === d ? '#FFFDF8' : 'var(--text-light)',
                      cursor: 'pointer',
                    }}
                  >
                    {d}h
                  </button>
                ))}
              </div>
            </div>
            <div className="panel-body">
              <StatsRow stats={stats} loading={statsLoad}/>
              <div style={{ marginTop: 16 }}>
                <TrendChart trend={stats?.trend} loading={statsLoad}/>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h3>Data Lengkap</h3>
                <p>Filter dan telusuri data sensor</p>
              </div>
              <span className="panel-badge">{history.total} data</span>
            </div>
            <div className="panel-body">
              <FilterBar filters={filters} setFilters={setFilters} sensorList={sensorList}/>
              <div style={{ overflowX: 'auto', marginTop: 14 }}>
                <RiwayatTable data={history.data} loading={loading}/>
              </div>
              <Pagination
                page={history.page}
                totalPages={history.totalPages}
                onChange={p => setFilters(f => ({ ...f, page: p }))}
              />
            </div>
          </div>

        </div>
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