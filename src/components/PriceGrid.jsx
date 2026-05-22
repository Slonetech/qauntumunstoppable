import { useState, useEffect } from 'react'
import { useBreakpoint } from '../hooks/useBreakpoint.js'

const ASSETS = [
  { pair: 'BTC/USD', price: 67842.50, change: 2.34,  decimals: 2 },
  { pair: 'ETH/USD', price: 3521.80,  change: 1.87,  decimals: 2 },
  { pair: 'SOL/USD', price: 182.40,   change: 4.21,  decimals: 2 },
  { pair: 'XRP/USD', price: 0.6182,   change: -1.44, decimals: 4 },
  { pair: 'EUR/USD', price: 1.0921,   change: -0.12, decimals: 4 },
  { pair: 'GBP/USD', price: 1.2648,   change: -0.09, decimals: 4 },
  { pair: 'XAU/USD', price: 2341.60,  change: 0.78,  decimals: 2 },
  { pair: 'USD/JPY', price: 154.32,   change: 0.31,  decimals: 2 },
  { pair: 'NAS100',  price: 19284.00, change: 0.55,  decimals: 2 },
  { pair: 'SPX500',  price: 5432.10,  change: 0.22,  decimals: 2 },
]

function Sparkline({ history, up }) {
  const min = Math.min(...history), max = Math.max(...history)
  const range = max - min || 1
  const W = 80, H = 30
  const pts = history.map((v, i) =>
    `${(i / (history.length - 1)) * W},${H - ((v - min) / range) * H}`
  ).join(' ')
  return (
    <svg width={W} height={H}>
      <polyline points={pts} fill="none"
        stroke={up ? '#00D26A' : '#FF4D4D'}
        strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function mkHistory(base) {
  return Array.from({ length: 20 }, (_, i) =>
    base * (1 + (Math.random() - 0.5) * 0.003 * (i / 10))
  )
}

export default function PriceGrid() {
  const { isTablet } = useBreakpoint()
  const [assets, setAssets] = useState(() =>
    ASSETS.map(a => ({ ...a, history: mkHistory(a.price) }))
  )

  useEffect(() => {
    const id = setInterval(() => {
      setAssets(prev => prev.map(a => {
        const delta = (Math.random() - 0.499) * a.price * 0.0008
        const newPrice = Math.max(a.price + delta, 0.0001)
        const newChange = +(a.change + (Math.random() - 0.5) * 0.04).toFixed(2)
        return { ...a, price: newPrice, change: newChange, history: [...a.history.slice(-19), newPrice] }
      }))
    }, 2000)
    return () => clearInterval(id)
  }, [])

  return (
    <section id="markets" style={{ background: '#080C12', padding: isTablet ? '48px 16px' : '80px 32px', borderTop: '1px solid #0F2033' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00D26A', display: 'inline-block', animation: 'livePulse 1.4s ease-in-out infinite' }} />
            <span style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#4A7C9E' }}>LIVE DATA</span>
          </div>
          <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 700, color: '#E2E8F0', letterSpacing: '-0.02em', marginBottom: '10px' }}>LIVE PRICE INTELLIGENCE</h2>
          <p style={{ fontSize: '13px', color: '#A8C4D8', lineHeight: 1.75, maxWidth: '520px' }}>
            Multi-asset coverage across Forex, Crypto and Global Indices — updated every second
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
          {assets.map(a => {
            const up = a.change >= 0
            return (
              <div key={a.pair}
                style={{ background: '#0D1B2A', border: '1px solid #0F2033', borderRadius: '10px', padding: '18px 20px', transition: 'border-color 0.2s', cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = up ? '#00D26A44' : '#FF4D4D44'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#0F2033'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#E2E8F0', letterSpacing: '0.06em' }}>{a.pair}</div>
                    <div style={{ fontSize: '9px', color: '#4A7C9E', marginTop: '2px', letterSpacing: '0.08em' }}>24H CHANGE</div>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 700, color: up ? '#00D26A' : '#FF4D4D', background: up ? '#00D26A0F' : '#FF4D4D0F', border: `1px solid ${up ? '#00D26A33' : '#FF4D4D33'}`, padding: '2px 8px', borderRadius: '4px' }}>
                    {up ? '+' : ''}{a.change.toFixed(2)}%
                  </span>
                </div>
                <div style={{ fontSize: '17px', fontWeight: 700, color: '#E2E8F0', letterSpacing: '-0.02em', marginBottom: '10px' }}>
                  {a.decimals <= 2 && !['USD/JPY'].includes(a.pair) ? '$' : ''}
                  {a.price.toFixed(a.decimals)}
                </div>
                <Sparkline history={a.history} up={up} />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
