import { useEffect, useMemo } from 'react'
import {
  ComposedChart, Area, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer
} from 'recharts'

/* ─── Mock price data generator ─────────────────────────────────────── */
function generatePriceData(entryStr, assetName, action) {
  const entry = parseFloat(entryStr.replace(/,/g, ''))
  const seed = assetName.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  let price = entry * 0.988
  const data = []
  const now = new Date()

  for (let i = 60; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 60000)
    const hh = String(t.getHours()).padStart(2, '0')
    const mm = String(t.getMinutes()).padStart(2, '0')
    const bias = action === 'BUY' ? 0.0003 : -0.0003
    const rand = (Math.sin(seed + i * 2.7) * 0.5 + 0.5) - 0.5
    price = price * (1 + bias + rand * 0.002)
    data.push({ time: `${hh}:${mm}`, price: parseFloat(price.toFixed(5)) })
  }
  return data
}

/* ─── SignalChart Modal ─────────────────────────────────────────────── */
export default function SignalChart({ signal, onClose }) {
  const priceData = useMemo(
    () => generatePriceData(signal.entry, signal.asset, signal.action),
    [signal.entry, signal.asset, signal.action]
  )

  /* Close on Escape */
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const entryVal = parseFloat(signal.entry.replace(/,/g, ''))
  const tpVal    = parseFloat(signal.tp.replace(/,/g, ''))
  const slVal    = parseFloat(signal.sl.replace(/,/g, ''))
  const isBuy    = signal.action === 'BUY'
  const accentColor = isBuy ? '#00D26A' : '#FF4D4D'

  /* Determine P&L color */
  const pnlStr = signal.pnl || ''
  const pnlPositive = pnlStr.startsWith('+')
  const pnlColor = pnlPositive ? '#00D26A' : '#FF4D4D'

  /* Determine bias label */
  const biasLabel = isBuy ? 'Bullish' : 'Bearish'

  /* Generate a signal time */
  const signalTime = new Date()
  signalTime.setMinutes(signalTime.getMinutes() - 28)
  const sigHH = String(signalTime.getUTCHours()).padStart(2, '0')
  const sigMM = String(signalTime.getUTCMinutes()).padStart(2, '0')

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.88)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Courier New', monospace",
        animation: 'scOverlayIn 0.2s ease forwards',
      }}
    >
      <style>{`
        @keyframes scOverlayIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scCardIn { from { opacity: 0; transform: translateY(20px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
      `}</style>

      {/* Modal card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0D1B2A',
          border: '1px solid #0F2033',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '760px',
          margin: '16px',
          maxHeight: '95vh',
          overflowY: 'auto',
          animation: 'scCardIn 0.3s ease 0.05s both',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px',
          borderBottom: '1px solid #0F2033',
          flexWrap: 'wrap', gap: '8px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Asset dot + name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: accentColor,
                boxShadow: `0 0 8px ${accentColor}60`,
                display: 'inline-block',
              }} />
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#E2E8F0' }}>{signal.asset}</span>
            </div>

            {/* Action badge */}
            <span style={{
              display: 'inline-block', padding: '3px 10px', borderRadius: '4px',
              fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em',
              background: isBuy ? '#00D26A0F' : '#FF4D4D0F',
              color: accentColor,
              border: `1px solid ${isBuy ? '#00D26A33' : '#FF4D4D33'}`,
            }}>{signal.action}</span>

            {/* Confidence badge */}
            <span style={{
              display: 'inline-block', padding: '3px 10px', borderRadius: '4px',
              fontSize: '10px', fontWeight: 700,
              background: signal.conf >= 85 ? '#00B4D80F' : '#FFB7000F',
              color: signal.conf >= 85 ? '#00B4D8' : '#FFB700',
              border: `1px solid ${signal.conf >= 85 ? '#00B4D833' : '#FFB70033'}`,
            }}>{signal.conf}%</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '10px', color: '#4A7C9E', letterSpacing: '0.08em' }}>Model v4.2</span>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none',
                color: '#4A7C9E', fontSize: '20px', cursor: 'pointer',
                lineHeight: 1, padding: '4px', transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = '#E2E8F0'}
              onMouseLeave={e => e.currentTarget.style.color = '#4A7C9E'}
            >✕</button>
          </div>
        </div>

        {/* ── Stat row ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          borderBottom: '1px solid #0F2033',
          padding: '14px 24px',
          gap: '8px',
        }}>
          {[
            { label: 'Entry', value: signal.entry, color: '#E2E8F0' },
            { label: 'Take Profit', value: signal.tp, color: '#00D26A' },
            { label: 'Stop Loss', value: signal.sl, color: '#FF4D4D' },
            { label: 'P&L', value: signal.pnl, color: pnlColor },
          ].map(stat => (
            <div key={stat.label}>
              <div style={{
                fontSize: '9px', color: '#4A7C9E', letterSpacing: '0.1em',
                textTransform: 'uppercase', marginBottom: '4px',
              }}>{stat.label}</div>
              <div style={{
                fontSize: '14px', fontWeight: 700, color: stat.color,
                fontFamily: "'Courier New', monospace",
              }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* ── Chart ── */}
        <div style={{
          padding: '16px 12px 8px',
          background: '#080C12',
        }}>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={priceData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isBuy ? '#00D26A' : '#FF4D4D'} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={isBuy ? '#00D26A' : '#FF4D4D'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#0F2033" strokeDasharray="3 3" />
              <XAxis
                dataKey="time"
                tick={{ fill: '#4A7C9E', fontSize: 10 }}
                interval={9}
                stroke="#0F2033"
              />
              <YAxis
                tick={{ fill: '#4A7C9E', fontSize: 10 }}
                stroke="#0F2033"
                domain={['auto', 'auto']}
                width={70}
                tickFormatter={v => v.toLocaleString()}
              />
              <Tooltip
                contentStyle={{
                  background: '#0D1B2A',
                  border: '1px solid #0F2033',
                  borderRadius: 6,
                  fontSize: 11,
                  color: '#A8C4D8',
                }}
              />
              <Area type="monotone" dataKey="price" fill="url(#priceGrad)" stroke="none" />
              <Line type="monotone" dataKey="price" stroke={accentColor} strokeWidth={1.5} dot={false} />
              <ReferenceLine
                y={entryVal}
                stroke="#E2E8F0"
                strokeDasharray="4 4"
                label={{ value: 'ENTRY', fill: '#A8C4D8', fontSize: 10, position: 'insideLeft' }}
              />
              <ReferenceLine
                y={tpVal}
                stroke="#00D26A"
                strokeWidth={1.5}
                label={{ value: 'TP', fill: '#00D26A', fontSize: 10, position: 'insideLeft' }}
              />
              <ReferenceLine
                y={slVal}
                stroke="#FF4D4D"
                strokeWidth={1.5}
                label={{ value: 'SL', fill: '#FF4D4D', fontSize: 10, position: 'insideLeft' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* ── Footer ── */}
        <div style={{
          padding: '12px 24px',
          borderTop: '1px solid #0F2033',
          display: 'flex', flexWrap: 'wrap', gap: '6px 20px',
          fontSize: '11px', color: '#4A7C9E',
          letterSpacing: '0.04em',
        }}>
          <span>Signal generated: {sigHH}:{sigMM} UTC</span>
          <span>·</span>
          <span>Timeframe: 15M</span>
          <span>·</span>
          <span>Confidence: {signal.conf}%</span>
          <span>·</span>
          <span>Bias: {biasLabel}</span>
          <span>·</span>
          <span>Asset: {signal.asset.includes('/') ? 'Forex' : 'Index'}</span>
        </div>
      </div>
    </div>
  )
}
