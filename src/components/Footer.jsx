import { useBreakpoint } from '../hooks/useBreakpoint.js'

export default function Footer({ onAdminClick }) {
  const { isTablet } = useBreakpoint()

  return (
    <footer style={{ background: '#080C12', borderTop: '1px solid #0F2033', padding: isTablet ? '32px 16px 24px' : '48px 32px 32px', fontFamily: "'Courier New',monospace" }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', justifyContent: isTablet ? 'center' : 'flex-start' }}>
          <div style={{ width: '6px', height: '6px', background: '#00B4D8', borderRadius: '50%' }} />
          <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.14em', color: '#E2E8F0' }}>ANTIGRAVITY</span>
          <span style={{ fontSize: '9px', color: '#4A7C9E', letterSpacing: '0.1em' }}>SIGNAL</span>
        </div>

        <p style={{ fontSize: '10px', color: '#4A6880', lineHeight: 1.9, maxWidth: '680px', letterSpacing: '0.04em', marginBottom: '28px', textAlign: isTablet ? 'center' : 'left' }}>
          Past performance is not indicative of future results. Trading involves significant risk of loss. Antigravity Signal provides signal intelligence tools only and does not constitute financial advice. You should carefully consider whether trading is appropriate for you in light of your experience, objectives, financial resources, and other relevant circumstances.
        </p>

        <div style={{ borderTop: '1px solid #0F2033', paddingTop: '24px', display: 'flex', justifyContent: isTablet ? 'center' : 'space-between', alignItems: 'center', flexDirection: isTablet ? 'column' : 'row', gap: '12px' }}>
          {/* Links + hidden admin trigger */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center', justifyContent: isTablet ? 'center' : 'flex-start' }}>
            {['Terms', 'Privacy', 'Risk Disclosure'].map(l => (
              <span key={l} style={{ fontSize: '10px', color: '#4A6880', letterSpacing: '0.08em', cursor: 'pointer', transition: 'color 0.2s', WebkitTapHighlightColor: 'transparent', minHeight: '44px', display: 'inline-flex', alignItems: 'center' }}
                onMouseEnter={e => e.currentTarget.style.color = '#A8C4D8'}
                onMouseLeave={e => e.currentTarget.style.color = '#4A6880'}
              >{l}</span>
            ))}
            {/* Hidden admin link */}
            <span
              onClick={onAdminClick}
              title="System Administration"
              style={{ fontSize: '9px', color: '#0F2033', letterSpacing: '0.06em', cursor: 'pointer', transition: 'color 0.3s', userSelect: 'none', WebkitTapHighlightColor: 'transparent' }}
              onMouseEnter={e => e.currentTarget.style.color = '#4A6880'}
              onMouseLeave={e => e.currentTarget.style.color = '#0F2033'}
            >Admin</span>
          </div>

          {/* Copyright + version */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexDirection: isTablet ? 'column' : 'row' }}>
            <span style={{ fontSize: '10px', color: '#4A6880', letterSpacing: '0.06em', textAlign: 'center' }}>© 2026 Antigravity Signal Platform. All rights reserved.</span>
            <span style={{ fontSize: '9px', color: '#0F2033', background: '#0D1B2A', border: '1px solid #0F2033', padding: '2px 8px', borderRadius: '3px', letterSpacing: '0.08em' }}>v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
