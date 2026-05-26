import { useState, useEffect, useRef } from 'react'
import { api } from '../lib/api.js'
import { toDisplaySignal } from '../lib/signalFormat.js'

const TRADERS = [
  { rank: 1, name: 'Marcus A.',  tier: 'Elite',   profit: 48320, roi: 482, signals: 847 },
  { rank: 2, name: 'Priya L.',   tier: 'Elite',   profit: 31870, roi: 318, signals: 612 },
  { rank: 3, name: 'Dmitri V.',  tier: 'Pro',     profit: 19240, roi: 192, signals: 441 },
  { rank: 4, name: 'Amara K.',   tier: 'Elite',   profit: 15680, roi: 156, signals: 389 },
  { rank: 5, name: 'James O.',   tier: 'Pro',     profit: 12340, roi: 123, signals: 298 },
]
const TIER_COLOR = { Starter: '#4A6880', Pro: '#00B4D8', Elite: '#FFB700' }
const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }
const TABS = ['Overview', 'Signals', 'Charts', 'History', 'Leaderboard', 'Settings']

const CHART_ASSETS = [
  { name: 'BTC/USD', symbol: 'BINANCE:BTCUSDT' },
  { name: 'ETH/USD', symbol: 'BINANCE:ETHUSDT' },
  { name: 'XRP/USD', symbol: 'BINANCE:XRPUSDT' },
  { name: 'EUR/USD', symbol: 'FX:EURUSD' },
  { name: 'GBP/USD', symbol: 'FX:GBPUSD' },
  { name: 'GOLD', symbol: 'OANDA:XAUUSD' },
]

function TradingViewWidget({ symbol }) {
  const containerRef = useRef(null)

  useEffect(() => {
    const scriptId = 'tradingview-widget-script'
    let script = document.getElementById(scriptId)

    const initWidget = () => {
      if (containerRef.current && window.TradingView) {
        containerRef.current.innerHTML = ''
        const div = document.createElement('div')
        div.id = `tv-widget-container-${symbol.replace(/[^a-zA-Z0-9]/g, '-')}`
        div.style.height = '100%'
        div.style.width = '100%'
        containerRef.current.appendChild(div)

        new window.TradingView.widget({
          autosize: true,
          symbol: symbol,
          interval: "15",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          enable_publishing: false,
          hide_side_toolbar: true,
          allow_symbol_change: false,
          container_id: div.id,
          hide_legend: false,
          save_image: false,
          calendar: false,
          show_popup_button: false,
          studies: [
            "RSI@tv-basicstudies",
            "MASimple@tv-basicstudies"
          ]
        })
      }
    }

    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://s3.tradingview.com/tv.js'
      script.type = 'text/javascript'
      script.async = true
      script.onload = initWidget
      document.head.appendChild(script)
    } else {
      if (window.TradingView) {
        initWidget()
      } else {
        script.addEventListener('load', initWidget)
      }
    }
  }, [symbol])

  return (
    <div style={{ height: '320px', width: '100%', position: 'relative', overflow: 'hidden', borderRadius: '8px', border: '1px solid #0F2033', background: '#080C12' }}>
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
    </div>
  )
}

const inp = { width: '100%', background: '#080C12', border: '1px solid #0F2033', borderRadius: '6px', padding: '10px 14px', color: '#E2E8F0', fontSize: '12px', fontFamily: "'Courier New',monospace", outline: 'none', boxSizing: 'border-box' }
const lbl = { fontSize: '10px', letterSpacing: '0.1em', color: '#4A7C9E', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }

