import { useState } from 'react'
import { IconEmail, IconLock, IconUser, IconEyeOpen, IconEyeClosed } from './Icons'

export default function RegisterForm({ onSubmit, loading, onSwitch }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [showPass,    setShowPass]    = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors,      setErrors]      = useState({})

  const validate = () => {
    const e = {}
    if (!form.name.trim())                           e.name            = 'Nama wajib diisi'
    if (!form.email)                                 e.email           = 'Email wajib diisi'
    else if (!/\S+@\S+\.\S+/.test(form.email))      e.email           = 'Format email tidak valid'
    if (!form.password)                              e.password        = 'Kata sandi wajib diisi'
    else if (form.password.length < 8)               e.password        = 'Minimal 8 karakter'
    if (!form.confirmPassword)                       e.confirmPassword = 'Konfirmasi kata sandi wajib diisi'
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Kata sandi tidak cocok'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      const { confirmPassword, ...payload } = form
      onSubmit(payload)
    }
  }

  const passwordMatch = form.confirmPassword && form.password === form.confirmPassword

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-heading">
        <h3>Buat akun baru</h3>
        <p>Daftar untuk mengakses sistem</p>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="reg-name">Nama Lengkap</label>
        <div className="field-wrap">
          <IconUser className="field-icon" />
          <input id="reg-name" type="text"
            className={`field-input ${errors.name ? 'error' : ''}`}
            placeholder="Nama lengkap" value={form.name}
            onChange={handleChange('name')} autoComplete="name"/>
        </div>
        {errors.name && <p className="field-error">⚠ {errors.name}</p>}
      </div>

      <div className="field">
        <label className="field-label" htmlFor="reg-email">Email</label>
        <div className="field-wrap">
          <IconEmail className="field-icon" />
          <input id="reg-email" type="email"
            className={`field-input ${errors.email ? 'error' : ''}`}
            placeholder="nama@email.com" value={form.email}
            onChange={handleChange('email')} autoComplete="email"/>
        </div>
        {errors.email && <p className="field-error">⚠ {errors.email}</p>}
      </div>

      <div className="field">
        <label className="field-label" htmlFor="reg-pass">Kata Sandi</label>
        <div className="field-wrap">
          <IconLock className="field-icon" />
          <input id="reg-pass" type={showPass ? 'text' : 'password'}
            className={`field-input ${errors.password ? 'error' : ''}`}
            placeholder="Min. 8 karakter" value={form.password}
            onChange={handleChange('password')} autoComplete="new-password"
            style={{ paddingRight: '40px' }}/>
          <button type="button" className="field-eye" onClick={() => setShowPass(v => !v)}>
            {showPass
              ? <IconEyeClosed style={{ width: 16, height: 16 }}/>
              : <IconEyeOpen   style={{ width: 16, height: 16 }}/>}
          </button>
        </div>
        {errors.password && <p className="field-error">⚠ {errors.password}</p>}
      </div>

      <div className="field">
        <label className="field-label" htmlFor="reg-confirm">Konfirmasi Kata Sandi</label>
        <div className="field-wrap">
          <IconLock className="field-icon" />
          <input id="reg-confirm" type={showConfirm ? 'text' : 'password'}
            className={`field-input ${errors.confirmPassword ? 'error' : ''}`}
            placeholder="Ulangi kata sandi" value={form.confirmPassword}
            onChange={handleChange('confirmPassword')} autoComplete="new-password"
            style={{ paddingRight: '40px' }}/>
          <button type="button" className="field-eye" onClick={() => setShowConfirm(v => !v)}>
            {showConfirm
              ? <IconEyeClosed style={{ width: 16, height: 16 }}/>
              : <IconEyeOpen   style={{ width: 16, height: 16 }}/>}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="field-error">⚠ {errors.confirmPassword}</p>
        )}
        {!errors.confirmPassword && passwordMatch && (
          <p style={{ fontSize: 11, color: 'var(--green-mid)', marginTop: 4 }}>✓ Kata sandi cocok</p>
        )}
      </div>

      <button type="submit" className="btn-submit" disabled={loading} style={{ marginTop: '0.75rem' }}>
        {loading && <span className="spinner" />}
        <span>{loading ? 'Membuat akun...' : 'Buat Akun'}</span>
      </button>

      <p className="form-footer">
        Sudah punya akun? <button type="button" onClick={onSwitch}>Masuk di sini</button>
      </p>
    </form>
  )
}