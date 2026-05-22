import { useEffect, useRef, useState } from 'react'
import { useBreakpoint } from './hooks/useBreakpoint.js'
import { scrollToSection } from './lib/scroll.js'

/* ─── Static data ─────────────────────────────────────────────────────── */
const TICKER = [
  { pair: 'BTC/USD', price: '67,842.50', change: '+2.34%', up: true },
  { pair: 'ETH/USD', price: '3,521.80',  change: '+1.87%', up: true },
  { pair: 'EUR/USD', price: '1.0921',    change: '-0.12%', up: false },
  { pair: 'XAU/USD', price: '2,341.60',  change: '+0.78%', up: true },
  { pair: 'GBP/USD', price: '1.2648',    change: '-0.09%', up: false },
  { pair: 'SOL/USD', price: '182.40',    change: '+4.21%', up: true },
  { pair: 'NAS100',  price: '19,284.00', change: '+0.55%', up: true },
  { pair: 'USD/JPY', price: '154.32',    change: '+0.31%', up: true },
  { pair: 'XRP/USD', price: '0.6182',    change: '-1.44%', up: false },
  { pair: 'SPX500',  price: '5,432.10',  change: '+0.22%', up: true },
]

const SIGNALS = [
  { asset: 'BTC/USD', action: 'BUY',  conf: 94, entry: '67,842', tp: '72,100', sl: '65,400', pnl: '+$312.50', up: true  },
  { asset: 'EUR/USD', action: 'SELL', conf: 71, entry: '1.0921', tp: '1.0850', sl: '1.0980', pnl: '−$42.00',  up: false },
  { asset: 'XAU/USD', action: 'BUY',  conf: 88, entry: '2,341',  tp: '2,398',  sl: '2,298',  pnl: '+$184.20', up: true  },
  { asset: 'ETH/USD', action: 'BUY',  conf: 91, entry: '3,521',  tp: '3,740',  sl: '3,380',  pnl: '+$96.40',  up: true  },
  { asset: 'GBP/JPY', action: 'SELL', conf: 76, entry: '194.82', tp: '193.10', sl: '196.00', pnl: '−$28.70',  up: false },
]

