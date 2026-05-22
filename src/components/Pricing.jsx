import { useBreakpoint } from '../hooks/useBreakpoint.js'

const PLANS = [
  {
    id: 'starter', name: 'Starter', price: '$99', roi: '+15% to +40% projected',
    popular: false, accent: '#4A6880', cta: 'Get Started',
    features: ['20 AI signals/day','Forex & Crypto coverage','Live price charts','Email signal alerts','Basic performance dashboard','Community Discord access'],
  },
  {
    id: 'pro', name: 'Pro', price: '$299', roi: '+80% to +200% projected',
    popular: true, accent: '#00B4D8', cta: 'Start Pro Trial',
    features: ['Unlimited AI signals','All assets: Forex / Crypto / Stocks','Advanced charting','SMS + Telegram alerts','Full analytics dashboard','Risk management tools','Priority support','Weekly strategy calls'],
  },
  {
    id: 'elite', name: 'Elite', price: '$799', roi: '+300% to +800% projected',
    popular: false, accent: '#FFB700', cta: 'Contact Us',
    features: ['Everything in Pro','Dedicated AI account manager','Custom signal parameters','API access & auto-trading','Institutional-grade reports','1-on-1 strategy sessions','White-glove onboarding','Investor portfolio review'],
  },
]

export default function Pricing({ onSelectPackage }) {
  const { isTablet } = useBreakpoint()

  return (
    <section id="packages" style={{ background: '#080C12', padding: isTablet ? '48px 16px' : '80px 32px', borderTop: '1px solid #0F2033' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: isTablet ? '36px' : '52px' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#4A7C9E', marginBottom: '10px' }}>PRICING</div>
          <h2 style={{ fontSize: 'clamp(22px,3vw,34px)', fontWeight: 700, color: '#E2E8F0', letterSpacing: '-0.02em', marginBottom: '12px' }}>CHOOSE YOUR EDGE</h2>
          <p style={{ fontSize: '13px', color: '#A8C4D8', lineHeight: 1.75 }}>Transparent pricing. No hidden fees. Cancel anytime.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: isTablet ? 'column' : 'row', gap: '16px', alignItems: isTablet ? 'stretch' : 'start' }}>
          {PLANS.map(plan => (
            <div key={plan.id}
              style={{ background: '#0D1B2A', border: `1px solid ${plan.accent}`, borderRadius: '12px', padding: '32px 28px', position: 'relative', boxShadow: plan.popular ? `0 0 48px ${plan.accent}18` : `0 0 32px ${plan.accent}0A`, transition: 'transform 0.2s', flex: isTablet ? 'none' : 1, width: '100%' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {plan.popular && (
                <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: '#00B4D8', color: '#000', fontSize: '9px', fontWeight: 700, letterSpacing: '0.14em', padding: '4px 16px', borderRadius: '4px' }}>MOST POPULAR</div>
              )}
              <div style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: plan.accent, marginBottom: '8px' }}>{plan.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
                <span style={{ fontSize: '42px', fontWeight: 700, color: '#E2E8F0', letterSpacing: '-0.03em' }}>{plan.price}</span>
                <span style={{ fontSize: '12px', color: '#4A7C9E' }}>/mo</span>
              </div>
              <div style={{ fontSize: '10px', color: '#00D26A', letterSpacing: '0.06em', marginBottom: '24px' }}>{plan.roi}</div>

              <div style={{ borderTop: '1px solid #0F2033', paddingTop: '20px', marginBottom: '24px' }}>
                {plan.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px', fontSize: '12px', color: '#A8C4D8', wordBreak: 'break-word' }}>
                    <span style={{ color: plan.accent, flexShrink: 0, marginTop: '1px' }}>✓</span>{f}
                  </div>
                ))}
              </div>

              <button
                onClick={() => onSelectPackage({ id: plan.id, name: plan.name, price: plan.price })}
                style={{ width: '100%', background: plan.popular ? '#00B4D8' : 'transparent', color: plan.popular ? '#000' : plan.accent, border: `1px solid ${plan.accent}`, padding: '12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Courier New',monospace", transition: 'all 0.2s', minHeight: '48px', WebkitTapHighlightColor: 'transparent' }}
                onMouseEnter={e => { e.currentTarget.style.background = plan.accent; e.currentTarget.style.color = '#000' }}
                onMouseLeave={e => { e.currentTarget.style.background = plan.popular ? '#00B4D8' : 'transparent'; e.currentTarget.style.color = plan.popular ? '#000' : plan.accent }}
              >{plan.cta}</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
