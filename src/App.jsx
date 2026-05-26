import { useState, useEffect, useCallback } from 'react'
import SignalChart from './components/SignalChart.jsx'
import AntigravityHero from './AntigravityHero.jsx'
import PriceGrid from './components/PriceGrid.jsx'
import Leaderboard from './components/Leaderboard.jsx'
import Pricing from './components/Pricing.jsx'
import Waitlist from './components/Waitlist.jsx'
import Footer from './components/Footer.jsx'
import LoginModal from './components/LoginModal.jsx'
import RegisterModal from './components/RegisterModal.jsx'
import Dashboard from './components/Dashboard.jsx'
import PaymentModal from './components/PaymentModal.jsx'
import AdminPanel from './components/AdminPanel.jsx'
import { api, clearLegacyStorage } from './lib/api.js'

export default function App() {
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [showDashboard, setShowDashboard] = useState(false)
  const [showAdmin, setShowAdmin] = useState(false)
  const [selectedSignal, setSelectedSignal] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [apiOnline, setApiOnline] = useState(true)

  const refreshSession = useCallback(async () => {
    try {
      const { user } = await api.auth.me()
      setCurrentUser(user)
      clearLegacyStorage()
      return user
    } catch {
      setCurrentUser(null)
      return null
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        await api.health()
        if (!cancelled) setApiOnline(true)
      } catch {
        if (!cancelled) setApiOnline(false)
      }
      await refreshSession()
      if (!cancelled) setSessionLoading(false)
    })()
    return () => { cancelled = true }
  }, [refreshSession])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('payment') === 'success') {
      alert('Payment successful! Your account has been upgraded.')
      refreshSession().then(() => {
        setShowDashboard(true)
        window.history.replaceState({}, '', window.location.pathname)
      })
    } else if (params.get('payment') === 'cancelled') {
      alert('Payment was cancelled.')
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [refreshSession])

  const handleLogin = (user) => {
    setCurrentUser(user)
    setShowLogin(false)
    clearLegacyStorage()
  }

  const handleRegister = (user) => {
    setCurrentUser(user)
    setShowRegister(false)
    clearLegacyStorage()
  }

  const handleLogout = async () => {
    try {
      await api.auth.logout()
    } catch { /* ignore */ }
    setCurrentUser(null)
    setShowDashboard(false)
    clearLegacyStorage()
  }

  const handleSelectPackage = (pkg) => {
    if (!currentUser) {
      setSelectedPackage(pkg)
      setShowRegister(true)
      return
    }
    setSelectedPackage(pkg)
    setShowPayment(true)
  }

  const handlePaymentSuccess = (updatedUser) => {
    setCurrentUser(updatedUser)
    setShowPayment(false)
  }

  if (sessionLoading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#080C12', color: '#4A7C9E',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Courier New',monospace", fontSize: '11px', letterSpacing: '0.12em',
      }}>
        LOADING SESSION…
      </div>
    )
  }

  return (
    <>
      {!apiOnline && (
        <div style={{
          background: '#FFB70018', borderBottom: '1px solid #FFB70044', color: '#FFB700',
          padding: '8px 16px', textAlign: 'center', fontSize: '10px',
          fontFamily: "'Courier New',monospace", letterSpacing: '0.06em',
        }}>
          API offline — start the server with <code style={{ color: '#E2E8F0' }}>npm run dev:api</code> (or <code style={{ color: '#E2E8F0' }}>npm run dev:all</code>)
        </div>
      )}

      <AntigravityHero
        currentUser={currentUser}
        onLogin={() => setShowLogin(true)}
        onRegister={() => setShowRegister(true)}
        onDashboard={() => setShowDashboard(true)}
        onSignalClick={setSelectedSignal}
      />
      <PriceGrid />
      <Leaderboard />
      <Pricing currentUser={currentUser} onLogin={() => setShowLogin(true)} />
      <Waitlist />
      <Footer onAdminClick={() => setShowAdmin(true)} />

      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLogin={handleLogin}
          onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true) }}
        />
      )}
      {showRegister && (
        <RegisterModal
          onClose={() => { setShowRegister(false); setSelectedPackage(null) }}
          onRegister={handleRegister}
          onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true) }}
          pendingPackage={selectedPackage}
          onRegisteredWithPackage={(pkg) => {
            setShowRegister(false)
            if (pkg) {
              setSelectedPackage(pkg)
              setShowPayment(true)
            }
          }}
        />
      )}
      {/* PaymentModal is bypassed for direct Stripe Checkout redirect */}
      {showDashboard && currentUser && (
        <Dashboard
          currentUser={currentUser}
          onClose={() => setShowDashboard(false)}
          onLogout={handleLogout}
          onUpdateUser={setCurrentUser}
          onSignalClick={setSelectedSignal}
        />
      )}
      {selectedSignal && (
        <SignalChart signal={selectedSignal} onClose={() => setSelectedSignal(null)} />
      )}
      {showAdmin && (
        <AdminPanel onClose={() => setShowAdmin(false)} />
      )}

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/254737873973?text=Hi%2C%20I'm%20interested%20in%20Antigravity%20signals."
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          width: '56px',
          height: '56px',
          backgroundColor: '#25D366',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4), 0 0 10px rgba(37, 211, 102, 0.2)',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          textDecoration: 'none',
          color: '#FFFFFF',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1) translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 211, 102, 0.4), 0 0 15px rgba(37, 211, 102, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1) translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.4), 0 0 10px rgba(37, 211, 102, 0.2)';
        }}
        title="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" style={{ width: '28px', height: '28px', fill: '#FFFFFF' }}>
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.863-9.864.001-2.63-1.023-5.101-2.885-6.968C16.588 1.908 14.12 .884 11.49.882c-5.444 0-9.87 4.421-9.873 9.863 0 2.012.524 3.97 1.52 5.71l-.997 3.637 3.737-.981c1.71 1.027 3.32 1.431 4.77 1.431zM17.47 14.88c-.322-.162-1.905-.94-2.202-1.048-.297-.108-.514-.162-.73.162-.217.324-.838 1.048-1.027 1.265-.19.217-.378.243-.7.08-.322-.162-1.36-.5-2.59-1.597-.957-.852-1.603-1.906-1.79-2.23-.19-.325-.02-.5-.18-.66-.147-.144-.325-.378-.487-.568-.162-.19-.216-.324-.324-.54-.109-.217-.055-.406-.027-.568.028-.162.298-.716.446-1.054.15-.34.3-.568.406-.784.108-.217.054-.405-.028-.567-.08-.162-.73-1.758-.997-2.408-.26-.628-.528-.54-.73-.55-.19-.01-.406-.01-.622-.01-.217 0-.568.08-.866.406-.297.324-1.137 1.11-1.137 2.705 0 1.596 1.164 3.138 1.326 3.355.162.217 2.292 3.5 5.552 4.908.775.335 1.38.535 1.852.686.78.248 1.49.213 2.052.129.626-.094 1.905-.78 2.176-1.537.27-.757.27-1.407.19-1.537-.08-.13-.298-.21-.62-.37z" />
        </svg>
      </a>
    </>
  )
}
