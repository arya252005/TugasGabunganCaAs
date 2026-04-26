import { useState, useEffect, useCallback } from 'react'
import { notifikasiService } from '../../services/sensorService'
import Sidebar from '../../components/dashboard/Sidebar'
import '../../styles/dashboard.css'
import './notifikasi.css'

const TYPE_CONFIG = {
  danger:  { icon: '🚨', label: 'Kritis', iconClass: 'danger', tagClass: 'danger'  },
  warning: { icon: '⚠️', label: 'Peringatan', iconClass: 'warning', tagClass: 'warning' },
  info:    { icon: '✅', label: 'Info', iconClass: 'info', tagClass: 'info'    },
}

function timeAgo(iso) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs  = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1)   return 'Baru saja'
  if (mins < 60)  return `${mins} menit lalu`
  if (hrs < 24)   return `${hrs} jam lalu`
  return `${days} hari lalu`
}

function formatFull(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function Skel({ w = '100%', h = 14, radius = 4 }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: radius }}/>
}

function SkeletonRows() {
  return (
    <>
      {[1,2,3,4,5].map(i => (
        <div key={i} className="notif-row">
          <Skel w={36} h={36} radius={8}/>
          <div style={{ flex: 1 }}>
            <Skel h={13} w="80%" style={{ marginBottom: 8 }}/>
            <Skel h={10} w="40%"/>
          </div>
          <Skel h={10} w={60}/>
        </div>
      ))}
    </>
  )
}

function NotifStats({ data, loading }) {
  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
      {[1,2,3].map(i => <div key={i} style={{ background: 'var(--brown-cream)', borderRadius: 10, padding: 14 }}><Skel h={10} w="60%" style={{ marginBottom: 8 }}/><Skel h={24} w="40%"/></div>)}
    </div>
  )
  if (!data) return null

  const danger  = data.data.filter(n => n.type === 'danger').length
  const warning = data.data.filter(n => n.type === 'warning').length
  const unread  = data.unreadCount

  const items = [
    { label: 'Belum dibaca', value: unread,  color: unread > 0 ? '#C0392B' : '#3B6D11', bg: unread > 0 ? '#FDEDEC' : '#EAF3DE' },
    { label: 'Kritis',       value: danger,  color: '#C0392B', bg: '#FDEDEC' },
    { label: 'Peringatan',   value: warning, color: '#BA7517', bg: '#FEF9EC' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
      {items.map((s, i) => (
        <div key={i} style={{ background: s.bg, borderRadius: 10, padding: '12px 14px' }}>
          <p style={{ fontSize: 11, color: s.color, marginBottom: 5, opacity: 0.8 }}>{s.label}</p>
          <p style={{ fontFamily: 'Playfair Display, serif', fontSize: 26, fontWeight: 600, color: s.color, lineHeight: 1 }}>
            {s.value}
          </p>
        </div>
      ))}
    </div>
  )
}

function NotifRow({ notif, onMarkRead }) {
  const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info
  const [tooltip, setTooltip] = useState(false)

  return (
    <div
      className={`notif-row ${!notif.isRead ? 'unread' : ''} ${notif.type}`}
      onClick={() => !notif.isRead && onMarkRead(notif.id)}
    >
      <div className={`notif-row-icon ${cfg.iconClass}`}>{cfg.icon}</div>

      <div className="notif-row-content">
        <p className="notif-row-message">{notif.message}</p>
        <div className="notif-row-meta">
          {notif.sensorId && (
            <span className={`notif-sensor-tag ${cfg.tagClass}`}>{notif.sensorId}</span>
          )}
          {notif.moisture != null && (
            <span className="moisture-badge">{notif.moisture}%</span>
          )}
          <span
            title={formatFull(notif.createdAt)}
            onMouseEnter={() => setTooltip(true)}
            onMouseLeave={() => setTooltip(false)}
            style={{ cursor: 'default', position: 'relative' }}
          >
            {timeAgo(notif.createdAt)}
            {tooltip && (
              <span style={{
                position: 'absolute', bottom: '100%', left: 0,
                background: 'var(--brown-dark)', color: '#FFFDF8',
                fontSize: 10, padding: '3px 7px', borderRadius: 4,
                whiteSpace: 'nowrap', zIndex: 10, marginBottom: 4,
              }}>
                {formatFull(notif.createdAt)}
              </span>
            )}
          </span>
        </div>
      </div>

      <div className="notif-row-right">
        {!notif.isRead && <div className="notif-unread-dot"/>}
        {!notif.isRead && (
          <button
            className="notif-mark-btn"
            onClick={e => { e.stopPropagation(); onMarkRead(notif.id) }}
          >
            Tandai dibaca
          </button>
        )}
      </div>
    </div>
  )
}