export default function Dashboard({ currentUser, onClose, onLogout, onUpdateUser, onSignalClick }) {
  const [tab, setTab] = useState('Overview')
  const [balance, setBalance] = useState(currentUser?.balance || 0)
  const [deposit, setDeposit] = useState('')
  const [alerts, setAlerts] = useState({ email: true, sms: false, freq: 'realtime' })
  const [signals, setSignals] = useState([])
  const [signalsLoading, setSignalsLoading] = useState(true)
  const [signalsError, setSignalsError] = useState('')

  const [activeChart, setActiveChart] = useState(CHART_ASSETS[0])
  const [historySignals, setHistorySignals] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyError, setHistoryError] = useState('')

  useEffect(() => {
    if (tab !== 'History') return
    let cancelled = false
    setHistoryLoading(true)
    setHistoryError('')
    api.signals.history()
      .then((data) => {
        if (!cancelled) {
          setHistorySignals((data.signals || []).map(toDisplaySignal))
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setHistoryError(err.message || 'Failed to load signal history.')
          setHistorySignals([])
        }
      })
      .finally(() => {
        if (!cancelled) setHistoryLoading(false)
      })
    return () => { cancelled = true }
  }, [tab])

  const tier = currentUser?.tier || 'Starter'
  const accentColor = tier === 'Elite' ? '#FFB700' : tier === 'Pro' ? '#00B4D8' : '#4A6880'

  useEffect(() => {
    let cancelled = false
    setSignalsLoading(true)
    setSignalsError('')
    api.signals.list()
      .then((data) => {
        if (!cancelled) {
          setSignals((data.signals || []).map(toDisplaySignal))
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setSignalsError(err.message || 'Failed to load signals.')
          setSignals([])
        }
      })
      .finally(() => {
        if (!cancelled) setSignalsLoading(false)
      })
    return () => { cancelled = true }
  }, [tier])

  const handleDeposit = async () => {
    const amt = parseFloat(deposit)
    if (isNaN(amt) || amt <= 0) return
    const newBal = balance + amt
    try {
      const { user } = await api.auth.updateMe({ balance: newBal })
      setBalance(user.balance)
      setDeposit('')
      onUpdateUser(user)
    } catch {
      setBalance(newBal)
      setDeposit('')
      onUpdateUser({ ...currentUser, balance: newBal })
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 900, display: 'flex' }}>
      {/* Dim overlay */}
      <div style={{ flex: 1, background: 'rgba(0,0,0,0.6)', cursor: 'pointer' }} onClick={onClose} />

      {/* Sidebar panel */}
      <div style={{ width: '420px', maxWidth: '95vw', background: '#080C12', borderLeft: '1px solid #0F2033', display: 'flex', flexDirection: 'column', fontFamily: "'Courier New',monospace", overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ padding: '24px 24px 0', borderBottom: '1px solid #0F2033', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '10px', letterSpacing: '0.14em', color: '#4A7C9E', textTransform: 'uppercase', marginBottom: '4px' }}>MEMBER DASHBOARD</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#E2E8F0' }}>{currentUser?.firstName} {currentUser?.lastName}</div>
              <div style={{ display: 'inline-block', marginTop: '6px', padding: '2px 10px', borderRadius: '3px', fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', color: accentColor, background: `${accentColor}18`, border: `1px solid ${accentColor}33` }}>{tier}</div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#4A7C9E', fontSize: '20px', cursor: 'pointer', lineHeight: 1 }}>✕</button>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 4px', marginTop: '8px' }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ flex: '1 0 30%', background: tab === t ? '#0D1B2A' : 'transparent', border: `1px solid ${tab === t ? '#0F2033' : 'transparent'}`, color: tab === t ? '#E2E8F0' : '#4A7C9E', padding: '6px 2px', borderRadius: '6px', fontSize: '9px', letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Courier New',monospace", transition: 'all 0.2s' }}>{t}</button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, padding: '24px' }}>

          {/* OVERVIEW */}
          {tab === 'Overview' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '24px' }}>
                {[
                  { label: 'Account Balance', val: `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, color: '#E2E8F0' },
                  { label: 'Estimated P&L', val: `$${(balance * 0.078).toFixed(2)}`, color: '#00D26A' },
                  { label: 'Win Rate', val: '78%', color: '#00B4D8' },
                  { label: 'Open Trades', val: signalsLoading ? '…' : `${signals.filter(s => s.status === 'OPEN').length}`, color: '#FFB700' },
                ].map(s => (
                  <div key={s.label} style={{ background: '#0D1B2A', border: '1px solid #0F2033', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ fontSize: '9px', color: '#4A7C9E', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '6px' }}>{s.label}</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: s.color }}>{s.val}</div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4A7C9E', marginBottom: '12px' }}>Recent Trades</div>
              {signalsLoading ? (
                <div style={{ fontSize: '11px', color: '#4A7C9E', padding: '16px 0' }}>Loading signals…</div>
              ) : signalsError ? (
                <div style={{ fontSize: '11px', color: '#FF4D4D', padding: '16px 0' }}>{signalsError}</div>
              ) : (
                <div style={{ background: '#0D1B2A', border: '1px solid #0F2033', borderRadius: '10px', overflow: 'hidden' }}>
                  {signals.slice(0, 5).map((s, i, arr) => (
                    <div key={s.id} onClick={() => onSignalClick && onSignalClick(s)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 16px', borderBottom: i < arr.length - 1 ? '1px solid #0F2033' : 'none', cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,180,216,0.06)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#E2E8F0' }}>{s.asset}</div>
                        <div style={{ fontSize: '9px', color: '#4A7C9E', marginTop: '2px' }}>{s.action} · {s.entry}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: s.status === 'OPEN' ? '#00B4D8' : s.up ? '#00D26A' : '#FF4D4D' }}>{s.pnl}</div>
                        <span style={{ fontSize: '8px', padding: '1px 6px', borderRadius: '3px', background: s.status === 'OPEN' ? '#00D26A0F' : '#4A688022', color: s.status === 'OPEN' ? '#00D26A' : '#4A7C9E', border: `1px solid ${s.status === 'OPEN' ? '#00D26A33' : '#4A6880'}` }}>{s.status}</span>
                      </div>
                    </div>
                  ))}
                  {signals.length === 0 && (
                    <div style={{ padding: '20px', textAlign: 'center', fontSize: '11px', color: '#4A7C9E' }}>No signals yet. Run <code>npm run db:seed</code> in server/.</div>
                  )}
                </div>
              )}
            </>
          )}

          {/* SIGNALS */}
          {tab === 'Signals' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00D26A', display: 'inline-block', animation: 'livePulse 1.4s ease-in-out infinite' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#E2E8F0', letterSpacing: '0.1em' }}>YOUR SIGNAL FEED</span>
                <span style={{ fontSize: '8px', background: '#00D26A0F', color: '#00D26A', border: '1px solid #00D26A33', padding: '2px 8px', borderRadius: '3px' }}>LIVE</span>
              </div>
              {signalsLoading && (
                <div style={{ fontSize: '11px', color: '#4A7C9E', padding: '24px 0', textAlign: 'center' }}>Loading signals…</div>
              )}
              {signalsError && !signalsLoading && (
                <div style={{ background: '#FF4D4D0F', border: '1px solid #FF4D4D33', borderRadius: '8px', padding: '14px', fontSize: '11px', color: '#FF4D4D' }}>
                  {signalsError}
                </div>
              )}
              {!signalsLoading && !signalsError && (
                <div style={{ background: '#0D1B2A', border: '1px solid #0F2033', borderRadius: '10px', overflow: 'hidden' }}>
                  {signals.map((s, i) => (
                    <div key={s.id} onClick={() => onSignalClick && onSignalClick(s)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', borderBottom: i < signals.length - 1 ? '1px solid #0F2033' : 'none', cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,180,216,0.06)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#E2E8F0' }}>{s.asset}</div>
                        <div style={{ fontSize: '10px', color: '#4A7C9E', marginTop: '3px' }}>Entry {s.entry} · TP {s.tp}</div>
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '3px', background: s.up ? '#00D26A0F' : '#FF4D4D0F', color: s.up ? '#00D26A' : '#FF4D4D', border: `1px solid ${s.up ? '#00D26A33' : '#FF4D4D33'}` }}>{s.action}</span>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: s.status === 'OPEN' ? '#00B4D8' : s.up ? '#00D26A' : '#FF4D4D' }}>{s.pnl}</span>
                      </div>
                    </div>
                  ))}
                  {signals.length === 0 && (
                    <div style={{ padding: '24px', textAlign: 'center', fontSize: '11px', color: '#4A7C9E' }}>
                      No signals available for your tier. Seed the database: <code style={{ color: '#A8C4D8' }}>cd server && npm run db:seed</code>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* CHARTS */}
          {tab === 'Charts' && (
            <>
              <div style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4A7C9E', marginBottom: '12px' }}>TradingView Pro Charts</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '16px' }}>
                {CHART_ASSETS.map(asset => {
                  const isSelected = activeChart.symbol === asset.symbol
                  return (
                    <button
                      key={asset.symbol}
                      onClick={() => setActiveChart(asset)}
                      style={{
                        background: isSelected ? 'rgba(0,180,216,0.12)' : '#0D1B2A',
                        border: `1px solid ${isSelected ? '#00B4D8' : '#0F2033'}`,
                        color: isSelected ? '#E2E8F0' : '#4A7C9E',
                        padding: '8px 4px',
                        borderRadius: '6px',
                        fontSize: '9px',
                        fontWeight: isSelected ? 'bold' : 'normal',
                        cursor: 'pointer',
                        fontFamily: "'Courier New',monospace",
                        textAlign: 'center',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => {
                        if (!isSelected) e.currentTarget.style.border = '1px solid rgba(0,180,216,0.4)'
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) e.currentTarget.style.border = '1px solid #0F2033'
                      }}
                    >
                      {asset.name}
                    </button>
                  )
                })}
              </div>
              <TradingViewWidget symbol={activeChart.symbol} />
              <div style={{ fontSize: '9px', color: '#4A7C9E', marginTop: '12px', lineHeight: '1.5', textAlign: 'center', fontFamily: "'Courier New', monospace" }}>
                Real-time advanced TradingView charts feed. Optimized in dark mode for institutional grade indicators.
              </div>
            </>
          )}

          {/* HISTORY */}
          {tab === 'History' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00B4D8', display: 'inline-block' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#E2E8F0', letterSpacing: '0.1em' }}>SIGNAL HISTORY LOG</span>
                <span style={{ fontSize: '8px', background: 'rgba(0, 180, 216, 0.08)', color: '#00B4D8', border: '1px solid rgba(0, 180, 216, 0.2)', padding: '2px 8px', borderRadius: '3px' }}>LAST 20</span>
              </div>

              {historyLoading ? (
                <div style={{ fontSize: '11px', color: '#4A7C9E', padding: '24px 0', textAlign: 'center' }}>Loading history log…</div>
              ) : historyError ? (
                <div style={{ background: '#FF4D4D0F', border: '1px solid #FF4D4D33', borderRadius: '8px', padding: '14px', fontSize: '11px', color: '#FF4D4D' }}>
                  {historyError}
                </div>
              ) : (
                <div style={{ background: '#0D1B2A', border: '1px solid #0F2033', borderRadius: '10px', overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left', fontFamily: "'Courier New', monospace" }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #0F2033', background: 'rgba(13, 27, 42, 0.5)' }}>
                        <th style={{ padding: '10px 12px', color: '#4A7C9E', fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Asset</th>
                        <th style={{ padding: '10px 12px', color: '#4A7C9E', fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Type</th>
                        <th style={{ padding: '10px 12px', color: '#4A7C9E', fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Entry</th>
                        <th style={{ padding: '10px 12px', color: '#4A7C9E', fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Time</th>
                        <th style={{ padding: '10px 12px', color: '#4A7C9E', fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historySignals.map((s, i) => {
                        const timeStr = new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        return (
                          <tr
                            key={s.id}
                            onClick={() => onSignalClick && onSignalClick(s)}
                            style={{ borderBottom: i < historySignals.length - 1 ? '1px solid #0F2033' : 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,180,216,0.04)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                          >
                            <td style={{ padding: '12px 12px', fontWeight: 700, color: '#E2E8F0' }}>{s.asset}</td>
                            <td style={{ padding: '12px 12px' }}>
                              <span style={{
                                color: s.up ? '#00D26A' : '#FF4D4D',
                                fontWeight: 'bold'
                              }}>
                                {s.action}
                              </span>
                            </td>
                            <td style={{ padding: '12px 12px', color: '#A8C4D8' }}>{s.entry}</td>
                            <td style={{ padding: '12px 12px', color: '#4A7C9E' }}>{timeStr}</td>
                            <td style={{ padding: '12px 12px' }}>
                              <span style={{
                                fontSize: '9px',
                                padding: '1px 6px',
                                borderRadius: '3px',
                                background: s.status === 'OPEN' ? '#00D26A14' : 'rgba(74, 104, 128, 0.15)',
                                color: s.status === 'OPEN' ? '#00D26A' : '#4A7C9E',
                                border: `1px solid ${s.status === 'OPEN' ? '#00D26A33' : '#4A688040'}`
                              }}>
                                {s.status === 'OPEN' ? 'Active' : 'Closed'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                      {historySignals.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: '#4A7C9E' }}>
                            No signal history recorded yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* LEADERBOARD */}
          {tab === 'Leaderboard' && (
            <>
              <div style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4A7C9E', marginBottom: '12px' }}>Top Earners</div>
              <div style={{ background: '#0D1B2A', border: '1px solid #0F2033', borderRadius: '10px', overflow: 'hidden' }}>
                {TRADERS.map((t, i) => (
                  <div key={t.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 16px', borderBottom: i < TRADERS.length - 1 ? '1px solid #0F2033' : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '14px' }}>{MEDALS[t.rank] ?? t.rank}</span>
                      <div>
                        <div style={{ fontSize: '12px', color: '#E2E8F0' }}>{t.name}</div>
                        <span style={{ fontSize: '8px', padding: '1px 6px', borderRadius: '3px', color: TIER_COLOR[t.tier], background: `${TIER_COLOR[t.tier]}15`, border: `1px solid ${TIER_COLOR[t.tier]}33` }}>{t.tier}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#00D26A' }}>+${t.profit.toLocaleString()}</div>
                      <div style={{ fontSize: '10px', color: '#00B4D8' }}>+{t.roi}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* SETTINGS */}
          {tab === 'Settings' && (
            <>
              <div style={{ background: '#0D1B2A', border: '1px solid #0F2033', borderRadius: '10px', padding: '18px', marginBottom: '16px' }}>
                <div style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4A7C9E', marginBottom: '14px' }}>Account Info</div>
                {[
                  ['Name', `${currentUser?.firstName} ${currentUser?.lastName}`],
                  ['Email', currentUser?.email],
                  ['Country', currentUser?.country],
                  ['Package', tier],
                  ['Investment Level', currentUser?.investment || '—'],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #0F2033' }}>
                    <span style={{ fontSize: '10px', color: '#4A7C9E', letterSpacing: '0.08em' }}>{k}</span>
                    <span style={{ fontSize: '11px', color: '#E2E8F0' }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: '#0D1B2A', border: '1px solid #0F2033', borderRadius: '10px', padding: '18px', marginBottom: '16px' }}>
                <div style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4A7C9E', marginBottom: '14px' }}>Alert Preferences</div>
                {[['Email Alerts', 'email'], ['SMS Alerts', 'sms']].map(([label, key]) => (
                  <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#A8C4D8' }}>{label}</span>
                    <div onClick={() => setAlerts(a => ({ ...a, [key]: !a[key] }))}
                      style={{ width: '36px', height: '20px', borderRadius: '10px', background: alerts[key] ? '#00B4D8' : '#0F2033', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', border: '1px solid #0F2033' }}>
                      <div style={{ position: 'absolute', top: '2px', left: alerts[key] ? '16px' : '2px', width: '14px', height: '14px', background: '#E2E8F0', borderRadius: '50%', transition: 'left 0.2s' }} />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ background: '#0D1B2A', border: '1px solid #0F2033', borderRadius: '10px', padding: '18px' }}>
                <div style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4A7C9E', marginBottom: '14px' }}>Deposit Funds</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#E2E8F0', marginBottom: '12px' }}>
                  ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <label style={lbl}>Amount (USD)</label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <input style={{ ...inp, marginBottom: 0 }} type="number" min="1" value={deposit} onChange={e => setDeposit(e.target.value)} placeholder="500.00" />
                  <button onClick={handleDeposit} style={{ background: '#00B4D8', color: '#000', border: 'none', padding: '10px 18px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Courier New',monospace", whiteSpace: 'nowrap' }}>Add Funds</button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #0F2033', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span onClick={onClose} style={{ fontSize: '11px', color: '#4A7C9E', cursor: 'pointer', letterSpacing: '0.06em' }}>← Back to Site</span>
          <span onClick={onLogout} style={{ fontSize: '11px', color: '#FF4D4D', cursor: 'pointer', letterSpacing: '0.06em' }}>Sign Out</span>
        </div>
      </div>
    </div>
  )
}
