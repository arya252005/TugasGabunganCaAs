import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import LoginForm from '../../components/auth/LoginForm'
import RegisterForm from '../../components/auth/RegisterForm'
import { IconLeaf } from '../../components/auth/Icons'
import '../../styles/auth.css'

function PanelSVGBg() {
  return (
    <svg className="panel-bg" viewBox="0 0 480 700" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      {[...Array(18)].map((_, i) => (
        <circle
          key={i}
          cx={80 + (i % 6) * 60}
          cy={580 + Math.floor(i / 6) * 30}
          r={2 + (i % 3)}
          fill="#A0622A"
          opacity="0.15"
        />
      ))}
    </svg>
  )
}

export default function AuthPage() {
  const [tab, setTab]       = useState('login')  
  const { login, register, loading, error, success, clearMessages } = useAuth()
  const navigate            = useNavigate()

  const switchTab = (next) => {
    setTab(next)
    clearMessages()
  }

  const handleLogin = async (creds) => {
    const res = await login(creds)
    if (res.ok) navigate('/dashboard')
  }

  const handleRegister = async (payload) => {
    const res = await register(payload)
    if (res.ok) setTimeout(() => switchTab('login'), 1500)
  }

  return (
    <div className="auth-layout">
      <aside className="auth-panel">
        <PanelSVGBg />

        <div className="panel-content">
          <div className="panel-logo">
            {/* <IconLeaf className="panel-logo-icon" />
            <span className="panel-logo-text">caAs 02</span> */}
          </div>

          <h2 className="panel-headline">
            caAs <em>02</em><br />
          </h2>
        </div>

      </aside>

      <main className="auth-form-side">
        <div className="auth-form-box">

          <div className="mobile-logo">
            <IconLeaf className="mobile-logo-icon" />
            <h2>caas02</h2>
          </div>

          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
              onClick={() => switchTab('login')}
            >
              Masuk
            </button>
            <button
              className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
              onClick={() => switchTab('register')}
            >
              Daftar
            </button>
          </div>

          {error   && <div className="auth-alert error">⚠ {error}</div>}
          {success && <div className="auth-alert success">✓ {success}</div>}

          {tab === 'login'
            ? <LoginForm
                onSubmit={handleLogin}
                loading={loading}
                onSwitch={() => switchTab('register')}
              />
            : <RegisterForm
                onSubmit={handleRegister}
                loading={loading}
                onSwitch={() => switchTab('login')}
              />
          }
        </div>
      </main>
    </div>
  )
}