/* ─── Counter helper ──────────────────────────────────────────────────── */
function animateCounter(el, target, duration, format, delay) {
  setTimeout(() => {
    const start = performance.now()
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      el.textContent = format(Math.floor(eased * target))
      if (p < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, delay)
}

/* ─── Component ───────────────────────────────────────────────────────── */
const NAV_TARGETS = {
  Markets: 'markets',
  Signals: 'signals',
  Leaders: 'leaders',
  Packages: 'packages',
}

export default function AntigravityHero({ currentUser, onLogin, onRegister, onDashboard, onSignalClick }) {
  const { isMobile, isTablet } = useBreakpoint()
  const [menuOpen, setMenuOpen] = useState(false)

  const tickerInnerRef = useRef(null)
  const tickerOuterRef = useRef(null)
  const sigCountRef    = useRef(null)
  const statWrRef      = useRef(null)
  const statVolRef     = useRef(null)
  const statTrRef      = useRef(null)
  const statLatRef     = useRef(null)
  const signalRowRefs  = useRef([])
  const rafRef         = useRef(null)
  const intervalRef    = useRef(null)

  useEffect(() => {
    /* ── Ticker build & animate ── */
    const inner = tickerInnerRef.current
    ;[...TICKER, ...TICKER, ...TICKER].forEach(item => {
      const el = document.createElement('div')
      el.className = 'ticker-item'
      el.innerHTML = `
        <span style="font-size:11px;color:#6B8FA8;letter-spacing:0.06em">${item.pair}</span>
        <span style="font-size:12px;font-weight:700;color:#E2E8F0">${item.price}</span>
        <span style="font-size:10px;font-weight:700;color:${item.up ? '#00D26A' : '#FF4D4D'}">${item.change}</span>
      `
      inner.appendChild(el)
    })

    let offset = 0
    const singleW = TICKER.length * 180
    const tick = () => {
      offset -= 0.5
      if (Math.abs(offset) >= singleW) offset = 0
      inner.style.transform = `translateX(${offset}px)`
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    /* ── Signal row entrance animation ── */
    signalRowRefs.current.forEach((tr, i) => {
      if (!tr) return
      setTimeout(() => {
        tr.style.opacity    = '1'
        tr.style.transform  = 'translateX(0)'
      }, 900 + i * 130)
    })

    /* ── Stat counters ── */
    animateCounter(statWrRef.current,  78,    1800, v => v + '%',            500)
    animateCounter(statVolRef.current, 24,    2000, v => '$' + v + '.4M',    650)
    animateCounter(statTrRef.current,  12847, 2200, v => v.toLocaleString(), 800)
    animateCounter(statLatRef.current, 3,     1200, v => v + 'ms',           350)

    /* ── Live signal count ── */
    let sigCount = 847
    intervalRef.current = setInterval(() => {
      sigCount += Math.floor(Math.random() * 3) + 1
      if (sigCountRef.current)
        sigCountRef.current.textContent = sigCount.toLocaleString() + ' SIGNALS TODAY'
    }, 3500)

    return () => {
      cancelAnimationFrame(rafRef.current)
      clearInterval(intervalRef.current)
    }
  }, [])

  const NAV_LINKS = Object.keys(NAV_TARGETS)

  return (
    <>
      {/* ─── Global styles injected once ─── */}
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%;background:#080C12}
        @keyframes livePulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.3;transform:scale(0.8)}}
        @keyframes glowPulse{0%,100%{opacity:0.4}50%{opacity:0.9}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeDown{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:translateY(0)}}
        .asp-nav-link{color:#4A6880;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer;transition:color 0.2s;font-family:'Courier New',monospace;-webkit-tap-highlight-color:transparent}
        .asp-nav-link:hover{color:#E2E8F0}
        .asp-btn-p{background:#00B4D8;color:#000;border:none;padding:11px 24px;border-radius:6px;font-family:'Courier New',monospace;font-size:11px;font-weight:700;letter-spacing:0.1em;cursor:pointer;text-transform:uppercase;transition:all 0.2s;-webkit-tap-highlight-color:transparent}
        .asp-btn-p:hover{background:#33C6E8;transform:translateY(-1px)}
        .asp-btn-s{background:transparent;color:#A8C4D8;border:1px solid #0F2033;padding:11px 24px;border-radius:6px;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.1em;cursor:pointer;text-transform:uppercase;transition:all 0.2s;-webkit-tap-highlight-color:transparent}
        .asp-btn-s:hover{border-color:#00B4D8;color:#00B4D8}
        .sig-row{border-bottom:1px solid #0F2033;transition:background 0.15s,opacity 0.4s ease,transform 0.4s ease;-webkit-tap-highlight-color:transparent}
        .sig-row:last-child{border-bottom:none}
        .sig-row:hover{background:rgba(0,180,216,0.04)}
        .ticker-track{display:flex;will-change:transform}
        .ticker-item{display:flex;align-items:center;gap:10px;padding:8px 20px;border-right:1px solid #0F2033;min-width:180px;flex-shrink:0}
      `}</style>

      <div style={{ background: '#080C12', fontFamily: "'Courier New',monospace", color: '#E2E8F0', position: 'relative', overflow: 'hidden', minHeight: '100vh' }}>

        {/* Grid texture */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(#0F203340 1px,transparent 1px),linear-gradient(90deg,#0F203340 1px,transparent 1px)', backgroundSize: '60px 60px', pointerEvents: 'none', zIndex: 0 }} />

        {/* Glow */}
        <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '560px', height: '280px', background: 'radial-gradient(ellipse,#00B4D820 0%,transparent 70%)', pointerEvents: 'none', zIndex: 0, animation: 'glowPulse 4s ease-in-out infinite' }} />

        {/* ── NAV ── */}
        <nav style={{ position: 'relative', zIndex: 10, background: '#080C12E0', borderBottom: '1px solid #0F2033', padding: '0 28px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '7px', height: '7px', background: '#00B4D8', borderRadius: '50%', animation: 'livePulse 2s ease-in-out infinite' }} />
              <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.14em', color: '#E2E8F0' }}>ANTIGRAVITY</span>
              <span style={{ fontSize: '9px', color: '#4A7C9E', letterSpacing: '0.1em', marginLeft: '2px' }}>SIGNAL</span>
            </div>

            {/* Desktop nav links */}
            {!isTablet && (
              <div style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
                {NAV_LINKS.map(l => (
                  <span key={l} className="asp-nav-link" onClick={() => scrollToSection(NAV_TARGETS[l])}>{l}</span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {currentUser ? (
                <>
                  {!isMobile && <span style={{ fontSize: '10px', color: '#00D26A', letterSpacing: '0.08em' }}>↑ {currentUser.firstName}</span>}
                  <button className="asp-btn-p" onClick={onDashboard} style={{ padding: '7px 16px', fontSize: '10px' }}>Dashboard</button>
                </>
              ) : (
                <>
                  <button className="asp-btn-s" onClick={onLogin} style={{ padding: '7px 16px', fontSize: '10px' }}>Login</button>
                  {!isMobile && <button className="asp-btn-p" onClick={onRegister} style={{ padding: '7px 16px', fontSize: '10px' }}>Get Started</button>}
                </>
              )}
              {/* Hamburger on tablet/mobile */}
              {isTablet && (
                <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: 'none', border: 'none', color: '#E2E8F0', fontSize: '22px', cursor: 'pointer', padding: '4px 8px', lineHeight: 1, WebkitTapHighlightColor: 'transparent' }}>☰</button>
              )}
            </div>
          </div>

          {/* Mobile dropdown menu */}
          {isTablet && menuOpen && (
            <div style={{ borderTop: '1px solid #0F2033', padding: '12px 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {NAV_LINKS.map(l => (
                <span key={l} onClick={() => { setMenuOpen(false); scrollToSection(NAV_TARGETS[l]) }} className="asp-nav-link" style={{ padding: '12px 16px', display: 'block', fontSize: '12px', minHeight: '44px', lineHeight: '20px' }}>{l}</span>
              ))}
              {!currentUser && isMobile && (
                <button className="asp-btn-p" onClick={() => { setMenuOpen(false); onRegister() }} style={{ margin: '8px 16px', padding: '12px', fontSize: '11px' }}>Get Started</button>
              )}
            </div>
          )}
        </nav>

        {/* ── TICKER ── */}
        <div style={{ background: '#0D1B2A', borderBottom: '1px solid #0F2033', overflow: 'hidden', position: 'relative', zIndex: 10, touchAction: 'pan-x', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ background: '#00B4D8', color: '#000', fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em', padding: '8px 14px', whiteSpace: 'nowrap', flexShrink: 0, zIndex: 2 }}>LIVE MARKETS</div>
            <div style={{ overflow: 'hidden', flex: 1 }} ref={tickerOuterRef}>
              <div className="ticker-track" ref={tickerInnerRef} />
            </div>
          </div>
        </div>

        {/* ── HERO ── */}
        <div style={{ position: 'relative', zIndex: 10, maxWidth: '1100px', margin: '0 auto', padding: isTablet ? '40px 16px 32px' : '64px 28px 48px' }}>

          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#0D1B2A', border: '1px solid #0F2033', borderRadius: '4px', padding: '6px 14px', marginBottom: '28px', opacity: 0, animation: 'fadeDown 0.5s ease 0.1s forwards' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00D26A', display: 'inline-block', animation: 'livePulse 1.4s ease-in-out infinite' }} />
            <span style={{ fontSize: '9px', color: '#4A7C9E', letterSpacing: '0.12em' }}>AI ENGINE ACTIVE</span>
            <span style={{ width: '1px', height: '12px', background: '#0F2033' }} />
            <span ref={sigCountRef} style={{ fontSize: '9px', color: '#00D26A', fontWeight: 700, letterSpacing: '0.08em' }}>847 SIGNALS TODAY</span>
          </div>

          {/* Headline + stat cards */}
          <div style={{ display: 'flex', gap: isTablet ? '32px' : '48px', alignItems: 'flex-start', flexWrap: 'wrap', flexDirection: isTablet ? 'column' : 'row' }}>

            {/* Left */}
            <div style={{ flex: 1, minWidth: '280px', width: '100%' }}>
              <h1 style={{ fontSize: 'clamp(28px, 8vw, 54px)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 0, opacity: 0, animation: 'fadeUp 0.7s ease 0.2s forwards' }}>
                <span style={{ display: 'block', color: '#E2E8F0' }}>INTELLIGENT</span>
                <span style={{ display: 'block', color: '#00B4D8' }}>MULTI-ASSET</span>
                <span style={{ display: 'block', color: '#E2E8F0' }}>TRADING</span>
              </h1>
              <p style={{ fontSize: '13px', color: '#A8C4D8', lineHeight: 1.75, margin: '24px 0', maxWidth: '420px', opacity: 0, animation: 'fadeUp 0.7s ease 0.4s forwards' }}>
                Antigravity deploys machine learning across Forex, Crypto, and Stocks — delivering institutional-grade signals to every investor tier. Real data. Real edge.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', opacity: 0, animation: 'fadeUp 0.6s ease 0.55s forwards', flexDirection: isMobile ? 'column' : 'row' }}>
                <button type="button" className="asp-btn-p" style={isMobile ? { width: '100%', minHeight: '48px' } : {}} onClick={() => currentUser ? scrollToSection('packages') : onRegister()}>Start Trading →</button>
                <button type="button" className="asp-btn-s" style={isMobile ? { width: '100%', minHeight: '48px' } : {}} onClick={() => scrollToSection('signals')}>View Live Signals</button>
              </div>
              <div style={{ display: 'flex', gap: '18px', marginTop: '18px', flexWrap: 'wrap', opacity: 0, animation: 'fadeUp 0.6s ease 0.7s forwards' }}>
                {['NO HIDDEN FEES', 'CANCEL ANYTIME', '3MS LATENCY'].map(t => (
                  <span key={t} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '9px', color: '#4A6880', letterSpacing: '0.07em' }}>
                    <span style={{ color: '#00D26A' }}>✓</span>{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Stat cards */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px', minWidth: isTablet ? '100%' : '260px', maxWidth: isTablet ? '100%' : '340px', width: '100%', opacity: 0, animation: 'fadeUp 0.7s ease 0.45s forwards' }}>
              {[
                { label: 'Win Rate',  ref: statWrRef,  init: '0%',   color: '#00D26A', size: '26px' },
                { label: 'Volume',    ref: statVolRef,  init: '$0M',  color: '#00B4D8', size: '26px' },
                { label: 'Traders',   ref: statTrRef,   init: '0',    color: '#E2E8F0', size: '22px' },
                { label: 'Latency',   ref: statLatRef,  init: '0ms',  color: '#FFB700', size: '26px' },
              ].map(card => (
                <div key={card.label} style={{ background: '#0D1B2A', border: '1px solid #0F2033', borderRadius: '10px', padding: '18px 20px' }}>
                  <div style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4A7C9E', marginBottom: '8px' }}>{card.label}</div>
                  <div ref={card.ref} style={{ fontSize: card.size, fontWeight: 700, color: card.color, letterSpacing: '-0.02em' }}>{card.init}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── SIGNAL FEED ── */}
          <div id="signals" style={{ marginTop: '48px', background: '#0D1B2A', border: '1px solid #0F2033', borderRadius: '12px', overflow: 'hidden', opacity: 0, animation: 'fadeUp 0.7s ease 0.8s forwards' }}>

            {/* Feed header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isTablet ? '13px 14px' : '13px 20px', borderBottom: '1px solid #0F2033', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#00D26A', display: 'inline-block', animation: 'livePulse 1.4s ease-in-out infinite' }} />
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: '#E2E8F0' }}>ANTIGRAVITY SIGNAL FEED</span>
                <span style={{ background: '#0A1E2A', color: '#00B4D8', border: '1px solid #00B4D833', fontSize: '9px', padding: '2px 8px', borderRadius: '3px', letterSpacing: '0.08em' }}>MODEL v4.2 ACTIVE</span>
              </div>
              {!isTablet && (
                <div style={{ display: 'flex', gap: '14px' }}>
                  {['MULTI-ASSET', 'REAL-TIME', 'AI-POWERED'].map(t => (
                    <span key={t} style={{ fontSize: '9px', color: '#4A7C9E', letterSpacing: '0.1em' }}>{t}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isTablet ? '320px' : '560px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #0F2033' }}>
                    {['Asset', 'Action', 'Conf.', 'Entry', ...(!isTablet ? ['TP / SL', 'P&L'] : [])].map((h, i) => (
                      <th key={h} style={{ padding: i === 0 ? '8px 14px 8px 20px' : '8px 14px 8px 0', textAlign: 'left', fontSize: '9px', fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4A7C9E' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SIGNALS.map((sig, i) => (
                    <tr
                      key={sig.asset + i}
                      className="sig-row"
                      ref={el => { signalRowRefs.current[i] = el }}
                      style={{ opacity: 0, transform: 'translateX(-10px)', cursor: 'pointer', minHeight: '44px' }}
                      onClick={() => onSignalClick && onSignalClick(sig)}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,180,216,0.06)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '11px 14px 11px 20px', color: '#E2E8F0', fontSize: '12px', whiteSpace: 'nowrap' }}>{sig.asset}</td>
                      <td style={{ padding: '11px 14px 11px 0' }}>
                        <span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: '3px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em', background: sig.up ? '#00D26A0F' : '#FF4D4D0F', color: sig.up ? '#00D26A' : '#FF4D4D', border: `1px solid ${sig.up ? '#00D26A33' : '#FF4D4D33'}` }}>{sig.action}</span>
                      </td>
                      <td style={{ padding: '11px 14px 11px 0' }}>
                        <span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: '3px', fontSize: '10px', fontWeight: 700, background: sig.conf >= 85 ? '#00B4D80F' : '#FFB7000F', color: sig.conf >= 85 ? '#00B4D8' : '#FFB700', border: `1px solid ${sig.conf >= 85 ? '#00B4D833' : '#FFB70033'}` }}>{sig.conf}%</span>
                      </td>
                      <td style={{ padding: '11px 14px 11px 0', color: '#A8C4D8', fontSize: '12px' }}>{sig.entry}</td>
                      {!isTablet && <td style={{ padding: '11px 14px 11px 0', color: '#4A6880', fontSize: '11px' }}>{sig.tp} / {sig.sl}</td>}
                      {!isTablet && <td style={{ padding: '11px 20px 11px 0', fontSize: '12px', fontWeight: 700, color: sig.up ? '#00D26A' : '#FF4D4D' }}>{sig.pnl}</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Feed footer */}
            <div style={{ padding: isTablet ? '13px 14px' : '13px 20px', borderTop: '1px solid #0F2033', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: isMobile ? '16px' : '24px', flexWrap: 'wrap' }}>
                {[
                  { label: '30-DAY WIN RATE',    val: '78%',   color: '#00D26A' },
                  { label: 'AVG. ROI / SIGNAL',  val: '+2.4%', color: '#00B4D8' },
                  ...(!isMobile ? [
                    { label: 'SIGNALS THIS MONTH', val: '1,247', color: '#A8C4D8' },
                    { label: 'MODEL ACCURACY',     val: '94%',   color: '#FFB700' },
                  ] : []),
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontSize: '9px', color: '#4A7C9E', letterSpacing: '0.08em', marginBottom: '3px' }}>{s.label}</div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: s.color }}>{s.val}</div>
                  </div>
                ))}
              </div>
              <button type="button" className="asp-btn-s" style={{ fontSize: '10px', padding: '6px 14px', minHeight: '44px' }} onClick={() => scrollToSection('signals')}>View All Signals →</button>
            </div>
          </div>

          {/* Disclaimer */}
          <p style={{ marginTop: '20px', fontSize: '9px', color: '#4A6880', letterSpacing: '0.04em', lineHeight: 1.7, textAlign: 'center' }}>
            Past performance is not indicative of future results. Trading involves significant risk of loss. Antigravity provides signal intelligence tools only and does not constitute financial advice.
          </p>
        </div>
      </div>
    </>
  )
}
