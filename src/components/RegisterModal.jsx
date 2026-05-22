import { useState } from 'react'
import { useBreakpoint } from '../hooks/useBreakpoint.js'
import { api } from '../lib/api.js'

const inp = { width: '100%', background: '#080C12', border: '1px solid #0F2033', borderRadius: '6px', padding: '11px 14px', color: '#E2E8F0', fontSize: '12px', fontFamily: "'Courier New',monospace", outline: 'none', boxSizing: 'border-box', marginBottom: '14px' }
const lbl = { fontSize: '10px', letterSpacing: '0.1em', color: '#4A7C9E', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }

export default function RegisterModal({
  onClose,
  onRegister,
  onSwitchToLogin,
  pendingPackage,
  onRegisteredWithPackage,
}) {
  const { isMobile, isTablet } = useBreakpoint()
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', country: '', phone: '',
    investment: '', package: pendingPackage?.name || '',
  })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = true
    if (!form.lastName.trim()) e.lastName = true
    if (!form.email.trim() || !form.email.includes('@')) e.email = true
    if (!form.password || form.password.length < 6) e.password = true
    if (!form.country.trim()) e.country = true
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setError('')
    setLoading(true)
    try {
      const { user } = await api.auth.register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        country: form.country,
        phone: form.phone,
        investment: form.investment,
        package: form.package,
      })
      onRegister(user)
      if (pendingPackage && onRegisteredWithPackage) {
        onRegisteredWithPackage(pendingPackage)
      }
    } catch (err) {
      if (err.status === 409) setErrors({ email: true })
      setError(err.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const fi = (k) => ({ ...inp, borderColor: errors[k] ? '#FF4D4D' : '#0F2033' })
  const sel = { ...inp, appearance: 'none', cursor: 'pointer' }

  const overlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000,
    display: 'flex',
    alignItems: isTablet ? 'flex-end' : 'center',
    justifyContent: 'center', padding: isTablet ? '0' : '20px',
    overflowY: 'auto',
  }
  const card = {
    background: '#0D1B2A', border: '1px solid #0F2033',
    borderRadius: isTablet ? '16px 16px 0 0' : '12px',
    padding: isTablet ? '28px 20px 32px' : '32px',
    width: isTablet ? '100%' : '100%',
    maxWidth: isTablet ? '100%' : '480px',
    maxHeight: '90vh', overflowY: 'auto',
    position: 'relative', fontFamily: "'Courier New',monospace",
    margin: isTablet ? '0' : 'auto',
  }

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={card}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#4A7C9E', fontSize: '18px', cursor: 'pointer', lineHeight: 1, minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', WebkitTapHighlightColor: 'transparent' }}>✕</button>
        <div style={{ fontSize: '10px', letterSpacing: '0.14em', color: '#4A7C9E', textTransform: 'uppercase', marginBottom: '8px' }}>FREE ACCOUNT</div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#E2E8F0', letterSpacing: '-0.02em', marginBottom: '8px' }}>Create Account</h2>
        {pendingPackage && (
          <p style={{ fontSize: '11px', color: '#00B4D8', marginBottom: '20px' }}>
            Sign up to activate the {pendingPackage.name} plan ({pendingPackage.price}/mo)
          </p>
        )}

        {error && <div style={{ background: '#FF4D4D0F', border: '1px solid #FF4D4D33', borderRadius: '6px', padding: '10px 14px', fontSize: '11px', color: '#FF4D4D', marginBottom: '16px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0 14px' }}>
            <div><label style={lbl}>First Name *</label><input style={fi('firstName')} value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Gordon" /></div>
            <div><label style={lbl}>Last Name *</label><input style={fi('lastName')} value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Smith" /></div>
          </div>
          <label style={lbl}>Email Address *</label>
          <input style={fi('email')} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" autoComplete="email" />
          <label style={lbl}>Password * (min 6 chars)</label>
          <input style={fi('password')} type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" autoComplete="new-password" />
          <label style={lbl}>Country *</label>
          <input style={fi('country')} value={form.country} onChange={e => set('country', e.target.value)} placeholder="Kenya" />
          <label style={lbl}>Phone (optional)</label>
          <input style={inp} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+254 700 000 000" />
          <label style={lbl}>Investment Level</label>
          <select style={sel} value={form.investment} onChange={e => set('investment', e.target.value)}>
            <option value="">Select level…</option>
            <option>Under $1,000</option><option>$1,000–$10,000</option>
            <option>$10,000–$50,000</option><option>$50,000–$250,000</option>
            <option>$250,000+ Institutional</option>
          </select>
          <label style={lbl}>Interested Package</label>
          <select style={sel} value={form.package} onChange={e => set('package', e.target.value)}>
            <option value="">Select…</option>
            <option>Starter</option><option>Pro</option><option>Elite</option><option>Not sure yet</option>
          </select>
          <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? '#4A6880' : '#00B4D8', color: '#000', border: 'none', padding: '13px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: loading ? 'wait' : 'pointer', fontFamily: "'Courier New',monospace", marginTop: '4px', minHeight: '48px', WebkitTapHighlightColor: 'transparent' }}>
            {loading ? 'Creating account…' : 'Create Free Account →'}
          </button>
        </form>

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '11px', color: '#4A7C9E' }}>
          Already have an account?{' '}
          <span onClick={onSwitchToLogin} style={{ color: '#00B4D8', cursor: 'pointer', textDecoration: 'underline', WebkitTapHighlightColor: 'transparent' }}>Sign in</span>
        </div>
        <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '10px', color: '#4A6880' }}>
          Account data stored on server · Passwords hashed with bcrypt
        </div>
      </div>
    </div>
  )
}
