import { useState } from 'react'
import { useBreakpoint } from '../hooks/useBreakpoint.js'

const TRADERS = [
  { rank: 1,  name: 'Marcus A.',  tier: 'Elite',   profit: 48320, roi: 482, signals: 847 },
  { rank: 2,  name: 'Priya L.',   tier: 'Elite',   profit: 31870, roi: 318, signals: 612 },
  { rank: 3,  name: 'Dmitri V.',  tier: 'Pro',     profit: 19240, roi: 192, signals: 441 },
  { rank: 4,  name: 'Amara K.',   tier: 'Elite',   profit: 15680, roi: 156, signals: 389 },
  { rank: 5,  name: 'James O.',   tier: 'Pro',     profit: 12340, roi: 123, signals: 298 },
  { rank: 6,  name: 'Yuki T.',    tier: 'Pro',     profit:  9120, roi:  91, signals: 241 },
  { rank: 7,  name: 'Fatima N.',  tier: 'Starter', profit:  5840, roi:  58, signals: 178 },
  { rank: 8,  name: 'Carlos M.',  tier: 'Pro',     profit:  4210, roi:  42, signals: 156 },
  { rank: 9,  name: 'Emma W.',    tier: 'Starter', profit:  2670, roi:  26, signals:  89 },
  { rank: 10, name: 'Raj P.',     tier: 'Starter', profit:  1340, roi:  13, signals:  44 },
]

const TIER_COLOR = { Starter: '#4A6880', Pro: '#00B4D8', Elite: '#FFB700' }
const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' }
const TABS = ['All Tiers', 'Starter', 'Pro', 'Elite']

export default function Leaderboard() {
  const { isMobile, isTablet } = useBreakpoint()
  const [active, setActive] = useState('All Tiers')
  const rows = active === 'All Tiers' ? TRADERS : TRADERS.filter(t => t.tier === active)

  const headers = isMobile
    ? ['Rank', 'Trader', 'Profit', 'ROI']
    : ['Rank', 'Trader', 'Tier', 'Profit', 'ROI', 'Signals']

  return (
    <section id="leaders" style={{ background: '#080C12', padding: isTablet ? '48px 16px' : '80px 32px', borderTop: '1px solid #0F2033' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: '36px' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#4A7C9E', marginBottom: '10px' }}>RANKINGS</div>
          <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 700, color: '#E2E8F0', letterSpacing: '-0.02em', marginBottom: '10px' }}>EARNER LEADERBOARD</h2>
          <p style={{ fontSize: '13px', color: '#A8C4D8', lineHeight: 1.75, maxWidth: '520px' }}>
            Live rankings by realised profit. Distinguished by package tier.
          </p>
        </div>

        {/* Filter tabs — scrollable on mobile */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', whiteSpace: 'nowrap', WebkitOverflowScrolling: 'touch', paddingBottom: '4px' }}>
          {TABS.map(tab => {
            const on = active === tab
            const c = TIER_COLOR[tab] || '#E2E8F0'
            return (
              <button key={tab} onClick={() => setActive(tab)} style={{
                background: on ? `${c}18` : 'transparent',
                border: `1px solid ${on ? c : '#0F2033'}`,
                color: on ? c : '#4A7C9E',
                padding: '7px 18px', borderRadius: '6px',
                fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase',
                cursor: 'pointer', fontFamily: "'Courier New',monospace", transition: 'all 0.2s',
                flexShrink: 0, minHeight: '44px', WebkitTapHighlightColor: 'transparent',
              }}>{tab}</button>
            )
          })}
        </div>

        <div style={{ background: '#0D1B2A', border: '1px solid #0F2033', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: isMobile ? '300px' : '500px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #0F2033' }}>
                  {headers.map((h, i) => (
                    <th key={h} style={{ padding: i === 0 ? '10px 14px 10px 20px' : '10px 14px 10px 0', textAlign: 'left', fontSize: '9px', fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4A7C9E' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((t, idx) => (
                  <tr key={t.name}
                    style={{ borderBottom: idx < rows.length - 1 ? '1px solid #0F2033' : 'none', transition: 'background 0.15s', minHeight: '44px' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,180,216,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '13px 14px 13px 20px', fontSize: isMobile ? '11px' : '14px', fontWeight: 700, color: '#E2E8F0' }}>
                      {MEDALS[t.rank] ?? <span style={{ color: '#4A7C9E' }}>{t.rank}</span>}
                    </td>
                    <td style={{ padding: '13px 14px 13px 0', fontSize: isMobile ? '11px' : '12px', color: '#E2E8F0' }}>{t.name}</td>
                    {!isMobile && (
                      <td style={{ padding: '13px 14px 13px 0' }}>
                        <span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: '3px', fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', color: TIER_COLOR[t.tier], background: `${TIER_COLOR[t.tier]}15`, border: `1px solid ${TIER_COLOR[t.tier]}33` }}>{t.tier}</span>
                      </td>
                    )}
                    <td style={{ padding: '13px 14px 13px 0', fontSize: isMobile ? '11px' : '13px', fontWeight: 700, color: '#00D26A' }}>+${t.profit.toLocaleString()}</td>
                    <td style={{ padding: '13px 14px 13px 0', fontSize: isMobile ? '11px' : '12px', color: '#00B4D8' }}>+{t.roi}%</td>
                    {!isMobile && <td style={{ padding: '13px 14px 13px 0', fontSize: '12px', color: '#A8C4D8' }}>{t.signals.toLocaleString()}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
