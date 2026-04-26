import { useState } from 'react'
import { useSensorHistory } from '../../hooks/useSensor'
import { API_CONFIG } from '../../config/api.config'
import sensorService from '../../services/sensorService'
import Sidebar from '../../components/dashboard/Sidebar'
import '../../styles/dashboard.css'
import './prediksi.css'

const REC_CONFIG = {
  siram_sekarang: { label: 'Siram Sekarang!', color: '#C0392B', bg: '#FDEDEC', icon: '🚨' },
  siram_nanti:    { label: 'Siram 2–3 Jam',   color: '#BA7517', bg: '#FEF9EC', icon: '⏰' },
  optimal:        { label: 'Kondisi Optimal', color: '#3B6D11', bg: '#EAF3DE', icon: '✅' },
}

function getMoistureColor(v) {
  if (v <= 29) return '#E24B4A'
  if (v <= 44) return '#BA7517'
  return '#3B6D11'
}

function Skel({ w = '100%', h = 16, radius = 4 }) {
  return (
    <div className="skeleton" style={{ width: w, height: h, borderRadius: radius }}/>
  )
}

function SummaryRing({ prediction, loading }) {
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '20px 0' }}>
      <Skel w={120} h={120} radius={60}/>
      <div style={{ flex: 1 }}>
        <Skel h={28} w="60%" style={{ marginBottom: 10 }}/>
        <Skel h={14} w="80%" style={{ marginBottom: 8 }}/>
        <Skel h={14} w="50%"/>
      </div>
    </div>
  )

  if (!prediction) return null

  const rec  = prediction.recommendation
  const cfg  = REC_CONFIG[rec] || REC_CONFIG.optimal
  const circ = 2 * Math.PI * 45
  const off  = circ - (prediction.avgMoisture / 100) * circ

  return (
    <div className="summary-ring-wrap">
      <div style={{ position: 'relative', width: 120, height: 120, flexShrink: 0 }}>
        <svg viewBox="0 0 100 100" width="120" height="120">
          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(107,58,31,0.1)" strokeWidth="8"/>
          <circle cx="50" cy="50" r="45" fill="none"
            stroke={cfg.color} strokeWidth="8"
            strokeDasharray={circ} strokeDashoffset={off}
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1.2s ease' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 600, color: 'var(--brown-dark)', lineHeight: 1 }}>{prediction.avgMoisture}%</p>
          <span style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.5px', marginTop: 2 }}>LEMBAB</span>
        </div>
      </div>

      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: cfg.bg, padding: '6px 14px', borderRadius: 6, marginBottom: 10 }}>
          <span style={{ fontSize: 16 }}>{cfg.icon}</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: cfg.color }}>{cfg.label}</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-dark)', marginBottom: 4 }}>
          Waktu siram berikutnya: <strong>{prediction.nextWateringTime}</strong>
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        </p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
        </p>
      </div>
    </div>
  )
}

function DetailCards({ details, loading }) {
  if (loading) return (
    <div className="pred-detail-grid">
      {[1,2,3,4].map(i => (
        <div key={i} className="pred-detail-card">
          <Skel h={14} w="40%" style={{ marginBottom: 8 }}/>
          <Skel h={20} w="70%" style={{ marginBottom: 10 }}/>
          <Skel h={6} style={{ borderRadius: 3, marginBottom: 8 }}/>
          <Skel h={30} w="100%" style={{ borderRadius: 6 }}/>
        </div>
      ))}
    </div>
  )

  return (
    <div className="pred-detail-grid">
      {details.map(d => {
        const cfg = REC_CONFIG[d.recommendation] || REC_CONFIG.optimal
        const mc  = getMoistureColor(d.moisture)
        return (
          <div key={d.sensorId} className={`pred-detail-card ${d.urgent ? 'urgent' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--green-mid)' }}>{d.sensorId}</span>
              {d.urgent && <span style={{ fontSize: 10, background: '#FDEDEC', color: '#C0392B', padding: '2px 6px', borderRadius: 3, fontWeight: 500 }}>URGENT</span>}
            </div>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--brown-dark)', marginBottom: 10 }}>{d.lokasi}</p>

            <div style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Kelembaban tanah</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: mc }}>{d.moisture}%</span>
              </div>
              <div style={{ height: 5, background: 'rgba(107,58,31,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${d.moisture}%`, height: '100%', background: mc, borderRadius: 3, transition: 'width 1s ease' }}/>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 10 }}>
              <div style={{ background: 'rgba(107,58,31,0.04)', borderRadius: 6, padding: '6px 8px' }}>
                <p style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>SUHU</p>
                <p style={{ fontSize: 14, fontWeight: 500, color: d.temp > 30 ? '#BA7517' : 'var(--brown-dark)' }}>{d.temp}°C</p>
              </div>
              <div style={{ background: 'rgba(107,58,31,0.04)', borderRadius: 6, padding: '6px 8px' }}>
                <p style={{ fontSize: 9, color: 'var(--text-muted)', marginBottom: 2 }}>UDARA</p>
                <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--brown-dark)' }}>{d.hum}%</p>
              </div>
            </div>

            <div style={{ background: cfg.bg, borderRadius: 6, padding: '8px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14 }}>{cfg.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: cfg.color }}>{cfg.label}</span>
              </div>
              <span style={{ fontSize: 10, color: cfg.color }}>Jam {d.nextWateringTime}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function PrediksiPage() {
  const [prediction, setPrediction] = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const isDummy = API_CONFIG.USE_DUMMY

  useState(() => {
    const load = async () => {
      try {
        if (isDummy) {
          await new Promise(r => setTimeout(r, 600))
          setPrediction(DUMMY_PREDICTION)
        } else {
          const res = await fetch(`${API_CONFIG.BASE_URL}/prediction/latest`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          })
          const data = await res.json()
          setPrediction(data)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
    const interval = setInterval(load, API_CONFIG.REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="dash-layout">
      <Sidebar />

      <div className="dash-main">
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: 'var(--brown-dark)', marginBottom: 3 }}>
                Prediksi Siram
              </h2>
            </div>

          </div>

          {error && (
            <div style={{ background: '#FDEDEC', border: '1px solid rgba(192,57,43,0.15)', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#C0392B', marginBottom: 16 }}>
              ! {error}
            </div>
          )}

          <div className="panel" style={{ marginBottom: 14 }}>
            <div className="panel-header">
              <div>
                <h3>Ringkasan Prediksi</h3>
              </div>

            </div>
            <div className="panel-body">
              <SummaryRing prediction={prediction} loading={loading} />
            </div>
          </div>

          <div className="panel" style={{ marginBottom: 14 }}>
            <div className="panel-header">
              <div>
                <h3>Detail Per Sensor</h3>
                <p>Rekomendasi individual tiap blok</p>
              </div>

            </div>
            <div className="panel-body">
              <DetailCards details={prediction?.details || []} loading={loading} />
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