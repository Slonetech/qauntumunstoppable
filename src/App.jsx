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
    if (params.get('checkout') === 'success') {
      refreshSession().then(() => {
        setShowDashboard(true)
        window.history.replaceState({}, '', window.location.pathname)
      })
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
      <Pricing onSelectPackage={handleSelectPackage} />
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
      {showPayment && selectedPackage && currentUser && (
        <PaymentModal
          pkg={selectedPackage}
          currentUser={currentUser}
          onClose={() => setShowPayment(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
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
    </>
  )
}
