import { useState } from 'react'
import { useBreakpoint } from '../hooks/useBreakpoint.js'
import { api } from '../lib/api.js'

const inp = { width: '100%', background: '#080C12', border: '1px solid #0F2033', borderRadius: '6px', padding: '11px 14px', color: '#E2E8F0', fontSize: '12px', fontFamily: "'Courier New',monospace", outline: 'none', boxSizing: 'border-box', marginBottom: '14px' }
const lbl = { fontSize: '10px', letterSpacing: '0.1em', color: '#4A7C9E', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }

export default function LoginModal({ onClose, onLogin, onSwitchToRegister }) {
  const { isTablet } = useBreakpoint()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user } = await api.auth.login({ email, password })
      onLogin(user)
    } catch (err) {
      setError(err.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  const overlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000,
    display: 'flex',
    alignItems: isTablet ? 'flex-end' : 'center',
    justifyContent: 'center', padding: isTablet ? '0' : '20px',
  }
  const card = {
    background: '#0D1B2A', border: '1px solid #0F2033',
    borderRadius: isTablet ? '16px 16px 0 0' : '12px',
    padding: isTablet ? '28px 20px 32px' : '32px',
    width: isTablet ? '100%' : '100%',
    maxWidth: isTablet ? '100%' : '420px',
    maxHeight: '90vh', overflowY: 'auto',
    position: 'relative', fontFamily: "'Courier New',monospace",
  }

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={card}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#4A7C9E', fontSize: '18px', cursor: 'pointer', lineHeight: 1, minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', WebkitTapHighlightColor: 'transparent' }}>✕</button>
        <div style={{ fontSize: '10px', letterSpacing: '0.14em', color: '#4A7C9E', textTransform: 'uppercase', marginBottom: '8px' }}>MEMBER ACCESS</div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#E2E8F0', letterSpacing: '-0.02em', marginBottom: '28px' }}>Sign In</h2>

        {error && <div style={{ background: '#FF4D4D0F', border: '1px solid #FF4D4D33', borderRadius: '6px', padding: '10px 14px', fontSize: '11px', color: '#FF4D4D', marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <label style={lbl}>Email Address</label>
          <input style={inp} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required autoComplete="email" />
          <label style={lbl}>Password</label>
          <input style={inp} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" />
          <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? '#4A6880' : '#00B4D8', color: '#000', border: 'none', padding: '13px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: loading ? 'wait' : 'pointer', fontFamily: "'Courier New',monospace", marginTop: '4px', minHeight: '48px', WebkitTapHighlightColor: 'transparent' }}>
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '11px', color: '#4A7C9E' }}>
          No account?{' '}
          <span onClick={onSwitchToRegister} style={{ color: '#00B4D8', cursor: 'pointer', textDecoration: 'underline', WebkitTapHighlightColor: 'transparent' }}>Create one free</span>
        </div>
        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '10px', color: '#4A6880' }}>
          Secure server-side authentication · Passwords are hashed, never stored in the browser
        </div>
      </div>
    </div>
  )
}
