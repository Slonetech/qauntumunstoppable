import { useState } from 'react'
import { useBreakpoint } from '../hooks/useBreakpoint.js'
import { api } from '../lib/api.js'

const inputStyle = {
  width: '100%', background: '#080C12', border: '1px solid #0F2033',
  borderRadius: '6px', padding: '11px 14px', color: '#E2E8F0',
  fontSize: '12px', fontFamily: "'Courier New',monospace", outline: 'none',
  boxSizing: 'border-box',
}
const labelStyle = { fontSize: '10px', letterSpacing: '0.1em', color: '#4A7C9E', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }
const Field = ({ label, children }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
)

export default function Waitlist() {
  const { isMobile, isTablet } = useBreakpoint()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', country: '', investment: '', package: '' })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.firstName.trim()) e.firstName = true
    if (!form.lastName.trim()) e.lastName = true
    if (!form.email.trim() || !form.email.includes('@')) e.email = true
    if (!form.country.trim()) e.country = true
    if (!form.investment) e.investment = true
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    setError('')
    setLoading(true)
    try {
      await api.waitlist.submit({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        country: form.country,
        investment: form.investment,
        package: form.package,
      })
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Could not submit. Is the API running?')
    } finally {
      setLoading(false)
    }
  }

  const border = (k) => ({ ...inputStyle, borderColor: errors[k] ? '#FF4D4D' : '#0F2033' })
  const selectStyle = { ...inputStyle, appearance: 'none', cursor: 'pointer' }

  return (
    <section id="waitlist" style={{ background: '#080C12', padding: isTablet ? '48px 16px' : '80px 32px', borderTop: '1px solid #0F2033' }}>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#4A7C9E', marginBottom: '10px' }}>EARLY ACCESS</div>
          <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 700, color: '#E2E8F0', letterSpacing: '-0.02em', marginBottom: '12px' }}>JOIN THE WAITLIST</h2>
          <p style={{ fontSize: '13px', color: '#A8C4D8', lineHeight: 1.75 }}>Get early access, exclusive pricing, and a personal onboarding call.</p>
        </div>

        <div style={{ background: '#0D1B2A', border: '1px solid #0F2033', borderRadius: '12px', padding: isTablet ? '24px 16px' : '36px 32px' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>✓</div>
              <div style={{ fontSize: '14px', color: '#00D26A', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '8px' }}>You're on the list</div>
              <div style={{ fontSize: '12px', color: '#A8C4D8', lineHeight: 1.7 }}>Our team will contact you within 24 hours.</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{ background: '#FF4D4D0F', border: '1px solid #FF4D4D33', borderRadius: '6px', padding: '10px 14px', fontSize: '11px', color: '#FF4D4D', marginBottom: '16px' }}>
                  {error}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0 16px' }}>
                <Field label="First Name *"><input style={border('firstName')} value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Gordon" /></Field>
                <Field label="Last Name *"><input style={border('lastName')} value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Smith" /></Field>
              </div>
              <Field label="Email Address *"><input style={border('email')} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@example.com" /></Field>
              <Field label="Phone (optional)"><input style={inputStyle} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 555 000 0000" /></Field>
              <Field label="Country *"><input style={border('country')} value={form.country} onChange={e => set('country', e.target.value)} placeholder="Kenya" /></Field>
              <Field label="Investment Level *">
                <select style={{ ...selectStyle, borderColor: errors.investment ? '#FF4D4D' : '#0F2033' }} value={form.investment} onChange={e => set('investment', e.target.value)}>
                  <option value="">Select level…</option>
                  <option>Under $1,000</option>
                  <option>$1,000–$10,000</option>
                  <option>$10,000–$50,000</option>
                  <option>$50,000–$250,000</option>
                  <option>$250,000+ Institutional</option>
                </select>
              </Field>
              <Field label="Interested Package">
                <select style={selectStyle} value={form.package} onChange={e => set('package', e.target.value)}>
                  <option value="">Select…</option>
                  <option>Starter</option>
                  <option>Pro</option>
                  <option>Elite</option>
                  <option>Not sure yet</option>
                </select>
              </Field>
              <button type="submit" disabled={loading} style={{ width: '100%', background: loading ? '#4A6880' : '#00B4D8', color: '#000', border: 'none', padding: '13px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: loading ? 'wait' : 'pointer', fontFamily: "'Courier New',monospace", transition: 'all 0.2s', marginTop: '4px', minHeight: '48px', WebkitTapHighlightColor: 'transparent' }}>
                {loading ? 'Submitting…' : 'Request Early Access →'}
              </button>
            </form>
          )}
          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '10px', color: '#4A6880', letterSpacing: '0.06em' }}>
            Leads stored in PostgreSQL · Server-side validation
          </div>
        </div>
      </div>
    </section>
  )
}