export default function NotifikasiPage() {
  const [tab, setTab] = useState('all')
  const [data, setData] = useState(null)
  const [loading, setLoading]  = useState(true)
  const [error, setError] = useState(null)
  const [marking, setMarking] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {}
      if (tab === 'unread') params.isRead = 'false'
      if (tab === 'read')   params.isRead = 'true'
      const res = await notifikasiService.getAll(params)
      setData(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => { loadData() }, [loadData])

  const handleMarkRead = async (id) => {
    await notifikasiService.markRead(id)
    setData(prev => ({
      ...prev,
      unreadCount: Math.max(0, prev.unreadCount - 1),
      data: prev.data.map(n => n.id === id ? { ...n, isRead: true } : n),
    }))
  }

  const handleMarkAll = async () => {
    setMarking(true)
    try {
      await notifikasiService.markAllRead()
      setData(prev => ({
        ...prev,
        unreadCount: 0,
        data: prev.data.map(n => ({ ...n, isRead: true })),
      }))
    } finally {
      setMarking(false)
    }
  }

  const unreadCount = data?.unreadCount ?? 0
  const counts = {
    all:    data?.total ?? 0,
    unread: data?.data?.filter(n => !n.isRead).length ?? 0,
    read:   data?.data?.filter(n => n.isRead).length ?? 0,
  }

  const TABS = [
    { key: 'all',    label: 'Semua',        count: counts.all    },
    { key: 'unread', label: 'Belum dibaca', count: counts.unread },
    { key: 'read',   label: 'Sudah dibaca', count: counts.read   },
  ]

  return (
    <div className="dash-layout">
      <Sidebar />
      <div className="dash-main">
        <div className="notif-page">
          <div className="notif-page-header">
            <div>
              <h2>Notifikasi</h2>
            </div>
            <div className="notif-header-actions">
              {unreadCount > 0 && (
                <button
                  className="btn-mark-all"
                  onClick={handleMarkAll}
                  disabled={marking}
                >
                  {marking ? 'Memproses...' : 'Tandai semua dibaca'}
                </button>
              )}
              <button
                className="btn-mark-all"
                onClick={loadData}
                style={{ color: 'var(--text-light)' }}
              >
                Refresh
              </button>
            </div>
          </div>

          <NotifStats data={data} loading={loading}/>

          {error && (
            <div style={{ background: '#FDEDEC', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#C0392B', marginBottom: 14 }}>
              ! {error}
            </div>
          )}

          <div className="notif-filter-tabs">
            {TABS.map(t => (
              <button
                key={t.key}
                className={`notif-tab ${tab === t.key ? 'active' : ''}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
                <span className="notif-tab-count">{t.count}</span>
              </button>
            ))}
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <h3>
                  {tab === 'all'    && 'Semua Notifikasi'}
                  {tab === 'unread' && 'Belum Dibaca'}
                  {tab === 'read'   && 'Sudah Dibaca'}
                </h3>
              </div>
              <span className="panel-badge">{data?.total ?? 0} total</span>
            </div>

            <div className="notif-list-full">
              {loading ? (
                <SkeletonRows />
              ) : !data?.data?.length ? (
                <div className="notif-empty">
                  <span>
                    {tab === 'unread' ? 'Semua notif sudah dibaca' : 'Belum ada notif'}
                  </span>
                </div>
              ) : (
                data.data.map(n => (
                  <NotifRow key={n.id} notif={n} onMarkRead={handleMarkRead}/>
                ))
              )}
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