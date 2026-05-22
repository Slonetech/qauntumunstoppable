import { useState, useEffect } from 'react'
import { api } from '../lib/api.js'

const th = { padding: '9px 14px', textAlign: 'left', fontSize: '9px', fontWeight: 400, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4A7C9E', borderBottom: '1px solid #0F2033', whiteSpace: 'nowrap' }
const td = { padding: '11px 14px', fontSize: '11px', color: '#A8C4D8', borderBottom: '1px solid #0F2033', whiteSpace: 'nowrap' }
const tdBold = { ...td, color: '#E2E8F0', fontWeight: 700 }

const TABS = ['Users', 'Waitlist', 'Payments', 'Revenue']

const tabBtn = (active) => ({
  background: active ? '#0D1B2A' : 'transparent',
  border: `1px solid ${active ? '#00B4D8' : '#0F2033'}`,
  color: active ? '#00B4D8' : '#4A7C9E',
  padding: '8px 20px', borderRadius: '6px',
  fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase',
  cursor: 'pointer', fontFamily: "'Courier New',monospace", transition: 'all 0.2s',
})

function EmptyRow({ cols, msg }) {
  return (
    <tr>
      <td colSpan={cols} style={{ ...td, textAlign: 'center', color: '#4A7C9E', padding: '28px' }}>{msg}</td>
    </tr>
  )
}

function TableWrap({ children }) {
  return (
    <div style={{ background: '#0D1B2A', border: '1px solid #0F2033', borderRadius: '10px', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          {children}
        </table>
      </div>
    </div>
  )
}

function fmt(dateStr) {
  if (!dateStr) return '—'
  try { return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return dateStr }
}

const TIER_COLOR = { Starter: '#4A6880', Pro: '#00B4D8', Elite: '#FFB700' }

export default function AdminPanel({ onClose }) {
  const [authed, setAuthed] = useState(false)
  const [pwd, setPwd] = useState('')
  const [pwdErr, setPwdErr] = useState(false)
  const [tab, setTab] = useState('Users')
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')

  const [users, setUsers] = useState([])
  const [waitlist, setWaitlist] = useState([])
  const [payments, setPayments] = useState([])
  const [revenue, setRevenue] = useState(null)

  const loadStats = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const data = await api.admin.stats()
      setUsers(data.users || [])
      setWaitlist(data.waitlist || [])
      setPayments(data.payments || [])
      setRevenue(data.revenue || null)
    } catch (err) {
      setLoadError(err.message || 'Failed to load admin data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authed) loadStats()
  }, [authed])

  if (!authed) {
    return (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Courier New',monospace" }}>
        <div style={{ background: '#0D1B2A', border: '1px solid #0F2033', borderRadius: '12px', padding: '36px 32px', width: '100%', maxWidth: '380px', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#4A7C9E', fontSize: '18px', cursor: 'pointer' }}>✕</button>
          <div style={{ fontSize: '10px', letterSpacing: '0.14em', color: '#4A7C9E', textTransform: 'uppercase', marginBottom: '8px' }}>RESTRICTED ACCESS</div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#E2E8F0', letterSpacing: '-0.02em', marginBottom: '6px' }}>Admin Panel</h2>
          <p style={{ fontSize: '11px', color: '#4A7C9E', marginBottom: '24px' }}>Password verified server-side (set ADMIN_PASSWORD in server/.env).</p>

          {pwdErr && (
            <div style={{ background: '#FF4D4D0F', border: '1px solid #FF4D4D33', borderRadius: '6px', padding: '9px 14px', fontSize: '11px', color: '#FF4D4D', marginBottom: '14px' }}>
              Incorrect password. Access denied.
            </div>
          )}

          <form onSubmit={async (e) => {
            e.preventDefault()
            setPwdErr(false)
            try {
              await api.admin.login(pwd)
              setAuthed(true)
            } catch {
              setPwdErr(true)
            }
          }}>
            <label style={{ fontSize: '10px', letterSpacing: '0.1em', color: '#4A7C9E', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Password</label>
            <input
              type="password" autoFocus value={pwd}
              onChange={e => { setPwd(e.target.value); setPwdErr(false) }}
              placeholder="••••••••••••••••"
              style={{ width: '100%', background: '#080C12', border: `1px solid ${pwdErr ? '#FF4D4D' : '#0F2033'}`, borderRadius: '6px', padding: '11px 14px', color: '#E2E8F0', fontSize: '12px', fontFamily: "'Courier New',monospace", outline: 'none', boxSizing: 'border-box', marginBottom: '14px' }}
            />
            <button type="submit" style={{ width: '100%', background: '#00B4D8', color: '#000', border: 'none', padding: '12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Courier New',monospace" }}>
              Unlock Admin →
            </button>
          </form>
        </div>
      </div>
    )
  }

  const mrr = revenue?.mrr ?? 0

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#080C12', zIndex: 2000, overflowY: 'auto', fontFamily: "'Courier New',monospace" }}>

      <div style={{ background: '#0D1B2A', borderBottom: '1px solid #0F2033', padding: '0 32px', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '6px', height: '6px', background: '#FF4D4D', borderRadius: '50%' }} />
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.14em', color: '#E2E8F0' }}>ANTIGRAVITY</span>
            <span style={{ fontSize: '9px', color: '#FF4D4D', letterSpacing: '0.1em', background: '#FF4D4D0F', border: '1px solid #FF4D4D33', padding: '2px 8px', borderRadius: '3px' }}>ADMIN</span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid #0F2033', color: '#A8C4D8', padding: '7px 16px', borderRadius: '6px', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'Courier New',monospace" }}>← Exit Panel</button>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 32px' }}>
        {loadError && (
          <div style={{ background: '#FF4D4D0F', border: '1px solid #FF4D4D33', padding: '12px', marginBottom: '20px', fontSize: '11px', color: '#FF4D4D' }}>
            {loadError}
          </div>
        )}
        {loading && <div style={{ fontSize: '11px', color: '#4A7C9E', marginBottom: '20px' }}>Loading…</div>}

        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={tabBtn(tab === t)}>{t}</button>
          ))}
          <button onClick={loadStats} style={{ ...tabBtn(false), marginLeft: 'auto' }}>Refresh</button>
        </div>

        {tab === 'Users' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#E2E8F0' }}>Registered Users</h2>
              <span style={{ fontSize: '11px', color: '#4A7C9E' }}>{users.length} total</span>
            </div>
            <TableWrap>
              <thead>
                <tr>
                  {['Name', 'Email', 'Package', 'Investment Level', 'Country', 'Joined'].map(h => <th key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {users.length === 0
                  ? <EmptyRow cols={6} msg="No registered users yet." />
                  : users.map((u) => (
                    <tr key={u.id || u.email}>
                      <td style={tdBold}>{u.firstName} {u.lastName}</td>
                      <td style={td}>{u.email}</td>
                      <td style={td}>
                        <span style={{ padding: '2px 8px', borderRadius: '3px', fontSize: '9px', fontWeight: 700, color: TIER_COLOR[u.tier] || '#4A6880', background: `${TIER_COLOR[u.tier] || '#4A6880'}15`, border: `1px solid ${TIER_COLOR[u.tier] || '#4A6880'}33` }}>
                          {u.tier || 'Starter'}
                        </span>
                      </td>
                      <td style={td}>{u.investment || '—'}</td>
                      <td style={td}>{u.country || '—'}</td>
                      <td style={td}>{fmt(u.createdAt)}</td>
                    </tr>
                  ))}
              </tbody>
            </TableWrap>
          </>
        )}

        {tab === 'Waitlist' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#E2E8F0' }}>Waitlist Entries</h2>
              <span style={{ fontSize: '11px', color: '#4A7C9E' }}>{waitlist.length} total</span>
            </div>
            <TableWrap>
              <thead>
                <tr>
                  {['Name', 'Email', 'Package Interest', 'Investment Level', 'Country', 'Submitted'].map(h => <th key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {waitlist.length === 0
                  ? <EmptyRow cols={6} msg="No waitlist entries yet." />
                  : waitlist.map((w, i) => (
                    <tr key={w.email + i}>
                      <td style={tdBold}>{w.firstName} {w.lastName}</td>
                      <td style={td}>{w.email}</td>
                      <td style={td}>{w.package || '—'}</td>
                      <td style={td}>{w.investment || '—'}</td>
                      <td style={td}>{w.country || '—'}</td>
                      <td style={td}>{fmt(w.submittedAt)}</td>
                    </tr>
                  ))}
              </tbody>
            </TableWrap>
          </>
        )}

        {tab === 'Payments' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#E2E8F0' }}>Payment Records</h2>
              <span style={{ fontSize: '11px', color: '#4A7C9E' }}>{payments.length} transactions</span>
            </div>
            <TableWrap>
              <thead>
                <tr>
                  {['Email', 'Package', 'Amount', 'Date'].map(h => <th key={h} style={th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {payments.length === 0
                  ? <EmptyRow cols={4} msg="No successful payments yet." />
                  : payments.map((p, i) => (
                    <tr key={i}>
                      <td style={td}>{p.email}</td>
                      <td style={td}>{p.package}</td>
                      <td style={{ ...td, color: '#00D26A', fontWeight: 700 }}>{p.amount}</td>
                      <td style={td}>{fmt(p.date)}</td>
                    </tr>
                  ))}
              </tbody>
            </TableWrap>
          </>
        )}

        {tab === 'Revenue' && revenue && (
          <>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#E2E8F0', marginBottom: '24px' }}>Revenue Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '40px' }}>
              {[
                { label: 'Total Users', val: users.length.toString(), color: '#00B4D8', sub: 'registered accounts' },
                { label: 'Waitlist', val: waitlist.length.toString(), color: '#FFB700', sub: 'pending leads' },
                { label: 'Est. MRR', val: `$${mrr.toLocaleString()}`, color: '#00D26A', sub: 'monthly recurring' },
                { label: 'Countries', val: revenue.countries.toString(), color: '#E2E8F0', sub: 'global reach' },
                { label: 'Starter Users', val: revenue.starter.toString(), color: '#4A7C9E', sub: '× $99/mo' },
                { label: 'Pro Users', val: revenue.pro.toString(), color: '#00B4D8', sub: '× $299/mo' },
                { label: 'Elite Users', val: revenue.elite.toString(), color: '#FFB700', sub: '× $799/mo' },
                { label: 'Est. ARR', val: `$${revenue.arr.toLocaleString()}`, color: '#00D26A', sub: 'annual recurring' },
              ].map(s => (
                <div key={s.label} style={{ background: '#0D1B2A', border: '1px solid #0F2033', borderRadius: '10px', padding: '20px 22px' }}>
                  <div style={{ fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4A7C9E', marginBottom: '8px' }}>{s.label}</div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: '9px', color: '#4A6880', marginTop: '4px' }}>{s.sub}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
