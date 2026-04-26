import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { authService } from '../../services/authService'

const NAV_ROUTES = {
  dashboard:  '/dashboard',
  sensor:     '/sensor',
  prediksi:   '/prediksi',
  riwayat:    '/riwayat',
  notifikasi: '/notifikasi',
}

const NAV_ITEMS = [
  {
    section: 'UTAMA',
    items: [
      { id: 'dashboard', label: 'Dashboard',      icon: <IconDashboard /> },
      { id: 'sensor',    label: 'Data Sensor',    icon: <IconSensor /> },
      { id: 'prediksi',  label: 'Prediksi Siram', icon: <IconPrediksi /> },
    ]
  },
  {
    section: 'LAPORAN',
    items: [
      { id: 'riwayat',    label: 'Riwayat',    icon: <IconRiwayat /> },
      { id: 'notifikasi', label: 'Notifikasi', icon: <IconNotif /> },
    ]
  },
]

function IconDashboard() {
  return (
    <svg viewBox="0 0 18 18" fill="none" width="15" height="15">
      <rect x="1" y="1" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.8"/>
      <rect x="10" y="1" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.5"/>
      <rect x="1" y="10" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.5"/>
      <rect x="10" y="10" width="7" height="7" rx="1.5" fill="currentColor" opacity="0.8"/>
    </svg>
  )
}
function IconSensor() {
  return (
    <svg viewBox="0 0 18 18" fill="none" width="15" height="15">
      <circle cx="9" cy="9" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9 1v2M9 15v2M1 9h2M15 9h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M3.5 3.5l1.5 1.5M13 13l1.5 1.5M3.5 14.5l1.5-1.5M13 5l1.5-1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}
function IconPrediksi() {
  return (
    <svg viewBox="0 0 18 18" fill="none" width="15" height="15">
      <path d="M9 2C9 2 4 7 4 11a5 5 0 0010 0c0-4-5-9-5-9z" fill="currentColor" opacity="0.6"/>
      <path d="M9 15v1M6 14l-.5.9M12 14l.5.9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}
function IconRiwayat() {
  return (
    <svg viewBox="0 0 18 18" fill="none" width="15" height="15">
      <rect x="2" y="4" width="14" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M6 2v3M12 2v3M2 8h14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M5 12h3M5 14.5h5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  )
}
function IconNotif() {
  return (
    <svg viewBox="0 0 18 18" fill="none" width="15" height="15">
      <path d="M9 2a5 5 0 00-5 5v3l-1.5 2.5h13L14 10V7a5 5 0 00-5-5z" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M7 14.5a2 2 0 004 0" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  )
}
function IconChevron({ collapsed }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
      style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.25s ease' }}>
      <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate  = useNavigate()
  const location  = useLocation()
  const user      = authService.getUser()

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  const activeNav = Object.entries(NAV_ROUTES).find(
    ([, path]) => location.pathname === path
  )?.[0] || 'dashboard'

  const handleNav = (id) => {
    const path = NAV_ROUTES[id]
    if (path) navigate(path)
  }

  const handleLogout = () => {
    authService.logout()
    navigate('/auth')
  }

  const W = collapsed ? 60 : 220

  return (
    <>
      <aside style={{
        width: W,
        flexShrink: 0,
        background: '#2C1810',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 100,
        transition: 'width 0.25s ease',
        overflow: 'hidden',
      }}>

        {/* Logo + Toggle */}
        <div style={{
          padding: collapsed ? '18px 0' : '18px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.10)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          minHeight: 56,
        }}>
          {!collapsed && (
            <div>
              <div style={{
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: 13,
                fontWeight: 600,
                color: '#F5EDD8',
                letterSpacing: '2px',
                textTransform: 'uppercase',
              }}>
                CAAS 02
              </div>
            </div>
          )}

          {/*TODO: button sidebar */}
          <button
            onClick={() => setCollapsed(v => !v)}
            style={{
              width: 28, height: 28,
              borderRadius: 6,
              background: 'rgba(255,255,255,0.09)',
              border: '1px solid rgba(255,255,255,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: 'rgba(240,230,211,0.7)',
              flexShrink: 0,
              transition: 'background 0.15s',
            }}
            title={collapsed ? 'Buka sidebar' : 'Tutup sidebar'}
          >
            <IconChevron collapsed={collapsed}/>
          </button>
        </div>

        <nav style={{ flex: 1, paddingTop: 8, overflowY: 'auto', overflowX: 'hidden' }}>
          {NAV_ITEMS.map(section => (
            <div key={section.section}>
              {!collapsed && (
                <p style={{
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: 9,
                  letterSpacing: '1.5px',
                  color: 'rgba(196,149,106,0.6)',
                  padding: '14px 16px 4px',
                }}>
                  {section.section}
                </p>
              )}
              {collapsed && <div style={{ height: 8 }}/>}

              {section.items.map(item => {
                const isActive = activeNav === item.id
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    title={collapsed ? item.label : ''}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      gap: 10,
                      width: '100%',
                      padding: collapsed ? '10px 0' : '9px 16px',
                      background: isActive ? 'rgba(74,140,53,0.18)' : 'none',
                      border: 'none',
                      borderLeft: isActive ? '2px solid #4A8C35' : '2px solid transparent',
                      color: isActive ? '#7FBA6A' : 'rgba(240,230,211,0.65)',
                      fontSize: 13,
                      fontFamily: 'IBM Plex Sans, sans-serif',
                      fontWeight: isActive ? 500 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      whiteSpace: 'nowrap',
                      textAlign: 'left',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) e.currentTarget.style.color = 'rgba(240,230,211,0.95)'
                    }}
                    onMouseLeave={e => {
                      if (!isActive) e.currentTarget.style.color = 'rgba(240,230,211,0.65)'
                    }}
                  >
                    <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                      {item.icon}
                    </span>
                    {!collapsed && item.label}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer - user */}
        <div style={{
          padding: collapsed ? '14px 0' : '14px 16px',
          borderTop: '1px solid rgba(255,255,255,0.10)',
        }}>
          {collapsed ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{
                width: 30, height: 30, borderRadius: 4,
                background: '#2D5A1E',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'IBM Plex Mono, monospace',
                fontSize: 11, fontWeight: 500, color: '#fff',
              }}>
                {initials}
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 4,
                  background: '#2D5A1E',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'IBM Plex Mono, monospace',
                  fontSize: 11, fontWeight: 500, color: '#fff',
                  flexShrink: 0,
                }}>
                  {initials}
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#F0E6D3', lineHeight: 1.2 }}>
                    {user?.name || 'User'}
                  </p>
                  <span style={{
                    fontFamily: 'IBM Plex Mono, monospace',
                    fontSize: 10, color: 'rgba(196,149,106,0.7)',
                    letterSpacing: '0.5px',
                  }}>
                    Admin
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%', padding: '7px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 4,
                  color: 'rgba(240,230,211,0.55)',
                  fontSize: 11,
                  fontFamily: 'IBM Plex Sans, sans-serif',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#E74C3C'
                  e.currentTarget.style.borderColor = 'rgba(231,76,60,0.2)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'rgba(240,230,211,0.35)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                }}
              >
                <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                  <path d="M5 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3M10 10l3-3-3-3M13 7H5"
                    stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Keluar
              </button>
            </>
          )}
        </div>
      </aside>

      <div style={{ width: W, flexShrink: 0, transition: 'width 0.25s ease' }}/>
    </>
  )
}