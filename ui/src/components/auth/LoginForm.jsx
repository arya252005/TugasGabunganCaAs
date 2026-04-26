import { useState } from 'react'
import { IconEmail, IconLock, IconEyeOpen, IconEyeClosed } from './Icons'

export default function LoginForm({ onSubmit, loading, onSwitch }) {
  const [form, setForm]         = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [errors, setErrors]     = useState({})

  const validate = () => {
    const e = {}
    if (!form.email){
       e.email    = 'Email wajib diisi'
    } else if (!/\S+@\S+\.\S+/.test(form.email)){
       e.email = 'Format email tidak valid'
    }
    if (!form.password){
       e.password = 'Kata sandi wajib diisi'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-heading">
        <h3>Selamat datang kembali</h3>
        <p>Masuk untuk memantau kebun</p>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="login-email">Email</label>
        <div className="field-wrap">
          <IconEmail className="field-icon" />
          <input
            id="login-email"
            type="email"
            className={`field-input ${errors.email ? 'error' : ''}`}
            placeholder="nama@email.com"
            value={form.email}
            onChange={handleChange('email')}
            autoComplete="email"
          />
        </div>
        {errors.email && <p className="field-error">⚠ {errors.email}</p>}
      </div>

      <div className="field">
        <label className="field-label" htmlFor="login-pass">Kata Sandi</label>
        <div className="field-wrap">
          <IconLock className="field-icon" />
          <input
            id="login-pass"
            type={showPass ? 'text' : 'password'}
            className={`field-input ${errors.password ? 'error' : ''}`}
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange('password')}
            autoComplete="current-password"
            style={{ paddingRight: '40px' }}
          />
          <button
            type="button"
            className="field-eye"
            onClick={() => setShowPass(v => !v)}
            aria-label="Toggle password visibility"
          >
            {showPass
              ? <IconEyeClosed style={{ width: 16, height: 16 }} />
              : <IconEyeOpen  style={{ width: 16, height: 16 }} />}
          </button>
        </div>
        {errors.password && <p className="field-error">⚠ {errors.password}</p>}
      </div>

      <button type="submit" className="btn-submit" disabled={loading}>
        {loading && <span className="spinner" />}
        <span>{loading ? 'Masuk...' : 'Masuk ke Dashboard'}</span>
      </button>

      <p className="form-footer">
        Belum punya akun?{' '}
        <button type="button" onClick={onSwitch}>Daftar sekarang</button>
      </p>
    </form>
  )
}