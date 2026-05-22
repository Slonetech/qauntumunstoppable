import { useState, useEffect } from 'react'
import { api } from '../lib/api.js'

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }
const card = { background: '#0D1B2A', border: '1px solid #0F2033', borderRadius: '12px', padding: '32px', width: '100%', maxWidth: '440px', position: 'relative', fontFamily: "'Courier New',monospace" }

export default function PaymentModal({ pkg, currentUser, onClose, onSuccess }) {
  const [stripeReady, setStripeReady] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.billing.status()
      .then(({ configured }) => setStripeReady(configured))
      .catch(() => setStripeReady(false))
  }, [])

  const accentColor = pkg.name === 'Elite' ? '#FFB700' : '#00B4D8'

  const handleCheckout = async () => {
    setError('')
    setLoading(true)
    try {
      const { url } = await api.billing.checkoutSession(pkg.id)
      if (url) {
        window.location.href = url
        return
      }
      setError('No checkout URL returned.')
    } catch (err) {
      if (err.code === 'stripe_not_configured') {
        setError('Stripe is not configured yet. Add API keys to server/.env (see README).')
      } else {
        setError(err.message || 'Checkout failed.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={card}>
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#4A7C9E', fontSize: '18px', cursor: 'pointer' }}>✕</button>

        <div style={{ background: '#080C12', border: `1px solid ${accentColor}33`, borderRadius: '8px', padding: '14px 18px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '9px', color: '#4A7C9E', letterSpacing: '0.12em', marginBottom: '4px', textTransform: 'uppercase' }}>Selected Package</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: accentColor }}>{pkg.name}</div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#E2E8F0' }}>{pkg.price}<span style={{ fontSize: '11px', color: '#4A7C9E' }}>/mo</span></div>
          </div>
        </div>

        <div style={{ fontSize: '10px', letterSpacing: '0.14em', color: '#4A7C9E', textTransform: 'uppercase', marginBottom: '8px' }}>SECURE CHECKOUT</div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#E2E8F0', letterSpacing: '-0.02em', marginBottom: '12px' }}>Activate via Stripe</h2>
        <p style={{ fontSize: '12px', color: '#A8C4D8', lineHeight: 1.7, marginBottom: '20px' }}>
          Card details are handled entirely by Stripe Checkout. We never collect or store card numbers in this app.
        </p>
        <p style={{ fontSize: '11px', color: '#4A7C9E', marginBottom: '20px' }}>
          Billing as: <span style={{ color: '#E2E8F0' }}>{currentUser?.email}</span>
        </p>

        {error && (
          <div style={{ background: '#FF4D4D0F', border: '1px solid #FF4D4D33', borderRadius: '6px', padding: '10px 14px', fontSize: '11px', color: '#FF4D4D', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        {stripeReady === false && !error && (
          <div style={{ background: '#FFB7000F', border: '1px solid #FFB70033', borderRadius: '6px', padding: '12px 14px', fontSize: '11px', color: '#FFB700', marginBottom: '16px' }}>
            Stripe keys are not set on the server. Configure <code>STRIPE_*</code> in <code>server/.env</code> to enable payments.
          </div>
        )}

        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading || stripeReady === false}
          style={{
            width: '100%', background: loading || stripeReady === false ? '#4A6880' : '#00B4D8',
            color: '#000', border: 'none', padding: '13px', borderRadius: '6px',
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
            cursor: loading || stripeReady === false ? 'not-allowed' : 'pointer',
            fontFamily: "'Courier New',monospace",
          }}
        >
          {loading ? 'Redirecting to Stripe…' : 'Continue to Stripe Checkout →'}
        </button>

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '10px', color: '#4A6880' }}>
          PCI-compliant payment processing · Cancel anytime
        </div>
      </div>
    </div>
  )
}
